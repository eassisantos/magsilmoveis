export const prerender = false;

import type { APIRoute } from 'astro';
import { contactSchema } from '@schemas/contact';
import DOMPurify from 'isomorphic-dompurify';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      projectType: formData.get('projectType'),
      message: formData.get('message'),
    };

    // Step A: Validate with Zod
    const parsed = contactSchema.safeParse(rawData);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step B: Sanitize free-text fields with DOMPurify
    const sanitized = {
      ...parsed.data,
      name: DOMPurify.sanitize(parsed.data.name),
      message: DOMPurify.sanitize(parsed.data.message),
      phone: parsed.data.phone ? DOMPurify.sanitize(parsed.data.phone) : null,
    };

    // Step C: Insert into Supabase (only if configured)
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createSupabaseAdmin } = await import('@lib/supabase');
      const supabase = createSupabaseAdmin();
      const { error: dbError } = await supabase.from('leads').insert({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        project_type: sanitized.projectType || null,
        message: sanitized.message,
        status: 'novo',
      });
      if (dbError) {
        console.error('Supabase insert error:', dbError);
      }
    }

    // Step D: Send notification via Resend (without personal data)
    const resendKey = import.meta.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'Magsil Móveis <noreply@magsilmoveis.com.br>',
          to: ['contato@magsilmoveis.com.br'],
          subject: 'Novo lead recebido na plataforma',
          html: '<p>Um novo lead foi recebido na plataforma. Acesse o painel administrativo para verificar os detalhes.</p>',
        });
      } catch (emailError) {
        console.error('Resend error:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
