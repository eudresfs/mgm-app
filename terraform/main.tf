# AWS Provider configuration
provider "aws" {
  region = var.aws_region
}

# Terraform backend configuration for state management
terraform {
  backend "s3" {
    bucket         = "mgm-terraform-state"
    key            = "mgm/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "mgm-terraform-locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# VPC for EKS cluster
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"

  name = "mgm-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true

  # Tags required for EKS
  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = 1
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = 1
  }

  tags = var.tags
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "18.20.0"

  cluster_name    = var.cluster_name
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Managed node groups
  eks_managed_node_groups = {
    main = {
      desired_size = var.node_group_desired_size
      min_size     = var.node_group_min_size
      max_size     = var.node_group_max_size

      instance_types = var.node_group_instance_types
      capacity_type  = "ON_DEMAND"

      update_config = {
        max_unavailable_percentage = 25
      }
    }
  }

  # Enable OIDC provider for service accounts
  enable_irsa = true

  # Cluster security group rules
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  tags = var.tags
}

# RDS PostgreSQL Database
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "4.4.0"

  identifier = "mgm-postgres"

  engine               = "postgres"
  engine_version       = "13.4"
  family               = "postgres13"
  major_engine_version = "13"
  instance_class       = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage

  db_name  = "mgm"
  username = "mgm_admin"
  port     = 5432

  multi_az               = true
  subnet_ids             = module.vpc.private_subnets
  vpc_security_group_ids = [module.security_group_db.security_group_id]

  maintenance_window              = "Mon:00:00-Mon:03:00"
  backup_window                   = "03:00-06:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  backup_retention_period = 7
  skip_final_snapshot     = false
  deletion_protection     = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  create_monitoring_role                = true
  monitoring_interval                   = 60

  parameters = [
    {
      name  = "autovacuum"
      value = 1
    },
    {
      name  = "client_encoding"
      value = "utf8"
    }
  ]

  tags = var.tags
}

# ElastiCache Redis Cluster
module "redis" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "1.0.0"

  name                = "mgm-redis"
  engine              = "redis"
  engine_version      = "6.x"
  node_type           = var.redis_node_type
  num_cache_nodes     = 1
  port                = 6379
  subnet_group_name   = aws_elasticache_subnet_group.redis.name
  security_group_ids  = [module.security_group_redis.security_group_id]
  maintenance_window  = "tue:03:00-tue:04:00"
  apply_immediately   = true
  auto_minor_version_upgrade = true

  tags = var.tags
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "mgm-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

# Security group for Redis
module "security_group_redis" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name        = "mgm-redis-sg"
  description = "Security group for Redis"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 6379
      to_port     = 6379
      protocol    = "tcp"
      description = "Redis access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
  ]

  tags = var.tags
}

# Security group for RDS
module "security_group_db" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name        = "mgm-db-sg"
  description = "Security group for database"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      description = "PostgreSQL access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
  ]

  tags = var.tags
}

# MSK Kafka Cluster
resource "aws_msk_cluster" "mgm_kafka" {
  cluster_name           = "mgm-kafka"
  kafka_version          = "2.8.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = var.kafka_instance_type
    client_subnets  = module.vpc.private_subnets
    security_groups = [module.security_group_kafka.security_group_id]
    storage_info {
      ebs_storage_info {
        volume_size = var.kafka_volume_size
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.kafka_broker_logs.name
      }
    }
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "kafka_broker_logs" {
  name              = "/msk/mgm-kafka/broker-logs"
  retention_in_days = 7
  tags              = var.tags
}

# Security group for Kafka
module "security_group_kafka" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name        = "mgm-kafka-sg"
  description = "Security group for Kafka"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 9092
      to_port     = 9092
      protocol    = "tcp"
      description = "Kafka plaintext access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
    {
      from_port   = 9094
      to_port     = 9094
      protocol    = "tcp"
      description = "Kafka TLS access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
  ]

  tags = var.tags
}