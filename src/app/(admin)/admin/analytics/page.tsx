'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (res.ok && data.success) {
        setMetrics(data);
      }
    } catch (e) {
      console.error('Failed to load metrics:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const dailyData = metrics?.dailyActivity || [];
  const toolBreakdown = metrics?.toolBreakdown || [];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase font-mono mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>REAL-TIME SYSTEM METRICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-mono">
            Analytics &amp; Usage Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-sans mt-0.5">
            100% computed from live MongoDB records in users, qr_history, and usage_records collections.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isRefreshing}
          className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold uppercase font-mono flex items-center gap-2 shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* 2. REVENUE & SUBSCRIBER RECAP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">VERIFIED REVENUE (MRR)</div>
          <div className="text-3xl font-black text-black">
            {loading ? '...' : metrics?.revenue.total || '$0.00'}
          </div>
          <div className="text-xs text-zinc-500">
            {metrics?.revenue.activeSubscribers || 0} paying subscribers
          </div>
        </div>

        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">TOTAL REGISTERED USERS</div>
          <div className="text-3xl font-black text-black">
            {loading ? '...' : `${metrics?.users.total || 0} Accounts`}
          </div>
          <div className="text-xs text-zinc-500">
            {metrics?.users.free || 0} Free users in database
          </div>
        </div>

        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">LIFETIME STUDIO GENERATIONS</div>
          <div className="text-3xl font-black text-black">
            {loading ? '...' : `${metrics?.generations.total || 0} Items`}
          </div>
          <div className="text-xs text-zinc-500">
            Stored in MongoDB qr_history
          </div>
        </div>
      </div>

      {/* 3. REAL GENERATION ACTIVITY (PAST 7 DAYS) */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>Real-Time Daily Generation Volume</span>
            </div>
            <div className="text-sm font-bold text-zinc-600 mt-1">
              Active QR Generations Recorded per Day
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Database: <strong>test &bull; qr_history</strong>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#000000" fontSize={11} fontStyle="bold" />
              <YAxis stroke="#000000" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '2px solid #000000',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
                formatter={(val) => [`${val} generations`, 'Daily Activity']}
              />
              <Bar dataKey="generations" fill="#000000" stroke="#000000" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. REAL TOOL SUITE BREAKDOWN */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4 font-mono">
        <div className="border-b-2 border-black pb-3 flex items-center justify-between">
          <div className="text-xs font-black uppercase text-black flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-700" />
            <span>Actual Tool Suite Utilization</span>
          </div>
          <span className="text-[10px] bg-black text-[#ccff00] px-1.5 py-0.5 font-bold">
            LIVE METRICS
          </span>
        </div>

        {toolBreakdown.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 bg-[#fbfbfa]">
            No tool usage records currently recorded in database.
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {toolBreakdown.map((t: any) => (
              <div key={t.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                  <span>{t.name}</span>
                  <span>{t.count} generations ({t.share})</span>
                </div>
                <div className="w-full bg-zinc-100 border border-black h-3 overflow-hidden">
                  <div
                    className={`h-full ${t.color}`}
                    style={{ width: t.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
