import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId, Filter, Document } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { PRESET_POSTS, SanityPost } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

function getFallbackPosts(): SanityPost[] {
  const backup = path.join(process.cwd(), 'data', 'posts.json');
  if (fs.existsSync(backup)) {
    try {
      const raw = fs.readFileSync(backup, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (e) {
      console.warn('Error reading data/posts.json:', e);
    }
  }
  return PRESET_POSTS;
}

function saveFallbackPosts(posts: SanityPost[]): void {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const backup = path.join(dataDir, 'posts.json');
    fs.writeFileSync(backup, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error saving data/posts.json:', e);
  }
}

// GET: Retrieve posts or a single post by slug/id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    let dbPosts: SanityPost[] = [];
    const db = await getDb();

    if (db) {
      try {
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
          if (post) {
            return NextResponse.json({ success: true, post });
          }
        } else {
          dbPosts = (await collection.find({}).sort({ publishedAt: -1 }).toArray()) as any;
          // If collection is completely empty, auto-seed with PRESET_POSTS
          if (dbPosts.length === 0) {
            const presets = getFallbackPosts();
            if (presets.length > 0) {
              await collection.insertMany(presets.map((p) => ({ ...p })) as any);
              dbPosts = presets;
            }
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB query warning in GET /api/admin/posts:', dbErr);
      }
    }

    // Single post request fallback
    if (id || slug) {
      const fallbackList = getFallbackPosts();
      const post = fallbackList.find((p) => (id ? p._id === id : p.slug === slug));
      if (post) {
        return NextResponse.json({ success: true, post });
      }
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    // All posts request
    const finalPosts = dbPosts.length > 0 ? dbPosts : getFallbackPosts();
    return NextResponse.json({
      success: true,
      posts: finalPosts,
      total: finalPosts.length,
    });
  } catch (err: any) {
    const fallbackList = getFallbackPosts();
    return NextResponse.json({
      success: true,
      posts: fallbackList,
      total: fallbackList.length,
      fallbackActive: true,
      error: err?.message,
    });
  }
}

// POST: Create new blog post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newPost: SanityPost = {
      ...body,
      _id: body._id || `post-${Date.now()}`,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    // 1. Sync to data/posts.json
    const localPosts = getFallbackPosts();
    const existingIndex = localPosts.findIndex((p) => p._id === newPost._id || p.slug === newPost.slug);
    if (existingIndex >= 0) {
      localPosts[existingIndex] = newPost;
    } else {
      localPosts.unshift(newPost);
    }
    saveFallbackPosts(localPosts);

    // 2. Sync to MongoDB if available
    const db = await getDb();
    if (db) {
      try {
        const collection = db.collection('posts');
        await collection.insertOne(newPost as any);
      } catch (e) {
        console.warn('MongoDB insert warning:', e);
      }
    }

    return NextResponse.json({ success: true, post: newPost });
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

    // 1. Sync to data/posts.json
    const localPosts = getFallbackPosts();
    const existingIndex = localPosts.findIndex((p) => (targetId ? p._id === targetId : p.slug === slug));
    let updatedPost: SanityPost | null = null;

    if (existingIndex >= 0) {
      localPosts[existingIndex] = {
        ...localPosts[existingIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      updatedPost = localPosts[existingIndex];
      saveFallbackPosts(localPosts);
    }

    // 2. Sync to MongoDB if available
    const db = await getDb();
    if (db) {
      try {
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

        await collection.updateOne(filter, {
          $set: {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (e) {
        console.warn('MongoDB update warning:', e);
      }
    }

    return NextResponse.json({ success: true, post: updatedPost, message: 'Post updated successfully' });
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

    // 1. Sync to data/posts.json
    const localPosts = getFallbackPosts();
    const filtered = localPosts.filter((p) => (id ? p._id !== id : p.slug !== slug));
    saveFallbackPosts(filtered);

    // 2. Sync to MongoDB if available
    const db = await getDb();
    if (db) {
      try {
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

        await collection.deleteOne(filter);
      } catch (e) {
        console.warn('MongoDB delete warning:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete post' }, { status: 500 });
  }
}
