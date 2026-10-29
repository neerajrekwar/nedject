import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, items: [], total: 0 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const format = searchParams.get('format') || 'all';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { clientIp: { $regex: search, $options: 'i' } },
      ];
    }
    if (format !== 'all') {
      query.format = { $regex: format, $options: 'i' };
    }

    const col = db.collection('qr_history');
    const total = await col.countDocuments(query);
    const docs = await col
      .find(query)
      .sort({ timestamp: -1, _id: -1 })
      .limit(limit)
      .toArray();

    const items = docs.map((doc) => ({
      _id: doc._id.toString(),
      id: doc.id || doc._id.toString(),
      title: doc.title || 'QR Code Matrix',
      content: doc.content || doc.options?.text || '',
      format: doc.format || '300 DPI PNG',
      contrast: doc.contrast || 21.0,
      timestamp: doc.timestamp || (doc.savedAt ? new Date(doc.savedAt).getTime() : Date.now()),
      dateFormatted: doc.dateFormatted || new Date().toLocaleString(),
      userEmail: doc.userEmail || 'guest',
      clientIp: doc.clientIp || '',
      isPublicOrGuest: doc.isPublicOrGuest ?? true,
      options: doc.options || {},
    }));

    return NextResponse.json({
      success: true,
      items,
      total,
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
    const id = searchParams.get('id');
    const purgeGuest = searchParams.get('purgeGuest') === 'true';

    const col = db.collection('qr_history');

    if (purgeGuest) {
      const res = await col.deleteMany({
        $or: [{ userEmail: 'guest' }, { isPublicOrGuest: true }],
      });
      return NextResponse.json({
        success: true,
        deletedCount: res.deletedCount,
        message: `Purged ${res.deletedCount} guest records`,
      });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    let query: any = { id };
    try {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    } catch (e) {}

    const res = await col.deleteOne(query);

    return NextResponse.json({
      success: true,
      deletedCount: res.deletedCount,
      message: 'Generation record deleted',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
