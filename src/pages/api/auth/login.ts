export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // ─── CSRF: Verificar Origin header ────────────────────────────────────
    // Impede que formulários de outros sites submetam credenciais (login CSRF).
    const origin    = request.headers.get('origin') ?? '';
    const siteUrl   = import.meta.env.PUBLIC_SITE_URL ?? '';
    // Rejeita apenas quando AMBOS estão presentes e não coincidem.
    // Origin ausente é permitido (alguns browsers em navegação direta).
    if (siteUrl && origin && origin !== siteUrl) {
      return new Response(JSON.stringify({ error: 'Origem não autorizada' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const email    = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'E-mail e senha são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ─── Validação de formato e comprimento ────────────────────────────────
    // Protege contra payloads DoS (bcrypt é custoso para senhas longas) e injection.
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email) || email.length > 254 || password.length > 128) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { createSupabaseServerClient } = await import('@lib/supabase');
    const supabase = createSupabaseServerClient(request, cookies);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: '/admin' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
