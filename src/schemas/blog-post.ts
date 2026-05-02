import { z } from 'zod';

/**
 * Schema for blog post data from Supabase (admin-created posts).
 */
export const blogPostSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable(),
  content: z.string().min(1),
  cover_image: z.url().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  author: z.string().default('Magsil Móveis'),
  published: z.boolean().default(false),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

/**
 * Schema for creating/updating a blog post (admin).
 */
export const blogPostFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  slug: z
    .string()
    .min(5)
    .max(200)
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  excerpt: z
    .string()
    .max(500, 'Resumo deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(50, 'Conteúdo deve ter pelo menos 50 caracteres')
    .trim(),
  cover_image: z
    .url('URL de imagem inválida')
    .optional()
    .or(z.literal('')),
  category: z
    .string()
    .max(50)
    .trim()
    .optional()
    .or(z.literal('')),
  tags: z
    .string()
    .trim()
    .optional()
    .transform((val) => val ? val.split(',').map((t) => t.trim()).filter(Boolean) : []),
  author: z.string().default('Magsil Móveis'),
  published: z.boolean().default(false),
});

export type BlogPostFormData = z.infer<typeof blogPostFormSchema>;
