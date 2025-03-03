# Plano de Testes - Módulo de Cadastro e Autenticação

## 1. Introdução

Este documento descreve a estratégia e os casos de teste para o Módulo de Cadastro e Autenticação da plataforma de Marketing de Afiliados, conforme especificado no PRD.md (linhas 206-213).

## 2. Escopo

O escopo deste plano de testes inclui a validação das seguintes funcionalidades:

- Cadastro com email e login social (Google, Facebook)
- Onboarding personalizado por tipo de usuário
- Verificação de email com link de ativação
- Recuperação de senha segura
- Autenticação de dois fatores (2FA)
- Gerenciamento de perfil e preferências
- Níveis de acesso e permissões customizáveis

## 3. Estratégia de Testes

### 3.1 Abordagem

Utilizaremos uma abordagem de testes em camadas, seguindo a pirâmide de testes:

1. **Testes Unitários**: Para componentes isolados e funções críticas
2. **Testes de API**: Para validar endpoints e fluxos de autenticação
3. **Testes End-to-End**: Para fluxos críticos de usuário

### 3.2 Ferramentas

- **Framework de Testes**: Jest
- **Testes de API**: Supertest
- **Testes de Frontend**: React Testing Library
- **Mocks e Stubs**: Jest mock functions

## 4. Casos de Teste

### 4.1 Cadastro de Usuários

#### 4.1.1 Cadastro com Email

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-001 | Cadastro válido com email | Usuário não cadastrado | 1. Acessar página de cadastro<br>2. Preencher email válido<br>3. Preencher senha válida<br>4. Selecionar tipo de usuário<br>5. Enviar formulário | Cadastro bem-sucedido com status 201 |
| TC-002 | Cadastro com email inválido | N/A | 1. Acessar página de cadastro<br>2. Preencher email inválido<br>3. Preencher senha válida<br>4. Enviar formulário | Erro de validação com mensagem apropriada |
| TC-003 | Cadastro com senha fraca | N/A | 1. Acessar página de cadastro<br>2. Preencher email válido<br>3. Preencher senha fraca<br>4. Enviar formulário | Erro de validação com requisitos de senha |
| TC-004 | Cadastro com email já existente | Email já cadastrado | 1. Acessar página de cadastro<br>2. Preencher email existente<br>3. Preencher senha válida<br>4. Enviar formulário | Erro informando que email já está em uso |

#### 4.1.2 Login Social

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-005 | Login com Google | N/A | 1. Acessar página de login<br>2. Clicar em "Login com Google"<br>3. Autorizar acesso | Login bem-sucedido e redirecionamento |
| TC-006 | Login com Facebook | N/A | 1. Acessar página de login<br>2. Clicar em "Login com Facebook"<br>3. Autorizar acesso | Login bem-sucedido e redirecionamento |

### 4.2 Verificação de Email

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-007 | Verificação com token válido | Usuário cadastrado com token gerado | 1. Acessar link de verificação<br>2. Sistema processa token | Email verificado com sucesso |
| TC-008 | Verificação com token inválido | N/A | 1. Acessar link com token inválido | Mensagem de erro apropriada |
| TC-009 | Verificação com token expirado | Token expirado | 1. Acessar link com token expirado | Opção para reenviar email de verificação |

### 4.3 Recuperação de Senha

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-010 | Solicitação de recuperação | Usuário cadastrado | 1. Acessar "Esqueci minha senha"<br>2. Informar email<br>3. Enviar solicitação | Email com link de recuperação enviado |
| TC-011 | Redefinição com token válido | Token de recuperação válido | 1. Acessar link de recuperação<br>2. Informar nova senha<br>3. Confirmar senha<br>4. Enviar | Senha alterada com sucesso |
| TC-012 | Redefinição com token inválido | N/A | 1. Acessar link com token inválido | Mensagem de erro apropriada |

### 4.4 Autenticação de Dois Fatores

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-013 | Ativação de 2FA | Usuário autenticado | 1. Acessar configurações<br>2. Ativar 2FA<br>3. Escanear QR code<br>4. Confirmar código | 2FA ativado com sucesso |
| TC-014 | Login com 2FA ativo | Usuário com 2FA ativado | 1. Fazer login com credenciais<br>2. Informar código 2FA | Login bem-sucedido |
| TC-015 | Login com código 2FA inválido | Usuário com 2FA ativado | 1. Fazer login com credenciais<br>2. Informar código inválido | Acesso negado |

### 4.5 Gerenciamento de Perfil

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-016 | Atualização de dados pessoais | Usuário autenticado | 1. Acessar perfil<br>2. Editar informações<br>3. Salvar alterações | Perfil atualizado com sucesso |
| TC-017 | Alteração de senha | Usuário autenticado | 1. Acessar perfil<br>2. Selecionar alterar senha<br>3. Informar senha atual<br>4. Informar nova senha<br>5. Confirmar | Senha alterada com sucesso |

### 4.6 Controle de Acesso

| ID | Descrição | Pré-condições | Passos | Resultado Esperado |
|----|-----------|---------------|--------|-------------------|
| TC-018 | Acesso a área restrita (autorizado) | Usuário com permissão adequada | 1. Fazer login<br>2. Acessar área restrita | Acesso permitido |
| TC-019 | Acesso a área restrita (não autorizado) | Usuário sem permissão adequada | 1. Fazer login<br>2. Tentar acessar área restrita | Acesso negado (403) |
| TC-020 | Configuração de permissões | Usuário administrador | 1. Acessar gerenciamento de usuários<br>2. Selecionar usuário<br>3. Modificar permissões<br>4. Salvar | Permissões atualizadas com sucesso |

## 5. Execução de Testes

### 5.1 Testes Automatizados

Os testes automatizados estão implementados no arquivo `src/__tests__/auth.test.js` e cobrem os principais fluxos de autenticação:

- Cadastro de usuários
- Verificação de email
- Recuperação de senha
- Autenticação de dois fatores
- Gerenciamento de perfil
- Controle de acesso

### 5.2 Execução

Para executar os testes automatizados:

```bash
npm test -- auth.test.js
```

### 5.3 Relatório de Testes

Após a execução, será gerado um relatório com os resultados dos testes, incluindo:

- Total de testes executados
- Testes bem-sucedidos
- Testes falhos
- Cobertura de código

## 6. Critérios de Aceitação

- 100% dos testes críticos (TC-001, TC-005, TC-007, TC-010, TC-014, TC-018) devem passar
- Cobertura de código mínima de 80% para o módulo de autenticação
- Zero bugs críticos ou de segurança
- Tempo de resposta para operações de autenticação < 200ms

## 7. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|--------------|------------|
| Falhas de segurança em autenticação | Alto | Média | Implementar testes de segurança específicos, seguir OWASP |
| Problemas de integração com provedores sociais | Médio | Alta | Implementar mocks para testes e monitorar integrações |
| Desempenho degradado em picos de cadastro | Médio | Baixa | Testes de carga para simular picos de usuários |

## 8. Anexos

- Diagrama de fluxo de autenticação
- Matriz de rastreabilidade de requisitos
- Checklist de segurança OWASP para autenticação