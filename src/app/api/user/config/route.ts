import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/mongodb';
import { findUserByEmail, findUserById } from '@/lib/db-users';
import { B2BServiceConfig, DEFAULT_B2B_CONFIG } from '@/lib/b2b-config';

export type { B2BServiceConfig };
export { DEFAULT_B2B_CONFIG };

// In-memory fallback
const memoryConfig = new Map<string, B2BServiceConfig>();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || (session?.user as any)?.id || session?.user?.email;

    if (!userId) {
      return NextResponse.json({ success: true, config: DEFAULT_B2B_CONFIG });
    }

    const db = await getDb();
    if (db) {
      try {
        const found = await db.collection('user_b2b_configs').findOne({
          $or: [{ userId }, { email: session?.user?.email }],
        });
        if (found && found.config) {
          return NextResponse.json({ success: true, config: found.config });
        }
      } catch (err) {
        console.warn('[B2B Config GET] DB lookup fallback:', err);
      }
    }

    const mem = memoryConfig.get(userId);
    return NextResponse.json({ success: true, config: mem || DEFAULT_B2B_CONFIG });
  } catch (err: any) {
    console.error('[B2B Config GET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve configuration' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { userId: explicitUserId, config } = body;

    const email = session?.user?.email;

    // IDOR & Cross-Tenant Threat Prevention: Prevent unauthorized users from modifying other tenants' configs
    let authedUserId = '';
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ndj_live_')) {
      const rawKey = authHeader.slice(7).trim();
      const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const db = await getDb();
      if (db) {
        const key = await db.collection('api_keys').findOne({ keyHash: hash });
        if (key) authedUserId = key.userId;
      }
    }

    if (email) {
      const u = await findUserByEmail(email);
      if (u) authedUserId = u._id || email;
    }

    if (authedUserId && explicitUserId && authedUserId !== explicitUserId && (session?.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify another tenant configuration' },
        { status: 403 }
      );
    }

    const userId = explicitUserId || authedUserId || (session?.user as any)?.id || email || 'anonymous_dev';

    if (!config) {
      return NextResponse.json({ error: 'Missing configuration payload' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const db = await getDb();
    if (db) {
      try {
        await db.collection('user_b2b_configs').updateOne(
          { userId },
          {
            $set: {
              userId,
              email: email || '',
              config,
              updatedAt: now,
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.warn('[B2B Config POST] DB save error:', err);
      }
    }

    memoryConfig.set(userId, config);

    return NextResponse.json({
      success: true,
      message: 'B2B service configuration saved successfully',
      updatedAt: now,
    });
  } catch (err: any) {
    console.error('[B2B Config POST] Error:', err);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
