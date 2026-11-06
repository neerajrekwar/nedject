import crypto from 'crypto';
import { getDb } from './mongodb';
import { findUserByEmail, findUserById } from './db-users';
import { getAllPlans, ManagedPlan } from './plans-db';

export interface ApiKey {
  _id?: string;
  keyId: string;
  userId: string;
  userEmail: string;
  name: string;
  keyPrefix: string;
  keyHash: string; // SHA-256 hash of secret key
  allowedOrigins: string[]; // Whitelist of network origins e.g. ["https://myapp.com", "http://localhost:3000"]
  rateLimitRpm: number;
  status: 'active' | 'suspended' | 'revoked';
  totalRequests: number;
  threatCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ThreatType =
  | 'NONE'
  | 'ORIGIN_FORBIDDEN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CREDITS_EXHAUSTED'
  | 'INVALID_KEY'
  | 'KEY_SUSPENDED'
  | 'KEY_REVOKED'
  | 'EMERGENCY_ROTATION'
  | 'GLOBAL_OUTAGE_LOCKDOWN';

export interface ApiLog {
  _id?: string;
  logId: string;
  keyId?: string;
  keyPrefix?: string;
  userId?: string;
  userEmail?: string;
  origin: string;
  ip: string;
  method: string;
  endpoint: string;
  status: number;
  threatType: ThreatType;
  threatMessage?: string;
  creditsDeducted: number;
  latencyMs: number;
  timestamp: string;
}

// In-memory fallback stores
const memoryKeys = new Map<string, ApiKey>();
const memoryLogs: ApiLog[] = [];
// Sliding window rate limiter state: keyId -> timestamp array
const rateLimitWindows = new Map<string, number[]>();

/**
 * Normalizes an origin or URL to standard scheme + hostname + port (no trailing slashes, lowercased)
 */
export function normalizeOrigin(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed === '*') return '*';

  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, '');
  }
}

/**
 * Validates whether an incoming request Origin / Referer matches the key's allowed origins whitelist
 */
export function isOriginAllowed(requestOrigin: string | null, allowedOrigins: string[]): boolean {
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return false;
  }

  // Check for universal wildcard
  if (allowedOrigins.includes('*')) {
    return true;
  }

  if (!requestOrigin) {
    // If no origin or referer header sent:
    // Allow only if user explicitly added '*' or 'direct' (e.g. backend curl/server-to-server)
    return allowedOrigins.includes('direct') || allowedOrigins.includes('*');
  }

  const normalizedIncoming = normalizeOrigin(requestOrigin);

  for (const allowed of allowedOrigins) {
    if (allowed === '*') return true;
    const normalizedAllowed = normalizeOrigin(allowed);

    // Exact match
    if (normalizedIncoming === normalizedAllowed) {
      return true;
    }

    // Subdomain wildcard matching: https://*.example.com
    try {
      if (normalizedAllowed.includes('*.')) {
        const allowedUrl = new URL(normalizedAllowed.replace('*.', 'wildcard.'));
        const incomingUrl = new URL(normalizedIncoming);

        if (allowedUrl.protocol === incomingUrl.protocol) {
          const allowedBaseDomain = allowedUrl.hostname.replace('wildcard.', '');
          if (
            incomingUrl.hostname === allowedBaseDomain ||
            incomingUrl.hostname.endsWith(`.${allowedBaseDomain}`)
          ) {
            return true;
          }
        }
      }
    } catch {}
  }

  return false;
}

/**
 * Rate Limiter: Checks if the API key has exceeded its RPM (requests per minute) sliding window
 */
export function checkRateLimit(keyId: string, limitRpm: number): { allowed: boolean; remainingRpm: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 60 seconds
  const cutoff = now - windowMs;

  // Memory leak prevention: Periodic cleanup of expired rate limit windows
  if (rateLimitWindows.size > 1000) {
    for (const [id, times] of rateLimitWindows.entries()) {
      const valid = times.filter((t) => t > cutoff);
      if (valid.length === 0) {
        rateLimitWindows.delete(id);
      } else {
        rateLimitWindows.set(id, valid);
      }
    }
  }

  const timestamps = (rateLimitWindows.get(keyId) || []).filter((t) => t > cutoff);
  timestamps.push(now);
  rateLimitWindows.set(keyId, timestamps);

  const used = timestamps.length;
  const remaining = Math.max(0, limitRpm - used);

  return {
    allowed: used <= limitRpm,
    remainingRpm: remaining,
  };
}

/**
 * Generates SHA-256 hash of secret API key
 */
export function hashApiKey(secretKey: string): string {
  return crypto.createHash('sha256').update(secretKey.trim()).digest('hex');
}

/**
 * Creates a brand new API key with origin network whitelist and rate limits
 */
export async function createApiKey(params: {
  userId: string;
  userEmail: string;
  name: string;
  allowedOrigins: string[];
}): Promise<{ key: ApiKey; rawSecretKey: string }> {
  const { userId, userEmail, name, allowedOrigins } = params;

  // Resolve user plan to determine rateLimitRpm and allowedOriginsLimit
  let planId = 'free';
  const user = (await findByIdOrEmail(userId, userEmail));
  if (user) {
    planId = user.plan || 'free';
  }

  const allPlans = await getAllPlans();
  const matchedPlan = allPlans.find((p) => p.id === planId) || allPlans[0];

  const maxOrigins = matchedPlan.allowedOriginsLimit || 5;
  const rateLimitRpm = matchedPlan.rateLimitRpm || 60;

  // Sanitize and limit origins
  const sanitizedOrigins = Array.from(
    new Set(
      (allowedOrigins || [])
        .map(normalizeOrigin)
        .filter((o) => o && o.length > 2)
    )
  ).slice(0, maxOrigins);

  // If no origin provided, default to localhost for testing or '*'
  if (sanitizedOrigins.length === 0) {
    sanitizedOrigins.push('http://localhost:3000');
  }

  // Generate 48-char random hex secret
  const rawEntropy = crypto.randomBytes(24).toString('hex');
  const rawSecretKey = `ndj_live_${rawEntropy}`;
  const keyHash = hashApiKey(rawSecretKey);
  const keyPrefix = `ndj_live_${rawEntropy.slice(0, 4)}••••${rawEntropy.slice(-4)}`;
  const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();

  const newKey: ApiKey = {
    keyId,
    userId,
    userEmail: userEmail.toLowerCase().trim(),
    name: name.trim() || 'Production Gateway Key',
    keyPrefix,
    keyHash,
    allowedOrigins: sanitizedOrigins,
    rateLimitRpm,
    status: 'active',
    totalRequests: 0,
    threatCount: 0,
    lastUsedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (db) {
    try {
      const doc = { ...newKey };
      const res = await db.collection('api_keys').insertOne(doc as any);
      newKey._id = res.insertedId.toString();
    } catch (err) {
      console.warn('[ApiKeys] Failed inserting into MongoDB, using memory fallback:', err);
    }
  }

  memoryKeys.set(keyHash, newKey);

  return {
    key: newKey,
    rawSecretKey, // Raw key returned ONCE for secure revelation
  };
}

/**
 * List API keys for a specific user (omits secret keyHash)
 */
export async function listUserApiKeys(userId: string, userEmail?: string): Promise<Omit<ApiKey, 'keyHash'>[]> {
  const db = await getDb();
  const emailNorm = (userEmail || '').toLowerCase().trim();

  if (db) {
    try {
      const docs = await db
        .collection<ApiKey>('api_keys')
        .find({
          $or: [{ userId }, { userEmail: emailNorm }],
        })
        .sort({ createdAt: -1 })
        .toArray();

      if (docs && docs.length > 0) {
        return docs.map((d) => {
          const { keyHash, ...safe } = d;
          return { ...safe, _id: d._id?.toString() };
        });
      }
    } catch (err) {
      console.warn('[ApiKeys] Error fetching user keys from MongoDB:', err);
    }
  }

  // Memory fallback
  const userKeys: Omit<ApiKey, 'keyHash'>[] = [];
  for (const k of memoryKeys.values()) {
    if (k.userId === userId || (emailNorm && k.userEmail === emailNorm)) {
      const { keyHash, ...safe } = k;
      userKeys.push(safe);
    }
  }
  return userKeys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Revoke an API Key
 */
export async function revokeApiKey(keyId: string, userId?: string, isAdmin: boolean = false): Promise<boolean> {
  const db = await getDb();
  const now = new Date().toISOString();

  const query: any = { keyId };
  if (!isAdmin && userId) {
    query.userId = userId;
  }

  if (db) {
    try {
      const res = await db.collection('api_keys').updateOne(query, {
        $set: { status: 'revoked', updatedAt: now },
      });
      if (res.modifiedCount > 0) {
        // Also update memory
        for (const k of memoryKeys.values()) {
          if (k.keyId === keyId) {
            k.status = 'revoked';
            k.updatedAt = now;
          }
        }
        return true;
      }
    } catch (err) {
      console.warn('[ApiKeys] Failed to revoke key in MongoDB:', err);
    }
  }

  // Memory fallback
  for (const k of memoryKeys.values()) {
    if (k.keyId === keyId && (isAdmin || k.userId === userId)) {
      k.status = 'revoked';
      k.updatedAt = now;
      return true;
    }
  }

  return false;
}

/**
 * Rotates an API Key: Revokes the compromised/existing key and generates a fresh replacement
 * with identical settings (name, allowed origins, rate limit). Used for routine security rotation
 * or immediately mitigating a global outage / token leak.
 */
export async function rotateApiKey(
  keyId: string,
  userId?: string,
  isAdmin: boolean = false,
  reason: string = 'Security rotation / global outage mitigation'
): Promise<{ oldKey: ApiKey; newKey: ApiKey; rawSecretKey: string } | null> {
  const db = await getDb();
  let oldKey: ApiKey | null = null;

  if (db) {
    try {
      const query: any = { keyId };
      if (!isAdmin && userId) {
        query.userId = userId;
      }
      const found = await db.collection<ApiKey>('api_keys').findOne(query);
      if (found) {
        oldKey = { ...found, _id: found._id?.toString() };
      }
    } catch (err) {
      console.warn('[ApiKeys] Error finding key to rotate in MongoDB:', err);
    }
  }

  if (!oldKey) {
    for (const k of memoryKeys.values()) {
      if (k.keyId === keyId && (isAdmin || k.userId === userId)) {
        oldKey = k;
        break;
      }
    }
  }

  if (!oldKey || oldKey.status === 'revoked') {
    return null;
  }

  // 1. Revoke the existing key
  await revokeApiKey(oldKey.keyId, userId, isAdmin);

  // 2. Generate a new cryptographically secure replacement key
  const rawEntropy = crypto.randomBytes(24).toString('hex');
  const rawSecretKey = `ndj_live_${rawEntropy}`;
  const keyHash = hashApiKey(rawSecretKey);
  const keyPrefix = `ndj_live_${rawEntropy.slice(0, 4)}••••${rawEntropy.slice(-4)}`;
  const newKeyId = `key_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();

  const newKey: ApiKey = {
    keyId: newKeyId,
    userId: oldKey.userId,
    userEmail: oldKey.userEmail,
    name: oldKey.name.includes('(Rotated)') ? oldKey.name : `${oldKey.name} (Rotated)`,
    keyPrefix,
    keyHash,
    allowedOrigins: [...oldKey.allowedOrigins],
    rateLimitRpm: oldKey.rateLimitRpm,
    status: 'active',
    totalRequests: 0,
    threatCount: 0,
    lastUsedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    try {
      const doc = { ...newKey };
      const res = await db.collection('api_keys').insertOne(doc as any);
      newKey._id = res.insertedId.toString();
    } catch (err) {
      console.warn('[ApiKeys] Failed to insert rotated key in MongoDB:', err);
    }
  }

  memoryKeys.set(keyHash, newKey);

  // 3. Record security rotation event log
  await recordApiLog({
    keyId: newKey.keyId,
    keyPrefix: newKey.keyPrefix,
    userId: newKey.userId,
    userEmail: newKey.userEmail,
    origin: oldKey.allowedOrigins[0] || 'localhost',
    ip: '127.0.0.1',
    method: 'ROTATE',
    endpoint: '/api/v1/rotate',
    status: 200,
    threatType: 'EMERGENCY_ROTATION',
    threatMessage: `API Key rotated (${oldKey.keyPrefix} -> ${newKey.keyPrefix}). Reason: ${reason}`,
    creditsDeducted: 0,
    latencyMs: 1,
  });

  return {
    oldKey,
    newKey,
    rawSecretKey,
  };
}

/**
 * Emergency: Rotates all active keys for a specific user during an account compromise
 */
export async function rotateAllUserKeys(
  userId: string,
  userEmail?: string,
  reason: string = 'User requested emergency key rotation'
): Promise<{ rotated: number }> {
  const keys = await listUserApiKeys(userId, userEmail);
  const activeKeys = keys.filter((k) => k.status === 'active');
  let rotated = 0;

  for (const k of activeKeys) {
    const res = await rotateApiKey(k.keyId, userId, false, reason);
    if (res) rotated++;
  }

  return { rotated };
}

/**
 * Global Outage Emergency Protocol:
 * When a major infrastructure breach or network-wide threat occurs, administrators can trigger
 * an emergency global invalidation/rotation of all active keys to secure optical gateways.
 */
export async function globalEmergencyRotateAllKeys(
  adminEmail: string = 'admin@nedject.internal',
  reason: string = 'Global outage security lockdown'
): Promise<{ totalRotated: number; totalSuspended: number }> {
  const db = await getDb();
  const now = new Date().toISOString();
  let totalRotated = 0;
  let totalSuspended = 0;

  if (db) {
    try {
      const activeKeys = await db.collection<ApiKey>('api_keys').find({ status: 'active' }).toArray();
      for (const k of activeKeys) {
        // Suspend/Rotate active keys
        await db.collection('api_keys').updateOne(
          { keyId: k.keyId },
          { $set: { status: 'suspended', updatedAt: now } }
        );
        totalSuspended++;
      }
    } catch (err) {
      console.warn('[ApiKeys] Global emergency rotation MongoDB error:', err);
    }
  }

  for (const k of memoryKeys.values()) {
    if (k.status === 'active') {
      k.status = 'suspended';
      k.updatedAt = now;
      totalSuspended++;
    }
  }

  // Record audit threat event
  await recordApiLog({
    origin: 'GLOBAL_DEFENSE',
    ip: '127.0.0.1',
    method: 'EMERGENCY_GLOBAL_LOCKDOWN',
    endpoint: '/admin/adm/apies',
    status: 403,
    threatType: 'GLOBAL_OUTAGE_LOCKDOWN',
    threatMessage: `Global Outage Emergency Lockdown triggered by ${adminEmail}. ${totalSuspended} active keys suspended/rotated. Reason: ${reason}`,
    creditsDeducted: 0,
    latencyMs: 1,
  });

  return { totalRotated, totalSuspended };
}

/**
 * Updates allowed origins for an API key
 */
export async function updateApiKeyOrigins(
  keyId: string,
  allowedOrigins: string[],
  userId?: string,
  isAdmin: boolean = false
): Promise<boolean> {
  const db = await getDb();
  const now = new Date().toISOString();
  const sanitized = Array.from(new Set(allowedOrigins.map(normalizeOrigin).filter(Boolean)));

  const query: any = { keyId };
  if (!isAdmin && userId) {
    query.userId = userId;
  }

  if (db) {
    try {
      const res = await db.collection('api_keys').updateOne(query, {
        $set: { allowedOrigins: sanitized, updatedAt: now },
      });
      if (res.modifiedCount > 0) {
        for (const k of memoryKeys.values()) {
          if (k.keyId === keyId) {
            k.allowedOrigins = sanitized;
            k.updatedAt = now;
          }
        }
        return true;
      }
    } catch (err) {
      console.warn('[ApiKeys] Failed to update origins in MongoDB:', err);
    }
  }

  for (const k of memoryKeys.values()) {
    if (k.keyId === keyId && (isAdmin || k.userId === userId)) {
      k.allowedOrigins = sanitized;
      k.updatedAt = now;
      return true;
    }
  }
  return false;
}

/**
 * Updates API key status (active / suspended / revoked)
 */
export async function updateApiKeyStatus(
  keyId: string,
  status: 'active' | 'suspended' | 'revoked',
  isAdmin: boolean = false
): Promise<boolean> {
  const db = await getDb();
  const now = new Date().toISOString();

  if (db) {
    try {
      const res = await db.collection('api_keys').updateOne(
        { keyId },
        { $set: { status, updatedAt: now } }
      );
      if (res.modifiedCount > 0) {
        for (const k of memoryKeys.values()) {
          if (k.keyId === keyId) {
            k.status = status;
            k.updatedAt = now;
          }
        }
        return true;
      }
    } catch (err) {
      console.warn('[ApiKeys] Failed to update key status:', err);
    }
  }

  for (const k of memoryKeys.values()) {
    if (k.keyId === keyId) {
      k.status = status;
      k.updatedAt = now;
      return true;
    }
  }
  return false;
}

/**
 * Records an audit log for an API request (threat or successful generation)
 */
export async function recordApiLog(log: Omit<ApiLog, 'logId' | 'timestamp'>): Promise<ApiLog> {
  const fullLog: ApiLog = {
    ...log,
    logId: `log_${crypto.randomBytes(8).toString('hex')}`,
    timestamp: new Date().toISOString(),
  };

  const db = await getDb();
  if (db) {
    try {
      const res = await db.collection('api_logs').insertOne({ ...fullLog } as any);
      fullLog._id = res.insertedId.toString();
    } catch (err) {
      console.warn('[ApiKeys] Failed to insert log into MongoDB:', err);
    }
  }

  memoryLogs.unshift(fullLog);
  if (memoryLogs.length > 500) {
    memoryLogs.pop();
  }

  return fullLog;
}

/**
 * Core Security & Threat Prevention Validation for incoming API requests:
 * 1. Hashes raw secret key and finds active key.
 * 2. Checks origin whitelist network defense.
 * 3. Enforces rate limits (RPM).
 * 4. Checks and deducts user generation credits.
 */
export async function validateAndExecuteApiRequest(params: {
  rawKey: string;
  requestOrigin: string | null;
  clientIp: string;
  endpoint: string;
  method?: string;
}): Promise<{
  authorized: boolean;
  status: number;
  threatType: ThreatType;
  error?: string;
  key?: ApiKey;
  user?: any;
  remainingCredits?: number;
  isUnlimited?: boolean;
  rateLimitRemaining?: number;
}> {
  const startTime = Date.now();
  const { rawKey, requestOrigin, clientIp, endpoint, method = 'POST' } = params;

  if (!rawKey || !rawKey.startsWith('ndj_live_')) {
    await recordApiLog({
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 401,
      threatType: 'INVALID_KEY',
      threatMessage: 'Malformed or missing API Key prefix (expected ndj_live_...)',
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });
    return {
      authorized: false,
      status: 401,
      threatType: 'INVALID_KEY',
      error: 'Unauthorized: Invalid or missing API Key format.',
    };
  }

  const hash = hashApiKey(rawKey);

  // 1. Find key
  let key: ApiKey | null = null;
  const db = await getDb();
  if (db) {
    try {
      const found = await db.collection<ApiKey>('api_keys').findOne({ keyHash: hash });
      if (found) {
        key = { ...found, _id: found._id?.toString() };
      }
    } catch (err) {
      console.warn('[ApiKeys] Failed querying key in MongoDB:', err);
    }
  }

  if (!key) {
    key = memoryKeys.get(hash) || null;
  }

  if (!key) {
    await recordApiLog({
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 401,
      threatType: 'INVALID_KEY',
      threatMessage: 'Key hash not found in registered keys index',
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });
    return {
      authorized: false,
      status: 401,
      threatType: 'INVALID_KEY',
      error: 'Unauthorized: API Key not recognized.',
    };
  }

  // 2. Check Key Status
  if (key.status === 'revoked') {
    await recordApiLog({
      keyId: key.keyId,
      keyPrefix: key.keyPrefix,
      userId: key.userId,
      userEmail: key.userEmail,
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 403,
      threatType: 'KEY_REVOKED',
      threatMessage: 'Attempted to use permanently revoked API Key',
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });
    return {
      authorized: false,
      status: 403,
      threatType: 'KEY_REVOKED',
      error: 'Forbidden: API Key has been permanently revoked.',
    };
  }

  if (key.status === 'suspended') {
    await recordApiLog({
      keyId: key.keyId,
      keyPrefix: key.keyPrefix,
      userId: key.userId,
      userEmail: key.userEmail,
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 403,
      threatType: 'KEY_SUSPENDED',
      threatMessage: 'Attempted to use suspended API Key',
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });
    return {
      authorized: false,
      status: 403,
      threatType: 'KEY_SUSPENDED',
      error: 'Forbidden: API Key is currently suspended by administration.',
    };
  }

  // 3. ORIGIN & NETWORK WHITELIST SECURITY
  const originValid = isOriginAllowed(requestOrigin, key.allowedOrigins);
  if (!originValid) {
    // Increment threat counter on key
    await incrementThreat(key.keyId);

    await recordApiLog({
      keyId: key.keyId,
      keyPrefix: key.keyPrefix,
      userId: key.userId,
      userEmail: key.userEmail,
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 403,
      threatType: 'ORIGIN_FORBIDDEN',
      threatMessage: `Origin "${requestOrigin || 'DIRECT/BLANK'}" is not in allowed origins whitelist: [${key.allowedOrigins.join(', ')}]`,
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });

    return {
      authorized: false,
      status: 403,
      threatType: 'ORIGIN_FORBIDDEN',
      error: `Security Violation: Network origin "${requestOrigin || 'Direct Connection'}" is not authorized. Whitelist this domain in your Pear API settings.`,
    };
  }

  // 4. RATE LIMITING (SLIDING WINDOW)
  const rateLimitRes = checkRateLimit(key.keyId, key.rateLimitRpm || 60);
  if (!rateLimitRes.allowed) {
    await incrementThreat(key.keyId);

    await recordApiLog({
      keyId: key.keyId,
      keyPrefix: key.keyPrefix,
      userId: key.userId,
      userEmail: key.userEmail,
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 429,
      threatType: 'RATE_LIMIT_EXCEEDED',
      threatMessage: `Exceeded ${key.rateLimitRpm} RPM rate limit window`,
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });

    return {
      authorized: false,
      status: 429,
      threatType: 'RATE_LIMIT_EXCEEDED',
      rateLimitRemaining: 0,
      error: `Too Many Requests: Rate limit of ${key.rateLimitRpm} RPM exceeded. Please back off and retry.`,
    };
  }

  // 5. USER GENERATION USAGE & CREDITS CHECK
  const user = await findByIdOrEmail(key.userId, key.userEmail);
  const userPlan = user?.plan || 'free';
  const allPlans = await getAllPlans();
  const matchedPlan = allPlans.find((p) => p.id === userPlan) || allPlans[0];

  const isUnlimited =
    matchedPlan.creditType === 'unlimited' ||
    userPlan === 'pro' ||
    userPlan === 'enterprise';

  const used = Number(user?.generationsUsed || 0);
  const limit = Number(user?.generationsLimit || matchedPlan.generationLimit || 10);

  if (!isUnlimited && used >= limit) {
    await recordApiLog({
      keyId: key.keyId,
      keyPrefix: key.keyPrefix,
      userId: key.userId,
      userEmail: key.userEmail,
      origin: requestOrigin || 'none',
      ip: clientIp,
      method,
      endpoint,
      status: 402,
      threatType: 'CREDITS_EXHAUSTED',
      threatMessage: `User generations exhausted (${used}/${limit} credits used)`,
      creditsDeducted: 0,
      latencyMs: Date.now() - startTime,
    });

    return {
      authorized: false,
      status: 402,
      threatType: 'CREDITS_EXHAUSTED',
      remainingCredits: 0,
      isUnlimited: false,
      error: `Payment Required: Generation quota exhausted (${used}/${limit} credits used). Please upgrade to Starter, Pro, or Enterprise.`,
    };
  }

  // 6. DEDUCT CREDIT & UPDATE USAGE STATS
  await deductUserCredit(key.userId, key.userEmail);
  await incrementKeyUsage(key.keyId);

  const newUsed = used + 1;
  const remainingCredits = isUnlimited ? 99999 : Math.max(0, limit - newUsed);

  await recordApiLog({
    keyId: key.keyId,
    keyPrefix: key.keyPrefix,
    userId: key.userId,
    userEmail: key.userEmail,
    origin: requestOrigin || 'none',
    ip: clientIp,
    method,
    endpoint,
    status: 200,
    threatType: 'NONE',
    creditsDeducted: isUnlimited ? 0 : 1,
    latencyMs: Date.now() - startTime,
  });

  return {
    authorized: true,
    status: 200,
    threatType: 'NONE',
    key,
    user,
    remainingCredits,
    isUnlimited,
    rateLimitRemaining: rateLimitRes.remainingRpm,
  };
}

/**
 * Increments threat count on a key
 */
async function incrementThreat(keyId: string) {
  const db = await getDb();
  if (db) {
    try {
      await db.collection('api_keys').updateOne({ keyId }, { $inc: { threatCount: 1 } });
    } catch {}
  }
  for (const k of memoryKeys.values()) {
    if (k.keyId === keyId) {
      k.threatCount = (k.threatCount || 0) + 1;
    }
  }
}

/**
 * Increments successful requests and sets lastUsedAt
 */
async function incrementKeyUsage(keyId: string) {
  const now = new Date().toISOString();
  const db = await getDb();
  if (db) {
    try {
      await db.collection('api_keys').updateOne(
        { keyId },
        { $inc: { totalRequests: 1 }, $set: { lastUsedAt: now } }
      );
    } catch {}
  }
  for (const k of memoryKeys.values()) {
    if (k.keyId === keyId) {
      k.totalRequests = (k.totalRequests || 0) + 1;
      k.lastUsedAt = now;
    }
  }
}

/**
 * Deducts 1 credit from user record
 */
async function deductUserCredit(userId: string, userEmail: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  if (db) {
    try {
      const filter: any = {};
      if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
        const { ObjectId } = await import('mongodb');
        filter._id = new ObjectId(userId);
      } else if (userEmail) {
        filter.email = userEmail.toLowerCase().trim();
      }

      await db.collection('users').updateOne(filter, {
        $inc: { generationsUsed: 1 },
        $set: { updatedAt: now },
      });
    } catch (err) {
      console.warn('[ApiKeys] Failed to increment generationsUsed in MongoDB:', err);
    }
  }
}

/**
 * Helper to find user by ID or Email
 */
async function findByIdOrEmail(userId: string, email: string) {
  if (userId) {
    const u = await findUserById(userId);
    if (u) return u;
  }
  if (email) {
    const u = await findUserByEmail(email);
    if (u) return u;
  }
  return null;
}

/**
 * Admin: Fetch overview metrics across all API keys and security threats
 */
export async function getAdminApiOverview(): Promise<{
  totalKeys: number;
  activeKeys: number;
  suspendedKeys: number;
  revokedKeys: number;
  totalRequests: number;
  totalThreatsBlocked: number;
  originThreats: number;
  rateLimitThreats: number;
}> {
  const db = await getDb();
  let keys: ApiKey[] = [];
  let logs: ApiLog[] = [];

  if (db) {
    try {
      keys = await db.collection<ApiKey>('api_keys').find({}).toArray();
      logs = await db.collection<ApiLog>('api_logs').find({}).sort({ timestamp: -1 }).limit(1000).toArray();
    } catch (err) {
      console.warn('[ApiKeys] Admin overview fetch error:', err);
    }
  }

  if (keys.length === 0) {
    keys = Array.from(memoryKeys.values());
  }
  if (logs.length === 0) {
    logs = memoryLogs;
  }

  const totalKeys = keys.length;
  const activeKeys = keys.filter((k) => k.status === 'active').length;
  const suspendedKeys = keys.filter((k) => k.status === 'suspended').length;
  const revokedKeys = keys.filter((k) => k.status === 'revoked').length;
  const totalRequests = keys.reduce((acc, k) => acc + (k.totalRequests || 0), 0);

  const originThreats = logs.filter((l) => l.threatType === 'ORIGIN_FORBIDDEN').length;
  const rateLimitThreats = logs.filter((l) => l.threatType === 'RATE_LIMIT_EXCEEDED').length;
  const totalThreatsBlocked = logs.filter((l) => l.threatType !== 'NONE').length;

  return {
    totalKeys,
    activeKeys,
    suspendedKeys,
    revokedKeys,
    totalRequests,
    totalThreatsBlocked,
    originThreats,
    rateLimitThreats,
  };
}

/**
 * Admin: List all API keys across the system
 */
export async function getAllApiKeysAdmin(): Promise<Omit<ApiKey, 'keyHash'>[]> {
  const db = await getDb();
  if (db) {
    try {
      const docs = await db.collection<ApiKey>('api_keys').find({}).sort({ createdAt: -1 }).toArray();
      if (docs && docs.length > 0) {
        return docs.map((d) => {
          const { keyHash, ...safe } = d;
          return { ...safe, _id: d._id?.toString() };
        });
      }
    } catch (err) {
      console.warn('[ApiKeys] Failed fetching admin keys:', err);
    }
  }

  return Array.from(memoryKeys.values()).map((k) => {
    const { keyHash, ...safe } = k;
    return safe;
  });
}

/**
 * List recent API activity logs (with optional threat filter)
 */
export async function getRecentApiLogs(filter?: {
  userId?: string;
  threatOnly?: boolean;
  limit?: number;
}): Promise<ApiLog[]> {
  const db = await getDb();
  const limit = filter?.limit || 50;

  if (db) {
    try {
      const query: any = {};
      if (filter?.userId) {
        query.userId = filter.userId;
      }
      if (filter?.threatOnly) {
        query.threatType = { $ne: 'NONE' };
      }

      const docs = await db
        .collection<ApiLog>('api_logs')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      if (docs && docs.length > 0) {
        return docs.map((d) => ({ ...d, _id: d._id?.toString() }));
      }
    } catch (err) {
      console.warn('[ApiKeys] Failed fetching logs from MongoDB:', err);
    }
  }

  let filtered = memoryLogs;
  if (filter?.userId) {
    filtered = filtered.filter((l) => l.userId === filter.userId);
  }
  if (filter?.threatOnly) {
    filtered = filtered.filter((l) => l.threatType !== 'NONE');
  }

  return filtered.slice(0, limit);
}
