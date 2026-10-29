import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, users: [], total: 0 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const plan = searchParams.get('plan') || 'all';

    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (plan !== 'all') {
      query.plan = plan;
    }

    const docs = await db
      .collection('users')
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const users = docs.map((u) => ({
      _id: u._id.toString(),
      name: u.name || 'Anonymous User',
      email: u.email,
      plan: u.plan || 'free',
      subscriptionBillingCycle: u.subscriptionBillingCycle || (u.plan !== 'free' ? 'monthly' : undefined),
      subscriptionStatus: u.subscriptionStatus || (u.plan !== 'free' ? 'active' : 'none'),
      subscriptionExpiresAt: u.subscriptionExpiresAt || null,
      planAssignedBy: u.planAssignedBy || (u.plan !== 'free' ? 'system' : undefined),
      generationsLimit: u.generationsLimit ?? 10,
      generationsUsed: u.generationsUsed ?? 0,
      provider: u.provider || 'credentials',
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: u.updatedAt || new Date().toISOString(),
      hasGoogleFit: Boolean(u.googleFitTokens?.accessToken),
      image: u.image || '',
    }));

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const {
      userId,
      email,
      action,
      plan,
      billingCycle = 'monthly',
      durationDays,
      isLifetime = false,
      generationsLimit,
      resetUsed,
    } = body;

    const query: any = {};
    if (userId) {
      try {
        query._id = new ObjectId(userId);
      } catch (e) {
        query.email = email?.toLowerCase().trim();
      }
    } else if (email) {
      query.email = email.toLowerCase().trim();
    } else {
      return NextResponse.json({ success: false, error: 'userId or email is required' }, { status: 400 });
    }

    const now = new Date();
    const updateDoc: any = {
      updatedAt: now.toISOString(),
    };

    // 1. CANCEL SUBSCRIPTION BY ADMIN
    if (action === 'cancel' || action === 'cancel_subscription') {
      updateDoc.plan = 'free';
      updateDoc.subscriptionStatus = 'cancelled';
      updateDoc.subscriptionExpiresAt = now.toISOString();
      updateDoc.generationsLimit = 10;
      updateDoc.planAssignedBy = 'admin_cancelled';

      const result = await db.collection('users').updateOne(query, { $set: updateDoc });
      return NextResponse.json({
        success: true,
        modifiedCount: result.modifiedCount,
        message: 'Subscription cancelled by admin. Account reverted to Free tier.',
      });
    }

    // 2. SET PLAN MANUALLY BY ADMIN (PRO / ENTERPRISE with MONTHLY or ANNUAL)
    if (plan && ['free', 'pro', 'enterprise'].includes(plan)) {
      updateDoc.plan = plan;

      if (plan === 'free') {
        updateDoc.subscriptionBillingCycle = null;
        updateDoc.subscriptionStatus = 'none';
        updateDoc.subscriptionExpiresAt = null;
        updateDoc.generationsLimit = 10;
        updateDoc.planAssignedBy = 'admin';
      } else {
        const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
        updateDoc.subscriptionBillingCycle = cycle;
        updateDoc.subscriptionStatus = 'active';
        updateDoc.planAssignedBy = 'admin';

        // Calculate expiration date
        if (isLifetime) {
          updateDoc.subscriptionExpiresAt = null; // No expiry
        } else if (typeof durationDays === 'number' && durationDays > 0) {
          const exp = new Date(now.getTime() + durationDays * 86400000);
          updateDoc.subscriptionExpiresAt = exp.toISOString();
        } else if (cycle === 'annual') {
          const exp = new Date(now.getTime() + 365 * 86400000);
          updateDoc.subscriptionExpiresAt = exp.toISOString();
        } else {
          const exp = new Date(now.getTime() + 30 * 86400000);
          updateDoc.subscriptionExpiresAt = exp.toISOString();
        }

        updateDoc.generationsLimit = plan === 'enterprise' ? 999999 : 99999;
      }
    }

    if (typeof generationsLimit === 'number') {
      updateDoc.generationsLimit = generationsLimit;
    }

    if (resetUsed) {
      updateDoc.generationsUsed = 0;
    }

    const result = await db.collection('users').updateOne(query, { $set: updateDoc });

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Plan successfully updated to [${(plan || 'custom').toUpperCase()}] by admin.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const email = searchParams.get('email');

    const query: any = {};
    if (userId) {
      try {
        query._id = new ObjectId(userId);
      } catch (e) {
        query.email = email?.toLowerCase().trim();
      }
    } else if (email) {
      query.email = email.toLowerCase().trim();
    } else {
      return NextResponse.json({ success: false, error: 'id or email is required' }, { status: 400 });
    }

    await db.collection('users').deleteOne(query);

    return NextResponse.json({
      success: true,
      message: 'User deleted from MongoDB successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
