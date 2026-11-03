import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const MAX_ADMIN_LOGIN_ATTEMPTS = 3;
export const ADMIN_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour (3600000 ms)

interface FailedAttemptRecord {
  timestamps: number[];
}

// In-memory sliding window cache for instant response & fallback
declare global {
  var _adminRateLimitCache: Map<string, FailedAttemptRecord> | undefined;
}

if (!global._adminRateLimitCache) {
  global._adminRateLimitCache = new Map<string, FailedAttemptRecord>();
}

const memoryCache = global._adminRateLimitCache;

/**
 * Extracts best guess of client IP address from Next.js request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

function cleanExpiredMemoryRecords(key: string, now: number): number[] {
  const record = memoryCache.get(key);
  if (!record) return [];
  const cutoff = now - ADMIN_RATE_LIMIT_WINDOW_MS;
  const valid = record.timestamps.filter((ts) => ts > cutoff);
  if (valid.length === 0) {
    memoryCache.delete(key);
  } else {
    memoryCache.set(key, { timestamps: valid });
  }
  return valid;
}

export interface AdminRateLimitResult {
  allowed: boolean;
  totalAttempts: number;
  remainingAttempts: number;
  retryAfterMinutes: number;
  retryAfterSeconds: number;
}

/**
 * Checks whether this IP or email is currently locked under the 3-attempt/hour policy
 */
export async function checkAdminRateLimit(
  ip: string,
  email?: string
): Promise<AdminRateLimitResult> {
  const now = Date.now();
  const cutoff = now - ADMIN_RATE_LIMIT_WINDOW_MS;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  // 1. Check in-memory timestamps
  const ipKey = `ip:${ip}`;
  const ipTimestamps = cleanExpiredMemoryRecords(ipKey, now);

  let emailTimestamps: number[] = [];
  if (normalizedEmail) {
    const emailKey = `email:${normalizedEmail}`;
    emailTimestamps = cleanExpiredMemoryRecords(emailKey, now);
  }

  // Combine unique timestamps from in-memory
  const memoryTimestamps = Array.from(new Set([...ipTimestamps, ...emailTimestamps])).sort(
    (a, b) => a - b
  );

  let dbTimestamps: number[] = [];

  // 2. Query MongoDB for persistent attempts (if available)
  try {
    const db = await getDb();
    if (db) {
      const col = db.collection('admin_login_rate_limits');

      const filter: any = {
        timestamp: { $gte: new Date(cutoff) },
        $or: [{ ip }],
      };

      if (normalizedEmail) {
        filter.$or.push({ email: normalizedEmail });
      }

      const docs = await col.find(filter).sort({ timestamp: 1 }).toArray();
      dbTimestamps = docs.map((d) => new Date(d.timestamp).getTime());
    }
  } catch (err) {
    console.warn('[AdminRateLimit] MongoDB check error (using in-memory fallback):', err);
  }

  // Merge timestamps from both memory and MongoDB
  const allTimestamps = Array.from(new Set([...memoryTimestamps, ...dbTimestamps]))
    .filter((ts) => ts > cutoff)
    .sort((a, b) => a - b);

  const totalAttempts = allTimestamps.length;

  if (totalAttempts >= MAX_ADMIN_LOGIN_ATTEMPTS) {
    // Determine when the earliest attempt will expire from the 1-hour window
    const earliestBlockingAttempt = allTimestamps[allTimestamps.length - MAX_ADMIN_LOGIN_ATTEMPTS];
    const resetTime = earliestBlockingAttempt + ADMIN_RATE_LIMIT_WINDOW_MS;
    const retryAfterMs = Math.max(1000, resetTime - now);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / 60000));

    return {
      allowed: false,
      totalAttempts,
      remainingAttempts: 0,
      retryAfterMinutes,
      retryAfterSeconds,
    };
  }

  const remainingAttempts = Math.max(0, MAX_ADMIN_LOGIN_ATTEMPTS - totalAttempts);

  return {
    allowed: true,
    totalAttempts,
    remainingAttempts,
    retryAfterMinutes: 0,
    retryAfterSeconds: 0,
  };
}

/**
 * Records a failed login attempt for the given IP and email
 */
export async function recordFailedAdminLogin(
  ip: string,
  email?: string
): Promise<AdminRateLimitResult> {
  const now = Date.now();
  const nowDate = new Date(now);
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  // 1. Record in in-memory cache
  const ipKey = `ip:${ip}`;
  const existingIp = cleanExpiredMemoryRecords(ipKey, now);
  existingIp.push(now);
  memoryCache.set(ipKey, { timestamps: existingIp });

  if (normalizedEmail) {
    const emailKey = `email:${normalizedEmail}`;
    const existingEmail = cleanExpiredMemoryRecords(emailKey, now);
    existingEmail.push(now);
    memoryCache.set(emailKey, { timestamps: existingEmail });
  }

  // 2. Persist to MongoDB collection with TTL index
  try {
    const db = await getDb();
    if (db) {
      const col = db.collection('admin_login_rate_limits');

      // Ensure TTL index exists on timestamp field (expire after 3600 seconds)
      col
        .createIndex({ timestamp: 1 }, { expireAfterSeconds: 3600, background: true })
        .catch(() => {});

      await col.insertOne({
        ip,
        email: normalizedEmail || null,
        timestamp: nowDate,
        userAgent: 'admin-auth-attempt',
      });
    }
  } catch (err) {
    console.warn('[AdminRateLimit] Failed to persist failed attempt to MongoDB:', err);
  }

  return checkAdminRateLimit(ip, email);
}

/**
 * Clears failed attempts upon a verified successful admin login
 */
export async function clearAdminRateLimit(ip: string, email?: string): Promise<void> {
  const ipKey = `ip:${ip}`;
  memoryCache.delete(ipKey);

  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  if (normalizedEmail) {
    const emailKey = `email:${normalizedEmail}`;
    memoryCache.delete(emailKey);
  }

  try {
    const db = await getDb();
    if (db) {
      const filter: any = { $or: [{ ip }] };
      if (normalizedEmail) {
        filter.$or.push({ email: normalizedEmail });
      }
      await db.collection('admin_login_rate_limits').deleteMany(filter);
    }
  } catch (err) {
    console.warn('[AdminRateLimit] Failed to clear attempts in MongoDB:', err);
  }
}
