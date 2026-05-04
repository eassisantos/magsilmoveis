# Guia de Deploy — Magsil Móveis

> Última revisão: maio 2026  
> Stack: Astro 6 · Sanity v5 · Supabase Auth · Tailwind v4 · Vercel

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Variáveis de ambiente](#2-variáveis-de-ambiente)
3. [Serviços externos — configuração inicial](#3-serviços-externos--configuração-inicial)
   - 3.1 Supabase
   - 3.2 Sanity
   - 3.3 Resend
   - 3.4 Cloudflare Turnstile
   - 3.5 Instagram Basic Display
4. [Deploy na Vercel](#4-deploy-na-vercel)
5. [Pós-deploy — checklist obrigatório](#5-pós-deploy--checklist-obrigatório)
6. [Desenvolvimento local](#6-desenvolvimento-local)
7. [Estrutura do projeto](#7-estrutura-do-projeto)
8. [Segurança — visão geral](#8-segurança--visão-geral)
9. [Comandos úteis](#9-comandos-úteis)

---

## 1. Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 22.12.0 |
| pnpm | 10.x |
| Conta Vercel | Plano Hobby ou superior |
| Conta Supabase | Free tier suficiente |
| Projeto Sanity | v5 (novo ou migrado) |

---

## 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha **todos** os valores antes de rodar localmente ou fazer deploy.

```bash
cp .env.example .env
```

### Referência completa

```bash
# ─── Supabase ─────────────────────────────────────────────────────────────────
# Dashboard: https://supabase.com/dashboard → projeto → Settings → API
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # NUNCA expor no cliente

# ─── Sanity ───────────────────────────────────────────────────────────────────
# Dashboard: https://sanity.io/manage → projeto
PUBLIC_SANITY_PROJECT_ID=<project-id>
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<write-token>                 # permissão Editor ou superior
SANITY_API_READ_TOKEN=<read-token>             # permissão Viewer (opcional, para ISR)
PUBLIC_SANITY_VISUAL_EDITING_ENABLED=false     # 'true' apenas em Preview Deployment

# ─── Resend ───────────────────────────────────────────────────────────────────
# Dashboard: https://resend.com/api-keys
RESEND_API_KEY=re_<...>

# ─── Cloudflare Turnstile ─────────────────────────────────────────────────────
# Dashboard: https://dash.cloudflare.com → Turnstile → Add site
PUBLIC_TURNSTILE_SITE_KEY=<site-key>           # exposto no cliente (widget)
TURNSTILE_SECRET_KEY=<secret-key>              # verificação server-side

# ─── Instagram Basic Display API ──────────────────────────────────────────────
# https://developers.facebook.com/docs/instagram-basic-display-api
INSTAGRAM_ACCESS_TOKEN=<long-lived-token>      # expira em 60 dias — renovar via cron

# ─── Site ─────────────────────────────────────────────────────────────────────
PUBLIC_SITE_URL=https://magsilmoveis.com.br
PUBLIC_WHATSAPP_NUMBER=5582999999999           # formato: DDI + DDD + número (sem +)
PUBLIC_CONTACT_EMAIL=contato@magsilmoveis.com.br
```

> **Regra de ouro:** variáveis com prefixo `PUBLIC_` são embutidas no bundle do cliente.
> Nunca coloque segredos (Service Role Key, tokens de escrita) com esse prefixo.

---

## 3. Serviços externos — configuração inicial

### 3.1 Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings → API** e copie `URL` e `anon key`
3. Vá em **Settings → API → Service Role** e copie a chave (use apenas server-side)
4. Em **Authentication → Providers**, ative **Email** (magic link ou password)
5. Em **Authentication → URL Configuration**, defina:
   - **Site URL:** `https://magsilmoveis.com.br`
   - **Redirect URLs:** `https://magsilmoveis.com.br/api/auth/callback`
6. Execute o schema no **SQL Editor** (se for primeiro deploy):

```sql
-- Tabela de leads / CRM
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  project_type text,
  message     text,
  status      text default 'novo',
  created_at  timestamptz default now()
);

-- Row Level Security: apenas service_role tem acesso
alter table leads enable row level security;
```

### 3.2 Sanity

1. Crie um projeto em [sanity.io/manage](https://sanity.io/manage)
2. Copie o **Project ID** e confirme que o dataset se chama `production`
3. Em **API → Tokens**, crie dois tokens:
   - `Editor` — cole em `SANITY_API_TOKEN` (build + escrita via Studio)
   - `Viewer` — cole em `SANITY_API_READ_TOKEN` (leitura em preview, opcional)
4. Em **API → CORS Origins**, adicione:
   - `https://magsilmoveis.com.br` (com e sem trailing slash)
   - `http://localhost:4321` (desenvolvimento local)
5. Em **API → Webhooks** (opcional — para revalidação futura):
   - URL: `https://magsilmoveis.com.br/api/webhook/sanity`
   - Secret: gere com `openssl rand -hex 32` e configure `SANITY_WEBHOOK_SECRET`

**Publicar conteúdo inicial:** acesse `/studio` após o deploy para criar produtos, posts e depoimentos pelo Sanity Studio embutido.

### 3.3 Resend

1. Crie conta em [resend.com](https://resend.com)
2. Vá em **API Keys → Create API Key** com permissão `Send access`
3. Em **Domains**, adicione e verifique `magsilmoveis.com.br` via DNS (registros SPF/DKIM/DMARC)
4. Cole a chave em `RESEND_API_KEY`

> O email de destino dos leads está em `src/pages/api/contact.ts`. Ajuste conforme necessário.

### 3.4 Cloudflare Turnstile

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile → Add site**
2. Tipo: **Managed** (invisível — melhor UX)
3. Domínio: `magsilmoveis.com.br` + `localhost` (para testes)
4. Copie **Site Key** → `PUBLIC_TURNSTILE_SITE_KEY`
5. Copie **Secret Key** → `TURNSTILE_SECRET_KEY`

O widget já está integrado no formulário de contato. A validação server-side é feita em `/api/contact`.

### 3.5 Instagram Basic Display

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um app → adicione o produto **Instagram Basic Display**
3. Gere um **Long-Lived Token** (válido por 60 dias)
4. Cole em `INSTAGRAM_ACCESS_TOKEN`
5. **Renovação:** o token expira. Configure um cron mensal para renovar via `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<token>`

---

## 4. Deploy na Vercel

### Primeiro deploy

```bash
# 1. Instale a CLI da Vercel (se não tiver)
pnpm add -g vercel

# 2. Faça login
vercel login

# 3. Execute dentro da pasta do projeto
vercel
```

Responda ao wizard:
- **Set up and deploy?** → `Y`
- **Which scope?** → sua conta/organização
- **Link to existing project?** → `N` (primeiro deploy)
- **Project name:** `magsilmoveis`
- **Directory:** `./` (raiz)
- **Override settings?** → `N` (o `vercel.json` já configura tudo)

### Configurar variáveis de ambiente na Vercel

```bash
# Adicionar cada variável (repita para cada uma do item 2)
vercel env add PUBLIC_SUPABASE_URL production
vercel env add PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... e assim por diante
```

Ou pelo painel: **Vercel Dashboard → projeto → Settings → Environment Variables**

> Configure `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true` apenas em ambientes **Preview** para ativar Visual Editing do Sanity.

### Deploys subsequentes

```bash
# Deploy para produção
vercel --prod

# Ou via git push (se o projeto estiver vinculado ao GitHub)
git push origin main
```

---

## 5. Pós-deploy — checklist obrigatório

Execute cada item após o primeiro deploy em produção:

- [ ] **DNS propagado** — acesse `https://magsilmoveis.com.br` no browser
- [ ] **Supabase callback** — teste login em `/admin/login` e confirme que o redirect volta corretamente
- [ ] **HSTS** — verifique no [hstspreload.org](https://hstspreload.org) e submeta o domínio
- [ ] **Security headers** — rode `curl -I https://magsilmoveis.com.br` e confirme: `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Strict-Transport-Security`
- [ ] **Formulário de contato** — submeta um lead de teste e confirme email + registro no Supabase
- [ ] **Turnstile** — confirme que o widget aparece e que submissões sem token são rejeitadas com 403
- [ ] **Sanity Studio** — acesse `/studio` e confirme que o Studio carrega e está autenticado
- [ ] **Sitemap** — acesse `/sitemap-index.xml` e confirme que as URLs estão corretas
- [ ] **robots.txt** — acesse `/robots.txt` e confirme que `/admin` e `/studio` estão bloqueados para crawlers
- [ ] **Instagram** — confirme que a galeria carrega (se token configurado)
- [ ] **Resend DNS** — verifique `SPF`, `DKIM` e `DMARC` no painel do Resend

---

## 6. Desenvolvimento local

```bash
# Clonar e instalar
git clone https://github.com/eassisantos/magsilmoveis.git
cd magsilmoveis-vercel
pnpm install

# Configurar variáveis
cp .env.example .env
# edite .env com os valores reais

# Iniciar servidor de desenvolvimento
pnpm dev
# → http://localhost:4321

# Sanity Studio local
# → http://localhost:4321/studio

# Build de produção local
pnpm build
pnpm preview
```

> O middleware de auth redireciona para `/admin/login` se `PUBLIC_SUPABASE_URL` não estiver definido. Em desenvolvimento, configure `.env` com as credenciais reais ou de staging do Supabase.

---

## 7. Estrutura do projeto

```
src/
├── components/
│   ├── admin/          # Sidebar, Topbar, KPI cards
│   ├── layout/         # Header, Footer, BaseHead
│   ├── sections/       # Seções da home (Hero, FeaturedProducts, etc.)
│   └── ui/             # ChatWidget (WhatsApp), Logo, ícones
├── layouts/
│   ├── BaseLayout.astro # Layout público (todas as páginas)
│   ├── AdminLayout.astro
│   └── BlogLayout.astro
├── lib/
│   ├── supabase.ts     # createSupabaseServerClient, createSupabaseAdmin
│   └── utils.ts
├── pages/
│   ├── admin/          # Painel protegido (SSR, prerender=false)
│   ├── api/
│   │   ├── auth/       # login, logout, callback (OAuth PKCE)
│   │   └── contact.ts  # formulário público → Supabase + Resend
│   ├── blog/           # [slug].astro — posts do Sanity
│   └── produtos/       # [slug].astro — produtos do Sanity
├── sanity/
│   ├── lib/            # client.ts, queries.ts, image.ts
│   └── schemaTypes/    # Schemas: product, post, testimonial
├── middleware.ts        # Auth guard + Security Headers + Rate-limiting
└── env.d.ts            # Tipagem das variáveis de ambiente
```

---

## 8. Segurança — visão geral

O projeto implementa múltiplas camadas de defesa (defense-in-depth):

| Camada | Implementação |
|---|---|
| **Transport** | HSTS (`max-age=31536000; preload`) via `vercel.json` + middleware |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` |
| **XSS** | `Content-Security-Policy` estrita + `isomorphic-dompurify` nos campos livres |
| **MIME sniffing** | `X-Content-Type-Options: nosniff` |
| **CSRF** | `form-action 'self'` na CSP + verificação de `Origin` header no login |
| **Brute-force** | Rate-limit em `/api/auth/login`: 10 req/60s por IP |
| **Spam no contato** | Rate-limit em `/api/contact`: 5 req/60s por IP + Cloudflare Turnstile |
| **Session hijacking** | Cookies `httpOnly`, `secure` (PROD), `sameSite: lax` |
| **Logout seguro** | `Clear-Site-Data: "cache", "cookies", "storage"` |
| **OAuth callback** | Validação de formato do `code` com regex antes de enviar ao Supabase |
| **Cache de sessão** | `Cache-Control: no-store` em todas as rotas `/admin` e `/api` |
| **Cross-origin isolation** | `Cross-Origin-Opener-Policy: same-origin` |
| **Injeção** | Validação Zod em todos os endpoints antes de tocar no banco |

### Variáveis críticas — nunca expor no cliente

- `SUPABASE_SERVICE_ROLE_KEY` — bypass de RLS, acesso total ao banco
- `SANITY_API_TOKEN` — escrita no CMS
- `TURNSTILE_SECRET_KEY` — verificação server-side do CAPTCHA
- `RESEND_API_KEY` — envio de email

---

## 9. Comandos úteis

```bash
# Desenvolvimento
pnpm dev                    # servidor local em :4321
pnpm build                  # build de produção (equivalente a pnpm astro build)
pnpm preview                # preview do build em :4321

# Deploy
vercel                      # deploy para preview
vercel --prod               # deploy para produção

# Diagnóstico
pnpm astro check            # verificação de tipos TypeScript
vercel logs magsilmoveis    # logs em tempo real da função serverless

# Limpeza
rm -rf dist .vercel/output  # limpar artefatos de build anteriores
```
