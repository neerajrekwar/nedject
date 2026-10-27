import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  RAZORPAY_PLANS,
  getRazorpayClient,
  isRazorpayConfigured,
} from '@/lib/razorpay';
import { validateCouponForPlan } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const { planId = 'pro', billingCycle = 'monthly', couponCode } = body;

    const plan = RAZORPAY_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const priceInr = billingCycle === 'yearly' ? plan.yearlyInr : plan.monthlyInr;
    let finalPriceInr = priceInr;
    let appliedCoupon: any = null;

    if (couponCode && typeof couponCode === 'string') {
      const couponRes = await validateCouponForPlan({
        rawCode: couponCode,
        planId: planId as any,
        billingCycle: billingCycle as any,
        currency: 'INR',
        basePrice: priceInr,
      });

      if (couponRes.valid) {
        finalPriceInr = couponRes.finalPrice;
        appliedCoupon = {
          code: couponRes.coupon?.code,
          discountAmount: couponRes.discountAmount,
          savingsPercentage: couponRes.savingsPercentage,
          isFreeUpgrade: couponRes.isFreeUpgrade,
        };
      }
    }

    const userEmail = session?.user?.email || body.email || 'guest@nedject.dev';
    const userName = session?.user?.name || body.name || 'Nedject Athlete';

    // If 100% discount / free coupon (e.g. PRO100FREE), handle 0-payment orders directly
    if (finalPriceInr <= 0) {
      const freeOrderId = `order_free_${couponCode || 'promo'}_${Date.now()}`;
      return NextResponse.json({
        orderId: freeOrderId,
        amount: 0,
        currency: 'INR',
        planName: plan.name,
        planId,
        billingCycle,
        keyId: 'free_promotional_upgrade',
        isMock: true,
        isFreeUpgrade: true,
        couponApplied: appliedCoupon,
        message: '100% Free Promotional Coupon Applied! Instant activation ready.',
      });
    }

    const amountInPaise = Math.round(finalPriceInr * 100); // Razorpay takes amount in paise

    const configured = isRazorpayConfigured();
    const razorpay = getRazorpayClient();

    // 1. If Razorpay is configured with valid credentials, create order through Razorpay API
    if (configured && razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${planId}_${Date.now()}`,
          notes: {
            planId,
            billingCycle,
            userEmail,
            userName,
            couponCode: couponCode || 'NONE',
            discountInr: String(priceInr - finalPriceInr),
            appName: 'Nedject genQRstudio',
          },
        });

        return NextResponse.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          planName: plan.name,
          planId,
          billingCycle,
          keyId: process.env.RAZORPAY_KEY_ID,
          isMock: false,
          isFreeUpgrade: false,
          couponApplied: appliedCoupon,
        });
      } catch (rzpErr: any) {
        console.error('[Razorpay] Order creation error:', rzpErr);
      }
    }

    // 2. Simulated/Sandbox Test Mode
    const mockOrderId = `order_mock_${planId}_${Date.now()}`;
    return NextResponse.json({
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      planName: plan.name,
      planId,
      billingCycle,
      keyId: 'rzp_test_mock_mode',
      isMock: true,
      isFreeUpgrade: false,
      couponApplied: appliedCoupon,
      message: 'Razorpay sandbox test mode active (instant verification available)',
    });
  } catch (err: any) {
    console.error('[Razorpay] Route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal order creation failure' },
      { status: 500 }
    );
  }
}
