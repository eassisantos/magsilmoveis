# Plano de Implementação: Migração para Sanity CMS

**Projeto**: Magsil Móveis  
**Duração estimada**: 15-20 dias úteis  
**Investimento**: ~$2.500 (desenvolvimento) + $99/mês (Sanity Growth)

---

## 📅 Cronograma Detalhado

### **FASE 1: Setup e Preparação** (3 dias)

#### Dia 1: Configuração do Projeto Sanity
```bash
# 1. Criar novo projeto Sanity
cd /home/mrson/projetodev/magsilmoveis-vercel
pnpm create sanity@latest

# Responder wizard:
# - Project name: Magsil Móveis
# - Dataset: production
# - Output path: ./studio (ou ./sanity-studio)
# - Template: Clean project with no predefined schemas

# 2. Instalar dependências no Astro
pnpm add @sanity/client @sanity/image-url groq next-sanity

# 3. Configurar variáveis de ambiente
# Adicionar ao .env:
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
```

**Deliverable**: Projeto Sanity configurado e conectado ao Astro

---

#### Dia 2: Definir Schemas Sanity

**Criar: `studio/schemas/product.ts`**
```typescript
import { defineType, defineField } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Produtos',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome do Produto',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Poltronas', value: 'poltronas' },
          { title: 'Chaises', value: 'chaises' },
          { title: 'Mesas & Cadeiras', value: 'mesas' },
          { title: 'Área Externa', value: 'area_externa' },
          { title: 'Banquetas', value: 'banquetas' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagem Principal',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Galeria de Imagens',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'active',
      title: 'Produto Ativo',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Produto Destaque',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de Exibição',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Ordem Manual',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
})
```

**Criar: `studio/schemas/blogPost.ts`**
```typescript
import { defineType, defineField } from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Posts do Blog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(500),
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagem de Capa',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Legenda',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texto Alternativo',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          'Design',
          'Decoração',
          'Área Externa',
          'Cuidados e Manutenção',
          'Tendências',
          'Projetos',
          'Inspiração',
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'string',
      initialValue: 'Magsil Móveis',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Rascunho', value: 'draft' },
          { title: 'Publicado', value: 'published' },
        ],
      },
      initialValue: 'draft',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'coverImage',
    },
  },
})
```

**Criar: `studio/schemas/testimonial.ts`**
```typescript
import { defineType, defineField } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Depoimentos',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'Nome do Cliente',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'clientRole',
      title: 'Cargo/Função',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Depoimento',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(20).max(1000),
    }),
    defineField({
      name: 'rating',
      title: 'Avaliação',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'avatar',
      title: 'Foto do Cliente',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Destaque',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'clientName',
      subtitle: 'clientRole',
      media: 'avatar',
    },
  },
})
```

**Criar: `studio/schemas/index.ts`**
```typescript
import { product } from './product'
import { blogPost } from './blogPost'
import { testimonial } from './testimonial'

export const schemaTypes = [product, blogPost, testimonial]
```

**Deliverable**: Schemas completos e testados no Sanity Studio

---

#### Dia 3: Script de Migração de Dados

**Criar: `scripts/migrate-to-sanity.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from '@sanity/client'

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sanity = createSanityClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function migrateProducts() {
  console.log('🔄 Migrando produtos...')
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  if (!products) return

  const transaction = products.map(p => ({
    createOrReplace: {
      _type: 'product',
      _id: p.id,
      name: p.name,
      slug: { current: p.slug },
      description: p.description,
      category: p.category,
      active: p.active,
      featured: p.featured,
      sortOrder: p.sort_order,
      // Imagens precisam ser enviadas manualmente ou via URL
    }
  }))

  await sanity.transaction(transaction).commit()
  console.log(`✅ ${products.length} produtos migrados`)
}

async function migrateBlogPosts() {
  console.log('🔄 Migrando posts...')
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (!posts) return

  const transaction = posts.map(p => ({
    createOrReplace: {
      _type: 'blogPost',
      _id: p.id,
      title: p.title,
      slug: { current: p.slug },
      excerpt: p.excerpt,
      // content_html precisa ser convertido para Portable Text
      // Usar biblioteca html-to-portable-text
      category: p.category,
      tags: p.tags || [],
      author: 'Magsil Móveis',
      publishedAt: p.published_at,
      status: p.status,
    }
  }))

  await sanity.transaction(transaction).commit()
  console.log(`✅ ${posts.length} posts migrados`)
}

async function migrateTestimonials() {
  console.log('🔄 Migrando depoimentos...')
  
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')

  if (!testimonials) return

  const transaction = testimonials.map(t => ({
    createOrReplace: {
      _type: 'testimonial',
      _id: t.id,
      clientName: t.author_name,
      clientRole: t.author_role,
      content: t.content,
      rating: t.rating,
      featured: t.featured || false,
      active: t.active,
    }
  }))

  await sanity.transaction(transaction).commit()
  console.log(`✅ ${testimonials.length} depoimentos migrados`)
}

async function main() {
  try {
    await migrateProducts()
    await migrateBlogPosts()
    await migrateTestimonials()
    console.log('🎉 Migração concluída!')
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  }
}

main()
```

**Executar:**
```bash
pnpm tsx scripts/migrate-to-sanity.ts
```

**Deliverable**: Dados migrados para Sanity (validação manual)

---

### **FASE 2: Refatoração do Frontend** (5-7 dias)

#### Dia 4-5: Criar Cliente Sanity

**Criar: `src/lib/sanity.ts`**
```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true, // production only
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

**Criar queries GROQ: `src/lib/sanity-queries.ts`**
```typescript
import { groq } from 'next-sanity'

export const productsQuery = groq`
  *[_type == "product" && active == true] | order(sortOrder asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    category,
    image,
    featured,
    sortOrder
  }
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && active == true][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    category,
    image,
    gallery,
    featured
  }
`

export const blogPostsQuery = groq`
  *[_type == "blogPost" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    category,
    tags,
    author,
    publishedAt
  }
`

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    content,
    coverImage,
    category,
    tags,
    author,
    publishedAt
  }
`

export const testimonialsQuery = groq`
  *[_type == "testimonial" && active == true] | order(_createdAt desc) {
    _id,
    clientName,
    clientRole,
    content,
    rating,
    avatar,
    featured
  }
`
```

---

#### Dia 6-8: Refatorar Páginas

**Exemplo: `src/pages/catalogo.astro`**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { sanityClient, urlFor } from '../lib/sanity';
import { productsQuery } from '../lib/sanity-queries';

const products = await sanityClient.fetch(productsQuery);

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'poltronas', label: 'Poltronas' },
  { id: 'chaises', label: 'Chaises' },
  { id: 'mesas', label: 'Mesas & Cadeiras' },
  { id: 'area_externa', label: 'Área Externa' },
  { id: 'banquetas', label: 'Banquetas' },
];
---

<BaseLayout title="Catálogo" description="Explore nossa coleção">
  <!-- ... markup ... -->
  {products.map(product => (
    <a href={`/produtos/${product.slug}`}>
      <img 
        src={urlFor(product.image).width(400).height(400).url()} 
        alt={product.name}
      />
      <h3>{product.name}</h3>
    </a>
  ))}
</BaseLayout>
```

**Exemplo: `src/pages/blog/[slug].astro`**
```astro
---
import BlogLayout from '../../layouts/BlogLayout.astro';
import { sanityClient, urlFor } from '../../lib/sanity';
import { blogPostBySlugQuery, blogPostsQuery } from '../../lib/sanity-queries';
import { PortableText } from '@portabletext/react';

export async function getStaticPaths() {
  const posts = await sanityClient.fetch(blogPostsQuery);
  return posts.map(post => ({
    params: { slug: post.slug },
  }));
}

const { slug } = Astro.params;
const post = await sanityClient.fetch(blogPostBySlugQuery, { slug });

if (!post) return Astro.redirect('/404');
---

<BlogLayout title={post.title} description={post.excerpt}>
  <article>
    <img 
      src={urlFor(post.coverImage).width(1200).height(630).url()} 
      alt={post.title}
    />
    <h1>{post.title}</h1>
    <PortableText value={post.content} />
  </article>
</BlogLayout>
```

**Deliverable**: Todas as páginas públicas refatoradas

---

#### Dia 9-10: Atualizar Componentes

**Exemplo: `src/components/sections/FeaturedProducts.astro`**
```astro
---
import { sanityClient, urlFor } from '../../lib/sanity';
import { groq } from 'next-sanity';

const featuredProducts = await sanityClient.fetch(groq`
  *[_type == "product" && featured == true && active == true] | order(sortOrder asc) [0...6] {
    _id,
    name,
    "slug": slug.current,
    description,
    image
  }
`);
---

<section>
  {featuredProducts.map(product => (
    <a href={`/produtos/${product.slug}`}>
      <img src={urlFor(product.image).width(300).url()} alt={product.name} />
      <h3>{product.name}</h3>
    </a>
  ))}
</section>
```

**Deliverable**: Componentes atualizados e testados

---

### **FASE 3: Deploy e Handoff** (2-3 dias)

#### Dia 11-12: Deploy Sanity Studio

```bash
# 1. Build do Studio
cd studio
pnpm build

# 2. Deploy no Sanity
pnpm sanity deploy

# URL final: https://magsilmoveis.sanity.studio
```

**Customizar Studio: `studio/sanity.config.ts`**
```typescript
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'magsil-moveis',
  title: 'Magsil Móveis',
  projectId: 'your_project_id',
  dataset: 'production',
  
  plugins: [
    deskTool(),
    visionTool(), // GROQ playground
  ],
  
  schema: {
    types: schemaTypes,
  },
})
```

**Deliverable**: Studio acessível e funcional

---

#### Dia 13: Testes Finais

**Checklist de Teste:**
- [ ] Catálogo carrega produtos corretamente
- [ ] Páginas de produto individuais funcionam
- [ ] Blog lista posts
- [ ] Posts individuais renderizam Portable Text
- [ ] Depoimentos aparecem na home
- [ ] Imagens carregam via Sanity CDN
- [ ] Cache funciona (CDN)
- [ ] SEO mantido (meta tags, JSON-LD)
- [ ] Performance igual ou melhor (Lighthouse)

**Deliverable**: Site testado e aprovado

---

#### Dia 14-15: Treinamento e Documentação

**Criar: `docs/SANITY_GUIDE.md`** (manual do editor)

**Tópicos:**
1. Como acessar o Sanity Studio
2. Como criar/editar produtos
3. Como publicar posts no blog
4. Como gerenciar depoimentos
5. Upload de imagens
6. Preview antes de publicar
7. Versionamento e histórico

**Sessão de treinamento:**
- 1h ao vivo demonstrando o Studio
- Gravação para referência futura

**Deliverable**: Equipe treinada, documentação completa

---

## 🛠 Manutenção Pós-Migração

### Supabase (apenas Leads)

**Manter:**
- Tabela `leads` (formulário de contato)
- Autenticação (se necessário para acessar leads)
- API route `/api/contact.ts`

**Remover:**
- Tabelas: `products`, `blog_posts`, `testimonials`
- Páginas admin: `/admin/produtos`, `/admin/posts`, `/admin/depoimentos`
- Manter apenas: `/admin/leads`, `/admin/login`

**Simplificar painel admin:**
```astro
<!-- src/pages/admin/index.astro -->
<!-- Apenas dashboard de leads -->
```

---

## 💰 Custos Recorrentes Pós-Migração

```
Sanity Growth:       $99/mês
Supabase Free:       $0/mês (apenas leads)
Vercel Hobby/Pro:    $0-20/mês
Resend:              ~$10/mês
                     ___________
TOTAL:               $109-129/mês

vs. Custo anterior (estimado): ~$520/mês (com manutenção)
ECONOMIA: ~75%
```

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados na migração | Baixa | Alto | Backup completo antes, validação item por item |
| Downtime durante deploy | Média | Médio | Deploy em horário de baixo tráfego, staging environment |
| Curva de aprendizado GROQ | Alta | Baixo | Documentação extensa, queries pré-prontas |
| Custo Sanity aumenta | Baixa | Médio | Monitorar usage, otimizar queries |
| Bug no Portable Text | Média | Baixo | Testes extensivos, fallback para HTML simples |

---

## ✅ Critérios de Sucesso

1. ✅ **Funcionalidade**: 100% das features atuais mantidas
2. ✅ **Performance**: Lighthouse score ≥ 95
3. ✅ **SEO**: Sem perda de rankings (monitorar 30 dias)
4. ✅ **UX do Editor**: NPS ≥ 8/10 da equipe de conteúdo
5. ✅ **Uptime**: 99.9% no primeiro mês
6. ✅ **Budget**: Dentro do orçamento ($2.500 setup)

---

## 📞 Suporte

**Durante migração:**
- Daily standups (15min)
- Canal dedicado no Slack/Discord
- Sanity Community Slack

**Pós-migração:**
- Suporte por 30 dias incluído
- Após: $100/h on-demand

---

## 🎯 Conclusão

Este plano detalha todos os passos técnicos para uma migração bem-sucedida. Com disciplina e seguindo o cronograma, o projeto estará migrado em **15-20 dias úteis**, resultando em:

- 🚀 CMS profissional com UX superior
- 💰 75% de redução em custos de manutenção
- 📈 Escalabilidade para crescimento futuro
- ⚡ Performance otimizada (Global CDN)

**Próximo passo**: Aprovação do stakeholder → Iniciar Fase 1

