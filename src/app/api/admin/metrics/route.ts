import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

function getLocalAdmins() {
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.admins)) return data.admins;
      if (data.email) return [data];
    } catch (e) {}
  }
  return [];
}

export async function GET() {
  try {
    const db = await getDb();
    const localAdmins = getLocalAdmins();

    if (!db) {
      return NextResponse.json({
        success: true,
        isRealtime: true,
        mongoConnected: false,
        users: { total: 0, pro: 0, free: 0, enterprise: 0, recent: [] },
        generations: { total: 0, recent: [] },
        posts: { total: 0, published: 0, draft: 0, recent: [] },
        admins: { total: localAdmins.length, list: localAdmins },
        revenue: { total: 0, activeSubscribers: 0 },
        purchases: [],
        dailyActivity: [],
        toolBreakdown: [],
      });
    }

    // 1. REAL USERS
    const usersCol = db.collection('users');
    const totalUsers = await usersCol.countDocuments();
    const proUsers = await usersCol.countDocuments({ plan: 'pro' });
    const enterpriseUsers = await usersCol.countDocuments({ plan: 'enterprise' });
    const freeUsers = Math.max(0, totalUsers - proUsers - enterpriseUsers);

    const recentUsersDocs = await usersCol
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .limit(10)
      .toArray();

    const recentUsers = recentUsersDocs.map((u) => ({
      id: u._id.toString(),
      name: u.name || 'User',
      email: u.email,
      plan: u.plan || 'free',
      createdAt: u.createdAt || new Date().toISOString(),
      image: u.image || '',
    }));

    // 2. REAL PURCHASES / PAID SUBSCRIBERS
    const paidUsersDocs = await usersCol
      .find({
        plan: { $in: ['pro', 'enterprise'] },
        subscriptionStatus: { $ne: 'cancelled' },
      })
      .sort({ updatedAt: -1 })
      .toArray();

    let realRevenueTotal = 0;

    const purchases = paidUsersDocs.map((pu, idx) => {
      const isEnt = pu.plan === 'enterprise';
      const isAnnual = pu.subscriptionBillingCycle === 'annual';

      let planName = isEnt
        ? isAnnual
          ? 'Enterprise (Annual)'
          : 'Enterprise (Monthly)'
        : isAnnual
        ? 'Pro Athlete (Annual)'
        : 'Pro Athlete (Monthly)';

      let amountStr = isEnt
        ? isAnnual
          ? '$249.00 / yr'
          : '$29.00 / mo'
        : isAnnual
        ? '$99.00 / yr'
        : '$9.99 / mo';

      // Monthly MRR calculation
      if (isEnt) {
        realRevenueTotal += isAnnual ? 249.0 / 12 : 29.0;
      } else {
        realRevenueTotal += isAnnual ? 99.0 / 12 : 9.99;
      }

      const gateway = pu.planAssignedBy === 'admin' ? 'Admin Override' : 'Razorpay';

      return {
        id: `sub-${pu._id.toString().slice(-6)}`,
        name: pu.name || 'Subscriber',
        email: pu.email,
        plan: planName,
        amount: amountStr,
        gateway,
        date: pu.updatedAt ? new Date(pu.updatedAt).toLocaleDateString() : 'Active',
        status: pu.subscriptionStatus || 'Active',
        invoiceId: `INV-${new Date().getFullYear()}-${1000 + idx}`,
        avatar: pu.image || '',
        expiresAt: pu.subscriptionExpiresAt,
      };
    });

    // 3. REAL QR GENERATIONS
    const qrCol = db.collection('qr_history');
    const totalGenerations = await qrCol.countDocuments();
    const recentGenerationsDocs = await qrCol
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const recentGenerations = recentGenerationsDocs.map((q) => ({
      id: q.id || q._id.toString(),
      title: q.title || 'QR Code Matrix',
      format: q.format || '300 DPI PNG',
      contrast: q.contrast || 21.0,
      dateFormatted: q.dateFormatted || (q.timestamp ? new Date(q.timestamp).toLocaleString() : 'Recent'),
      userEmail: q.userEmail || 'guest',
      clientIp: q.clientIp || '',
    }));

    // 4. REAL TOOL BREAKDOWN
    const usageCol = db.collection('usage_records');
    const usageRecords = await usageCol.find({}).toArray();

    const toolCounts: Record<string, number> = {};
    for (const rec of usageRecords) {
      if (rec.toolBreakdown && typeof rec.toolBreakdown === 'object') {
        for (const [tool, count] of Object.entries(rec.toolBreakdown)) {
          toolCounts[tool] = (toolCounts[tool] || 0) + (Number(count) || 0);
        }
      }
    }

    // Also factor in formats from qr_history
    const allQrDocs = await qrCol.find({}, { projection: { format: 1, title: 1 } }).toArray();
    for (const q of allQrDocs) {
      const fmt = q.format || '300 DPI Photo QR';
      toolCounts[fmt] = (toolCounts[fmt] || 0) + 1;
    }

    const totalToolUsage = Object.values(toolCounts).reduce((a, b) => a + b, 0);
    const toolBreakdown = Object.entries(toolCounts).map(([name, count]) => {
      const sharePct = totalToolUsage > 0 ? Math.round((count / totalToolUsage) * 100) : 0;
      let color = 'bg-[#ccff00]';
      if (name.includes('Barcode') || name.includes('barcode')) color = 'bg-blue-500';
      else if (name.includes('Fit') || name.includes('fitness')) color = 'bg-emerald-500';
      else if (name.includes('Mockup')) color = 'bg-purple-500';

      return {
        name,
        count: count.toLocaleString(),
        share: `${sharePct}%`,
        color,
      };
    });

    // 5. REAL DAILY ACTIVITY (Last 7 Days)
    const nowMs = Date.now();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyMap: Record<string, { visitors: number; generations: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000);
      const dayKey = days[d.getDay()];
      dailyMap[dayKey] = { visitors: 0, generations: 0 };
    }

    // Tally real qr_history by day
    for (const q of recentGenerationsDocs) {
      const ts = q.timestamp || (q.savedAt ? new Date(q.savedAt).getTime() : 0);
      if (ts && nowMs - ts < 7 * 86400000) {
        const d = new Date(ts);
        const dayKey = days[d.getDay()];
        if (dailyMap[dayKey]) {
          dailyMap[dayKey].generations += 1;
          dailyMap[dayKey].visitors += 1;
        }
      }
    }

    const dailyActivity = Object.entries(dailyMap).map(([day, stats]) => ({
      day,
      generations: stats.generations,
      visitors: stats.visitors,
    }));

    // 6. REAL POSTS
    const postsCol = db.collection('posts');
    const totalPosts = await postsCol.countDocuments();
    const publishedPosts = await postsCol.countDocuments({ status: 'published' });
    const draftPosts = await postsCol.countDocuments({ status: 'draft' });

    const recentPostsDocs = await postsCol
      .find({})
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    const recentPosts = recentPostsDocs.map((p) => ({
      _id: p._id?.toString() || p.id,
      title: p.title,
      slug: p.slug,
      status: p.status || 'published',
      publishedAt: p.publishedAt || 'Recent',
      category: p.category || { title: 'General' },
    }));

    // 7. REAL ADMIN ACCOUNTS
    const adminCol = db.collection('admin_credentials');
    const mongoAdmins = await adminCol.find({}).toArray();
    const allAdmins = mongoAdmins.length > 0 ? mongoAdmins : localAdmins;

    return NextResponse.json({
      success: true,
      isRealtime: true,
      mongoConnected: true,
      users: {
        total: totalUsers,
        pro: proUsers,
        enterprise: enterpriseUsers,
        free: freeUsers,
        recent: recentUsers,
      },
      generations: {
        total: totalGenerations,
        recent: recentGenerations,
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        recent: recentPosts,
      },
      admins: {
        total: allAdmins.length,
        list: allAdmins.map((a: any) => ({
          email: a.email,
          name: a.name || 'Admin',
          role: a.role || 'Super Admin',
          updatedAt: a.updatedAt,
        })),
      },
      revenue: {
        total: `$${realRevenueTotal.toFixed(2)}`,
        rawTotal: realRevenueTotal,
        activeSubscribers: proUsers + enterpriseUsers,
      },
      purchases, // Real paid customers array (empty if 0 paid users)
      toolBreakdown, // Real breakdown (empty if 0)
      dailyActivity, // Real daily activity
    });
  } catch (error: any) {
    console.error('Error fetching real-time admin metrics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch real-time telemetry' },
      { status: 500 }
    );
  }
}
