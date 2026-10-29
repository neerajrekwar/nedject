import { NextRequest, NextResponse } from 'next/server';
import { getAllPlans, savePlan, resetPlansToDefault, ManagedPlan } from '@/lib/plans-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await getAllPlans();
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error: any) {
    console.error('[API Plans] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load plans' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminHeader = req.headers.get('x-auth-is-admin');
    const adminCookie = req.cookies.get('nedject_admin_token')?.value;
    const isAuthorized = adminHeader === 'true' || adminCookie === 'authorized';

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // If reset action requested
    if (body.action === 'reset') {
      const resetPlans = await resetPlansToDefault();
      return NextResponse.json({
        success: true,
        message: 'Plans reset to default configurations.',
        plans: resetPlans,
      });
    }

    const planData: ManagedPlan = body.plan;
    if (!planData || !planData.id || !planData.pricing) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan configuration payload.' },
        { status: 400 }
      );
    }

    const updated = await savePlan(planData);
    return NextResponse.json({
      success: true,
      message: `Plan "${updated.name}" updated successfully.`,
      plan: updated,
    });
  } catch (error: any) {
    console.error('[API Plans] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save plan configuration' },
      { status: 500 }
    );
  }
}
