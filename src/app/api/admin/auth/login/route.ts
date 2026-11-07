import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import {
  getClientIp,
  checkAdminRateLimit,
  recordFailedAdminLogin,
  clearAdminRateLimit,
  MAX_ADMIN_LOGIN_ATTEMPTS,
} from '@/lib/admin-rate-limit';
import { sendVerificationCodeEmail, isEmailConfigured } from '@/lib/email';

export const dynamic = 'force-dynamic';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

declare global {
  // eslint-disable-next-line no-var
  var _adminVerificationsMap: Map<string, { code: string; expiresAt: number }> | undefined;
}

if (!global._adminVerificationsMap) {
  global._adminVerificationsMap = new Map();
}
const memoryVerifications = global._adminVerificationsMap;

async function saveAdminVerification(email: string, code: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const expiresAtMs = Date.now() + 15 * 60 * 1000; // 15 mins
  memoryVerifications.set(normalized, { code, expiresAt: expiresAtMs });

  try {
    const db = await getDb();
    if (db) {
      await db.collection('admin_verifications').updateOne(
        { email: normalized },
        {
          $set: {
            email: normalized,
            code,
            expiresAt: new Date(expiresAtMs).toISOString(),
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }
  } catch (e) {
    console.warn('[AdminAuth] Error saving admin verification to DB:', e);
  }
}

async function verifyAdminVerification(
  email: string,
  inputCode: string
): Promise<{ valid: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const cleanCode = inputCode.trim().replace(/\D/g, '');

  let storedCode: string | null = null;
  let expiresAt: number = 0;

  // Check in-memory store
  const mem = memoryVerifications.get(normalized);
  if (mem) {
    storedCode = mem.code;
    expiresAt = mem.expiresAt;
  }

  // Check MongoDB store
  if (!storedCode) {
    try {
      const db = await getDb();
      if (db) {
        const doc = await db.collection('admin_verifications').findOne({ email: normalized });
        if (doc) {
          storedCode = doc.code;
          expiresAt = new Date(doc.expiresAt).getTime();
        }
      }
    } catch (e) {
      console.warn('[AdminAuth] Error reading admin verification from DB:', e);
    }
  }

  if (!storedCode) {
    return {
      valid: false,
      error: 'No active verification code found for this admin email. Please request a new code.',
    };
  }

  if (Date.now() > expiresAt) {
    memoryVerifications.delete(normalized);
    try {
      const db = await getDb();
      if (db) await db.collection('admin_verifications').deleteOne({ email: normalized });
    } catch {}
    return {
      valid: false,
      error: 'Verification code has expired (valid for 15 minutes). Please request a new code.',
    };
  }

  if (storedCode !== cleanCode) {
    return {
      valid: false,
      error: 'Invalid 6-digit verification code. Please check your email inbox and try again.',
    };
  }

  // Delete consumed code
  memoryVerifications.delete(normalized);
  try {
    const db = await getDb();
    if (db) await db.collection('admin_verifications').deleteOne({ email: normalized });
  } catch {}

  return { valid: true };
}

interface AdminRecord {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  salt: string;
  hash: string;
  avatar?: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

async function findAdminCredentials(targetEmail: string): Promise<AdminRecord | null> {
  const normalized = targetEmail.trim().toLowerCase();

  // 1. Primary Source of Truth: Check MongoDB collection 'admin_credentials'
  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection('admin_credentials').findOne({ email: normalized });
      if (doc && doc.hash && doc.salt) {
        return {
          id: doc._id?.toString() || 'admin-mongo-owner',
          email: doc.email.trim().toLowerCase(),
          name: doc.name || 'Neeraj Rekwar',
          role: doc.role || 'Super Admin',
          salt: doc.salt,
          hash: doc.hash,
          avatar: doc.avatar,
        };
      }
    }
  } catch (err) {
    console.warn('[AdminAuth] MongoDB admin lookup error, checking fallback store:', err);
  }

  // 2. Secondary Fallback: Check local .admin-credentials.json
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      const data = JSON.parse(raw);

      if (data && Array.isArray(data.admins)) {
        const found = data.admins.find(
          (a: any) => a.email && a.email.trim().toLowerCase() === normalized
        );
        if (found && found.hash && found.salt) {
          return {
            id: found.id || 'admin-terminal-owner',
            email: found.email.trim().toLowerCase(),
            name: found.name || 'Neeraj Rekwar',
            role: found.role || 'Super Admin',
            salt: found.salt,
            hash: found.hash,
            avatar: found.avatar,
          };
        }
      }

      // Check top-level single admin format
      if (
        data &&
        data.email &&
        data.email.trim().toLowerCase() === normalized &&
        data.hash &&
        data.salt
      ) {
        return {
          id: 'admin-terminal-owner',
          email: data.email.trim().toLowerCase(),
          name: data.name || 'Neeraj Rekwar',
          role: data.role || 'Super Admin',
          salt: data.salt,
          hash: data.hash,
          avatar: data.avatar,
        };
      }
    } catch (e) {
      console.warn('Error reading .admin-credentials.json:', e);
    }
  }

  // 3. Fallback to environment variables if provided
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const envEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (envEmail === normalized) {
      const salt = 'env_salt_default';
      const hash = hashPassword(process.env.ADMIN_PASSWORD, salt);
      return {
        id: 'admin-env-owner',
        email: envEmail,
        name: 'Neeraj Rekwar',
        role: 'Super Admin',
        salt,
        hash,
      };
    }
  }

  return null;
}

/**
 * GET: Allows the client to check the current rate limit status without consuming an attempt
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || undefined;

  const rateLimit = await checkAdminRateLimit(ip, email);

  return NextResponse.json(
    {
      success: true,
      allowed: rateLimit.allowed,
      isLocked: !rateLimit.allowed,
      totalAttempts: rateLimit.totalAttempts,
      remainingAttempts: rateLimit.remainingAttempts,
      maxAttempts: MAX_ADMIN_LOGIN_ATTEMPTS,
      windowHours: 1,
      retryAfterMinutes: rateLimit.retryAfterMinutes,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    },
    {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
        'X-RateLimit-Remaining': String(rateLimit.remainingAttempts),
      },
    }
  );
}

/**
 * POST: Authenticates admin credentials with strict 3-attempt/hour rate limiting & email verification
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json().catch(() => ({}));
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputPassword = body.password || '';
    const inputCode = body.code ? String(body.code).trim().replace(/\D/g, '') : '';
    const isVerifyStep = body.step === 'verify' || Boolean(inputCode);
    const isResendAction = body.action === 'resend_code';

    // 1. Verify Rate Limit (3 attempts per 1 hour)
    const rateLimit = await checkAdminRateLimit(ip, inputEmail);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded: Maximum ${MAX_ADMIN_LOGIN_ATTEMPTS} login attempts permitted per hour. Admin console access is locked for ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? '' : 's'}.`,
          isLocked: true,
          remainingAttempts: 0,
          retryAfterMinutes: rateLimit.retryAfterMinutes,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
            'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
            'X-RateLimit-Remaining': '0',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        }
      );
    }

    if (!inputEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin email is required.' },
        { status: 400 }
      );
    }

    const admin = await findAdminCredentials(inputEmail);
    if (!admin) {
      const updatedRate = await recordFailedAdminLogin(ip, inputEmail);
      return NextResponse.json(
        {
          success: false,
          error: `Authentication failed. No admin account configured for ${inputEmail}. (${updatedRate.remainingAttempts} attempts remaining).`,
          remainingAttempts: updatedRate.remainingAttempts,
        },
        { status: 403 }
      );
    }

    // =========================================================================
    // 2. RESEND VERIFICATION CODE ACTION
    // =========================================================================
    if (isResendAction) {
      const newCode = crypto.randomInt(100000, 999999).toString();
      await saveAdminVerification(admin.email, newCode);

      await sendVerificationCodeEmail({
        to: admin.email,
        code: newCode,
        userName: admin.name || 'Console Admin',
        appUrl: req.nextUrl.origin,
      });

      return NextResponse.json({
        success: true,
        message: `A fresh 6-digit verification code has been dispatched to ${admin.email}.`,
        devCode: !isEmailConfigured() ? newCode : undefined,
      });
    }

    // =========================================================================
    // 3. STEP 2: VERIFY 6-DIGIT EMAIL CODE
    // =========================================================================
    if (isVerifyStep) {
      if (inputCode.length !== 6) {
        return NextResponse.json(
          { success: false, error: 'Please enter the complete 6-digit verification code.' },
          { status: 400 }
        );
      }

      const verifyRes = await verifyAdminVerification(admin.email, inputCode);
      if (!verifyRes.valid) {
        const updatedRate = await recordFailedAdminLogin(ip, inputEmail);
        return NextResponse.json(
          {
            success: false,
            error: verifyRes.error || 'Invalid or expired 6-digit verification code.',
            remainingAttempts: updatedRate.remainingAttempts,
          },
          { status: 401 }
        );
      }

      // Code is valid! Clear rate limit and grant admin session
      await clearAdminRateLimit(ip, inputEmail);

      const user = {
        id: admin.id || 'admin-terminal-owner',
        email: admin.email,
        name: admin.name || 'Neeraj Rekwar',
        role: (admin.role as any) || 'Super Admin',
        avatar:
          admin.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
        lastLogin: new Date().toISOString(),
      };

      const response = NextResponse.json(
        {
          success: true,
          message: 'Admin console verified and authenticated successfully',
          token: 'authorized',
          user,
        },
        {
          headers: {
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        }
      );

      // Set secure admin cookie
      response.cookies.set('nedject_admin_token', 'authorized', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // =========================================================================
    // 4. STEP 1: VERIFY ADMIN PASSWORD & DISPATCH EMAIL VERIFICATION CODE
    // =========================================================================
    if (!inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin password is required.' },
        { status: 400 }
      );
    }

    // Verify password hash
    const testHash = hashPassword(inputPassword, admin.salt);
    if (testHash !== admin.hash) {
      const updatedRate = await recordFailedAdminLogin(ip, inputEmail);
      const isNowLocked = !updatedRate.allowed;

      if (isNowLocked) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid admin password. Maximum ${MAX_ADMIN_LOGIN_ATTEMPTS} attempts reached. Console locked for ${updatedRate.retryAfterMinutes} minutes.`,
            isLocked: true,
            remainingAttempts: 0,
            retryAfterMinutes: updatedRate.retryAfterMinutes,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Invalid admin password. Security policy: ${updatedRate.remainingAttempts} attempts remaining this hour.`,
          remainingAttempts: updatedRate.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Password verified! Generate and dispatch 6-digit code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    await saveAdminVerification(admin.email, verificationCode);

    await sendVerificationCodeEmail({
      to: admin.email,
      code: verificationCode,
      userName: admin.name || 'Console Admin',
      appUrl: req.nextUrl.origin,
    });

    return NextResponse.json({
      success: true,
      requireVerification: true,
      email: admin.email,
      message: `Credentials verified. A 6-digit confirmation code has been dispatched to ${admin.email}.`,
      devCode: !isEmailConfigured() ? verificationCode : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error during authentication' },
      {
        status: 500,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    );
  }
}

/**
 * DELETE: Resets rate-limited attempts (authorized loopback/admin only)
 */
export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req);
  const host = req.headers.get('host') || '';
  const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1');
  const hasLocalSecret = req.headers.get('x-admin-cli') === 'nedject_cli';

  if (!isLocalHost && !hasLocalSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized rate limit reset.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || undefined;

  await clearAdminRateLimit(ip, email);

  // Clear in-memory cache completely when resetting from terminal
  if (global._adminRateLimitCache) {
    if (email) {
      global._adminRateLimitCache.delete(`email:${email.toLowerCase()}`);
      global._adminRateLimitCache.delete(`ip:${ip}`);
    } else {
      global._adminRateLimitCache.clear();
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Admin rate limits reset successfully.',
  });
}

