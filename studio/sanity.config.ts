import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'magsilmoveis',
  title: 'Magsil Móveis — CMS',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Conteúdo')
          .items([
            S.listItem()
              .title('Produtos')
              .id('product')
              .child(
                S.documentTypeList('product').title('Produtos')
              ),
            S.listItem()
              .title('Posts do Blog')
              .id('blogPost')
              .child(
                S.documentTypeList('blogPost').title('Posts do Blog')
              ),
            S.listItem()
              .title('Depoimentos')
              .id('testimonial')
              .child(
                S.documentTypeList('testimonial').title('Depoimentos')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
