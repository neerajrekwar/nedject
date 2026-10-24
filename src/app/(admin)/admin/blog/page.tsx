'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PenSquare,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  getAllPosts,
  deletePost,
  savePost,
  resetPostsToPreset,
  SanityPost,
  PRESET_CATEGORIES,
} from '@/lib/sanity';

export default function AdminBlogManagementPage() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refresh = () => {
    setPosts(getAllPosts());
  };

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('nedject_sanity_updated', handleUpdate);
    return () => window.removeEventListener('nedject_sanity_updated', handleUpdate);
  }, []);

  const handleDelete = (id: string) => {
    deletePost(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleToggleStatus = (post: SanityPost) => {
    const updated: SanityPost = {
      ...post,
      status: post.status === 'published' ? 'draft' : 'published',
    };
    savePost(updated);
    refresh();
  };

  const handleResetPresets = () => {
    if (window.confirm('Reset all blog articles to the original preset technical articles?')) {
      resetPostsToPreset();
      refresh();
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || post.category.title.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* 1. HEADER & TOP ACTIONS */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Content Publishing Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Blog Post Management
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Create, edit in Notion mode, audit SEO metadata, and publish articles across Nedject.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetPresets}
            className="px-3 py-2 border border-black bg-zinc-100 hover:bg-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Reset to default technical engineering articles"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">Reset Presets</span>
          </button>

          <Link
            href="/admin/blog/new"
            className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Write New Post</span>
          </Link>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, tag, or excerpt..."
            className="w-full border-2 border-black pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border-2 border-black p-1.5 text-xs bg-zinc-50 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.values(PRESET_CATEGORIES).map((c) => (
                <option key={c._id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border-2 border-black p-1.5 text-xs bg-zinc-50 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. POSTS TABLE */}
      <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="border-b-2 border-black bg-zinc-100 text-zinc-700 font-bold uppercase">
              <tr>
                <th className="p-3.5">Article Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Published Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-zinc-50 transition-colors">
                    {/* Article Details */}
                    <td className="p-3.5 max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-12 border border-black bg-zinc-100 shrink-0 overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.mainImage.url}
                            alt={post.mainImage.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/blog/edit/${post._id}`}
                            className="font-black text-black hover:underline line-clamp-1 text-xs sm:text-sm"
                          >
                            {post.title}
                          </Link>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 font-sans mt-0.5">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                            <span>Slug: /{post.slug}</span>
                            <span>&bull;</span>
                            <span>{post.estimatedReadingTime}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 font-bold">
                      <span className="px-2 py-0.5 bg-black text-[#ccff00] text-[10px] border border-black uppercase">
                        {post.category.title}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="p-3.5 text-zinc-700">
                      <div className="font-bold text-black">{post.author.name}</div>
                      <div className="text-[10px] text-zinc-500 font-sans truncate max-w-[120px]">
                        {post.author.role}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-3.5 text-zinc-600 text-[11px]">
                      {post.publishedAt}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`px-2 py-0.5 border text-[10px] font-black uppercase transition-colors cursor-pointer ${
                          post.status === 'published'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-700 hover:bg-emerald-200'
                            : 'bg-zinc-200 text-zinc-800 border-zinc-500 hover:bg-zinc-300'
                        }`}
                        title="Click to toggle between published and draft"
                      >
                        {post.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 border border-zinc-300 hover:border-black bg-white text-zinc-700 hover:text-black transition-colors"
                          title="View live article on website"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/admin/blog/edit/${post._id}`}
                          className="px-2.5 py-1 border border-black bg-black text-[#ccff00] hover:bg-zinc-800 text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
                        >
                          <PenSquare className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => setDeleteConfirmId(post._id)}
                          className="p-1.5 border border-zinc-300 hover:border-rose-600 hover:bg-rose-50 text-zinc-500 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white p-6 max-w-sm w-full shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm uppercase">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Post Deletion</span>
            </div>
            <p className="text-xs text-zinc-700 font-sans">
              Are you sure you want to permanently remove this blog post from Nedject? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 border-2 border-black bg-rose-600 text-white hover:bg-rose-700 text-xs font-black uppercase"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
