import { algoliasearch } from 'algoliasearch'

// ─── Clients ─────────────────────────────────────────────────────────────────

/** Read-only search client (public key — safe to expose). */
export function getSearchClient() {
  const appId = import.meta.env.PUBLIC_ALGOLIA_APP_ID
  const searchKey = import.meta.env.PUBLIC_ALGOLIA_SEARCH_KEY
  if (!appId || !searchKey) throw new Error('Algolia env vars not configured')
  return algoliasearch(appId, searchKey)
}

/** Full admin client (write key — server-side only). */
export function getAdminClient() {
  const appId = import.meta.env.PUBLIC_ALGOLIA_APP_ID
  const writeKey = import.meta.env.ALGOLIA_WRITE_KEY
  if (!appId || !writeKey) throw new Error('Algolia write env vars not configured')
  return algoliasearch(appId, writeKey)
}

export const PRODUCTS_INDEX = 'products'
export const BLOG_INDEX = 'blog_posts'

// ─── Record Types ─────────────────────────────────────────────────────────────

export interface AlgoliaProductRecord {
  objectID: string
  name: string
  slug: string
  description: string
  category: string
  materials?: string
  features?: string[]
  startingPrice?: string
  imageUrl?: string
}

export interface AlgoliaBlogRecord {
  objectID: string
  title: string
  slug: string
  excerpt: string
  category?: string
  tags?: string[]
  publishedAt?: string
  imageUrl?: string
  content?: string  // plain text for full-text search
}
