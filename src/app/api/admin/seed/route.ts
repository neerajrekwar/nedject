import { NextRequest, NextResponse } from 'next/server';
import { EXTENDED_SEED_POSTS } from '@/lib/seed-data';
import { PRESET_AUTHORS, PRESET_CATEGORIES } from '@/lib/sanity';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    let mongoPostsCount = 0;
    if (db) {
      mongoPostsCount = await db.collection('posts').countDocuments();
    }

    return NextResponse.json({
      success: true,
      message: 'Nedject Admin Seeder API ready',
      seedPostsCount: EXTENDED_SEED_POSTS.length,
      mongoConnected: Boolean(db),
      mongoPostsCount,
      seedPackage: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        posts: EXTENDED_SEED_POSTS,
        categories: PRESET_CATEGORIES,
        authors: PRESET_AUTHORS,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { overwrite = false, customPosts } = body;

    const postsToSeed = Array.isArray(customPosts) && customPosts.length > 0 ? customPosts : EXTENDED_SEED_POSTS;

    const db = await getDb();
    let dbResult = 'MongoDB not configured, client-side localStorage handles persistence';

    if (db) {
      const collection = db.collection('posts');
      if (overwrite) {
        await collection.deleteMany({});
      }
      for (const p of postsToSeed) {
        await collection.updateOne(
          { slug: p.slug },
          { $set: p },
          { upsert: true }
        );
      }
      dbResult = `Successfully seeded ${postsToSeed.length} posts to MongoDB database: ${db.databaseName}`;
    }

    return NextResponse.json({
      success: true,
      seededCount: postsToSeed.length,
      dbResult,
      posts: postsToSeed,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('posts').deleteMany({});
      return NextResponse.json({ success: true, message: 'MongoDB posts collection wiped clean.' });
    }
    return NextResponse.json({ success: true, message: 'Reset signal issued for client storage.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
