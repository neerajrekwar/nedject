import { NextResponse } from 'next/server';
import { isRazorpayConfigured } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isRazorpayConfigured();
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_mode';

  return NextResponse.json({
    isConfigured: configured,
    keyId: configured ? keyId : 'rzp_test_mock_mode',
    currency: 'INR',
  });
}
