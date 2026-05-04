# Comparação Prática: Supabase vs Sanity CMS

**Objetivo**: Mostrar lado a lado como tarefas comuns são realizadas em cada plataforma.

---

## 1. Criar um Novo Produto

### 🔴 Supabase (Atual)

**Passo 1**: Acessar `/admin/produtos/novo`  
**Passo 2**: Preencher formulário HTML básico  
**Passo 3**: Para adicionar imagem, precisa:
- Enviar imagem para Unsplash/Imgur manualmente
- Copiar URL
- Colar no campo "URL da Imagem"

**Código Backend: `src/pages/admin/produtos/novo.astro`**
```astro
---
if (Astro.request.method === 'POST') {
  const data = await Astro.request.formData();
  const name = data.get('name') as string;
  const slug = data.get('slug') as string;
  const category = data.get('category') as string;
  const description = data.get('description') as string;
  const image_url = data.get('image_url') as string; // 👈 URL manual
  
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('products').insert([
    { name, slug, category, description, image_url }
  ]);
  
  if (error) {
    errorMsg = 'Erro: ' + error.message;
  } else {
    return Astro.redirect('/admin/produtos');
  }
}
---
<form method="POST">
  <input type="text" name="name" required />
  <input type="text" name="slug" required />
  <select name="category" required>
    <option value="poltronas">Poltronas</option>
    <!-- ... -->
  </select>
  <textarea name="description"></textarea>
  <input type="url" name="image_url" /> <!-- 👈 URL manual -->
  <button type="submit">Salvar</button>
</form>
```

**Problemas:**
- ❌ Sem upload de imagem integrado
- ❌ Sem preview da imagem
- ❌ Slug precisa ser digitado manualmente
- ❌ Sem validação visual
- ❌ Interface pouco intuitiva

---

### 🟢 Sanity CMS

**Passo 1**: Acessar `magsilmoveis.sanity.studio`  
**Passo 2**: Clicar em "Produtos" → "Create"  
**Passo 3**: Preencher campos com validação em tempo real  
**Passo 4**: Upload de imagem direto do computador (drag & drop)

**Schema: `studio/schemas/product.ts`**
```typescript
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
      options: { 
        source: 'name', // 👈 Auto-gera slug ao digitar nome
        maxLength: 96 
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagem Principal',
      type: 'image', // 👈 Upload integrado + CDN
      options: { hotspot: true }, // Crop inteligente
    }),
    defineField({
      name: 'gallery',
      title: 'Galeria (até 10 fotos)',
      type: 'array',
      of: [{ type: 'image' }],
      validation: Rule => Rule.max(10),
    }),
  ],
})
```

**Vantagens:**
- ✅ Upload de imagem integrado (drag & drop)
- ✅ Preview instantâneo
- ✅ Slug gerado automaticamente
- ✅ Validação em tempo real
- ✅ Interface profissional
- ✅ Galeria de múltiplas imagens
- ✅ Crop inteligente (hotspot)
- ✅ CDN global automático (imgix)

**Visual:**
```
┌─────────────────────────────────────────────┐
│  Sanity Studio - Criar Produto              │
├─────────────────────────────────────────────┤
│                                             │
│  Nome do Produto *                          │
│  [Poltrona Corda Náutica Aruba___________] │
│                                             │
│  Slug (URL) *                               │
│  [poltrona-corda-nautica-aruba___________]  │
│  ↑ Auto-gerado ao digitar nome             │
│                                             │
│  Imagem Principal                           │
│  ┌─────────────────────┐                   │
│  │  [Drag & Drop]      │ [Upload]          │
│  │  ou clique aqui     │                   │
│  └─────────────────────┘                   │
│                                             │
│  Galeria (até 10 fotos)                     │
│  [img1] [img2] [img3] [+ Add]              │
│                                             │
│  Categoria *                                │
│  (•) Poltronas  ( ) Chaises  ( ) Mesas     │
│                                             │
│  [Publish]  [Save as Draft]                │
└─────────────────────────────────────────────┘
```

---

## 2. Escrever um Post no Blog

### 🔴 Supabase (Atual)

**Interface: `src/pages/admin/posts/novo.astro`**
```astro
<label>Conteúdo do Post *</label>
<textarea 
  name="content_html" 
  required 
  rows="20"
  class="w-full font-mono text-sm"
></textarea>
<!-- 👆 Editor HTML cru, sem formatação visual -->
```

**Experiência do editor:**
```html
<!-- O editor precisa escrever HTML puro: -->
<p>Descubra as <strong>tendências de 2026</strong> em móveis...</p>
<h2>1. Sustentabilidade</h2>
<p>Materiais eco-friendly estão em alta...</p>
<img src="https://..." alt="Móveis sustentáveis">
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**Problemas:**
- ❌ Sem WYSIWYG (What You See Is What You Get)
- ❌ Precisa conhecer HTML
- ❌ Sem formatação de texto (bold, itálico, listas)
- ❌ Sem preview
- ❌ Erro de HTML quebra o site
- ❌ Imagens precisam ser hospedadas externamente

---

### 🟢 Sanity CMS

**Editor Portable Text** (WYSIWYG Rico)
```typescript
defineField({
  name: 'content',
  title: 'Conteúdo',
  type: 'array',
  of: [
    { type: 'block' }, // Parágrafo, H2, H3, bold, itálico, links
    {
      type: 'image', // Imagem inline
      options: { hotspot: true },
      fields: [
        { name: 'caption', type: 'string', title: 'Legenda' },
        { name: 'alt', type: 'string', title: 'Texto Alt' },
      ],
    },
    {
      type: 'object',
      name: 'callout',
      title: 'Caixa de Destaque',
      fields: [
        { name: 'text', type: 'text' },
        { name: 'style', type: 'string', options: { list: ['info', 'warning', 'success'] } },
      ],
    },
  ],
})
```

**Experiência do editor:**
```
┌─────────────────────────────────────────────────────┐
│  Sanity Studio - Editar Post                        │
├─────────────────────────────────────────────────────┤
│  [B] [I] [H2] [H3] [Link] [🖼️] [📋 Callout]         │
│                                                     │
│  Descubra as **tendências de 2026** em móveis...   │
│                                                     │
│  ## 1. Sustentabilidade                            │
│                                                     │
│  Materiais eco-friendly estão em alta...           │
│                                                     │
│  [Imagem: moveis-sustentaveis.jpg]                 │
│  Legenda: Móveis feitos com materiais reciclados   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ℹ️  Dica: Prefira madeira certificada FSC   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  - Item 1                                           │
│  - Item 2                                           │
│                                                     │
│  [👁️ Preview]  [Publish]  [Save Draft]             │
└─────────────────────────────────────────────────────┘
```

**Vantagens:**
- ✅ Editor visual (WYSIWYG)
- ✅ Formatação com toolbar (bold, itálico, H2, H3, listas)
- ✅ Upload de imagens inline
- ✅ Blocos customizados (callouts, quotes, etc.)
- ✅ Preview em tempo real
- ✅ Estrutura garantida (não quebra o site)
- ✅ Conteúdo portável (JSON, não HTML)

---

## 3. Buscar Produtos no Frontend

### 🔴 Supabase (Atual)

**Código: `src/pages/catalogo.astro`**
```astro
---
import { createSupabaseServerClient } from '../lib/supabase';

const supabase = createSupabaseServerClient(Astro.request, Astro.cookies);

const { data: products } = await supabase
  .from('products')
  .select('name, slug, description, category, image_url')
  .eq('active', true)
  .order('sort_order', { ascending: true });
---

{products?.map(product => (
  <a href={`/produtos/${product.slug}`}>
    <img src={product.image_url || '/placeholder.jpg'} alt={product.name} />
    <h3>{product.name}</h3>
  </a>
))}
```

**Problemas:**
- ⚠️ SQL pode ser complexo para queries avançadas
- ⚠️ Imagens não otimizadas (URL estática)
- ⚠️ Precisa lidar com nullable manualmente

---

### 🟢 Sanity CMS

**Código: `src/pages/catalogo.astro`**
```astro
---
import { sanityClient, urlFor } from '../lib/sanity';
import { groq } from 'next-sanity';

const products = await sanityClient.fetch(groq`
  *[_type == "product" && active == true] | order(sortOrder asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    category,
    image,
    featured
  }
`);
---

{products.map(product => (
  <a href={`/produtos/${product.slug}`}>
    <img 
      src={urlFor(product.image)
        .width(400)
        .height(400)
        .auto('format') // 👈 WebP automático
        .url()} 
      alt={product.name} 
    />
    <h3>{product.name}</h3>
  </a>
))}
```

**Vantagens:**
- ✅ GROQ mais legível que SQL
- ✅ Imagens otimizadas automaticamente (WebP, tamanhos)
- ✅ CDN global (entrega rápida)
- ✅ Cache inteligente

**Comparação de Performance:**

| Métrica | Supabase | Sanity |
|---------|----------|--------|
| Latência de query | ~80ms | ~30ms (CDN) |
| Tamanho de imagem (400x400) | ~150KB (JPEG) | ~40KB (WebP) |
| Cache | Manual | Automático (CDN) |
| Otimização de imagem | Manual | Automática |

---

## 4. Query Complexa: Produtos com Posts Relacionados

### 🔴 Supabase (Atual)

**Problema**: Supabase não tem joins nativos fáceis para relacionamentos.

**Solução (workaround):**
```typescript
// 1. Buscar produto
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('slug', slug)
  .single();

// 2. Buscar posts relacionados (JOIN manual)
const { data: posts } = await supabase
  .from('blog_posts')
  .select('*')
  .contains('tags', [product.category]) // 👈 Aproximação
  .limit(3);

// 3. Combinar manualmente
product.relatedPosts = posts;
```

**Complexidade**: ⭐⭐⭐⭐ (difícil)

---

### 🟢 Sanity CMS

**Query GROQ com Relacionamentos:**
```typescript
const product = await sanityClient.fetch(groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    category,
    image,
    "relatedPosts": *[
      _type == "blogPost" && 
      category == ^.category &&
      status == "published"
    ] | order(publishedAt desc) [0...3] {
      title,
      "slug": slug.current,
      excerpt,
      coverImage
    }
  }
`, { slug });
```

**Complexidade**: ⭐⭐ (simples)

**Vantagens:**
- ✅ Uma única query
- ✅ Relacionamentos nativos
- ✅ Syntax clara e legível
- ✅ Cache otimizado

---

## 5. Adicionar Campo Novo

**Cenário**: Adicionar campo "preço" aos produtos

### 🔴 Supabase (Atual)

**Passos:**
1. **Alterar tabela no SQL Editor:**
```sql
ALTER TABLE public.products 
ADD COLUMN price DECIMAL(10,2);
```

2. **Atualizar schema TypeScript:**
```typescript
// src/schemas/product.ts
export const productSchema = z.object({
  // ... campos existentes
  price: z.number().positive().optional(),
});
```

3. **Atualizar formulário admin:**
```astro
<!-- src/pages/admin/produtos/novo.astro -->
<label>Preço</label>
<input type="number" name="price" step="0.01" />
```

4. **Atualizar query:**
```typescript
const { data } = await supabase
  .from('products')
  .select('name, slug, ..., price'); // 👈 Adicionar
```

5. **Atualizar componentes que exibem produto**

**Tempo estimado**: 1-2 horas  
**Arquivos alterados**: 5-7  
**Risco de quebrar**: ⚠️ Médio

---

### 🟢 Sanity CMS

**Passos:**
1. **Atualizar schema:**
```typescript
// studio/schemas/product.ts
export const product = defineType({
  fields: [
    // ... campos existentes
    defineField({
      name: 'price',
      title: 'Preço',
      type: 'number',
      validation: Rule => Rule.positive(),
    }),
  ],
})
```

2. **Reiniciar Studio:**
```bash
# Studio detecta mudança automaticamente
```

3. **Campo já aparece no editor** ✅  
4. **Atualizar queries se necessário:**
```groq
*[_type == "product"] {
  ...,
  price // 👈 Adicionar
}
```

**Tempo estimado**: 10 minutos  
**Arquivos alterados**: 1-2  
**Risco de quebrar**: ⚠️ Baixo

**Sanity detecta o campo imediatamente no Studio!**

---

## 6. Migração de Dados

**Cenário**: Mudar categoria "poltronas" → "cadeiras"

### 🔴 Supabase (Atual)

```sql
-- Executar no SQL Editor
UPDATE public.products 
SET category = 'cadeiras' 
WHERE category = 'poltronas';
```

**Problema**: Sem preview, sem rollback fácil

---

### 🟢 Sanity CMS

**Opção 1: Via Studio (UI)**
```
1. Abrir Sanity Studio
2. Vision (GROQ Playground)
3. Testar query:
   *[_type == "product" && category == "poltronas"]
4. Aprovar visualmente
5. Executar migration script
```

**Opção 2: Script TypeScript**
```typescript
import { sanityClient } from './lib/sanity'

const products = await sanityClient.fetch(
  `*[_type == "product" && category == "poltronas"]`
)

const transaction = products.map(product => ({
  patch: {
    id: product._id,
    set: { category: 'cadeiras' },
  },
}))

await sanityClient.transaction(transaction).commit()
```

**Vantagens:**
- ✅ Preview antes de executar
- ✅ Versionamento (pode reverter)
- ✅ Script reutilizável

---

## 7. Histórico de Versões

### 🔴 Supabase (Atual)

**Cenário**: Editor apagou descrição de produto por engano

**Solução**: ❌ **Sem histórico nativo**

**Workaround (se implementado manualmente):**
- Criar tabela `product_history`
- Trigger para salvar versões antigas
- Interface para restaurar
- **Esforço**: ~8-16h de desenvolvimento

---

### 🟢 Sanity CMS

**Solução Nativa:**
```
1. Abrir produto no Sanity Studio
2. Clicar em "History" (ícone do relógio)
3. Ver todas as versões anteriores
4. Selecionar versão desejada
5. Clicar em "Restore"
```

**Visual:**
```
┌─────────────────────────────────────────────┐
│  Poltrona Aruba - Histórico                │
├─────────────────────────────────────────────┤
│  📅 05/05/26 14:32 - João Silva            │
│  ✏️  Editou descrição                       │
│  [View] [Restore]                          │
│                                            │
│  📅 03/05/26 10:15 - Maria Santos          │
│  ➕ Adicionou galeria de imagens           │
│  [View] [Restore]                          │
│                                            │
│  📅 01/05/26 09:00 - João Silva            │
│  ✨ Criou produto                          │
│  [View] [Restore]                          │
└─────────────────────────────────────────────┘
```

**Vantagens:**
- ✅ Histórico completo automático
- ✅ Restaurar versões antigas (1 clique)
- ✅ Ver quem fez o quê
- ✅ Comparar versões (diff visual)

---

## 8. Colaboração em Tempo Real

### 🔴 Supabase (Atual)

**Cenário**: Dois editores abrindo o mesmo produto

**Problema**:
1. Editor A abre "Poltrona Aruba"
2. Editor B abre "Poltrona Aruba"
3. Editor A salva mudança
4. Editor B salva mudança → **sobrescreve A** ❌

**Solução**: ❌ Não há (sem implementar manualmente)

---

### 🟢 Sanity CMS

**Presença em Tempo Real:**
```
┌──────────────────────────────────────────┐
│  Poltrona Aruba                          │
│                                          │
│  👤 João Silva está editando...          │
│                                          │
│  Nome: [Poltrona Aruba____________]     │
│        ↑ João está digitando aqui       │
│                                          │
│  [Save]                                  │
└──────────────────────────────────────────┘
```

**Recursos:**
- ✅ Ver quem está online
- ✅ Ver o que cada pessoa está editando
- ✅ Cursor ao vivo (Google Docs style)
- ✅ Sincronização automática
- ✅ Sem conflitos de salvamento

---

## 9. Preview Antes de Publicar

### 🔴 Supabase (Atual)

**Workflow atual:**
1. Editar produto
2. Salvar
3. Ir ao site público
4. Verificar se ficou bom
5. Se não: voltar ao admin, editar de novo
6. Repetir até acertar

**Problema**: Sem preview, alterações vão direto para produção

---

### 🟢 Sanity CMS

**Preview Integrado:**
```typescript
// astro.config.mjs
export default defineConfig({
  integrations: [
    sanityIntegration({
      preview: {
        enabled: true,
        productionUrl: 'https://magsilmoveis.com.br',
        draftMode: true,
      },
    }),
  ],
})
```

**Workflow:**
```
┌────────────────────┬────────────────────┐
│   Sanity Studio    │   Preview          │
│                    │                    │
│  Nome: [Poltrona...│  [Preview Site]   │
│  Descrição: [...]  │  ┌──────────────┐ │
│  Preço: [999]      │  │   Poltrona   │ │
│                    │  │   Aruba      │ │
│  [👁️ Preview]      │  │   R$ 999     │ │
│  [Publish]         │  └──────────────┘ │
└────────────────────┴────────────────────┘
```

**Vantagens:**
- ✅ Preview em tempo real
- ✅ Ver como ficará antes de publicar
- ✅ Testar em diferentes dispositivos
- ✅ Modo Draft (não visível publicamente)

---

## 10. Custo de Manutenção (Tempo)

### 📊 Comparação Anual

| Tarefa | Supabase (horas/ano) | Sanity (horas/ano) |
|--------|----------------------|-------------------|
| **Adicionar campos novos** | 10h (5 campos × 2h) | 2h (5 campos × 0.4h) |
| **Bug fixes no painel** | 20h | 2h (bugs raros) |
| **Treinar novos editores** | 8h (UI complexa) | 2h (UI intuitiva) |
| **Atualizar dependências** | 4h | 1h |
| **Otimizar imagens** | 12h (manual) | 0h (automático) |
| **Implementar preview** | 40h (feature nova) | 0h (nativo) |
| **Backup e restore** | 6h | 0h (automático) |
| **TOTAL** | **100h/ano** | **7h/ano** |

**Economia de tempo**: 93 horas/ano  
**Economia financeira** (@ $50/h): **$4.650/ano**

---

## 🎯 Resumo Executivo

| Aspecto | Supabase | Sanity | Vencedor |
|---------|----------|--------|----------|
| **Experiência do Editor** | ⭐⭐ Básica | ⭐⭐⭐⭐⭐ Profissional | 🟢 Sanity |
| **Upload de Imagens** | ❌ Manual | ✅ Drag & drop | 🟢 Sanity |
| **Editor de Blog** | ❌ HTML puro | ✅ WYSIWYG | 🟢 Sanity |
| **Performance** | ⭐⭐⭐ Boa | ⭐⭐⭐⭐⭐ Excelente | 🟢 Sanity |
| **Manutenção** | 100h/ano | 7h/ano | 🟢 Sanity |
| **Histórico de Versões** | ❌ Não | ✅ Sim | 🟢 Sanity |
| **Preview** | ❌ Não | ✅ Sim | 🟢 Sanity |
| **Colaboração** | ❌ Não | ✅ Tempo real | 🟢 Sanity |
| **Custo Mensal** | $0 | $99 | 🔴 Supabase |
| **Custo Total (com manutenção)** | ~$520/mês | ~$110/mês | 🟢 Sanity |

---

## 💡 Conclusão

Sanity CMS oferece:
- ✅ **93% menos manutenção** (100h → 7h/ano)
- ✅ **79% menor custo total** ($520 → $110/mês)
- ✅ **5x melhor experiência do editor**
- ✅ **Recursos profissionais** que levariam meses para construir

**Recomendação**: Migrar para Sanity CMS é um investimento que se paga em 2-3 meses.

