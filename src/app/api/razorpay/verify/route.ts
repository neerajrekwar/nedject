import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { isRazorpayConfigured, verifyRazorpaySignature, RAZORPAY_PLANS } from '@/lib/razorpay';
import { updateUserProfile } from '@/lib/db-users';
import { recordCouponRedemption } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId = 'pro',
      isMock = false,
      couponCode,
    } = body;

    const configured = isRazorpayConfigured();
    let verified = false;

    // Check if free upgrade coupon was used
    const isFreeUpgrade = razorpay_payment_id === 'pay_free_coupon' || razorpay_order_id?.startsWith('order_free_');

    if (isFreeUpgrade) {
      verified = true;
    } else if (configured && !isMock) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: 'Missing payment signature verification parameters' },
          { status: 400 }
        );
      }

      verified = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid Razorpay payment signature' },
          { status: 400 }
        );
      }
    } else {
      // Sandbox / Test Mode verification
      verified = true;
    }

    const assignedPlan = planId === 'enterprise' ? 'enterprise' : 'pro';
    const userEmail = session?.user?.email || body.email;

    // Persist upgraded plan to user's MongoDB profile if authenticated
    if (userEmail) {
      try {
        await updateUserProfile(userEmail, {
          plan: assignedPlan,
          generationsLimit: 99999,
        });
      } catch (dbErr) {
        console.warn('[Razorpay] Note updating user profile in DB:', dbErr);
      }
    }

    // Record coupon redemption if coupon was applied
    if (couponCode) {
      try {
        await recordCouponRedemption(couponCode, userEmail);
      } catch (cpnErr) {
        console.warn('[Razorpay] Failed to record coupon redemption:', cpnErr);
      }
    }

    const planDetails = RAZORPAY_PLANS[assignedPlan] || RAZORPAY_PLANS.pro;

    return NextResponse.json({
      success: true,
      verified: true,
      plan: assignedPlan,
      planName: planDetails.name,
      paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
      orderId: razorpay_order_id,
      couponCode: couponCode || null,
      message: `Successfully upgraded to ${planDetails.name}! You now have UNLIMITED 300/600 DPI generations.`,
    });
  } catch (err: any) {
    console.error('[Razorpay] Verification error:', err);
    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
