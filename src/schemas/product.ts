import { z } from 'zod';

/**
 * Schema for product data from Supabase.
 */
export const productSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  category: z.enum(['poltronas', 'mesas', 'area_externa', 'banquetas', 'chaises']),
  image_url: z.url().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Product = z.infer<typeof productSchema>;

/**
 * Schema for creating/updating a product (admin).
 */
export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  category: z.enum(['poltronas', 'mesas', 'area_externa', 'banquetas', 'chaises']),
  image_url: z
    .url('URL de imagem inválida')
    .optional()
    .or(z.literal('')),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

/**
 * Category display names for the UI.
 */
export const categoryLabels: Record<Product['category'], string> = {
  poltronas: 'Poltronas & Chaises',
  mesas: 'Mesas & Cadeiras',
  area_externa: 'Área Externa',
  banquetas: 'Banquetas',
  chaises: 'Chaises',
};
