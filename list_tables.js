const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://cpeobezftooqidnjzfji.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc';

console.log('🔍 CONECTANDO AO SUPABASE...');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Project: cpeobezftooqidnjzfji`);
console.log('-'.repeat(80));

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listSchemas() {
  try {
    console.log('\n📋 LISTANDO SCHEMAS DISPONÍVEIS...\n');

    // Query information_schema to get all schemas
    const { data: schemas, error } = await supabase
      .rpc('get_all_schemas');

    if (error) {
      console.log('⚠️  Função RPC não disponível, tentando query direta...\n');

      // Alternative: list public schema tables directly
      const { data, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .order('table_schema');

      if (tableError) {
        console.error('❌ Erro ao acessar information_schema:', tableError);
        console.log('\n🔍 Tentando listar tabelas diretamente com query SQL...\n');

        // Try raw SQL query using rpc or direct query
        // Note: Supabase JS client doesn't support raw SQL directly
        // We need to use RPC or another method
        console.log('Para listar tabelas diretamente, você precisará:\n');
        console.log('1. Acessar Supabase Dashboard > SQL Editor\n');
        console.log('2. Executar: SELECT table_schema, table_name FROM information_schema.tables\n');
        console.log('3. Ou para apenas o schema public:');
        console.log('   SELECT table_name FROM information_schema.tables\n');
        console.log('   WHERE table_schema = \'public\'\n');
        return;
      }

      console.log('📊 Tabelas encontradas:');
      if (data && data.length > 0) {
        data.forEach(table => {
          console.log(`  - Schema: ${table.table_schema || 'public'} | Tabela: ${table.table_name}`);
        });
      } else {
        console.log('  ⚠️  Nenhuma tabela encontrada no schema public\n');
      }
      return;
    }

    if (schemas && schemas.length > 0) {
      console.log('Schema(s) encontrados:');
      schemas.forEach(schema => {
        console.log(`  - ${schema}`);
      });
    }

  } catch (err) {
    console.error('❌ Erro ao listar schemas:', err.message);
  }
}

async function listPublicTables() {
  try {
    console.log('\n📋 LISTANDO TABELAS NO SCHEMA PUBLIC...\n');

    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.error('❌ Erro ao listar tabelas:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log(`✅ Encontradas ${data.length} tabelas no schema public:\n`);

      data.forEach((table, index) => {
        const type = table.table_type === 'BASE TABLE' ? 'tabela' : 'view';
        console.log(`${index + 1}. ${table.table_name.padEnd(30)} [${type}]`);
      });
    } else {
      console.log('❌ Nenhuma tabela encontrada no schema public\n');
      console.log('💡 Causa provável: Migrations não foram executadas\n');
    }
  } catch (err) {
    console.error('❌ Erro ao listar tabelas public:', err.message);
  }
}

async function checkTableAccess(tableName) {
  try {
    console.log(`\n🔍 TESTANDO ACESSO À TABELA '${tableName}'...\n`);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205') {
        console.log('❌ PGRST205 - Table not found in schema cache');
        console.log('   Isso significa a tabela não existe ou não está acessível via REST API\n');
      } else if (error.code === '42P01') {
        console.log('❌ ERRO 42P01 - Undefined table');
        console.log('   A tabela especificada não existe no banco de dados\n');
      } else if (error.code === '42P07') {
        console.log('❌ ERRO 42P07 - Relation does not exist');
        console.log('   A tabela não foi criada no banco de dados\n');
      } else {
        console.log(`❌ Erro: ${error.code} - ${error.message}`);
      }

      // Try to describe the table using a direct query approach
      console.log('💡 Tente acessar o SQL Editor no Supabase Dashboard e executar:');
      console.log(`   SELECT * FROM information_schema.columns WHERE table_name = '${tableName}';\n`);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Acesso bem-sucedido!');
      console.log(`   ✅ Encontrados ${data.length} registro(s)\n`);
      console.log('   Primeiro registro:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  Tabela existe mas está vazia (0 registros)');
    }

  } catch (err) {
    console.error(`❌ Erro ao acessar tabela ${tableName}:`, err.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUPABASE DATABASE EXPLORER');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: List schemas
  await listSchemas();

  // Step 2: List public tables
  await listPublicTables();

  // Step 3: Test access to common table names based on audit
  const commonTables = [
    'agendamentos',
    'clientes',
    'usuarios',
    'barbeiros',
    'servicos',
    'horarios',
    'config_horario',
    'dias_trabalhados',
    'notificacao',
    'tokens_fcm',
    'financeiro',
    'profiles'
  ];

  console.log('\n' + '='.repeat(80));
  console.log('  TESTANDO ACESSO A TABELAS COMUNS');
  console.log('='.repeat(80) + '\n');

  for (const table of commonTables) {
    await checkTableAccess(table);
  }

  console.log('\n' + '═'.repeat(80));
  console.log('  CONCLUSÃO');
  console.log('═'.repeat(80) + '\n');
  console.log('Se todas as tabelas retornaram erro, significa que:\n');
  console.log('1. ✅ O projeto Supabase está ativo');
  console.log('2. ❌ As tabelas não foram criadas ou migrations não foram executadas\n');
  console.log('📚 SOLUÇÃO:\n');
  console.log('1. Acesse https://supabase.com/dashboard/project/cpeobezftooqidnjzfji\n');
  console.log('2. Vá em "SQL Editor" no menu lateral\n');
  console.log('3. Clique em "New query"\n');
  console.log('4. Execute as migrations SQL para criar as tabelas\n');
  console.log('5. As tabelas devem aparecer no listagem acima\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
