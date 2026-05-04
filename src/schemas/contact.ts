import { z } from 'zod';

/**
 * Schema for the public contact form submission.
 * Validates all fields before sanitization and database insertion.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres')
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  projectType: z
    .enum(['residencial', 'comercial', 'corporativo', 'arquitetura', 'outro'])
    .optional(),
  message: z
    .string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres')
    .trim(),
  turnstileToken: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
