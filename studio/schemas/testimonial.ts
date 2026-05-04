import { defineField, defineType } from 'sanity'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Depoimento',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome do Cliente',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Origem',
      type: 'string',
      options: {
        list: [
          { title: 'Google', value: 'Google' },
          { title: 'Instagram', value: 'Instagram' },
          { title: 'WhatsApp', value: 'WhatsApp' },
          { title: 'Indicação', value: 'Indicação' },
        ],
        layout: 'radio',
      },
      initialValue: 'Google',
    }),
    defineField({
      name: 'content',
      title: 'Depoimento',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(20).max(400),
    }),
    defineField({
      name: 'rating',
      title: 'Avaliação (estrelas)',
      type: 'number',
      options: {
        list: [1, 2, 3, 4, 5],
      },
      initialValue: 5,
      validation: Rule => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'photo',
      title: 'Foto do Cliente (opcional)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Destaque na Home',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de Exibição',
      type: 'number',
      initialValue: 99,
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
      title: 'name',
      subtitle: 'source',
      media: 'photo',
    },
    prepare({ title, subtitle }) {
      return { title, subtitle: `via ${subtitle ?? 'desconhecido'}` }
    },
  },
})
