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
  Filter,
} from 'lucide-react';
import { getAllPosts, SanityPost } from '@/lib/sanity';

// Mock subscription buyer data for the live purchase log
interface SubscriptionBuyer {
  id: string;
  name: string;
  email: string;
  plan: 'Pro Athlete Annual' | 'Pro Monthly' | 'Enterprise Prepress';
  amount: string;
  gateway: 'Stripe' | 'Razorpay' | 'Google Pay';
  date: string;
  status: 'Active' | 'Paid';
  invoiceId: string;
  avatar: string;
}

const RECENT_BUYERS: SubscriptionBuyer[] = [
  {
    id: 'sub-001',
    name: 'Marcus Chen',
    email: 'marcus.chen@logistics-prepress.com',
    plan: 'Enterprise Prepress',
    amount: '$249.00',
    gateway: 'Stripe',
    date: 'Today, 08:42 AM',
    status: 'Active',
    invoiceId: 'INV-2026-9041',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'sub-002',
    name: 'Sarah Jenkins',
    email: 's.jenkins@triathlon-arc.io',
    plan: 'Pro Athlete Annual',
    amount: '$99.00',
    gateway: 'Google Pay',
    date: 'Today, 06:15 AM',
    status: 'Active',
    invoiceId: 'INV-2026-9040',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'sub-003',
    name: 'David Miller',
    email: 'miller.david@flexo-print.de',
    plan: 'Pro Monthly',
    amount: '$9.99',
    gateway: 'Stripe',
    date: 'Yesterday, 10:20 PM',
    status: 'Paid',
    invoiceId: 'INV-2026-9039',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'sub-004',
    name: 'Elena Rostova',
    email: 'elena.rostova@cybersec-audit.org',
    plan: 'Pro Athlete Annual',
    amount: '$99.00',
    gateway: 'Razorpay',
    date: 'Yesterday, 04:11 PM',
    status: 'Active',
    invoiceId: 'INV-2026-9038',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'sub-005',
    name: 'Liam Vance',
    email: 'liam@vance-packaging.uk',
    plan: 'Enterprise Prepress',
    amount: '$249.00',
    gateway: 'Stripe',
    date: 'Oct 22, 2026',
    status: 'Active',
    invoiceId: 'INV-2026-9037',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80',
  },
];

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [buyerFilter, setBuyerFilter] = useState('');

  useEffect(() => {
    setPosts(getAllPosts());
  }, []);

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const filteredBuyers = RECENT_BUYERS.filter(
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-mono">
            Nedject System Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl">
            Live telemetry for subscriptions, customer payments, blog editorial workflow, and optical generator activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono">
          <Link
            href="/admin/blog/new"
            className="px-4 py-2.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write Notion Post</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2.5 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-zinc-700" />
            <span>Full Analytics</span>
          </Link>
        </div>
      </div>

      {/* 2. TOP METRICS & FINANCIAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* MRR / Revenue */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>MONTHLY REVENUE (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            $4,290.00
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs previous month</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>ACTIVE SUBSCRIBERS</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            184 Users
          </div>
          <div className="text-[11px] text-zinc-600">
            4.2% free-to-paid conversion rate
          </div>
        </div>

        {/* Blog Posts Count */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>BLOG ARTICLES</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {posts.length} Posts
          </div>
          <div className="text-[11px] text-zinc-600">
            <strong className="text-black">{publishedCount}</strong> published &bull;{' '}
            <strong className="text-zinc-500">{draftCount}</strong> drafts
          </div>
        </div>

        {/* Studio Optical Generations */}
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase">
            <span>STUDIO GENERATIONS</span>
            <QrCode className="w-4 h-4 text-[#00aa00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            213,780
          </div>
          <div className="text-[11px] text-zinc-600">
            300 DPI Photo QR + Barcode matrix
          </div>
        </div>

      </div>

      {/* 3. SUBSCRIPTIONS & BUY LOG ("Subscriptions Buy People") */}
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
        <div className="border-b-2 border-black bg-zinc-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Customer Subscriptions &amp; Purchases Log</span>
            </div>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Live ledger of athletes and enterprises purchasing Nedject Pro subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={buyerFilter}
                onChange={(e) => setBuyerFilter(e.target.value)}
                placeholder="Search buyer or plan..."
                className="border-2 border-black bg-white px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00] w-48 sm:w-60"
              />
            </div>
            <div className="px-2 py-1 bg-black text-[#ccff00] text-xs font-black">
              {filteredBuyers.length} BUYERS
            </div>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="border-b-2 border-black bg-zinc-50 text-zinc-700 font-bold uppercase">
              <tr>
                <th className="p-3.5">Customer / Athlete</th>
                <th className="p-3.5">Subscription Plan</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Gateway</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredBuyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-black overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={buyer.avatar} alt={buyer.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-black">{buyer.name}</div>
                        <div className="text-[11px] text-zinc-500 font-sans">{buyer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-zinc-900">
                    <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300">
                      {buyer.plan}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-black">
                    {buyer.amount}
                  </td>
                  <td className="p-3.5 text-zinc-600">
                    {buyer.gateway}
                  </td>
                  <td className="p-3.5 text-zinc-500 text-[11px]">
                    {buyer.date}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-700 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{buyer.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="text-zinc-600 hover:text-black underline cursor-pointer text-[11px]">
                      {buyer.invoiceId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. BLOG SNIPPET INFO & QUICK EDITORIAL HUB */}
      <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 font-mono">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-700" />
              <span>Editorial Articles &amp; Notion Content Studio</span>
            </div>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Manage your engineering guides, prepress calibration articles, and technical whitepapers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="px-3 py-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 text-xs font-bold"
            >
              View All ({posts.length})
            </Link>
            <Link
              href="/admin/blog/new"
              className="px-3 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-1.5"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>+ New Post</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.slice(0, 3).map((post) => (
            <div
              key={post._id}
              className="border-2 border-black p-4 bg-[#fbfbfa] flex flex-col justify-between space-y-4 hover:shadow-[4px_4px_0px_#000000] transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 bg-black text-white font-bold uppercase">
                    {post.category.title}
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
                <p className="text-xs text-zinc-600 line-clamp-2 font-sans">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-zinc-500">{post.estimatedReadingTime}</span>
                <Link
                  href={`/admin/blog/edit/${post._id}`}
                  className="font-bold underline text-blue-700 hover:text-black flex items-center gap-1"
                >
                  <span>Edit in Notion</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
