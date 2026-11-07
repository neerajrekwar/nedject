'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Shield,
  Zap,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  Ban,
  Clock,
  Sliders,
} from 'lucide-react';
import { ManagedPlan, DEFAULT_PLANS } from '@/lib/plans-types';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise' | 'custom' | string;
  subscriptionBillingCycle?: 'monthly' | 'annual' | 'lifetime' | string;
  subscriptionStatus?: 'active' | 'cancelled' | 'none';
  subscriptionExpiresAt?: string | null;
  planAssignedBy?: string;
  generationsLimit: number;
  generationsUsed: number;
  provider: string;
  createdAt: string;
  updatedAt: string;
  hasGoogleFit: boolean;
  image?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Plan modal state
  const [modalUser, setModalUser] = useState<UserRecord | null>(null);
  const [modalPlan, setModalPlan] = useState<'pro' | 'enterprise' | 'custom' | 'free'>('pro');
  const [modalCycle, setModalCycle] = useState<'monthly' | 'annual' | 'lifetime'>('monthly');
  const [modalDuration, setModalDuration] = useState<'30' | '365' | 'lifetime'>('30');
  const [managedPlans, setManagedPlans] = useState<ManagedPlan[]>(DEFAULT_PLANS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dynamic managed plans from /api/plans
  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.plans) && data.plans.length > 0) {
          setManagedPlans(data.plans);
        }
      })
      .catch(() => {});
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (planFilter !== 'all') params.set('plan', planFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
      }
    } catch (e: any) {
      showNotify('error', 'Failed to fetch users: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [planFilter]);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const openPlanModal = (user: UserRecord) => {
    setModalUser(user);
    setModalPlan(user.plan === 'free' ? 'pro' : user.plan);
    const userCycle = user.subscriptionBillingCycle === 'lifetime'
      ? 'lifetime'
      : user.subscriptionBillingCycle === 'annual'
      ? 'annual'
      : 'monthly';
    setModalCycle(userCycle);
    setModalDuration(userCycle === 'lifetime' ? 'lifetime' : userCycle === 'annual' ? '365' : '30');
  };

  const handleApplyPlan = async (
    plan: 'free' | 'pro' | 'enterprise' | 'custom' | string,
    cycle: 'monthly' | 'annual' | 'lifetime',
    duration: '30' | '365' | 'lifetime'
  ) => {
    if (!modalUser) return;
    setIsSubmitting(true);

    try {
      const isLifetime = duration === 'lifetime' || cycle === 'lifetime';
      const durationDays = isLifetime ? undefined : Number(duration);

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: modalUser._id,
          plan,
          billingCycle: isLifetime ? 'lifetime' : cycle,
          durationDays,
          isLifetime,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotify(
          'success',
          `✓ Plan for ${modalUser.email} set to [${plan.toUpperCase()} - ${(isLifetime ? 'LIFETIME' : cycle).toUpperCase()}] by admin!`
        );
        setModalUser(null);
        fetchUsers();
      } else {
        showNotify('error', data.error || 'Failed to apply plan');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubscription = async (user: UserRecord) => {
    if (!window.confirm(`Cancel paid subscription for ${user.email} and revert to Free tier?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          action: 'cancel_subscription',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ Subscription cancelled for ${user.email}. User reverted to Free tier.`);
        if (modalUser?._id === user._id) setModalUser(null);
        fetchUsers();
      } else {
        showNotify('error', data.error || 'Failed to cancel subscription');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const handleResetQuota = async (user: UserRecord) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, resetUsed: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ Generations quota reset to 0 for ${user.email}`);
        fetchUsers();
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (!window.confirm(`Permanently delete user ${user.email} from MongoDB?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ User ${user.email} deleted`);
        fetchUsers();
      } else {
        showNotify('error', data.error || 'Failed to delete user');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const proCount = users.filter((u) => u.plan === 'pro' && u.subscriptionStatus !== 'cancelled').length;
  const enterpriseCount = users.filter((u) => u.plan === 'enterprise' && u.subscriptionStatus !== 'cancelled').length;
  const freeCount = users.filter((u) => u.plan === 'free' || u.subscriptionStatus === 'cancelled').length;

  return (
    <div className="space-y-8 font-mono">
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>REAL-TIME SUBSCRIPTION PROVISIONER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            User Accounts &amp; Plan Manager
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-0.5 max-w-xl">
            Manually assign Pro &amp; Enterprise plans on a Monthly or Annual basis, configure custom expirations, or instantly cancel active subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-zinc-500 font-bold">REGISTERED USERS</div>
            <div className="text-2xl font-black text-black">{users.length} Accounts</div>
          </div>
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

      {/* 2. STATS RECAP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">FREE USERS</div>
          <div className="text-3xl font-black text-black">{freeCount}</div>
          <div className="text-[11px] text-zinc-600">Standard 10 generations quota</div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-emerald-700 font-bold uppercase">PRO (MONTHLY / ANNUAL)</div>
          <div className="text-3xl font-black text-emerald-700">{proCount}</div>
          <div className="text-[11px] text-zinc-600">Unlimited 300 DPI downloads</div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-purple-700 font-bold uppercase">ENTERPRISE (MONTHLY / ANNUAL)</div>
          <div className="text-3xl font-black text-purple-700">{enterpriseCount}</div>
          <div className="text-[11px] text-zinc-600">High-velocity prepress vector license</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or user ID..."
              className="w-full border-2 border-black pl-9 pr-3 py-2 text-xs bg-[#fbfbfa] focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] text-xs font-black uppercase cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Filter Plan:</span>
          {(['all', 'free', 'pro', 'enterprise', 'custom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-2.5 py-1.5 border border-black font-bold uppercase transition-all ${
                planFilter === p
                  ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-black'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 4. REAL USERS TABLE */}
      <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-zinc-500">
            Querying MongoDB users collection...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-black uppercase text-black">No Users Found</div>
            <p className="text-xs text-zinc-500 font-sans">
              No registered user documents match your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="border-b-2 border-black bg-zinc-100 font-bold text-zinc-700 uppercase">
                <tr>
                  <th className="p-3.5">User / Account</th>
                  <th className="p-3.5">Tier &amp; Billing Cycle</th>
                  <th className="p-3.5">Validity / Renewal</th>
                  <th className="p-3.5">Generations Quota</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((user) => {
                  const isPaid = user.plan !== 'free' && user.subscriptionStatus !== 'cancelled';
                  const isCancelled = user.subscriptionStatus === 'cancelled';

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      {/* User Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none border border-black bg-zinc-800 text-[#ccff00] font-black text-xs flex items-center justify-center shrink-0">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-black">{user.name}</div>
                            <div className="text-[11px] text-zinc-500">{user.email}</div>
                            {user.hasGoogleFit && (
                              <span className="text-[9px] px-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                Google Fit Linked
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tier & Cycle */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 border text-[10px] font-black uppercase ${
                                user.plan === 'custom'
                                  ? 'bg-black border-black text-[#ccff00]'
                                  : user.plan === 'enterprise'
                                  ? 'bg-purple-100 border-purple-800 text-purple-900'
                                  : user.plan === 'pro'
                                  ? 'bg-[#ccff00] border-black text-black'
                                  : 'bg-zinc-100 border-zinc-400 text-zinc-700'
                              }`}
                            >
                              {user.plan}
                            </span>
                            {isPaid && user.subscriptionBillingCycle && (
                              <span className="px-1.5 py-0.5 bg-black text-[#ccff00] text-[9px] font-black uppercase">
                                {user.subscriptionBillingCycle}
                              </span>
                            )}
                            {isCancelled && (
                              <span className="px-1.5 py-0.5 bg-rose-100 border border-rose-600 text-rose-800 text-[9px] font-black uppercase">
                                CANCELLED
                              </span>
                            )}
                          </div>
                          {user.planAssignedBy === 'admin' && (
                            <span className="text-[9px] text-zinc-400 font-mono">
                              (Admin Granted)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiration & Validity */}
                      <td className="p-3.5 font-mono text-[11px]">
                        {isPaid ? (
                          user.subscriptionBillingCycle === 'lifetime' || !user.subscriptionExpiresAt ? (
                            <span className="text-emerald-700 font-bold">Lifetime (No Expiry) • Permanent</span>
                          ) : (
                            <div>
                              <div className="font-bold text-black">
                                Expires {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                {Math.ceil(
                                  (new Date(user.subscriptionExpiresAt).getTime() - Date.now()) / 86400000
                                ) > 0
                                  ? `in ${Math.ceil(
                                      (new Date(user.subscriptionExpiresAt).getTime() - Date.now()) / 86400000
                                    )} days`
                                  : 'Expiring today'}
                              </div>
                            </div>
                          )
                        ) : isCancelled ? (
                          <span className="text-rose-700 font-bold">Cancelled &bull; Free Tier</span>
                        ) : (
                          <span className="text-zinc-500">Free Tier (No Expiry)</span>
                        )}
                      </td>

                      {/* Generations Used / Limit */}
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-black">
                          {user.generationsUsed} /{' '}
                          {user.generationsLimit > 9999 ? '∞ Unlimited' : user.generationsLimit}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="p-3.5 text-zinc-500 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Admin Actions */}
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Manage Plan Modal Trigger */}
                          <button
                            onClick={() => openPlanModal(user)}
                            className="px-2.5 py-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-[10px] uppercase cursor-pointer transition-colors shadow-[1px_1px_0px_#000000]"
                            title="Set Pro, Enterprise, Monthly, Annual, or Cancel"
                          >
                            Set Plan
                          </button>

                          {/* Quick Cancel if active paid plan */}
                          {isPaid && (
                            <button
                              onClick={() => handleCancelSubscription(user)}
                              className="px-2 py-1.5 border border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 font-black text-[10px] uppercase cursor-pointer"
                              title="Cancel Paid Subscription and Revert to Free"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Reset Quota */}
                          <button
                            onClick={() => handleResetQuota(user)}
                            className="p-1.5 border border-black bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                            title="Reset generation counter to 0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 border border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 cursor-pointer"
                            title="Delete user from database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: MANUAL PLAN PROVISIONER & CANCEL ENGINE */}
      {modalUser && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-[10px_10px_0px_#000000] font-mono">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-500">
                  ADMIN SUBSCRIPTION PROVISIONER
                </div>
                <h2 className="text-lg font-black uppercase text-black">
                  Manage Plan for {modalUser.name}
                </h2>
                <div className="text-xs text-zinc-600 mt-0.5">{modalUser.email}</div>
              </div>
              <button
                onClick={() => setModalUser(null)}
                className="p-1.5 hover:bg-zinc-100 border border-black cursor-pointer"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="p-3 border-2 border-black bg-zinc-50 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Current Tier</span>
                <span className="font-black text-black uppercase">
                  {modalUser.plan} ({modalUser.subscriptionBillingCycle || 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Status</span>
                <span className="font-bold text-black uppercase">
                  {modalUser.subscriptionStatus || 'None'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Limit</span>
                <span className="font-bold text-black">
                  {modalUser.generationsLimit > 9999 ? '∞ Unlimited' : `${modalUser.generationsLimit}/mo`}
                </span>
              </div>
            </div>

            {/* 1-Click Preset Upgrade Plans */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-black uppercase text-black">
                  1. Target Plan &amp; Billing Cycle:
                </label>
                <Link
                  href="/admin/plans"
                  className="text-[10px] font-black text-zinc-600 hover:text-black uppercase underline flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Configure Rates &amp; Packages</span>
                </Link>
              </div>

              {(() => {
                const proPlan =
                  managedPlans.find((p) => p.id === 'pro') ||
                  DEFAULT_PLANS.find((p) => p.id === 'pro') ||
                  DEFAULT_PLANS[2];
                const entPlan =
                  managedPlans.find((p) => p.id === 'enterprise') ||
                  DEFAULT_PLANS.find((p) => p.id === 'enterprise') ||
                  DEFAULT_PLANS[3];

                const proMonthlySub =
                  proPlan.cycles?.monthly?.subtitle ||
                  '$9.99/mo rate • Unlimited 300 DPI exports • Active for 30 days';
                const proAnnualSub =
                  proPlan.cycles?.yearly?.subtitle ||
                  '$99.00/yr rate • Full annual Pro access • 1-year expiration';
                const proLifetimeSub =
                  proPlan.cycles?.lifetime?.subtitle || 'Pro Lifetime (No Expiry)';

                const entMonthlySub =
                  entPlan.cycles?.monthly?.subtitle ||
                  '$29.00/mo rate • Full prepress vector engine • 30 days';
                const entAnnualSub =
                  entPlan.cycles?.yearly?.subtitle ||
                  '$249.00/yr rate • Unlimited prepress license • 1-year expiration';
                const entLifetimeSub =
                  entPlan.cycles?.lifetime?.subtitle || 'Enterprise Lifetime (No Expiry)';

                const isProMonthlyActive =
                  modalUser.plan === 'pro' &&
                  modalUser.subscriptionBillingCycle === 'monthly' &&
                  modalUser.subscriptionStatus === 'active';
                const isProAnnualActive =
                  modalUser.plan === 'pro' &&
                  modalUser.subscriptionBillingCycle === 'annual' &&
                  modalUser.subscriptionStatus === 'active';
                const isEntMonthlyActive =
                  modalUser.plan === 'enterprise' &&
                  modalUser.subscriptionBillingCycle === 'monthly' &&
                  modalUser.subscriptionStatus === 'active';
                const isEntAnnualActive =
                  modalUser.plan === 'enterprise' &&
                  modalUser.subscriptionBillingCycle === 'annual' &&
                  modalUser.subscriptionStatus === 'active';
                const isProLifetimeActive =
                  modalUser.plan === 'pro' &&
                  modalUser.subscriptionBillingCycle === 'lifetime' &&
                  modalUser.subscriptionStatus === 'active';
                const isEntLifetimeActive =
                  modalUser.plan === 'enterprise' &&
                  modalUser.subscriptionBillingCycle === 'lifetime' &&
                  modalUser.subscriptionStatus === 'active';

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Pro Monthly */}
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('pro', 'monthly', '30')}
                        disabled={isSubmitting}
                        className={`group p-3.5 border-2 text-left space-y-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000000] relative ${
                          isProMonthlyActive
                            ? 'border-black bg-amber-100 ring-2 ring-black'
                            : 'border-black bg-white hover:bg-black'
                        }`}
                      >
                        {isProMonthlyActive && (
                          <span className="absolute -top-2.5 right-2 bg-black text-[#ccff00] text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                            ✓ CURRENTLY ACTIVE
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-xs uppercase transition-colors ${
                              isProMonthlyActive
                                ? 'text-black'
                                : 'text-black group-hover:text-[#ccff00]'
                            }`}
                          >
                            ⚡ PRO - MONTHLY
                          </span>
                          <span className="text-[10px] font-black bg-black text-[#ccff00] group-hover:bg-[#ccff00] group-hover:text-black px-1.5 py-0.5 border border-black transition-colors">
                            30 DAYS
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-sans transition-colors ${
                            isProMonthlyActive
                              ? 'text-zinc-800 font-bold'
                              : 'text-zinc-600 group-hover:text-zinc-200'
                          }`}
                        >
                          {proMonthlySub}
                        </div>
                      </button>

                      {/* Pro Annual */}
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('pro', 'annual', '365')}
                        disabled={isSubmitting}
                        className={`group p-3.5 border-2 text-left space-y-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000000] relative ${
                          isProAnnualActive
                            ? 'border-black bg-amber-100 ring-2 ring-black'
                            : 'border-black bg-white hover:bg-black'
                        }`}
                      >
                        {isProAnnualActive && (
                          <span className="absolute -top-2.5 right-2 bg-black text-[#ccff00] text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                            ✓ CURRENTLY ACTIVE
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-xs uppercase transition-colors ${
                              isProAnnualActive
                                ? 'text-black'
                                : 'text-black group-hover:text-[#ccff00]'
                            }`}
                          >
                            🌟 PRO - ANNUAL
                          </span>
                          <span className="text-[10px] font-black bg-black text-[#ccff00] group-hover:bg-[#ccff00] group-hover:text-black px-1.5 py-0.5 border border-black transition-colors">
                            365 DAYS
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-sans transition-colors ${
                            isProAnnualActive
                              ? 'text-zinc-800 font-bold'
                              : 'text-zinc-600 group-hover:text-zinc-200'
                          }`}
                        >
                          {proAnnualSub}
                        </div>
                      </button>

                      {/* Enterprise Monthly */}
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('enterprise', 'monthly', '30')}
                        disabled={isSubmitting}
                        className={`group p-3.5 border-2 text-left space-y-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000000] relative ${
                          isEntMonthlyActive
                            ? 'border-black bg-purple-100 ring-2 ring-purple-900'
                            : 'border-purple-800 bg-purple-50 hover:bg-purple-950 hover:border-black'
                        }`}
                      >
                        {isEntMonthlyActive && (
                          <span className="absolute -top-2.5 right-2 bg-purple-900 text-white text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                            ✓ CURRENTLY ACTIVE
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-xs uppercase transition-colors ${
                              isEntMonthlyActive
                                ? 'text-purple-950 font-black'
                                : 'text-purple-950 group-hover:text-white'
                            }`}
                          >
                            🏢 ENTERPRISE - MONTHLY
                          </span>
                          <span className="text-[10px] font-black bg-purple-900 text-white group-hover:bg-[#ccff00] group-hover:text-black px-1.5 py-0.5 border border-purple-950 group-hover:border-black transition-colors">
                            30 DAYS
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-sans transition-colors ${
                            isEntMonthlyActive
                              ? 'text-purple-900 font-bold'
                              : 'text-zinc-600 group-hover:text-purple-200'
                          }`}
                        >
                          {entMonthlySub}
                        </div>
                      </button>

                      {/* Enterprise Annual */}
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('enterprise', 'annual', '365')}
                        disabled={isSubmitting}
                        className={`group p-3.5 border-2 text-left space-y-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000000] relative ${
                          isEntAnnualActive
                            ? 'border-black bg-purple-100 ring-2 ring-purple-900'
                            : 'border-purple-800 bg-purple-50 hover:bg-purple-950 hover:border-black'
                        }`}
                      >
                        {isEntAnnualActive && (
                          <span className="absolute -top-2.5 right-2 bg-purple-900 text-white text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                            ✓ CURRENTLY ACTIVE
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-xs uppercase transition-colors ${
                              isEntAnnualActive
                                ? 'text-purple-950 font-black'
                                : 'text-purple-950 group-hover:text-white'
                            }`}
                          >
                            🚀 ENTERPRISE - ANNUAL
                          </span>
                          <span className="text-[10px] font-black bg-purple-900 text-white group-hover:bg-[#ccff00] group-hover:text-black px-1.5 py-0.5 border border-purple-950 group-hover:border-black transition-colors">
                            365 DAYS
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-sans transition-colors ${
                            isEntAnnualActive
                              ? 'text-purple-900 font-bold'
                              : 'text-zinc-600 group-hover:text-purple-200'
                          }`}
                        >
                          {entAnnualSub}
                        </div>
                      </button>

                      {/* Bespoke Custom Plan */}
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('custom', 'annual', '365')}
                        disabled={isSubmitting}
                        className={`group p-3.5 border-2 text-left space-y-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000000] relative col-span-1 md:col-span-2 ${
                          modalUser.plan === 'custom'
                            ? 'border-black bg-black text-white ring-2 ring-[#ccff00]'
                            : 'border-black bg-zinc-900 text-white hover:bg-black'
                        }`}
                      >
                        {modalUser.plan === 'custom' && (
                          <span className="absolute -top-2.5 right-2 bg-[#ccff00] text-black text-[9px] font-black px-1.5 py-0.2 border border-black uppercase">
                            ✓ CURRENTLY ACTIVE
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs uppercase text-[#ccff00]">
                            ⚡ BESPOKE CUSTOM TIER (ANNUAL &amp; UNLIMITED QUOTA)
                          </span>
                          <span className="text-[10px] font-black bg-[#ccff00] text-black px-1.5 py-0.5 border border-black">
                            365 DAYS / 99.99% SLA
                          </span>
                        </div>
                        <div className="text-[11px] font-sans text-zinc-300">
                          Bespoke custom architecture • 9,999,999 generations • Dedicated 3,000+ RPM cluster • Admin override
                        </div>
                      </button>
                    </div>

                    {/* Lifetime Options */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('pro', 'lifetime', 'lifetime')}
                        disabled={isSubmitting}
                        className={`flex-1 py-2.5 px-3 border-2 text-xs font-black uppercase transition-all cursor-pointer text-center shadow-[2px_2px_0px_#000000] relative ${
                          isProLifetimeActive
                            ? 'border-black bg-black text-[#ccff00] ring-2 ring-black'
                            : 'border-black bg-zinc-100 hover:bg-black text-black hover:text-[#ccff00]'
                        }`}
                      >
                        {isProLifetimeActive && (
                          <span className="absolute -top-2.5 right-2 bg-[#ccff00] text-black text-[9px] font-black px-1 border border-black uppercase">
                            ✓ ACTIVE
                          </span>
                        )}
                        <span>{proLifetimeSub}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPlan('enterprise', 'lifetime', 'lifetime')}
                        disabled={isSubmitting}
                        className={`flex-1 py-2.5 px-3 border-2 text-xs font-black uppercase transition-all cursor-pointer text-center shadow-[2px_2px_0px_#000000] relative ${
                          isEntLifetimeActive
                            ? 'border-black bg-purple-950 text-white ring-2 ring-purple-900'
                            : 'border-purple-800 bg-purple-50 hover:bg-purple-950 text-purple-950 hover:text-white hover:border-black'
                        }`}
                      >
                        {isEntLifetimeActive && (
                          <span className="absolute -top-2.5 right-2 bg-purple-900 text-white text-[9px] font-black px-1 border border-black uppercase">
                            ✓ ACTIVE
                          </span>
                        )}
                        <span>{entLifetimeSub}</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* DANGER ZONE: CANCEL SUBSCRIPTION */}
            <div className="border-t-2 border-black pt-4 space-y-3">
              <div className="text-xs font-black uppercase text-rose-700 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Cancel Active Subscription</span>
              </div>
              <p className="text-xs text-zinc-500 font-sans">
                Immediately revokes paid tier privileges, sets subscription status to <strong>Cancelled</strong>, and returns the user to the standard Free plan (10 generations quota).
              </p>

              <button
                type="button"
                onClick={() => handleCancelSubscription(modalUser)}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 border-2 border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 font-black uppercase text-xs tracking-wider transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                Cancel Subscription &amp; Revert to Free
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
