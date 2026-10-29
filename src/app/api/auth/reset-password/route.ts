import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/lib/db-users';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token?.trim();
    const password = body?.password;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reset password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
      email: result.email,
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
