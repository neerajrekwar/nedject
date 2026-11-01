import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateCoupons } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids, action, isPinned } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No coupon IDs provided for bulk operation' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (action === 'pin' || isPinned === true) {
      updates.isPinned = true;
    } else if (action === 'unpin' || isPinned === false) {
      updates.isPinned = false;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid bulk action specified. Expected "pin" or "unpin"' },
        { status: 400 }
      );
    }

    const result = await bulkUpdateCoupons(ids, updates);

    return NextResponse.json({
      success: true,
      message: `Successfully ${updates.isPinned ? 'pinned' : 'unpinned'} ${result.updatedCount} coupon(s)`,
      updatedCount: result.updatedCount,
      updatedCoupons: result.updatedCoupons,
    });
  } catch (error: any) {
    console.error('[Admin Coupons Bulk] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
