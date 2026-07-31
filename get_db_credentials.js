const { Pool } = require('pg');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SUPABASE DATABASE CREDENTIALS GENERATOR');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('🔍 O SUPABASE REQUIER CREDENCIAIS DE BANCO DE DADOS\n');
console.log('💡 Você precisa obter as credenciais do seu projeto Supabase:\n');

console.log('📚 PASSO A PASSO:\n');
console.log('1️⃣  Acesse: https://supabase.com/dashboard/project/cpeobezftooqidnjzfji\n');
console.log('2️⃣  No menu lateral, clique em "Settings" (engrenagem)\n');
console.log('3️⃣  Selecione "API" no submenu\n');
console.log('4️⃣  Role até "Project API credentials"\n');
console.log('5️⃣  Expanda a seção "Database connection string"\n');
console.log('6️⃣  Copie a string de conexão PostgreSQL\n');
console.log('7️⃣  A string terá formato: postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres\n');
console.log('\n' + '='.repeat(80) + '\n');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Cole a DATABASE_URL aqui (pressione Enter para sair): ', async (answer) => {
  if (!answer.trim()) {
    console.log('\n❌ Você não forneceu a DATABASE_URL.\n');
    console.log('📝 Para executar a análise completa do banco de dados:\n');
    console.log('1. Obtenha a DATABASE_URL do Supabase Dashboard (veja acima)\n');
    console.log('2. Exporte como variável de ambiente:\n');
    console.log('   export DATABASE_URL="postgresql://postgres:SUA_SENHA@db.cpeobezftooqidnjzfji.supabase.co:5432/postgres"\n');
    console.log('3. Execute: node direct_query.js\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    rl.close();
    return;
  }

  console.log('\n🔍 CONECTANDO AO SUPABASE DATABASE...\n');

  try {
    const pool = new Pool({
      connectionString: answer.trim(),
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    console.log('✅ Conexão estabelecida!\n');

    // Get database version
    const { rows } = await client.query('SELECT version()');
    console.log('📦 PostgreSQL:', rows[0].version, '\n');

    // List all schemas
    console.log('📋 SCHEMAS:\n');
    const { rows: schemas } = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);

    if (schemas.length === 0) {
      console.log('  ℹ️  Nenhum schema personalizado\n');
    } else {
      schemas.forEach(row => {
        console.log(`  ✅ ${row.schema_name}`);
      });
    }

    // List all tables
    console.log('\n📋 TABELAS:\n');
    const { rows: tables } = await client.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    if (tables.length === 0) {
      console.log('  ❌ Nenhuma tabela encontrada!\n');
    } else {
      console.log(`  ✅ ${tables.length} tabelas:\n`);
      let currentSchema = '';
      tables.forEach((table, index) => {
        if (table.table_schema !== currentSchema) {
          currentSchema = table.table_schema;
          console.log(`\n  📂 ${currentSchema}:`);
        }
        console.log(`    ${index + 1}. ${table.table_name}`);
      });
    }

    // Check RLS policies
    console.log('\n🔐 RLS POLICIES:\n');
    const { rows: policies } = await client.query(`
      SELECT tablename, policyname, roles, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
    `);

    if (policies.length === 0) {
      console.log('  ⚠️  Nenhuma política RLS\n');
    } else {
      console.log(`  ✅ ${policies.length} políticas:\n`);
      policies.forEach((policy, index) => {
        console.log(`    ${index + 1}. ${policy.tablename} - ${policy.policyname}`);
        console.log(`       Roles: ${policy.roles} | Cmd: ${policy.cmd.toUpperCase()}\n`);
      });
    }

    // Count rows in public tables
    console.log('📊 ESTIMATIVA DE LINHAS:\n');
    const { rows: rowCounts } = await client.query(`
      SELECT table_name,
        COALESCE(table_rows, 0) as estimated_rows
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    rowCounts.forEach(row => {
      console.log(`  • ${row.table_name.padEnd(25)} ${row.estimated_rows} linhas`);
    });

    console.log('\n');

    client.release();
    await pool.end();

  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
    console.log('\n💡 Dica:');
    console.log('  • Verifique se a DATABASE_URL está correta\n');
    console.log('  • A senha pode conter caracteres especiais - tente colar novamente\n');
  }

  rl.close();
});
