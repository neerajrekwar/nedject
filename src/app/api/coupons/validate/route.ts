import { NextRequest, NextResponse } from 'next/server';
import { validateCouponForPlan } from '@/lib/coupons';
import { NEDJECT_PLANS } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      code,
      planId = 'pro',
      billingCycle = 'monthly',
      currency = 'INR',
    } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code' },
        { status: 400 }
      );
    }

    const planConfig = NEDJECT_PLANS[planId];
    if (!planConfig) {
      return NextResponse.json(
        { valid: false, error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Determine standard price based on billing cycle and currency
    let basePrice = 0;
    if (currency === 'INR') {
      basePrice = billingCycle === 'yearly' ? planConfig.yearlyInr : planConfig.monthlyInr;
    } else {
      basePrice = billingCycle === 'yearly' ? planConfig.yearlyUsd : planConfig.monthlyUsd;
    }

    const result = await validateCouponForPlan({
      rawCode: code,
      planId,
      billingCycle,
      currency,
      basePrice,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Coupons Validate] Error:', error);
    return NextResponse.json(
      { valid: false, error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
}
