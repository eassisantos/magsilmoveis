import { defineMiddleware } from 'astro:middleware';

// ─── Rate-Limit: sliding window em memória por IP ────────────────────────────
// Cada store tem sua própria janela e limite.

function makeRateLimiter(windowMs: number, max: number) {
  const store = new Map<string, number[]>();

  // Limpeza periódica para evitar memory leak em processos de longa duração
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [ip, hits] of store) {
      const fresh = hits.filter(t => t > cutoff);
      if (fresh.length === 0) store.delete(ip);
      else store.set(ip, fresh);
    }
  }, windowMs);

  return function isLimited(ip: string): boolean {
    const now  = Date.now();
    const hits = (store.get(ip) ?? []).filter(t => now - t < windowMs);
    hits.push(now);
    store.set(ip, hits);
    return hits.length > max;
  };
}

// /api/auth/login → 10 tentativas / 60 s
const isLoginRateLimited   = makeRateLimiter(60_000, 10);
// /api/contact   →  5 envios    / 60 s
const isContactRateLimited = makeRateLimiter(60_000, 5);

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // ─── Rate-limit: /api/auth/login ──────────────────────────────────────────
  if (pathname === '/api/auth/login' && context.request.method === 'POST') {
    if (isLoginRateLimited(getClientIp(context.request))) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }
  }

  // ─── Rate-limit: /api/contact ────────────────────────────────────────────
  if (pathname === '/api/contact' && context.request.method === 'POST') {
    if (isContactRateLimited(getClientIp(context.request))) {
      return new Response(
        JSON.stringify({ error: 'Muitas mensagens enviadas. Aguarde 1 minuto e tente novamente.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }
  }

  // 1. Autenticação (Apenas rotas /admin, exceto /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        if (import.meta.env.DEV) {
          context.locals.user = { email: 'dev@magsilmoveis.com.br' };
          return next();
        } else {
          return context.redirect('/admin/login');
        }
      }

      const { createSupabaseServerClient } = await import('@lib/supabase');
      const supabase = createSupabaseServerClient(context.request, context.cookies);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return context.redirect('/admin/login');
      }

      context.locals.user = { email: user.email ?? undefined, id: user.id };
    } catch (err) {
      console.error('Middleware auth error:', err);
      return context.redirect('/admin/login');
    }
  }

  // 2. Prosseguir para a resposta
  const response = await next();

  // 3. Security Headers
  // Previne clickjacking (SAMEORIGIN permite iFrames apenas do próprio domínio, importante pro Sanity Studio)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Previne MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Controla o envio do Referer header garantindo privacidade
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Força conexões HTTPS apenas (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Previne uso indevido de features do device (XSS mitigations / Device abuse)
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Previne tab-napping e ataques cross-origin via window.opener
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Previne que Flash e Acrobat carreguem conteúdo cross-domain
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // ─── Cache-Control por tipo de rota ───────────────────────────────────────
  // Rotas autenticadas e APIs nunca devem ser cacheadas (dado sensível)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  } else if (!response.headers.has('Cache-Control')) {
    // Páginas públicas estáticas: a Vercel CDN pode cachear
    response.headers.set('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
  }

  return response;
});
