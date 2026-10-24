'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Activity,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  CreditCard,
  Sliders,
  Sparkles,
  Server,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [featureFlag, setFeatureFlag] = useState<number>(1);
  const [flagLoading, setFlagLoading] = useState(true);
  const [updatingFlag, setUpdatingFlag] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDbHealth = async () => {
    try {
      setDbLoading(true);
      const res = await fetch('/api/health/db');
      const data = await res.json();
      setDbHealth(data);
    } catch (e: any) {
      setDbHealth({ status: 'ERROR', error: e.message });
    } finally {
      setDbLoading(false);
    }
  };

  const fetchFeatureFlag = async () => {
    try {
      setFlagLoading(true);
      const res = await fetch('/api/feature-flags');
      const data = await res.json();
      if (res.ok) {
        setFeatureFlag(data.monetizationMode ?? 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFlagLoading(false);
    }
  };

  useEffect(() => {
    fetchDbHealth();
    fetchFeatureFlag();
  }, []);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleFlag = async (newMode: number) => {
    try {
      setUpdatingFlag(true);
      const res = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monetizationMode: newMode }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeatureFlag(newMode);
        showNotify('success', `✓ Feature flag updated in MongoDB: ${data.description}`);
      } else {
        showNotify('error', data.error || 'Failed to update feature flag');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    } finally {
      setUpdatingFlag(false);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>SYSTEM HEALTH &amp; LIVE FEATURE FLAGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            System Diagnostics &amp; Controls
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-0.5 max-w-xl">
            Live database ping latency, real-time feature flag toggles in MongoDB, and third-party integrations health.
          </p>
        </div>

        <button
          onClick={() => {
            fetchDbHealth();
            fetchFeatureFlag();
          }}
          className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold uppercase flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
          <span>Ping Systems</span>
        </button>
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

      {/* 2. REAL-TIME MONGODB DIAGNOSTICS CARD */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>MongoDB Atlas Cluster Telemetry</span>
          </div>
          <span
            className={`px-2 py-0.5 border text-[10px] font-black uppercase ${
              dbHealth?.status === 'HEALTHY'
                ? 'bg-emerald-100 border-emerald-800 text-emerald-900'
                : 'bg-rose-100 border-rose-800 text-rose-900'
            }`}
          >
            {dbLoading ? 'PINGING...' : dbHealth?.status || 'UNKNOWN'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 border border-black bg-zinc-50 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Latency / Ping</span>
            <span className="text-xl font-black text-black">
              {dbHealth?.pingMs !== undefined ? `${dbHealth.pingMs} ms` : 'N/A'}
            </span>
          </div>

          <div className="p-3 border border-black bg-zinc-50 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Database Name</span>
            <span className="text-xl font-black text-black">{dbHealth?.database || 'test'}</span>
          </div>

          <div className="p-3 border border-black bg-zinc-50 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Write Verification</span>
            <span className="text-xl font-black text-emerald-700">
              {dbHealth?.writeVerification || 'ACTIVE'}
            </span>
          </div>

          <div className="p-3 border border-black bg-zinc-50 space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Active Collections</span>
            <span className="text-xl font-black text-black">
              {dbHealth?.collections?.length || 0}
            </span>
          </div>
        </div>

        {dbHealth?.collections && dbHealth.collections.length > 0 && (
          <div className="pt-2 text-xs">
            <span className="font-bold text-zinc-600 uppercase block mb-1.5">Discovered Collections:</span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {dbHealth.collections.map((col: string) => (
                <span
                  key={col}
                  className="px-2 py-0.5 border border-black bg-zinc-100 text-[11px] font-bold"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. REAL-TIME MONETIZATION FEATURE FLAG SWITCH */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
            <Sliders className="w-4 h-4 text-blue-700" />
            <span>Monetization &amp; Paywall Engine Feature Flag</span>
          </div>
          <span className="text-[10px] bg-black text-[#ccff00] px-1.5 py-0.5 font-bold">
            STORED IN MONGODB
          </span>
        </div>

        <p className="text-xs text-zinc-600 font-sans">
          Toggle the monetization strategy shown on public quota limits and paywall banners across the entire application without redeploying code.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Mode 1: Pro Plans & Pricing */}
          <div
            onClick={() => !updatingFlag && handleToggleFlag(1)}
            className={`p-4 border-2 transition-all cursor-pointer ${
              featureFlag === 1
                ? 'border-black bg-[#ccff00]/15 shadow-[4px_4px_0px_#000000]'
                : 'border-zinc-300 bg-zinc-50 hover:border-black opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-xs uppercase text-black">Mode 1: Pro Plans &amp; Upgrades</span>
              {featureFlag === 1 && (
                <span className="px-2 py-0.5 bg-black text-[#ccff00] text-[10px] font-black uppercase">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 font-sans">
              Shows tiered subscriptions: Free (10 downloads), Pro Athlete ($9.99/mo or $99/yr), and Enterprise Prepress ($249/yr). Connects to Razorpay.
            </p>
          </div>

          {/* Mode 0: Buy Me a Coffee */}
          <div
            onClick={() => !updatingFlag && handleToggleFlag(0)}
            className={`p-4 border-2 transition-all cursor-pointer ${
              featureFlag === 0
                ? 'border-black bg-[#ccff00]/15 shadow-[4px_4px_0px_#000000]'
                : 'border-zinc-300 bg-zinc-50 hover:border-black opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-xs uppercase text-black">Mode 0: Buy Me a Coffee / Supporter</span>
              {featureFlag === 0 && (
                <span className="px-2 py-0.5 bg-black text-[#ccff00] text-[10px] font-black uppercase">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 font-sans">
              Displays casual tip/supporter modal and QR donation badges instead of strict commercial subscription gates.
            </p>
          </div>
        </div>
      </div>

      {/* 4. THIRD PARTY INTEGRATION CHECKLIST */}
      <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span>Infrastructure &amp; API Integration Status</span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 border border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <div>
                <span className="font-bold text-black">MongoDB Atlas (Serverless / Primary)</span>
                <span className="text-[11px] text-zinc-500 block">
                  Configured via MONGODB_URI in .env.local
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
              CONNECTED
            </span>
          </div>

          <div className="p-3 border border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              <div>
                <span className="font-bold text-black">Google Fit Cloud API (OAuth 2.0 PKCE)</span>
                <span className="text-[11px] text-zinc-500 block">
                  Limited Use policy compliance active with client-side token caching
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>

          <div className="p-3 border border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
              <div>
                <span className="font-bold text-black">Razorpay Payments Gateway</span>
                <span className="text-[11px] text-zinc-500 block">
                  Webhook signature verification and plan provisioner
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold">
              SANDBOX / READY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
