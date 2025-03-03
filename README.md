# MGM - Plataforma de Marketing de Afiliados

[![Build Status](https://github.com/[username]/mgm/workflows/CI/badge.svg)](https://github.com/[username]/mgm/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](package.json)

## 🚀 Visão Geral
Uma plataforma robusta e escalável de marketing de afiliados que permite gerenciar campanhas, afiliados, rastreamento de conversões e pagamentos de forma eficiente e automatizada. Projetada especialmente para PMEs de e-commerce que buscam expandir suas vendas através de parcerias estratégicas.

## ✨ Destaques
- 🎯 Gestão completa de campanhas de afiliados
- 💰 Múltiplos modelos de comissionamento
- 📊 Analytics em tempo real
- 🔒 Sistema antifraude integrado
- 🌐 APIs RESTful documentadas
- ⚡ Alta performance e escalabilidade

## 🛠️ Tecnologias Principais
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco de Dados**: MongoDB
- **Infraestrutura**: Docker + Terraform
- **Event Processing**: Kafka
- **Cache**: Redis

## 📋 Pré-requisitos
- Node.js (>= 16.0.0)
- pnpm (para o frontend)
- Docker
- Terraform (para infraestrutura)
- MongoDB

## 🚀 Quick Start

### 1. Clone e Configure
```bash
# Clone o repositório
git clone https://github.com/eudresfs/mgm-app.git
cd MGM

# Configure o ambiente
cp .env.test .env
# Edite .env com suas configurações
```

### 2. Instalação
```bash
# Instale dependências do backend
npm install

# Instale dependências do frontend
cd frontend-new
pnpm install
```

### 3. Execute o Projeto
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend-new
pnpm dev
```

## 🏗️ Arquitetura

```
├── docs/                  # Documentação do projeto
├── frontend-new/         # Frontend em React + Vite
├── src/                  # Backend em Node.js
│   ├── components/       # Componentes do backend
│   ├── config/          # Configurações
│   ├── middleware/      # Middlewares Express
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócios
│   └── utils/           # Utilitários
└── terraform/           # Configuração de infraestrutura
```

## 🔥 Funcionalidades Principais

### 📊 Gestão de Campanhas
- Criação de campanhas com múltiplos modelos
- Suporte a diversos modelos de comissão (CPA, CPL, CPS, recorrente, multi-nível)
- Biblioteca de materiais promocionais
- Regras de qualificação e validação configuráveis
- Segmentação de afiliados

### 👥 Portal do Afiliado
- Descoberta inteligente de campanhas
- Painel personalizado com métricas em tempo real
- Geração e gerenciamento de links
- Editor de materiais promocionais
- Relatórios de desempenho

### 🔌 Integrações
- APIs RESTful documentadas
- Webhooks para eventos importantes
- Integrações com plataformas de e-commerce
- Conectores para email marketing
- Integração com gateways de pagamento

## 💻 Desenvolvimento

### Padrões de Código
- ESLint e Prettier configurados
- TypeScript para tipagem estática
- Testes com Jest e Vitest

### Fluxo de Trabalho
1. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
2. Desenvolva e teste localmente
3. Execute os testes automatizados
4. Faça commit seguindo [Conventional Commits](https://www.conventionalcommits.org/)
5. Abra um Pull Request

### Testes
```bash
# Backend
npm test

# Frontend
cd frontend-new
pnpm test
```

## 📚 Documentação

- [PRD (Product Requirements Document)](docs/PRD.md)
- [Análise do Frontend](docs/Análise%20do%20Frontend.md)
- [Planos de Teste](docs/TestPlans/)
- [Diagramas e Fluxogramas](docs/Diagramas%20e%20Fluxogramas/)

## 📈 Métricas e KPIs

### Performance
- Processamento de 1000+ eventos/segundo
- Tempo médio de resposta < 150ms
- Uptime > 99.9%

### Escalabilidade
- Arquitetura distribuída
- Recuperação automática de falhas
- Sistema de cache eficiente

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Por favor, leia nosso [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão de Pull Requests.

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Todos os contribuidores que participaram deste projeto
- Comunidade open-source pelas ferramentas incríveis
