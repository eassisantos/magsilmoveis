import { defineField, defineType } from 'sanity'

export const productSchema = defineType({
  name: 'product',
  title: 'Produto',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome do Produto',
      type: 'string',
      validation: Rule => Rule.required().min(3).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(20),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Poltronas', value: 'poltronas' },
          { title: 'Chaises', value: 'chaises' },
          { title: 'Mesas & Cadeiras', value: 'mesas' },
          { title: 'Área Externa', value: 'area_externa' },
          { title: 'Banquetas', value: 'banquetas' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagem Principal',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          validation: Rule => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'images',
      title: 'Galeria de Imagens',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'materials',
      title: 'Materiais',
      type: 'string',
      description: 'Ex: Alumínio Naval T6 • Corda Náutica',
    }),
    defineField({
      name: 'features',
      title: 'Características',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Lista de características do produto',
    }),
    defineField({
      name: 'startingPrice',
      title: 'Preço a partir de',
      type: 'string',
      description: 'Ex: A partir de R$ 1.890',
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Destaque na Home',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de exibição',
      type: 'number',
      initialValue: 99,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Título', type: 'string' }),
        defineField({ name: 'metaDescription', title: 'Meta Descrição', type: 'text', rows: 2 }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Ordem de Exibição',
      name: 'sortOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Nome A→Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'mainImage',
    },
  },
})
