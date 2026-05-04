/**
 * Script de indexação: Sanity → Algolia + Pinecone
 *
 * Uso: pnpm run index
 *
 * Este script deve ser rodado:
 * - Após migrar conteúdo para o Sanity
 * - Sempre que adicionar novos artigos em lote
 * - Pode ser agendado via Sanity webhook
 *
 * Pré-requisitos:
 *   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN
 *   ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY
 *   OPENAI_API_KEY
 *   PINECONE_API_KEY, PINECONE_INDEX
 */

import { createClient } from '@sanity/client'
import { algoliasearch } from 'algoliasearch'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// ─── Config ─────────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // read token
  useCdn: false,
})

const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_WRITE_KEY!
)

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX ?? 'magsilmoveis')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// ─── Helpers ─────────────────────────────────────────────────────────────────

function blocksToText(blocks: any[]): string {
  if (!blocks?.length) return ''
  return blocks
    .filter(b => b._type === 'block' && b.children)
    .map(b => b.children.map((c: any) => c.text ?? '').join(''))
    .join('\n\n')
}

async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limite do modelo
  })
  return response.data[0].embedding
}

/** Chunk texto em pedaços menores (para artigos longos). */
function chunkText(text: string, maxChars = 1000): string[] {
  const paragraphs = text.split('\n\n').filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + para).length > maxChars && current) {
      chunks.push(current.trim())
      current = para
    } else {
      current += (current ? '\n\n' : '') + para
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// ─── Indexar Produtos no Algolia ─────────────────────────────────────────────

async function indexProductsAlgolia() {
  console.log('\n📦 Buscando produtos do Sanity...')

  const products = await sanity.fetch(`
    *[_type == "product" && active == true] {
      _id, name, "slug": slug.current, description, category,
      materials, features, startingPrice
    }
  `)

  console.log(`   → ${products.length} produtos encontrados`)

  const records = products.map((p: any) => ({
    objectID: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    materials: p.materials ?? '',
    features: p.features ?? [],
    startingPrice: p.startingPrice ?? '',
  }))

  await algolia.saveObjects({ indexName: 'products', objects: records })
  console.log('   ✅ Produtos indexados no Algolia')
}

// ─── Indexar Blog Posts no Algolia ──────────────────────────────────────────

async function indexBlogAlgolia() {
  console.log('\n📝 Buscando posts do blog do Sanity...')

  const posts = await sanity.fetch(`
    *[_type == "blogPost" && status == "published"] {
      _id, title, "slug": slug.current, excerpt, category,
      tags, publishedAt, content
    }
  `)

  console.log(`   → ${posts.length} posts encontrados`)

  const records = posts.map((p: any) => ({
    objectID: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category ?? '',
    tags: p.tags ?? [],
    publishedAt: p.publishedAt ?? '',
    content: blocksToText(p.content ?? []).slice(0, 3000),
  }))

  await algolia.saveObjects({ indexName: 'blog_posts', objects: records })
  console.log('   ✅ Posts indexados no Algolia')
}

// ─── Indexar no Pinecone (RAG) ───────────────────────────────────────────────

async function indexBlogPinecone() {
  console.log('\n🧠 Gerando embeddings para Pinecone (RAG)...')

  const posts = await sanity.fetch(`
    *[_type == "blogPost" && status == "published"] {
      _id, title, "slug": slug.current, excerpt, category,
      tags, publishedAt, content
    }
  `)

  const products = await sanity.fetch(`
    *[_type == "product" && active == true] {
      _id, name, "slug": slug.current, description, category,
      materials, features, startingPrice
    }
  `)

  console.log(`   → ${posts.length} posts + ${products.length} produtos para vetorizar`)

  const vectors: Array<{
    id: string
    values: number[]
    metadata: Record<string, string>
  }> = []

  // Indexar posts em chunks
  for (const post of posts) {
    const fullText = `${post.title}\n\n${post.excerpt ?? ''}\n\n${blocksToText(post.content ?? [])}`
    const chunks = chunkText(fullText)

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i])
      vectors.push({
        id: `post_${post._id}_chunk_${i}`,
        values: embedding,
        metadata: {
          type: 'blog',
          title: post.title,
          slug: post.slug,
          category: post.category ?? '',
          text: chunks[i],
          url: `/blog/${post.slug}`,
        },
      })
      process.stdout.write('.')
    }
  }

  // Indexar produtos
  for (const product of products) {
    const text = [
      product.name,
      product.description,
      product.materials ?? '',
      (product.features ?? []).join(', '),
      product.category,
    ].join('\n')

    const embedding = await createEmbedding(text)
    vectors.push({
      id: `product_${product._id}`,
      values: embedding,
      metadata: {
        type: 'product',
        title: product.name,
        slug: product.slug,
        category: product.category,
        text: text.slice(0, 500),
        url: `/produtos/${product.slug}`,
      },
    })
    process.stdout.write('.')
  }

  console.log(`\n   → ${vectors.length} vetores gerados`)

  // Upsert em lotes de 100
  const batchSize = 100
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize)
    await pineconeIndex.upsert(batch)
    console.log(`   → Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)} enviado`)
  }

  console.log('   ✅ Conteúdo indexado no Pinecone')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando indexação completa...\n')
  console.log('Sanity:', process.env.SANITY_PROJECT_ID, '/', process.env.SANITY_DATASET)
  console.log('Algolia:', process.env.ALGOLIA_APP_ID)
  console.log('Pinecone:', process.env.PINECONE_INDEX ?? 'magsilmoveis')

  try {
    await indexProductsAlgolia()
    await indexBlogAlgolia()
    await indexBlogPinecone()

    console.log('\n✅ Indexação completa com sucesso!')
  } catch (error) {
    console.error('\n❌ Erro na indexação:', error)
    process.exit(1)
  }
}

main()
