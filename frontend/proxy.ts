import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware — Smart Routing
 *
 * Logika:
 * 1. User PUNYA token + akses public route → redirect ke /dashboard
 * 2. User TANPA token + akses protected route → redirect ke /login
 * 3. Sisanya, biarkan lewat
 *
 * Catatan: Middleware Next.js berjalan di edge runtime, jadi kita hanya
 * bisa cek keberadaan token (bukan validasi JWT penuh). Validasi
 * sesungguhnya tetap dilakukan oleh backend saat API dipanggil.
 */

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/grocery", "/calendar", "/settings", "/recipe"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value
    || getTokenFromHeader(request);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 1. User sudah login tapi akses halaman auth → redirect ke dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. User sudah login tapi akses landing page → redirect ke dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. User belum login tapi akses protected route → redirect ke login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Biarkan lewat
  return NextResponse.next();
}

/**
 * Helper: Cek token dari Authorization header (untuk API calls)
 * Di Next.js middleware, kita juga bisa cek cookie yang di-set client-side.
 * Karena kita simpan di localStorage, kita perlu cara lain.
 * Solusi: set cookie juga saat login agar middleware bisa baca.
 */
function getTokenFromHeader(request: NextRequest): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return undefined;
}

export const config = {
  matcher: [
    /*
     * Match semua routes KECUALI:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$|api/).*)",
  ],
};
