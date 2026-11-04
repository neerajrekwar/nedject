import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db-users';
import { validateEmailForAuth } from '@/lib/email-security';
import { sendVerificationCodeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, dob, occupation } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Strict Email Plus-Sign Alias Prevention
    const emailValidation = validateEmailForAuth(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Invalid email address provided.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = emailValidation.normalizedEmail;

    // 2. Check for duplicate account / alias
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 3. Create user in database (starts with isEmailVerified: false)
    const newUser = await createUser({
      name: name || 'Athlete User',
      email: cleanEmail,
      password,
      dob: dob || '',
      occupation: occupation || '',
      provider: 'credentials',
    });

    // 4. Dispatch 6-digit verification code email
    let simulatedCode: string | undefined;
    if (newUser.emailVerificationCode) {
      const emailResult = await sendVerificationCodeEmail({
        to: newUser.email,
        code: newUser.emailVerificationCode,
        userName: newUser.name,
      });

      if (emailResult.simulated || process.env.NODE_ENV !== 'production') {
        simulatedCode = newUser.emailVerificationCode;
      }
    }

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        message: 'Account registered. A mandatory 6-digit verification code has been dispatched to your email inbox.',
        email: newUser.email,
        simulatedCode,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          isEmailVerified: false,
          dob: newUser.dob,
          occupation: newUser.occupation,
          plan: newUser.plan,
          generationsLimit: newUser.generationsLimit,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
