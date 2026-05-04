import { sanityClient } from 'sanity:client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import {
  PRODUCTS_QUERY,
  FEATURED_PRODUCTS_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  ALL_PRODUCT_SLUGS_QUERY,
  ALL_BLOG_POSTS_QUERY,
  LATEST_BLOG_POSTS_QUERY,
  BLOG_POST_BY_SLUG_QUERY,
  RELATED_BLOG_POSTS_QUERY,
  ALL_BLOG_SLUGS_QUERY,
  ACTIVE_TESTIMONIALS_QUERY,
} from '../sanity/lib/queries'

// ─── Re-export do client configurado via @sanity/astro (astro.config.mjs) ──
export { sanityClient }

// Guard para queries opcionais em build sem variáveis configuradas
const isSanityConfigured = !!import.meta.env.PUBLIC_SANITY_PROJECT_ID

// ─── Image URL Builder ──────────────────────────────────────────────────────
// Usa config direta (evita deprecation do default export em versões antigas do adaptador)
const builder = createImageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
})

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SanityProduct {
  _id: string
  name: string
  slug: string
  description: string
  category: string
  mainImage: SanityImageSource & { alt?: string }
  images?: Array<SanityImageSource & { alt?: string }>
  materials?: string
  features?: string[]
  startingPrice?: string
  active: boolean
  featured?: boolean
  sortOrder: number
}

export interface SanityBlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  mainImage?: SanityImageSource & { alt?: string }
  category?: string
  tags?: string[]
  content?: any[]
  status: 'published' | 'draft' | 'scheduled'
  publishedAt?: string
  readingTimeMinutes?: number
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImageSource
  }
}

export interface SanityTestimonial {
  _id: string
  name: string
  source: string
  content: string
  rating: number
  photo?: SanityImageSource
  featured?: boolean
  active: boolean
  sortOrder: number
}

// ─── Product Queries ────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<SanityProduct[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(PRODUCTS_QUERY)
}

export async function getFeaturedProducts(): Promise<SanityProduct[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(FEATURED_PRODUCTS_QUERY)
}

export async function getProductBySlug(slug: string): Promise<SanityProduct | null> {
  if (!isSanityConfigured) return null
  return sanityClient.fetch(PRODUCT_BY_SLUG_QUERY, { slug })
}

export async function getAllProductSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return []
  const results = await sanityClient.fetch<Array<{ slug: string }>>(ALL_PRODUCT_SLUGS_QUERY)
  return results.map(r => r.slug)
}

// ─── Blog Queries ────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(ALL_BLOG_POSTS_QUERY)
}

export async function getLatestBlogPosts(limit: number = 3): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(LATEST_BLOG_POSTS_QUERY, { limit })
}

export async function getBlogPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  if (!isSanityConfigured) return null
  return sanityClient.fetch(BLOG_POST_BY_SLUG_QUERY, { slug })
}

export async function getRelatedBlogPosts(slug: string, category: string, limit: number = 3): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(RELATED_BLOG_POSTS_QUERY, { slug, category, limit })
}

export async function getAllBlogSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return []
  const results = await sanityClient.fetch<Array<{ slug: string }>>(ALL_BLOG_SLUGS_QUERY)
  return results.map(r => r.slug)
}

// ─── Testimonial Queries ──────────────────────────────────────────────────────

export async function getActiveTestimonials(): Promise<SanityTestimonial[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(ACTIVE_TESTIMONIALS_QUERY)
}

// ─── Portable Text serializer (raw blocks → plain text, for RAG indexing) ────

export function blocksToPlainText(blocks: any[]): string {
  if (!blocks?.length) return ''
  return blocks
    .filter((b: any) => b._type === 'block' && b.children)
    .map((b: any) => b.children.map((c: any) => c.text ?? '').join(''))
    .join('\n\n')
}
