import { defineLocations } from 'sanity/presentation'
import type { PresentationPluginOptions } from 'sanity/presentation'

/**
 * resolve — Document Location Resolver para o Presentation Tool.
 *
 * Permite que editores abram diretamente a página de preview
 * a partir de qualquer documento no Studio.
 */
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    product: defineLocations({
      select: {
        title: 'name',
        slug:  'slug.current',
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title ?? 'Produto sem nome',
            href:  `/produtos/${doc?.slug ?? ''}`,
          },
          {
            title: 'Catálogo',
            href:  '/catalogo',
          },
        ],
      }),
    }),

    blogPost: defineLocations({
      select: {
        title: 'title',
        slug:  'slug.current',
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title ?? 'Post sem título',
            href:  `/blog/${doc?.slug ?? ''}`,
          },
          {
            title: 'Lista do Blog',
            href:  '/blog',
          },
        ],
      }),
    }),

    testimonial: defineLocations({
      select: {
        title: 'name',
      },
      resolve: () => ({
        locations: [
          {
            title: 'Homepage (seção de depoimentos)',
            href:  '/',
          },
        ],
      }),
    }),
  },
}
