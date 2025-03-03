# MGM - Plataforma de Marketing de Afiliados

## Visão Geral
Uma plataforma robusta e escalável de marketing de afiliados que permite gerenciar campanhas, afiliados, rastreamento de conversões e pagamentos de forma eficiente e automatizada.

## Tecnologias Principais
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco de Dados**: MongoDB (sugerido pelo contexto da arquitetura)
- **Infraestrutura**: Docker + Terraform

## Funcionalidades Principais

### Gestão de Campanhas
- Criação de campanhas com múltiplos modelos
- Suporte a diversos modelos de comissão (CPA, CPL, CPS, recorrente, multi-nível)
- Biblioteca de materiais promocionais
- Regras de qualificação e validação configuráveis
- Segmentação de afiliados

### Portal do Afiliado
- Descoberta inteligente de campanhas
- Painel personalizado com métricas em tempo real
- Geração e gerenciamento de links
- Editor de materiais promocionais
- Relatórios de desempenho

### Integrações
- APIs RESTful documentadas
- Webhooks para eventos importantes
- Integrações com plataformas de e-commerce
- Conectores para email marketing
- Integração com gateways de pagamento

## Configuração do Ambiente

### Pré-requisitos
- Node.js (versão LTS mais recente)
- pnpm (para o frontend)
- Docker
- Terraform (para infraestrutura)

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd MGM
```

2. Configure as variáveis de ambiente:
```bash
cp .env.test .env
# Edite o arquivo .env com suas configurações
```

3. Instale as dependências do backend:
```bash
npm install
```

4. Instale as dependências do frontend:
```bash
cd frontend-new
pnpm install
```

### Executando o Projeto

1. Backend:
```bash
npm run dev
```

2. Frontend:
```bash
cd frontend-new
pnpm dev
```

## Estrutura do Projeto

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

## Desenvolvimento

### Padrões de Código
- ESLint e Prettier configurados
- TypeScript para tipagem estática
- Testes com Jest e Vitest

### Fluxo de Trabalho
1. Crie uma branch para sua feature
2. Desenvolva e teste localmente
3. Execute os testes automatizados
4. Faça o commit seguindo as convenções
5. Abra um Pull Request

### Testes
```bash
# Backend
npm test

# Frontend
cd frontend-new
pnpm test
```

## Documentação Adicional

- [PRD (Product Requirements Document)](docs/PRD.md)
- [Análise do Frontend](docs/Análise%20do%20Frontend.md)
- [Planos de Teste](docs/TestPlans/)
- [Diagramas e Fluxogramas](docs/Diagramas%20e%20Fluxogramas/)

## Métricas e KPIs

### Performance
- Processamento de 1000+ eventos/segundo
- Tempo médio de resposta < 150ms
- Uptime > 99.9%

### Escalabilidade
- Arquitetura distribuída
- Recuperação automática de falhas
- Sistema de cache eficiente

## Contribuição
Por favor, leia o guia de contribuição antes de submeter alterações ao projeto.

## Licença
[Tipo de Licença] - Veja o arquivo LICENSE para detalhes.
