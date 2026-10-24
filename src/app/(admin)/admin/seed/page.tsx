'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Terminal,
  ArrowRight,
  Layers,
  Edit3,
} from 'lucide-react';
import {
  getAllPosts,
  SanityPost,
  PRESET_CATEGORIES,
  PRESET_AUTHORS,
  resetPostsToPreset,
} from '@/lib/sanity';
import {
  seedDatabase,
  exportAllDataAsJson,
  importDataFromJson,
  directCreatePost,
  directUpdatePost,
  directDeletePost,
  EXTENDED_SEED_POSTS,
} from '@/lib/seed-data';

export default function AdminSeedManagerPage() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fast direct create state
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategory, setNewCategory] = useState('print');
  const [newStatus, setNewStatus] = useState<'published' | 'draft'>('published');

  // Fast direct edit state
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<'published' | 'draft'>('published');

  // JSON import state
  const [jsonInput, setJsonInput] = useState('');

  const refreshData = () => {
    const all = getAllPosts();
    setPosts(all);
    if (all.length > 0 && !selectedPostId) {
      setSelectedPostId(all[0]._id);
      setEditTitle(all[0].title);
      setEditStatus(all[0].status);
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('nedject_sanity_updated', handleUpdate);
    return () => window.removeEventListener('nedject_sanity_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (selectedPostId) {
      const p = posts.find((item) => item._id === selectedPostId);
      if (p) {
        setEditTitle(p.title);
        setEditStatus(p.status);
      }
    }
  }, [selectedPostId, posts]);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Run full seed
  const handleRunFullSeed = () => {
    const res = seedDatabase({ overwrite: true });
    if (res.success) {
      showNotify('success', `✓ ${res.message}`);
      refreshData();
    } else {
      showNotify('error', res.message);
    }
  };

  // Direct Create
  const handleDirectCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showNotify('error', 'Please provide a post title.');
      return;
    }

    const cat = PRESET_CATEGORIES[newCategory] || PRESET_CATEGORIES.print;
    const created = directCreatePost({
      title: newTitle.trim(),
      slug: newSlug.trim() || undefined,
      category: cat,
      status: newStatus,
      content: `<h2>${newTitle.trim()}</h2><p>Prepress calibration and optical specifications overview generated directly via Admin Seeder.</p>`,
    });

    setNewTitle('');
    setNewSlug('');
    showNotify('success', `✓ Successfully created "${created.title}" with ID: ${created._id}`);
    refreshData();
  };

  // Direct Update
  const handleDirectUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId) return;

    const updated = directUpdatePost(selectedPostId, {
      title: editTitle.trim(),
      status: editStatus,
    });

    if (updated) {
      showNotify('success', `✓ Updated post "${updated.title}" status to [${updated.status}]`);
      refreshData();
    } else {
      showNotify('error', 'Failed to update post.');
    }
  };

  // Direct Delete
  const handleDirectDelete = () => {
    if (!selectedPostId) return;
    if (window.confirm('Delete this article directly?')) {
      const ok = directDeletePost(selectedPostId);
      if (ok) {
        showNotify('success', `✓ Deleted post ID: ${selectedPostId}`);
        setSelectedPostId('');
        refreshData();
      } else {
        showNotify('error', 'Post not found.');
      }
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = exportAllDataAsJson();
    navigator.clipboard.writeText(jsonStr);
    
    // Also trigger file download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nedject-seed-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotify('success', '✓ Database exported to file and copied to clipboard!');
  };

  // Import JSON
  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      showNotify('error', 'Please paste JSON string first.');
      return;
    }

    const res = importDataFromJson(jsonInput);
    if (res.success) {
      showNotify('success', `✓ Successfully imported ${res.count} articles!`);
      setJsonInput('');
      refreshData();
    } else {
      showNotify('error', res.error || 'Import failed.');
    }
  };

  // Wipe all
  const handleWipeAll = () => {
    if (window.confirm('WARNING: Permanently wipe ALL blog articles?')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nedject_sanity_posts_v1', JSON.stringify([]));
        window.dispatchEvent(new Event('nedject_sanity_updated'));
      }
      showNotify('success', '✓ All articles wiped clean.');
      refreshData();
    }
  };

  return (
    <div className="space-y-8 font-mono">
      
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>DIRECT CRUD &amp; DATABASE SEEDER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Admin Seeding &amp; CRUD Engine
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-0.5 max-w-xl">
            Directly create, update, delete, seed, and export articles and subscriber telemetry without manual forms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunFullSeed}
            className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚡ Run Full Seed ({EXTENDED_SEED_POSTS.length} Posts)</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 border-2 text-xs font-bold flex items-center gap-2 shadow-[4px_4px_0px_#000000] ${
            notification.type === 'success'
              ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
              : 'border-rose-600 bg-rose-50 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 2. DATABASE STATUS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">CURRENT STORED POSTS</div>
          <div className="text-3xl font-black text-black">{posts.length} Articles</div>
          <div className="text-[11px] text-zinc-600">
            {posts.filter((p) => p.status === 'published').length} published &bull;{' '}
            {posts.filter((p) => p.status === 'draft').length} drafts
          </div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">PRESET CATEGORIES</div>
          <div className="text-3xl font-black text-black">
            {Object.keys(PRESET_CATEGORIES).length} Categories
          </div>
          <div className="text-[11px] text-zinc-600">Print, Supply Chain, Cybersecurity</div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">PRESET AUTHORS</div>
          <div className="text-3xl font-black text-black">
            {Object.keys(PRESET_AUTHORS).length} Authors
          </div>
          <div className="text-[11px] text-zinc-600">Alex Vance, Marcus Chen, Elena Rostova</div>
        </div>
      </div>

      {/* 3. DIRECT CRUD CONTROLS (CREATE & UPDATE & DELETE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: DIRECT RAPID CREATE FORM */}
        <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Direct Rapid Create</span>
            </div>
            <span className="text-[10px] bg-black text-[#ccff00] px-1.5 py-0.5 font-bold">1-CLICK</span>
          </div>

          <form onSubmit={handleDirectCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Article Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Flexo Dot Gain Matrix for Corrugated Board"
                className="w-full border-2 border-black p-2 bg-[#fbfbfa] focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="auto-generated-if-empty"
                  className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
                >
                  {Object.entries(PRESET_CATEGORIES).map(([k, c]) => (
                    <option key={k} value={k}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Initial Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <span>Direct Insert Post</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* RIGHT: DIRECT RAPID UPDATE / DELETE FORM */}
        <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Direct Update / Delete</span>
            </div>
            <span className="text-[10px] bg-zinc-200 text-zinc-800 px-1.5 py-0.5 font-bold">BY ID</span>
          </div>

          <form onSubmit={handleDirectUpdate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Select Target Post</label>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="w-full border-2 border-black p-2 bg-[#fbfbfa] focus:outline-none"
              >
                {posts.map((p) => (
                  <option key={p._id} value={p._id}>
                    [{p.status.toUpperCase()}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Updated Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <span>Direct Save</span>
              </button>
              <button
                type="button"
                onClick={handleDirectDelete}
                className="py-2.5 px-4 border-2 border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 font-black uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* 4. JSON BACKUP & IMPORT / EXPORT STUDIO */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="border-b-2 border-black pb-3 flex items-center justify-between">
          <div className="text-xs font-black uppercase text-black flex items-center gap-2">
            <FileCode className="w-4 h-4 text-purple-700" />
            <span>JSON Database Backup &amp; Raw Import</span>
          </div>
          <button
            onClick={handleWipeAll}
            className="text-[10px] text-rose-700 hover:underline font-bold"
          >
            Clear Entire Database
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-bold text-zinc-700 uppercase">
            Paste JSON Payload to Import / Restore
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={4}
            placeholder='{"version": "1.0.0", "posts": [...]}'
            className="w-full border-2 border-black p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-zinc-50"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500">
              Valid format: Array of posts or <code>{`{ posts: [...] }`}</code>
            </span>
            <button
              onClick={handleImportJson}
              className="px-4 py-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON to Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. API DOCUMENTATION CHEATSHEET */}
      <div className="border-2 border-black bg-[#0a0d14] text-white p-6 space-y-3 font-mono text-xs shadow-[6px_6px_0px_#000000]">
        <div className="flex items-center gap-2 text-[#ccff00] font-black text-xs uppercase">
          <Terminal className="w-4 h-4" />
          <span>DIRECT CRUD API ENDPOINTS (CURL / HTTP)</span>
        </div>
        <div className="space-y-2 text-zinc-300 font-sans text-xs">
          <div>
            <code className="text-emerald-400 font-mono">POST /api/admin/posts</code> &mdash; Direct create a post with JSON body:
            <pre className="bg-zinc-900 border border-zinc-800 p-2 mt-1 text-[11px] text-zinc-300 overflow-x-auto font-mono">
{`curl -X POST http://localhost:3000/api/admin/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title": "New High-Speed Flexo Article", "status": "published"}'`}
            </pre>
          </div>
          <div>
            <code className="text-blue-400 font-mono">PUT /api/admin/posts</code> &mdash; Direct update by slug or _id:
            <pre className="bg-zinc-900 border border-zinc-800 p-2 mt-1 text-[11px] text-zinc-300 overflow-x-auto font-mono">
{`curl -X PUT http://localhost:3000/api/admin/posts \\
  -H "Content-Type: application/json" \\
  -d '{"slug": "my-slug", "status": "published"}'`}
            </pre>
          </div>
          <div>
            <code className="text-rose-400 font-mono">DELETE /api/admin/posts?slug=my-slug</code> &mdash; Direct delete a post.
          </div>
          <div>
            <code className="text-yellow-400 font-mono">POST /api/admin/seed</code> &mdash; Execute seed operation.
          </div>
        </div>
      </div>

    </div>
  );
}
