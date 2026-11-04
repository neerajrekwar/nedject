import { NextRequest, NextResponse } from 'next/server';
import { verifyUserEmailCode } from '@/lib/db-users';
import { validateEmailForAuth } from '@/lib/email-security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required' },
        { status: 400 }
      );
    }

    // Verify email format and ensure no plus-sign loop
    const emailVal = validateEmailForAuth(email);
    if (!emailVal.valid) {
      return NextResponse.json(
        { success: false, error: emailVal.error },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter the full 6-digit code received in your email inbox' },
        { status: 400 }
      );
    }

    const result = await verifyUserEmailCode(emailVal.normalizedEmail, cleanCode);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Your account is now fully activated.',
      user: {
        id: result.user?._id,
        name: result.user?.name,
        email: result.user?.email,
        isEmailVerified: true,
      },
    });
  } catch (error: any) {
    console.error('[Verify Code API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}
