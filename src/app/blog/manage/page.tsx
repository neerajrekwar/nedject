'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  Code,
  CheckCircle2,
  ExternalLink,
  Layers,
  FolderTree,
  User,
  Tag,
  Calendar,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  SplitSquareVertical,
  Check,
  AlertCircle,
  Copy,
  ArrowLeft,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
} from 'lucide-react';
import {
  SanityPost,
  getAllPosts,
  savePost,
  deletePost,
  resetPostsToPreset,
  PRESET_AUTHORS,
  PRESET_CATEGORIES,
  PRESET_POSTS,
} from '@/lib/sanity';

function SanityStudioInner() {
  const searchParams = useSearchParams();
  const initialEditId = searchParams.get('edit');

  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'authors' | 'categories' | 'schemas'>('posts');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [editingPost, setEditingPost] = useState<SanityPost | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'media' | 'seo'>('content');
  const [newTagInput, setNewTagInput] = useState('');

  // Load posts
  const loadPosts = () => {
    const list = getAllPosts();
    setPosts(list);
    if (!selectedPostId && list.length > 0) {
      const match = initialEditId ? list.find((p) => p._id === initialEditId) : null;
      const target = match || list[0];
      setSelectedPostId(target._id);
      setEditingPost(JSON.parse(JSON.stringify(target)));
    }
  };

  useEffect(() => {
    loadPosts();
  }, [initialEditId]);

  // When selected post changes, update editingPost
  const handleSelectPost = (post: SanityPost) => {
    setSelectedPostId(post._id);
    setEditingPost(JSON.parse(JSON.stringify(post)));
  };

  const handleCreateNew = () => {
    const newId = `sanity-post-${Date.now()}`;
    const newPost: SanityPost = {
      _id: newId,
      _type: 'post',
      title: 'Untitled Engineering Guide',
      slug: `untitled-guide-${Date.now().toString().slice(-4)}`,
      excerpt: 'Brief overview of this publication and its optical verification metrics.',
      content: `## Executive Overview\n\nDocument your industrial prepress specifications and optical testing methodology here.\n\n---\n\n## Implementation Specifications\n\nDetail the exact math and parameters:\n\n\`\`\`ts\n// Code snippet\nconst dpi = 300;\n\`\`\``,
      mainImage: {
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85',
        alt: 'High precision calibration test strip',
        caption: 'Calibration test strip magnified at 200x.',
      },
      author: PRESET_AUTHORS.alex,
      category: PRESET_CATEGORIES.print,
      tags: ['Calibration', '300 DPI'],
      publishedAt: new Date().toISOString(),
      estimatedReadingTime: '5 min read',
      status: 'draft',
      isFeatured: false,
    };

    savePost(newPost);
    loadPosts();
    setSelectedPostId(newId);
    setEditingPost(newPost);
  };

  const handleSave = () => {
    if (!editingPost) return;

    // Recalculate reading time based on words
    const wordCount = editingPost.content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    const updatedPost: SanityPost = {
      ...editingPost,
      estimatedReadingTime: `${minutes} min read`,
    };

    savePost(updatedPost);
    loadPosts();
    setEditingPost(updatedPost);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document from Sanity Studio?')) {
      deletePost(id);
      const remaining = getAllPosts().filter((p) => p._id !== id);
      setPosts(remaining);
      if (remaining.length > 0) {
        setSelectedPostId(remaining[0]._id);
        setEditingPost(JSON.parse(JSON.stringify(remaining[0])));
      } else {
        setSelectedPostId('');
        setEditingPost(null);
      }
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Reset all blog posts to the 3 preset mock publications (Alex Vance, Marcus Chen, Elena Rostova)? Any custom changes will be replaced.'
      )
    ) {
      const reset = resetPostsToPreset();
      setPosts(reset);
      setSelectedPostId(reset[0]._id);
      setEditingPost(JSON.parse(JSON.stringify(reset[0])));
    }
  };

  const generateSlugFromTitle = () => {
    if (!editingPost) return;
    const slug = editingPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setEditingPost({ ...editingPost, slug });
  };

  const insertSnippet = (snippet: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      content: editingPost.content + '\n' + snippet,
    });
  };

  const handleAddTag = () => {
    if (!editingPost || !newTagInput.trim()) return;
    if (!editingPost.tags.includes(newTagInput.trim())) {
      setEditingPost({
        ...editingPost,
        tags: [...editingPost.tags, newTagInput.trim()],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      tags: editingPost.tags.filter((t) => t !== tagToRemove),
    });
  };

  // Filter posts for document list
  const filteredPosts = posts.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#101114] text-zinc-200 font-sans">
      {/* Sanity Studio Top Header Bar */}
      <header className="h-14 border-b border-zinc-800 bg-[#17181c] px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Sanity Red Brand Icon */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#f03e2f] flex items-center justify-center font-bold text-white text-xs shadow-sm">
              S
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Sanity Studio</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
              v3.45.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 border-l border-zinc-800 pl-3">
            <span className="font-mono text-zinc-500">project:</span>
            <span className="text-zinc-200 font-mono font-medium">prj_nedject_industrial</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-500">dataset:</span>
            <span className="text-emerald-400 font-mono font-medium bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 rounded text-[11px]">
              production
            </span>
          </div>
        </div>

        {/* Global Studio Actions */}
        <div className="flex items-center gap-2">
          {/* Toast */}
          {saveToast && (
            <div className="flex items-center gap-1.5 bg-emerald-500 text-black text-xs font-bold px-2.5 py-1 rounded shadow animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Published to Dataset!</span>
            </div>
          )}

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border transition-colors ${
              showLivePreview
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title="Toggle Split Screen Live Preview"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            title="Inspect Sanity Document JSON"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect JSON</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700"
            title="Reset to 3 Preset Mock Posts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset Presets</span>
          </button>

          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded bg-[#ccff00] hover:bg-[#b8e600] text-black transition-colors"
          >
            <span>Live Blog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Studio Body: 3-column Desk Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: Desk Structure Navigation */}
        <aside className="w-56 border-r border-zinc-800 bg-[#141519] flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            Desk Structure
          </div>

          <nav className="p-2 space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Blog Posts</span>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('authors')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-colors ${
                activeTab === 'authors'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Authors</span>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                {Object.keys(PRESET_AUTHORS).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Categories</span>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                {Object.keys(PRESET_CATEGORIES).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('schemas')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded font-medium transition-colors ${
                activeTab === 'schemas'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span>Schema Types</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">GROQ</span>
            </button>
          </nav>

          <div className="mt-auto p-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
            <div>Nedject Engine v2.4</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">300 DPI Prepress Matrix</div>
          </div>
        </aside>

        {/* COLUMN 2: Document List Pane */}
        <section className="w-72 lg:w-80 border-r border-zinc-800 bg-[#16171b] flex flex-col shrink-0">
          {/* Header & Create Button */}
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
              {activeTab === 'posts' ? 'Documents' : activeTab}
            </span>
            {activeTab === 'posts' && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1 bg-zinc-800 hover:bg-blue-600 text-zinc-200 hover:text-white px-2 py-1 rounded text-xs font-medium transition-colors border border-zinc-700 hover:border-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            )}
          </div>

          {/* Search & Status Filters */}
          {activeTab === 'posts' && (
            <div className="p-2 border-b border-zinc-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                {(['all', 'published', 'draft'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`flex-1 py-0.5 rounded text-center capitalize transition-colors ${
                      filterStatus === st
                        ? 'bg-zinc-800 text-white font-bold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
            {activeTab === 'posts' &&
              filteredPosts.map((post) => {
                const isSelected = post._id === selectedPostId;
                return (
                  <div
                    key={post._id}
                    onClick={() => handleSelectPost(post)}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-zinc-800/90 border-l-4 border-blue-500'
                        : 'hover:bg-zinc-800/40 text-zinc-300'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-700">
                      <Image
                        src={post.mainImage.url}
                        alt={post.mainImage.alt}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                            post.status === 'published'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate">
                          {post.category.title}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-zinc-200 line-clamp-2 leading-tight">
                        {post.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        /{post.slug}
                      </div>
                    </div>
                  </div>
                );
              })}

            {activeTab === 'authors' &&
              Object.values(PRESET_AUTHORS).map((author) => (
                <div key={author._id} className="p-3 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">{author.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono leading-tight">
                      {author.role}
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === 'categories' &&
              Object.values(PRESET_CATEGORIES).map((cat) => (
                <div key={cat._id} className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="text-xs font-bold text-zinc-200">{cat.title}</div>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">/{cat.slug}</div>
                </div>
              ))}

            {activeTab === 'schemas' && (
              <div className="p-4 text-xs font-mono space-y-3 text-zinc-400">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <div className="font-bold text-white mb-1">schema.post.ts</div>
                  <div className="text-[11px] text-zinc-500">
                    Fields: title, slug, excerpt, content, mainImage, author, category, tags, publishedAt, status
                  </div>
                </div>
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <div className="font-bold text-white mb-1">schema.author.ts</div>
                  <div className="text-[11px] text-zinc-500">Fields: name, role, avatar, bio</div>
                </div>
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                  <div className="font-bold text-white mb-1">schema.category.ts</div>
                  <div className="text-[11px] text-zinc-500">Fields: title, slug, color</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 3: Document Form Editor Pane */}
        {editingPost ? (
          <main className="flex-1 flex flex-col bg-[#111215] overflow-hidden">
            {/* Document Header & Publish Toolbar */}
            <div className="h-14 border-b border-zinc-800 bg-[#16171a] px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">post /</span>
                <span className="text-sm font-bold text-white truncate max-w-sm">
                  {editingPost.title}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                    editingPost.status === 'published'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {editingPost.status}
                </span>
              </div>

              {/* Document Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(editingPost._id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish / Save</span>
                </button>
              </div>
            </div>

            {/* Editor Subtabs: Content, Media, SEO */}
            <div className="border-b border-zinc-800 bg-[#131417] px-6 flex items-center gap-4 text-xs font-mono">
              <button
                onClick={() => setActiveEditorTab('content')}
                className={`py-2.5 font-bold border-b-2 transition-colors ${
                  activeEditorTab === 'content'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                1. Content &amp; Markdown
              </button>
              <button
                onClick={() => setActiveEditorTab('media')}
                className={`py-2.5 font-bold border-b-2 transition-colors ${
                  activeEditorTab === 'media'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2. Media &amp; Metadata
              </button>
              <button
                onClick={() => setActiveEditorTab('seo')}
                className={`py-2.5 font-bold border-b-2 transition-colors ${
                  activeEditorTab === 'seo'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3. SEO &amp; Schema.org
              </button>
            </div>

            {/* Editor Form Body + Optional Live Preview Pane */}
            <div className="flex-1 flex overflow-hidden">
              {/* Form Input Fields */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
                {activeEditorTab === 'content' && (
                  <>
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                        Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, title: e.target.value })
                        }
                        className="w-full bg-[#18191e] border border-zinc-700 rounded p-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Mastering 300 DPI Photo QR Codes"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                          Slug <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateSlugFromTitle}
                          className="text-[11px] text-blue-400 hover:underline font-mono"
                        >
                          Generate from Title
                        </button>
                      </div>
                      <div className="flex items-center bg-[#18191e] border border-zinc-700 rounded overflow-hidden">
                        <span className="px-3 text-xs text-zinc-500 font-mono">/blog/</span>
                        <input
                          type="text"
                          value={editingPost.slug}
                          onChange={(e) =>
                            setEditingPost({ ...editingPost, slug: e.target.value })
                          }
                          className="flex-1 bg-transparent py-2.5 pr-3 text-xs text-zinc-200 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                        Excerpt / Summary
                      </label>
                      <textarea
                        rows={3}
                        value={editingPost.excerpt}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, excerpt: e.target.value })
                        }
                        className="w-full bg-[#18191e] border border-zinc-700 rounded p-2.5 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                        placeholder="Brief summary displayed on social share cards and index feeds..."
                      />
                    </div>

                    {/* Portable Text / Markdown Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                          Article Body (Portable Text / Markdown)
                        </label>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {editingPost.content.trim().split(/\s+/).length} words •{' '}
                          {editingPost.estimatedReadingTime}
                        </span>
                      </div>

                      {/* Formatting Toolbar */}
                      <div className="flex items-center flex-wrap gap-1 p-1.5 bg-[#1f2026] border border-zinc-700 rounded-t text-xs">
                        <button
                          type="button"
                          onClick={() => insertSnippet('## Section Heading\n\n')}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 font-bold"
                          title="Add H2 Heading"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet('### Sub-heading\n\n')}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 font-bold"
                          title="Add H3 Heading"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet('**bold text**')}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet('*italic text*')}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet('```ts\n// Code block\nconst code = "test";\n```\n')}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                          title="Code Block"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet('> Key engineering insight or caution.\n')}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                          title="Quote Callout"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet('- Bullet list item 1\n- Bullet list item 2\n')}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                          title="Bullet List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertSnippet(
                              '| Spec Parameter | Tolerance | Standard |\n| :--- | :--- | :--- |\n| Dot Gain | ±2% | ISO 12647 |\n'
                            )
                          }
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                          title="Markdown Table"
                        >
                          <TableIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={16}
                        value={editingPost.content}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, content: e.target.value })
                        }
                        className="w-full bg-[#18191e] border-x border-b border-zinc-700 rounded-b p-3 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500 font-normal"
                        placeholder="Write your article markdown..."
                      />
                    </div>
                  </>
                )}

                {activeEditorTab === 'media' && (
                  <>
                    {/* Author & Category Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                          Author Reference
                        </label>
                        <select
                          value={editingPost.author._id}
                          onChange={(e) => {
                            const found = Object.values(PRESET_AUTHORS).find(
                              (a) => a._id === e.target.value
                            );
                            if (found) {
                              setEditingPost({ ...editingPost, author: found });
                            }
                          }}
                          className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono focus:outline-none"
                        >
                          {Object.values(PRESET_AUTHORS).map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name} — {a.role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                          Category Reference
                        </label>
                        <select
                          value={editingPost.category._id}
                          onChange={(e) => {
                            const found = Object.values(PRESET_CATEGORIES).find(
                              (c) => c._id === e.target.value
                            );
                            if (found) {
                              setEditingPost({ ...editingPost, category: found });
                            }
                          }}
                          className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono focus:outline-none"
                        >
                          {Object.values(PRESET_CATEGORIES).map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Publication Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#18191e] border border-zinc-800 rounded">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase font-mono mb-1">
                          Status
                        </label>
                        <select
                          value={editingPost.status}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              status: e.target.value as 'published' | 'draft',
                            })
                          }
                          className="w-full bg-[#131417] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono focus:outline-none"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase font-mono mb-1">
                          Publish Date
                        </label>
                        <input
                          type="text"
                          value={editingPost.publishedAt.slice(0, 10)}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              publishedAt: new Date(e.target.value).toISOString(),
                            })
                          }
                          className="w-full bg-[#131417] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="featured-check"
                          checked={editingPost.isFeatured || false}
                          onChange={(e) =>
                            setEditingPost({ ...editingPost, isFeatured: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                        />
                        <label
                          htmlFor="featured-check"
                          className="text-xs font-mono font-bold text-zinc-300 cursor-pointer"
                        >
                          Pin as Featured Post
                        </label>
                      </div>
                    </div>

                    {/* Main Image Asset */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                        Main Image Asset
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-48 h-32 rounded bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                          <Image
                            src={editingPost.mainImage.url}
                            alt={editingPost.mainImage.alt}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editingPost.mainImage.url}
                            onChange={(e) =>
                              setEditingPost({
                                ...editingPost,
                                mainImage: { ...editingPost.mainImage, url: e.target.value },
                              })
                            }
                            className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono"
                            placeholder="Image URL (Unsplash or CDN)..."
                          />
                          <input
                            type="text"
                            value={editingPost.mainImage.alt}
                            onChange={(e) =>
                              setEditingPost({
                                ...editingPost,
                                mainImage: { ...editingPost.mainImage, alt: e.target.value },
                              })
                            }
                            className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono"
                            placeholder="Alt text for accessibility & SEO..."
                          />
                          <input
                            type="text"
                            value={editingPost.mainImage.caption || ''}
                            onChange={(e) =>
                              setEditingPost({
                                ...editingPost,
                                mainImage: { ...editingPost.mainImage, caption: e.target.value },
                              })
                            }
                            className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono"
                            placeholder="Figure caption or optical print specification..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tags Manager */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                        Topic Tags
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-[#18191e] border border-zinc-700 rounded min-h-[40px] items-center">
                        {editingPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-200 text-xs px-2 py-0.5 rounded font-mono border border-zinc-700"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-zinc-500 hover:text-rose-400 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Add tag and press Enter..."
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            className="bg-transparent text-xs text-white focus:outline-none font-mono py-0.5 px-1"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeEditorTab === 'seo' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-950/30 border border-blue-900 rounded text-xs text-blue-300 font-mono">
                      These values configure the authoritative OpenGraph, Twitter card, canonical tags, and Schema.org BlogPosting JSON-LD rendered for search crawlers.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={editingPost.seo?.metaTitle || ''}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            seo: { ...editingPost.seo, metaTitle: e.target.value },
                          })
                        }
                        className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono"
                        placeholder={editingPost.title}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-1">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingPost.seo?.metaDescription || ''}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            seo: { ...editingPost.seo, metaDescription: e.target.value },
                          })
                        }
                        className="w-full bg-[#18191e] border border-zinc-700 rounded p-2 text-xs text-zinc-200 font-mono"
                        placeholder={editingPost.excerpt}
                      />
                    </div>

                    {/* Google SERP Preview Mock */}
                    <div className="p-4 bg-[#18191e] border border-zinc-800 rounded font-sans space-y-1">
                      <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                        Google Search Preview
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        https://nedject.app/blog/{editingPost.slug}
                      </div>
                      <div className="text-base text-blue-400 font-medium hover:underline cursor-pointer">
                        {editingPost.seo?.metaTitle || editingPost.title} | Nedject
                      </div>
                      <div className="text-xs text-zinc-400 line-clamp-2">
                        {editingPost.seo?.metaDescription || editingPost.excerpt}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Live Split Preview Pane */}
              {showLivePreview && (
                <div className="w-1/2 border-l border-zinc-800 bg-[#f5f5f0] text-black overflow-y-auto p-6 font-sans">
                  <div className="bg-black text-[#ccff00] text-[10px] font-black px-2 py-0.5 font-mono inline-block mb-3">
                    LIVE FRONTEND PREVIEW
                  </div>
                  <div className="text-xs font-mono text-zinc-600 mb-1">
                    {editingPost.category.title} • {editingPost.estimatedReadingTime}
                  </div>
                  <h1 className="text-2xl font-black text-black leading-tight mb-2">
                    {editingPost.title}
                  </h1>
                  <p className="text-xs font-mono text-zinc-700 mb-4 border-l-2 border-black pl-2">
                    {editingPost.excerpt}
                  </p>
                  <div className="relative h-44 w-full bg-zinc-900 border-2 border-black mb-4 overflow-hidden">
                    <Image
                      src={editingPost.mainImage.url}
                      alt={editingPost.mainImage.alt}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-zinc-800">
                    {editingPost.content.slice(0, 700)}...
                  </div>
                </div>
              )}
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono text-xs">
            Select a document from the left pane or click &quot;Create&quot; to begin.
          </div>
        )}
      </div>

      {/* JSON Modal for Sanity Inspector */}
      {showJsonModal && editingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18191e] border border-zinc-700 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-white">Sanity Document Record (_id: {editingPost._id})</span>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-emerald-400 bg-zinc-950">
              <pre>{JSON.stringify(editingPost, null, 2)}</pre>
            </div>
            <div className="p-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SanityStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white font-mono text-xs">Loading Sanity Studio...</div>}>
      <SanityStudioInner />
    </Suspense>
  );
}
