import type { QueryParams } from 'sanity'
import { sanityClient } from 'sanity:client'

const visualEditingEnabled =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === 'true'

const token = import.meta.env.SANITY_API_READ_TOKEN

/**
 * loadQuery — wrapper centralizado para chamadas ao Sanity Client.
 *
 * Em produção: busca apenas conteúdo publicado.
 * Com Visual Editing ativo: retorna drafts + resultSourceMap para overlays.
 */
export async function loadQuery<T = unknown>({
  query,
  params,
}: {
  query: string
  params?: QueryParams
}): Promise<{ data: T; sourceMap?: unknown; perspective: string }> {
  if (visualEditingEnabled && !token) {
    throw new Error(
      'A variável SANITY_API_READ_TOKEN é obrigatória com o Visual Editing ativo.'
    )
  }

  const perspective = visualEditingEnabled ? 'drafts' : 'published'

  const { result, resultSourceMap } = await sanityClient.fetch<T>(
    query,
    params ?? {},
    {
      filterResponse: false,
      perspective,
      resultSourceMap: visualEditingEnabled ? 'withKeyArraySelector' : false,
      stega: visualEditingEnabled,
      ...(visualEditingEnabled ? { token } : {}),
    }
  )

  return { data: result, sourceMap: resultSourceMap, perspective }
}
