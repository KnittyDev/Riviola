import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Run intl middleware first
  const response = intlMiddleware(request);

  // 2. Setup Supabase for role and maintenance check
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 3. Maintenance Mode Logic
  try {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("maintenance_mode")
      .limit(1)
      .maybeSingle();

    if (settings?.maintenance_mode) {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      let isAdmin = false;
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        isAdmin = profile?.role?.toLowerCase() === "admin";
      }

      // If NOT admin, redirect to maintenance page
      const pathname = request.nextUrl.pathname;
      const isMaintenancePage = pathname.includes("/maintenance");
      const isLoginPage = pathname.includes("/login");

      if (!isAdmin && !isMaintenancePage && !isLoginPage) {
        const locale = pathname.split('/')[1] || 'en';
        const maintenanceUrl = new URL(`/${locale}/maintenance`, request.url);
        return NextResponse.redirect(maintenanceUrl);
      }
    }
  } catch (err) {
    console.error("Middleware maintenance check failed:", err);
  }

  // 4. Update supabase session
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    "/((?!api|_next|_proxy|_static|_vercel|favicon.ico|sitemap.xml|robots.txt|mainlogo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
