'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Ticket,
  Tag,
  Percent,
  Sliders,
  CheckSquare,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import { NEDJECT_PLANS } from '@/lib/razorpay';
import { getUsageStats, UsageStats, setLocalUsageCount } from '@/lib/usage-limits';
import { SecureCardCheckoutModal } from '@/components/payment/SecureCardCheckoutModal';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  setClientRedirectDestination,
  clearClientRedirectDestination,
} from '@/lib/auth-redirect';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface AppliedCouponInfo {
  coupon: {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    planRestriction?: string;
  };
  discountAmount: number;
  finalAmount: number;
  currency: 'INR' | 'USD';
  isFree: boolean;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();

  const initialPlan = searchParams?.get('plan') === 'enterprise' ? 'enterprise' : 'pro';
  const initialCoupon = searchParams?.get('coupon') || '';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [selectedPlanId, setSelectedPlanId] = useState<'pro' | 'enterprise'>(initialPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState(initialCoupon);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [pinnedCoupons, setPinnedCoupons] = useState<
    Array<{
      code: string;
      label: string;
      tag: string;
      description?: string;
    }>
  >([]);

  const [paymentSuccess, setPaymentSuccess] = useState<{
    planName: string;
    paymentId: string;
    orderId: string;
    amount: string;
    couponCode?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secureModalOpen, setSecureModalOpen] = useState(false);
  const [activeOrderData, setActiveOrderData] = useState<{
    orderId: string;
    signedOrderToken: string;
    amount: number;
    currency: string;
    planName: string;
    planId: 'pro' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
    displayAmount: string;
    couponCode?: string;
  } | null>(null);
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Clear intended destination cookie once the user is confirmed authenticated
  useEffect(() => {
    if (session?.user) {
      clearClientRedirectDestination();
    }
  }, [session]);

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

    // Fetch only admin-pinned public coupons
    fetch('/api/coupons/pinned')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.coupons)) {
          setPinnedCoupons(data.coupons);
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

  // If initial coupon in URL, apply it automatically
  useEffect(() => {
    if (initialCoupon) {
      handleApplyCoupon(initialCoupon);
    }
  }, [initialCoupon]);

  const activePlan = ((session?.user as any)?.plan || 'free') as 'free' | 'pro' | 'enterprise';

  // Apply Coupon code
  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon or promo voucher code.');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          planId: selectedPlanId,
          billingCycle,
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponInput(data.coupon.code);
        setCouponSuccess(
          data.isFreeUpgrade
            ? `PROMO CODE ${data.coupon.code} VERIFIED: 100% FREE UPGRADE UNLOCKED!`
            : `COUPON ${data.coupon.code} APPLIED: Saved ${currency === 'INR' ? '₹' : '$'}${data.discountAmount} (${data.coupon.description})`
        );
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon code.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
    setCouponInput('');
  };

  // Calculate pricing breakdown for plan
  const getPlanPrice = (planId: 'pro' | 'enterprise') => {
    const planConfig = NEDJECT_PLANS[planId];
    const orig =
      currency === 'INR'
        ? billingCycle === 'yearly'
          ? planConfig.yearlyInr
          : planConfig.monthlyInr
        : billingCycle === 'yearly'
        ? planConfig.yearlyUsd
        : planConfig.monthlyUsd;

    if (
      appliedCoupon &&
      (!appliedCoupon.coupon.planRestriction ||
        appliedCoupon.coupon.planRestriction === 'all' ||
        appliedCoupon.coupon.planRestriction === planId)
    ) {
      let discount = 0;
      if (appliedCoupon.coupon.discountType === 'percentage') {
        discount = Math.round((orig * appliedCoupon.coupon.discountValue) / 100);
      } else {
        discount = appliedCoupon.coupon.discountValue;
      }
      const final = Math.max(0, orig - discount);
      return {
        origAmount: orig,
        finalAmount: final,
        discountAmount: discount,
        origDisplay: `${currency === 'INR' ? '₹' : '$'}${orig.toLocaleString()}`,
        finalDisplay: `${currency === 'INR' ? '₹' : '$'}${final.toLocaleString()}`,
        isFree: final === 0,
        hasDiscount: discount > 0,
      };
    }

    return {
      origAmount: orig,
      finalAmount: orig,
      discountAmount: 0,
      origDisplay: `${currency === 'INR' ? '₹' : '$'}${orig.toLocaleString()}`,
      finalDisplay: `${currency === 'INR' ? '₹' : '$'}${orig.toLocaleString()}`,
      isFree: false,
      hasDiscount: false,
    };
  };

  // Handle Pay / Upgrade trigger for chosen plan
  const handlePayToPlan = async (planId: 'pro' | 'enterprise') => {
    setErrorMessage(null);
    setPaymentSuccess(null);
    setSelectedPlanId(planId);

    // CRITICAL REQUIREMENT: Intercept unauthenticated users attempting to access paid features/payment.
    // If user is NOT logged in: save destination cookie, prompt login modal, and prevent payment.
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        const dest = window.location.pathname + window.location.search;
        setClientRedirectDestination(dest);
      }
      setErrorMessage('Sign in required: Please log in or register so your upgraded plan is linked to your account.');
      setShowAuthModal(true);
      setIsProcessing(false);
      return;
    }

    // "Also prevent payment redirect login user then payment"
    // Logged-in user proceeds directly to payment without any login redirect!
    setIsProcessing(true);

    const priceInfo = getPlanPrice(planId);
    const couponCode = appliedCoupon?.coupon?.code;

    try {
      // 1. Create order on server with authoritative pricing and cryptographic token
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          currency,
          couponCode,
          email: session?.user?.email,
          name: session?.user?.name,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        if (orderRes.status === 401 || errData.requiresLogin) {
          if (typeof window !== 'undefined') {
            setClientRedirectDestination(window.location.pathname + window.location.search);
          }
          setShowAuthModal(true);
          throw new Error('Your session has expired. Please sign in to complete payment.');
        }
        throw new Error(errData.error || 'Failed to create payment order');
      }

      const orderData = await orderRes.json();
      const displayAmount = priceInfo.isFree
        ? '₹0 (100% FREE PROMO PASS)'
        : priceInfo.finalDisplay;

      // 2. Case: 100% Free Upgrade (Promotional Voucher with amount === 0)
      if (orderData.isFreeUpgrade || orderData.amount === 0) {
        await verifyPayment({
          signedOrderToken: orderData.signedOrderToken,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          planId,
          paymentMethod: 'coupon_free',
          displayAmount,
          couponCode,
        });
        return;
      }

      // 3. Case: Live Razorpay Gateway Configured & Available
      if (window.Razorpay && razorpayStatus.isConfigured && currency === 'INR') {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Nedject genQRstudio',
          description: `${orderData.planName} (${billingCycle.toUpperCase()} BILLING)${
            couponCode ? ` • CODE ${couponCode}` : ''
          }`,
          image: '/public/file.svg',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            await verifyPayment({
              signedOrderToken: orderData.signedOrderToken,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              paymentMethod: 'razorpay',
              displayAmount,
              couponCode,
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
          setErrorMessage(resp.error?.description || 'Payment was rejected or failed.');
          setIsProcessing(false);
        });
        rzpInstance.open();
        return;
      }

      // 4. Default High-Security Direct Card Terminal with Anti-Fraud Shield
      setActiveOrderData({
        orderId: orderData.orderId,
        signedOrderToken: orderData.signedOrderToken,
        amount: orderData.amount,
        currency: orderData.currency,
        planName: NEDJECT_PLANS[planId].name,
        planId,
        billingCycle,
        displayAmount,
        couponCode,
      });
      setSecureModalOpen(true);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Payment launch error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Verify payment on backend with cryptographic token
  const verifyPayment = async ({
    signedOrderToken,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
    paymentMethod,
    displayAmount,
    couponCode,
  }: {
    signedOrderToken: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    planId: 'pro' | 'enterprise';
    paymentMethod: 'coupon_free' | 'razorpay' | 'card';
    displayAmount: string;
    couponCode?: string;
  }) => {
    try {
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedOrderToken,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          planId,
          paymentMethod,
          couponCode,
          email: session?.user?.email,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment security verification failed');
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
        couponCode,
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

  const selectedPriceInfo = getPlanPrice(selectedPlanId);
  const userSlug = (session?.user as any)?.id || session?.user?.email?.split('@')[0] || 'profile';

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black flex flex-col">
      {/* 1. TOP HEADER / BREADCRUMBS */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xs uppercase hover:bg-black hover:text-[#ccff00] px-3.5 py-2 border-2 border-black transition-colors shadow-[2px_2px_0px_#000000]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO STUDIO</span>
            </Link>

            {session?.user && (
              <Link
                href={`/${encodeURIComponent(userSlug)}`}
                className="flex items-center gap-1.5 font-black text-xs uppercase bg-white hover:bg-[#ccff00] px-3 py-2 border-2 border-black transition-colors shadow-[2px_2px_0px_#000000]"
              >
                <span>MY PROFILE</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-[#fafaf5] px-3 py-1.5 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black inline-block" />
              <span>STATUS: {activePlan.toUpperCase()}</span>
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
      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
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

          {/* AUTH STATUS & PREVENT REDIRECT INDICATOR */}
          {session?.user ? (
            <div className="border-2 border-black bg-emerald-50 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 border border-black bg-emerald-500 text-black flex items-center justify-center font-black">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-black uppercase text-emerald-950 block">
                    AUTHENTICATED: {session.user.email} (ACTIVE SESSION)
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold block">
                    Direct payment active • No login redirect • Upgrades apply immediately to this account
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-black text-[#ccff00] px-2.5 py-1 font-black uppercase border border-black shadow-[1px_1px_0px_#000000]">
                AUTHENTICATED CHECKOUT
              </span>
            </div>
          ) : (
            <div className="border-2 border-black bg-[#fffde6] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 border border-black bg-amber-400 text-black flex items-center justify-center font-black">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-black uppercase text-black block">
                    AUTHENTICATION REQUIRED TO UPGRADE &amp; PAY
                  </span>
                  <span className="text-[11px] text-zinc-700 font-bold block">
                    Please sign in or register so your upgraded plan is attached to your account. Your selected plan and coupon will be remembered automatically.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    setClientRedirectDestination(window.location.pathname + window.location.search);
                  }
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN TO UPGRADE</span>
              </button>
            </div>
          )}

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

        {/* ========================================================================= */}
        {/* INTERACTIVE ORDER PREVIEW & PAY TO PLAN (REQUESTED BY USER)              */}
        {/* ========================================================================= */}
        <div className="border-4 border-black bg-[#f4fde8] p-6 sm:p-7 shadow-[10px_10px_0px_#000000] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-[#ccff00] px-2.5 py-0.5 border border-black inline-block shadow-[1px_1px_0px_#000000]">
                SELECTED PLAN CHECKOUT PREVIEW
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-black tracking-tight flex items-center gap-2">
                <span>CHOSEN PLAN:</span>
                <span className="bg-black text-[#ccff00] px-3 py-0.5 border border-black">
                  {selectedPlanId === 'pro' ? 'PRO STUDIO' : 'ENTERPRISE MATRIX'}
                </span>
                <span className="text-zinc-500 text-xs font-bold">
                  ({billingCycle.toUpperCase()} BILLING)
                </span>
              </h2>
            </div>

            {/* Plan switcher tabs */}
            <div className="flex items-center border-2 border-black bg-white shadow-[3px_3px_0px_#000000]">
              <button
                type="button"
                onClick={() => setSelectedPlanId('pro')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
                  selectedPlanId === 'pro'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                PRO STUDIO
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlanId('enterprise')}
                className={`px-3.5 py-1.5 text-xs font-black uppercase transition-colors border-l-2 border-black cursor-pointer ${
                  selectedPlanId === 'enterprise'
                    ? 'bg-black text-[#ccff00]'
                    : 'text-black hover:bg-zinc-100'
                }`}
              >
                ENTERPRISE MATRIX
              </button>
            </div>
          </div>

          {/* EXACT TEXT REQUESTED: "admin subscription provisioner set all plan bases have set" */}
          <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000000] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 border border-black bg-[#ccff00] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-black font-black" />
              </div>
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-tight text-black block">
                  admin subscription provisioner set all plan bases have set
                </span>
                <span className="text-[11px] text-zinc-600 font-bold block">
                  All optical calibration channels, pHYs chunks, and unlimited generations unlocked upon payment.
                </span>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-900 border border-black text-[10px] font-black px-2 py-0.5 uppercase">
              PROVISIONER VERIFIED
            </span>
          </div>

          {/* PROMO VOUCHERS & DISCOUNTS */}
          <div className="border-2 border-black bg-white p-5 space-y-4 shadow-[3px_3px_0px_#000000]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/20 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-black" />
                <h4 className="text-xs font-black uppercase text-black">
                  HAVE A PROMO VOUCHER OR DISCOUNT CODE?
                </h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                PROMO CODE ENGINE ACTIVE
              </span>
            </div>

            {/* Coupon input */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="ENTER PROMO CODE (e.g. WINTER2026)"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono font-black text-xs uppercase tracking-wider focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={couponLoading || !couponInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000000] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {couponLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>CHECKING...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>APPLY COUPON</span>
                    </>
                  )}
                </button>

                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-2 border-2 border-black bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs uppercase transition-colors shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    REMOVE
                  </button>
                )}
              </div>
            </div>

            {/* Available Coupon Settings Chips - ONLY rendered if admin has pinned coupons in /admin/coupons */}
            {pinnedCoupons.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  FEATURED OFFERS &amp; PROMOTIONS (CLICK TO APPLY):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {pinnedCoupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className={`px-2.5 py-1 border border-black font-mono text-[11px] font-black tracking-tight transition-all shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1.5 ${
                        appliedCoupon?.coupon?.code === c.code
                          ? 'bg-black text-[#ccff00]'
                          : 'bg-[#fafaf5] hover:bg-[#ccff00] text-black'
                      }`}
                    >
                      <span>{c.code}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white/80 px-1 border border-black/40">
                        {c.label}
                      </span>
                      {c.tag && (
                        <span className="text-[9px] font-black bg-black text-[#ccff00] px-1 uppercase">
                          {c.tag}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Coupon Feedback */}
            {couponSuccess && (
              <div className="border border-black bg-emerald-50 text-emerald-950 p-2 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{couponSuccess}</span>
              </div>
            )}

            {couponError && (
              <div className="border border-black bg-rose-50 text-rose-950 p-2 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          {/* PREVIEW BREAKDOWN & PAY TO PLAN BUTTON */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-4">
            <h4 className="text-xs font-black uppercase text-black border-b border-black/20 pb-2 flex items-center justify-between">
              <span>ORDER BILLING BREAKDOWN // {selectedPlanId.toUpperCase()}</span>
              <span className="text-zinc-500 font-bold">{billingCycle.toUpperCase()} INTERVAL</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-zinc-700">
                <span>Base Plan Price ({selectedPlanId === 'pro' ? 'Pro Studio' : 'Enterprise'}):</span>
                <span className="font-bold">{selectedPriceInfo.origDisplay}</span>
              </div>

              {selectedPriceInfo.hasDiscount && (
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-[#ccff00]/30 px-2 py-1 border border-black/30">
                  <span>Coupon Voucher Discount ({appliedCoupon?.coupon.code}):</span>
                  <span>
                    {selectedPriceInfo.isFree
                      ? '-100% (FREE PROMO)'
                      : `-${currency === 'INR' ? '₹' : '$'}${selectedPriceInfo.discountAmount}`}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-black pt-2 flex justify-between items-baseline">
                <span className="font-black text-sm uppercase text-black">TOTAL PAYABLE NOW:</span>
                <div className="text-right">
                  {selectedPriceInfo.hasDiscount && (
                    <span className="text-xs text-zinc-400 line-through font-bold block">
                      {selectedPriceInfo.origDisplay}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-black">
                    {selectedPriceInfo.isFree ? '₹0' : selectedPriceInfo.finalDisplay}
                  </span>
                  {selectedPriceInfo.isFree && (
                    <span className="text-[10px] text-emerald-700 font-black block uppercase">
                      100% FREE PROMOTIONAL ACCESS
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION: PAY TO PLAN */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePayToPlan(selectedPlanId)}
                className="w-full py-4 border-4 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-sm sm:text-base uppercase transition-all shadow-[6px_6px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#ccff00]" />
                    <span>PROCESSING ORDER &amp; PROVISIONING...</span>
                  </>
                ) : !session?.user ? (
                  <>
                    <LogIn className="w-5 h-5 text-[#ccff00]" />
                    <span>
                      SIGN IN TO UPGRADE &amp; PAY ({selectedPriceInfo.finalDisplay})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {selectedPriceInfo.isFree
                        ? 'CLAIM 100% FREE PROMO UPGRADE'
                        : `PAY TO PLAN (${selectedPriceInfo.finalDisplay})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="text-[10px] text-zinc-600 font-bold text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-zinc-500" />
                <span>Instant provisioning via UPI, Cards, NetBanking or 100% Free Promo Pass</span>
              </div>

              {/* ANTI-FRAUD & TEST CARD DEFENSE NOTIFICATION */}
              <div className="mt-2 p-3 border-2 border-black bg-[#fffbe6] text-black text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 font-black uppercase text-[11px] text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ANTI-FRAUD PROTECTION &amp; TEST CARD DEFENSE ACTIVE</span>
                </div>
                <p className="text-[10px] text-zinc-700 leading-snug">
                  • Test cards (e.g. 4242..., 4000..., dummy sets) and sandbox bypass tricks are strictly prohibited and automatically rejected by server anti-fraud heuristics.
                  <br />
                  • Transactions are secured via Luhn Mod-10 checksum validation, cryptographic HMAC order tokens, and real-time 3D-Secure 2-factor authentication.
                </p>
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
                    {paymentSuccess.couponCode && (
                      <span className="block mt-1 font-mono text-[11px] text-emerald-900">
                        Redeemed with coupon voucher: <strong>{paymentSuccess.couponCode}</strong>
                      </span>
                    )}
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
                href={`/${encodeURIComponent(userSlug)}`}
                className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000]"
              >
                VIEW MY UPDATED PROFILE
              </Link>
              <Link
                href="/"
                className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-2"
              >
                <span>OPEN 300 DPI QR STUDIO</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
          {/* TIER 1: FREE FOREVER */}
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

          {/* TIER 2: PRO STUDIO (FEATURED) */}
          <div
            className={`border-4 border-black bg-[#f4fde8] p-6 sm:p-7 shadow-[10px_10px_0px_#000000] flex flex-col justify-between space-y-6 relative transition-all ${
              selectedPlanId === 'pro' ? 'ring-4 ring-[#ccff00]' : ''
            }`}
          >
            <div className="absolute -top-3.5 right-6 bg-black text-[#ccff00] text-[10px] font-black tracking-widest px-3 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_#000000]">
              {selectedPlanId === 'pro' ? 'CHOSEN PLAN // ACTIVE' : 'MOST POPULAR // CREATORS'}
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-black text-base uppercase text-black">
                    PRO STUDIO
                  </span>
                </div>
                <div className="text-right">
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
                onClick={() => {
                  setSelectedPlanId('pro');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className={`w-full py-3.5 border-2 border-black font-black text-xs sm:text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 ${
                  selectedPlanId === 'pro'
                    ? 'bg-[#ccff00] text-black'
                    : 'bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>
                  {selectedPlanId === 'pro' ? 'CHOSEN PLAN (CHECKOUT ABOVE)' : 'SELECT PRO STUDIO'}
                </span>
              </button>
              <div className="text-[10px] text-zinc-600 font-bold text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-zinc-500" />
                <span>Instant activation via UPI, Cards, NetBanking</span>
              </div>
            </div>
          </div>

          {/* TIER 3: ENTERPRISE MATRIX */}
          <div
            className={`border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-6 relative transition-all ${
              selectedPlanId === 'enterprise' ? 'ring-4 ring-black bg-zinc-50' : ''
            }`}
          >
            {selectedPlanId === 'enterprise' && (
              <div className="absolute -top-3.5 right-6 bg-black text-[#ccff00] text-[10px] font-black tracking-widest px-3 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_#000000]">
                CHOSEN PLAN // ACTIVE
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-black pb-3">
                <span className="font-black text-sm uppercase text-black">ENTERPRISE MATRIX</span>
                <div className="text-right">
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
                onClick={() => {
                  setSelectedPlanId('enterprise');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className={`w-full py-3 border-2 border-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 ${
                  selectedPlanId === 'enterprise'
                    ? 'bg-[#ccff00] text-black'
                    : 'bg-white hover:bg-black hover:text-[#ccff00] text-black'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {selectedPlanId === 'enterprise'
                    ? 'CHOSEN PLAN (CHECKOUT ABOVE)'
                    : 'SELECT ENTERPRISE'}
                </span>
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
      </main>

      {/* 6. FOOTER */}
      <footer className="border-t-2 border-black bg-white py-4 px-4 font-mono text-xs text-center text-zinc-600">
        Nedject // Developed by neerajrekwar • Industrial Optical Matrix &amp; Pro Subscription Engine
      </footer>

      {/* 7. SECURE CARD CHECKOUT MODAL (PCI-DSS & ANTI-FRAUD PROTECTED) */}
      {activeOrderData && (
        <SecureCardCheckoutModal
          isOpen={secureModalOpen}
          onClose={() => setSecureModalOpen(false)}
          orderData={activeOrderData}
          onSuccess={(result) => {
            setLocalUsageCount(0);
            window.dispatchEvent(new Event('Nedject_usage_updated'));
            if (updateSession) {
              updateSession().catch(() => {});
            }
            setPaymentSuccess({
              planName: result.planName,
              paymentId: result.paymentId,
              orderId: result.orderId,
              amount: result.amount,
              couponCode: result.couponCode,
            });
            setUsageStats(getUsageStats(true, activeOrderData.planId));
          }}
        />
      )}

      {/* 8. AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          if (updateSession) {
            updateSession().catch(() => {});
          }
        }}
      />
    </div>
  );
}

export default function PlansAndPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f0] text-black font-mono flex items-center justify-center">
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-black" />
            <p className="text-xs font-black uppercase">INITIALIZING CHECKOUT MATRIX...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
