export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const code = url.searchParams.get('code');

  // Sem código → nada a processar, redireciona sem executar lógica de auth
  if (!code) {
    return new Response(null, { status: 302, headers: { Location: '/admin/login' } });
  }

  // O código de autorização deve ser uma string alfanumérica curta.
  // Qualquer outro formato é suspeito (injeção, replay, etc).
  if (!/^[a-zA-Z0-9_\-]{10,512}$/.test(code)) {
    return new Response('Invalid authorization code format', { status: 400 });
  }

  try {
    const { createSupabaseServerClient } = await import('@lib/supabase');
    const supabase = createSupabaseServerClient(request, cookies);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback exchange error:', error.message);
      return new Response(null, { status: 302, headers: { Location: '/admin/login?error=callback' } });
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    return new Response(null, { status: 302, headers: { Location: '/admin/login?error=callback' } });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: '/admin' },
  });
};
