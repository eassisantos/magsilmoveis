<div align="center">

# Magsil Móveis

**Site institucional de alto desempenho para fabricante artesanal de móveis em fibra sintética e corda náutica**

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/Licença-Privado-red)](LICENSE)

[🌐 magsilmoveis.com.br](https://magsilmoveis.com.br) · [📋 Issues](https://github.com/eassisantos/magsilmoveis/issues) · [📖 Guia de Deploy](./docs/DEPLOY.md)

</div>

---

## Visão Geral

Site institucional da **Magsil Móveis** — fabricante artesanal de móveis em fibra sintética UV e corda náutica, sediada em Arapiraca, Alagoas, com atendimento em todo o Nordeste.

O projeto é construído com foco em:
- **Performance máxima** — arquitetura SSG-first, sem JS pesado no cliente
- **Conversão** — fluxos de contato via formulário e WhatsApp com remoção de objeções
- **SEO técnico completo** — JSON-LD, Open Graph, sitemap, breadcrumbs estruturados
- **Painel administrativo** — protegido via Supabase Auth (PKCE)

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | [Astro](https://astro.build) | 6.x |
| UI Interativa | [React](https://react.dev) (ilhas) | 19.x |
| Estilização | [Tailwind CSS](https://tailwindcss.com) v4 via `@tailwindcss/vite` | 4.x |
| Linguagem | TypeScript (`strict: true`) | 6.x |
| Banco de dados & Auth | [Supabase](https://supabase.com) (`@supabase/ssr`) | 2.x |
| Validação | [Zod](https://zod.dev) | 4.x |
| Sanitização | `isomorphic-dompurify` | 3.x |
| E-mail transacional | [Resend](https://resend.com) | 6.x |
| Ícones | [Lucide React](https://lucide.dev) | latest |
| Deploy | [Vercel](https://vercel.com) (`@astrojs/vercel`) | 10.x |
| Sitemap | `@astrojs/sitemap` | 3.x |

### Tipografia (via `@fontsource`)
| Variável | Família | Uso |
|---|---|---|
| `--font-heading` | Playfair Display | Títulos e headings |
| `--font-body` | DM Sans | Corpo de texto |
| `--font-logo` | Great Vibes | Logotipo |

---

## Funcionalidades

### Site Público
- **Home page** com 10 seções: Hero slider, Destaques, Coleções, Heritage, FAQ, Depoimentos, etc.
- **Catálogo** com filtro por categoria (client-side, sem JS pesado)
- **Páginas de produto** com galeria e especificações técnicas
- **Blog** com Content Collections do Astro (Markdown)
- **Contato** com formulário validado (Zod + DOMPurify) e integração Supabase + Resend
- **Páginas legais** completas (Privacidade, Cookies, Termos de Uso)

### UX & Performance
- **Chat Widget guiado** — 4 fluxos de conversão sem IA, integrado ao WhatsApp
- **Topbar de redes sociais** — desaparece ao rolar além da primeira dobra
- **Breadcrumbs semânticos** — `aria-label`, `aria-current="page"`, separador `•` dourado
- **Scroll Reveal** — `IntersectionObserver` nativo, sem libs externas
- **Prefetch automático** em todos os links visíveis na viewport

### Painel Admin (protegido)
- Dashboard com KPIs
- Gerenciamento de Leads, Posts, Produtos e Depoimentos
- Autenticação via Supabase PKCE Auth

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── admin/            # Sidebar, Topbar e cards do painel
│   ├── layout/           # BaseHead, Header, Footer
│   ├── sections/         # Seções da home page (Hero, Features, etc.)
│   └── ui/               # ChatWidget, Logo, ícones SVG
├── config/
│   └── business.ts       # Dados do negócio (telefone, endereço, redes sociais)
├── content/
│   └── blog/             # Posts em Markdown
├── layouts/
│   ├── BaseLayout.astro  # Header + Footer + scripts globais
│   ├── BlogLayout.astro  # Layout de artigo com JSON-LD Article
│   └── AdminLayout.astro # Layout do painel administrativo
├── lib/
│   ├── supabase.ts       # Cliente Supabase (SSR com cookies PKCE)
│   └── utils.ts          # Utilitários genéricos
├── pages/
│   ├── index.astro
│   ├── sobre.astro
│   ├── catalogo.astro
│   ├── contato.astro
│   ├── blog/             # index.astro + [...id].astro
│   ├── produtos/         # [slug].astro
│   ├── admin/            # login, dashboard, leads, posts, produtos, depoimentos
│   └── api/              # contact.ts + auth (login, logout, callback)
├── schemas/              # Schemas Zod (contact, product, testimonial, blog-post)
├── scripts/              # Client-side: header.ts, animations.ts, catalog.ts, etc.
└── styles/
    └── globals.css       # Design tokens @theme (Tailwind v4) + utilitários
```

---

## Configuração do Ambiente

### Pré-requisitos
- **Node.js** ≥ 22.12.0
- **pnpm** ≥ 9.x

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/eassisantos/magsilmoveis.git
cd magsilmoveis

# Instalar dependências
pnpm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Resend (e-mail transacional)
RESEND_API_KEY=re_sua_api_key_aqui

# URL pública do site
PUBLIC_SITE_URL=https://magsilmoveis.com.br
```

> **⚠️ Segurança:** As chaves prefixadas com `PUBLIC_` são expostas ao cliente. Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ou `RESEND_API_KEY` no frontend.

---

## Comandos

Todos os comandos devem ser rodados na raiz do projeto:

| Comando | Descrição |
|---|---|
| `pnpm install` | Instala as dependências |
| `pnpm dev` | Inicia o servidor de desenvolvimento em `localhost:4321` |
| `pnpm build` | Gera o build de produção em `./dist/` |
| `pnpm preview` | Previsualiza o build de produção localmente |
| `pnpm exec astro check` | Valida tipagem TypeScript em todos os arquivos `.astro` |
| `pnpm exec astro sync` | Sincroniza os tipos das Content Collections |

> **⚠️ Build:** Use sempre `rm -rf dist/ && pnpm build` para evitar erros de cache com o adapter Vercel (bug intermitente do Astro 6 + `prerender-entry.mjs`).

---

## Deploy (Vercel)

O projeto utiliza o adapter `@astrojs/vercel`. Para fazer deploy:

1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel da Vercel (as mesmas do `.env`)
3. O Vercel detecta automaticamente o framework Astro e realiza o build

```bash
# Deploy via Git (recomendado)
git push origin main  # A Vercel faz o deploy automaticamente

# Deploy via CLI (opcional)
npx vercel --prod
```

---

## SEO

| Recurso | Implementação |
|---|---|
| Meta tags | `BaseHead.astro` (title, description, canonical, noindex) |
| Open Graph + Twitter Card | `BaseHead.astro` |
| JSON-LD Organization | Todas as páginas |
| JSON-LD LocalBusiness | `/contato` (com openingHoursSpecification) |
| JSON-LD Article | Posts do blog |
| JSON-LD BreadcrumbList | Todas as páginas secundárias |
| Sitemap XML | Gerado automaticamente em `/sitemap-index.xml` |
| robots.txt | `public/robots.txt` |

---

## Banco de Dados (Supabase)

### Tabelas

| Tabela | Campos principais | RLS |
|---|---|---|
| `leads` | `name`, `email`, `phone`, `project_type`, `message`, `status`, `created_at` | INSERT público · SELECT restrito |
| `products` | `name`, `slug`, `description`, `category`, `image_url`, `featured`, `active` | SELECT público (ativos) |
| `testimonials` | `client_name`, `content`, `rating`, `featured` | SELECT público |
| `blog_posts` | `title`, `slug`, `excerpt`, `content`, `cover_image`, `category`, `published` | SELECT público (publicados) |

> Todas as tabelas possuem **Row Level Security (RLS)** ativado. Nenhuma tabela aceita leitura ou escrita pública irrestrita.

---

## Segurança

- **Zero Trust no frontend** — nenhuma chave secreta em variáveis `PUBLIC_`
- **Validação dupla** — Zod valida estrutura + DOMPurify sanitiza texto livre antes de qualquer operação no banco
- **Isolamento de dados** — e-mails de notificação não contêm dados sensíveis do lead
- **Auth PKCE** — fluxo de autenticação seguro para o painel admin
- **Middleware de proteção** — todas as rotas `/admin/*` são protegidas server-side

---

## Estado do Projeto

### ✅ Concluído
- Build de produção estável (0 erros TypeScript)
- Design system completo com tokens Tailwind v4
- Header two-tier com redes sociais e comportamento de scroll
- Home page com 10 seções otimizadas
- Catálogo com filtros e páginas de produto individuais
- Blog com Content Collections (3 posts de exemplo)
- Formulário de contato com validação, sanitização e integração Supabase + Resend
- Painel administrativo completo (Leads, Posts, Produtos, Depoimentos)
- SEO técnico completo (JSON-LD, OG, sitemap, breadcrumbs)
- Chat Widget guiado para conversão via WhatsApp
- Páginas legais (Privacidade, Cookies, Termos de Uso)
- Breadcrumbs semânticos padronizados em todas as páginas

### ⏳ Pendente
- Variáveis de ambiente configuradas no Supabase (produção)
- Fotografias reais dos produtos e logo SVG final
- Integração real com Instagram para a galeria

---

## Documentação Adicional

- [📐 Arquitetura Completa](./docs/ARCHITECTURE.md) — design system, rotas, schema do banco, componentes

---

<div align="center">

**Desenvolvido por [eassisantos](https://github.com/eassisantos)**

Magsil Móveis · Arapiraca, Alagoas · CNPJ 32.792.105/0001-17

</div>
