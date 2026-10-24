import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRESET_POSTS, SanityPost } from '@/lib/sanity';
import { getDb } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';
import {
  createPageMetadata,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  getSiteUrl,
} from '@/lib/seo';
import { BlogPostClientView } from './BlogPostClientView';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function findRealPostBySlug(slug: string): Promise<SanityPost | null> {
  // 1. Check MongoDB first for live real-time post
  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection('posts').findOne({ slug });
      if (doc) return doc as any;
    }
  } catch (e) {}

  // 2. Check local data/posts.json
  const backup = path.join(process.cwd(), 'data', 'posts.json');
  if (fs.existsSync(backup)) {
    try {
      const raw = fs.readFileSync(backup, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const found = list.find((p: any) => p.slug === slug);
        if (found) return found;
      }
    } catch (e) {}
  }

  // 3. Fallback to PRESET_POSTS
  return PRESET_POSTS.find((p) => p.slug === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await findRealPostBySlug(slug);

  if (!post) {
    return {
      title: 'Publication Not Found | Nedject Blog',
    };
  }

  return createPageMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: 'article',
    publishedTime: post.publishedAt,
    authors: [post.author?.name || 'Neeraj Rekwar'],
    tags: post.tags || [],
    imageUrl: post.mainImage?.url || '',
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await findRealPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blogPostingJsonLd = buildBlogPostingJsonLd({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    datePublished: post.publishedAt,
    authorName: post.author?.name || 'Neeraj Rekwar',
    imageUrl: post.mainImage?.url || '',
    keywords: post.tags || [],
  });

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Engineering Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5f0] text-black">
      <BlogPostClientView initialPost={post} slug={slug} />

      {/* Schema.org BlogPosting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
    </main>
  );
}
