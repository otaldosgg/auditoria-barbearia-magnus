const { Pool } = require('pg');

// Supabase Database connection details
// Acessível via Supabase Dashboard > Project Settings > API > Database
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:[SENHA_DO_DATABASE]@db.cpeobezftooqidnjzfji.supabase.co:5432/postgres';

console.log('🔍 CONECTANDO DIRETAMENTE AO BANCO DE DADOS POSTGRESQL...');
console.log('⚠️  Atenção: Isso usa credenciais de database (schema database)');
console.log('   Estas são credenciais internas, não exponíveis no frontend\n');
console.log('='.repeat(80) + '\n');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Test basic query
    const result = await client.query('SELECT version() as version');
    console.log('📦 PostgreSQL Version:');
    console.log(`   ${result.rows[0].version}\n`);

    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    console.log('\n💡 SOLUÇÃO:\n');
    console.log('1. Acesse https://supabase.com/dashboard/project/cpeobezftooqidnjzfji\n');
    console.log('2. Vá em "Settings" > "API"\n');
    console.log('3. Em "Project API credentials", expanda "Database connection string"\n');
    console.log('4. Copie a string de conexão do PostgreSQL\n');
    console.log('5. Configure a variável de ambiente:\n');
    console.log('   export DATABASE_URL="postgresql://postgres:SEUNAH2@db.cpeobezftooqidnjzfji.supabase.co:5432/postgres"\n');
    console.log('6. Execute: node direct_query.js\n');
    process.exit(1);
  }
}

async function listAllSchemas() {
  try {
    console.log('📋 SCHEMAS DISPONÍVEIS:\n');

    const { rows } = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);

    if (rows.length > 0) {
      rows.forEach(row => {
        console.log(`  ✅ ${row.schema_name}`);
      });
    } else {
      console.log('  ℹ️  Nenhum schema personalizado encontrado\n');
    }
  } catch (err) {
    console.error('❌ Erro ao listar schemas:', err.message);
  }
}

async function listAllTables() {
  try {
    console.log('\n📋 TODAS AS TABELAS VISÍVEIS:\n');

    const { rows } = await pool.query(`
      SELECT
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    if (rows.length > 0) {
      console.log(`✅ Encontradas ${rows.length} tabelas:\n`);

      let currentSchema = '';
      rows.forEach((row, index) => {
        if (row.table_schema !== currentSchema) {
          currentSchema = row.table_schema;
          console.log(`\n📂 SCHEMA: ${currentSchema}`);
        }

        const type = row.table_type === 'BASE TABLE' ? 'tabela' : 'view';
        console.log(`   ${String(index + 1).padStart(2)}. ${row.table_name.padEnd(30)} [${type}]`);
      });

      console.log('\n');
    } else {
      console.log('❌ Nenhuma tabela encontrada!\n');
      console.log('💡 Causa provável: Migrations não foram executadas após reativação\n');
    }
  } catch (err) {
    console.error('❌ Erro ao listar tabelas:', err.message);
  }
}

async function listPublicTablesDetailed() {
  try {
    console.log('📋 TABELAS NO SCHEMA PUBLIC (DETALHADO):\n');

    const { rows } = await pool.query(`
      SELECT
        table_name,
        table_type,
        is_insertable_into,
        table_rows::bigint as estimated_rows,
        data_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (rows.length > 0) {
      console.log(`✅ Encontradas ${rows.length} tabelas no schema public:\n`);

      rows.forEach(row => {
        const type = row.table_type === 'BASE TABLE' ? 'Tabela' : 'View';
        const insertable = row.is_insertable_into === 'YES' ? '✓' : '✗';
        const rowsCount = row.table_rows > 0 ? `~${row.table_rows} linhas` : 'N/A';

        console.log(`\n   📄 ${row.table_name}`);
        console.log(`      Tipo: ${type} | Inserível: ${insertable}`);
        console.log(`      Estimativa: ${rowsCount}`);
        console.log(`      Tipo principal: ${row.data_type}`);
      });

      console.log('\n');
    } else {
      console.log('❌ Nenhuma tabela encontrada no schema public\n');
    }
  } catch (err) {
    console.error('❌ Erro ao listar tabelas public:', err.message);
  }
}

async function describeTable(tableName) {
  try {
    console.log(`\n📊 DESCREVENDO TABELA: ${tableName}\n`);

    const { rows } = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    if (rows.length === 0) {
      console.log(`   ⚠️  Tabela '${tableName}' não encontrada no schema public\n`);
      return;
    }

    console.log('   Colunas:');
    console.log('   ┌──────────────────┬─────────────────┬──────────┬────────────────┐');
    console.log('   │ Column            │ Data Type       │ Nullable │ Default        │');
    console.log('   ├──────────────────┼─────────────────┼──────────┼────────────────┤');

    rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'YES' : 'NO';
      const defaultVal = row.column_default || '';

      console.log(`   │ ${String(row.column_name).padEnd(18)} │ ${String(row.data_type).padEnd(13)} │ ${String(nullable).padEnd(6)} │ ${String(defaultVal.substring(0, 14)).padEnd(14)} │`);
    });

    console.log('   └──────────────────┴─────────────────┴──────────┴────────────────┘');
    console.log();

  } catch (err) {
    console.error(`   ❌ Erro ao descrever tabela ${tableName}:`, err.message);
  }
}

async function checkRLSPolicies() {
  try {
    console.log('🔐 POLÍTICAS RLS (ROW LEVEL SECURITY):\n');

    const { rows } = await pool.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
    `);

    if (rows.length > 0) {
      console.log(`✅ Encontradas ${rows.length} políticas RLS:\n`);

      rows.forEach((row, index) => {
        const type = row.permissive === 'PERMISSIVE' ? 'PERMISSIVE' : 'RESTRICTIVE';
        const command = row.cmd === 'r' ? 'SELECT' : row.cmd;
        const roles = row.roles;
        const qual = row.qual || 'NONE';

        console.log(`${index + 1}. ${row.tablename.padEnd(25)} [${type}] [${command}]`);
        console.log(`   Policy: ${row.policyname}`);
        console.log(`   Roles: ${roles}`);
        console.log(`   Condition: ${qual.substring(0, 60)}${qual.length > 60 ? '...' : ''}\n`);
      });
    } else {
      console.log('⚠️  Nenhuma política RLS encontrada no schema public\n');
      console.log('💡 RLS está DESABILITADO ou não configurado\n');
    }

  } catch (err) {
    console.error('❌ Erro ao listar políticas RLS:', err.message);
  }
}

async function sampleData(tableName, limit = 5) {
  try {
    const { rows } = await pool.query(`SELECT * FROM ${tableName} LIMIT ${limit}`);

    if (rows.length === 0) {
      console.log(`   ⚠️  Tabela '${tableName}' está vazia\n`);
      return;
    }

    console.log(`\n   📊 DADOS DA TABELA '${tableName}':`);
    console.log('   ' + '─'.repeat(80));

    rows.forEach((row, index) => {
      console.log(`\n   Registro ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        const displayValue = value === null ? 'NULL' : String(value).substring(0, 50);
        console.log(`      ${key}: ${displayValue}`);
      });
    });

    console.log('\n   ' + '─'.repeat(80) + '\n');

  } catch (err) {
    console.error(`   ❌ Erro ao buscar dados de ${tableName}:`, err.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUPABASE DATABASE EXPLORER (CONEXÃO DIRETA)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Test connection
  await testConnection();

  // Step 2: List all schemas
  await listAllSchemas();

  // Step 3: List all tables
  await listAllTables();

  // Step 4: List public tables in detail
  await listPublicTablesDetailed();

  // Step 5: Check RLS policies
  await checkRLSPolicies();

  // Step 6: Describe and show sample data for common tables
  const commonTables = ['agendamentos', 'clientes', 'usuarios', 'barbeiros', 'servicos', 'horarios', 'config_horario', 'dias_trabalhados', 'notificacao', 'tokens_fcm', 'financeiro'];

  console.log('═'.repeat(80));
  console.log('  AMOSTRA DE DADOS DAS TABELAS COMUNS');
  console.log('═'.repeat(80) + '\n');

  for (const table of commonTables) {
    await sampleData(table, 1);
  }

  // Step 7: Summary
  console.log('═'.repeat(80));
  console.log('  RESUMO');
  console.log('═'.repeat(80) + '\n');

  const { rows } = await pool.query(`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);

  console.log(`Tabelas no schema public: ${rows[0].count}\n`);

  if (rows[0].count === 0) {
    console.log('❌ NENHUMA TABELA CRIADA!\n');
    console.log('🚨 O Supabase foi reativado mas as tabelas não foram criadas.\n');
    console.log('📝 SOLUÇÃO:\n');
    console.log('1. Acesse: https://supabase.com/dashboard/project/cpeobezftooqidnjzfji\n');
    console.log('2. Vá em "SQL Editor" no menu lateral esquerdo\n');
    console.log('3. Clique em "New query"\n');
    console.log('4. Execute as migrations para criar as tabelas\n');
    console.log('5. Você pode usar migrations existentes do projeto original\n');
  } else {
    console.log('✅ Tabelas foram criadas!\n');
    console.log('💡 Para explorar cada tabela em detalhes, execute:\n');
    console.log('   node describe_table.js <nome_da_tabela>\n');
  }

  await pool.end();
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err);
  process.exit(1);
});
