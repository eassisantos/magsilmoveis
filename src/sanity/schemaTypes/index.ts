import type { SchemaTypeDefinition } from 'sanity'
import { productSchema }     from './product'
import { blogPostSchema }    from './blogPost'
import { testimonialSchema } from './testimonial'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productSchema, blogPostSchema, testimonialSchema],
}
