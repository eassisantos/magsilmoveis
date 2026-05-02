import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        if (import.meta.env.DEV) {
          // If Supabase is not configured, allow access for development ONLY
          context.locals.user = { email: 'dev@magsilmoveis.com.br' };
          return next();
        } else {
          return context.redirect('/admin/login');
        }
      }

      const { createSupabaseServerClient } = await import('@lib/supabase');
      const supabase = createSupabaseServerClient(context.request, context.cookies);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return context.redirect('/admin/login');
      }

      context.locals.user = { email: user.email ?? undefined, id: user.id };
    } catch (err) {
      console.error('Middleware auth error:', err);
      return context.redirect('/admin/login');
    }
  }

  return next();
});
