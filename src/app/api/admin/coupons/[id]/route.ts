import { NextRequest, NextResponse } from 'next/server';
import { updateCoupon, deleteCoupon, getAllCoupons } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const all = await getAllCoupons();
    const coupon = all.find((c) => c.id === id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await updateCoupon(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found for update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Coupon "${updated.code}" updated successfully`,
      coupon: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating coupon' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteCoupon(id);

    return NextResponse.json({
      success: ok,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error deleting coupon' },
      { status: 500 }
    );
  }
}
