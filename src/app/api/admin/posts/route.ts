import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { EXTENDED_SEED_POSTS } from '@/lib/seed-data';
import { SanityPost } from '@/lib/sanity';

// GET all posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const db = await getDb();
    if (db) {
      if (slug) {
        const post = await db.collection('posts').findOne({ slug });
        return NextResponse.json({ success: true, post });
      }
      const posts = await db.collection('posts').find({}).toArray();
      if (posts.length > 0) {
        return NextResponse.json({ success: true, source: 'mongodb', posts });
      }
    }

    if (slug) {
      const found = EXTENDED_SEED_POSTS.find((p) => p.slug === slug);
      return NextResponse.json({ success: true, post: found || null });
    }

    return NextResponse.json({
      success: true,
      source: 'seed_defaults',
      posts: EXTENDED_SEED_POSTS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// POST: Direct Create Post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const title = body.title.trim();
    const slug = body.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newPost: SanityPost = {
      _id: body._id || `post-${Date.now()}`,
      _type: 'post',
      title,
      slug,
      excerpt: body.excerpt?.trim() || title,
      content: body.content || '<p>Directly created technical article content.</p>',
      mainImage: body.mainImage || {
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85',
        alt: title,
      },
      author: body.author || {
        _id: 'author-neeraj-rekwar',
        name: 'Neeraj Rekwar',
        role: 'Lead Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
        bio: 'Lead Engineer of Nedject',
      },
      category: body.category || {
        _id: 'cat-print',
        title: 'Print Engineering',
        slug: 'print-engineering',
        color: '#0055ff',
      },
      tags: body.tags || ['Engineering', '300 DPI'],
      publishedAt: body.publishedAt || new Date().toLocaleDateString('en-US'),
      estimatedReadingTime: body.estimatedReadingTime || '5 min read',
      status: body.status || 'published',
      isFeatured: Boolean(body.isFeatured),
    };

    const db = await getDb();
    if (db) {
      await db.collection('posts').updateOne(
        { slug: newPost.slug },
        { $set: newPost },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post directly created / updated',
      post: newPost,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// PUT: Direct Update Post
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, slug, ...updates } = body;

    if (!_id && !slug) {
      return NextResponse.json({ success: false, error: 'Provide _id or slug to update' }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      const filter = _id ? { _id } : { slug };
      const res = await db.collection('posts').updateOne(filter, { $set: updates });
      return NextResponse.json({ success: true, updatedCount: res.modifiedCount });
    }

    return NextResponse.json({
      success: true,
      message: 'Update acknowledged (client will persist in localStorage)',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// DELETE: Direct Delete Post
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Provide id or slug to delete' }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      const filter = id ? { _id: id } : { slug };
      const res = await db.collection('posts').deleteOne(filter);
      return NextResponse.json({ success: true, deletedCount: res.deletedCount });
    }

    return NextResponse.json({
      success: true,
      message: 'Delete acknowledged for client-side storage',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
