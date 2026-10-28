import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getPurchasesForUser, createPurchaseRecord } from '@/lib/purchases';
import { findUserByEmail } from '@/lib/db-users';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'Nedject-super-secret-nextauth-key-2026';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const nextAuthToken = await getToken({
      req,
      secret: NEXTAUTH_SECRET,
    }).catch(() => null);

    const headerEmail = req.headers.get('x-auth-user-email');
    const headerUserId = req.headers.get('x-auth-user-id');

    const searchParams = req.nextUrl.searchParams;
    const queryEmail = searchParams.get('email');
    const queryUserId = searchParams.get('userId');

    // Authenticated email determination
    const userEmail = (
      nextAuthToken?.email ||
      headerEmail ||
      queryEmail ||
      ''
    ).trim().toLowerCase();

    const userId = (nextAuthToken?.id as string) || headerUserId || queryUserId || undefined;

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in to access order history and invoices.',
          requiresLogin: true,
        },
        { status: 401 }
      );
    }

    // If queryEmail is different from authenticated session email, verify permissions
    if (nextAuthToken?.email && queryEmail && queryEmail.toLowerCase() !== nextAuthToken.email.toLowerCase()) {
      const isAdmin =
        nextAuthToken.email.toLowerCase().includes('neerajrekwar') ||
        nextAuthToken.email.toLowerCase().includes('admin');
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to view purchase history for another account.' },
          { status: 403 }
        );
      }
    }

    // Fetch user profile to cross-reference active plan
    const profile = await findUserByEmail(userEmail);
    const activePlan = profile?.plan || (nextAuthToken?.plan as string) || 'free';

    // Query 'purchases' collection
    const purchases = await getPurchasesForUser(userEmail, userId);

    return NextResponse.json({
      success: true,
      userEmail,
      activePlan,
      totalCount: purchases.length,
      purchases,
    });
  } catch (err: any) {
    console.error('[API user/purchases] Error fetching purchases:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to retrieve purchase history and invoices.',
        purchases: [],
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint to record or generate a test receipt/order for verified users
 */
export async function POST(req: NextRequest) {
  try {
    const nextAuthToken = await getToken({
      req,
      secret: NEXTAUTH_SECRET,
    }).catch(() => null);
    const headerEmail = req.headers.get('x-auth-user-email');
    const body = await req.json().catch(() => ({}));

    const userEmail = (
      nextAuthToken?.email ||
      headerEmail ||
      body.email ||
      ''
    ).trim().toLowerCase();

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const newPurchase = await createPurchaseRecord({
      userEmail,
      userName: body.userName || (nextAuthToken?.name as string) || 'Subscriber',
      plan: body.plan || 'pro',
      planName: body.planName || 'Pro Athlete Pass',
      amount: Number(body.amount) || 9.99,
      amountFormatted: body.amountFormatted || `$${(Number(body.amount) || 9.99).toFixed(2)}`,
      currency: body.currency || 'USD',
      billingCycle: body.billingCycle || 'monthly',
      gateway: body.gateway || 'Razorpay',
      status: 'Paid',
      paymentId: body.paymentId,
      orderId: body.orderId,
      couponCode: body.couponCode,
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase and invoice recorded successfully into purchases collection',
      purchase: newPurchase,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to record purchase.' },
      { status: 500 }
    );
  }
}
