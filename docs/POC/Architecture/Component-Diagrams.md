# Component Diagrams

## 1. Tracking System Components

```mermaid
C4Component
    title Tracking System Components

    Container(web, "Web Application", "React", "Frontend interface")
    Container(tracking, "Tracking Service", "NestJS", "Handles event capture and processing")
    Container(kafka, "Event Queue", "Kafka", "Message broker for events")
    Container(attribution, "Attribution Engine", "NestJS", "Processes and attributes conversions")
    Container(redis, "Cache", "Redis", "Stores session and tracking data")
    Container(db, "Database", "PostgreSQL", "Persistent storage")

    Rel(web, tracking, "Sends tracking events", "HTTP/REST")
    Rel(tracking, kafka, "Publishes events", "Kafka Protocol")
    Rel(tracking, redis, "Stores session data", "Redis Protocol")
    Rel(kafka, attribution, "Consumes events", "Kafka Protocol")
    Rel(attribution, db, "Stores attribution data", "SQL")
```

### Key Components

1. **Tracking Service**
   - Cookie Management
   - Fingerprint Generation
   - Click Fraud Detection
   - Event Validation

2. **Attribution Engine**
   - Multi-touch Attribution Logic
   - Conversion Window Management
   - Duplicate Detection
   - Attribution Rules Processing

## 2. Campaign Management Components

```mermaid
C4Component
    title Campaign Management Components

    Container(web, "Web Application", "React", "Frontend interface")
    Container(campaign, "Campaign Service", "NestJS", "Manages campaign operations")
    Container(rule, "Rule Engine", "NestJS", "Processes campaign rules")
    Container(affiliate, "Affiliate Service", "NestJS", "Manages affiliate relationships")
    Container(db, "Database", "PostgreSQL", "Persistent storage")

    Rel(web, campaign, "Manages campaigns", "HTTP/REST")
    Rel(campaign, rule, "Validates rules", "Internal")
    Rel(campaign, affiliate, "Assigns campaigns", "HTTP/REST")
    Rel(campaign, db, "Stores campaign data", "SQL")
    Rel(affiliate, db, "Stores affiliate data", "SQL")
```

### Key Components

1. **Campaign Service**
   - Campaign CRUD Operations
   - Campaign Validation
   - Campaign Status Management
   - Performance Tracking

2. **Rule Engine**
   - Commission Rules Processing
   - Eligibility Validation
   - Constraint Checking
   - Dynamic Rule Evaluation

## 3. Reward System Components

```mermaid
C4Component
    title Reward System Components

    Container(web, "Web Application", "React", "Frontend interface")
    Container(reward, "Reward Service", "NestJS", "Manages reward calculations")
    Container(payment, "Payment Service", "NestJS", "Handles payment processing")
    Container(notification, "Notification Service", "NestJS", "Sends notifications")
    Container(db, "Database", "PostgreSQL", "Persistent storage")

    Rel(web, reward, "Views rewards", "HTTP/REST")
    Rel(reward, payment, "Initiates payments", "Internal")
    Rel(reward, notification, "Triggers notifications", "Internal")
    Rel(reward, db, "Stores reward data", "SQL")
    Rel(payment, db, "Stores payment data", "SQL")
```

### Key Components

1. **Reward Service**
   - Commission Calculation
   - Reward Rules Processing
   - Performance Bonuses
   - Reward Status Management

2. **Payment Service**
   - Payment Processing
   - Payment Gateway Integration
   - Transaction Management
   - Payment Status Tracking

## Integration Points

1. **Cross-Component Communication**
   - Event-driven architecture using Kafka
   - RESTful APIs for synchronous operations
   - Redis for caching and real-time data

2. **Data Flow**
   - Tracking events flow through Kafka
   - Campaign data accessed via REST APIs
   - Reward calculations triggered by conversions

3. **Security Integration**
   - JWT authentication across services
   - Role-based access control
   - API key management for external integrations

## Scalability Considerations

1. **Component Scaling**
   - Each service independently scalable
   - Stateless design for horizontal scaling
   - Cache layer for performance optimization

2. **Data Management**
   - Database sharding strategy
   - Read replicas for high-traffic components
   - Event sourcing for tracking data

## Monitoring Integration

1. **Service Health**
   - Component-level health checks
   - Performance metrics collection
   - Error rate monitoring

2. **Business Metrics**
   - Conversion tracking accuracy
   - Campaign performance metrics
   - Payment processing success rates