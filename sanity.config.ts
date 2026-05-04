import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schemaTypes'
import { resolve } from './src/sanity/lib/resolve'

export default defineConfig({
  name: 'magsilmoveis',
  title: 'Magsil Móveis — CMS',

  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:   import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Conteúdo')
          .items([
            S.listItem()
              .title('🪑 Produtos')
              .id('product')
              .child(S.documentTypeList('product').title('Produtos')),
            S.listItem()
              .title('📝 Posts do Blog')
              .id('blogPost')
              .child(S.documentTypeList('blogPost').title('Posts do Blog')),
            S.listItem()
              .title('⭐ Depoimentos')
              .id('testimonial')
              .child(S.documentTypeList('testimonial').title('Depoimentos')),
          ]),
    }),

    presentationTool({
      resolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),

    visionTool(),
  ],

  schema,
})
