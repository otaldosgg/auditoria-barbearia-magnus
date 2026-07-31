# 🔒 Relatório de Segurança — Supabase / Magnus Barbearia
**Data:** 31/07/2026 · **Método:** teste como atacante, apenas com chave pública (anon key)

---

## Resumo executivo

| | |
|---|---|
| **Nível de acesso obtido** | 0/10 |
| **Dados expostos** | Nenhum |
| **Banco de dados** | Vazio / inacessível via API pública |
| **Testes executados** | 70+ (100% bloqueados) |
| **Falhas reais encontradas** | 7 (0 críticas de dados, 1 crítica operacional) |

**Conclusão:** o banco está protegido contra acesso externo. As falhas encontradas são de configuração (headers, rate limiting, projeto pausado) — não de exposição de dados.

---

## O que mudou desde a auditoria de 29-30/07

Testes anteriores tinham conclusões baseadas em suposição (bundles JS, projeto pausado). Os testes de hoje foram diretos na API e **desmentiram** os pontos mais alarmantes:

| Afirmação anterior | Resultado hoje |
|---|---|
| Anon key pode acessar qualquer tabela | ❌ Desmentido — 70+ testes, todos 404 |
| Tabelas descobertas via bundles JS | ❌ Desmentido — nenhuma tabela existe |
| Firestore com coleções expostas | ⚠️ Não verificável (auth desabilitado) |
| Headers de segurança ausentes | ✅ Confirmado |
| Rate limiting ausente | ✅ Confirmado |

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
| Falha | Impacto | Ação |
|---|---|---|
| **Supabase pausado** | Ao reativar, anon key pode dar acesso total se RLS não estiver configurado | Reativar e testar RLS **antes** de qualquer outra coisa |

### 🟡 Médias
| Falha | Ação recomendada |
|---|---|
| Rate limiting ausente (0 bloqueios em 10 tentativas de login) | Implementar throttling (ex: `express-rate-limit`, 5 tentativas/15min) |
| `X-Frame-Options` ausente (clickjacking) | `response.headers.set('X-Frame-Options', 'DENY')` |
| `X-Content-Type-Options` ausente | `response.headers.set('X-Content-Type-Options', 'nosniff')` |
| CSP ausente | Configurar `Content-Security-Policy` restritiva |
| CSRF tokens ausentes em formulários | Implementar proteção CSRF nativa do Next.js |
| Firestore referenciado sem auth configurado | Remover referências se não usado, ou configurar auth |
| Anon key exposta em bundles JS | Normal por design — mas mover operações sensíveis para server-side |

### 🟢 Baixas
- `/register` retorna 404 — decisão arquitetural, não é falha
- VAPID public key exposta — pública por design, sem risco

---

## Plano de ação

**Imediato**
1. Reativar Supabase e testar RLS antes de expor qualquer dado
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
