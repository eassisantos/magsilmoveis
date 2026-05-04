export const prerender = false;

import type { APIRoute } from 'astro';

// GET explicitamente bloqueado: um <img src="/api/auth/logout"> forçaria logout
// de qualquer usuário que visualizasse uma página controlada pelo atacante.
export const GET: APIRoute = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { createSupabaseServerClient } = await import('@lib/supabase');
    const supabase = createSupabaseServerClient(request, cookies);
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/login',
      // Instrui o browser a limpar cache, cookies e storage ao fazer logout
      'Clear-Site-Data': '"cache", "cookies", "storage"',
    },
  });
};
