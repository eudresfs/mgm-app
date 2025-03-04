/**
 * jest.setup.js - Configuração do Jest com o sistema de logs avançado
 * 
 * Este arquivo deve ser referenciado na configuração do Jest para adicionar
 * logs avançados e relatórios detalhados aos testes.
 */

const testLogger = require('./test-logger');
const chalk = require('chalk');
const { format } = require('date-fns');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Armazenar tempo de início de cada teste
const testTimers = new Map();
// Armazenar resultados dos testes
const testResults = [];
// Tempo de início da suite de testes
const suiteStartTime = Date.now();

// Mock environment variables for testing
process.env.GOOGLE_CLIENT_ID = 'test_client_id';
process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
process.env.FACEBOOK_APP_ID = 'test_app_id';
process.env.FACEBOOK_APP_SECRET = 'test_app_secret';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

// Criar hash para objetos (útil para comparações)
const objectHash = (obj) => {
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
};

// Gerar snapshot do estado do banco de dados
const captureDbSnapshot = async (testName) => {
  const mongoose = require('mongoose');
  const snapshot = {};
  
  // Capturar apenas se conectado ao mongoose
  if (mongoose.connection.readyState !== 1) {
    return null;
  }
  
  // Obter todas as coleções disponíveis
  const collections = await mongoose.connection.db.collections();
  
  for (const collection of collections) {
    const collectionName = collection.collectionName;
    if (collectionName.startsWith('system.')) continue;
    
    const documents = await collection.find({}).toArray();
    snapshot[collectionName] = documents.map(doc => {
      const plainDoc = { ...doc };
      // Converter ObjectId para string para comparação mais fácil
      if (plainDoc._id) {
        plainDoc._id = plainDoc._id.toString();
      }
      return plainDoc;
    });
  }
  
  // Salvar snapshot em arquivo para referência
  try {
    const snapshotDir = path.join(testLogger.config.logDir, 'db-snapshots');
    await fs.mkdir(snapshotDir, { recursive: true });
    
    const sanitizedTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = path.join(snapshotDir, `${sanitizedTestName}-${timestamp}.json`);
    
    await fs.writeFile(filename, JSON.stringify(snapshot, null, 2));
    testLogger.debug(`Snapshot do banco de dados salvo em ${filename}`, { context: 'DB' });
  } catch (error) {
    testLogger.error(`Erro ao salvar snapshot do banco: ${error.message}`, { context: 'DB' });
  }
  
  return {
    hash: objectHash(snapshot),
    snapshot
  };
};

// Comparar estados do banco de dados
const compareDbSnapshots = (before, after) => {
  if (!before || !after) return null;
  
  const changes = {};
  let changesDetected = false;
  
  // Se os hashes são iguais, não há mudanças
  if (before.hash === after.hash) {
    return { changesDetected: false };
  }
  
  // Comparar coleções
  const allCollections = new Set([
    ...Object.keys(before.snapshot),
    ...Object.keys(after.snapshot)
  ]);
  
  for (const collection of allCollections) {
    const beforeDocs = before.snapshot[collection] || [];
    const afterDocs = after.snapshot[collection] || [];
    
    // Documentos adicionados
    const added = afterDocs.filter(afterDoc => 
      !beforeDocs.some(beforeDoc => beforeDoc._id === afterDoc._id)
    );
    
    // Documentos removidos
    const removed = beforeDocs.filter(beforeDoc => 
      !afterDocs.some(afterDoc => afterDoc._id === beforeDoc._id)
    );
    
    // Documentos modificados
    const modified = afterDocs.filter(afterDoc => {
      const beforeDoc = beforeDocs.find(b => b._id === afterDoc._id);
      return beforeDoc && objectHash(beforeDoc) !== objectHash(afterDoc);
    });
    
    if (added.length || removed.length || modified.length) {
      changesDetected = true;
      changes[collection] = {
        added: added.length,
        removed: removed.length,
        modified: modified.length,
        addedDocs: added,
        removedDocs: removed,
        modifiedDocs: modified.map(doc => {
          const beforeDoc = beforeDocs.find(b => b._id === doc._id);
          return {
            _id: doc._id,
            before: beforeDoc,
            after: doc
          };
        })
      };
    }
  }
  
  return {
    changesDetected,
    changes
  };
};

// Configurar hooks globais do Jest
beforeAll(async () => {
  testLogger.info('Iniciando suite de testes', {
    context: 'SUITE',
    timestamp: new Date().toISOString()
  });
  
  // Melhorar relatórios de erro padrão do Jest
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Error:')) {
      testLogger.error('Jest encountered an error', { details: args.join(' ') });
    }
    originalError.apply(console, args);
  };
});

afterAll(async () => {
  const duration = Date.now() - suiteStartTime;
  const durationFormatted = `${(duration / 1000).toFixed(2)}s`;
  
  // Agrupar resultados por status
  const passed = testResults.filter(r => r.status === 'passed');
  const failed = testResults.filter(r => r.status === 'failed');
  const skipped = testResults.filter(r => r.status === 'skipped');
  
  // Calcular estatísticas
  const stats = {
    total: testResults.length,
    passed: passed.length,
    failed: failed.length,
    skipped: skipped.length,
    passRate: testResults.length ? (passed.length / testResults.length * 100).toFixed(2) : 0,
    duration: durationFormatted,
    slowestTests: [...testResults]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(t => ({ name: t.name, duration: `${t.duration}ms` }))
  };
  
  testLogger.info('Suite de testes concluída', {
    context: 'SUITE',
    details: stats
  });
  
  // Registrar detalhes de testes falhos
  if (failed.length > 0) {
    testLogger.error(`${failed.length} teste(s) falharam`, {
      context: 'SUMMARY',
      details: failed.map(f => ({
        name: f.name,
        error: f.error,
        fileName: f.fileName
      }))
    });
  }
  
  // Salvar relatório em JSON
  try {
    const reportDir = path.join(testLogger.config.logDir, 'reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const filename = path.join(reportDir, `test-report-${timestamp}.json`);
    
    await fs.writeFile(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      results: testResults
    }, null, 2));
    
    testLogger.info(`Relatório de testes salvo em ${filename}`, { context: 'REPORT' });
  } catch (error) {
    testLogger.error(`Erro ao salvar relatório: ${error.message}`, { context: 'REPORT' });
  }
});

// Antes de cada teste
beforeEach(async () => {
  const testInfo = expect.getState ? expect.getState() : { currentTestName: 'unknown', testPath: 'unknown' };
  const testName = testInfo.currentTestName;
  const testFile = testInfo.testPath ? path.basename(testInfo.testPath) : 'unknown';
  
  // Registrar início do teste
  testLogger.testStarted(testName, testFile);
  
  // Iniciar timer
  testTimers.set(testName, {
    startTime: Date.now(),
    dbSnapshot: await captureDbSnapshot(testName)
  });
  
  // Limpar linhas de console para o teste atual
  console.log = (...args) => {
    testLogger.debug(args.join(' '), { context: testName, source: 'console.log' });
  };
});

// Depois de cada teste
afterEach(async () => {
  const testInfo = expect.getState ? expect.getState() : { currentTestName: 'unknown', testPath: 'unknown' };
  const testName = testInfo.currentTestName;
  const testFile = testInfo.testPath ? path.basename(testInfo.testPath) : 'unknown';
  
  // Obter timer e calcular duração
  const testData = testTimers.get(testName);
  if (!testData) return;
  
  const duration = Date.now() - testData.startTime;
  
  // Capturar snapshot do banco de dados após o teste
  const afterSnapshot = await captureDbSnapshot(`${testName}-after`);
  
  // Comparar snapshots do banco
  const dbChanges = compareDbSnapshots(testData.dbSnapshot, afterSnapshot);
  
  // Verificar resultado do teste
  if (testInfo.currentTestName === testName && !testInfo.testExecError) {
    // Teste passou
    testLogger.testPassed(testName, duration);
    
    testResults.push({
      name: testName,
      fileName: testFile,
      status: 'passed',
      duration,
      dbChanges: dbChanges?.changesDetected ? dbChanges.changes : null
    });
    
    // Registrar mudanças no banco de dados se houver
    if (dbChanges?.changesDetected) {
      testLogger.debug('Mudanças no banco de dados', {
        context: testName,
        details: dbChanges.changes
      });
    }
  } else {
    // Teste falhou
    const error = testInfo.testExecError || new Error('Unknown test failure');
    testLogger.testFailed(testName, error, duration);
    
    testResults.push({
      name: testName,
      fileName: testFile,
      status: 'failed',
      error: {
        message: error.message,
        stack: error.stack
      },
      duration,
      dbChanges: dbChanges?.changesDetected ? dbChanges.changes : null
    });
  }
  
  // Limpar timer
  testTimers.delete(testName);
});

// Estender o expect para registrar asserções
const originalExpect = global.expect;
global.expect = (...args) => {
  const expectation = originalExpect(...args);
  
  // Melhorar mensagens para asserções comuns
  const enhanceWithLogging = (fnName, originalFn) => {
    return function(...assertArgs) {
      try {
        const result = originalFn.apply(this, assertArgs);
        
        // Registrar asserção bem-sucedida apenas para debug
        if (testLogger.config.level === 'debug' || testLogger.config.level === 'trace') {
          testLogger.debug(`Asserção passou: ${fnName}`, {
            context: 'ASSERT',
            expected: assertArgs[0],
            received: this.actual
          });
        }
        
        return result;
      } catch (error) {
        // Registrar falha na asserção
        testLogger.fail(`Asserção falhou: ${fnName}`, {
          context: 'ASSERT',
          expected: assertArgs[0],
          received: this.actual,
          error: {
            message: error.message,
            stack: error.stack
          }
        });
        
        throw error;
      }
    };
  };
  
  // Melhorar asserções comuns
  const methodsToEnhance = ['toBe', 'toEqual', 'toContain', 'toHaveProperty', 'toBeGreaterThan', 'toBeLessThan'];
  
  methodsToEnhance.forEach(method => {
    if (expectation[method]) {
      const originalMethod = expectation[method];
      expectation[method] = enhanceWithLogging(method, originalMethod);
    }
  });
  
  return expectation;
};

// Adicionar utilitários ao ambiente global para uso nos testes
global.testLogger = testLogger;

// Adicionar métodos personalizados para asserções específicas do domínio
global.expect.toMatchSchema = function(received, schema) {
  const Joi = require('joi');
  const result = schema.validate(received);
  
  if (result.error) {
    testLogger.fail('Schema validation failed', {
      context: 'SCHEMA',
      details: result.error.details,
      received
    });
    
    return {
      pass: false,
      message: () => `Expected object to match schema: ${result.error.message}`
    };
  }
  
  return {
    pass: true,
    message: () => 'Object matches schema'
  };
};

// Middleware para testar HTTP requests integrado com Supertest
const supertest = require('supertest');
const originalSupertest = supertest;

// Sobreescrever supertest para adicionar logs
global.supertest = (app) => {
  const request = originalSupertest(app);
  
  // Melhorar métodos HTTP para adicionar logs
  ['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
    const originalMethod = request[method];
    request[method] = function(url) {
      const startTime = Date.now();
      testLogger.debug(`Supertest ${method.toUpperCase()} ${url}`, { context: 'HTTP' });
      
      const req = originalMethod.apply(this, arguments);
      
      // Adicionar hook para registrar resposta
      const originalEnd = req.end;
      req.end = function(callback) {
        return originalEnd.call(this, (err, res) => {
          const duration = Date.now() - startTime;
          
          if (err) {
            testLogger.error(`Supertest ${method.toUpperCase()} ${url} falhou`, {
              context: 'HTTP',
              details: {
                error: err.message,
                response: res ? {
                  status: res.status,
                  body: res.body
                } : null,
                duration: `${duration}ms`
              }
            });
          } else {
            const logLevel = res.status >= 400 ? 'warn' : 'debug';
            testLogger[logLevel](`Supertest ${method.toUpperCase()} ${url} ${res.status}`, {
              context: 'HTTP',
              details: {
                request: {
                  method: method.toUpperCase(),
                  url,
                  headers: req.header
                },
                response: {
                  status: res.status,
                  headers: res.headers,
                  body: res.body
                },
                duration: `${duration}ms`
              }
            });
          }
          
          if (callback) {
            callback(err, res);
          }
        });
      };
      
      return req;
    };
  });
  
  return request;
};

module.exports = testLogger;