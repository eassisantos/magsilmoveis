export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const code = url.searchParams.get('code');

  if (code) {
    try {
      const { createSupabaseServerClient } = await import('@lib/supabase');
      const supabase = createSupabaseServerClient(request, cookies);
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Auth callback error:', error);
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: '/admin' },
  });
};
