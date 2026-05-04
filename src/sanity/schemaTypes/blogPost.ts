import { defineField, defineType } from 'sanity'

export const blogPostSchema = defineType({
  name: 'blogPost',
  title: 'Post do Blog',
  type: 'document',

  // ─── Field Groups (Studio Excellence) ──────────────────────────────────────
  groups: [
    { name: 'content', title: 'Conteúdo', default: true },
    { name: 'media',   title: 'Mídia & Categorização' },
    { name: 'meta',    title: 'Publicação' },
    { name: 'seo',     title: 'SEO' },
  ],

  fields: [
    // ── Content group ─────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required().min(10).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'content',
      description: 'Gerado automaticamente a partir do título. Clique em "Gerar".',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Exibido na listagem e nos resultados de busca. Máx. 200 caracteres.',
      validation: Rule => Rule.required().max(200),
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Parágrafo',  value: 'normal' },
            { title: 'H2',         value: 'h2' },
            { title: 'H3',         value: 'h3' },
            { title: 'H4',         value: 'h4' },
            { title: 'Citação',    value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Negrito',  value: 'strong' },
              { title: 'Itálico',  value: 'em' },
              { title: 'Código',   value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({ name: 'href',  title: 'URL',               type: 'url' }),
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
            defineField({ name: 'alt',     title: 'Alt',     type: 'string' }),
            defineField({ name: 'caption', title: 'Legenda', type: 'string' }),
          ],
        },
      ],
    }),

    // ── Media group ───────────────────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Imagem de Capa',
      type: 'image',
      group: 'media',
      description: 'Proporção 16:9 recomendada (ex: 1200×630px).',
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
      name: 'category',
      title: 'Categoria',
      type: 'string',
      group: 'media',
      options: {
        list: [
          { title: 'Design',              value: 'design' },
          { title: 'Cuidados & Manutenção', value: 'cuidados' },
          { title: 'Tendências',          value: 'tendencias' },
          { title: 'Projetos',            value: 'projetos' },
          { title: 'Materiais',           value: 'materiais' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'media',
      description: 'Palavras-chave para busca e relacionamento de posts.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── Meta group ────────────────────────────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: '✅ Publicado',  value: 'published' },
          { title: '📝 Rascunho',   value: 'draft' },
          { title: '⏰ Agendado',   value: 'scheduled' },
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
      group: 'meta',
      description: 'Define a data exibida ao leitor e a ordenação no blog.',
    }),
    defineField({
      name: 'readingTimeMinutes',
      title: 'Tempo de Leitura (min)',
      type: 'number',
      group: 'meta',
      description: 'Deixe em branco para calcular automaticamente com base no conteúdo.',
      validation: Rule => Rule.integer().min(1).max(60),
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
          description: 'Máx. 60 caracteres. Se vazio, usa o título do post.',
          validation: Rule => Rule.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Descrição',
          type: 'text',
          rows: 2,
          description: 'Máx. 160 caracteres. Se vazio, usa o resumo.',
          validation: Rule => Rule.max(160),
        }),
        defineField({
          name: 'ogImage',
          title: 'Imagem OG (Social)',
          type: 'image',
          description: 'Imagem exibida ao compartilhar no WhatsApp, Instagram etc. Se vazio, usa a capa.',
        }),
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
      title:    'title',
      status:   'status',
      date:     'publishedAt',
      category: 'category',
      media:    'mainImage',
    },
    prepare({ title, status, date, category, media }) {
      const statusIcon: Record<string, string> = {
        published: '✅',
        draft:     '📝',
        scheduled: '⏰',
      }
      const categoryLabels: Record<string, string> = {
        design:    'Design',
        cuidados:  'Cuidados',
        tendencias: 'Tendências',
        projetos:  'Projetos',
        materiais: 'Materiais',
      }
      const icon = statusIcon[status] ?? '📄'
      const cat  = categoryLabels[category] ?? category ?? ''
      const dateStr = date ? new Date(date).toLocaleDateString('pt-BR') : 'Sem data'
      return {
        title: `${icon} ${title}`,
        subtitle: [cat, dateStr].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
