'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Copy,
  Tag,
  PenSquare,
  BookOpen,
  Bookmark,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SanityPost, getPostBySlug, PRESET_POSTS } from '@/lib/sanity';
import { getSiteUrl } from '@/lib/seo';
import { StoryShareButton } from '@/components/story/StoryShareButton';

interface Props {
  initialPost: SanityPost;
  slug: string;
}

export function BlogPostClientView({ initialPost, slug }: Props) {
  const [post, setPost] = useState<SanityPost>(initialPost);
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Sync if post was updated in Sanity Studio
  useEffect(() => {
    const fresh = getPostBySlug(slug);
    if (fresh) {
      setPost(fresh);
    }

    const handleUpdate = () => {
      const updated = getPostBySlug(slug);
      if (updated) setPost(updated);
    };

    window.addEventListener('nedject_sanity_updated', handleUpdate);
    return () => window.removeEventListener('nedject_sanity_updated', handleUpdate);
  }, [slug]);

  // Extract H2 headings for Table of Contents
  const headings = React.useMemo(() => {
    const lines = post.content.split('\n');
    const result: { id: string; text: string }[] = [];
    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        result.push({ id, text });
      }
    });
    return result;
  }, [post.content]);

  const handleCopyLink = () => {
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}/blog/${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}/blog/${post.slug}`;
    const text = encodeURIComponent(`${post.title} via @Nedject`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}/blog/${post.slug}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  // Find related posts
  const relatedPosts = PRESET_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Nav Breadcrumb & Sanity Studio Quick Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 font-mono text-xs border-b-2 border-black pb-4">
        <div className="flex items-center gap-2 text-zinc-600">
          <Link href="/" className="hover:text-black font-bold">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-black font-bold">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-black truncate max-w-[200px] sm:max-w-md">
            {post.category.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/blog/manage?edit=${post._id}`}
            className="inline-flex items-center gap-1.5 bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000000] transition-colors"
          >
            <PenSquare className="w-3 h-3" />
            <span>EDIT IN SANITY STUDIO</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-8 border-4 border-black bg-white p-6 sm:p-10 shadow-[6px_6px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-black text-[#ccff00] text-xs font-black font-mono px-2.5 py-1 border border-black">
            {post.category.title}
          </span>
          <span className="bg-zinc-100 border border-black text-xs font-mono px-2 py-1 font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="bg-zinc-100 border border-black text-xs font-mono px-2 py-1 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            {post.estimatedReadingTime}
          </span>
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-600 text-[11px] font-mono px-2 py-0.5 font-bold flex items-center gap-1 ml-auto">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            ISO/IEC Print Verified
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black font-sans leading-[1.15]">
          {post.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-zinc-700 font-mono leading-relaxed max-w-4xl border-l-4 border-black pl-4 bg-zinc-50 py-2">
          {post.excerpt}
        </p>

        {/* Author Card & Social Share Bar */}
        <div className="mt-8 pt-6 border-t-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-black">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-black text-sm text-black">{post.author.name}</div>
              <div className="text-xs text-zinc-600">{post.author.role}</div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <StoryShareButton
              variant="button"
              label="INSTAGRAM / WEB STORY"
              pageTitle={post.title}
              pageDescription={post.excerpt}
              category={post.category.title}
              className="!bg-[#ccff00] !text-black !border-black"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-black bg-zinc-50 hover:bg-zinc-200 text-xs font-bold transition-all shadow-[1px_1px_0px_#000000]"
              title="Copy canonical link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY LINK'}</span>
            </button>
            <button
              onClick={handleShareTwitter}
              className="px-2.5 py-1.5 border border-black bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-[1px_1px_0px_#000000]"
              title="Share on X / Twitter"
            >
              𝕏 Share
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="px-2.5 py-1.5 border border-black bg-[#0077b5] text-white hover:opacity-90 text-xs font-bold shadow-[1px_1px_0px_#000000]"
              title="Share on LinkedIn"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </header>

      {/* Featured Main Image */}
      <div className="border-4 border-black bg-zinc-900 shadow-[6px_6px_0px_#000000] mb-10 overflow-hidden">
        <div className="relative h-72 sm:h-96 md:h-[460px] w-full">
          <Image
            src={post.mainImage.url}
            alt={post.mainImage.alt}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
          />
        </div>
        {post.mainImage.caption && (
          <div className="p-3 bg-zinc-100 border-t-2 border-black text-xs font-mono text-zinc-700 italic flex items-center gap-2">
            <span className="font-bold text-black uppercase tracking-wider not-italic text-[10px] bg-black text-[#ccff00] px-1.5 py-0.5">
              FIGURE SPEC
            </span>
            <span>{post.mainImage.caption}</span>
          </div>
        )}
      </div>

      {/* Layout Grid: Article Content + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 border-4 border-black bg-white p-6 sm:p-10 shadow-[6px_6px_0px_#000000]">
          <div className="prose prose-zinc max-w-none font-sans leading-relaxed text-zinc-900">
            {renderMarkdown(post.content)}
          </div>

          {/* Article Footer Tags */}
          <div className="mt-12 pt-6 border-t-2 border-black font-mono">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              TOPIC TAXONOMY &amp; SPECIFICATIONS
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono bg-zinc-100 border border-black px-2.5 py-1 font-bold text-black shadow-[1px_1px_0px_#000000]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="mt-8 p-5 border-2 border-black bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-black shrink-0">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-zinc-500 uppercase">Written by</div>
              <div className="font-sans text-lg font-black text-black">{post.author.name}</div>
              <div className="font-mono text-xs text-zinc-600 mt-1">{post.author.bio}</div>
            </div>
          </div>
        </div>

        {/* Sticky Sidebar: Table of Contents & Quick Actions */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] sticky top-20 font-mono">
              <div className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-2 flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                TABLE OF CONTENTS
              </div>
              <nav className="mt-3 space-y-1.5 text-xs">
                {headings.map((h, i) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="block text-zinc-700 hover:text-black hover:font-bold hover:translate-x-1 transition-all py-1 border-l-2 border-zinc-200 pl-2 hover:border-black"
                  >
                    <span className="text-zinc-400 mr-1.5">0{i + 1}.</span>
                    {h.text}
                  </a>
                ))}
              </nav>

              {/* Sanity Studio Direct Trigger */}
              <div className="mt-6 pt-4 border-t-2 border-zinc-200">
                <Link
                  href="/blog/manage"
                  className="w-full inline-flex items-center justify-center gap-2 bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs py-2 border border-black shadow-[2px_2px_0px_#000000] transition-colors"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>MANAGE POSTS (SANITY)</span>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Studio Tools Box */}
          <div className="border-4 border-black bg-[#ccff00] p-5 shadow-[4px_4px_0px_#000000] font-mono text-xs">
            <div className="font-black text-sm text-black mb-1">NEDJECT INDUSTRIAL SUITE</div>
            <p className="text-zinc-800 leading-relaxed mb-4">
              Need to generate 300 DPI high-resolution QR codes or standard linear barcodes for production?
            </p>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-center font-bold bg-black text-[#ccff00] hover:bg-white hover:text-black py-2 border border-black transition-colors"
              >
                Launch 300 DPI QR Studio
              </Link>
              <Link
                href="/barcode-pick"
                className="block text-center font-bold bg-white text-black hover:bg-black hover:text-white py-2 border border-black transition-colors"
              >
                Barcode Pick (UPC/EAN/Code 128)
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Articles Section */}
      <div className="mt-12 pt-8 border-t-4 border-black font-mono">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-black font-sans">
            Related Technical Publications
          </h2>
          <Link
            href="/blog"
            className="text-xs font-bold text-black hover:text-blue-700 underline flex items-center gap-1"
          >
            <span>View all articles</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedPosts.map((related) => (
            <div
              key={related._id}
              className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="bg-black text-[#ccff00] text-[10px] font-black px-1.5 py-0.5 border border-black">
                  {related.category.title}
                </span>
                <h3 className="text-lg font-black text-black hover:text-blue-700 transition-colors mt-2 font-sans">
                  <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                </h3>
                <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">
                  {related.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
                <span>{related.estimatedReadingTime}</span>
                <Link
                  href={`/blog/${related.slug}`}
                  className="font-bold text-black hover:text-blue-700 underline"
                >
                  Read &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Lightweight custom markdown parser for headers, code blocks, lists, quotes, tables, and paragraphs
 */
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let inTable = false;
  let tableBuffer: string[] = [];

  const flushCode = (idx: number) => {
    if (codeBuffer.length > 0) {
      elements.push(
        <div key={`code-${idx}`} className="my-6 border-2 border-black bg-zinc-950 p-4 font-mono text-xs sm:text-sm text-zinc-100 overflow-x-auto shadow-[3px_3px_0px_#000000]">
          {codeLang && (
            <div className="text-[10px] text-zinc-400 font-bold uppercase mb-2 border-b border-zinc-800 pb-1">
              {'// '}{codeLang}
            </div>
          )}
          <pre className="m-0 leading-relaxed">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        </div>
      );
      codeBuffer = [];
      codeLang = '';
    }
  };

  const flushTable = (idx: number) => {
    if (tableBuffer.length > 0) {
      const rows = tableBuffer.map((line) =>
        line
          .split('|')
          .filter((_, i, arr) => i > 0 && i < arr.length - 1)
          .map((c) => c.trim())
      );
      if (rows.length >= 2) {
        const header = rows[0];
        const bodyRows = rows.slice(2); // Skip separator row
        elements.push(
          <div key={`table-${idx}`} className="my-6 overflow-x-auto border-2 border-black shadow-[3px_3px_0px_#000000]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  {header.map((col, cIdx) => (
                    <th key={cIdx} className="p-2.5 font-bold border-r border-zinc-700 last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-t border-zinc-300 border-r border-zinc-300 last:border-r-0 font-medium">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode(i);
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      inTable = false;
      flushTable(i);
    }

    // Headings
    if (line.startsWith('## ')) {
      const text = line.replace('## ', '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      elements.push(
        <h2
          id={id}
          key={`h2-${i}`}
          className="text-2xl sm:text-3xl font-black text-black mt-10 mb-4 pb-2 border-b-2 border-black font-sans scroll-mt-24"
        >
          {text}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      const text = line.replace('### ', '').trim();
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl font-black text-black mt-6 mb-3 font-sans">
          {text}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 border-l-4 border-black bg-zinc-100 p-4 font-mono text-xs sm:text-sm text-zinc-800 italic"
        >
          {line.replace('> ', '')}
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---') {
      elements.push(<hr key={`hr-${i}`} className="my-8 border-t-2 border-black" />);
      continue;
    }

    // Bullet points / lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-6 list-disc text-sm sm:text-base text-zinc-800 my-1 font-mono">
          {formatInline(line.slice(2))}
        </li>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={`num-${i}`} className="ml-4 flex items-start gap-2 text-sm sm:text-base text-zinc-800 my-1 font-mono">
            <span className="font-bold text-black">{match[1]}.</span>
            <span>{formatInline(match[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Regular paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p key={`p-${i}`} className="my-3 text-sm sm:text-base text-zinc-800 leading-relaxed font-sans">
          {formatInline(line)}
        </p>
      );
    }
  }

  if (inCodeBlock) flushCode(lines.length);
  if (inTable) flushTable(lines.length);

  return elements;
}

function formatInline(text: string): React.ReactNode {
  // Bold formatting **text**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-black text-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="bg-zinc-100 border border-zinc-300 text-zinc-900 px-1 py-0.5 rounded text-xs font-mono font-bold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
