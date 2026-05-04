// ─── GROQ Queries — fonte única de verdade para todo o fetching de dados ─────
// Importadas por src/lib/sanity.ts (wrappers legados) e diretamente nas páginas
// via loadQuery() para activar stega encoding do Visual Editing.

// ── Products ──────────────────────────────────────────────────────────────────

export const PRODUCTS_QUERY = `
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
`

export const FEATURED_PRODUCTS_QUERY = `
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
`

export const PRODUCT_BY_SLUG_QUERY = `
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
`

export const ALL_PRODUCT_SLUGS_QUERY = `
  *[_type == "product" && active == true] {
    "slug": slug.current
  }
`

// ── Blog Posts ────────────────────────────────────────────────────────────────

export const ALL_BLOG_POSTS_QUERY = `
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
`

export const LATEST_BLOG_POSTS_QUERY = `
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
`

export const BLOG_POST_BY_SLUG_QUERY = `
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
`

export const RELATED_BLOG_POSTS_QUERY = `
  *[_type == "blogPost" && status == "published" && slug.current != $slug && category == $category]
  | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    mainImage,
    category,
    publishedAt,
    readingTimeMinutes
  }
`

export const ALL_BLOG_SLUGS_QUERY = `
  *[_type == "blogPost" && status == "published"] {
    "slug": slug.current
  }
`

// ── Testimonials ──────────────────────────────────────────────────────────────

export const ACTIVE_TESTIMONIALS_QUERY = `
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
`
