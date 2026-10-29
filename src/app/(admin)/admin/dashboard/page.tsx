'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  FileText,
  Activity,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  QrCode,
  PenSquare,
  BarChart3,
  ExternalLink,
  Search,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface RealMetrics {
  users: {
    total: number;
    pro: number;
    enterprise: number;
    free: number;
    recent: Array<{
      id: string;
      name: string;
      email: string;
      plan: string;
      createdAt: string;
      image?: string;
    }>;
  };
  generations: {
    total: number;
    recent: Array<{
      id: string;
      title: string;
      format: string;
      contrast: number;
      dateFormatted: string;
      userEmail: string;
      clientIp?: string;
    }>;
  };
  posts: {
    total: number;
    published: number;
    draft: number;
    recent: Array<{
      _id: string;
      title: string;
      slug: string;
      status: string;
      publishedAt: string;
      category?: { title: string };
    }>;
  };
  admins: {
    total: number;
    list: Array<{ email: string; name: string; role: string }>;
  };
  revenue: {
    total: string;
    rawTotal: number;
    activeSubscribers: number;
  };
  purchases: Array<{
    id: string;
    name: string;
    email: string;
    plan: string;
    amount: string;
    gateway: string;
    date: string;
    status: string;
    invoiceId: string;
    avatar?: string;
  }>;
  mongoConnected: boolean;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<RealMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyerFilter, setBuyerFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealtimeMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (res.ok && data.success) {
        setMetrics(data);
      }
    } catch (e) {
      console.error('Failed to load real-time metrics:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealtimeMetrics();
  }, []);

  const purchases = metrics?.purchases || [];
  const filteredPurchases = purchases.filter(
    (b) =>
      b.name.toLowerCase().includes(buyerFilter.toLowerCase()) ||
      b.email.toLowerCase().includes(buyerFilter.toLowerCase()) ||
      b.plan.toLowerCase().includes(buyerFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. WELCOME HEADER & QUICK ACTIONS */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase font-mono mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>REAL-TIME LIVE TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-mono">
            Nedject System Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl">
            Strictly connected to live MongoDB collections. Zero mock or placeholder data rendered.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono">
          <button
            onClick={fetchRealtimeMetrics}
            disabled={isRefreshing}
            className="px-3 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write Notion Post</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-zinc-700" />
            <span>Full Analytics</span>
          </Link>
        </div>
      </div>

      {/* 2. REAL-TIME TOP METRICS & FINANCIAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* Real Revenue */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>MONTHLY REVENUE (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {loading ? '...' : metrics?.revenue.total || '$0.00'}
          </div>
          <div className="text-[11px] text-zinc-600 font-bold flex items-center gap-1">
            <span>{metrics?.revenue.activeSubscribers || 0} active paid subscriptions</span>
          </div>
        </div>

        {/* Real Users */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>REGISTERED USERS</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {loading ? '...' : `${metrics?.users.total || 0} Users`}
          </div>
          <div className="text-[11px] text-zinc-600">
            {metrics?.users.free || 0} Free &bull; {metrics?.revenue.activeSubscribers || 0} Pro/Ent
          </div>
        </div>

        {/* Real Blog Posts Count */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>BLOG ARTICLES</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {loading ? '...' : `${metrics?.posts.total || 0} Posts`}
          </div>
          <div className="text-[11px] text-zinc-600">
            <strong className="text-black">{metrics?.posts.published || 0}</strong> published &bull;{' '}
            <strong className="text-zinc-500">{metrics?.posts.draft || 0}</strong> drafts
          </div>
        </div>

        {/* Real Studio Generations */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>STUDIO GENERATIONS</span>
            <QrCode className="w-4 h-4 text-[#00aa00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {loading ? '...' : `${metrics?.generations.total || 0}`}
          </div>
          <div className="text-[11px] text-zinc-600">
            Live database records in qr_history
          </div>
        </div>

      </div>

      {/* 3. REAL CUSTOMER PURCHASES & TRANSACTIONS LOG */}
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
        <div className="border-b-2 border-black bg-zinc-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Customer Purchases &amp; Subscriptions Ledger</span>
            </div>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Live verified transaction events. Only real recorded subscribers appear here.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
              placeholder="Search subscriber..."
              className="border-2 border-black bg-white px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00] w-48 sm:w-60 font-mono"
            />
            <div className="px-2 py-1 bg-black text-[#ccff00] text-xs font-black font-mono">
              {filteredPurchases.length} ACTIVE
            </div>
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center font-mono space-y-3 bg-[#fbfbfa]">
            <div className="inline-flex p-3 border-2 border-black bg-white text-zinc-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-sm font-black uppercase text-black">No Paid Purchases Recorded Yet</div>
            <p className="text-xs text-zinc-500 max-w-md mx-auto font-sans">
              No users have completed an upgrade transaction. When a customer upgrades via Razorpay or Stripe, their verified order will automatically appear in this ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead className="border-b-2 border-black bg-zinc-50 text-zinc-700 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Subscriber</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredPurchases.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3.5">
                      <div>
                        <div className="font-bold text-black">{buyer.name}</div>
                        <div className="text-[11px] text-zinc-500 font-sans">{buyer.email}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-zinc-900">
                      <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300">
                        {buyer.plan}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-black">{buyer.amount}</td>
                    <td className="p-3.5 text-zinc-600">{buyer.gateway}</td>
                    <td className="p-3.5 text-zinc-500 text-[11px]">{buyer.date}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-700 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{buyer.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="text-zinc-600 text-[11px]">{buyer.invoiceId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. REAL RECENT GENERATIONS ACTIVITY */}
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 font-mono">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Real-Time Studio Generation Feed</span>
            </div>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Live generations recorded in MongoDB qr_history collection.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            {metrics?.generations.total || 0} Total Generated
          </span>
        </div>

        {(!metrics?.generations.recent || metrics.generations.recent.length === 0) ? (
          <div className="p-6 text-center font-mono text-xs text-zinc-500 bg-[#fbfbfa]">
            No optical generations recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="pb-2">Payload / Title</th>
                  <th className="pb-2">Format</th>
                  <th className="pb-2">Contrast Ratio</th>
                  <th className="pb-2">User / IP</th>
                  <th className="pb-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {metrics.generations.recent.map((gen) => (
                  <tr key={gen.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 font-bold text-black max-w-xs truncate">{gen.title}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 text-[10px]">
                        {gen.format}
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-600">{gen.contrast}:1</td>
                    <td className="py-2.5 text-zinc-500 text-[11px] truncate max-w-[150px]">
                      {gen.userEmail !== 'guest' ? gen.userEmail : gen.clientIp || 'Guest IP'}
                    </td>
                    <td className="py-2.5 text-right text-zinc-500 text-[11px]">{gen.dateFormatted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. EDITORIAL ARTICLES SUMMARY */}
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 font-mono">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-700" />
              <span>Real Published Articles</span>
            </div>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Live articles stored in database posts collection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="px-3 py-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 text-xs font-bold font-mono"
            >
              Manage ({metrics?.posts.total || 0})
            </Link>
            <Link
              href="/admin/blog/new"
              className="px-3 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-1.5 font-mono"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>+ New Post</span>
            </Link>
          </div>
        </div>

        {(!metrics?.posts.recent || metrics.posts.recent.length === 0) ? (
          <div className="p-8 text-center font-mono space-y-2 bg-[#fbfbfa]">
            <div className="text-sm font-bold text-black uppercase">No Articles Created Yet</div>
            <p className="text-xs text-zinc-500 font-sans">
              The posts collection is currently clean. Click &quot;New Post&quot; or run the admin seed CLI in terminal to populate real articles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.posts.recent.map((post) => (
              <div
                key={post._id}
                className="border-2 border-black p-4 bg-[#fbfbfa] flex flex-col justify-between space-y-4 hover:shadow-[4px_4px_0px_#000000] transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 bg-black text-white font-bold uppercase">
                      {post.category?.title || 'General'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 border ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-800 font-bold'
                          : 'bg-zinc-200 text-zinc-700 border-zinc-400'
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm text-black line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-zinc-500">{post.publishedAt}</span>
                  <Link
                    href={`/admin/blog/edit/${post._id}`}
                    className="font-bold underline text-blue-700 hover:text-black flex items-center gap-1"
                  >
                    <span>Edit</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
