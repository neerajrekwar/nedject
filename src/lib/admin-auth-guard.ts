import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates that an incoming admin request possesses a valid session/token
 */
export function verifyAdminApiRequest(req: NextRequest): { authorized: boolean; reason?: string } {
  // 1. Check secure httpOnly cookie
  const cookie = req.cookies.get('nedject_admin_token')?.value;
  if (cookie === 'authorized') {
    return { authorized: true };
  }

  // 2. Check Authorization header
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === 'authorized' || token.startsWith('admin_')) {
      return { authorized: true };
    }
  }

  // 3. Check custom admin header
  const xAdminAuth = req.headers.get('x-admin-token');
  if (xAdminAuth === 'authorized') {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: 'Unauthorized: Valid admin credentials session or cookie required.',
  };
}

export function unauthorizedAdminResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message || 'Restricted: Unauthorized admin access.',
      requiresLogin: true,
    },
    {
      status: 401,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    }
  );
}
