# Análise de Migração: Supabase → Sanity CMS

**Projeto**: Magsil Móveis  
**Data**: 03/05/2026  
**Autor**: Análise Técnica Completa

---

## 📊 Panorama Atual (Supabase)

### Arquitetura Existente

#### Entidades de Conteúdo
1. **Products** (Produtos)
   - Catálogo de móveis
   - Campos: name, slug, description, category, image_url, active, featured, sort_order
   - ~15-50 produtos estimados

2. **Blog Posts** (Artigos)
   - Content marketing
   - Campos: title, slug, excerpt, content_html, image_url, category, tags, status, published_at
   - Editor HTML básico (sem WYSIWYG)

3. **Testimonials** (Depoimentos)
   - Social proof
   - Campos: client_name, client_role, content, rating, featured, active
   - Gerenciamento simples

4. **Leads** (Contatos)
   - CRM básico
   - Campos: name, email, phone, project_type, message, status
   - Workflow: novo → em_contato → convertido/arquivado

#### Painel Administrativo
- **Custom-built** em Astro (.astro pages)
- Interface funcional mas básica
- Sem editor WYSIWYG para blog
- Sem preview de conteúdo
- Sem histórico de versões
- Sem colaboração em tempo real
- Autenticação via Supabase Auth (PKCE)

#### Stack Técnico Atual
```
Frontend:    Astro 6.x + React (ilhas)
Backend:     Supabase (PostgreSQL + Auth + Storage)
CMS:         Painel admin custom (Astro pages)
Deploy:      Vercel
```

---

## 🎯 Sanity CMS: Visão Geral

### O Que É o Sanity?

**Sanity** é um headless CMS moderno com:
- **Sanity Studio**: Editor visual React-based (customizável)
- **Content Lake**: Banco de dados gerenciado (não é PostgreSQL)
- **GROQ**: Linguagem de query própria (similar a GraphQL)
- **Real-time**: Colaboração ao vivo entre editores
- **Versionamento**: Histórico completo de alterações
- **Portable Text**: Formato rico de conteúdo estruturado

### Pricing (2026)
| Plano | Preço/mês | Limites | Adequado para |
|-------|-----------|---------|---------------|
| **Free** | $0 | 3 usuários, 10k documentos, 5GB assets, 100k CDN requests | Startups, MVPs |
| **Growth** | $99 | 5 usuários, documentos ilimitados, 50GB assets, 1M CDN requests | Pequenas empresas |
| **Business** | $949 | 15 usuários, ilimitado, 200GB assets, 10M CDN requests | Médias empresas |

---

## ⚖️ Comparação Detalhada

### 1. Experiência de Edição de Conteúdo

| Aspecto | Supabase (Atual) | Sanity CMS |
|---------|------------------|------------|
| **Editor de Blog** | HTML puro (textarea) | Portable Text (WYSIWYG rico) |
| **Preview** | Nenhum | Preview em tempo real |
| **Imagens** | URLs manuais | Upload integrado + CDN (imgix) |
| **Validação** | Manual (Zod no backend) | Schema-first (runtime + studio) |
| **UX do Editor** | ⭐⭐ (básico) | ⭐⭐⭐⭐⭐ (profissional) |

### 2. Recursos de CMS

| Recurso | Supabase | Sanity |
|---------|----------|--------|
| Histórico de versões | ❌ | ✅ (completo) |
| Draft/Publish workflow | ⚠️ (status manual) | ✅ (nativo) |
| Agendamento de posts | ❌ | ✅ |
| Colaboração em tempo real | ❌ | ✅ |
| Roles e permissões | ⚠️ (RLS básico) | ✅ (granular) |
| Preview de conteúdo | ❌ | ✅ |
| Internacionalização | ❌ | ✅ (plugins) |
| Referências cruzadas | ⚠️ (UUIDs manuais) | ✅ (nativo) |

### 3. Custo Total (Projeção Anual)

#### Cenário Atual (Supabase)
```
Supabase Free:               $0/mês
Vercel Hobby:                $0/mês (ou Pro $20/mês)
Resend (Email):              ~$10/mês (2k emails)
Manutenção do painel admin:  ~10h/mês × $50/h = $500/mês

TOTAL ANUAL (conservador):   $6.120/ano
```

#### Cenário Sanity
```
Sanity Growth:               $99/mês = $1.188/ano
Vercel Hobby:                $0/mês (ou Pro $20/mês)
Resend:                      ~$10/mês = $120/ano
Supabase Free (só leads):    $0/mês
Manutenção reduzida:         ~2h/mês × $50/h = $100/mês = $1.200/ano

TOTAL ANUAL:                 $2.508/ano
```

**💰 Economia Potencial: ~$3.600/ano** (redução de 59%)

### 4. Desenvolvimento e Manutenção

| Tarefa | Supabase | Sanity |
|--------|----------|--------|
| Adicionar novo campo | Alterar DB + UI + validação | Alterar schema (1 arquivo) |
| Criar novo tipo de conteúdo | Criar tabela + CRUD completo + UI | Definir schema (10 min) |
| Customizar editor | Muito trabalho | Plugins prontos |
| Backup de conteúdo | Export SQL manual | Export JSON automático |
| Migração de dados | Complexo (DB schema) | Simples (JSON) |

### 5. Performance

| Aspecto | Supabase | Sanity |
|---------|----------|--------|
| **Latência de leitura** | ~50-150ms (Supabase Edge) | ~20-50ms (Global CDN) |
| **Cache de imagens** | Manual (Cloudinary/imgix) | Nativo (imgix integrado) |
| **GROQ vs SQL** | SQL (complexo para joins) | GROQ (otimizado para conteúdo) |
| **Edge Functions** | ✅ (Supabase Edge) | ✅ (via GROQ CDN) |

---

## 🔄 Estratégia de Migração

### Opção A: Migração Completa (Recomendada)
**Mover todo conteúdo para Sanity, manter Supabase apenas para Leads**

#### Vantagens
- ✅ Melhor experiência de edição
- ✅ Redução de custos de manutenção
- ✅ Recursos profissionais de CMS
- ✅ Separação clara: CMS (Sanity) + CRM (Supabase)

#### Desvantagens
- ⚠️ Requer refatoração (2-3 semanas)
- ⚠️ Curva de aprendizado GROQ
- ⚠️ Custo mensal de $99 (vs $0 atual)

#### Escopo da Migração
1. **Migrar para Sanity**:
   - ✅ Products (catálogo)
   - ✅ Blog Posts (artigos)
   - ✅ Testimonials (depoimentos)

2. **Manter no Supabase**:
   - ✅ Leads (formulário de contato)
   - ✅ Autenticação (se precisar de painel custom para leads)

#### Passos Técnicos
```bash
# 1. Instalar dependências
pnpm add @sanity/client @sanity/image-url next-sanity

# 2. Criar projeto Sanity
pnpm create sanity@latest -- --project magsilmoveis

# 3. Definir schemas (schemas/)
- product.ts
- blogPost.ts
- testimonial.ts

# 4. Script de migração de dados
- Export Supabase → JSON
- Import JSON → Sanity

# 5. Refatorar queries
- Substituir supabase.from() por client.fetch(groq`...`)
- Atualizar tipos TypeScript

# 6. Deploy Sanity Studio
- Deploy: sanity deploy
- URL: magsilmoveis.sanity.studio
```

**Tempo estimado**: 15-20 dias úteis

---

### Opção B: Híbrido Temporário
**Manter Supabase para leads e produtos, migrar apenas Blog para Sanity**

#### Vantagens
- ✅ Migração incremental (menor risco)
- ✅ Pode testar Sanity antes de comprometer
- ✅ Blog é o conteúdo mais beneficiado

#### Desvantagens
- ❌ Dois sistemas para gerenciar
- ❌ Complexidade arquitetural
- ❌ Não resolve o problema do painel admin

**Não recomendado** — aumenta complexidade sem ganhos reais.

---

### Opção C: Status Quo Melhorado
**Manter Supabase, melhorar painel admin**

#### Investimentos Necessários
- [ ] Integrar editor WYSIWYG (TinyMCE/Tiptap)
- [ ] Sistema de upload de imagens
- [ ] Preview de conteúdo
- [ ] Melhorar UX do painel

**Custo estimado**: 40-60h de desenvolvimento = $2.000-3.000

#### Vantagens
- ✅ Sem mudança de plataforma
- ✅ Controle total

#### Desvantagens
- ❌ Nunca terá recursos de CMS profissional
- ❌ Manutenção contínua
- ❌ Reinventando a roda

---

## 🎯 Recomendação Final

### ✅ **Migrar para Sanity CMS (Opção A)**

#### Justificativa
1. **ROI Positivo**: Economia de ~$3.600/ano em manutenção
2. **Experiência Superior**: Editores terão ferramentas profissionais
3. **Escalabilidade**: Preparado para crescimento (multi-idioma, workflows avançados)
4. **Foco no Negócio**: Time pode focar em features, não em manter CMS

#### Arquitetura Recomendada (Pós-Migração)
```
┌─────────────────────────────────────────────┐
│          FRONTEND (Astro + React)           │
│              magsilmoveis.com.br            │
└─────────────────────────────────────────────┘
           ↓                    ↓
    ┌──────────┐         ┌──────────────┐
    │  Sanity  │         │   Supabase   │
    │   CMS    │         │   Database   │
    ├──────────┤         ├──────────────┤
    │ Products │         │    Leads     │
    │ Blog     │         │  (formulário)│
    │Testimonials│       └──────────────┘
    └──────────┘
         ↓
    Sanity Studio
  (admin painel)
```

#### Quando NÃO Migrar
- ❌ Se o negócio não tem fluxo de caixa para $99/mês
- ❌ Se o site é 100% estático (sem atualizações frequentes)
- ❌ Se o time tem apenas 1 desenvolvedor e zero tempo

---

## 📋 Checklist de Decisão

### Perguntas para o Cliente/Stakeholder

1. **Frequência de atualizações de conteúdo**
   - [ ] Semanalmente ou mais → **Migrar**
   - [ ] Mensalmente → **Considerar**
   - [ ] Raramente → **Não migrar**

2. **Importância da experiência do editor**
   - [ ] Crítico (time não-técnico) → **Migrar**
   - [ ] Importante → **Considerar**
   - [ ] Irrelevante (só devs editam) → **Não migrar**

3. **Orçamento disponível**
   - [ ] >$99/mês + $2k setup → **Migrar**
   - [ ] <$99/mês → **Melhorar painel atual**

4. **Roadmap de conteúdo**
   - [ ] Multi-idioma planejado → **Migrar agora**
   - [ ] Mais tipos de conteúdo → **Migrar agora**
   - [ ] Status quo → **Considerar**

---

## 🚀 Próximos Passos

### Se aprovada a migração:

**Semana 1-2: Preparação**
- [ ] Criar projeto Sanity (free trial)
- [ ] Definir schemas TypeScript
- [ ] Configurar Sanity Studio
- [ ] Script de migração de dados

**Semana 3: Migração de Dados**
- [ ] Exportar produtos do Supabase
- [ ] Exportar blog posts
- [ ] Exportar depoimentos
- [ ] Importar para Sanity (validação)

**Semana 4: Refatoração do Frontend**
- [ ] Instalar @sanity/client
- [ ] Substituir queries Supabase por GROQ
- [ ] Atualizar componentes
- [ ] Testes de regressão

**Semana 5: Deploy e Handoff**
- [ ] Deploy Sanity Studio
- [ ] Treinamento da equipe
- [ ] Documentação
- [ ] Go-live

---

## 📚 Recursos

### Documentação
- [Sanity.io Docs](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Sanity + Astro](https://www.sanity.io/guides/sanity-astro-blog)

### Templates de Referência
- [Astro Sanity Starter](https://github.com/sanity-io/sanity-template-astro-clean)
- [E-commerce com Sanity](https://github.com/sanity-io/sanity-template-ecommerce)

### Comunidade
- [Sanity Slack](https://slack.sanity.io/)
- [Sanity Exchange](https://www.sanity.io/exchange)

---

## 💡 Conclusão

**Para o projeto Magsil Móveis**, a migração para Sanity CMS é **altamente recomendada** se:
1. O negócio publica conteúdo regularmente (blog, novos produtos)
2. Há orçamento de $99/mês
3. A experiência do editor é valorizada

**Benefícios concretos**:
- 🚀 Time de marketing pode gerenciar conteúdo sem desenvolvedor
- 💰 Redução de 59% no custo de manutenção
- 📈 Preparado para escalar (multi-idioma, mais conteúdo)
- ⚡ Performance superior (Global CDN)

**Alternativa**: Se o orçamento é crítico, investir em melhorar o painel Supabase com TinyMCE + upload de imagens (~$2k one-time) é viável, mas não resolverá limitações estruturais de longo prazo.

---

**Decisão sugerida**: ✅ **Aprovar migração para Sanity CMS**

