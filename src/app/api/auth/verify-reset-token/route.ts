import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '@/lib/db-users';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is missing' },
        { status: 400 }
      );
    }

    const user = await verifyPasswordResetToken(token);

    if (!user) {
      return NextResponse.json({
        valid: false,
        error: 'Reset link is invalid or has expired. Please request a new one.',
      });
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error: any) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
