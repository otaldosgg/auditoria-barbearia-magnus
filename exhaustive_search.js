// script: exhaustive_search.js
// Objetivo: Testar TUDO possível para descobrir se há algo no Supabase

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const URL = 'https://cpeobezftooqidnjzfji.supabase.co';
const KEY = 'sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc';

const supabase = createClient(URL, KEY);

(async () => {
  console.log('='.repeat(80));
  console.log('🎯 BUSCA EXHAUSTIVA POR QUALQUER COISA NO SUPABASE');
  console.log('='.repeat(80));
  console.log();

  // Função HTTP simples
  function makeRequest(path, headers = {}) {
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

  // Teste 1: Consultas RPC especiais
  console.log('📋 Teste 1: RPC Functions');
  console.log('-'.repeat(80));
  const rpcNames = [
    'get_metadata', 'get_schema', 'get_tables', 'list_schema',
    'describe_all', 'get_all_data', 'get_database_info',
    'postgres_version', 'db_info', 'database_info',
    'system_tables', 'system_schemas', 'all_schemas',
    'list_postgres_tables', 'list_all_postgres_tables',
    'get_all_columns', 'describe_columns', 'all_columns',
  ];

  for (const name of rpcNames) {
    try {
      const { data, error } = await supabase.rpc(name);
      if (!error && data) {
        console.log(`✅ ${name}:`, JSON.stringify(data).substring(0, 150));
        break;
      }
    } catch (e) {}
  }

  // Teste 2: Queries JSON especiais
  console.log('\n📋 Teste 2: Queries JSON');
  console.log('-'.repeat(80));
  const jsonQueries = [
    'select *',
    'select table_name, table_type',
    'select table_schema, table_name',
    'select * from information_schema.tables',
    'select * from information_schema.columns',
    'select * from pg_catalog.tables',
    'select * from pg_catalog.pg_tables',
    'select * from pg_catalog.pg_class',
  ];

  for (const query of jsonQueries) {
    try {
      const { data, error } = await supabase.from('anything').select(query).limit(1);
      if (!error && data) {
        console.log(`✅ Query: ${query}`);
        console.log(`   Data: ${JSON.stringify(data).substring(0, 150)}`);
        break;
      }
    } catch (e) {}
  }

  // Teste 3: API REST endpoints não convencionais
  console.log('\n📋 Teste 3: REST API Endpoints');
  console.log('-'.repeat(80));
  const restPaths = [
    '/rest/v1/*?select=*',
    '/rest/v1/*?limit=10',
    '/rest/v1/any?select=*',
    '/rest/v1/all?select=*',
    '/rest/v1/list?select=*',
    '/rest/v1/describe?select=*',
    '/rest/v1/_rpc',
    '/rest/v1/_functions',
    '/rest/v1/_metadata',
    '/rest/v1/_internal',
    '/rest/v1/_meta',
    '/rest/v1/telemetry',
    '/rest/v1/storage',
    '/rest/v1/auth/v1/alpha/functions',
    '/rest/v1/auth/v1/alpha',
    '/rest/v1/v1/_rpc',
  ];

  for (const path of restPaths) {
    const result = await makeRequest(path, { 'apikey': KEY });
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ ${path}`);
      console.log(`   Body: ${result.body.substring(0, 150)}`);
      break;
    }
  }

  // Teste 4: Tabelas comuns em bancos de dados
  console.log('\n📋 Teste 4: Tabelas Comuns');
  console.log('-'.repeat(80));
  const commonTables = [
    'users', 'user', 'users_table', 'user_table',
    'profiles', 'profile', 'profiles_table',
    'client', 'clients', 'client_table',
    'accounts', 'account', 'account_table',
    'sessions', 'session', 'session_table',
    'tokens', 'token', 'token_table',
    'logs', 'log', 'log_table',
    'meta', 'metadata', 'meta_table',
    'data', 'dados', 'data_table',
    'config', 'configs', 'config_table',
    'settings', 'setting', 'setting_table',
    'cache', 'caches', 'cache_table',
    'queue', 'queues', 'queue_table',
    'jobs', 'job', 'job_table',
    'events', 'event', 'event_table',
    'notifications', 'notification', 'notif_table',
    'alerts', 'alert', 'alert_table',
  ];

  for (const table of commonTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error && data) {
        console.log(`✅ ${table}:`, JSON.stringify(data).substring(0, 150));
        break;
      }
    } catch (e) {}
  }

  // Teste 5: Tabelas com prefixo/underscore
  console.log('\n📋 Teste 5: Tabelas com Prefixo/Underscore');
  console.log('-'.repeat(80));
  const specialTables = [
    'hot_*', '_values', '_table', '_items', '_columns',
    '_rpc', '_meta', '_internal', '_telemetry',
    'hot_table', 'user_accounts', 'client_sessions',
    'auth_users', 'log_events', 'meta_data',
    'app_config', 'system_settings', 'data_cache',
  ];

  for (const table of specialTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error && data) {
        console.log(`✅ ${table}:`, JSON.stringify(data).substring(0, 150));
        break;
      }
    } catch (e) {}
  }

  // Teste 6: Query SQL direta via RPC (se existir função)
  console.log('\n📋 Teste 6: Query SQL via RPC');
  console.log('-'.repeat(80));
  const sqlQueries = [
    'select table_name from information_schema.tables limit 10',
    'select schemaname, tablename from pg_catalog.pg_tables',
    'select * from information_schema.tables where table_schema = '\''public'\''',
    'select schemaname, tablename, rowsecurity from pg_catalog.pg_tables',
    'select table_name, table_type from information_schema.tables',
  ];

  for (const sql of sqlQueries) {
    try {
      const { data, error } = await supabase.rpc('exec', { sql });
      if (!error && data) {
        console.log(`✅ Query SQL: ${sql.substring(0, 80)}`);
        console.log(`   Data: ${JSON.stringify(data).substring(0, 150)}`);
        break;
      }
    } catch (e) {}
  }

  // Teste 7: Supabase REST API special tables
  console.log('\n📋 Teste 7: Supabase Internal Tables');
  console.log('-'.repeat(80));
  const supabaseTables = [
    'hot_*', 't.*', 'any*',
    'hot_*_*', 'hot_*_*_*',
  ];

  for (const table of supabaseTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error && data) {
        console.log(`✅ ${table}:`, JSON.stringify(data).substring(0, 150));
        break;
      }
    } catch (e) {}
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ BUSCA FINALIZADA');
  console.log('='.repeat(80));
  console.log('\nConclusão: Se nada foi encontrado acima, o banco está vazio ou as tabelas');
  console.log('não foram criadas. Precisa rodar migrations no Supabase Dashboard.');
  console.log('URL: https://supabase.com/dashboard/project/cpeobezftooqidnjzfji/sql/new');
  console.log('='.repeat(80));
})();
