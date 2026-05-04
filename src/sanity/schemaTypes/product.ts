import { defineField, defineType } from 'sanity'

export const productSchema = defineType({
  name: 'product',
  title: 'Produto',
  type: 'document',

  // ─── Field Groups (Studio Excellence) ──────────────────────────────────────
  groups: [
    { name: 'info',    title: 'Informações Básicas', default: true },
    { name: 'media',   title: 'Mídia' },
    { name: 'details', title: 'Detalhes & Venda' },
    { name: 'seo',     title: 'SEO' },
  ],

  fields: [
    // ── Info group ────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Nome do Produto',
      type: 'string',
      group: 'info',
      validation: Rule => Rule.required().min(3).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'info',
      description: 'Gerado automaticamente a partir do nome. Clique em "Gerar".',
      options: { source: 'name', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'text',
      rows: 4,
      group: 'info',
      description: 'Aparece na página do produto e no catálogo.',
      validation: Rule => Rule.required().min(20),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      group: 'info',
      options: {
        list: [
          { title: 'Poltronas',        value: 'poltronas' },
          { title: 'Chaises',          value: 'chaises' },
          { title: 'Mesas & Cadeiras', value: 'mesas' },
          { title: 'Área Externa',     value: 'area_externa' },
          { title: 'Banquetas',        value: 'banquetas' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),

    // ── Media group ───────────────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Imagem Principal',
      type: 'image',
      group: 'media',
      description: 'Proporção 4:3 recomendada. Usada no catálogo e redes sociais.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Descrição da imagem para acessibilidade e SEO.',
          validation: Rule => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'images',
      title: 'Galeria de Imagens',
      type: 'array',
      group: 'media',
      description: 'Imagens adicionais para o carrossel na página do produto.',
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

    // ── Details group ─────────────────────────────────────────────────────────
    defineField({
      name: 'materials',
      title: 'Materiais',
      type: 'string',
      group: 'details',
      description: 'Ex: Alumínio Naval T6 • Corda Náutica',
    }),
    defineField({
      name: 'features',
      title: 'Características',
      type: 'array',
      group: 'details',
      description: 'Lista de diferenciais exibidos na página do produto.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'startingPrice',
      title: 'Preço a partir de',
      type: 'string',
      group: 'details',
      description: 'Ex: A partir de R$ 1.890',
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      group: 'details',
      description: 'Desative para ocultar o produto sem excluí-lo.',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Destaque na Home',
      type: 'boolean',
      group: 'details',
      description: 'Exibido na seção "Produtos em Destaque" da homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de exibição',
      type: 'number',
      group: 'details',
      description: 'Menor número = aparece primeiro. Padrão: 99.',
      initialValue: 99,
      validation: Rule => Rule.integer().min(0),
    }),

    // ── SEO group ─────────────────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Título',
          type: 'string',
          description: 'Máx. 60 caracteres. Se vazio, usa o nome do produto.',
          validation: Rule => Rule.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Descrição',
          type: 'text',
          rows: 2,
          description: 'Máx. 160 caracteres. Se vazio, usa a descrição.',
          validation: Rule => Rule.max(160),
        }),
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
      title:    'name',
      subtitle: 'category',
      active:   'active',
      media:    'mainImage',
    },
    prepare({ title, subtitle, active, media }) {
      const labels: Record<string, string> = {
        poltronas:    'Poltronas',
        chaises:      'Chaises',
        mesas:        'Mesas & Cadeiras',
        area_externa: 'Área Externa',
        banquetas:    'Banquetas',
      }
      return {
        title: `${active === false ? '⚫ ' : ''}${title}`,
        subtitle: labels[subtitle] ?? subtitle,
        media,
      }
    },
  },
})
