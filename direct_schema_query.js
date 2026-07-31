// script: direct_schema_query.js
// Objetivo: Conectar diretamente ao PostgreSQL para listar todas as tabelas e schemas

const { Pool } = require('pg');
const readline = require('readline');

// Pedir DATABASE_URL ao usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(80));
console.log('CONEXÃO DIRETA COM POSTGRESQL - LISTAR SCHEMAS E TABELAS');
console.log('='.repeat(80));
console.log();
console.log('Para conectar diretamente ao banco, você precisa da DATABASE_URL do Supabase Dashboard.');
console.log('URL: https://supabase.com/dashboard/project/cpeobezftooqidnjzfji/database/connect');
console.log();

rl.question('Cole a DATABASE_URL (ou pressione Enter para ver guia): ', async (DATABASE_URL) => {
  if (!DATABASE_URL || DATABASE_URL.trim() === '') {
    console.log('\n❌ DATABASE_URL não fornecida.');
    console.log('\n📋 Passo a passo para obter:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/cpeobezftooqidnjzfji/database/connect');
    console.log('2. Clique em "Connection String"');
    console.log('3. Escolha "URI" ou "Connection URL"');
    console.log('4. Copie o DATABASE_URL completo');
    console.log('5. Cole aqui');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('Conectando ao PostgreSQL...\n');

    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida!\n');
    client.release();

    // Lista de queries para executar
    const queries = [
      {
        name: 'Listar todos os schemas',
        query: `SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;`
      },
      {
        name: 'Listar todas as tabelas (incluindo pg_catalog)',
        query: `SELECT table_schema, table_name, table_type FROM information_schema.tables ORDER BY table_schema, table_name;`
      },
      {
        name: 'Listar apenas schemas que não são pg_catalog/information_schema',
        query: `SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name;`
      },
      {
        name: 'Listar tabelas no schema public',
        query: `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
      },
      {
        name: 'Contar linhas em cada tabela public',
        query: `SELECT table_name, (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as colunas FROM information_schema.tables t WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`
      },
      {
        name: 'Listar colunas do schema public',
        query: `SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;`
      },
      {
        name: 'RLS policies no schema public',
        query: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public';`
      },
      {
        name: 'RLS enabled tables no schema public',
        query: `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
      },
      {
        name: 'Listar users/roles do banco',
        query: `SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin FROM pg_roles WHERE rolname NOT LIKE 'pg_%';`
      },
      {
        name: 'Tabelas com muito dados (se existirem)',
        query: `SELECT schemaname, tablename, n_live_tup as row_count, n_dead_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20;`
      },
      {
        name: 'Listar all tables em todos os schemas',
        query: `SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;`
      },
      {
        name: 'Listar sequências',
        query: `SELECT sequencename, schemaname FROM pg_sequences ORDER BY schemaname, sequencename;`
      }
    ];

    let totalQueries = queries.length;
    let executed = 0;

    console.log('='.repeat(80));
    console.log(`Executando ${totalQueries} queries de diagnóstico...\n`);
    console.log('='.repeat(80));
    console.log();

    for (const queryInfo of queries) {
      executed++;
      process.stdout.write(`[${executed}/${totalQueries}] ${queryInfo.name}... `);

      try {
        const result = await pool.query(queryInfo.query);

        console.log(`✅`);
        console.log(`   Rows: ${result.rows.length}`);

        if (result.rows.length > 0) {
          console.log(`   Data: ${JSON.stringify(result.rows, null, 2)}`);
        } else {
          console.log(`   (sem dados)`);
        }

        console.log();
      } catch (error) {
        console.log(`❌`);
        console.log(`   Error: ${error.message}`);
        console.log();
      }
    }

    console.log('='.repeat(80));
    console.log('✅ TODAS AS QUERIES EXECUTADAS');
    console.log('='.repeat(80));

    // Teste de acesso com anon key
    console.log('\n📋 Testando REST API com anon key:');
    console.log('='.repeat(80));

    const https = require('https');

    const headers = {
      'apikey': 'sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc',
      'Authorization': 'Bearer sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc'
    };

    // Testar se tabelas existem via REST API
    const tablesFromAPI = await makeSimpleRequest('/rest/v1/', headers);
    console.log(`Tabelas via REST API: ${tablesFromAPI.status}`);

    if (tablesFromAPI.status >= 200 && tablesFromAPI.status < 300) {
      console.log(`Response: ${JSON.stringify(tablesFromAPI.data, null, 2)}`);
    } else {
      console.log(`Error: ${tablesFromAPI.error}`);
    }

    console.log();

  } catch (error) {
    console.error(`\n❌ Erro ao conectar: ${error.message}`);
    console.error(error);
  }

  rl.close();
});

// Função auxiliar para requests HTTP simples
function makeSimpleRequest(path, headers) {
  return new Promise((resolve) => {
    const url = 'https://cpeobezftooqidnjzfji.supabase.co' + path;
    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: 'GET',
      headers: headers
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), error: null });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, error: e.message });
        }
      });
    }).on('error', (e) => {
      resolve({ status: 0, data: null, error: e.message });
    }).end();
  });
}
