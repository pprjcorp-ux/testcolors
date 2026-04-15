/**
 * Next.js middleware — Supabase session refresh + route protection.
 *
 * Every request to a dashboard route is gated on a valid session. The
 * middleware also rotates the Supabase access token cookies so pages
 * don't have to deal with stale sessions on soft-navigation.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/forge", "/agents"] as const;

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If envs aren't set, let the request through so local "missing env"
  // errors surface clearly in the page rather than as a 307 to /login.
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (needsAuth && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Signed-in users land on the dashboard, not the login page.
  if (path === "/login" && user) {
    const forgeUrl = request.nextUrl.clone();
    forgeUrl.pathname = "/forge";
    return NextResponse.redirect(forgeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match every path except Next internals and static assets.
     * - _next/static, _next/image, favicon.ico are framework-owned
     * - api/* is exempt so backend proxies don't double-check auth
     *   (the /api/backend/* rewrite carries the Authorization header
     *    and FastAPI validates it).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
