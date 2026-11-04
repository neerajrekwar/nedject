import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiRequest, unauthorizedAdminResponse } from '@/lib/admin-auth-guard';
import {
  getAdminApiOverview,
  getAllApiKeysAdmin,
  getRecentApiLogs,
  updateApiKeyStatus,
  updateApiKeyOrigins,
  revokeApiKey,
  rotateApiKey,
  globalEmergencyRotateAllKeys,
} from '@/lib/api-keys';

export async function GET(req: NextRequest) {
  const auth = verifyAdminApiRequest(req);
  if (!auth.authorized) {
    return unauthorizedAdminResponse(auth.reason);
  }

  try {
    const [overview, keys, logs] = await Promise.all([
      getAdminApiOverview(),
      getAllApiKeysAdmin(),
      getRecentApiLogs({ limit: 100 }),
    ]);

    return NextResponse.json({
      success: true,
      overview,
      keys,
      logs,
    });
  } catch (err: any) {
    console.error('[Admin Apies GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin API metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminApiRequest(req);
  if (!auth.authorized) {
    return unauthorizedAdminResponse(auth.reason);
  }

  try {
    const body = await req.json();
    const { action, keyId, reason } = body;

    // 1. Single Key Rotation
    if (action === 'rotate') {
      if (!keyId) {
        return NextResponse.json({ error: 'Missing keyId to rotate' }, { status: 400 });
      }
      const rotated = await rotateApiKey(
        keyId,
        undefined,
        true,
        reason || 'Admin initiated security rotation'
      );
      if (!rotated) {
        return NextResponse.json({ error: 'Key not found or could not be rotated' }, { status: 404 });
      }
      const { keyHash, ...safeNewKey } = rotated.newKey;
      return NextResponse.json({
        success: true,
        key: safeNewKey,
        rawSecretKey: rotated.rawSecretKey,
        message: `Key successfully rotated. Previous key ${rotated.oldKey.keyPrefix} revoked.`,
      });
    }

    // 2. Global Outage Emergency Lockdown
    if (action === 'global_emergency_rotation' || action === 'global_lockdown') {
      const result = await globalEmergencyRotateAllKeys(
        'admin_console@nedject.internal',
        reason || 'Admin triggered Global Outage Emergency Lockdown'
      );
      return NextResponse.json({
        success: true,
        ...result,
        message: `Global Outage Protocol activated. ${result.totalSuspended} active keys suspended to mitigate threat.`,
      });
    }

    return NextResponse.json({ error: 'Unknown action requested' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Apies POST] Error:', err);
    return NextResponse.json({ error: 'Failed to execute admin action' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = verifyAdminApiRequest(req);
  if (!auth.authorized) {
    return unauthorizedAdminResponse(auth.reason);
  }

  try {
    const body = await req.json();
    const { keyId, status, allowedOrigins } = body;

    if (!keyId) {
      return NextResponse.json({ error: 'Missing keyId' }, { status: 400 });
    }

    if (status) {
      const ok = await updateApiKeyStatus(keyId, status, true);
      if (!ok) {
        return NextResponse.json({ error: 'Failed to update key status' }, { status: 404 });
      }
    }

    if (Array.isArray(allowedOrigins)) {
      const ok = await updateApiKeyOrigins(keyId, allowedOrigins, undefined, true);
      if (!ok) {
        return NextResponse.json({ error: 'Failed to update allowed origins' }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'API Key configuration updated successfully',
    });
  } catch (err: any) {
    console.error('[Admin Apies PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = verifyAdminApiRequest(req);
  if (!auth.authorized) {
    return unauthorizedAdminResponse(auth.reason);
  }

  try {
    const url = new URL(req.url);
    const keyId = url.searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json({ error: 'Missing keyId' }, { status: 400 });
    }

    const ok = await revokeApiKey(keyId, undefined, true);
    if (!ok) {
      return NextResponse.json({ error: 'Key not found or revocation failed' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'API Key has been revoked by Administrator',
    });
  } catch (err: any) {
    console.error('[Admin Apies DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 });
  }
}
