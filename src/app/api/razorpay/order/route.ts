import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  RAZORPAY_PLANS,
  getRazorpayClient,
  isRazorpayConfigured,
} from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const { planId = 'pro', billingCycle = 'monthly' } = body;

    const plan = RAZORPAY_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const priceInr = billingCycle === 'yearly' ? plan.yearlyInr : plan.monthlyInr;
    const amountInPaise = priceInr * 100; // Razorpay takes amount in currency subunit (paise)

    const userEmail = session?.user?.email || body.email || 'guest@nedject.dev';
    const userName = session?.user?.name || body.name || 'Nedject Athlete';

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
        });
      } catch (rzpErr: any) {
        console.error('[Razorpay] Order creation error:', rzpErr);
        // Fallback to simulated mode if test keys failed
      }
    }

    // 2. Simulated/Sandbox Test Mode (Active when RAZORPAY keys are not yet configured)
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
