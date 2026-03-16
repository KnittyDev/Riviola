import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Run intl middleware
  const response = intlMiddleware(request);

  // 2. Update supabase session (this will modify the response if needed)
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_proxy (if you use a proxy)
    // - /_static (static files)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
    // - all icons and images
    "/((?!api|_next|_proxy|_static|_vercel|favicon.ico|sitemap.xml|robots.txt|mainlogo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
