import { defineField, defineType } from 'sanity'

export const blogPostSchema = defineType({
  name: 'blogPost',
  title: 'Post do Blog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      description: 'Exibido na listagem e nas buscas. Máx. 200 caracteres.',
      validation: Rule => Rule.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagem de Capa',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Texto alternativo', type: 'string', validation: Rule => Rule.required() }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Design', value: 'design' },
          { title: 'Cuidados & Manutenção', value: 'cuidados' },
          { title: 'Tendências', value: 'tendencias' },
          { title: 'Projetos', value: 'projetos' },
          { title: 'Materiais', value: 'materiais' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Parágrafo', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Citação', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Negrito', value: 'strong' },
              { title: 'Itálico', value: 'em' },
              { title: 'Código', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({ name: 'href', title: 'URL', type: 'url' }),
                  defineField({ name: 'blank', title: 'Abrir em nova aba', type: 'boolean' }),
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt', type: 'string' }),
            defineField({ name: 'caption', title: 'Legenda', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Publicado', value: 'published' },
          { title: 'Rascunho', value: 'draft' },
          { title: 'Agendado', value: 'scheduled' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
    }),
    defineField({
      name: 'readingTimeMinutes',
      title: 'Tempo de Leitura (min)',
      type: 'number',
      description: 'Calculado automaticamente se deixado vazio.',
      readOnly: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Título', type: 'string', validation: Rule => Rule.max(60) }),
        defineField({ name: 'metaDescription', title: 'Meta Descrição', type: 'text', rows: 2, validation: Rule => Rule.max(160) }),
        defineField({ name: 'ogImage', title: 'Imagem OG (Social)', type: 'image' }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Data de Publicação (recente)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishedAt',
      media: 'mainImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('pt-BR') : 'Sem data',
        media,
      }
    },
  },
})
