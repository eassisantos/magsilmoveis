import type { APIRoute } from 'astro'
import { isValidSecret } from '@sanity/preview-url-secret'
import { sanityClient } from 'sanity:client'

export const prerender = false

/**
 * Habilita o modo de rascunho (draft mode) para o Presentation Tool do Sanity.
 *
 * O Studio chama esta URL com ?sanity-preview-secret=<token-gerado>.
 * O token é validado contra o dataset via @sanity/preview-url-secret antes
 * de setar o cookie de preview — evitando CSRF e replay attacks.
 *
 * Variáveis necessárias (apenas em ambientes de preview):
 *   SANITY_API_READ_TOKEN  — viewer token do projeto Sanity
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url)
  const secret = url.searchParams.get('sanity-preview-secret')

  if (!secret) {
    return new Response('Missing preview secret', { status: 401 })
  }

  const token = import.meta.env.SANITY_API_READ_TOKEN
  if (!token) {
    return new Response(
      'SANITY_API_READ_TOKEN is required for preview mode',
      { status: 500 },
    )
  }

  // Valida o secret contra o dataset (evita forjamento de tokens)
  const clientWithToken = sanityClient.withConfig({ useCdn: false, token })
  const { isValid, redirectTo = '/' } = await isValidSecret(clientWithToken, secret)

  if (!isValid) {
    return new Response('Invalid preview secret', { status: 401 })
  }

  cookies.set('__sanity_preview', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: 60 * 60, // 1 hora
  })

  return redirect(redirectTo)
}
