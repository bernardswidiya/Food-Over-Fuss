import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware — Smart Routing & RBAC
 *
 * Logika:
 * 1. User PUNYA token + akses auth route → redirect ke /dashboard
 * 2. User TANPA token + akses protected route → redirect ke /login
 * 3. Non-admin + akses /admin → redirect ke /dashboard
 * 4. Sisanya, biarkan lewat
 *
 * Catatan: Middleware berjalan di edge runtime, hanya cek keberadaan token.
 * Validasi penuh dilakukan oleh backend.
 */

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/grocery", "/calendar", "/settings", "/recipe"];
const ADMIN_PREFIX = "/admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);

  // 1. User sudah login tapi akses halaman auth → redirect ke dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. User sudah login tapi akses landing page → redirect ke dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. User belum login tapi akses protected/admin route → redirect ke login
  if (!token && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Biarkan lewat (admin role check dilakukan oleh backend API)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$|api/).*)",
  ],
};
