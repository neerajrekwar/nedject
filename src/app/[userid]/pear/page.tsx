'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Lock,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Code,
  Terminal,
  RefreshCw,
  RotateCcw,
  Zap,
  CheckCircle2,
  Layers,
  Activity,
  Server,
  Network,
  Cpu,
} from 'lucide-react';

interface ApiKeyItem {
  keyId: string;
  name: string;
  keyPrefix: string;
  allowedOrigins: string[];
  rateLimitRpm: number;
  status: 'active' | 'suspended' | 'revoked';
  totalRequests: number;
  threatCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiLogItem {
  logId: string;
  keyPrefix?: string;
  origin: string;
  ip: string;
  method: string;
  endpoint: string;
  status: number;
  threatType: string;
  threatMessage?: string;
  creditsDeducted: number;
  latencyMs: number;
  timestamp: string;
}

interface PlanInfo {
  plan: string;
  name: string;
  badge?: string;
  creditType: 'credits' | 'unlimited';
  monthlyCredits: number;
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  allowedOriginsLimit: number;
  rateLimitRpm: number;
  apiAccess: boolean;
}

export default function PearGatewayPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const useridParam = (params?.userid as string) || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [planInfo, setPlanInfo] = useState<PlanInfo>({
    plan: 'free',
    name: 'Nedject Free Tier',
    badge: 'FREE FOREVER',
    creditType: 'credits',
    monthlyCredits: 10,
    used: 0,
    limit: 10,
    remaining: 10,
    isUnlimited: false,
    allowedOriginsLimit: 1,
    rateLimitRpm: 20,
    apiAccess: true,
  });

  // Create Key Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [originsInput, setOriginsInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // One-time Key Reveal Modal states
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Edit Origins Modal states
  const [editingKey, setEditingKey] = useState<ApiKeyItem | null>(null);
  const [editOriginsInput, setEditOriginsInput] = useState('');
  const [updatingOrigins, setUpdatingOrigins] = useState(false);

  // Code Snippet Tab
  const [activeTab, setActiveTab] = useState<'curl' | 'javascript' | 'python'>('curl');

  // Interactive Sandbox states
  const [sandboxKey, setSandboxKey] = useState('');
  const [sandboxOrigin, setSandboxOrigin] = useState('');
  const [sandboxPayload, setSandboxPayload] = useState('https://nedject.internal/optical');
  const [testingApi, setTestingApi] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);

  const fetchKeysData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/user/keys?userId=${encodeURIComponent(useridParam)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.keys) setKeys(data.keys);
        if (data.logs) setLogs(data.logs);
        if (data.planInfo) setPlanInfo(data.planInfo);

        // Pre-select active key for sandbox if available
        const activeOne = (data.keys || []).find((k: ApiKeyItem) => k.status === 'active');
        if (activeOne && !sandboxKey) {
          setSandboxKey(activeOne.keyPrefix);
          if (activeOne.allowedOrigins?.[0] && !sandboxOrigin) {
            setSandboxOrigin(activeOne.allowedOrigins[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load keys data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [useridParam, sandboxKey, sandboxOrigin]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${useridParam}`);
      return;
    }
    fetchKeysData();
  }, [status, fetchKeysData, router, useridParam]);

  // Handle Create API Key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const origins = originsInput
      .split(/[\n,]/)
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const res = await fetch('/api/user/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: useridParam,
          name: keyName.trim() || 'Pear Production Gateway',
          allowedOrigins: origins.length > 0 ? origins : ['http://localhost:3000'],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create key');
      }

      setShowCreateModal(false);
      setKeyName('');
      setOriginsInput('');
      setRevealedKey(data.rawSecretKey);
      fetchKeysData();
    } catch (err: any) {
      setCreateError(err.message || 'Error creating key');
    } finally {
      setCreating(false);
    }
  };

  // Handle Revoke Key
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this Pear API key? This action is irreversible.')) {
      return;
    }
    try {
      const res = await fetch(`/api/user/keys?keyId=${encodeURIComponent(keyId)}&userId=${encodeURIComponent(useridParam)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchKeysData();
      } else {
        alert('Failed to revoke API key');
      }
    } catch {
      alert('Network error while revoking API key');
    }
  };

  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);
  const [rotatingAll, setRotatingAll] = useState(false);

  // Handle Rotate Single API Key (Outage & Security Defense)
  const handleRotateKey = async (keyId: string, keyName: string) => {
    if (
      !confirm(
        `🚨 ROTATE API KEY: "${keyName}"\n\nThis will immediately revoke the current token and generate a new secret key with identical origin whitelist settings.\n\nUse this button during an outage, leaked credentials, or routine key rotation.\n\nDo you want to proceed?`
      )
    ) {
      return;
    }

    setRotatingKeyId(keyId);
    try {
      const res = await fetch('/api/user/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rotate',
          keyId,
          userId: useridParam,
          reason: 'User triggered key rotation during security review / global outage mitigation',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rotate key');
      }

      setRevealedKey(data.rawSecretKey);
      fetchKeysData();
    } catch (err: any) {
      alert(err.message || 'Error rotating key');
    } finally {
      setRotatingKeyId(null);
    }
  };

  // Handle Emergency Rotate All Keys (Global Outage Lockdown)
  const handleRotateAllKeys = async () => {
    const activeOnes = keys.filter((k) => k.status === 'active');
    if (activeOnes.length === 0) {
      alert('No active keys to rotate.');
      return;
    }

    if (
      !confirm(
        `⚠️ EMERGENCY OUTAGE ROTATION FOR ALL KEYS\n\nAre you sure you want to rotate all ${activeOnes.length} active API keys?\n\nThis will instantly revoke all current tokens to prevent unauthorized access during a network breach or outage.`
      )
    ) {
      return;
    }

    setRotatingAll(true);
    try {
      let lastRevealed = '';
      for (const k of activeOnes) {
        const res = await fetch('/api/user/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'rotate',
            keyId: k.keyId,
            userId: useridParam,
            reason: 'Emergency Global Outage / Breach Rotation',
          }),
        });
        const data = await res.json();
        if (data.rawSecretKey) {
          lastRevealed = data.rawSecretKey;
        }
      }
      if (lastRevealed) {
        setRevealedKey(lastRevealed);
      }
      fetchKeysData();
      alert('All active keys have been rotated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error rotating keys');
    } finally {
      setRotatingAll(false);
    }
  };

  // Handle Update Origins
  const handleUpdateOrigins = async () => {
    if (!editingKey) return;
    setUpdatingOrigins(true);

    const origins = editOriginsInput
      .split(/[\n,]/)
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const res = await fetch('/api/user/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: editingKey.keyId,
          userId: useridParam,
          allowedOrigins: origins,
        }),
      });
      if (res.ok) {
        setEditingKey(null);
        fetchKeysData();
      } else {
        alert('Failed to update allowed origins');
      }
    } catch {
      alert('Error updating allowed origins');
    } finally {
      setUpdatingOrigins(false);
    }
  };

  // Run Test in Sandbox
  const handleTestApi = async () => {
    setTestingApi(true);
    setTestResponse(null);

    try {
      const startTime = performance.now();
      const res = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${revealedKey || sandboxKey}`,
          'Origin': sandboxOrigin || window.location.origin,
        },
        body: JSON.stringify({
          type: 'qr',
          payload: sandboxPayload,
          format: 'svg',
          options: { dpi: 300 },
        }),
      });

      const latency = Math.round(performance.now() - startTime);
      const data = await res.json();

      setTestResponse({
        httpStatus: res.status,
        ok: res.ok,
        latencyMs: latency,
        headers: {
          'x-origin-verified': res.headers.get('x-origin-verified') || 'false',
          'x-credits-remaining': res.headers.get('x-credits-remaining') || 'unknown',
          'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining') || 'unknown',
        },
        body: data,
      });

      // Refresh log
      fetchKeysData();
    } catch (err: any) {
      setTestResponse({
        httpStatus: 0,
        ok: false,
        latencyMs: 0,
        error: err.message || 'Client network failure',
      });
    } finally {
      setTestingApi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const percentUsed = planInfo.isUnlimited
    ? 0
    : Math.min(100, Math.round((planInfo.used / (planInfo.limit || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black pb-20">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-30 shadow-[0_4px_0_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${useridParam}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-zinc-100 hover:bg-[#ccff00] text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>
            <div className="h-6 w-0.5 bg-black" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black bg-[#ccff00] flex items-center justify-center font-black text-black shadow-[2px_2px_0px_#000000]">
                🍐
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  PEAR // API GATEWAY
                  <span className="text-[10px] bg-black text-[#ccff00] px-2 py-0.5 font-mono font-bold border border-black">
                    PAIR KEYS & ORIGIN SHIELD
                  </span>
                </h1>
                <p className="text-[11px] font-mono text-zinc-600">
                  User ID: <span className="font-bold text-black">{useridParam}</span> • Cryptographic Token & Threat Defense Engine
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchKeysData}
              disabled={refreshing}
              className="p-2 border-2 border-black bg-white hover:bg-zinc-100 font-bold text-xs flex items-center gap-1 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/pay-to-use"
              className="px-3 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade Quota</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* QUOTA & PLAN OVERVIEW BANNER */}
        <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Plan identity & credits */}
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000000] ${
                    planInfo.plan === 'enterprise'
                      ? 'bg-purple-500 text-white'
                      : planInfo.plan === 'pro'
                      ? 'bg-amber-400 text-black'
                      : planInfo.plan === 'starter'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-200 text-black'
                  }`}
                >
                  {planInfo.name}
                </span>

                <span className="text-[11px] font-mono font-bold bg-black text-white px-2 py-0.5 border border-black">
                  {planInfo.creditType === 'unlimited' ? 'UNLIMITED MATRIX' : 'CREDIT-BASED TIER'}
                </span>

                {planInfo.badge && (
                  <span className="text-[10px] font-mono font-bold bg-yellow-200 text-black px-2 py-0.5 border border-black">
                    {planInfo.badge}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  {planInfo.isUnlimited
                    ? '∞ Unlimited Optical & API Generations'
                    : `${planInfo.remaining} Credits Remaining (${planInfo.used} / ${planInfo.limit} Used)`}
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  {planInfo.isUnlimited
                    ? 'Your account has unmetered access to high-throughput vector and optical rendering pipelines.'
                    : 'Each successful API optical render deducts 1 credit. Non-authorized origins or rate-limit threats do not consume credits.'}
                </p>
              </div>

              {/* Progress bar for credit-based plans */}
              {!planInfo.isUnlimited && (
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-zinc-200 h-4 border-2 border-black overflow-hidden relative shadow-[2px_2px_0px_#000000]">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300 border-r-2 border-black"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-600">
                    <span>{planInfo.used} USED</span>
                    <span>{percentUsed}% CONSUMED</span>
                    <span>{planInfo.limit} MONTHLY LIMIT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Security parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-2 border-black bg-zinc-50 p-4 shadow-[4px_4px_0px_#000000]">
              <div className="border border-black bg-white p-2.5">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono font-bold uppercase">
                  <Globe className="w-3.5 h-3.5 text-black" />
                  <span>Allowed Origins</span>
                </div>
                <div className="text-base font-black mt-1">
                  Up to {planInfo.allowedOriginsLimit} <span className="text-xs font-normal">domains</span>
                </div>
              </div>

              <div className="border border-black bg-white p-2.5">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono font-bold uppercase">
                  <Activity className="w-3.5 h-3.5 text-black" />
                  <span>Rate Limit</span>
                </div>
                <div className="text-base font-black mt-1">
                  {planInfo.rateLimitRpm} <span className="text-xs font-normal">RPM</span>
                </div>
              </div>

              <div className="border border-black bg-white p-2.5 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Network Shield</span>
                </div>
                <div className="text-base font-black mt-1 text-emerald-700">
                  ENFORCED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. API KEYS SECTION */}
        <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Key className="w-5 h-5 text-black" />
                Active Pear API Keys ({keys.length})
              </h3>
              <p className="text-xs text-zinc-600">
                Secure bearer tokens paired strictly with your authorized network origins.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {keys.some((k) => k.status === 'active') && (
                <button
                  onClick={handleRotateAllKeys}
                  disabled={rotatingAll}
                  className="px-3 py-2 border-2 border-black bg-amber-300 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                  title="Rotate all active keys immediately in response to an outage, leaked credentials, or network threat"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${rotatingAll ? 'animate-spin' : ''}`} />
                  <span>Rotate All (Outage Defense)</span>
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Generate New Pear Key</span>
              </button>
            </div>
          </div>

          {/* Keys List */}
          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-zinc-600 border-2 border-dashed border-zinc-400">
              Loading active credentials & gateway metrics...
            </div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-black bg-zinc-50 space-y-3">
              <div className="w-12 h-12 border-2 border-black bg-yellow-200 text-black mx-auto flex items-center justify-center font-bold text-xl shadow-[2px_2px_0px_#000000]">
                !
              </div>
              <h4 className="font-black uppercase text-sm">No Pear API Keys Created Yet</h4>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                Generate your first API key to connect your websites, point-of-sale systems, or backend microservices to Nedject's optical engine.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-[#ccff00] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Key Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.keyId}
                  className={`border-2 border-black p-4 transition-all shadow-[4px_4px_0px_#000000] ${
                    k.status === 'revoked'
                      ? 'bg-zinc-100 opacity-60'
                      : k.status === 'suspended'
                      ? 'bg-amber-50'
                      : 'bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Key Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm uppercase">{k.name}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 border border-black ${
                            k.status === 'active'
                              ? 'bg-emerald-400 text-black'
                              : k.status === 'suspended'
                              ? 'bg-amber-400 text-black'
                              : 'bg-red-400 text-black'
                          }`}
                        >
                          {k.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Created {new Date(k.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Masked Prefix & Stats */}
                      <div className="flex flex-wrap items-center gap-3">
                        <code className="border border-black bg-zinc-100 px-2 py-1 font-mono text-xs font-bold text-black shadow-[1px_1px_0px_#000000]">
                          {k.keyPrefix}
                        </code>
                        <span className="text-xs font-mono text-zinc-600">
                          {k.totalRequests} Requests
                        </span>
                        {k.threatCount > 0 && (
                          <span className="text-[10px] font-mono font-bold text-red-600 bg-red-100 px-1.5 py-0.5 border border-red-500 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            {k.threatCount} Threats Blocked
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-zinc-500">
                          Rate Limit: {k.rateLimitRpm} RPM
                        </span>
                      </div>

                      {/* Whitelisted Network Origins Badges */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase font-bold text-zinc-500 flex items-center gap-1">
                          <Network className="w-3 h-3 text-black" />
                          <span>Whitelisted Network Origins:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {k.allowedOrigins.map((orig, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-mono px-2 py-0.5 border border-black bg-emerald-50 text-emerald-900 font-semibold"
                            >
                              {orig}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start lg:self-center">
                      {k.status === 'active' && (
                        <>
                          <button
                            onClick={() => {
                              setEditingKey(k);
                              setEditOriginsInput(k.allowedOrigins.join(', '));
                            }}
                            className="px-3 py-1.5 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Origins</span>
                          </button>

                          <button
                            onClick={() => handleRotateKey(k.keyId, k.name)}
                            disabled={rotatingKeyId === k.keyId}
                            className="px-3 py-1.5 border-2 border-black bg-amber-200 hover:bg-amber-300 font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
                            title="Rotate this key immediately to invalidate the old token and issue a fresh secret"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${rotatingKeyId === k.keyId ? 'animate-spin' : ''}`} />
                            <span>Rotate Key</span>
                          </button>

                          <button
                            onClick={() => handleRevokeKey(k.keyId)}
                            className="px-3 py-1.5 border-2 border-black bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. INTERACTIVE SANDBOX & QUICK CODE INTEGRATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Code Snippets */}
          <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Code className="w-5 h-5 text-black" />
                Client Integration
              </h3>
              <div className="flex items-center border border-black bg-zinc-100 p-0.5">
                {(['curl', 'javascript', 'python'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase transition-all ${
                      activeTab === tab
                        ? 'bg-black text-[#ccff00]'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black text-green-400 p-4 font-mono text-xs border-2 border-black relative overflow-x-auto shadow-[4px_4px_0px_#000000]">
              <button
                onClick={() => {
                  let snippet = '';
                  if (activeTab === 'curl') {
                    snippet = `curl -X POST https://nedject.internal/api/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Origin: https://myapp.com" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"qr","payload":"https://nedject.internal"}'`;
                  } else if (activeTab === 'javascript') {
                    snippet = `const response = await fetch('https://nedject.internal/api/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Origin': 'https://myapp.com',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ type: 'qr', payload: 'https://nedject.internal' })
});
const data = await response.json();`;
                  } else {
                    snippet = `import requests

res = requests.post(
    "https://nedject.internal/api/v1/generate",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Origin": "https://myapp.com",
    },
    json={"type": "qr", "payload": "https://nedject.internal"}
)
print(res.json())`;
                  }
                  copyToClipboard(snippet);
                }}
                className="absolute top-2 right-2 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 text-[10px] flex items-center gap-1 font-sans"
              >
                {copiedKey ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
              </button>

              <pre className="whitespace-pre-wrap leading-relaxed">
                {activeTab === 'curl' &&
                  `curl -X POST https://nedject.internal/api/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Origin: https://myapp.com" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"qr","payload":"https://nedject.internal"}'`}

                {activeTab === 'javascript' &&
                  `const response = await fetch('https://nedject.internal/api/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Origin': 'https://myapp.com',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ type: 'qr', payload: 'https://nedject.internal' })
});
const data = await response.json();`}

                {activeTab === 'python' &&
                  `import requests

res = requests.post(
    "https://nedject.internal/api/v1/generate",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Origin": "https://myapp.com",
    },
    json={"type": "qr", "payload": "https://nedject.internal"}
)
print(res.json())`}
              </pre>
            </div>

            <div className="bg-amber-50 border-2 border-black p-3 text-xs space-y-1">
              <div className="font-bold uppercase flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Origin Security Protocol
              </div>
              <p className="text-zinc-700 text-[11px]">
                The Pear Gateway inspects the <code className="font-mono bg-amber-100 px-1">Origin</code> header on every incoming optical generation. If an external site makes an unauthorized request using your key, it will instantly receive an HTTP 403 Forbidden threat block without consuming your quota.
              </p>
            </div>
          </div>

          {/* Right: Live Test Runner */}
          <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Terminal className="w-5 h-5 text-black" />
                Live Gateway Sandbox
              </h3>
              <span className="text-[10px] font-mono bg-zinc-200 px-2 py-0.5 border border-black font-bold">
                POST /api/v1/generate
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  Bearer API Key:
                </label>
                <input
                  type="text"
                  value={revealedKey || sandboxKey}
                  onChange={(e) => setSandboxKey(e.target.value)}
                  placeholder="ndj_live_..."
                  className="w-full border-2 border-black px-3 py-1.5 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-[#ccff00]/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  Origin Network Header (Simulated):
                </label>
                <input
                  type="text"
                  value={sandboxOrigin}
                  onChange={(e) => setSandboxOrigin(e.target.value)}
                  placeholder="https://myapp.com or http://localhost:3000"
                  className="w-full border-2 border-black px-3 py-1.5 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-[#ccff00]/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  Generation Payload:
                </label>
                <input
                  type="text"
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  placeholder="https://..."
                  className="w-full border-2 border-black px-3 py-1.5 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-[#ccff00]/10"
                />
              </div>

              <button
                onClick={handleTestApi}
                disabled={testingApi || (!revealedKey && !sandboxKey)}
                className="w-full py-2.5 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] disabled:bg-zinc-200 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
              >
                {testingApi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Optical Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Send Gateway Test Request</span>
                  </>
                )}
              </button>

              {/* Test Response Output */}
              {testResponse && (
                <div
                  className={`border-2 border-black p-3 font-mono text-xs shadow-[3px_3px_0px_#000000] ${
                    testResponse.ok ? 'bg-emerald-50 border-emerald-900' : 'bg-red-50 border-red-900'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-black/20 pb-1 mb-2 font-bold">
                    <span className={testResponse.ok ? 'text-emerald-800' : 'text-red-700'}>
                      STATUS: {testResponse.httpStatus} {testResponse.ok ? 'OK' : 'DENIED / THREAT'}
                    </span>
                    <span className="text-[10px] text-zinc-600">{testResponse.latencyMs}ms</span>
                  </div>

                  <div className="text-[10px] space-y-1 mb-2 font-mono text-zinc-700">
                    <div>Origin-Verified: {testResponse.headers?.['x-origin-verified']}</div>
                    <div>Credits-Remaining: {testResponse.headers?.['x-credits-remaining']}</div>
                  </div>

                  <pre className="text-[11px] overflow-x-auto bg-black text-white p-2 border border-black max-h-40">
                    {JSON.stringify(testResponse.body || testResponse.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. THREAT TELEMETRY & ACTIVITY AUDIT LOG */}
        <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-black" />
                Live Threat Prevention & Request Feed
              </h3>
              <p className="text-xs text-zinc-600">
                Audited verification telemetry from your registered API keys.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-black text-[#ccff00] px-2 py-1 border border-black">
              REAL-TIME AUDIT
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="p-6 text-center border border-zinc-300 font-mono text-xs text-zinc-500">
              No generation requests recorded yet. Fire a test request above to view telemetry.
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black text-white border-b-2 border-black text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Threat Type</th>
                    <th className="p-2.5">Origin Domain</th>
                    <th className="p-2.5">Key Prefix</th>
                    <th className="p-2.5">Credits</th>
                    <th className="p-2.5">Latency</th>
                    <th className="p-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {logs.map((l, i) => (
                    <tr
                      key={l.logId || i}
                      className={l.status === 200 ? 'bg-white hover:bg-zinc-50' : 'bg-red-50 hover:bg-red-100'}
                    >
                      <td className="p-2.5 font-bold">
                        <span
                          className={`px-1.5 py-0.5 border text-[10px] ${
                            l.status === 200
                              ? 'bg-emerald-300 text-black border-black'
                              : l.status === 403
                              ? 'bg-red-500 text-white border-black'
                              : 'bg-amber-400 text-black border-black'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`text-[10px] font-bold ${
                            l.threatType === 'NONE' ? 'text-zinc-500' : 'text-red-700'
                          }`}
                        >
                          {l.threatType}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold max-w-xs truncate" title={l.origin}>
                        {l.origin || 'Direct'}
                      </td>
                      <td className="p-2.5 text-zinc-600">{l.keyPrefix || 'ndj_...'}</td>
                      <td className="p-2.5">{l.creditsDeducted > 0 ? `-${l.creditsDeducted}` : '0'}</td>
                      <td className="p-2.5 text-zinc-500">{l.latencyMs}ms</td>
                      <td className="p-2.5 text-zinc-500 text-[10px]">
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 6. CREATE KEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white max-w-lg w-full p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Key className="w-5 h-5 text-black" />
                Generate New Pear Key
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-600 hover:text-black font-black text-sm p-1"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-mono font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Key Name / Client Label:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Web Storefront"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full border-2 border-black px-3 py-2 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-[#ccff00]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Allowed Network Origins (Whitelist):
                </label>
                <textarea
                  rows={3}
                  placeholder="https://myapp.com, https://api.myshop.com, http://localhost:3000"
                  value={originsInput}
                  onChange={(e) => setOriginsInput(e.target.value)}
                  className="w-full border-2 border-black p-3 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-[#ccff00]/10"
                />
                <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                  Separate multiple origins with commas or newlines. Up to{' '}
                  <span className="font-bold">{planInfo.allowedOriginsLimit} domains</span> allowed on your current plan.
                </p>
              </div>

              <div className="p-3 bg-yellow-50 border-2 border-black text-[11px] space-y-1">
                <div className="font-bold uppercase text-yellow-900 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-yellow-800" />
                  Origin Defense Security Notice
                </div>
                <p className="text-zinc-700">
                  Any request sent from an origin not strictly in this list will be rejected with an HTTP 403 Forbidden threat event.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  {creating ? 'Generating Secure Token...' : 'Create Pear Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. ONE-TIME SECRET KEY REVEAL MODAL */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white max-w-lg w-full p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                Pear Key Generated Successfully
              </h3>
            </div>

            <div className="p-3 bg-red-100 border-2 border-black text-xs font-mono font-bold text-red-900 space-y-1">
              <div>⚠️ SAVE THIS RAW SECRET KEY NOW!</div>
              <div className="font-normal text-[11px] text-red-800">
                For security reasons, this key will NEVER be shown again. If you lose it, you will need to generate a new one.
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase">Your Secret Key:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={revealedKey}
                  className="w-full border-2 border-black px-3 py-2 font-mono text-xs font-bold bg-zinc-100 select-all shadow-[2px_2px_0px_#000000]"
                />
                <button
                  onClick={() => copyToClipboard(revealedKey)}
                  className="px-3 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setRevealedKey(null)}
                className="px-5 py-2 border-2 border-black bg-black text-[#ccff00] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000]"
              >
                I Have Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. EDIT ORIGINS MODAL */}
      {editingKey && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white max-w-lg w-full p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-black" />
                Edit Allowed Network Origins
              </h3>
              <button
                onClick={() => setEditingKey(null)}
                className="text-zinc-600 hover:text-black font-black text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-xs font-mono text-zinc-600 mb-2">
                Key: <span className="font-bold text-black">{editingKey.name}</span> ({editingKey.keyPrefix})
              </div>
              <textarea
                rows={4}
                value={editOriginsInput}
                onChange={(e) => setEditOriginsInput(e.target.value)}
                className="w-full border-2 border-black p-3 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none"
                placeholder="https://myapp.com, http://localhost:3000"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                Separate origins with commas or newlines. Up to {planInfo.allowedOriginsLimit} domains allowed.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 border-2 border-black bg-zinc-100 hover:bg-zinc-200 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateOrigins}
                disabled={updatingOrigins}
                className="px-5 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000]"
              >
                {updatingOrigins ? 'Saving...' : 'Update Whitelist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
