import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware can't access localStorage (runs on edge).
// Auth check is done client-side in AuthGuard + context.
// Here we only handle cache headers for protected routes.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export const config = {
  matcher: ['/', '/admin/:path*', '/sales/:path*', '/kam/:path*'],
};
