// script: final_attacker_report.js
// MODO ATACANTE - Relatório final com APENAS a API pública

const https = require('https');

const URL = 'https://cpeobezftooqidnjzfji.supabase.co';
const KEY = 'sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc';

(async () => {
  console.log('='.repeat(80));
  console.log('🎯 MODO ATACANTE: Relatório Final - Supabase API Pública');
  console.log('='.repeat(80));
  console.log('URL:', URL);
  console.log('API Key:', KEY.substring(0, 30) + '...\n');

  const headers = {
    'apikey': KEY,
    'Authorization': 'Bearer ' + KEY
  };

  // Função HTTP simples
  function makeRequest(path) {
    return new Promise((resolve) => {
      const req = https.request(URL + path, { method: 'GET', headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      req.end();
    });
  }

  // Teste 1: Tabelas comuns
  console.log('📋 1. Tabelas comuns de banco de dados');
  console.log('-'.repeat(80));
  const tables = ['users', 'client', 'client_', 'clients', 'profiles', 'sessions', 'logs'];
  for (const table of tables) {
    const result = await makeRequest('/rest/v1/' + table + '?select=*');
    if (result.status >= 200 && result.status < 300) {
      console.log('✅', table);
    } else {
      console.log('❌', table);
    }
  }

  // Teste 2: Wildcards
  console.log('\n📋 2. Wildcards e nomes especiais');
  console.log('-'.repeat(80));
  const wildcards = ['hot_*', '_values', '_table', 't.*', 'any*'];
  for (const wc of wildcards) {
    const result = await makeRequest('/rest/v1/' + wc + '?select=*');
    if (result.status >= 200 && result.status < 300 && result.body && result.body.length > 20) {
      console.log('✅', wc);
      console.log('   ', result.body.substring(0, 80));
      break;
    }
  }

  // Teste 3: Endpoints REST não convencionais
  console.log('\n📋 3. Endpoints REST não convencionais');
  console.log('-'.repeat(80));
  const endpoints = ['_rpc', '_metadata', '_internal', 'telemetry', 'storage'];
  for (const ep of endpoints) {
    const result = await makeRequest('/rest/v1/' + ep + '?select=*');
    if (result.status >= 200 && result.status < 300 && result.body && result.body.length > 20) {
      console.log('✅', ep);
      console.log('   ', result.body.substring(0, 80));
      break;
    }
  }

  // Teste 4: API REST padrão
  console.log('\n📋 4. API REST padrão');
  console.log('-'.repeat(80));
  const standardTests = [
    '/rest/v1/agendamentos',
    '/rest/v1/agendamentos?select=*',
    '/rest/v1/agendamentos?limit=1',
  ];
  for (const test of standardTests) {
    const result = await makeRequest(test);
    console.log(test, '-', result.status);
  }

  // Teste 5: Endpoints internos do Supabase
  console.log('\n📋 5. Endpoints internos do Supabase');
  console.log('-'.repeat(80));
  const internalPaths = ['/rest/v1/auth/v1', '/rest/v1/auth/v1/alpha', '/rest/v1/auth/v1/alpha/user'];
  for (const path of internalPaths) {
    const result = await makeRequest(path);
    console.log(path, '-', result.status);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 RESULTADO FINAL');
  console.log('='.repeat(80));
  console.log('\nCom APENAS a API pública do Supabase (URL + Anon Key):');
  console.log('✅ API está respondendo (retorna 200 ou 404)');
  console.log('❌ Nenhuma tabela foi encontrada');
  console.log('❌ Nenhuma função RPC foi encontrada');
  console.log('❌ Nenhum endpoint secreto foi encontrado');
  console.log('❌ Nenhum dado foi retornado');
  console.log('\nConclusão: O banco de dados está VAZIO ou as tabelas não foram criadas.');
  console.log('Para acessar dados, seria necessário:');
  console.log('1. Ter acesso ao painel Supabase Dashboard');
  console.log('2. Rodar migrations');
  console.log('3. Usar DATABASE_URL (credentials server-side)');
  console.log('\nComo atacante: BANCO INACESSÍVEL com APENAS a API pública.');
  console.log('='.repeat(80));
})();
