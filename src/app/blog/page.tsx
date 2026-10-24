'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  PenSquare,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  Flame,
} from 'lucide-react';
import { getAllPosts, SanityPost, PRESET_CATEGORIES } from '@/lib/sanity';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadPosts = () => {
    const all = getAllPosts().filter((p) => p.status === 'published');
    setPosts(all);
  };

  useEffect(() => {
    loadPosts();

    const handleUpdate = () => loadPosts();
    window.addEventListener('nedject_sanity_updated', handleUpdate);
    return () => window.removeEventListener('nedject_sanity_updated', handleUpdate);
  }, []);

  const categories = ['all', ...Object.values(PRESET_CATEGORIES).map((c) => c.title)];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' || post.category.title.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.find((p) => p.isFeatured) || filteredPosts[0];
  const remainingPosts = filteredPosts.filter((p) => p._id !== featuredPost?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner: Industrial Header & Sanity CMS Studio Link */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-black text-[#ccff00] text-xs font-black px-2 py-0.5 tracking-wider uppercase font-mono flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Nedject Engineering Publications
              </span>
              <span className="bg-zinc-100 border border-black text-xs font-mono px-2 py-0.5 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sanity CMS Live Sync
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black font-sans">
              Print Calibration & Barcode Architecture
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-700 max-w-2xl font-mono">
              Industrial-grade specifications, optical decodability mathematics, prepress dot gain calibration, and forensic QR audit blueprints.
            </p>
          </div>

          {/* Quick link to Sanity CMS Studio */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/blog/manage"
              className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black px-4 py-2.5 text-xs sm:text-sm font-mono transition-all shadow-[3px_3px_0px_#000000]"
            >
              <PenSquare className="w-4 h-4" />
              <span>SANITY CMS STUDIO</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 pt-6 border-t-2 border-black flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search posts by keyword, tag, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-zinc-500 font-bold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              TOPIC:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 border border-black font-bold uppercase transition-all ${
                    active
                      ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-black'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Post Card */}
      {featuredPost && (
        <article className="border-4 border-black bg-white shadow-[6px_6px_0px_#000000] mb-8 overflow-hidden hover:shadow-[8px_8px_0px_#000000] transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image Pane */}
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-[280px] bg-zinc-900 border-b-4 lg:border-b-0 lg:border-r-4 border-black overflow-hidden">
              <Image
                src={featuredPost.mainImage.url}
                alt={featuredPost.mainImage.alt}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-black text-[#ccff00] text-xs font-black font-mono px-2.5 py-1 border border-black flex items-center gap-1 shadow-[2px_2px_0px_#000000]">
                  <Flame className="w-3.5 h-3.5 fill-[#ccff00]" />
                  FEATURED PUBLICATION
                </span>
                <span className="bg-white text-black text-xs font-bold font-mono px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000000]">
                  {featuredPost.category.title}
                </span>
              </div>
            </div>

            {/* Content Pane */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPost.estimatedReadingTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black hover:text-blue-700 transition-colors font-sans">
                  <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>

                <p className="mt-3 text-sm text-zinc-700 leading-relaxed font-mono">
                  {featuredPost.excerpt}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono bg-zinc-100 border border-zinc-400 px-2 py-0.5 font-semibold text-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & CTA */}
              <div className="mt-6 pt-6 border-t-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-black">
                    <Image
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-xs font-mono">
                    <div className="font-bold text-black">{featuredPost.author.name}</div>
                    <div className="text-zinc-500 text-[10px] truncate max-w-[150px]">
                      {featuredPost.author.role}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs font-mono px-3 py-2 border-2 border-black transition-all shadow-[2px_2px_0px_#000000]"
                >
                  <span>READ ARTICLE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Grid of Remaining Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {remainingPosts.map((post) => (
          <article
            key={post._id}
            className="border-4 border-black bg-white shadow-[5px_5px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Image */}
              <div className="relative h-48 sm:h-56 w-full border-b-4 border-black bg-zinc-900 overflow-hidden">
                <Image
                  src={post.mainImage.url}
                  alt={post.mainImage.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-black text-[#ccff00] text-[11px] font-black font-mono px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000000]">
                    {post.category.title}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.estimatedReadingTime}
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-black hover:text-blue-700 transition-colors font-sans">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-zinc-700 font-mono leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 font-medium text-zinc-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 pt-0 border-t-2 border-zinc-200 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-black">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-black">{post.author.name}</span>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs font-mono px-2.5 py-1.5 border border-black shadow-[1px_1px_0px_#000000]"
              >
                <span>Read</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="border-4 border-black bg-white p-12 text-center shadow-[6px_6px_0px_#000000] font-mono">
          <p className="text-lg font-bold text-black">
            {posts.length === 0 ? 'No publications published yet.' : `No technical publications found matching "${searchQuery}"`}
          </p>
          <p className="text-sm text-zinc-600 mt-1">
            {posts.length === 0
              ? 'Real-time articles will appear here once authored in Sanity Studio or created via terminal CLI.'
              : 'Try another keyword or reset the category filter.'}
          </p>
          {posts.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-black text-[#ccff00] font-bold text-xs border-2 border-black"
            >
              RESET FILTERS
            </button>
          )}
        </div>
      )}

      {/* Bottom Callout: Sanity CMS Studio Engine */}
      <div className="mt-12 border-4 border-black bg-[#ccff00] p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-black text-[#ccff00] text-[10px] font-black px-1.5 py-0.5 font-mono uppercase">
                Content Management System
              </span>
              <span className="text-xs font-mono font-bold text-black">
                Sanity Studio v3 Architecture
              </span>
            </div>
            <h3 className="text-2xl font-black text-black">
              Manage, Author &amp; Publish Articles via Sanity CMS
            </h3>
            <p className="text-xs sm:text-sm font-mono text-zinc-800 mt-1 max-w-2xl">
              Equipped with real-time schema validation, portable text formatting, Unsplash media picker, live split-screen preview, and instant localStorage / Sanity data store sync.
            </p>
          </div>

          <Link
            href="/blog/manage"
            className="inline-flex items-center gap-2 border-2 border-black bg-black text-[#ccff00] hover:bg-white hover:text-black font-black px-5 py-3 text-sm font-mono transition-all shadow-[4px_4px_0px_#000000]"
          >
            <PenSquare className="w-4 h-4" />
            <span>LAUNCH SANITY STUDIO</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
