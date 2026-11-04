'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Edit,
  Power,
  RotateCcw,
  Sparkles,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  Check,
  X,
  CreditCard,
  TrendingUp,
  Tag,
  Gift,
  Pin,
  PinOff,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { Coupon } from '@/lib/coupons';
import { getAdminHeaders } from '@/lib/admin-auth';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Batch Pin selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkPinning, setIsBulkPinning] = useState(false);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed_inr' | 'fixed_usd'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(50);
  const [formPlans, setFormPlans] = useState<('all' | 'pro' | 'enterprise')[]>(['all']);
  const [formBillingCycles, setFormBillingCycles] = useState<('all' | 'monthly' | 'yearly')[]>(['all']);
  const [formMaxRedemptions, setFormMaxRedemptions] = useState<number>(-1);
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIsPinned, setFormIsPinned] = useState<boolean>(false);
  const [formPinnedTag, setFormPinnedTag] = useState<string>('OFFICIAL');
  const [formNotes, setFormNotes] = useState<string>('');

  // Live test preview state
  const [testPlan, setTestPlan] = useState<'pro' | 'enterprise'>('pro');
  const [testCycle, setTestCycle] = useState<'monthly' | 'yearly'>('monthly');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons', {
        headers: getAdminHeaders(),
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
      } else {
        showNotify('error', data.error || 'Failed to fetch coupons');
      }
    } catch (e: any) {
      showNotify('error', 'Network error fetching coupons: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormDesc('');
    setFormDiscountType('percentage');
    setFormDiscountValue(50);
    setFormPlans(['all']);
    setFormBillingCycles(['all']);
    setFormMaxRedemptions(-1);
    setFormExpiresAt('');
    setFormIsActive(true);
    setFormIsPinned(false);
    setFormPinnedTag('OFFICIAL');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormDesc(c.description || '');
    setFormDiscountType(c.discountType);
    setFormDiscountValue(c.discountValue);
    setFormPlans(c.applicablePlans || ['all']);
    setFormBillingCycles(c.applicableBillingCycles || ['all']);
    setFormMaxRedemptions(c.maxRedemptions ?? -1);
    setFormExpiresAt(c.expiresAt ? c.expiresAt.substring(0, 10) : '');
    setFormIsActive(c.isActive);
    setFormIsPinned(Boolean(c.isPinned));
    setFormPinnedTag(c.pinnedTag || 'OFFICIAL');
    setFormNotes(c.notes || '');
    setIsModalOpen(true);
  };

  // Generate a random clean coupon code
  const handleGenerateRandomCode = () => {
    const prefixes = ['PROMO', 'ARC', 'VIP', 'OFF', 'NED'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setFormCode(`${prefix}${num}`);
  };

  // Toggle Plan selection in form
  const togglePlanSelection = (p: 'all' | 'pro' | 'enterprise') => {
    if (p === 'all') {
      setFormPlans(['all']);
    } else {
      let updated = formPlans.filter((item) => item !== 'all');
      if (updated.includes(p)) {
        updated = updated.filter((item) => item !== p);
      } else {
        updated.push(p);
      }
      if (updated.length === 0 || (updated.includes('pro') && updated.includes('enterprise'))) {
        setFormPlans(['all']);
      } else {
        setFormPlans(updated);
      }
    }
  };

  // Toggle Billing cycle selection in form
  const toggleCycleSelection = (c: 'all' | 'monthly' | 'yearly') => {
    if (c === 'all') {
      setFormBillingCycles(['all']);
    } else {
      let updated = formBillingCycles.filter((item) => item !== 'all');
      if (updated.includes(c)) {
        updated = updated.filter((item) => item !== c);
      } else {
        updated.push(c);
      }
      if (updated.length === 0 || (updated.includes('monthly') && updated.includes('yearly'))) {
        setFormBillingCycles(['all']);
      } else {
        setFormBillingCycles(updated);
      }
    }
  };

  // Handle Save (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showNotify('error', 'Coupon code cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formCode.trim().toUpperCase(),
        description: formDesc.trim(),
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        applicablePlans: formPlans,
        applicableBillingCycles: formBillingCycles,
        maxRedemptions: Number(formMaxRedemptions),
        expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
        isActive: formIsActive,
        isPinned: formIsPinned,
        pinnedTag: formPinnedTag.trim().toUpperCase() || 'OFFICIAL',
        notes: formNotes.trim(),
      };

      let res: Response;
      if (editingCoupon) {
        res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: getAdminHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', data.message || 'Coupon saved successfully');
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        showNotify('error', data.error || 'Failed to save coupon');
      }
    } catch (err: any) {
      showNotify('error', err.message || 'Error occurred while saving coupon');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Pinned Status directly from table
  const handleTogglePinned = async (c: Coupon) => {
    try {
      const newPinned = !c.isPinned;
      setCoupons((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, isPinned: newPinned } : item))
      );

      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ isPinned: newPinned }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, isPinned: c.isPinned } : item))
        );
        showNotify('error', data.error || 'Failed to toggle checkout pin status');
      } else {
        if (data.coupon) {
          setCoupons((prev) =>
            prev.map((item) => (item.id === c.id ? { ...item, ...data.coupon, isPinned: newPinned } : item))
          );
        }
        showNotify(
          'success',
          newPinned
            ? `Coupon "${c.code}" PINNED: Now visible on public /pay-to-use page!`
            : `Coupon "${c.code}" UNPINNED: Hidden from public /pay-to-use checkout chips.`
        );
      }
    } catch (err: any) {
      showNotify('error', 'Network error toggling pin status');
    }
  };

  // Toggle Active Status directly from table
  const handleToggleActive = async (c: Coupon) => {
    try {
      const newStatus = !c.isActive;
      // Optimistic update
      setCoupons((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, isActive: newStatus } : item))
      );

      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // revert
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, isActive: c.isActive } : item))
        );
        showNotify('error', data.error || 'Failed to update status');
      } else {
        if (data.coupon) {
          setCoupons((prev) =>
            prev.map((item) => (item.id === c.id ? { ...item, ...data.coupon, isActive: newStatus } : item))
          );
        }
        showNotify('success', `Coupon ${c.code} is now ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`);
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (c: Coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${c.code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `Coupon ${c.code} deleted`);
        setCoupons((prev) => prev.filter((item) => item.id !== c.id));
      } else {
        showNotify('error', data.error || 'Failed to delete coupon');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Search
      const matchSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // Plan filter
      if (planFilter !== 'all') {
        const matchesPlan =
          c.applicablePlans.includes('all') ||
          c.applicablePlans.includes(planFilter as any);
        if (!matchesPlan) return false;
      }

      // Status filter
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (statusFilter === 'expired') {
        if (!c.expiresAt) return false;
        if (new Date(c.expiresAt).getTime() > Date.now()) return false;
      }

      return true;
    });
  }, [coupons, search, planFilter, statusFilter]);

  // Batch selection computed state
  const allFilteredSelected = useMemo(() => {
    return filteredCoupons.length > 0 && filteredCoupons.every((c) => selectedIds.includes(c.id));
  }, [filteredCoupons, selectedIds]);

  const someFilteredSelected = useMemo(() => {
    return filteredCoupons.some((c) => selectedIds.includes(c.id)) && !allFilteredSelected;
  }, [filteredCoupons, selectedIds, allFilteredSelected]);

  // Toggle selection for a single coupon
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all visible coupons
  const handleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredCoupons.map((c) => c.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredCoupons.map((c) => c.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Pin/Unpin action
  const handleBulkPin = async (pin: boolean) => {
    if (selectedIds.length === 0) {
      showNotify('error', 'Please select at least one coupon to batch pin/unpin.');
      return;
    }

    try {
      setIsBulkPinning(true);

      // Optimistic update
      setCoupons((prev) =>
        prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isPinned: pin } : c))
      );

      const res = await fetch('/api/admin/coupons/bulk', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          ids: selectedIds,
          action: pin ? 'pin' : 'unpin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotify('error', data.error || 'Failed to update coupons in bulk');
        fetchCoupons();
      } else {
        showNotify(
          'success',
          pin
            ? `SUCCESS: Batch pinned ${data.updatedCount || selectedIds.length} coupons to checkout!`
            : `SUCCESS: Batch unpinned ${data.updatedCount || selectedIds.length} coupons from checkout!`
        );
      }
    } catch (e: any) {
      showNotify('error', 'Network error during bulk operation: ' + e.message);
      fetchCoupons();
    } finally {
      setIsBulkPinning(false);
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.timesRedeemed || 0), 0);
    const maxDiscount = coupons.reduce((max, c) => Math.max(max, c.discountValue), 0);
    return { total, active, totalRedemptions, maxDiscount };
  }, [coupons]);

  // Live calculation helper for modal
  const liveDiscountPreview = useMemo(() => {
    const baseInr = testPlan === 'pro' ? (testCycle === 'yearly' ? 3999 : 499) : (testCycle === 'yearly' ? 14999 : 1999);
    let discount = 0;
    if (formDiscountType === 'percentage') {
      discount = Math.round((baseInr * Math.min(100, Math.max(0, formDiscountValue))) / 100);
    } else if (formDiscountType === 'fixed_inr') {
      discount = Math.min(baseInr, formDiscountValue);
    } else {
      discount = Math.min(baseInr, formDiscountValue * 85);
    }
    const finalPrice = Math.max(0, baseInr - discount);
    return { baseInr, discount, finalPrice, isFree: finalPrice === 0 };
  }, [testPlan, testCycle, formDiscountType, formDiscountValue]);

  return (
    <div className="space-y-6">
      {/* 1. TOAST NOTIFICATION */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 border-2 border-black font-mono text-xs font-bold shadow-[4px_4px_0px_#000000] animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success' ? 'bg-[#ccff00] text-black' : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 2. TOP HERO BAR */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#fafaf5] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
              <Ticket className="w-3.5 h-3.5 text-zinc-800" />
              <span>REVENUE & MONETIZATION MATRIX</span>
              <span className="w-1.5 h-1.5 bg-[#ccff00] border border-black inline-block ml-1" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              COUPON CODES & PROMO VOUCHERS
            </h1>
            <p className="text-xs font-mono text-zinc-600">
              Manage discount promo codes, winter arc vouchers, and complimentary plan upgrades for Nedject purchase plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 border-2 border-black bg-[#ccff00] text-black px-4 py-2.5 font-mono text-xs font-black uppercase hover:bg-black hover:text-[#ccff00] transition-colors shadow-[3px_3px_0px_#000000]"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE NEW COUPON</span>
            </button>
            <button
              onClick={fetchCoupons}
              className="flex items-center gap-2 border-2 border-black bg-white text-black px-3.5 py-2.5 font-mono text-xs font-bold uppercase hover:bg-zinc-100 transition-colors shadow-[2px_2px_0px_#000000]"
              title="Refresh list"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">REFRESH</span>
            </button>
          </div>
        </div>

        {/* 3. METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t-2 border-black/10">
          <div className="border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase block">ACTIVE COUPONS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black">{metrics.active}</span>
              <span className="text-xs font-mono text-zinc-500">/ {metrics.total} total</span>
            </div>
          </div>
          <div className="border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase block">TOTAL REDEMPTIONS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-black">{metrics.totalRedemptions}</span>
              <span className="text-xs font-mono text-green-700 font-bold">USED</span>
            </div>
          </div>
          <div className="border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase block">MAX DISCOUNT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-black">{metrics.maxDiscount}%</span>
              <span className="text-xs font-mono text-zinc-600">OFF VOUCHER</span>
            </div>
          </div>
          <div className="border-2 border-black bg-[#fafaf5] p-3 shadow-[2px_2px_0px_#000000]">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase block">POPULAR CAMPAIGN</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-black font-mono">WINTER2026</span>
              <span className="text-[10px] font-mono bg-black text-[#ccff00] px-1 font-bold">50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTROLS & BATCH ACTION BAR (Targeted by .admin-coupons-management-controls) */}
      <div className="admin-coupons-management-controls border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-4">
        {/* Search & Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="SEARCH BY COUPON CODE OR CAMPAIGN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-black font-mono text-xs uppercase placeholder:text-zinc-400 focus:outline-none focus:bg-[#fafaf5]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Plan Filter */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-zinc-500 uppercase font-bold text-[10px]">PLAN:</span>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="border-2 border-black px-2.5 py-1.5 font-mono text-xs uppercase bg-[#fafaf5] focus:outline-none cursor-pointer"
              >
                <option value="all">ALL PLANS</option>
                <option value="pro">PRO TIER</option>
                <option value="enterprise">ENTERPRISE</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-zinc-500 uppercase font-bold text-[10px]">STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-black px-2.5 py-1.5 font-mono text-xs uppercase bg-[#fafaf5] focus:outline-none cursor-pointer"
              >
                <option value="all">ALL STATUSES</option>
                <option value="active">ACTIVE ONLY</option>
                <option value="inactive">DEACTIVATED</option>
                <option value="expired">EXPIRED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black/10 bg-[#fafaf5] p-3 border-2 border-black">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-black text-[#ccff00] px-2.5 py-1 font-mono text-[11px] font-black tracking-wider uppercase shadow-[1.5px_1.5px_0px_#000000]">
              <Pin className="w-3.5 h-3.5" />
              <span>BULK PIN ACTIONS</span>
            </div>
            <span className="font-mono text-xs font-bold text-zinc-700">
              {selectedIds.length === 0 ? (
                <span className="text-zinc-500">
                  Select coupons via the <strong className="text-black">Batch Pin</strong> checkboxes below to bulk pin or unpin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-black">
                  <span className="inline-block w-2.5 h-2.5 bg-[#ccff00] border-2 border-black animate-pulse" />
                  <strong>{selectedIds.length}</strong> coupon{selectedIds.length > 1 ? 's' : ''} selected
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Small Counter next to bulk action buttons displaying currently selected coupons */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 border-2 border-black font-mono text-xs font-black transition-all ${
                selectedIds.length > 0
                  ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-400 shadow-none'
              }`}
              title="Number of currently selected coupons for batch operations"
            >
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>SELECTED:</span>
                <span
                  className={`px-1.5 py-0.5 border border-black text-xs font-black ${
                    selectedIds.length > 0
                      ? 'bg-[#ccff00] text-black'
                      : 'bg-zinc-200 text-zinc-600 border-zinc-300'
                  }`}
                >
                  {selectedIds.length}
                </span>
              </div>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] text-zinc-400 hover:text-white underline ml-0.5 cursor-pointer"
                  title="Clear selection"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Bulk Pin Button */}
            <button
              type="button"
              onClick={() => handleBulkPin(true)}
              disabled={selectedIds.length === 0 || isBulkPinning}
              className={`flex items-center gap-2 px-3 py-1.5 border-2 border-black font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 ${
                selectedIds.length > 0 && !isBulkPinning
                  ? 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] cursor-pointer'
                  : 'bg-zinc-200 text-zinc-400 border-zinc-400 cursor-not-allowed shadow-none'
              }`}
              title="Pin all selected coupons to checkout /pay-to-use promotion banner"
            >
              {isBulkPinning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Pin className="w-3.5 h-3.5 fill-current" />
              )}
              <span>PIN ALL SELECTED ({selectedIds.length})</span>
            </button>

            {/* Bulk Unpin Button */}
            <button
              type="button"
              onClick={() => handleBulkPin(false)}
              disabled={selectedIds.length === 0 || isBulkPinning}
              className={`flex items-center gap-2 px-3 py-1.5 border-2 border-black font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 ${
                selectedIds.length > 0 && !isBulkPinning
                  ? 'bg-amber-300 text-black hover:bg-black hover:text-[#ccff00] cursor-pointer'
                  : 'bg-zinc-200 text-zinc-400 border-zinc-400 cursor-not-allowed shadow-none'
              }`}
              title="Unpin all selected coupons from public checkout"
            >
              {isBulkPinning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PinOff className="w-3.5 h-3.5" />
              )}
              <span>UNPIN ALL SELECTED ({selectedIds.length})</span>
            </button>

            {/* Quick Select All / Deselect Controls */}
            {filteredCoupons.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                disabled={isBulkPinning}
                className="px-2.5 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-black font-mono text-xs font-bold uppercase transition-colors shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
              >
                {allFilteredSelected ? 'DESELECT VISIBLE' : 'SELECT ALL VISIBLE'}
              </button>
            )}

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={isBulkPinning}
                className="px-2.5 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-zinc-700 font-mono text-xs font-bold uppercase transition-colors shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. COUPONS TABLE */}
      <div className="border-4 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-zinc-500 space-y-2">
            <div className="w-5 h-5 bg-[#ccff00] border-2 border-black mx-auto animate-spin" />
            <p className="font-bold">SYNCHRONIZING COUPON DATABASE...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-zinc-500 space-y-3">
            <Ticket className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-bold uppercase text-zinc-700">NO COUPONS MATCHED YOUR FILTER</p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 border-2 border-black bg-[#ccff00] text-black px-3 py-1.5 font-bold hover:bg-black hover:text-[#ccff00]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>CREATE FIRST COUPON</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-[#fafaf5] text-[11px] font-black uppercase text-zinc-700">
                  {/* BATCH PIN CHECKBOX HEADER */}
                  <th className="p-3.5 text-center whitespace-nowrap w-24 bg-[#f4f4ea] border-r-2 border-black/20">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someFilteredSelected;
                        }}
                        onChange={handleSelectAllFiltered}
                        className="w-4 h-4 rounded-none accent-black cursor-pointer border-2 border-black"
                        title={allFilteredSelected ? 'Deselect all visible coupons' : 'Select all visible coupons for batch pin'}
                      />
                      <span className="text-[10px] font-black text-black">BATCH PIN</span>
                    </label>
                  </th>
                  <th className="p-3.5">PROMO CODE</th>
                  <th className="p-3.5">DISCOUNT</th>
                  <th className="p-3.5">CAMPAIGN / DESCRIPTION</th>
                  <th className="p-3.5">ELIGIBILITY</th>
                  <th className="p-3.5">REDEMPTIONS</th>
                  <th className="p-3.5">VALID UNTIL</th>
                  <th className="p-3.5 text-center">CHECKOUT PIN</th>
                  <th className="p-3.5 text-center">STATUS</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredCoupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                  const isUnlimited = c.maxRedemptions <= 0;
                  const percentUsed = isUnlimited ? 0 : Math.min(100, Math.round((c.timesRedeemed / c.maxRedemptions) * 100));
                  const isSelected = selectedIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#fafaf5] transition-colors ${
                        isSelected ? 'bg-amber-50/80 ring-2 ring-inset ring-amber-400' : ''
                      } ${!c.isActive ? 'opacity-60 bg-zinc-50' : ''}`}
                    >
                      {/* BATCH PIN CHECKBOX ROW CELL */}
                      <td className="p-3.5 text-center whitespace-nowrap bg-[#fafaf5]/60 border-r-2 border-black/10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c.id)}
                          className="w-4 h-4 rounded-none accent-black cursor-pointer border-2 border-black"
                          title={`Select ${c.code} for batch pin`}
                        />
                      </td>

                      {/* CODE */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            title="Click to copy code"
                            className="flex items-center gap-1.5 border-2 border-black bg-white hover:bg-[#ccff00] px-2.5 py-1 font-black tracking-wider text-xs shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            <span>{c.code}</span>
                            {copiedCode === c.code ? (
                              <Check className="w-3 h-3 text-green-700" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* DISCOUNT */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block border-2 border-black px-2 py-0.5 font-black text-xs shadow-[1.5px_1.5px_0px_#000000] ${
                            c.discountValue === 100 && c.discountType === 'percentage'
                              ? 'bg-[#ccff00] text-black'
                              : c.discountType === 'percentage'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : c.discountType === 'fixed_inr'
                            ? `₹${c.discountValue} OFF`
                            : `$${c.discountValue} OFF`}
                        </span>
                      </td>

                      {/* CAMPAIGN / DESC */}
                      <td className="p-3.5 max-w-xs">
                        <p className="font-bold text-black truncate">{c.description || 'Promotional Voucher'}</p>
                        {c.notes && <p className="text-[10px] text-zinc-500 truncate">{c.notes}</p>}
                      </td>

                      {/* ELIGIBILITY */}
                      <td className="p-3.5 whitespace-nowrap space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {c.applicablePlans.map((p) => (
                            <span
                              key={p}
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 border border-black bg-white"
                            >
                              {p}
                            </span>
                          ))}
                          {c.applicableBillingCycles.map((cycle) => (
                            <span
                              key={cycle}
                              className="text-[9px] font-bold uppercase px-1.5 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-700"
                            >
                              {cycle}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* REDEMPTIONS */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>{c.timesRedeemed} used</span>
                            <span className="text-zinc-400">{isUnlimited ? '∞ quota' : `/ ${c.maxRedemptions}`}</span>
                          </div>
                          {!isUnlimited && (
                            <div className="w-24 h-1.5 border border-black bg-zinc-200 overflow-hidden">
                              <div
                                className={`h-full ${percentUsed >= 100 ? 'bg-red-500' : 'bg-black'}`}
                                style={{ width: `${percentUsed}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* VALID UNTIL */}
                      <td className="p-3.5 whitespace-nowrap">
                        {c.expiresAt ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold ${
                                isExpired ? 'text-red-600 bg-red-100 px-1 border border-red-400' : 'text-zinc-700'
                              }`}
                            >
                              {new Date(c.expiresAt).toLocaleDateString()}
                            </span>
                            {isExpired && <span className="text-[9px] font-black text-red-600 uppercase">EXPIRED</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">NO EXPIRATION</span>
                        )}
                      </td>

                      {/* CHECKOUT PIN TOGGLE */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePinned(c)}
                          title={
                            c.isPinned
                              ? 'Currently pinned on public /pay-to-use page (Click to unpin)'
                              : 'Hidden from public /pay-to-use chips (Click to pin)'
                          }
                          className={`border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000] transition-colors flex items-center gap-1 mx-auto cursor-pointer ${
                            c.isPinned
                              ? 'bg-amber-300 text-black hover:bg-black hover:text-[#ccff00]'
                              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                          }`}
                        >
                          <span>{c.isPinned ? '📌 PINNED' : 'PIN'}</span>
                        </button>
                      </td>

                      {/* STATUS TOGGLE */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`border-2 border-black px-2 py-1 text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000] transition-colors ${
                            c.isActive
                              ? 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00]'
                              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                          }`}
                        >
                          {c.isActive ? 'ACTIVE' : 'DISABLED'}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Coupon"
                            className="p-1.5 border-2 border-black bg-white hover:bg-zinc-100 shadow-[1.5px_1.5px_0px_#000000]"
                          >
                            <Edit className="w-3.5 h-3.5 text-zinc-800" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c)}
                            title="Delete Coupon"
                            className="p-1.5 border-2 border-black bg-white hover:bg-red-500 hover:text-white shadow-[1.5px_1.5px_0px_#000000] transition-colors"
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

      {/* 6. CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-mono">
          <div className="border-4 border-black bg-white max-w-2xl w-full p-6 shadow-[8px_8px_0px_#000000] max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#ccff00] border-2 border-black" />
                <h3 className="font-black text-lg uppercase">
                  {editingCoupon ? `EDIT COUPON: ${editingCoupon.code}` : 'CREATE NEW PROMO COUPON'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 border-2 border-black hover:bg-black hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              {/* Code & Random Generator */}
              <div className="space-y-1">
                <label className="font-black uppercase text-zinc-700 flex items-center justify-between">
                  <span>COUPON CODE (REQUIRED)</span>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>GENERATE RANDOM CODE</span>
                  </button>
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  placeholder="E.G. WINTER2026, VIPFREE, PRO50"
                  className="w-full border-2 border-black p-2.5 font-mono text-sm font-black tracking-wider uppercase focus:outline-none focus:bg-[#fafaf5]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-black uppercase text-zinc-700">CAMPAIGN TITLE / DESCRIPTION</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Winter Arc 2026 50% Off Launch Voucher"
                  className="w-full border-2 border-black p-2 focus:outline-none focus:bg-[#fafaf5]"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black uppercase text-zinc-700">DISCOUNT TYPE</label>
                  <select
                    value={formDiscountType}
                    onChange={(e: any) => setFormDiscountType(e.target.value)}
                    className="w-full border-2 border-black p-2 bg-[#fafaf5] font-mono focus:outline-none font-bold"
                  >
                    <option value="percentage">PERCENTAGE (%) OFF</option>
                    <option value="fixed_inr">FLAT CASH (₹ INR) OFF</option>
                    <option value="fixed_usd">FLAT CASH ($ USD) OFF</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-black uppercase text-zinc-700">
                    {formDiscountType === 'percentage'
                      ? 'PERCENTAGE VALUE (1 - 100%)'
                      : formDiscountType === 'fixed_inr'
                      ? 'FLAT AMOUNT (₹ INR)'
                      : 'FLAT AMOUNT ($ USD)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formDiscountType === 'percentage' ? '100' : '99999'}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    required
                    className="w-full border-2 border-black p-2 font-mono font-black focus:outline-none focus:bg-[#fafaf5]"
                  />
                  {formDiscountType === 'percentage' && formDiscountValue === 100 && (
                    <span className="text-[10px] font-black text-emerald-600 uppercase block">
                      ★ 100% OFF: Gives 100% free instant tier activation (no payment gateway required!)
                    </span>
                  )}
                </div>
              </div>

              {/* Applicable Plans */}
              <div className="space-y-1">
                <label className="font-black uppercase text-zinc-700 block">APPLICABLE PLANS</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'ALL PLANS (PRO + ENTERPRISE)' },
                    { id: 'pro', label: 'PRO STUDIO ONLY' },
                    { id: 'enterprise', label: 'ENTERPRISE MATRIX ONLY' },
                  ].map((item) => {
                    const selected = formPlans.includes(item.id as any);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => togglePlanSelection(item.id as any)}
                        className={`border-2 border-black px-3 py-1.5 font-bold uppercase transition-colors ${
                          selected
                            ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#ccff00]'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Applicable Billing Cycles */}
              <div className="space-y-1">
                <label className="font-black uppercase text-zinc-700 block">BILLING CYCLE APPLICABILITY</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'ALL (MONTHLY + YEARLY)' },
                    { id: 'monthly', label: 'MONTHLY ONLY' },
                    { id: 'yearly', label: 'YEARLY COMMITMENTS ONLY' },
                  ].map((item) => {
                    const selected = formBillingCycles.includes(item.id as any);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleCycleSelection(item.id as any)}
                        className={`border-2 border-black px-3 py-1.5 font-bold uppercase transition-colors ${
                          selected
                            ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#ccff00]'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Redemptions & Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black uppercase text-zinc-700">MAX REDEMPTIONS (-1 FOR UNLIMITED)</label>
                  <input
                    type="number"
                    value={formMaxRedemptions}
                    onChange={(e) => setFormMaxRedemptions(Number(e.target.value))}
                    className="w-full border-2 border-black p-2 font-mono font-bold focus:outline-none focus:bg-[#fafaf5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-black uppercase text-zinc-700">EXPIRATION DATE (OPTIONAL)</label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full border-2 border-black p-2 font-mono focus:outline-none focus:bg-[#fafaf5]"
                  />
                </div>
              </div>

              {/* Active Toggle & Internal Notes */}
              <div className="space-y-3 pt-2 border-t-2 border-black/10">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 border-2 border-black accent-black"
                  />
                  <label htmlFor="formIsActive" className="font-black uppercase cursor-pointer">
                    ENABLE COUPON IMMEDIATELY UPON CREATION
                  </label>
                </div>

                {/* PIN TO PUBLIC CHECKOUT */}
                <div className="border-2 border-black bg-amber-50 p-3 space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="formIsPinned"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="w-4 h-4 border-2 border-black accent-black"
                    />
                    <label htmlFor="formIsPinned" className="font-black uppercase cursor-pointer text-xs text-amber-950">
                      PIN TO PUBLIC CHECKOUT PAGE (FEATURED CHIP ON /pay-to-use)
                    </label>
                  </div>
                  {formIsPinned && (
                    <div className="space-y-1 pl-7">
                      <label className="text-[10px] font-black uppercase text-amber-900 block">
                        CHIP DISPLAY TAG / BADGE
                      </label>
                      <input
                        type="text"
                        value={formPinnedTag}
                        onChange={(e) => setFormPinnedTag(e.target.value.toUpperCase())}
                        placeholder="e.g. OFFICIAL, 50% OFF, LIMITED"
                        maxLength={16}
                        className="w-full max-w-xs border border-black p-1.5 text-xs font-mono uppercase bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-black uppercase text-zinc-700">ADMIN INTERNAL NOTES (OPTIONAL)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Distributed to VIP Discord members during winter challenge"
                    className="w-full border-2 border-black p-2 focus:outline-none focus:bg-[#fafaf5]"
                  />
                </div>
              </div>

              {/* LIVE SIMULATION / PREVIEW BOX */}
              <div className="border-2 border-black bg-[#fafaf5] p-3 space-y-2 shadow-[2px_2px_0px_#000000]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-700" />
                    <span>CALCULATION PREVIEW:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={testPlan}
                      onChange={(e: any) => setTestPlan(e.target.value)}
                      className="border border-black bg-white px-1.5 py-0.5 text-[10px]"
                    >
                      <option value="pro">Pro Plan</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <select
                      value={testCycle}
                      onChange={(e: any) => setTestCycle(e.target.value)}
                      className="border border-black bg-white px-1.5 py-0.5 text-[10px]"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-xs pt-1 border-t border-black/10">
                  <span className="text-zinc-600">Standard Price: ₹{liveDiscountPreview.baseInr}</span>
                  <span className="text-zinc-600">Discount: -₹{liveDiscountPreview.discount}</span>
                  <span className="font-black text-black">
                    Final Price: ₹{liveDiscountPreview.finalPrice}
                    {liveDiscountPreview.isFree && (
                      <span className="ml-1 text-[10px] bg-[#ccff00] px-1 border border-black">FREE UPGRADE</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border-2 border-black px-4 py-2 font-bold uppercase hover:bg-zinc-100"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 border-2 border-black bg-[#ccff00] text-black px-5 py-2 font-black uppercase hover:bg-black hover:text-[#ccff00] shadow-[3px_3px_0px_#000000] disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCoupon ? 'SAVE CHANGES' : 'CREATE COUPON'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
