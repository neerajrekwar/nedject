import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'Nedject-super-secret-nextauth-key-2026';

/**
 * Next.js 16 Network Proxy convention (proxy.ts)
 * Replaces deprecated middleware.ts in Next.js 16+
 *
 * Responsibilities:
 * 1. Validates NextAuth JWT session tokens at the network boundary.
 * 2. Enforces authentication on /admin and /admin/* routes, redirecting unauthenticated
 *    requests to /admin/login with preserved callbackUrl parameters.
 * 3. Enforces 401 Unauthorized on protected /api/admin/* endpoints (exempting login and seed).
 * 4. Injects verified authentication context headers for downstream server components and API routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Inspect NextAuth JWT token
  let nextAuthToken: any = null;
  try {
    nextAuthToken = await getToken({
      req: request,
      secret: NEXTAUTH_SECRET,
    });
  } catch (err) {
    console.warn('[Proxy] NextAuth token verification warning:', err);
  }

  // 2. Inspect Admin Cookie set by /api/admin/auth/login
  const adminCookie = request.cookies.get('nedject_admin_token')?.value;
  const isTerminalAdmin = adminCookie === 'authorized';

  // 3. Determine Admin Status
  const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
  const isEmailAdmin = Boolean(
    envAdminEmail &&
    nextAuthToken?.email &&
    nextAuthToken.email.trim().toLowerCase() === envAdminEmail
  );
  const isRoleAdmin = Boolean(
    nextAuthToken?.role === 'admin' ||
    nextAuthToken?.role === 'Super Admin'
  );

  const isAdminAuthenticated = isTerminalAdmin || isEmailAdmin || isRoleAdmin;

  // 4. Construct enriched headers for downstream routes
  const requestHeaders = new Headers(request.headers);
  if (nextAuthToken) {
    requestHeaders.set('x-auth-user-id', String(nextAuthToken.id || nextAuthToken.sub || ''));
    requestHeaders.set('x-auth-user-email', String(nextAuthToken.email || ''));
    if (nextAuthToken.name) {
      requestHeaders.set('x-auth-user-name', encodeURIComponent(String(nextAuthToken.name)));
    }
    requestHeaders.set('x-auth-user-plan', String(nextAuthToken.plan || 'free'));
    requestHeaders.set('x-auth-authenticated', 'true');
  }

  if (isAdminAuthenticated) {
    requestHeaders.set('x-auth-is-admin', 'true');
  }

  // 5. Admin Page Routes (/admin, /admin/*)
  if (pathname.startsWith('/admin')) {
    const isLoginRoute = pathname === '/admin/login';
    const isSeedRoute = pathname === '/admin/seed';

    // If visiting the login page
    if (isLoginRoute) {
      // If already logged in, redirect directly to admin dashboard
      if (isAdminAuthenticated) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Allow seed route for initial credential setup
    if (isSeedRoute) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Protect all other admin pages: redirect unauthenticated visits to login
    if (!isAdminAuthenticated) {
      const callbackParam = encodeURIComponent(pathname + search);
      const loginUrl = new URL(`/admin/login?callbackUrl=${callbackParam}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 6. Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    // Exempt login, logout, seed routes, and public blog post reading (GET /api/admin/posts)
    if (
      pathname === '/api/admin/auth/login' ||
      pathname === '/api/admin/auth/logout' ||
      pathname === '/api/admin/seed' ||
      (pathname === '/api/admin/posts' && request.method === 'GET')
    ) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Block unauthenticated requests with 401 JSON response
    if (!isAdminAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Admin privileges required to access this endpoint.',
        },
        { status: 401 }
      );
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 7. Allow payment and tip routes to be viewed freely by all users (authenticated & guest)
  // Downstream purchase actions enforce login redirection directly on purchase attempt.
  // Pass through all other requests with decorated headers

  // 8. Pass through all other requests with decorated headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Support default export alongside named export
export default proxy;

/**
 * Configure matcher to intercept relevant paths while excluding static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, site.webmanifest
     * - Static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)$).*)',
  ],
};
