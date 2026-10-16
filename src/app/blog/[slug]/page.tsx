import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRESET_POSTS, SanityPost } from '@/lib/sanity';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = PRESET_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Publication Not Found | Nedject Blog',
    };
  }

  const siteUrl = getSiteUrl();

  return createPageMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: 'article',
    publishedTime: post.publishedAt,
    authors: [post.author.name],
    tags: post.tags,
    imageUrl: post.mainImage.url,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = PRESET_POSTS.find((p) => p.slug === slug);

  if (!post) {
    // If not found in presets, check if there's a fallback placeholder
    notFound();
  }

  const blogPostingJsonLd = buildBlogPostingJsonLd({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    datePublished: post.publishedAt,
    authorName: post.author.name,
    imageUrl: post.mainImage.url,
    keywords: post.tags,
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
