import type { APIRoute } from 'astro'

export const prerender = false

/**
 * Desabilita o modo de rascunho, apagando o cookie de preview.
 * Chamado pelo botão "Exit preview" do Presentation Tool.
 */
export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('__sanity_preview', { path: '/' })
  return redirect('/')
}
