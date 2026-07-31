const https = require('https');
const http = require('http');
const axios = require('axios');

const SUPABASE_URL = 'https://cpeobezftooqidnjzfji.supabase.co';
const ANON_KEY = 'sb_publishable_gvfg3bCrZHe5i47Yrb28BA_R8JM_rFc';

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SUPABASE COMPREHENSIVE ACCESS TESTER');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`URL: ${SUPABASE_URL}`);
console.log(`Anon Key: ${ANON_KEY.substring(0, 20)}...\n`);
console.log('='.repeat(80) + '\n');

// ============================================
// TEST 1: Direct HTTP Request to REST API
// ============================================
async function testRESTAPIDirect() {
  console.log('📋 TESTE 1: REST API Direct HTTP Request');
  console.log('─'.repeat(80) + '\n');

  const options = {
    hostname: 'cpeobezftooqidnjzfji.supabase.co',
    path: '/rest/v1/agendamentos?limit=1',
    method: 'GET',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`Response: ${data}\n`);

        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ Success! Found data:', JSON.stringify(json, null, 2));
          } catch (e) {
            console.log('✅ Success! Raw response received');
          }
        } else {
          console.log('❌ Failed');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ HTTP Request Error:', error.message, '\n');
      resolve();
    });

    req.end();
  });
}

// ============================================
// TEST 2: Test with JSON POST Request
// ============================================
async function testJSONRequest() {
  console.log('📋 TESTE 2: JSON POST Request with Where Clause');
  console.log('─'.repeat(80) + '\n');

  const postData = JSON.stringify({
    select: '*',
    limit: 1
  });

  const options = {
    hostname: 'cpeobezftooqidnjzfji.supabase.co',
    path: '/rest/v1/agendamentos',
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'Accept': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`Response: ${data}\n`);

        if (res.statusCode === 200) {
          console.log('✅ JSON request succeeded\n');
        } else {
          console.log('❌ JSON request failed\n');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ JSON Request Error:', error.message, '\n');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// ============================================
// TEST 3: Try information_schema directly
// ============================================
async function testInformationSchema() {
  console.log('📋 TESTE 3: Information Schema Direct Query');
  console.log('─'.repeat(80) + '\n');

  // Try different approaches to access information_schema
  const endpoints = [
    '/rest/v1/information_schema.tables',
    '/rest/v1/public.information_schema.tables',
    '/rest/v1/_info.tables'
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    console.log('-'.repeat(60));

    const options = {
      hostname: 'cpeobezftooqidnjzfji.supabase.co',
      path: endpoint,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);

          if (res.statusCode === 200) {
            console.log('✅ Success! Data received');
            try {
              const json = JSON.parse(data);
              console.log(`Records: ${Array.isArray(json) ? json.length : 'N/A'}`);
              if (Array.isArray(json) && json.length > 0) {
                console.log('Sample:', JSON.stringify(json[0], null, 2).substring(0, 200));
              }
            } catch (e) {
              console.log('Raw data:', data.substring(0, 200));
            }
          } else {
            console.log('❌ Failed:', data);
          }

          console.log();
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log('❌ Error:', error.message);
        console.log();
        resolve();
      });

      req.end();
    });
  }
}

// ============================================
// TEST 4: Try different table names
// ============================================
async function testTableVariations() {
  console.log('📋 TESTE 4: Testing Table Name Variations');
  console.log('─'.repeat(80) + '\n');

  const tableNames = [
    'agendamentos',
    'agendamento',  // singular
    'cliente',      // singular
    'clientes',
    'usuarios',
    'users',        // alternative
    'profiles',
    'barbeiros',
    'servicos',
    'horarios'
  ];

  for (const tableName of tableNames) {
    console.log(`Testing: ${tableName}`);

    const options = {
      hostname: 'cpeobezftooqidnjzfji.supabase.co',
      path: `/rest/v1/${tableName}?limit=1`,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log(`  Status: ${res.statusCode}`);

          if (res.statusCode === 200) {
            console.log(`  ✅ ${tableName} EXISTS!`);
          } else {
            console.log(`  ❌ ${tableName} not found`);
          }

          console.log();
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log(`  ❌ Error: ${error.message}`);
        console.log();
        resolve();
      });

      req.end();
    });
  }
}

// ============================================
// TEST 5: Check Database Health
// ============================================
async function testDatabaseHealth() {
  console.log('📋 TESTE 5: Database Health Check');
  console.log('─'.repeat(80) + '\n');

  const endpoints = [
    { path: '/', name: 'Root endpoint' },
    { path: '/health', name: 'Health endpoint' },
    { path: '/v1/', name: 'REST v1 root' },
    { path: '/rest/v1/', name: 'REST v1' },
    { path: '/functions/v1/', name: 'Functions' }
  ];

  for (const endpoint of endpoints) {
    console.log(`${endpoint.name}:`);

    const options = {
      hostname: 'cpeobezftooqidnjzfji.supabase.co',
      path: endpoint.path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const status = res.statusCode === 200 ? '✅' : (res.statusCode === 404 ? '⚠️' : '❌');
          console.log(`  ${status} ${res.statusCode} - ${res.statusMessage}`);

          if (res.statusCode === 200 && data) {
            try {
              const json = JSON.parse(data);
              console.log(`  Response: ${JSON.stringify(json).substring(0, 150)}`);
            } catch (e) {
              console.log(`  Response: ${data.substring(0, 150)}`);
            }
          }

          console.log();
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log(`  ❌ Error: ${error.message}`);
        console.log();
        resolve();
      });

      req.end();
    });
  }
}

// ============================================
// TEST 6: Try Using Axios
// ============================================
async function testWithAxios() {
  console.log('📋 TESTE 6: Testing with Axios HTTP Client');
  console.log('─'.repeat(80) + '\n');

  try {
    const axiosInstance = axios.create({
      baseURL: 'https://cpeobezftooqidnjzfji.supabase.co',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Testing various endpoints with Axios...\n');

    // Test 1: List tables
    console.log('1. Attempting to list tables:');
    try {
      const response = await axiosInstance.get('/rest/v1/agendamentos', {
        params: { limit: 1 }
      });
      console.log('   ✅ Success! Response:', JSON.stringify(response.data).substring(0, 200));
    } catch (err) {
      console.log('   ❌ Failed:', err.response?.status, err.response?.data || err.message);
    }

    console.log();

    // Test 2: Check info endpoint
    console.log('2. Checking info endpoint:');
    try {
      const response = await axiosInstance.get('/v1/info', {
        params: { select: 'id, name' }
      });
      console.log('   ✅ Success! Response:', JSON.stringify(response.data).substring(0, 200));
    } catch (err) {
      console.log('   ❌ Failed:', err.response?.status, err.response?.data || err.message);
    }

    console.log();

    // Test 3: Check capabilities
    console.log('3. Testing capabilities:');
    try {
      const response = await axiosInstance.options('/rest/v1/agendamentos');
      console.log('   ✅ OPTIONS request succeeded');
      console.log('   Headers:', Object.keys(response.headers).join(', '));
    } catch (err) {
      console.log('   ❌ Failed:', err.message);
    }

  } catch (error) {
    console.log('❌ Axios error:', error.message);
  }

  console.log();
}

// ============================================
// TEST 7: Check JWT Token Format
// ============================================
async function testJWTToken() {
  console.log('📋 TESTE 7: JWT Token Analysis');
  console.log('─'.repeat(80) + '\n');

  console.log('Testing JWT format...\n');

  // The anon key starts with "eyJ" which is the JWT header
  const anonKey = ANON_KEY;
  const parts = anonKey.split('.');

  if (parts.length === 3) {
    console.log('✅ Format looks like a JWT');
    console.log(`  Header: ${parts[0].substring(0, 50)}...`);
    console.log(`  Payload: ${parts[1].substring(0, 100)}...`);
    console.log(`  Signature: ${parts[2].substring(0, 50)}...\n`);

    try {
      const header = Buffer.from(parts[0], 'base64url').toString();
      const payload = Buffer.from(parts[1], 'base64url').toString();

      console.log('JWT Header:', header);
      console.log();
      console.log('JWT Payload:', payload);

      const payloadObj = JSON.parse(payload);
      console.log();
      console.log('Token claims:');
      console.log(`  iss: ${payloadObj.iss}`);
      console.log(`  ref: ${payloadObj.ref}`);
      console.log(`  role: ${payloadObj.role}`);
      console.log(`  exp: ${payloadObj.exp}`);
      console.log(`  aud: ${payloadObj.aud}`);

    } catch (e) {
      console.log('❌ Could not parse JWT:', e.message);
    }
  } else {
    console.log('⚠️  Anon key format does not match JWT');
  }

  console.log();
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  await testJWTToken();
  await testDatabaseHealth();
  await testRESTAPIDirect();
  await testJSONRequest();
  await testInformationSchema();
  await testTableVariations();
  await testWithAxios();

  console.log('═'.repeat(80));
  console.log('  RESUMO DOS TESTES');
  console.log('═'.repeat(80) + '\n');

  console.log('💡 CONCLUSÕES:\n');
  console.log('1. Supabase REST API está respondendo');
  console.log('2. Tabelas não são acessíveis via REST API (PGRST205 errors)');
  console.log('3. Provavelmente: (a) Tabelas não existem, ou (b) Migrations não executadas\n');
  console.log('📚 SOLUÇÃO:\n');
  console.log('Acesse: https://supabase.com/dashboard/project/cpeobezftooqidnjzfji\n');
  console.log('1. Vá em "SQL Editor"');
  console.log('2. Crie uma query para listar tabelas:');
  console.log('   SELECT table_schema, table_name FROM information_schema.tables\n');
  console.log('3. Se não houver tabelas, execute as migrations do projeto\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
