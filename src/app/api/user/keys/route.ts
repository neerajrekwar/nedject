import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { findUserByEmail, findUserById } from '@/lib/db-users';
import {
  createApiKey,
  listUserApiKeys,
  revokeApiKey,
  rotateApiKey,
  updateApiKeyOrigins,
  getRecentApiLogs,
} from '@/lib/api-keys';
import { getAllPlans } from '@/lib/plans-db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('userId');

    // Authenticate user
    const email = session?.user?.email;
    if (!email && !queryUserId) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    let user = null;
    if (queryUserId) {
      user = await findUserById(queryUserId);
    }
    if (!user && email) {
      user = await findUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const userId = user._id || queryUserId || user.email;
    const keys = await listUserApiKeys(userId, user.email);
    const logs = await getRecentApiLogs({ userId, limit: 30 });

    const allPlans = await getAllPlans();
    const currentPlan = allPlans.find((p) => p.id === user.plan) || allPlans[0];

    const isUnlimited =
      currentPlan.creditType === 'unlimited' ||
      user.plan === 'pro' ||
      user.plan === 'enterprise';

    const used = Number(user.generationsUsed || 0);
    const limit = Number(user.generationsLimit || currentPlan.generationLimit || 10);
    const remaining = isUnlimited ? 99999 : Math.max(0, limit - used);

    return NextResponse.json({
      success: true,
      keys,
      logs,
      planInfo: {
        plan: user.plan || 'free',
        name: currentPlan.name,
        badge: currentPlan.badge,
        creditType: currentPlan.creditType || (isUnlimited ? 'unlimited' : 'credits'),
        monthlyCredits: currentPlan.monthlyCredits || limit,
        used,
        limit,
        remaining,
        isUnlimited,
        allowedOriginsLimit: currentPlan.allowedOriginsLimit || 5,
        rateLimitRpm: currentPlan.rateLimitRpm || 60,
        apiAccess: currentPlan.apiAccess !== false,
      },
    });
  } catch (err: any) {
    console.error('[API User Keys GET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve user keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { name, allowedOrigins, userId: explicitUserId } = body;

    const email = session?.user?.email;
    if (!email && !explicitUserId) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    let user = null;
    if (explicitUserId) {
      user = await findUserById(explicitUserId);
    }
    if (!user && email) {
      user = await findUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const userId = user._id || explicitUserId || user.email;

    // Handle Rotate Key Action
    if (body.action === 'rotate') {
      const { keyId, reason } = body;
      if (!keyId) {
        return NextResponse.json({ error: 'Missing keyId to rotate' }, { status: 400 });
      }
      const rotated = await rotateApiKey(
        keyId,
        userId,
        false,
        reason || 'User initiated key rotation / global outage mitigation'
      );
      if (!rotated) {
        return NextResponse.json({ error: 'Key not found or could not be rotated' }, { status: 404 });
      }
      const { keyHash, ...safeNewKey } = rotated.newKey;
      return NextResponse.json({
        success: true,
        key: safeNewKey,
        rawSecretKey: rotated.rawSecretKey,
        message: 'API Key successfully rotated. Previous key has been revoked.',
      });
    }

    // Check user active keys count
    const existingKeys = await listUserApiKeys(userId, user.email);
    const activeKeys = existingKeys.filter((k) => k.status === 'active');
    if (activeKeys.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum limit of 10 active API keys reached. Please revoke unused keys.' },
        { status: 400 }
      );
    }

    const { key, rawSecretKey } = await createApiKey({
      userId,
      userEmail: user.email,
      name: name || 'Production Pear Key',
      allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : ['http://localhost:3000'],
    });

    const { keyHash, ...safeKey } = key;

    return NextResponse.json({
      success: true,
      key: safeKey,
      rawSecretKey, // Shown only once to the user!
      message: 'API Key successfully generated. Store this key securely; it will not be displayed again.',
    });
  } catch (err: any) {
    console.error('[API User Keys POST] Error:', err);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { keyId, allowedOrigins, userId: explicitUserId } = body;

    if (!keyId) {
      return NextResponse.json({ error: 'Missing keyId' }, { status: 400 });
    }

    const email = session?.user?.email;
    let userId: string | undefined = explicitUserId || undefined;
    if (!userId && email) {
      const u = await findUserByEmail(email);
      userId = u?._id;
    }

    const updated = await updateApiKeyOrigins(keyId, allowedOrigins || [], userId);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update origins or key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Allowed origins updated successfully' });
  } catch (err: any) {
    console.error('[API User Keys PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const keyId = url.searchParams.get('keyId');
    const queryUserId = url.searchParams.get('userId');

    if (!keyId) {
      return NextResponse.json({ error: 'Missing keyId' }, { status: 400 });
    }

    const email = session?.user?.email;
    let userId: string | undefined = queryUserId || undefined;
    if (!userId && email) {
      const u = await findUserByEmail(email);
      userId = u?._id;
    }

    const revoked = await revokeApiKey(keyId, userId);
    if (!revoked) {
      return NextResponse.json({ error: 'Key not found or could not be revoked' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'API Key has been revoked' });
  } catch (err: any) {
    console.error('[API User Keys DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
