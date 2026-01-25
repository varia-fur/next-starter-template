import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes that don't need admin protection
  const publicRoutes = ['/scanner/setup'];

  // Check if current route is public
  const isPublic = publicRoutes.some((route) => pathname === route);

  if (isPublic) {
    return NextResponse.next();
  }

  // Routes that need admin password protection
  const protectedRoutes = [
    '/admin/create-tickets',
    '/admin/bulk-create',
    '/admin/billing',
    '/admin/company-management',
    '/admin/dashboard',
  ];

  // Check if current route needs protection
  const needsProtection = protectedRoutes.some((route) => pathname.startsWith(route));

  if (needsProtection) {
    const adminPassword = request.headers.get('x-admin-password');
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    // Allow if correct password is provided in header (from login page)
    if (adminPassword === envPassword && envPassword) {
      return NextResponse.next();
    }

    // Check if already authenticated via cookie
    const authCookie = request.cookies.get('admin-auth');
    if (authCookie?.value === envPassword && envPassword) {
      return NextResponse.next();
    }

    // If not authenticated and not the login page, redirect to login
    if (!pathname.includes('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/scanner/activation/:path*', '/scanner/validation/:path*'],
};
