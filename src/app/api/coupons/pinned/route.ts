import { NextResponse } from 'next/server';
import { getPinnedPublicCoupons } from '@/lib/coupons';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const coupons = await getPinnedPublicCoupons();
    return NextResponse.json(
      {
        success: true,
        coupons,
        count: coupons.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('[Public Pinned Coupons] Error:', error);
    return NextResponse.json(
      { success: false, coupons: [], error: 'Failed to retrieve pinned offers' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  }
}
