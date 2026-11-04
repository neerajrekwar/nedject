import { NextRequest, NextResponse } from 'next/server';
import { generateVerificationEmailHtml } from '@/lib/email';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || '782941';
  const email = searchParams.get('email') || 'athlete@example.com';
  const name = searchParams.get('name') || 'Neeraj Rekwar';

  const html = generateVerificationEmailHtml({
    to: email,
    code,
    userName: name,
    appUrl: req.nextUrl.origin,
  });

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
