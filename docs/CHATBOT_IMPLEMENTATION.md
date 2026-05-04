# Implementação Completa: Chatbot IA com RAG

**Projeto**: Magsil Móveis  
**Tecnologia**: Vercel AI SDK + OpenAI GPT-4o-mini + Pinecone  
**Funcionalidade**: Chatbot que conhece seus 1000 artigos

---

## 🎯 Arquitetura do Chatbot

```
┌──────────────────────────────────────────────────────────┐
│                     USER INPUT                           │
│  "Qual a melhor poltrona para área externa?"            │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│              EMBEDDING (OpenAI)                          │
│  Texto → Vector [0.123, -0.456, ...]                    │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│            SEARCH (Pinecone)                             │
│  Busca os 3 artigos mais relevantes                     │
│  + 2 produtos relacionados                               │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│              CONTEXTO MONTADO                            │
│  Artigo 1: "Poltronas para área externa..."            │
│  Artigo 2: "Como escolher móveis resistentes..."       │
│  Produto: Poltrona Corda Náutica Aruba                 │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│           GPT-4o-mini (OpenAI)                          │
│  System: "Você é assistente da Magsil..."              │
│  Context: [artigos + produtos]                          │
│  User: "Qual a melhor poltrona..."                     │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│              RESPOSTA STREAMING                          │
│  "Para área externa, recomendo a Poltrona Corda        │
│   Náutica Aruba. Ela é feita com materiais            │
│   resistentes a UV e intempéries. Veja mais em:       │
│   [link do produto]"                                    │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Instalação

```bash
# Dependências principais
pnpm add ai @ai-sdk/openai @pinecone-database/pinecone

# Sanity para buscar artigos
pnpm add @sanity/client groq

# UI (opcional)
pnpm add @headlessui/react framer-motion
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

```bash
# .env.local

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=magsilmoveis

# Sanity (já existente)
PUBLIC_SANITY_PROJECT_ID=...
PUBLIC_SANITY_DATASET=production
```

### 2. Adicionar ao `src/env.d.ts`

```typescript
interface ImportMetaEnv {
  // ... existentes
  readonly OPENAI_API_KEY: string;
  readonly PINECONE_API_KEY: string;
  readonly PINECONE_ENVIRONMENT: string;
  readonly PINECONE_INDEX_NAME: string;
}
```

---

## 🔧 Passo 1: Indexar Artigos no Pinecone

### Script: `scripts/index-to-pinecone.ts`

```typescript
import { Pinecone } from '@pinecone-database/pinecone'
import { createClient } from '@sanity/client'
import OpenAI from 'openai'
import { groq } from 'groq'

// Configurações
const sanity = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

// Função para gerar embedding
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // $0.02/1M tokens (barato!)
    input: text,
    dimensions: 1536, // Dimensão padrão
  })
  
  return response.data[0].embedding
}

// Chunk texto em pedaços menores (max 8k tokens)
function chunkText(text: string, maxChunkSize = 1000): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  let currentChunk: string[] = []
  
  for (const word of words) {
    currentChunk.push(word)
    if (currentChunk.length >= maxChunkSize) {
      chunks.push(currentChunk.join(' '))
      currentChunk = []
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }
  
  return chunks
}

// Indexar artigos
async function indexArticles() {
  console.log('🔍 Buscando artigos no Sanity...')
  
  const articles = await sanity.fetch(groq`
    *[_type == "blogPost" && status == "published"] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      content,
      category,
      tags,
      publishedAt
    }
  `)
  
  console.log(`📚 Encontrados ${articles.length} artigos`)
  
  for (const [idx, article] of articles.entries()) {
    console.log(`\n📝 [${idx + 1}/${articles.length}] Processando: ${article.title}`)
    
    // Extrair texto do Portable Text
    const contentText = extractTextFromPortableText(article.content)
    
    // Texto completo para embedding
    const fullText = `
      Título: ${article.title}
      Categoria: ${article.category}
      Resumo: ${article.excerpt || ''}
      Conteúdo: ${contentText}
    `.trim()
    
    // Chunk se for muito grande
    const chunks = chunkText(fullText, 1000)
    
    for (const [chunkIdx, chunk] of chunks.entries()) {
      const chunkId = chunks.length > 1 
        ? `${article._id}-chunk-${chunkIdx}`
        : article._id
      
      console.log(`  └─ Gerando embedding chunk ${chunkIdx + 1}/${chunks.length}...`)
      
      const embedding = await generateEmbedding(chunk)
      
      console.log(`  └─ Salvando no Pinecone...`)
      
      await index.upsert([{
        id: chunkId,
        values: embedding,
        metadata: {
          articleId: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || '',
          category: article.category,
          tags: article.tags || [],
          url: `/blog/${article.slug}`,
          type: 'article',
          chunkIndex: chunkIdx,
          totalChunks: chunks.length,
        },
      }])
      
      // Rate limit (3000 req/min no OpenAI)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log('\n✅ Indexação completa!')
}

// Indexar produtos também
async function indexProducts() {
  console.log('\n🛍️  Indexando produtos...')
  
  const products = await sanity.fetch(groq`
    *[_type == "product" && active == true] {
      _id,
      name,
      "slug": slug.current,
      description,
      category
    }
  `)
  
  for (const [idx, product] of products.entries()) {
    console.log(`📦 [${idx + 1}/${products.length}] ${product.name}`)
    
    const text = `
      Produto: ${product.name}
      Categoria: ${product.category}
      Descrição: ${product.description || ''}
    `.trim()
    
    const embedding = await generateEmbedding(text)
    
    await index.upsert([{
      id: product._id,
      values: embedding,
      metadata: {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category: product.category,
        url: `/produtos/${product.slug}`,
        type: 'product',
      },
    }])
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('✅ Produtos indexados!')
}

// Helper: Extrair texto de Portable Text
function extractTextFromPortableText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (block.children) {
        return block.children
          .filter((child: any) => child._type === 'span')
          .map((child: any) => child.text)
          .join(' ')
      }
      return ''
    })
    .join('\n')
}

// Executar
async function main() {
  try {
    await indexArticles()
    await indexProducts()
    console.log('\n🎉 Indexação completa! Chatbot pronto para usar.')
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

main()
```

**Executar:**
```bash
pnpm tsx scripts/index-to-pinecone.ts
```

**Tempo estimado**: ~30 minutos para 1000 artigos  
**Custo OpenAI**: ~$0.50 (embeddings são baratos!)

---

## 🤖 Passo 2: API Route do Chatbot

### `src/pages/api/chat.ts`

```typescript
export const prerender = false

import type { APIRoute } from 'astro'
import { OpenAI } from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
})

const pinecone = new Pinecone({
  apiKey: import.meta.env.PINECONE_API_KEY,
})

const index = pinecone.index(import.meta.env.PINECONE_INDEX_NAME)

// Gerar embedding da pergunta do usuário
async function generateQueryEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  
  return response.data[0].embedding
}

// Buscar contexto relevante no Pinecone
async function getRelevantContext(query: string) {
  const queryEmbedding = await generateQueryEmbedding(query)
  
  const searchResults = await index.query({
    vector: queryEmbedding,
    topK: 5, // Top 5 resultados mais relevantes
    includeMetadata: true,
  })
  
  return searchResults.matches.map(match => ({
    score: match.score,
    type: match.metadata?.type,
    title: match.metadata?.title || match.metadata?.name,
    excerpt: match.metadata?.excerpt || match.metadata?.description,
    url: match.metadata?.url,
  }))
}

// Montar prompt do sistema com contexto
function buildSystemPrompt(context: any[]): string {
  const articlesContext = context
    .filter(c => c.type === 'article')
    .map(c => `📄 Artigo: "${c.title}"\n   ${c.excerpt}\n   Link: ${c.url}`)
    .join('\n\n')
  
  const productsContext = context
    .filter(c => c.type === 'product')
    .map(c => `🛍️  Produto: "${c.title}"\n   ${c.excerpt}\n   Link: ${c.url}`)
    .join('\n\n')
  
  return `Você é um assistente virtual inteligente da Magsil Móveis, fabricante de móveis artesanais em fibra sintética e corda náutica desde 2017.

REGRAS:
1. Seja cordial, profissional e útil
2. Use as informações do contexto abaixo para responder
3. Se não souber, seja honesto e sugira falar com atendimento humano
4. Sempre inclua links relevantes quando mencionar produtos ou artigos
5. Mantenha respostas concisas (max 150 palavras)
6. Use emojis sutis para melhorar a leitura

CONTEXTO ATUAL:
${articlesContext}

${productsContext}

Se perguntarem sobre produtos não listados acima, informe que temos mais opções em nosso catálogo completo.`
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json()
    
    if (!messages || messages.length === 0) {
      return new Response('Messages required', { status: 400 })
    }
    
    // Última mensagem do usuário
    const lastMessage = messages[messages.length - 1].content
    
    console.log('🔍 Buscando contexto para:', lastMessage)
    
    // Buscar contexto relevante
    const context = await getRelevantContext(lastMessage)
    
    console.log(`📚 Encontrados ${context.length} resultados relevantes:`)
    context.forEach(c => console.log(`  - ${c.title} (score: ${c.score?.toFixed(3)})`))
    
    // Montar prompt do sistema
    const systemPrompt = buildSystemPrompt(context)
    
    // Chamar OpenAI com streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais barato e rápido
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7, // Criatividade moderada
      presence_penalty: 0.6, // Evita repetição
      frequency_penalty: 0.3,
    })
    
    // Converter para stream compatível com Vercel AI SDK
    const stream = OpenAIStream(response, {
      onStart: () => {
        console.log('▶️  Stream iniciado')
      },
      onToken: (token) => {
        // Log opcional para debug
        // process.stdout.write(token)
      },
      onCompletion: (completion) => {
        console.log('\n✅ Stream completo:', completion.length, 'chars')
      },
    })
    
    return new StreamingTextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    })
    
  } catch (error) {
    console.error('❌ Erro no chatbot:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar mensagem. Tente novamente.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
```

---

## 💬 Passo 3: Componente React do Chatbot

### `src/components/ChatbotWidget.tsx`

```tsx
'use client'

import { useChat } from 'ai/react'
import { useState, useEffect, useRef } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    error,
  } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: 'welcome',
      role: 'assistant',
      content: '👋 Olá! Sou o assistente virtual da Magsil Móveis. Como posso ajudar você hoje?',
    }],
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold hover:bg-gold-light text-anthracite rounded-full shadow-2xl flex items-center justify-center transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </motion.button>
      
      {/* Janela do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-anthracite to-anthracite-light p-4 text-offwhite">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-anthracite" />
                </div>
                <div>
                  <h3 className="font-semibold">Assistente Magsil</h3>
                  <p className="text-xs opacity-80">Powered by IA</p>
                </div>
              </div>
            </div>
            
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-offwhite">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-anthracite text-offwhite rounded-br-sm'
                        : 'bg-white text-text-primary border border-border-light rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Indicador de digitação */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-text-muted rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-text-muted rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-text-muted rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  ⚠️ Erro ao processar mensagem. Tente novamente.
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-border-light">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-full border border-border-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 bg-gold hover:bg-gold-light text-anthracite rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Enviar mensagem"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-xs text-text-muted text-center mt-2">
                Respostas geradas por IA • Powered by OpenAI
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## 🎨 Passo 4: Integrar no Site

### `src/layouts/BaseLayout.astro`

```astro
---
import { ChatbotWidget } from '@/components/ChatbotWidget'
// ... outros imports
---

<html lang="pt-BR">
  <head>
    <!-- ... -->
  </head>
  <body>
    <Header />
    
    <main>
      <slot />
    </main>
    
    <Footer />
    
    <!-- Chatbot (só carrega no cliente) -->
    <ChatbotWidget client:only="react" />
  </body>
</html>
```

---

## 📊 Monitoramento e Analytics

### Webhook para rastrear conversas

```typescript
// src/pages/api/chat-analytics.ts
export const prerender = false

import type { APIRoute } from 'astro'
import { createSupabaseAdmin } from '@/lib/supabase'

export const POST: APIRoute = async ({ request }) => {
  const { sessionId, messages, feedback } = await request.json()
  
  const supabase = createSupabaseAdmin()
  
  await supabase.from('chat_analytics').insert({
    session_id: sessionId,
    messages_count: messages.length,
    feedback,
    created_at: new Date().toISOString(),
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### Tabela Supabase

```sql
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  messages_count INT DEFAULT 0,
  feedback TEXT, -- 'helpful', 'not_helpful', null
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_chat_analytics_created_at ON chat_analytics(created_at DESC);
```

---

## 💰 Estimativa de Custos

### Cenário Conservador (1000 conversas/mês)

```
Embeddings (indexação inicial):
- 1000 artigos × 1000 palavras × 1.3 tokens/palavra = 1.3M tokens
- Custo: 1.3M × $0.02/1M = $0.026 ✅ (one-time)

Queries (conversas):
- 1000 conversas/mês
- Média 5 mensagens por conversa = 5000 queries
- Cada query: 
  - 1 embedding = ~100 tokens
  - 1 completion (GPT-4o-mini) = ~200 tokens
- Total embeddings: 5000 × 100 = 500k tokens × $0.02/1M = $0.01
- Total completions: 5000 × 200 = 1M tokens × $0.15/1M = $0.15

Pinecone:
- 100k vectors free tier = $0 ✅

TOTAL: ~$0.16/mês
```

### Cenário Otimista (10,000 conversas/mês)

```
- Embeddings: $0.10
- Completions: $1.50
- Pinecone: $70 (upgrade necessário para 10M vectors)

TOTAL: ~$71.60/mês
```

**Conclusão**: Chatbot IA é **extremamente barato** para começar!

---

## 🔒 Rate Limiting

### Proteção contra abuso

```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 mensagens por minuto
})

export async function onRequest(context, next) {
  if (context.url.pathname === '/api/chat') {
    const ip = context.request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return new Response('Rate limit exceeded', { status: 429 })
    }
  }
  
  return next()
}
```

---

## 🎯 Próximos Passos

1. **Fase 1** (Semana 1): Indexar 10 artigos de teste
2. **Fase 2** (Semana 2): Implementar UI básica
3. **Fase 3** (Semana 3): Indexar todos os 1000 artigos
4. **Fase 4** (Semana 4): Ajuste fino e monitoramento

**Chatbot funcional em 4 semanas!** 🚀

