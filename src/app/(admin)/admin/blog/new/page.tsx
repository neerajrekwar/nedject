'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';
import { TiptapNotionEditor } from '@/components/admin/TiptapNotionEditor';
import {
  savePost,
  SanityPost,
  PRESET_AUTHORS,
  PRESET_CATEGORIES,
} from '@/lib/sanity';

export default function CreateNewPostPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentHtml, setContentHtml] = useState(
    '<h2>Executive Summary</h2><p>Provide the optical background, engineering parameters, and prepress calibration details here...</p>'
  );
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85'
  );
  const [imageAlt, setImageAlt] = useState('Nedject technical engineering schematic');
  const [categoryKey, setCategoryKey] = useState<string>('print');
  const [authorKey, setAuthorKey] = useState<string>('alex');
  const [tagsInput, setTagsInput] = useState('300 DPI, Prepress, Reed-Solomon, Calibration');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSave = (publishState?: 'published' | 'draft') => {
    if (!title.trim()) {
      alert('Please provide an article title.');
      return;
    }

    setIsSaving(true);

    const targetStatus = publishState || status;
    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = PRESET_CATEGORIES[categoryKey] || PRESET_CATEGORIES.print;
    const author = PRESET_AUTHORS[authorKey] || PRESET_AUTHORS.alex;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Estimate reading time from content
    const plainText = contentHtml.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.trim().split(/\s+/).length;
    const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const newPost: SanityPost = {
      _id: `post-${Date.now()}`,
      _type: 'post',
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || title.trim(),
      content: contentHtml,
      mainImage: {
        url: imageUrl || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85',
        alt: imageAlt || title.trim(),
        caption: 'Calibration diagram and technical specification overview.',
      },
      author,
      category,
      tags,
      publishedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      estimatedReadingTime: readingTime,
      isFeatured: false,
      status: targetStatus,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
      },
    };

    savePost(newPost);

    setSuccessNotice(true);
    setTimeout(() => {
      router.push('/admin/blog');
    }, 800);
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* 1. TOP HEADER & BREADCRUMB NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="p-2 border-2 border-black bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase">EDITORIAL WORKSPACE</div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-black">
              Create New Article (Notion Mode)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-3 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold uppercase transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-5 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 border-2 border-emerald-700 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span className="font-bold">Article successfully published and synced with Nedject blog!</span>
        </div>
      )}

      {/* 2. MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: TITLE, EXCERPT, AND TIPTAP NOTION EDITOR (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Title & Slug Box */}
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Post Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Precision Barcode Calibration & Quiet Zone Requirements for High-Speed Logistics"
                className="w-full border-2 border-black p-3 text-base sm:text-lg font-black font-sans focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                  Permalink Slug (URL)
                </label>
                <div className="flex items-center border border-black bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-700">
                  <span className="text-zinc-400 select-none">/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-slug-name"
                    className="w-full bg-transparent focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="300 DPI, Barcode, Logistics, QR"
                  className="w-full border border-black p-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                Short Excerpt / Teaser
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A brief summary describing the core technical takeaways for readers..."
                className="w-full border border-black p-2.5 text-xs font-sans focus:outline-none"
              />
            </div>
          </div>

          {/* Tiptap Notion Mode Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase text-black">
                Article Body Content (Tiptap Notion Mode)
              </span>
              <span className="text-zinc-500 text-[11px]">Type / for commands</span>
            </div>
            
            <TiptapNotionEditor
              initialContent={contentHtml}
              onChange={(html) => setContentHtml(html)}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: PUBLISHING CONTROLS & METADATA (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Publishing Settings Box */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-4 text-xs">
            <div className="font-black uppercase text-black border-b-2 border-black pb-2 flex items-center justify-between">
              <span>Publishing Settings</span>
              <span className="text-[#00aa00] font-bold">&bull; DRAFT/LIVE</span>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border-2 border-black p-2 text-xs bg-zinc-50 focus:outline-none"
              >
                <option value="published">Published (Visible on Live Blog)</option>
                <option value="draft">Draft (Restricted to Admin)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Primary Category</label>
              <select
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs bg-zinc-50 focus:outline-none"
              >
                {Object.entries(PRESET_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Assigned Author</label>
              <select
                value={authorKey}
                onChange={(e) => setAuthorKey(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs bg-zinc-50 focus:outline-none"
              >
                {Object.entries(PRESET_AUTHORS).map(([key, auth]) => (
                  <option key={key} value={key}>
                    {auth.name} — {auth.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-3 text-xs">
            <div className="font-black uppercase text-black border-b-2 border-black pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Cover Photograph</span>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-black p-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Alt Text</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Prepress calibration chart"
                className="w-full border border-black p-2 text-xs focus:outline-none"
              />
            </div>

            {imageUrl && (
              <div className="border border-black overflow-hidden mt-2 relative aspect-video bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* SEO Metadata Box */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-3 text-xs">
            <div className="font-black uppercase text-black border-b-2 border-black pb-2">
              SEO &amp; OpenGraph Overrides
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || 'Custom SEO title for Google search'}
                className="w-full border border-black p-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder={excerpt || 'Search engine snippet description'}
                className="w-full border border-black p-2 text-xs font-sans focus:outline-none"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
