'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Lock,
  PauseCircle,
  PlayCircle,
  Trash2,
  RefreshCw,
  Search,
  Activity,
  AlertTriangle,
  Layers,
  Network,
  Cpu,
  Edit3,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface AdminKeyItem {
  keyId: string;
  userId: string;
  userEmail: string;
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

interface AdminLogItem {
  logId: string;
  keyId?: string;
  keyPrefix?: string;
  userId?: string;
  userEmail?: string;
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

interface AdminOverview {
  totalKeys: number;
  activeKeys: number;
  suspendedKeys: number;
  revokedKeys: number;
  totalRequests: number;
  totalThreatsBlocked: number;
  originThreats: number;
  rateLimitThreats: number;
}

export default function AdminApiesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<AdminOverview>({
    totalKeys: 0,
    activeKeys: 0,
    suspendedKeys: 0,
    revokedKeys: 0,
    totalRequests: 0,
    totalThreatsBlocked: 0,
    originThreats: 0,
    rateLimitThreats: 0,
  });
  const [keys, setKeys] = useState<AdminKeyItem[]>([]);
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'revoked'>('all');

  // Edit Origins Modal
  const [editingKey, setEditingKey] = useState<AdminKeyItem | null>(null);
  const [editOriginsInput, setEditOriginsInput] = useState('');
  const [savingOrigins, setSavingOrigins] = useState(false);

  // Rotation states
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);
  const [globalLockdownRunning, setGlobalLockdownRunning] = useState(false);
  const [revealedRotatedKey, setRevealedRotatedKey] = useState<{ prefix: string; secret: string } | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/apies');
      if (res.ok) {
        const data = await res.json();
        if (data.overview) setOverview(data.overview);
        if (data.keys) setKeys(data.keys);
        if (data.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load admin API telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Suspend or Activate Key
  const handleToggleStatus = async (keyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/apies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, status: newStatus }),
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Failed to update key status');
      }
    } catch {
      alert('Error updating status');
    }
  };

  // Permanently Revoke Key
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to permanently revoke this key?')) return;
    try {
      const res = await fetch(`/api/admin/apies?keyId=${encodeURIComponent(keyId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Failed to revoke key');
      }
    } catch {
      alert('Error revoking key');
    }
  };

  // Single Key Rotation by Admin
  const handleRotateKey = async (keyId: string, prefix: string) => {
    if (!confirm(`Rotate API key (${prefix})? This will revoke the current secret and immediately issue a fresh key.`)) {
      return;
    }
    setRotatingKeyId(keyId);
    try {
      const res = await fetch('/api/admin/apies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate', keyId, reason: 'Admin security rotation' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rotate key');
      setRevealedRotatedKey({ prefix: data.key.keyPrefix, secret: data.rawSecretKey });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error rotating key');
    } finally {
      setRotatingKeyId(null);
    }
  };

  // Global Outage Emergency Protocol
  const handleGlobalOutageRotation = async () => {
    const confirmation = prompt(
      `🚨 EMERGENCY GLOBAL OUTAGE PROTOCOL\n\nThis will immediately suspend all active API keys across the platform to protect against an ongoing global network outage or threat breach.\n\nType "CONFIRM LOCKDOWN" to execute:`
    );
    if (confirmation !== 'CONFIRM LOCKDOWN') {
      return;
    }

    setGlobalLockdownRunning(true);
    try {
      const res = await fetch('/api/admin/apies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'global_emergency_rotation',
          reason: 'Global outage emergency lockdown initiated by Administrator',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute global lockdown');
      alert(`Global outage defense active: ${data.totalSuspended || 0} active keys suspended.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error during global lockdown');
    } finally {
      setGlobalLockdownRunning(false);
    }
  };

  // Update origins
  const handleSaveOrigins = async () => {
    if (!editingKey) return;
    setSavingOrigins(true);
    const origins = editOriginsInput
      .split(/[\n,]/)
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const res = await fetch('/api/admin/apies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: editingKey.keyId, allowedOrigins: origins }),
      });
      if (res.ok) {
        setEditingKey(null);
        fetchAdminData();
      } else {
        alert('Failed to save origins');
      }
    } catch {
      alert('Error updating origins');
    } finally {
      setSavingOrigins(false);
    }
  };

  // Filtered keys
  const filteredKeys = keys.filter((k) => {
    const matchesQuery =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.allowedOrigins.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#ccff00] border border-black inline-block animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                API GATEWAY & THREAT RADAR
              </h1>
            </div>
            <p className="text-xs font-mono text-zinc-600">
              Origin Whitelist Security, Token Authority & Generation Quota Engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGlobalOutageRotation}
              disabled={globalLockdownRunning}
              className="px-3.5 py-2 border-2 border-black bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
              title="Global Outage Defense: Immediately suspend all active API keys platform-wide to stop threats"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>Rotate All (Global Outage)</span>
            </button>
            <button
              onClick={fetchAdminData}
              disabled={refreshing}
              className="px-3 py-2 border-2 border-black bg-white hover:bg-zinc-100 font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Stream</span>
            </button>
            <Link
              href="/admin/plans"
              className="px-3 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Configure Plans</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Keys */}
        <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs font-bold uppercase">
            <span>Total Keys</span>
            <Key className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl font-black mt-2 font-mono">{overview.totalKeys}</div>
          <div className="text-[11px] font-mono text-zinc-600 mt-1 flex items-center gap-2">
            <span className="text-emerald-700 font-bold">{overview.activeKeys} Active</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">{overview.suspendedKeys} Suspended</span>
            <span>•</span>
            <span className="text-red-700 font-bold">{overview.revokedKeys} Revoked</span>
          </div>
        </div>

        {/* Total API Requests */}
        <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs font-bold uppercase">
            <span>Total Generations</span>
            <Cpu className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl font-black mt-2 font-mono">{overview.totalRequests}</div>
          <div className="text-[11px] font-mono text-zinc-600 mt-1">
            Processed via Pear Optical Gateway
          </div>
        </div>

        {/* Total Threats Blocked */}
        <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-red-600 font-mono text-xs font-bold uppercase">
            <span>Threats Defended</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black mt-2 font-mono text-red-600">
            {overview.totalThreatsBlocked}
          </div>
          <div className="text-[11px] font-mono text-zinc-600 mt-1 flex items-center gap-2">
            <span className="font-bold text-red-700">{overview.originThreats} Origins 403</span>
            <span>•</span>
            <span className="font-bold text-amber-700">{overview.rateLimitThreats} Rate Limit 429</span>
          </div>
        </div>

        {/* Origin Defense Status */}
        <div className="border-4 border-black bg-black text-[#ccff00] p-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between font-mono text-xs font-bold uppercase">
            <span>Origin Whitelist Shield</span>
            <Network className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="text-2xl font-black mt-2 font-mono">STRICT ENFORCE</div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">
            Rejects all unauthorized origins with 403
          </div>
        </div>
      </div>

      {/* 3. PLAN SPECIFICATIONS & QUOTAS REFERENCE */}
      <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" />
            Current Package & Plan Gateway Specifications
          </h3>
          <span className="text-[10px] font-mono bg-zinc-100 border border-black px-2 py-0.5 font-bold">
            CONFIGURATION MATRIX
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border-2 border-black p-3 bg-zinc-50">
            <div className="font-black text-xs uppercase flex items-center justify-between">
              <span>Free Tier</span>
              <span className="bg-zinc-200 text-black px-1.5 py-0.2 text-[9px] border border-black">CREDITS</span>
            </div>
            <div className="mt-2 text-xs font-mono space-y-1 text-zinc-700">
              <div>Credits: <span className="font-bold text-black">10 Generations</span></div>
              <div>Rate Limit: <span className="font-bold text-black">20 RPM</span></div>
              <div>Max Origins: <span className="font-bold text-black">1 Domain</span></div>
            </div>
          </div>

          <div className="border-2 border-black p-3 bg-emerald-50">
            <div className="font-black text-xs uppercase flex items-center justify-between text-emerald-900">
              <span>Starter / Creator</span>
              <span className="bg-emerald-600 text-white px-1.5 py-0.2 text-[9px] border border-black">CREDITS</span>
            </div>
            <div className="mt-2 text-xs font-mono space-y-1 text-zinc-700">
              <div>Credits: <span className="font-bold text-black">500 Credits/mo</span></div>
              <div>Rate Limit: <span className="font-bold text-black">60 RPM</span></div>
              <div>Max Origins: <span className="font-bold text-black">5 Domains</span></div>
            </div>
          </div>

          <div className="border-2 border-black p-3 bg-amber-50">
            <div className="font-black text-xs uppercase flex items-center justify-between text-amber-900">
              <span>Pro Studio</span>
              <span className="bg-amber-400 text-black px-1.5 py-0.2 text-[9px] border border-black font-bold">UNLIMITED</span>
            </div>
            <div className="mt-2 text-xs font-mono space-y-1 text-zinc-700">
              <div>Credits: <span className="font-bold text-black">∞ Unlimited</span></div>
              <div>Rate Limit: <span className="font-bold text-black">300 RPM</span></div>
              <div>Max Origins: <span className="font-bold text-black">10 Domains</span></div>
            </div>
          </div>

          <div className="border-2 border-black p-3 bg-purple-50">
            <div className="font-black text-xs uppercase flex items-center justify-between text-purple-900">
              <span>Enterprise Matrix</span>
              <span className="bg-purple-600 text-white px-1.5 py-0.2 text-[9px] border border-black font-bold">UNLIMITED</span>
            </div>
            <div className="mt-2 text-xs font-mono space-y-1 text-zinc-700">
              <div>Credits: <span className="font-bold text-black">∞ Unlimited</span></div>
              <div>Rate Limit: <span className="font-bold text-black">1,200 RPM</span></div>
              <div>Max Origins: <span className="font-bold text-black">50 Domains</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MASTER API KEYS DIRECTORY */}
      <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-black" />
              Master API Keys Directory ({filteredKeys.length})
            </h3>
            <p className="text-xs text-zinc-600">
              Administrative management of all issued Pear tokens and origin whitelist rules.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search user, key, origin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border-2 border-black text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none"
              />
            </div>

            <div className="flex border border-black bg-zinc-100 p-0.5 text-xs font-mono">
              {(['all', 'active', 'suspended', 'revoked'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 uppercase font-bold text-[10px] ${
                    statusFilter === st ? 'bg-black text-[#ccff00]' : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Master Table */}
        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-zinc-500">
            Querying all API key hashes & threat metadata...
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-zinc-400 font-mono text-xs text-zinc-500">
            No API keys match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-black">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black text-white border-b-2 border-black text-[10px] uppercase">
                <tr>
                  <th className="p-3">User / Account</th>
                  <th className="p-3">Key Label & Prefix</th>
                  <th className="p-3">Whitelisted Origins</th>
                  <th className="p-3">RPM Limit</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Threats</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredKeys.map((k) => (
                  <tr
                    key={k.keyId}
                    className={`hover:bg-zinc-50 ${
                      k.status === 'revoked'
                        ? 'bg-zinc-100 opacity-60'
                        : k.status === 'suspended'
                        ? 'bg-amber-50/50'
                        : 'bg-white'
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-bold text-black">{k.userEmail}</div>
                      <div className="text-[10px] text-zinc-500">{k.userId}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-black uppercase">{k.name}</div>
                      <code className="text-[11px] bg-zinc-100 border border-black px-1.5 py-0.5 font-bold">
                        {k.keyPrefix}
                      </code>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {k.allowedOrigins.map((orig, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-50 text-emerald-900 border border-emerald-300 px-1 py-0.2"
                          >
                            {orig}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 font-bold">{k.rateLimitRpm} RPM</td>

                    <td className="p-3">
                      <div className="font-bold">{k.totalRequests} calls</div>
                      <div className="text-[10px] text-zinc-500">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                      </div>
                    </td>

                    <td className="p-3">
                      {k.threatCount > 0 ? (
                        <span className="text-red-700 bg-red-100 border border-red-400 px-1.5 py-0.5 text-[10px] font-bold">
                          {k.threatCount} threats
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px]">0</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 border border-black ${
                          k.status === 'active'
                            ? 'bg-emerald-300 text-black'
                            : k.status === 'suspended'
                            ? 'bg-amber-400 text-black'
                            : 'bg-red-400 text-black'
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {k.status !== 'revoked' && (
                          <button
                            onClick={() => handleToggleStatus(k.keyId, k.status)}
                            title={k.status === 'active' ? 'Suspend key' : 'Activate key'}
                            className="p-1 border border-black bg-zinc-100 hover:bg-zinc-200 shadow-[1px_1px_0px_#000000]"
                          >
                            {k.status === 'active' ? (
                              <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                          </button>
                        )}

                        {k.status !== 'revoked' && (
                          <button
                            onClick={() => handleRotateKey(k.keyId, k.keyPrefix)}
                            disabled={rotatingKeyId === k.keyId}
                            title="Rotate key immediately (outage/breach response)"
                            className="p-1 border border-black bg-amber-200 hover:bg-amber-300 shadow-[1px_1px_0px_#000000]"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 text-amber-950 ${rotatingKeyId === k.keyId ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingKey(k);
                            setEditOriginsInput(k.allowedOrigins.join(', '));
                          }}
                          title="Edit origins"
                          className="p-1 border border-black bg-zinc-100 hover:bg-zinc-200 shadow-[1px_1px_0px_#000000]"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-700" />
                        </button>

                        {k.status !== 'revoked' && (
                          <button
                            onClick={() => handleRevokeKey(k.keyId)}
                            title="Revoke permanently"
                            className="p-1 border border-black bg-red-100 hover:bg-red-200 shadow-[1px_1px_0px_#000000]"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-700" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. LIVE THREAT RADAR FEED */}
      <div className="border-4 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Live Security Threat Feed (Recent 50 Events)
            </h3>
            <p className="text-xs text-zinc-600">
              Automated blocks for unauthorized origins, rate-limit abuse, and invalid tokens.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 font-bold">
            DEFENSE LOG
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center border border-zinc-300 font-mono text-xs text-zinc-500">
            No API threat events recorded.
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-black max-h-96">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black text-white border-b-2 border-black text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="p-2.5">HTTP Code</th>
                  <th className="p-2.5">Threat Classification</th>
                  <th className="p-2.5">Violating Origin</th>
                  <th className="p-2.5">Client IP</th>
                  <th className="p-2.5">Key Prefix</th>
                  <th className="p-2.5">Security Diagnostics</th>
                  <th className="p-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {logs.map((l, i) => (
                  <tr
                    key={l.logId || i}
                    className={
                      l.threatType !== 'NONE'
                        ? 'bg-red-50/70 hover:bg-red-100'
                        : 'bg-white hover:bg-zinc-50'
                    }
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
                    <td className="p-2.5 font-bold truncate max-w-xs" title={l.origin}>
                      {l.origin || 'DIRECT/BLANK'}
                    </td>
                    <td className="p-2.5 text-zinc-600">{l.ip}</td>
                    <td className="p-2.5">{l.keyPrefix || 'None'}</td>
                    <td className="p-2.5 text-[11px] text-zinc-700 max-w-sm truncate" title={l.threatMessage}>
                      {l.threatMessage || 'Authorized request'}
                    </td>
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

      {/* 6. EDIT ORIGINS MODAL FOR ADMIN */}
      {editingKey && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white max-w-lg w-full p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-black" />
                Admin: Override Allowed Network Origins
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
                User: <span className="font-bold text-black">{editingKey.userEmail}</span> • Key: {editingKey.keyPrefix}
              </div>
              <textarea
                rows={4}
                value={editOriginsInput}
                onChange={(e) => setEditOriginsInput(e.target.value)}
                className="w-full border-2 border-black p-3 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none"
                placeholder="https://clientapp.com, http://localhost:3000"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                Separate origins with commas or newlines. Entering &apos;*&apos; permits all network origins.
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
                onClick={handleSaveOrigins}
                disabled={savingOrigins}
                className="px-5 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000]"
              >
                {savingOrigins ? 'Saving...' : 'Apply Origin Override'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 7. REVEAL ROTATED KEY MODAL */}
      {revealedRotatedKey && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white max-w-lg w-full p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                API Key Rotated Successfully
              </h3>
            </div>

            <div className="p-3 bg-red-100 border-2 border-black text-xs font-mono font-bold text-red-900 space-y-1">
              <div>⚠️ NEW RAW SECRET KEY (SHOWN ONCE)</div>
              <div className="font-normal text-[11px] text-red-800">
                The previous key was permanently revoked. Provide this new key to the client.
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase">
                New Key ({revealedRotatedKey.prefix}):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={revealedRotatedKey.secret}
                  className="w-full border-2 border-black px-3 py-2 font-mono text-xs font-bold bg-zinc-100 select-all shadow-[2px_2px_0px_#000000]"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(revealedRotatedKey.secret);
                    alert('Copied new secret key to clipboard');
                  }}
                  className="px-3 py-2 border-2 border-black bg-[#ccff00] hover:bg-[#b8e600] font-black text-xs uppercase shadow-[2px_2px_0px_#000000]"
                >
                  COPY
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setRevealedRotatedKey(null)}
                className="px-5 py-2 border-2 border-black bg-black text-[#ccff00] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000000]"
              >
                Dismiss Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
