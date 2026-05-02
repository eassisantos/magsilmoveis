import { z } from 'zod';

/**
 * Schema for testimonial data from Supabase.
 */
export const testimonialSchema = z.object({
  id: z.uuid(),
  client_name: z.string().min(1),
  client_role: z.string().nullable(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  created_at: z.string(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

/**
 * Schema for creating/updating a testimonial (admin).
 */
export const testimonialFormSchema = z.object({
  client_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  client_role: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(10, 'Depoimento deve ter pelo menos 10 caracteres')
    .max(1000, 'Depoimento deve ter no máximo 1000 caracteres')
    .trim(),
  rating: z.number().int().min(1).max(5).default(5),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type TestimonialFormData = z.infer<typeof testimonialFormSchema>;
