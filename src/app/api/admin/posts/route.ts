import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId, Filter, Document } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET: Retrieve posts or a single post by slug/id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    const db = await getDb();
    if (!db) {
      return NextResponse.json({
        success: true,
        data: [],
        source: 'memory_fallback',
        message: 'MongoDB not connected, client-side fallback active',
      });
    }

    const collection = db.collection('posts');

    if (id || slug) {
      let filter: Filter<Document> = {};
      if (id) {
        if (ObjectId.isValid(id)) {
          filter = { $or: [{ _id: new ObjectId(id) }, { _id: id as any }, { id }] };
        } else {
          filter = { $or: [{ _id: id as any }, { id }] };
        }
      } else if (slug) {
        filter = { slug };
      }

      const post = await collection.findOne(filter);
      return NextResponse.json({ success: true, post });
    }

    const posts = await collection.find({}).sort({ publishedAt: -1 }).toArray();
    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create new blog post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      const collection = db.collection('posts');
      const now = new Date().toISOString();
      const newPost = {
        ...body,
        createdAt: body.createdAt || now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newPost);
      return NextResponse.json({ success: true, insertedId: result.insertedId, post: newPost });
    }

    return NextResponse.json({
      success: true,
      post: body,
      source: 'local_storage_ready',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create post' }, { status: 500 });
  }
}

// PUT: Update an existing post
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, id, slug, ...updates } = body;

    const targetId = _id || id;
    if (!targetId && !slug) {
      return NextResponse.json({ success: false, error: 'Post _id, id, or slug is required for update' }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      const collection = db.collection('posts');
      let filter: Filter<Document> = {};

      if (targetId) {
        if (typeof targetId === 'string' && ObjectId.isValid(targetId)) {
          filter = { $or: [{ _id: new ObjectId(targetId) }, { _id: targetId as any }, { id: targetId }] };
        } else {
          filter = { $or: [{ _id: targetId as any }, { id: targetId }] };
        }
      } else if (slug) {
        filter = { slug };
      }

      const res = await collection.updateOne(filter, {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({ success: true, modifiedCount: res.modifiedCount });
    }

    return NextResponse.json({ success: true, message: 'Update acknowledged' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update post' }, { status: 500 });
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
      const collection = db.collection('posts');
      let filter: Filter<Document> = {};

      if (id) {
        if (ObjectId.isValid(id)) {
          filter = { $or: [{ _id: new ObjectId(id) }, { _id: id as any }, { id }] };
        } else {
          filter = { $or: [{ _id: id as any }, { id }] };
        }
      } else if (slug) {
        filter = { slug };
      }

      const res = await collection.deleteOne(filter);
      return NextResponse.json({ success: true, deletedCount: res.deletedCount });
    }

    return NextResponse.json({
      success: true,
      message: 'Delete acknowledged for client-side storage',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete post' }, { status: 500 });
  }
}
