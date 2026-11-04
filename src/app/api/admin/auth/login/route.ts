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

export const dynamic = 'force-dynamic';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

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

  // 1. Check local .admin-credentials.json set via terminal CLI
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

  // 2. Check MongoDB collection 'admin_credentials'
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
    console.warn('MongoDB admin lookup error:', err);
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
 * POST: Authenticates admin credentials with strict 3-attempt/hour rate limiting
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json().catch(() => ({}));
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputPassword = body.password || '';

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

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        {
          status: 400,
          headers: {
            'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
            'X-RateLimit-Remaining': String(rateLimit.remainingAttempts),
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }

    const admin = await findAdminCredentials(inputEmail);

    // If admin record does not exist -> count as failed attempt
    if (!admin) {
      const updatedRate = await recordFailedAdminLogin(ip, inputEmail);
      const isNowLocked = !updatedRate.allowed;

      if (isNowLocked) {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied. You have reached the maximum ${MAX_ADMIN_LOGIN_ATTEMPTS} attempts for this hour. Access locked for ${updatedRate.retryAfterMinutes} minutes.`,
            isLocked: true,
            remainingAttempts: 0,
            retryAfterMinutes: updatedRate.retryAfterMinutes,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(updatedRate.retryAfterSeconds),
              'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
              'X-RateLimit-Remaining': '0',
              'X-Robots-Tag': 'noindex, nofollow',
            },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Authentication failed. No admin account configured for ${inputEmail}. (${updatedRate.remainingAttempts} attempt${updatedRate.remainingAttempts === 1 ? '' : 's'} remaining this hour).`,
          remainingAttempts: updatedRate.remainingAttempts,
        },
        {
          status: 403,
          headers: {
            'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
            'X-RateLimit-Remaining': String(updatedRate.remainingAttempts),
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }

    // Verify password hash
    const testHash = hashPassword(inputPassword, admin.salt);
    if (testHash !== admin.hash) {
      // Invalid password -> count as failed attempt
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
          {
            status: 429,
            headers: {
              'Retry-After': String(updatedRate.retryAfterSeconds),
              'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
              'X-RateLimit-Remaining': '0',
              'X-Robots-Tag': 'noindex, nofollow',
            },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Invalid admin password. Security policy: ${updatedRate.remainingAttempts} attempt${updatedRate.remainingAttempts === 1 ? '' : 's'} remaining this hour.`,
          remainingAttempts: updatedRate.remainingAttempts,
        },
        {
          status: 401,
          headers: {
            'X-RateLimit-Limit': String(MAX_ADMIN_LOGIN_ATTEMPTS),
            'X-RateLimit-Remaining': String(updatedRate.remainingAttempts),
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }

    // 2. Success: clear failed rate limit counters
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
        message: 'Admin authenticated successfully',
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

