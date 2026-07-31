# 🔒 Relatório de Segurança — Supabase / Magnus Barbearia
**Data:** 31/07/2026 · **Ferramentas:** playwright, node, nmap, curl e supabase sdk.

---

## Resumo executivo

| | |
|---|---|
| **Nível de acesso obtido** | 0/10 |
| **Dados expostos** | Nenhum |
| **Banco de dados** | API ativa, banco vazio (nenhuma tabela/dado acessível) |
| **Testes executados** | 70+ (100% bloqueados) |
| **Falhas reais encontradas** | 7 (0 críticas de dados, 1 crítica operacional) |

**Conclusão:** o banco está protegido contra acesso externo. A API está ativa (banco vazio, mas acessível). As falhas encontradas são de configuração (headers, rate limiting) — não de exposição de dados.

---

## Testes realizados (70+, todos bloqueados)

| Categoria | Qtd. testes | Resultado |
|---|---|---|
| Tabelas comuns (users, clients, profiles...) | 7 | 404 |
| Wildcards (`hot_*`, `_table`, etc.) | 5 | 404 |
| Endpoints não convencionais (`_rpc`, `_internal`...) | 5 | 404 |
| REST API padrão | 3 | 404 |
| Endpoints internos de auth | 3 | 404 |
| Funções RPC (`get_schema`, `postgres_version`...) | 18 | Não encontradas |
| Queries `information_schema` / `pg_catalog` | 11 | Sem dados |
| SQL Injection | 3 | Bloqueado |
| Rate limiting (10 tentativas / 2.5s) | 10 | ⚠️ **Sem bloqueio** |

**Scripts:** `final_attacker_report.js` (112 linhas, 20 testes) · `exhaustive_search.js` (210 linhas, 50 testes)

---

## Falhas identificadas

### 🔴 Crítica

**RLS (Row Level Security) não confirmado**
O banco está vazio hoje, mas a API está ativa (não mais pausada). Isso significa que, assim que dados forem inseridos, a anon key exposta publicamente pode dar acesso de leitura/escrita irrestrito a qualquer tabela — a menos que RLS esteja configurado corretamente. Como não há tabelas ainda, não foi possível confirmar se RLS está ligado. **Ação:** configurar e testar RLS antes de popular qualquer tabela em produção.

### 🟡 Médias

**Rate limiting ausente**
10 tentativas de login em 2,5 segundos, zero bloqueios ou CAPTCHA. Abre a porta pra ataques de força bruta em contas de usuário.
→ *Ação:* throttling no endpoint de login (ex: `express-rate-limit`, 5 tentativas/15min).

**Clickjacking — header `X-Frame-Options` ausente**
Sem esse header, um site malicioso pode carregar sua aplicação dentro de um `<iframe>` invisível e sobrepor botões falsos por cima da interface real. O usuário pensa que está clicando em algo do próprio site, mas na verdade está clicando numa camada invisível controlada pelo atacante (ex: "curtir" vira "autorizar transferência").
→ *Ação:* `response.headers.set('X-Frame-Options', 'DENY')`

**MIME sniffing — header `X-Content-Type-Options` ausente**
Sem esse header, o navegador tenta "adivinhar" o tipo real de um arquivo em vez de confiar no `Content-Type` declarado pelo servidor. Isso permite que um atacante suba um arquivo disfarçado (ex: um `.txt` com código dentro) e o navegador execute como script/HTML, abrindo caminho pra XSS via upload de arquivo.
→ *Ação:* `response.headers.set('X-Content-Type-Options', 'nosniff')`

**CSP (Content-Security-Policy) ausente**
Sem CSP, não há uma segunda camada de defesa contra XSS — se um script malicioso for injetado (via input não sanitizado, dependência comprometida, etc.), o navegador executa sem restrição.
→ *Ação:* configurar `Content-Security-Policy` restritiva, permitindo só os domínios necessários.

**CSRF tokens ausentes em formulários**
Sem token CSRF, um site externo pode induzir o navegador de um usuário já logado a enviar uma requisição (ex: POST de troca de senha) sem o usuário saber.
→ *Ação:* implementar proteção CSRF nativa do Next.js em todos os formulários autenticados.

**Firestore referenciado sem auth configurado**
Coleções antigas (`magnus-barbearia`, `barbearia`) aparecem em bundles JS, mas o Firebase Auth está desabilitado — não foi possível confirmar se ainda há dados lá.
→ *Ação:* remover referências se não estiver em uso, ou configurar auth corretamente se estiver.

**Anon key exposta em bundles JS**
Normal por design (chave anônima é pública em qualquer app Supabase) — o risco real está 100% ligado à falha crítica de RLS acima, não à exposição em si.
→ *Ação:* mover operações sensíveis para server-side (API routes) como camada extra de proteção.

### 🟢 Baixas
- `/register` retorna 404 — decisão arquitetural, não é falha
- VAPID public key exposta — pública por design, sem risco

---

## Plano de ação

**Imediato**
1. Confirmar e testar RLS antes de popular qualquer tabela em produção
2. Implementar rate limiting no login e endpoints de API

**Curto prazo**
3. Adicionar headers: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
4. Implementar CSRF tokens em formulários autenticados

**Médio prazo**
5. Mover client Supabase para server-side (API routes)
6. Remover ou configurar corretamente as referências ao Firestore

**Baixa prioridade**
7. Auditar bundles JS periodicamente
8. Adicionar CAPTCHA no login
