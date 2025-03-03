# **Processo de Debug e Troubleshooting para JavaScript**

### **1. Entenda o Problema**
- **Reproduza o Erro**:
  - No navegador: Use o console do navegador (Chrome DevTools, Firefox Developer Tools) para ver erros e avisos.
  - Em Node.js: Execute o script com `node --inspect` ou use logs para identificar falhas.
  - Verifique se o erro ocorre em todos os ambientes (ex: navegadores diferentes, versões do Node.js).

- **Analise Mensagens de Erro**:
  - Erros comuns em JavaScript:
    - `ReferenceError` (variável não definida).
    - `TypeError` (operações inválidas, como `undefined is not a function`).
    - `SyntaxError` (erro de sintaxe, como falta de vírgula ou chave).
  - Use `try/catch` para capturar e inspecionar erros em operações críticas.

---

### **2. Isolar o Problema**
- **Divida o Código**:
  - Teste funções ou módulos individualmente (ex: use ferramentas como **ES Modules** ou **Webpack** para isolar componentes).
  - Comente trechos do código para identificar onde o erro começa.

- **Use `console.log` Estratégico**:
  - Insira `console.log` em pontos-chave para verificar valores de variáveis, fluxo de execução ou resultados de funções.
  - Exemplo:
    ```javascript
    function calcularTotal(preco, quantidade) {
      console.log('Preço:', preco, 'Quantidade:', quantidade); // Debug
      return preco * quantidade;
    }
    ```

---

### **3. Utilize Ferramentas de Debug Específicas para JavaScript**
- **Depuradores Integrados**:
  - **Navegador**: Use o **Chrome DevTools** (F12) para:
    - Executar código passo a passo (breakpoints).
    - Inspecionar variáveis no **Scope Panel**.
    - Analisar a call stack em erros assíncronos.
  - **Node.js**: Use o debugger integrado com `node inspect script.js` ou o debugger do VS Code.

- **Ferramentas de Log Avançadas**:
  - `console.table()`: Para visualizar arrays ou objetos de forma organizada.
  - `console.trace()`: Mostra a stack trace de onde a função foi chamada.
  - Bibliotecas como **Winston** (Node.js) ou **loglevel** (navegador) para logs estruturados.

- **Linters e Validadores**:
  - Use **ESLint** para identificar erros de sintaxe, variáveis não declaradas ou más práticas.

---

### **4. Analise Código Assíncrono e Promises**
- **Problemas Comuns**:
  - **Callbacks não executados**: Verifique se há `return` faltando em funções assíncronas.
  - **Promises não tratadas**: Certifique-se de usar `.catch()` ou `try/catch` com `async/await`.
  - **Race conditions**: Use `Promise.all` ou controle de fluxo com bibliotecas como **async.js**.

- **Exemplo de Debug**:
  ```javascript
  async function buscarDados() {
    try {
      const resposta = await fetch('https://api.example.com/data');
      const dados = await resposta.json();
      console.log('Dados recebidos:', dados); // Verifique aqui
      return dados;
    } catch (erro) {
      console.error('Falha na requisição:', erro); // Erro detalhado
    }
  }
  ```

---

### **5. Revise o Código e Testes**
- **Testes Unitários**:
  - Use frameworks como **Jest**, **Mocha** ou **Jasmine** para testar funções isoladamente.
  - Exemplo com Jest:
    ```javascript
    test('calculaTotal retorna o valor correto', () => {
      expect(calcularTotal(10, 2)).toBe(20);
    });
    ```

- **Verifique o Escopo e o `this`**:
  - Em JavaScript, o contexto (`this`) pode causar erros inesperados. Use `bind`, arrow functions ou verifique o escopo de variáveis com `var`, `let` e `const`.

---

### **6. Consulte Documentação e Comunidades**
- **Recursos Específicos**:
  - **MDN Web Docs**: Referência completa para JavaScript e APIs do navegador.
  - **Node.js Documentation**: Para módulos como `fs`, `http` ou `events`.
  - **Stack Overflow**: Pesquise por erros específicos (ex: "JavaScript Uncaught TypeError").

---

### **7. Valide a Solução**
- **Teste Cross-Browser**:
  - Use ferramentas como **BrowserStack** para testar em diferentes navegadores.
  - Verifique suporte a APIs com **Can I Use**.

- **Teste de Regressão**:
  - Atualize testes automatizados para cobrir o cenário corrigido.

---

### **8. Documente e Previna Problemas Futuros**
- **Boas Práticas**:
  - Use **TypeScript** para tipagem estática e detecção precoce de erros.
  - Adote **ESLint** e **Prettier** para padronização de código.
  - Configure **Git Hooks** com ferramentas como **Husky** para validar código antes do commit.

---

## **Ferramentas Recomendadas para JavaScript**
| Categoria           | Ferramentas                                                                 |
|----------------------|----------------------------------------------------------------------------|
| **Depuradores**      | Chrome DevTools, VS Code Debugger, Node.js Inspector                       |
| **Testes**           | Jest, Mocha, Cypress (E2E), React Testing Library                          |
| **Logs**             | Winston (Node.js), console.log, Sentry (monitoramento de erros)            |
| **Performance**      | Lighthouse, Chrome Performance Tab, Clinic.js (Node.js)                    |
| **Linting/Formatação** | ESLint, Prettier, TypeScript                                               |

---

## **Exemplo Prático: Debugando um Erro Assíncrono**
**Problema**: Uma função não retorna dados após uma requisição HTTP.  
**Passos**:
1. Use `console.log` para verificar se a requisição foi concluída.
2. Insira um `try/catch` em torno do `await fetch`.
3. Use o **Network Tab** do Chrome DevTools para verificar se a requisição teve status 200.
4. Verifique se o `.json()` está sendo aplicado corretamente à resposta.

---
