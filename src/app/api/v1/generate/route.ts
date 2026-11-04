import { NextRequest, NextResponse } from 'next/server';
import { validateAndExecuteApiRequest } from '@/lib/api-keys';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // 1. Extract API Key from headers
  const authHeader = req.headers.get('authorization') || '';
  let rawKey = '';
  if (authHeader.startsWith('Bearer ')) {
    rawKey = authHeader.slice(7).trim();
  } else {
    rawKey = req.headers.get('x-api-key') || '';
  }

  // 2. Extract Origin and Client IP
  const requestOrigin =
    req.headers.get('origin') ||
    req.headers.get('referer') ||
    req.headers.get('host') ||
    null;

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 3. Security, Origin & Quota Validation
  const validation = await validateAndExecuteApiRequest({
    rawKey,
    requestOrigin,
    clientIp,
    endpoint: '/api/v1/generate',
    method: 'POST',
  });

  if (!validation.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: validation.error,
        threatType: validation.threatType,
        telemetry: {
          origin: requestOrigin || 'unknown',
          status: validation.status,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: validation.status,
        headers: {
          'X-Origin-Verified': 'false',
          'X-RateLimit-Remaining': String(validation.rateLimitRemaining ?? 0),
          'X-Credits-Remaining': String(validation.remainingCredits ?? 0),
          'Access-Control-Allow-Origin': requestOrigin || '*',
        },
      }
    );
  }

  // 4. Parse request payload
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = { type: 'qr', payload: 'https://nedject.internal/optical' };
  }

  const { type = 'qr', payload = 'https://nedject.internal', format = 'svg', options = {} } = body;

  // 5. Generate Optical Result
  const generationId = `gen_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();
  const latencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      success: true,
      generationId,
      timestamp,
      latencyMs,
      type,
      format,
      output: {
        rawPayload: payload,
        renderedDpi: type === 'photo' || options?.dpi ? options.dpi || 300 : 300,
        matrixEngine: 'Nedject-Optical-Engine-v2',
        colorSeparation: options?.cmyk ? 'CMYK-FOGRA39' : 'sRGB-Standard',
        originVerified: true,
        networkDomain: requestOrigin || 'Direct-Tunnel',
      },
      quota: {
        isUnlimited: validation.isUnlimited,
        remainingCredits: validation.remainingCredits,
        rateLimitRemaining: validation.rateLimitRemaining,
      },
    },
    {
      status: 200,
      headers: {
        'X-Origin-Verified': 'true',
        'X-RateLimit-Limit': String(validation.key?.rateLimitRpm || 60),
        'X-RateLimit-Remaining': String(validation.rateLimitRemaining ?? 60),
        'X-Credits-Remaining': String(validation.remainingCredits ?? 0),
        'X-Credits-Unlimited': String(validation.isUnlimited),
        'Access-Control-Allow-Origin': requestOrigin || '*',
      },
    }
  );
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}
