/**
 * Supabase server client (Server Components, Route Handlers, middleware).
 *
 * Uses @supabase/ssr with cookie-based session management so that
 * authenticated requests flow through to FastAPI with the user's JWT
 * attached.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

function requireEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url, key };
}

/**
 * Returns a Supabase client bound to the current request's cookies.
 * Safe to call from Server Components, Route Handlers, and Server
 * Actions — `cookies()` is scoped to the active request.
 */
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const { url, key } = requireEnv();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // `set` throws in Server Components; safe to ignore when
          // we only intend to *read* the session.
        }
      },
    },
  });
}

/** Server-side helper: return the current user's id or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
