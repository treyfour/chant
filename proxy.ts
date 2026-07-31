import { auth0 } from "./lib/auth0";

/**
 * Next.js 16 replaces `middleware.ts` with `proxy.ts`, and the handler takes a
 * standard `Request` rather than `NextRequest`. `middleware.ts` still works on
 * the Edge runtime but is deprecated for Node and will be removed.
 *
 * This is what mounts /auth/login, /auth/callback, /auth/logout and keeps
 * rolling sessions alive — the broad matcher is required, not optional.
 */
export async function proxy(request: Request) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
