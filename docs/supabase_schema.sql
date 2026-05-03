-- Schema SQL para Magsil Móveis (Supabase)

-- Habilitar a extensão pgcrypto para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Tabela: products (Catálogo)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (qualquer um pode ler produtos ativos)
CREATE POLICY "Produtos visíveis publicamente" 
ON public.products FOR SELECT 
USING (active = true);

-- Política de leitura/escrita para administradores (requer chave Service Role ou authenticated)
CREATE POLICY "Admins podem fazer tudo em produtos" 
ON public.products 
USING (auth.role() = 'service_role'); -- backend calls only


-- ==========================================
-- 2. Tabela: blog_posts (Blog)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (apenas posts publicados)
CREATE POLICY "Posts publicados visíveis publicamente" 
ON public.blog_posts FOR SELECT 
USING (status = 'published');

-- Política de leitura/escrita para administradores
CREATE POLICY "Admins podem fazer tudo em posts" 
ON public.blog_posts 
USING (auth.role() = 'service_role');


-- ==========================================
-- 3. Triggers para updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_blog_posts_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
