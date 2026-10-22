import { NextRequest, NextResponse } from 'next/server';
import { generateOgCardBuffer } from '@/lib/canvas-og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || 'home';
    const title = searchParams.get('title') || undefined;
    const description = searchParams.get('desc') || searchParams.get('description') || undefined;
    const badge = searchParams.get('badge') || undefined;

    const buffer = await generateOgCardBuffer({
      page,
      title,
      description,
      badge,
    });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Failed to generate Canvas OpenGraph card:', error);
    return NextResponse.json(
      { error: 'Failed to generate OpenGraph card', message: error?.message },
      { status: 500 }
    );
  }
}
