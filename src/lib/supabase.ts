import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

type SerializedCookie = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Create a Supabase client for server-side operations with cookie-based auth.
 * Used in API routes, middleware, and SSR pages.
 */
export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('Cookie') ?? '';
          const parsed = parseCookieHeader(cookieHeader);
          return parsed.map((cookie: any) => ({
            name: cookie.name,
            value: cookie.value ?? ''
          }));
        },
        setAll(cookiesToSet: SerializedCookie[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, {
              ...(options as any),
              path: '/',
              httpOnly: true,
              secure: import.meta.env.PROD,
              sameSite: 'lax',
            })
          );
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client with Service Role Key.
 * Only use on the server for privileged operations (bypass RLS).
 */
export function createSupabaseAdmin() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
