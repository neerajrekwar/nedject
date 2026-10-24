import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function getStoredCredentials(): { email: string; salt: string; hash: string } | null {
  // Check local file set via terminal
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading .admin-credentials.json:', e);
    }
  }

  // Fallback to environment variables if provided
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const salt = 'env_salt_default';
    const hash = hashPassword(process.env.ADMIN_PASSWORD, salt);
    return {
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      salt,
      hash,
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputPassword = body.password || '';

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const stored = getStoredCredentials();
    if (!stored) {
      return NextResponse.json(
        {
          success: false,
          error: 'No admin credentials configured. Run "node scripts/admin-auth.mjs set" in terminal to create admin account.',
        },
        { status: 403 }
      );
    }

    // Verify email matches
    if (stored.email !== inputEmail) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin email address.' },
        { status: 401 }
      );
    }

    // Verify password hash
    const testHash = hashPassword(inputPassword, stored.salt);
    if (testHash !== stored.hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password.' },
        { status: 401 }
      );
    }

    // Success response with admin user payload
    const user = {
      id: 'admin-terminal-owner',
      email: stored.email,
      name: 'Neeraj Rekwar',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      lastLogin: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      user,
    });

    // Set secure admin cookie
    response.cookies.set('nedject_admin_token', 'authorized', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
