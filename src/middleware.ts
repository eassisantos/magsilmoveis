import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

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

  // Controle de cache básico para evitar que vazem dados na CDN se for erro
  if (!response.headers.has('Cache-Control')) {
    // A Vercel cuida do cache no adapter estático, mas setamos um fallback
    response.headers.set('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
  }

  return response;
});
