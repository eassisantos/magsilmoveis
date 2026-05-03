-- Migration 001: Adicionar campos category e tags na tabela blog_posts
-- Execute este script no SQL Editor do seu painel Supabase.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Design',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Índice para filtros rápidos por categoria
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
