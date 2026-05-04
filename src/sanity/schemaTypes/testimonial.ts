import { defineField, defineType } from 'sanity'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Depoimento',
  type: 'document',

  // ─── Field Groups (Studio Excellence) ──────────────────────────────────────
  groups: [
    { name: 'content',  title: 'Conteúdo',  default: true },
    { name: 'settings', title: 'Configurações' },
  ],

  fields: [
    // ── Content group ─────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Nome do Cliente',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Depoimento',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Máx. 400 caracteres para manter boa legibilidade no site.',
      validation: Rule => Rule.required().min(20).max(400),
    }),
    defineField({
      name: 'rating',
      title: 'Avaliação (estrelas)',
      type: 'number',
      group: 'content',
      description: 'De 1 a 5 estrelas.',
      options: {
        list: [
          { title: '⭐',     value: 1 },
          { title: '⭐⭐',    value: 2 },
          { title: '⭐⭐⭐',   value: 3 },
          { title: '⭐⭐⭐⭐',  value: 4 },
          { title: '⭐⭐⭐⭐⭐', value: 5 },
        ],
        layout: 'radio',
      },
      initialValue: 5,
      validation: Rule => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'source',
      title: 'Origem',
      type: 'string',
      group: 'content',
      description: 'Plataforma de onde veio o depoimento.',
      options: {
        list: [
          { title: 'Google',    value: 'Google' },
          { title: 'Instagram', value: 'Instagram' },
          { title: 'WhatsApp',  value: 'WhatsApp' },
          { title: 'Indicação', value: 'Indicação' },
        ],
        layout: 'radio',
      },
      initialValue: 'Google',
    }),
    defineField({
      name: 'photo',
      title: 'Foto do Cliente',
      type: 'image',
      group: 'content',
      description: 'Opcional. Melhora a credibilidade quando disponível.',
      options: { hotspot: true },
    }),

    // ── Settings group ────────────────────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Destaque na Home',
      type: 'boolean',
      group: 'settings',
      description: 'Exibido na seção de depoimentos da homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      group: 'settings',
      description: 'Desative para ocultar sem excluir.',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de Exibição',
      type: 'number',
      group: 'settings',
      description: 'Menor número = aparece primeiro. Padrão: 99.',
      initialValue: 99,
      validation: Rule => Rule.integer().min(0),
    }),
  ],

  orderings: [
    {
      title: 'Ordem de Exibição',
      name: 'sortOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title:   'name',
      source:  'source',
      rating:  'rating',
      active:  'active',
      media:   'photo',
    },
    prepare({ title, source, rating, active, media }) {
      const stars = '⭐'.repeat(rating ?? 5)
      return {
        title:    `${active === false ? '⚫ ' : ''}${title}`,
        subtitle: `${stars} · via ${source ?? '—'}`,
        media,
      }
    },
  },
})
