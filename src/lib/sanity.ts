import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// ─── Client ────────────────────────────────────────────────────────────────

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder'
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production'
const isSanityConfigured = import.meta.env.PUBLIC_SANITY_PROJECT_ID != null

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
})

// ─── Image URL Builder ──────────────────────────────────────────────────────

const builder = createImageUrlBuilder(sanityClient)

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
  return sanityClient.fetch(`
    *[_type == "product" && active == true] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      category,
      mainImage,
      images,
      materials,
      features,
      startingPrice,
      active,
      featured,
      sortOrder
    }
  `)
}

export async function getFeaturedProducts(): Promise<SanityProduct[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(`
    *[_type == "product" && active == true && featured == true] | order(sortOrder asc) [0...6] {
      _id,
      name,
      "slug": slug.current,
      description,
      category,
      mainImage,
      materials,
      features,
      startingPrice
    }
  `)
}

export async function getProductBySlug(slug: string): Promise<SanityProduct | null> {
  if (!isSanityConfigured) return null
  return sanityClient.fetch(`
    *[_type == "product" && slug.current == $slug && active == true][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      category,
      mainImage,
      images,
      materials,
      features,
      startingPrice
    }
  `, { slug })
}

export async function getAllProductSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return []
  const results = await sanityClient.fetch<Array<{ slug: string }>>(`
    *[_type == "product" && active == true] {
      "slug": slug.current
    }
  `)
  return results.map(r => r.slug)
}

// ─── Blog Queries ────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(`
    *[_type == "blogPost" && status == "published"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      category,
      tags,
      status,
      publishedAt,
      readingTimeMinutes
    }
  `)
}

export async function getLatestBlogPosts(limit: number = 3): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(`
    *[_type == "blogPost" && status == "published"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      category,
      publishedAt,
      readingTimeMinutes
    }
  `, { limit })
}

export async function getBlogPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  if (!isSanityConfigured) return null
  return sanityClient.fetch(`
    *[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      category,
      tags,
      content,
      status,
      publishedAt,
      readingTimeMinutes,
      seo
    }
  `, { slug })
}

export async function getRelatedBlogPosts(slug: string, category: string, limit: number = 3): Promise<SanityBlogPost[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(`
    *[_type == "blogPost" && status == "published" && slug.current != $slug && category == $category] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      category,
      publishedAt,
      readingTimeMinutes
    }
  `, { slug, category, limit })
}

export async function getAllBlogSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return []
  const results = await sanityClient.fetch<Array<{ slug: string }>>(`
    *[_type == "blogPost" && status == "published"] {
      "slug": slug.current
    }
  `)
  return results.map(r => r.slug)
}

// ─── Testimonial Queries ──────────────────────────────────────────────────────

export async function getActiveTestimonials(): Promise<SanityTestimonial[]> {
  if (!isSanityConfigured) return []
  return sanityClient.fetch(`
    *[_type == "testimonial" && active == true] | order(sortOrder asc) {
      _id,
      name,
      source,
      content,
      rating,
      photo,
      featured,
      sortOrder
    }
  `)
}

// ─── Portable Text serializer (raw blocks → plain text, for RAG indexing) ────

export function blocksToPlainText(blocks: any[]): string {
  if (!blocks?.length) return ''
  return blocks
    .filter((b: any) => b._type === 'block' && b.children)
    .map((b: any) => b.children.map((c: any) => c.text ?? '').join(''))
    .join('\n\n')
}
