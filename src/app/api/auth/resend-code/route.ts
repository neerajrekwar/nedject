import { NextRequest, NextResponse } from 'next/server';
import { issueAndSendVerificationCode } from '@/lib/db-users';
import { validateEmailForAuth } from '@/lib/email-security';

// In-memory rate limiting map for resending codes (e.g. 1 per 25 seconds per email)
const resendCooldownMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    const emailVal = validateEmailForAuth(email);
    if (!emailVal.valid) {
      return NextResponse.json(
        { success: false, error: emailVal.error },
        { status: 400 }
      );
    }

    const targetEmail = emailVal.normalizedEmail;

    // Rate-limiting check: 25 seconds cooldown
    const lastSent = resendCooldownMap.get(targetEmail);
    const now = Date.now();
    if (lastSent && now - lastSent < 25000) {
      const waitSeconds = Math.ceil((25000 - (now - lastSent)) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${waitSeconds}s before requesting another verification code.`,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    const result = await issueAndSendVerificationCode(targetEmail);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to dispatch verification code' },
        { status: 400 }
      );
    }

    resendCooldownMap.set(targetEmail, now);

    return NextResponse.json({
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${targetEmail}. Check your inbox or spam folder.`,
      simulatedCode: result.simulatedCode,
    });
  } catch (error: any) {
    console.error('[Resend Verification Code Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error re-issuing verification code' },
      { status: 500 }
    );
  }
}
