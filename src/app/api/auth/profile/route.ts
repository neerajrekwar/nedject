import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { findUserByEmail, findUserById, updateUserProfile } from '@/lib/db-users';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = req.nextUrl.searchParams.get('userId');
    const email = req.nextUrl.searchParams.get('email') || session?.user?.email;

    if (!session?.user && !userId && !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = null;
    if (userId) {
      user = await findUserById(userId);
    }
    if (!user && email) {
      user = await findUserByEmail(email);
    }
    if (!user && session?.user?.email) {
      user = await findUserByEmail(session.user.email);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userEmail = (user.email || '').toLowerCase();
    const isIndian =
      userEmail.includes('neerajrekwar') ||
      userEmail.endsWith('.in') ||
      (user as any).currency === 'INR';
    const currency = (user as any).currency || (isIndian ? 'INR' : 'USD');
    const country = (user as any).country || (isIndian ? 'India' : 'United States');

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        occupation: user.occupation,
        plan: user.plan,
        currency,
        country,
        generationsLimit: user.generationsLimit,
        generationsUsed: user.generationsUsed,
        provider: user.provider,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized: Valid authenticated session required' }, { status: 401 });
    }

    const email = session.user.email;
    const body = await req.json();

    // SECURITY: Users can only update their own display name, dob, occupation, country, and currency.
    // 'plan' and 'generationsLimit' cannot be modified from profile endpoint (must go through verified payment).
    const { name, dob, occupation, currency, country } = body;

    const updated = await updateUserProfile(email, {
      name: typeof name === 'string' ? name.trim() : undefined,
      dob: typeof dob === 'string' ? dob.trim() : undefined,
      occupation: typeof occupation === 'string' ? occupation.trim() : undefined,
      currency: typeof currency === 'string' ? currency.trim().toUpperCase() : undefined,
      country: typeof country === 'string' ? country.trim() : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const resolvedEmail = (updated.email || '').toLowerCase();
    const isIndianResolved =
      resolvedEmail.includes('neerajrekwar') ||
      resolvedEmail.endsWith('.in') ||
      (updated as any).currency === 'INR';
    const finalCurrency = (updated as any).currency || (isIndianResolved ? 'INR' : 'USD');
    const finalCountry = (updated as any).country || (isIndianResolved ? 'India' : 'United States');

    return NextResponse.json({
      message: 'Profile updated successfully in MongoDB database',
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        dob: updated.dob,
        occupation: updated.occupation,
        plan: updated.plan,
        currency: finalCurrency,
        country: finalCountry,
        generationsLimit: updated.generationsLimit,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
