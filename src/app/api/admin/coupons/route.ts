import { NextRequest, NextResponse } from 'next/server';
import { getAllCoupons, createCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({
      success: true,
      coupons,
      total: coupons.length,
    });
  } catch (error: any) {
    console.error('[Admin Coupons] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid coupon code is required' },
        { status: 400 }
      );
    }

    const created = await createCoupon({
      code: body.code,
      description: body.description || '',
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue) || 10,
      applicablePlans: Array.isArray(body.applicablePlans) ? body.applicablePlans : ['all'],
      applicableBillingCycles: Array.isArray(body.applicableBillingCycles) ? body.applicableBillingCycles : ['all'],
      maxRedemptions: body.maxRedemptions !== undefined ? Number(body.maxRedemptions) : -1,
      expiresAt: body.expiresAt || null,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      createdBy: body.createdBy || 'Admin Console',
      notes: body.notes || '',
    });

    return NextResponse.json({
      success: true,
      message: `Coupon code "${created.code}" created successfully!`,
      coupon: created,
    });
  } catch (error: any) {
    console.error('[Admin Coupons] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 400 }
    );
  }
}
