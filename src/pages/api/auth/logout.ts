export const prerender = false;

import type { APIRoute } from 'astro';

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
    headers: { Location: '/admin/login' },
  });
};
