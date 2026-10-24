import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken, findUserByEmail } from '@/lib/db-users';
import { sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await findUserByEmail(email);

    // If user doesn't exist, we still return success to prevent email enumeration attack
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent to your inbox.',
      });
    }

    // If account was created via OAuth without a password
    if (user.provider && user.provider !== 'credentials' && !user.passwordHash) {
      return NextResponse.json({
        success: true,
        message: `This account was registered with ${user.provider.toUpperCase()} single sign-on. You can sign in directly using ${user.provider.toUpperCase()}.`,
        oauthProvider: user.provider,
      });
    }

    // Generate token
    const tokenResult = await createPasswordResetToken(email);
    if (!tokenResult) {
      return NextResponse.json(
        { success: false, error: 'Could not generate reset token. Please try again.' },
        { status: 500 }
      );
    }

    // Determine base URL
    const origin =
      req.headers.get('origin') ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000';

    const resetUrl = `${origin}/reset-password?token=${tokenResult.token}&email=${encodeURIComponent(email)}`;

    // Dispatch email
    const emailResult = await sendPasswordResetEmail({
      to: email,
      resetUrl,
      token: tokenResult.token,
      userName: user.name,
    });

    const emailReady = isEmailConfigured();

    return NextResponse.json({
      success: true,
      message: emailReady
        ? 'Password reset instructions have been sent to your email.'
        : 'Password reset link generated. (Check server logs or click preview link in dev mode).',
      emailConfigured: emailReady,
      simulated: emailResult.simulated,
      // Provide resetUrl in response if SMTP is not configured or in dev mode so the flow is immediately usable
      ...(emailResult.simulated || process.env.NODE_ENV === 'development' ? { resetUrl } : {}),
    });
  } catch (error: any) {
    console.error('Error handling forgot-password request:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
