// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';

// astro.config.mjs não tem acesso a import.meta.env → usa process.env
const sanityProjectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const sanityDataset   = process.env.PUBLIC_SANITY_DATASET   || 'production';

// https://astro.build/config
export default defineConfig({
  site: 'https://magsilmoveis.com.br',
  output: 'static',
  adapter: vercel(),

  integrations: [
    sanity({
      projectId:     sanityProjectId,
      dataset:       sanityDataset,
      useCdn:        false,          // false em build estático: garante conteúdo fresco
      apiVersion:    '2025-05-04',  // data atual → versão mais recente da API
      studioBasePath: '/studio',    // Studio embutido em /studio
      stega: {
        // Stega encoda atributos para os overlays do Visual Editing
        studioUrl: '/studio',
      },
    }),
    react(),
    sitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // O bundle do Sanity Studio é grande por design (só admins acessam /studio)
      chunkSizeWarningLimit: 1500,
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});