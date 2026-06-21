import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware — runs before every request matched by `config.matcher`.
 * Protects /admin/dashboard: redirects to /admin/login if session cookie absent.
 * Does NOT protect API routes here (they self-check with isAdminAuthenticated()).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard the dashboard page (and any sub-paths under it)
  if (pathname.startsWith('/admin/dashboard')) {
    const session = req.cookies.get('admin_session');
    if (session?.value !== 'authenticated') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
