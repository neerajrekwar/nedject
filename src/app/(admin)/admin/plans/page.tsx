'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Globe,
  Sliders,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  ManagedPlan,
  SupportedCurrency,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  DEFAULT_PLANS,
} from '@/lib/plans-types';

const CURRENCIES: SupportedCurrency[] = ['USD', 'INR', 'EUR', 'GBP', 'RUB'];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<ManagedPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewCurrency, setPreviewCurrency] = useState<SupportedCurrency>('USD');

  // Load plans from API
  const fetchPlans = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (data?.success && Array.isArray(data.plans)) {
        setPlans(data.plans);
      } else {
        setPlans(DEFAULT_PLANS);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load plans from server');
      setPlans(DEFAULT_PLANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Update plan field locally
  const handlePlanChange = (index: number, field: keyof ManagedPlan, value: any) => {
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Update currency pricing for a plan
  const handlePriceChange = (
    index: number,
    curr: SupportedCurrency,
    interval: 'monthly' | 'yearly',
    amount: number
  ) => {
    setPlans((prev) => {
      const next = [...prev];
      const plan = { ...next[index] };
      plan.pricing = {
        ...plan.pricing,
        [curr]: {
          ...plan.pricing[curr],
          [interval]: Math.max(0, amount),
        },
      };
      next[index] = plan;
      return next;
    });
  };

  // Add feature item
  const handleAddFeature = (planIndex: number) => {
    setPlans((prev) => {
      const next = [...prev];
      const plan = { ...next[planIndex] };
      plan.features = [
        ...plan.features,
        { text: 'New Studio Feature Capability', included: true, highlight: false },
      ];
      next[planIndex] = plan;
      return next;
    });
  };

  // Remove feature item
  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    setPlans((prev) => {
      const next = [...prev];
      const plan = { ...next[planIndex] };
      plan.features = plan.features.filter((_, idx) => idx !== featureIndex);
      next[planIndex] = plan;
      return next;
    });
  };

  // Toggle feature inclusion/highlight
  const handleToggleFeature = (
    planIndex: number,
    featureIndex: number,
    field: 'included' | 'highlight'
  ) => {
    setPlans((prev) => {
      const next = [...prev];
      const plan = { ...next[planIndex] };
      const feats = [...plan.features];
      feats[featureIndex] = {
        ...feats[featureIndex],
        [field]: !feats[featureIndex][field],
      };
      plan.features = feats;
      next[planIndex] = plan;
      return next;
    });
  };

  // Edit feature text
  const handleFeatureTextChange = (planIndex: number, featureIndex: number, text: string) => {
    setPlans((prev) => {
      const next = [...prev];
      const plan = { ...next[planIndex] };
      const feats = [...plan.features];
      feats[featureIndex] = { ...feats[featureIndex], text };
      plan.features = feats;
      next[planIndex] = plan;
      return next;
    });
  };

  // Save specific plan to database
  const handleSavePlan = async (plan: ManagedPlan) => {
    setSavingId(plan.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save plan configuration');
      }
      setSuccessMsg(`Plan "${plan.name}" successfully updated & persisted.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating plan');
    } finally {
      setSavingId(null);
    }
  };

  // Reset all plans to defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all plan configurations and multi-currency rates to factory defaults?')) {
      return;
    }
    setResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset plans');
      }
      setPlans(data.plans || DEFAULT_PLANS);
      setSuccessMsg('All plans reset to default factory configurations.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resetting plans');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 font-mono text-black">
      {/* HEADER SECTION */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-500 mb-1">
            <Sliders className="w-4 h-4 text-black" />
            <span>ADMINISTRATIVE ENGINE // PACKAGES &amp; PLANS CONFIGURATOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            PACKAGES &amp; PLAN MANAGEMENT
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl font-sans">
            Configure multi-currency subscription tiers for visitors worldwide. Adjust pricing for USD (Global default), INR (India), EUR (Eurozone), GBP (United Kingdom), and RUB (Russia). Updates persist instantly to the public checkout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/payment"
            target="_blank"
            className="px-3.5 py-2 border-2 border-black bg-white hover:bg-zinc-100 font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
          >
            <Eye className="w-4 h-4" />
            <span>VIEW LIVE /PAYMENT</span>
          </Link>
          <button
            type="button"
            disabled={resetting || loading}
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border-2 border-black bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>RESET TO DEFAULTS</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {successMsg && (
        <div className="border-2 border-black bg-emerald-50 text-emerald-950 p-3.5 text-xs font-bold flex items-center gap-2.5 shadow-[2px_2px_0px_#000000]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="border-2 border-black bg-rose-50 text-rose-950 p-3.5 text-xs font-bold flex items-center gap-2.5 shadow-[2px_2px_0px_#000000]">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CURRENCY PREVIEW STRIP */}
      <div className="border-2 border-black bg-zinc-100 p-3 flex flex-wrap items-center justify-between gap-3 shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2 text-xs font-black uppercase">
          <Globe className="w-4 h-4 text-zinc-700" />
          <span>CURRENCY PREVIEW CALCULATOR:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => setPreviewCurrency(curr)}
              className={`px-3 py-1 border border-black font-black text-xs uppercase transition-all cursor-pointer ${
                previewCurrency === curr
                  ? 'bg-black text-[#ccff00] shadow-[1px_1px_0px_#000000]'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {CURRENCY_SYMBOLS[curr]} {curr}
            </button>
          ))}
        </div>
      </div>

      {/* PLANS LIST */}
      {loading ? (
        <div className="border-4 border-black bg-white p-12 text-center shadow-[6px_6px_0px_#000000] space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black" />
          <span className="text-xs font-black uppercase tracking-wider block">
            LOADING PACKAGES &amp; PLAN SCHEMAS...
          </span>
        </div>
      ) : (
        <div className="space-y-8">
          {plans.map((plan, planIdx) => (
            <div
              key={plan.id}
              className={`border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] space-y-6 ${
                plan.id === 'pro' ? 'border-l-[12px] border-l-[#ccff00]' : ''
              }`}
            >
              {/* TOP STRIP: ID, NAME, BADGE, ACTIVE TOGGLE */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-black text-[#ccff00] px-2.5 py-1 text-xs font-black uppercase border border-black">
                    TIER {planIdx + 1}: {plan.id.toUpperCase()}
                  </span>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handlePlanChange(planIdx, 'name', e.target.value)}
                    className="border-2 border-black px-3 py-1 font-black text-sm uppercase bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                    placeholder="Plan Display Name"
                  />
                  <input
                    type="text"
                    value={plan.badge || ''}
                    onChange={(e) => handlePlanChange(planIdx, 'badge', e.target.value)}
                    className="border-2 border-black px-2.5 py-1 text-xs font-black uppercase bg-zinc-50 focus:bg-white focus:outline-none placeholder:text-zinc-400"
                    placeholder="Badge (e.g. MOST POPULAR)"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={(e) => handlePlanChange(planIdx, 'active', e.target.checked)}
                      className="w-4 h-4 border-2 border-black text-black focus:ring-0"
                    />
                    <span>{plan.active ? 'ACTIVE & PUBLISHED' : 'INACTIVE (HIDDEN)'}</span>
                  </label>
                  <button
                    type="button"
                    disabled={savingId === plan.id}
                    onClick={() => handleSavePlan(plan)}
                    className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50"
                  >
                    {savingId === plan.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>SAVE {plan.id.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* DESCRIPTION & GENERATION LIMIT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-600 block">
                    PLAN DESCRIPTION
                  </label>
                  <input
                    type="text"
                    value={plan.description}
                    onChange={(e) => handlePlanChange(planIdx, 'description', e.target.value)}
                    className="w-full border-2 border-black px-3 py-1.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none"
                    placeholder="Brief description for customer comparison cards"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-600 block">
                    GENERATION LIMIT (UNITS)
                  </label>
                  <input
                    type="number"
                    value={plan.generationLimit}
                    onChange={(e) =>
                      handlePlanChange(planIdx, 'generationLimit', parseInt(e.target.value) || 0)
                    }
                    className="w-full border-2 border-black px-3 py-1.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none"
                    placeholder="99999 for Unlimited"
                  />
                  <span className="text-[10px] text-zinc-500 font-bold block">
                    {plan.generationLimit >= 9999 ? 'Unlimited Optical Passes' : `${plan.generationLimit} Generations`}
                  </span>
                </div>
              </div>

              {/* MULTI-CURRENCY PRICING MATRIX */}
              <div className="space-y-3 border-t-2 border-black pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>MULTI-CURRENCY PRICING MATRIX (MONTHLY / YEARLY)</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">
                    DYNAMIC CONVERSION OVERRIDES
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {CURRENCIES.map((curr) => {
                    const price = plan.pricing?.[curr] || { monthly: 0, yearly: 0 };
                    const isPreview = previewCurrency === curr;
                    return (
                      <div
                        key={curr}
                        className={`border-2 border-black p-3 space-y-2 ${
                          isPreview ? 'bg-[#ccff00]/15 ring-2 ring-black' : 'bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-black/30 pb-1">
                          <span className="font-black text-xs text-black">
                            {CURRENCY_SYMBOLS[curr]} {curr}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">
                            {curr === 'USD' ? 'GLOBAL' : curr === 'INR' ? 'INDIA' : curr === 'RUB' ? 'RUSSIA' : curr}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-600 block">
                            MONTHLY:
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-xs font-black text-zinc-500">
                              {CURRENCY_SYMBOLS[curr]}
                            </span>
                            <input
                              type="number"
                              disabled={plan.id === 'free'}
                              value={price.monthly}
                              onChange={(e) =>
                                handlePriceChange(planIdx, curr, 'monthly', Number(e.target.value))
                              }
                              className="w-full pl-6 pr-2 py-1 text-xs font-black border border-black bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-600 block">
                            YEARLY:
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-xs font-black text-zinc-500">
                              {CURRENCY_SYMBOLS[curr]}
                            </span>
                            <input
                              type="number"
                              disabled={plan.id === 'free'}
                              value={price.yearly}
                              onChange={(e) =>
                                handlePriceChange(planIdx, curr, 'yearly', Number(e.target.value))
                              }
                              className="w-full pl-6 pr-2 py-1 text-xs font-black border border-black bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FEATURES CHECKLIST BUILDER */}
              <div className="space-y-3 border-t-2 border-black pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-black" />
                    <span>INCLUDED CAPABILITIES &amp; ADVANTAGES ({plan.features.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddFeature(planIdx)}
                    className="px-2.5 py-1 border border-black bg-white hover:bg-[#ccff00] text-black text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD FEATURE</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {plan.features.map((feat, featIdx) => (
                    <div
                      key={featIdx}
                      className="flex items-center gap-2 border border-black/40 bg-white p-1.5 text-xs font-mono"
                    >
                      <input
                        type="checkbox"
                        checked={feat.included}
                        onChange={() => handleToggleFeature(planIdx, featIdx, 'included')}
                        className="w-4 h-4 border border-black"
                        title="Included vs Excluded"
                      />
                      <input
                        type="text"
                        value={feat.text}
                        onChange={(e) => handleFeatureTextChange(planIdx, featIdx, e.target.value)}
                        className={`flex-1 px-2 py-0.5 border border-black/30 text-xs focus:outline-none ${
                          feat.included ? 'text-black font-bold' : 'text-zinc-400 line-through'
                        } ${feat.highlight ? 'bg-[#ccff00]/30 font-black' : 'bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(planIdx, featIdx, 'highlight')}
                        className={`px-2 py-0.5 border border-black text-[10px] font-black uppercase cursor-pointer ${
                          feat.highlight ? 'bg-[#ccff00] text-black' : 'bg-zinc-100 text-zinc-600'
                        }`}
                        title="Highlight feature in UI"
                      >
                        {feat.highlight ? 'HIGHLIGHTED' : 'NORMAL'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(planIdx, featIdx)}
                        className="p-1 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-400 cursor-pointer"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
