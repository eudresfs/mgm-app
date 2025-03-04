# MGM - Plataforma de Marketing de Afiliados

[![Build Status](https://github.com/eudresfs/mgm/workflows/CI/badge.svg)](https://github.com/[username]/mgm/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](package.json)
[![Docker Compose](https://img.shields.io/badge/docker--compose-ready-blue)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🚀 Visão Geral
Uma plataforma robusta e escalável de marketing de afiliados que permite gerenciar campanhas, afiliados, rastreamento de conversões e pagamentos de forma eficiente e automatizada. Projetada especialmente para PMEs de e-commerce que buscam expandir suas vendas através de parcerias estratégicas.

## ✨ Destaques
- 🎯 Gestão completa de campanhas de afiliados com suporte a múltiplos modelos de negócio
- 💰 Sistema flexível de comissionamento (CPA, CPL, CPS, recorrente, multi-nível)
- 📊 Analytics em tempo real com dashboards personalizáveis
- 🔒 Sistema antifraude integrado com machine learning
- 🌐 APIs RESTful documentadas com Swagger/OpenAPI
- ⚡ Alta performance com processamento distribuído via Kafka
- 🔄 Cache inteligente com Redis para otimização de consultas
- 📱 Interface responsiva e moderna com React 18 e Tailwind CSS

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React 18 + Vite
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Radix UI
- **Gerenciamento de Estado**: Redux Toolkit
- **Roteamento**: React Router 6
- **Formulários**: React Hook Form + Zod
- **Testes**: Vitest + Testing Library
- **UI/UX**: Storybook + Radix UI Components

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Banco de Dados**: MongoDB + PostgreSQL
- **Cache**: Redis
- **Message Broker**: Apache Kafka
- **Autenticação**: JWT + Passport.js
- **Validação**: Joi
- **Logs**: Winston + ELK Stack

### DevOps
- **Containerização**: Docker + Docker Compose
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoramento**: Prometheus + Grafana
- **APM**: New Relic

## 📋 Pré-requisitos

### Ambiente Local
- Node.js (>= 16.0.0)
- pnpm (>= 7.0.0)
- Docker + Docker Compose
- MongoDB
- Redis
- Kafka (opcional para desenvolvimento local)

### Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.test` com as seguintes configurações:

```bash
# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/mgm
POSTGRES_URL=postgresql://user:pass@localhost:5432/mgm

# Cache
REDIS_URL=redis://localhost:6379

# Autenticação
JWT_SECRET=seu_jwt_secret
SESSION_SECRET=seu_session_secret

# APIs Externas
STRIPE_KEY=sua_stripe_key
SENDGRID_API_KEY=sua_sendgrid_key
```

## 🚀 Quick Start

### 1. Configuração Inicial
```bash
# Clone o repositório
git clone https://github.com/eudresfs/mgm-app.git
cd MGM

# Configure o ambiente
cp .env.test .env
# Edite .env com suas configurações
```

### 2. Usando Docker (Recomendado)
```bash
# Inicie todos os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f

# Para parar os serviços
docker-compose down
```

### 3. Instalação Manual
```bash
# Backend
npm install

# Frontend
cd frontend
pnpm install
```

### 4. Desenvolvimento
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend
pnpm dev
```

## 🏗️ Arquitetura

### Estrutura de Diretórios
```
├── docs/                  # Documentação
│   ├── api/              # Documentação da API
│   ├── architecture/     # Diagramas e decisões
│   └── guides/          # Guias e tutoriais
├── frontend/            # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Serviços e API
│   │   └── utils/       # Utilitários
├── src/                 # Backend Node.js
│   ├── config/         # Configurações
│   ├── controllers/    # Controladores
│   ├── middleware/     # Middlewares
│   ├── models/         # Modelos
│   ├── routes/         # Rotas
│   ├── services/       # Lógica de negócio
│   └── utils/          # Utilitários
└── terraform/          # Infraestrutura
```

## 🔥 Funcionalidades

### 📊 Gestão de Campanhas
- Múltiplos modelos de campanha (CPA, CPL, CPS)
- Sistema flexível de comissões
- Tracking avançado de conversões
- Relatórios em tempo real
- Integração com plataformas de e-commerce

### 👥 Portal do Afiliado
- Dashboard personalizado
- Geração de links de afiliado
- Relatórios de performance
- Sistema de notificações
- Área de materiais promocionais

### 🔌 Integrações
- APIs RESTful documentadas
- Webhooks configuráveis
- SDKs para principais plataformas
- Integrações com gateways de pagamento

## 💻 Desenvolvimento

### Padrões de Código
- ESLint + Prettier
- Conventional Commits
- TypeScript
- Jest + Testing Library
- Storybook para componentes

### Testes
```bash
# Backend
npm test                 # Roda todos os testes
npm run test:watch       # Modo watch
npm run test:coverage    # Relatório de cobertura

# Frontend
cd frontend
pnpm test
pnpm run test:e2e        # Testes E2E
```

### Performance
- Cache em múltiplas camadas
- Otimização de queries
- Lazy loading de componentes
- CDN para assets estáticos
- Compressão e minificação

### Segurança
- Autenticação JWT
- Rate limiting
- Validação de entrada
- CSRF Protection
- Security Headers

## 📚 Documentação

- [Guia de Início Rápido](docs/guides/quickstart.md)
- [Arquitetura](docs/architecture/overview.md)
- [API Reference](docs/api/reference.md)
- [Guia de Contribuição](CONTRIBUTING.md)

## 📈 Métricas

### Performance
- Tempo de resposta < 150ms (p95)
- Processamento de 1000+ eventos/segundo
- Uptime > 99.9%

### Escalabilidade
- Arquitetura distribuída
- Auto-scaling
- Load balancing
- Recuperação automática

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Todos os contribuidores
- Comunidade open-source
- Frameworks e bibliotecas utilizadas