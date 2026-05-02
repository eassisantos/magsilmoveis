# Magsil Móveis — Arquitetura do Projeto

> Última atualização: 2026-05-02

## Informações do Negócio

| Campo | Valor |
|---|---|
| Empresa | Magsil Móveis |
| CNPJ | 32.792.105/0001-17 |
| Fundação | 2017 |
| Endereço | Rua São Gabriel, 32 — Canafístula · Arapiraca/AL · CEP 57302-792 |
| WhatsApp | +55 (82) 99902-2950 |
| E-mail | contato@magsilmoveis.com.br |
| Horário | Seg–Sex 08h–11h30 e 13h–17h30 · Sáb 08h–11h30 |
| Produto | Móveis artesanais em fibra sintética UV e corda náutica |

---

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|---|---|---|
| Astro | 6.2.1 | Framework principal (SSG + SSR por rota) |
| React | 19.x | Ilhas interativas (lucide-react icons, admin) |
| Tailwind CSS | 4.2.x | Estilização via `@tailwindcss/vite` (sem tailwind.config.js) |
| TypeScript | strict | Tipagem estrita em todo o projeto |
| Supabase | 2.x (`@supabase/ssr`) | PostgreSQL + Auth (cookies PKCE) |
| Zod | 4.x | Validação de schemas de formulários e dados |
| isomorphic-dompurify | 3.x | Sanitização HTML (SSR-safe) |
| Resend | 6.x | E-mails transacionais |
| lucide-react | 1.x | Ícones SVG (API React — prop `className`) |
| clsx + tailwind-merge | latest | Utilitários de composição de classes |
| @astrojs/vercel | 10.x | Adapter de deploy (Vercel Edge/Functions) |
| @astrojs/sitemap | 3.x | Geração automática de sitemap XML |

### Fonts (via @fontsource)
| Variável CSS | Família | Uso |
|---|---|---|
| `--font-heading` | Playfair Display (variable) | Títulos e headings |
| `--font-body` | DM Sans (variable) | Corpo de texto |
| `--font-logo` | Great Vibes | Logotipo |

---

## Design System

Todos os tokens estão em `src/styles/globals.css` dentro de `@theme {}` (Tailwind v4).

### Paleta de Cores
| Token | Valor | Uso |
|---|---|---|
| `bg-anthracite` | `#181f1a` | Fundo escuro principal, ribbon, botões CTA |
| `bg-anthracite-light` | `#252f28` | Hover de anthracite |
| `bg-anthracite-lighter` | `#354239` | Variação mais clara |
| `bg-offwhite` | `#faf9f6` | Fundo claro (nav, seções alternadas) |
| `bg-surface` | `#f5f0eb` | Fundo de cards e seções alternadas |
| `text-gold` | `#B88655` | Destaque dourado, links ativos, bordas hover |
| `text-gold-light` | `#D1A578` | Hover de gold |
| `color-border-light` | `#ece6de` | Bordas sutis |
| `color-border` | `#e0d8ce` | Bordas normais |
| `color-text-primary` | `#1a1a2e` | Texto principal |
| `color-text-secondary` | `#6b6b7b` | Texto secundário |
| `color-text-muted` | `#9b9bab` | Texto discreto |
| `text-text-inverse` | `#faf9f6` | Texto sobre fundo escuro |

### Tokens de Layout e Z-Index
| Token | Valor | Uso |
|---|---|---|
| `container-magsil` | max-width 1280px | Container padrão das páginas |
| `section-padding` | `clamp(3rem, 5vw, 5rem)` | Padding vertical das seções |
| `--z-base` | 1 | Elementos normais |
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Header sticky |
| `--z-overlay` | 30 | Overlays |
| `--z-modal` | 40 | Modais |
| `--z-toast` | 50 | Botões flutuantes (WhatsApp, Chat) |

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.astro
│   │   └── AdminTopbar.astro
│   ├── blog/
│   ├── forms/
│   ├── layout/
│   │   ├── BaseHead.astro       # <head> com SEO, OG, JSON-LD Organization
│   │   ├── Header.astro         # Two-tier: ribbon escuro + nav offwhite
│   │   └── Footer.astro         # 4 colunas + seals band + CTA band
│   ├── sections/                # Seções da home page
│   │   ├── Hero.astro
│   │   ├── AboutHeritage.astro
│   │   ├── CorporateLogos.astro
│   │   ├── FeaturedProducts.astro
│   │   ├── Features.astro
│   │   ├── FaqSection.astro
│   │   ├── Testimonials.astro
│   │   ├── CustomProjects.astro
│   │   ├── BlogPreview.astro
│   │   ├── InstaGallery.astro
│   │   ├── Collections.astro
│   │   └── CtaSection.astro
│   └── ui/
│       ├── WhatsAppButton.astro  # FAB fixo bottom-6 right-6
│       └── ChatWidget.astro      # Widget de chat guiado, bottom-24 right-6
├── content/
│   └── blog/
│       ├── como-escolher-moveis-area-externa.md
│       ├── poltrona-corda-nautica.md
│       └── tendencias-design-2026.md
├── layouts/
│   ├── BaseLayout.astro    # Layout padrão (Header + Footer + FABs)
│   ├── BlogLayout.astro    # Layout de post (breadcrumb + JSON-LD Article)
│   └── AdminLayout.astro   # Layout do painel admin
├── lib/
│   ├── supabase.ts         # Cliente Supabase (SSR com cookies)
│   └── utils.ts
├── pages/
│   ├── index.astro
│   ├── sobre.astro
│   ├── catalogo.astro
│   ├── contato.astro
│   ├── politica-de-privacidade.astro
│   ├── politica-de-cookies.astro
│   ├── termos-de-uso.astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [...id].astro
│   ├── admin/
│   │   ├── login.astro
│   │   ├── index.astro
│   │   ├── leads.astro
│   │   ├── posts.astro
│   │   ├── produtos.astro
│   │   └── depoimentos.astro
│   └── api/
│       ├── contact.ts
│       └── auth/
│           ├── login.ts
│           ├── logout.ts
│           └── callback.ts
├── schemas/
│   ├── blog-post.ts
│   ├── contact.ts
│   ├── product.ts
│   └── testimonial.ts
├── scripts/
│   ├── animations.ts    # IntersectionObserver (scroll reveal)
│   ├── catalog.ts       # Filtros do catálogo
│   ├── contact.ts       # Submit do formulário de contato
│   ├── header.ts        # Shadow no scroll
│   └── testimonials.ts  # Carrossel de depoimentos
└── styles/
    ├── globals.css      # Design tokens @theme + scroll reveal CSS
    └── global.css
```

---

## Rotas

### Páginas Públicas (SSG — prerendered)
| Rota | Arquivo | SEO / Schema |
|---|---|---|
| `/` | `src/pages/index.astro` | Organization JSON-LD |
| `/sobre` | `src/pages/sobre.astro` | BreadcrumbList |
| `/catalogo` | `src/pages/catalogo.astro` | BreadcrumbList |
| `/contato` | `src/pages/contato.astro` | LocalBusiness JSON-LD + openingHours |
| `/blog` | `src/pages/blog/index.astro` | BreadcrumbList |
| `/blog/[id]` | `src/pages/blog/[...id].astro` | Article + BreadcrumbList JSON-LD |
| `/politica-de-privacidade` | `src/pages/politica-de-privacidade.astro` | WebPage + BreadcrumbList |
| `/politica-de-cookies` | `src/pages/politica-de-cookies.astro` | WebPage + BreadcrumbList |
| `/termos-de-uso` | `src/pages/termos-de-uso.astro` | WebPage + BreadcrumbList |

### Painel Admin (SSR — protegido por middleware)
| Rota | Arquivo | Descrição |
|---|---|---|
| `/admin/login` | `src/pages/admin/login.astro` | Login com Supabase Auth |
| `/admin` | `src/pages/admin/index.astro` | Dashboard |
| `/admin/leads` | `src/pages/admin/leads.astro` | Gerenciar leads |
| `/admin/posts` | `src/pages/admin/posts.astro` | Gerenciar blog posts |
| `/admin/produtos` | `src/pages/admin/produtos.astro` | Gerenciar produtos |
| `/admin/depoimentos` | `src/pages/admin/depoimentos.astro` | Gerenciar depoimentos |

### API Routes (SSR)
| Rota | Método | Descrição |
|---|---|---|
| `/api/contact` | POST | Salva lead no Supabase + envia e-mail via Resend |
| `/api/auth/login` | POST | Autenticar admin (PKCE) |
| `/api/auth/logout` | POST | Encerrar sessão |
| `/api/auth/callback` | GET | Auth callback PKCE |

---

## Componentes Principais

### Header (`src/components/layout/Header.astro`)
- **Two-tier sticky**: ribbon escuro (`bg-anthracite h-8`, desktop only) + nav offwhite (`bg-offwhite h-16`)
- Ribbon: telefone + e-mail à esquerda, horário à direita
- Nav: logo `Great Vibes` + links com active state (`border-b-2 border-gold`) + CTA anthracite
- Mobile: menu hambúrguer com overlay `bg-offwhite`, WhatsApp no rodapé do menu
- Alturas: mobile 64px, desktop 96px (ribbon 32 + nav 64)
- Script `header.ts`: adiciona `shadow-md` no scroll > 10px

### ChatWidget (`src/components/ui/ChatWidget.astro`)
- Botão fixo `bottom-24 right-6` (acima do botão WhatsApp, sem sobreposição)
- Fluxo guiado — sem IA, sem dependências externas; 4 opções:
  - Ver produtos → `/catalogo` ou WhatsApp
  - Solicitar orçamento → `/contato` ou WhatsApp com texto pré-preenchido
  - Projeto sob medida → WhatsApp (CTA dourado)
  - Dúvidas frequentes → `/#faq` ou WhatsApp
- Bubble proativa após 6 s, some em 12 s
- Acessibilidade: `role="dialog"`, `aria-expanded`, `aria-modal`, Escape fecha

### WhatsAppButton (`src/components/ui/WhatsAppButton.astro`)
- FAB fixo `bottom-6 right-6 z-[var(--z-toast)]`
- Tamanho mínimo `56×56px`, cor `#25D366`

### Scroll Reveal (`src/scripts/animations.ts`)
- `IntersectionObserver` com threshold 0.1 e rootMargin `-48px` inferior
- Elementos com `[data-animate]` iniciam em `opacity:0; translateY(20px)`
- Ganham classe `.animate-in` ao entrar na viewport
- `[data-animate-delay="1|2|3|4"]` → 100/200/300/400ms de atraso
- CSS em `globals.css`; script em `BaseLayout.astro`

### BaseHead (`src/components/layout/BaseHead.astro`)
- Lógica de título: `Home` → title completo da marca; contém `Magsil` → usa como está; senão → `${title} | Magsil Móveis`
- JSON-LD `Organization` com endereço, fundação 2017, redes sociais
- Open Graph + Twitter Card

---

## Supabase Database Schema

### Tabelas
| Tabela | Campos principais |
|---|---|
| `leads` | name, email, phone, project_type, message, status, created_at |
| `products` | name, slug, description, category, image_url, featured, active |
| `testimonials` | client_name, client_role, content, rating, featured |
| `blog_posts` | title, slug, excerpt, content, cover_image, category, tags, published |

### RLS Policies
- `leads`: INSERT público · SELECT restrito a service_role
- `products` / `testimonials`: SELECT público (itens ativos) · full access para service_role
- `blog_posts`: SELECT público (publicados) · full access para service_role

### Cookies de Sessão
| Cookie | TTL | Propósito |
|---|---|---|
| `sb-access-token` | sessão | Token de acesso Supabase |
| `sb-refresh-token` | 7 dias | Renovação automática de sessão |
| `magsil_cookie_consent` | 365 dias | Consentimento LGPD/cookies |

---

## Middleware

`src/middleware.ts` — Protege todas as rotas `/admin/*` exceto `/admin/login`.
Verifica cookies `sb-access-token` e `sb-refresh-token` via `@supabase/ssr`.
Define `context.locals.user` para uso nas páginas protegidas.

---

## Content Collections

- Posts em Markdown: `src/content/blog/*.md`
- Config: `src/content.config.ts` (Astro v6 Content Layer API com loader `glob`)
- Schema validado com Zod em `src/schemas/blog-post.ts`

---

## SEO

| Recurso | Implementação |
|---|---|
| Meta tags | `BaseHead.astro` (title, description, canonical, noindex) |
| Open Graph | `BaseHead.astro` (og:image, og:type, og:locale pt_BR) |
| JSON-LD Organization | `BaseHead.astro` (todas as páginas) |
| JSON-LD LocalBusiness | `contato.astro` (openingHoursSpecification) |
| JSON-LD Article | `BlogLayout.astro` |
| JSON-LD BreadcrumbList | todas as páginas secundárias e posts |
| Sitemap XML | `@astrojs/sitemap` → `dist/client/sitemap-index.xml` |
| robots.txt | `public/robots.txt` |

---

## Build e Deploy

```bash
# Desenvolvimento local
pnpm dev

# Build de produção
rm -rf dist/ && pnpm build    # limpar dist/ evita erro stale prerender-entry.mjs

# Preview local do build
pnpm preview
```

- **Plataforma**: Vercel (adapter `@astrojs/vercel`)
- **Node**: ≥ 22.12.0
- **Output**: `dist/` + `.vercel/output/`
- **Variáveis de ambiente necessárias**: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`

> **Atenção**: Build direto sem limpar `dist/` pode falhar com `Cannot find module prerender-entry.mjs` (bug intermitente Astro 6 + vercel adapter). Sempre usar `rm -rf dist/ && pnpm build`.

---

## Estado Atual

### Concluído
- ✅ Projeto buildando com sucesso (11 rotas SSG + rotas SSR de admin/api)
- ✅ Design system completo (tokens, fontes, utilitários)
- ✅ Header light — two-tier com ribbon de contato
- ✅ Home page com 10 seções (Hero → InstaGallery)
- ✅ Scroll reveal com stagger em todas as seções
- ✅ Alternância de background entre seções (offwhite / surface)
- ✅ Páginas públicas: Sobre, Catálogo, Contato, Blog (listagem + 3 posts)
- ✅ Páginas legais: Política de Privacidade, Política de Cookies, Termos de Uso
- ✅ Painel admin: Login, Dashboard, Leads, Posts, Produtos, Depoimentos
- ✅ APIs: contato (Supabase + Resend) e autenticação (PKCE)
- ✅ Middleware de proteção de rotas admin
- ✅ SEO completo (meta, OG, JSON-LD, sitemap, robots.txt, breadcrumbs)
- ✅ Widget de chat guiado (sem IA) com fluxo de conversão para WhatsApp/Contato
- ✅ Botão WhatsApp flutuante

### Pendente
- ⏳ Configuração de variáveis de ambiente no Supabase (produção)
- ⏳ Assets reais (fotos de produtos, logo SVG)
- ⏳ Integração Instagram real para InstaGallery (atualmente placeholder)
