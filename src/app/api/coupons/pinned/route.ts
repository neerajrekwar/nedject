import { NextResponse } from 'next/server';
import { getPinnedPublicCoupons } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coupons = await getPinnedPublicCoupons();
    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    console.error('[Public Pinned Coupons] Error:', error);
    return NextResponse.json(
      { success: false, coupons: [], error: 'Failed to retrieve pinned offers' },
      { status: 500 }
    );
  }
}
