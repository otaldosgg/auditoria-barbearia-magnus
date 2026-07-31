# Como Obter as Credenciais do Supabase Database

## PASSO 1: Acessar o Dashboard do Supabase

1. Abra seu navegador e acesse:
   ```
   https://supabase.com/dashboard/project/cpeobezftooqidnjzfji
   ```

2. Faça login na sua conta Supabase (se ainda não estiver logado)

## PASSO 2: Encontrar as Credenciais de Database

No menu lateral esquerdo, clique em:
1. **Settings** (engrenagem ⚙️)
2. **API**

Role até a seção **"Project API credentials"** e expanda **"Database connection string"**

## PASSO 3: Identificar o formato da URL

A string de conexão terá um formato similar a:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

Para o seu projeto:
- **Host**: `db.cpeobezftooqidnjzfji.supabase.co`
- **Porta**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: [SUA SENHA]

## PASSO 4: Criar a DATABASE_URL

Formate a URL adicionando seu password:

```bash
export DATABASE_URL="postgresql://postgres:SUA_SENHA@db.cpeobezftooqidnjzfji.supabase.co:5432/postgres"
```

⚠️ **IMPORTANTE**: Substitua `SUA_SENHA` pela senha real do seu banco de dados Supabase

## PASSO 5: Executar a Análise

Depois de ter a DATABASE_URL configurada:

```bash
cd supabase-test
node direct_query.js
```

## COMO ESCONDER A SENHA (Recomendado)

Se você não quiser expor a senha no terminal, use um arquivo .env:

1. Crie o arquivo `.env`:
```bash
echo "DATABASE_URL=postgresql://postgres:SUA_SENHA@db.cpeobezftooqidnjzfji.supabase.co:5432/postgres" > .env
```

2. Instale o pacote dotenv:
```bash
npm install dotenv
```

3. Modifique o script `direct_query.js` no início para:
```javascript
require('dotenv').config();
const { Pool } = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
```

4. Execute:
```bash
node direct_query.js
```

## 🔒 SEGURANÇA

- ⚠️ **Nunca commit** arquivos com `.env` ou senhas reais no Git
- ✅ As credenciais de database só devem ser usadas em scripts server-side
- ✅ Nunca exponha DATABASE_URL no frontend ou em bundles JavaScript
- ✅ As credenciais de database são diferentes das anon/service_role keys

## 💡 DICAS

1. **Copie** a senha exatamente como aparece no dashboard (inclusive caracteres especiais)
2. **Teste** a conexão depois de criar a DATABASE_URL
3. **Salve** as credenciais de database em um lugar seguro (não compartilhe com ninguém)
4. **Revoque** e gere uma nova senha se suspeitar que ela foi comprometida
