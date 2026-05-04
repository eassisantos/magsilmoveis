/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

// Declara módulos de fonte instalados que não possuem tipagens próprias

interface ImportMetaEnv {
  // Supabase (auth + leads — mantido)
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;

  // Sanity CMS (conteúdo)
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly SANITY_API_TOKEN?: string;                   // write token (indexação)
  readonly SANITY_API_READ_TOKEN?: string;              // viewer token (Visual Editing / drafts)
  readonly PUBLIC_SANITY_VISUAL_EDITING_ENABLED?: string; // 'true' em ambientes de preview
  readonly SANITY_PREVIEW_SECRET?: string;               // gerado pelo Presentation Tool (draft mode)

  // Email
  readonly RESEND_API_KEY: string;

  // Site
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_WHATSAPP_NUMBER: string;
  readonly PUBLIC_CONTACT_EMAIL: string;

  // CAPTCHA (Cloudflare Turnstile)
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;

  // Social
  readonly INSTAGRAM_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: {
      email?: string;
      id?: string;
      [key: string]: unknown;
    };
  }
}
