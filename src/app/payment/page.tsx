'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Check,
  X as XIcon,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Layers,
  Printer,
  Barcode as BarcodeIcon,
  HelpCircle,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { NEDJECT_PLANS, PlanConfig } from '@/lib/razorpay';
import { getUsageStats, UsageStats, setLocalUsageCount } from '@/lib/usage-limits';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PlansAndPaymentPage() {
  const { data: session, update: updateSession } = useSession();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [selectedPlanId, setSelectedPlanId] = useState<'pro' | 'enterprise'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    planName: string;
    paymentId: string;
    orderId: string;
    amount: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [razorpayStatus, setRazorpayStatus] = useState<{
    isConfigured: boolean;
    keyId: string;
  }>({ isConfigured: false, keyId: 'rzp_test_mock_mode' });

  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    limit: 2,
    remaining: 2,
    canGenerate: true,
    isLoggedIn: false,
    plan: 'guest',
  });

  // Load current user usage and razorpay config
  useEffect(() => {
    const isLogged = Boolean(session?.user);
    const currentPlan = ((session?.user as any)?.plan || 'free') as 'free' | 'pro' | 'enterprise';
    setUsageStats(getUsageStats(isLogged, currentPlan));

    fetch('/api/razorpay/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setRazorpayStatus({
            isConfigured: Boolean(data.isConfigured),
            keyId: data.keyId || 'rzp_test_mock_mode',
          });
        }
      })
      .catch(() => {});

    // Preload Razorpay Checkout SDK
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [session]);

  const activePlan = ((session?.user as any)?.plan || 'free') as 'free' | 'pro' | 'enterprise';

  // Handle Razorpay checkout trigger
  const handleInitiateRazorpay = async (planId: 'pro' | 'enterprise') => {
    setIsProcessing(true);
    setErrorMessage(null);
    setPaymentSuccess(null);
    setSelectedPlanId(planId);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          email: session?.user?.email,
          name: session?.user?.name,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create Razorpay payment order');
      }

      const orderData = await orderRes.json();
      const planConfig = NEDJECT_PLANS[planId];
      const displayAmount =
        currency === 'INR'
          ? `₹${billingCycle === 'yearly' ? planConfig.yearlyInr : planConfig.monthlyInr}`
          : `$${billingCycle === 'yearly' ? planConfig.yearlyUsd : planConfig.monthlyUsd}`;

      // 2. Check if real Razorpay SDK is loaded and credentials exist
      if (window.Razorpay && !orderData.isMock && razorpayStatus.isConfigured) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Nedject',
          description: `${orderData.planName} (${billingCycle.toUpperCase()} BILLING)`,
          image: '/public/file.svg',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              isMock: false,
              displayAmount,
            });
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
          theme: {
            color: '#000000',
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', function (resp: any) {
          setErrorMessage(resp.error?.description || 'Razorpay payment was rejected or failed.');
          setIsProcessing(false);
        });
        rzpInstance.open();
      } else {
        // 3. Sandbox / Instant Activation Mode (Works out-of-the-box!)
        // Simulate real payment confirmation for sandbox testing
        setTimeout(async () => {
          await verifyPayment({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_sandbox_${Date.now()}`,
            razorpay_signature: 'sandbox_verified_signature',
            planId,
            isMock: true,
            displayAmount,
          });
        }, 1200);
      }
    } catch (err: any) {
      console.error('Payment launch error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Verify payment on backend and activate Pro
  const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
    isMock,
    displayAmount,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: 'pro' | 'enterprise';
    isMock: boolean;
    displayAmount: string;
  }) => {
    try {
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          planId,
          isMock,
          email: session?.user?.email,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment signature verification failed');
      }

      // Success! Reset usage counter to 0 and trigger reactive listeners
      setLocalUsageCount(0);
      window.dispatchEvent(new Event('Nedject_usage_updated'));

      // If session exists, trigger session reload
      if (updateSession) {
        try {
          await updateSession();
        } catch {}
      }

      setPaymentSuccess({
        planName: NEDJECT_PLANS[planId].name,
        paymentId: verifyData.paymentId || razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: displayAmount,
      });

      // Update local usage stats
      setUsageStats(getUsageStats(true, planId));
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setErrorMessage(err.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black flex flex-col">
      {/* 1. TOP HEADER / BREADCRUMBS */}
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-xs uppercase hover:bg-black hover:text-[#ccff00] px-3.5 py-2 border-2 border-black transition-colors shadow-[2px_2px_0px_#000000]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO GENERATOR</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-[#fafaf5] px-3 py-1.5 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black inline-block" />
              <span>CURRENT STATUS: {activePlan.toUpperCase()}</span>
              <span className="text-zinc-400">|</span>
              <span className="text-zinc-600">
                {activePlan === 'pro' || activePlan === 'enterprise'
                  ? 'UNLIMITED GENERATIONS'
                  : `${usageStats.used}/${usageStats.limit} USED`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto w-full px-4 py-10 flex-1 space-y-10">
        
        {/* HERO TITLE BLOCK */}
        <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black bg-[#ccff00] text-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000000]">
                ₹
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight">
                  NEDJECT // UPGRADE &amp; PLANS
                </h1>
                <p className="text-xs text-zinc-600 font-bold uppercase mt-0.5">
                  INDUSTRIAL OPTICAL CALIBRATION • 600 DPI PRINT PASS • UNLIMITED GENERATIONS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-black bg-zinc-100 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-BIT ENCRYPTED SECURE CHECKOUT</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium leading-relaxed max-w-3xl">
            Choose the right calibration tier for your engineering and printing requirements. Upgrade to Pro Studio to unlock unrestricted 300 and 600 DPI vector exports, batch ZIP event pass matrices, and zero watermarks.
          </p>

          {/* CONTROLS STRIP: BILLING CYCLE & CURRENCY TOGGLE */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t-2 border-black">
            {/* Billing Toggle */}
            <div className="flex items-center gap-3 text-xs font-black">
              <span className={billingCycle === 'monthly' ? 'text-black font-black' : 'text-zinc-500'}>
                MONTHLY BILLING
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 border-2 border-black bg-white p-0.5 flex items-center transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
                aria-label="Toggle billing cycle"
              >
                <div
                  className={`w-5 h-5 bg-black transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-7 bg-[#ccff00]' : ''
                  }`}
                />
              </button>
              <span className={billingCycle === 'yearly' ? 'text-black font-black flex items-center gap-1.5' : 'text-zinc-500'}>
                <span>ANNUAL BILLING</span>
                <span className="bg-[#ccff00] text-black px-2 py-0.5 border border-black text-[10px] shadow-[1px_1px_0px_#000000]">
                  SAVE UP TO 37%
                </span>
              </span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-zinc-600 uppercase">CURRENCY:</span>
              <div className="inline-flex border-2 border-black bg-white shadow-[2px_2px_0px_#000000]">
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1 text-xs font-black cursor-pointer transition-colors ${
                    currency === 'INR' ? 'bg-black text-[#ccff00]' : 'hover:bg-zinc-100 text-black'
                  }`}
                >
                  INR (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 text-xs font-black cursor-pointer transition-colors border-l-2 border-black ${
                    currency === 'USD' ? 'bg-black text-[#ccff00]' : 'hover:bg-zinc-100 text-black'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION CARD */}
        {paymentSuccess && (
          <div className="border-4 border-black bg-[#f0fde8] p-6 shadow-[8px_8px_0px_#000000] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 border-2 border-black bg-emerald-500 text-black flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-emerald-950">
                    PAYMENT SUCCESSFUL — {paymentSuccess.planName.toUpperCase()} ACTIVE!
                  </h3>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">
                    Your account has been upgraded to UNLIMITED 300/600 DPI exports and full tool access.
                  </p>
                </div>
              </div>
              <span className="bg-black text-[#ccff00] text-[11px] font-black px-2.5 py-1 border border-black uppercase">
                VERIFIED
              </span>
            </div>

            <div className="border-t-2 border-black/20 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-white border-2 border-black p-2">
                <span className="text-zinc-500 block text-[10px] font-bold">ORDER ID:</span>
                <span className="font-black text-black truncate block">{paymentSuccess.orderId}</span>
              </div>
              <div className="bg-white border-2 border-black p-2">
                <span className="text-zinc-500 block text-[10px] font-bold">PAYMENT ID:</span>
                <span className="font-black text-black truncate block">{paymentSuccess.paymentId}</span>
              </div>
              <div className="bg-white border-2 border-black p-2">
                <span className="text-zinc-500 block text-[10px] font-bold">AMOUNT PAID:</span>
                <span className="font-black text-emerald-700 block">{paymentSuccess.amount}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/"
                className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-2"
              >
                <span>OPEN 300 DPI QR STUDIO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/barcode-pick"
                className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000]"
              >
                OPEN BARCODE PICK
              </Link>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION CARD */}
        {errorMessage && (
          <div className="border-4 border-black bg-[#ffecec] p-4 shadow-[6px_6px_0px_#000000] flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-xs uppercase text-rose-950">CHECKOUT NOTICE</h4>
                <p className="text-xs text-rose-800 font-bold mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-black underline text-rose-900 cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* 3. 3-TIER PRICING MATRIX CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* ========================================================= */}
          {/* TIER 1: FREE FOREVER                                      */}
          {/* ========================================================= */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="font-black text-sm uppercase text-black">FREE TIER</span>
                <span className="text-2xl font-black text-black">
                  {currency === 'INR' ? '₹0' : '$0'}
                </span>
              </div>

              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                {NEDJECT_PLANS.free.description}
              </p>

              <div className="border-t border-black/20 pt-3 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-zinc-500">
                  INCLUDED CAPABILITIES:
                </div>
                <ul className="space-y-2 text-xs font-bold text-zinc-800">
                  {NEDJECT_PLANS.free.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {f.included ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XIcon className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? 'text-zinc-900' : 'text-zinc-400 line-through'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="p-3 border-2 border-black bg-zinc-100 text-center font-black text-xs uppercase text-zinc-600">
                {activePlan === 'free' ? 'CURRENT ACTIVE PLAN' : 'DEFAULT BASE TIER'}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TIER 2: PRO STUDIO (FEATURED)                             */}
          {/* ========================================================= */}
          <div className="border-4 border-black bg-[#f4fde8] p-6 sm:p-7 shadow-[10px_10px_0px_#000000] flex flex-col justify-between space-y-6 relative">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 right-6 bg-black text-[#ccff00] text-[10px] font-black tracking-widest px-3 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_#000000]">
              MOST POPULAR // CREATORS
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-black text-base uppercase text-black">
                    PRO STUDIO
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-black text-black">
                    {currency === 'INR'
                      ? billingCycle === 'yearly'
                        ? '₹3,999'
                        : '₹499'
                      : billingCycle === 'yearly'
                      ? '$79'
                      : '$9'}
                  </span>
                  <span className="text-xs text-zinc-600 font-bold block text-right">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-700 font-sans leading-relaxed">
                {NEDJECT_PLANS.pro.description}
              </p>

              <div className="border-t border-black/30 pt-3 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-zinc-800">
                  ALL PRO ADVANTAGES:
                </div>
                <ul className="space-y-2 text-xs font-bold text-zinc-900">
                  {NEDJECT_PLANS.pro.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className={f.highlight ? 'text-black font-black bg-[#ccff00]/40 px-1' : ''}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleInitiateRazorpay('pro')}
                className="w-full py-3.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs sm:text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing && selectedPlanId === 'pro' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#ccff00]" />
                    <span>INITIALIZING SECURE CHECKOUT...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      UPGRADE TO PRO STUDIO (
                      {currency === 'INR'
                        ? billingCycle === 'yearly'
                          ? '₹3,999'
                          : '₹499'
                        : billingCycle === 'yearly'
                        ? '$79'
                        : '$9'}
                      )
                    </span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-zinc-600 font-bold text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-zinc-500" />
                <span>Instant activation via UPI, Cards, NetBanking</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TIER 3: ENTERPRISE MATRIX                                 */}
          {/* ========================================================= */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-black pb-3">
                <span className="font-black text-sm uppercase text-black">ENTERPRISE MATRIX</span>
                <div>
                  <span className="text-2xl font-black text-black">
                    {currency === 'INR'
                      ? billingCycle === 'yearly'
                        ? '₹14,999'
                        : '₹1,999'
                      : billingCycle === 'yearly'
                      ? '$249'
                      : '$29'}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold block text-right">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                {NEDJECT_PLANS.enterprise.description}
              </p>

              <div className="border-t border-black/20 pt-3 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-zinc-500">
                  ENTERPRISE CAPABILITIES:
                </div>
                <ul className="space-y-2 text-xs font-bold text-zinc-800">
                  {NEDJECT_PLANS.enterprise.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleInitiateRazorpay('enterprise')}
                className="w-full py-3 border-2 border-black bg-white hover:bg-black hover:text-[#ccff00] text-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing && selectedPlanId === 'enterprise' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>INITIALIZING CHECKOUT...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>ACTIVATE ENTERPRISE</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-zinc-500 font-bold text-center">
                Includes REST API key &amp; direct support by neerajrekwar
              </div>
            </div>
          </div>

        </div>

        {/* 4. PAYMENT METHODS & TRUST BADGES */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-black" />
              <h3 className="text-sm font-black uppercase text-black">
                ACCEPTED PAYMENT METHODS &amp; INSTANT ACTIVATION
              </h3>
            </div>
            <div className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              ✓ 256-BIT ENCRYPTED CHECKOUT
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="border-2 border-black p-3 bg-zinc-50 space-y-1">
              <div className="font-black text-black">UPI TRANSFERS</div>
              <p className="text-[11px] text-zinc-600">Google Pay, PhonePe, Paytm, BHIM &amp; all UPI IDs</p>
            </div>
            <div className="border-2 border-black p-3 bg-zinc-50 space-y-1">
              <div className="font-black text-black">CARDS</div>
              <p className="text-[11px] text-zinc-600">Visa, Mastercard, RuPay, Maestro, American Express</p>
            </div>
            <div className="border-2 border-black p-3 bg-zinc-50 space-y-1">
              <div className="font-black text-black">NETBANKING</div>
              <p className="text-[11px] text-zinc-600">HDFC, ICICI, SBI, Axis, Kotak + 50 Indian Banks</p>
            </div>
            <div className="border-2 border-black p-3 bg-zinc-50 space-y-1">
              <div className="font-black text-black">WALLETS</div>
              <p className="text-[11px] text-zinc-600">Mobikwik, Freecharge, Airtel Money, Amazon Pay</p>
            </div>
          </div>
        </div>

        {/* 5. COMPARISON SPECIFICATION MATRIX */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4 overflow-x-auto">
          <div className="border-b-2 border-black pb-3">
            <h3 className="text-sm font-black uppercase text-black">
              DETAILED OPTICAL SPECIFICATION MATRIX
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Side-by-side comparison of technical features across Nedject tiers.
            </p>
          </div>

          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-zinc-100">
                <th className="p-2.5 font-black text-black">FEATURE / CAPABILITY</th>
                <th className="p-2.5 font-black text-black text-center">FREE</th>
                <th className="p-2.5 font-black text-black text-center bg-[#ccff00]/20">PRO STUDIO</th>
                <th className="p-2.5 font-black text-black text-center">ENTERPRISE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/20">
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">DPI Print Calibration</td>
                <td className="p-2.5 text-center font-bold">Standard 300 DPI</td>
                <td className="p-2.5 text-center font-black bg-[#ccff00]/10">300 &amp; 600 DPI Vector</td>
                <td className="p-2.5 text-center font-black">Up to 1200 DPI Ultra</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">Generation Limit</td>
                <td className="p-2.5 text-center">2 Guest / 10 Auth</td>
                <td className="p-2.5 text-center font-black text-emerald-800 bg-[#ccff00]/10">UNLIMITED</td>
                <td className="p-2.5 text-center font-black text-emerald-800">UNLIMITED</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">Barcode Symbologies</td>
                <td className="p-2.5 text-center">3 Basic (128, EAN, UPC)</td>
                <td className="p-2.5 text-center font-black bg-[#ccff00]/10">All 8 Formats (ITF, Pharma)</td>
                <td className="p-2.5 text-center font-black">All 8 + Custom Checksum</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">Physical Print Chunk (pHYs)</td>
                <td className="p-2.5 text-center">Yes</td>
                <td className="p-2.5 text-center font-black bg-[#ccff00]/10">Yes + CMYK Presets</td>
                <td className="p-2.5 text-center font-black">Yes + Vector Direct</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">Event Pass Matrix &amp; Batch ZIP</td>
                <td className="p-2.5 text-center text-zinc-400">—</td>
                <td className="p-2.5 text-center font-black text-emerald-700 bg-[#ccff00]/10">✓ Included</td>
                <td className="p-2.5 text-center font-black text-emerald-700">✓ Bulk (1,000+)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">REST API Integration</td>
                <td className="p-2.5 text-center text-zinc-400">—</td>
                <td className="p-2.5 text-center text-zinc-400 bg-[#ccff00]/10">—</td>
                <td className="p-2.5 text-center font-black text-emerald-700">✓ API Keys Included</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-zinc-800">Support Level</td>
                <td className="p-2.5 text-center">Community GitHub</td>
                <td className="p-2.5 text-center font-bold bg-[#ccff00]/10">Priority Support</td>
                <td className="p-2.5 text-center font-black">1-on-1 by neerajrekwar</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6. FAQ & DEVELOPER CONTACT */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3">
            <HelpCircle className="w-4 h-4 text-black" />
            <h3 className="text-sm font-black uppercase text-black">
              FREQUENTLY ASKED QUESTIONS &amp; GUARANTEE
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <h4 className="font-mono font-black text-black uppercase">How does checkout &amp; instant activation work?</h4>
              <p className="text-zinc-600 leading-relaxed font-medium">
                You can pay securely using UPI (Google Pay, PhonePe, Paytm), Credit or Debit cards, NetBanking, and Wallets. Once payment is authorized, your account is immediately upgraded to Pro without waiting.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-mono font-black text-black uppercase">Can I cancel anytime?</h4>
              <p className="text-zinc-600 leading-relaxed font-medium">
                Yes. There are zero lock-in contracts. You can switch between Monthly and Annual billing or cancel anytime with one click in your profile settings.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-mono font-black text-black uppercase">What is the 300/600 DPI calibration?</h4>
              <p className="text-zinc-600 leading-relaxed font-medium">
                Standard web generators output low-resolution 72 or 96 DPI images that become fuzzy when printed. Nedject injects standard pHYs PNG chunks calibrated at 11,811 pixels per meter (300 DPI) for crisp commercial press printing.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-mono font-black text-black uppercase">Need custom invoice or business support?</h4>
              <p className="text-zinc-600 leading-relaxed font-medium">
                Nedject is developed by neerajrekwar. If your company requires a GST invoice, bulk license, or custom barcode integrations, email directly at{' '}
                <a href="mailto:dev.neerajrekwar@gmail.com" className="font-mono font-black text-black underline">
                  dev.neerajrekwar@gmail.com
                </a>.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* 7. FOOTER */}
      <footer className="border-t-2 border-black bg-white py-4 px-4 font-mono text-xs text-center text-zinc-600">
        Nedject // Developed by neerajrekwar • Industrial Optical Matrix &amp; Pro Subscription Engine
      </footer>
    </div>
  );
}
