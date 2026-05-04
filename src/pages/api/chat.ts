export const prerender = false;

import type { APIRoute } from 'astro';
import { streamText, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Pinecone } from '@pinecone-database/pinecone';

// ─── Rate limit simples por IP (em memória — recomendado usar Upstash em prod) ─

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;         // max requests
const RATE_WINDOW = 60_000;    // 1 minuto em ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

// ─── Respostas cacheadas para perguntas frequentes ──────────────────────────

const FAQ_CACHE: Record<string, string> = {
  'horário': 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h, e sábados das 9h às 13h.',
  'whatsapp': 'Pode nos contatar pelo WhatsApp (82) 99902-2950 ou pelo formulário de contato no site.',
  'endereço': 'Estamos localizados em Arapiraca/AL. Entre em contato para obter o endereço completo.',
  'entrega': 'Realizamos entregas para todo o Brasil. O prazo e frete variam de acordo com a região.',
  'garantia': 'Todos os nossos móveis têm garantia de 5 anos contra defeitos de fabricação.',
  'pagamento': 'Aceitamos cartão de crédito, débito, PIX e boleto bancário.',
  'personalização': 'Sim! Todos os nossos móveis podem ser personalizados em cores, tecidos e medidas.',
};

function checkFaqCache(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keyword, answer] of Object.entries(FAQ_CACHE)) {
    if (lower.includes(keyword)) return answer;
  }
  return null;
}

// ─── Busca semântica no Pinecone ─────────────────────────────────────────────

async function getRelevantContext(query: string): Promise<string> {
  const pineconeApiKey = import.meta.env.PINECONE_API_KEY;
  const pineconeIndex = import.meta.env.PINECONE_INDEX ?? 'magsilmoveis';

  if (!pineconeApiKey) return '';

  try {
    // Gerar embedding do query
    const { embed } = await import('ai');
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    // Buscar vetores similares no Pinecone
    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const index = pinecone.index(pineconeIndex);

    const results = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    if (!results.matches?.length) return '';

    // Montar contexto com os documentos mais relevantes
    const context = results.matches
      .filter(m => (m.score ?? 0) > 0.7)
      .map(m => {
        const meta = m.metadata as Record<string, string>;
        return `[${meta.type ?? 'Conteúdo'}: ${meta.title ?? ''}]\n${meta.text ?? ''}`;
      })
      .join('\n\n---\n\n');

    return context;
  } catch (err) {
    console.error('[chat] Pinecone lookup failed:', err);
    return '';
  }
}

// ─── Prompt do sistema ───────────────────────────────────────────────────────

function buildSystemPrompt(context: string): string {
  const base = `Você é o assistente virtual da Magsil Móveis, uma empresa especializada em móveis artesanais de corda náutica e fibra sintética, localizada em Arapiraca/AL.

Seu objetivo é ajudar clientes a:
- Conhecer os produtos e materiais disponíveis
- Obter informações sobre personalização, entrega e garantia
- Esclarecer dúvidas sobre cuidados com os móveis
- Direcionar para o contato humano quando necessário

Diretrizes:
- Responda sempre em português brasileiro
- Seja cordial, profissional e objetivo
- Para orçamentos específicos, direcione para o WhatsApp: (82) 99902-2950
- Não invente preços ou especificações que não esteja seguro
- Se não souber a resposta, diga que vai verificar e ofereça o contato direto
- Respostas devem ter no máximo 150 palavras (exceto quando o contexto exigir mais detalhes)`;

  if (context) {
    return `${base}

---
CONTEXTO RELEVANTE DO SITE (use para embasar suas respostas):

${context}
---`;
  }

  return base;
}

// ─── API Route ───────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  const ip = clientAddress ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Muitas requisições. Tente novamente em breve.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validar API key
  if (!import.meta.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Chatbot não configurado.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let messages: Array<{ role: string; content: string }>;
  try {
    const body = await request.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('invalid');
  } catch {
    return new Response(JSON.stringify({ error: 'Requisição inválida.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Sanitizar mensagens (max 20 por conversa, max 500 chars por mensagem)
  const sanitizedMessages = messages
    .slice(-20)
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content).slice(0, 500),
    }))
    .filter(m => m.role === 'user' || m.role === 'assistant');

  const lastUserMessage = sanitizedMessages.findLast(m => m.role === 'user')?.content ?? '';

  // Verificar FAQ cache primeiro (economia de tokens)
  const cachedAnswer = checkFaqCache(lastUserMessage);
  if (cachedAnswer) {
    const textId = crypto.randomUUID();
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: (writer) => {
          writer.write({ type: 'start' });
          writer.write({ type: 'start-step' });
          writer.write({ type: 'text-start', id: textId });
          writer.write({ type: 'text-delta', id: textId, delta: cachedAnswer });
          writer.write({ type: 'text-end', id: textId });
          writer.write({ type: 'finish-step' });
          writer.write({ type: 'finish', finishReason: 'stop' });
        },
      }),
    });
  }

  // Buscar contexto RAG
  const context = await getRelevantContext(lastUserMessage);

  // Streaming com Vercel AI SDK
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: buildSystemPrompt(context),
    messages: sanitizedMessages,
    maxTokens: 300,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
};
