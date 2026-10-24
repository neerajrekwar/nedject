'use client';

import React, { useState } from 'react';
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

const REVENUE_DATA = [
  { month: 'May', revenue: 1420, subscribers: 48 },
  { month: 'Jun', revenue: 1890, subscribers: 64 },
  { month: 'Jul', revenue: 2310, subscribers: 82 },
  { month: 'Aug', revenue: 2950, subscribers: 110 },
  { month: 'Sep', revenue: 3620, subscribers: 145 },
  { month: 'Oct', revenue: 4290, subscribers: 184 },
];

const DAILY_TRAFFIC_DATA = [
  { day: 'Mon', visitors: 1420, generations: 6800 },
  { day: 'Tue', visitors: 1680, generations: 7920 },
  { day: 'Wed', visitors: 1950, generations: 9410 },
  { day: 'Thu', visitors: 1820, generations: 8750 },
  { day: 'Fri', visitors: 2240, generations: 11200 },
  { day: 'Sat', visitors: 1690, generations: 8100 },
  { day: 'Sun', visitors: 1780, generations: 8650 },
];

const TOOL_BREAKDOWN = [
  { name: '300 DPI Photo QR Studio', share: '48%', count: '102,614', color: 'bg-[#ccff00]' },
  { name: 'Vector Barcode Studio (FNSKU/UPC)', share: '28%', count: '59,858', color: 'bg-blue-500' },
  { name: 'Fitness Glass & Google Fit HUD', share: '16%', count: '34,204', color: 'bg-emerald-500' },
  { name: 'Device Mockup Studio Lab', share: '8%', count: '17,104', color: 'bg-purple-500' },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase font-mono mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Commercial &amp; System Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-mono">
            Analytics &amp; Revenue Metrics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-sans mt-0.5">
            Real-time subscriber acquisition, revenue growth velocity, and tool suite utilization across Nedject.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Timeframe:</span>
          <div className="border-2 border-black bg-zinc-100 p-1 flex items-center gap-1">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 font-bold uppercase transition-colors ${
                  timeRange === r
                    ? 'bg-black text-[#ccff00]'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. REVENUE VELOCITY CHART */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Monthly Recurring Revenue (MRR) Growth Curve</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-black mt-1">
              $4,290.00 <span className="text-xs font-bold text-emerald-700">+18.4%</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Current Tier: <strong>184 Active Paying Athletes</strong>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ccff00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ccff00" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#000000" fontSize={11} fontStyle="bold" />
              <YAxis stroke="#000000" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '2px solid #000000',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
                formatter={(val) => [`$${val}`, 'Monthly Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#000000"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. DAILY VISITORS & GENERATION SPIKES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Daily Traffic Bar Chart (7 cols) */}
        <div className="lg:col-span-7 border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4 font-mono">
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Daily Traffic &amp; Optical Render Volume</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">7-DAY ROTATION</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#000000" fontSize={11} />
                <YAxis stroke="#000000" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: '2px solid #000000',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="visitors" name="Unique Visitors" fill="#000000" />
                <Bar dataKey="generations" name="Matrices Processed" fill="#ccff00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Tool Utilization Breakdown (5 cols) */}
        <div className="lg:col-span-5 border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4 font-mono">
          <div className="border-b-2 border-black pb-3">
            <div className="text-xs font-black uppercase text-black">
              Suite Utilization Distribution
            </div>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
              Breakdown of user requests across tools.
            </p>
          </div>

          <div className="space-y-3.5">
            {TOOL_BREAKDOWN.map((tool) => (
              <div key={tool.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black truncate max-w-[200px]">{tool.name}</span>
                  <span className="font-black text-black">{tool.share} ({tool.count})</span>
                </div>
                <div className="w-full bg-zinc-100 h-2.5 border border-black overflow-hidden">
                  <div
                    className={`h-full ${tool.color} border-r border-black`}
                    style={{ width: tool.share }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-200 text-xs space-y-1.5 font-sans">
            <div className="text-[11px] font-bold text-zinc-700 uppercase font-mono">
              Infrastructure Telemetry:
            </div>
            <div className="text-[11px] text-zinc-600 flex justify-between">
              <span>Google Fit API Quota:</span>
              <strong className="text-black">8,420 / 50,000 req</strong>
            </div>
            <div className="text-[11px] text-zinc-600 flex justify-between">
              <span>Vercel Edge Hit Ratio:</span>
              <strong className="text-emerald-700">94.8%</strong>
            </div>
            <div className="text-[11px] text-zinc-600 flex justify-between">
              <span>Average Render Time:</span>
              <strong className="text-black">18.4ms (Client Canvas)</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
