'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Sparkles,
  CreditCard,
  QrCode,
  Layers,
  Printer,
  Barcode as BarcodeIcon,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  Calendar,
  Briefcase,
  Mail,
  Zap,
  ExternalLink,
  Tag,
  Ticket,
  Percent,
  Check,
  RefreshCw,
} from 'lucide-react';
import { NEDJECT_PLANS } from '@/lib/razorpay';
import { getUsageStats, UsageStats } from '@/lib/usage-limits';
import { AuthModal } from '@/components/auth/AuthModal';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();

  const useridParam = (params?.userid as string) || '';
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Editable user profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [occupation, setOccupation] = useState('');
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [provider, setProvider] = useState<string>('credentials');
  const [userId, setUserId] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');

  // Usage stats
  const [usageStats, setUsageStats] = useState<UsageStats>({
    used: 0,
    limit: 2,
    remaining: 2,
    canGenerate: true,
    isLoggedIn: false,
    plan: 'guest',
  });

  // Fetch full user profile
  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoadingProfile(false);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const emailToFetch = session.user.email || '';
      setName(session.user.name || '');
      setEmail(emailToFetch);
      const currentPlan = ((session.user as any)?.plan || 'free') as 'free' | 'pro' | 'enterprise';
      setUserPlan(currentPlan);
      setUserId((session.user as any)?.id || useridParam || 'usr_' + Date.now().toString(36));
      setUsageStats(getUsageStats(true, currentPlan));

      // Fetch live record from MongoDB
      fetch(`/api/auth/profile?email=${encodeURIComponent(emailToFetch)}&userId=${encodeURIComponent(useridParam)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setName(data.user.name || session.user?.name || '');
            setEmail(data.user.email || emailToFetch);
            setDob(data.user.dob || '');
            setOccupation(data.user.occupation || '');
            setUserPlan(data.user.plan || currentPlan);
            setProvider(data.user.provider || 'credentials');
            setUserId(data.user.id || useridParam);
            setUpdatedAt(data.user.updatedAt || new Date().toISOString());
            setUsageStats(getUsageStats(true, data.user.plan || currentPlan));
          }
        })
        .catch((err) => console.warn('Could not load extra user details:', err))
        .finally(() => setLoadingProfile(false));
    }
  }, [status, session, useridParam]);

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          dob,
          occupation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfileSuccessMsg('Profile information updated and saved to database successfully!');
      if (updateSession) {
        try {
          await updateSession({ name, dob, occupation });
        } catch {}
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // 1. Loading state
  if (status === 'loading' || (status === 'authenticated' && loadingProfile)) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] text-black font-mono flex flex-col items-center justify-center p-4">
        <div className="border-4 border-black bg-white p-8 max-w-md w-full shadow-[8px_8px_0px_#000000] text-center space-y-4">
          <div className="w-12 h-12 border-2 border-black bg-[#ccff00] text-black mx-auto flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base font-black uppercase">AUTHENTICATING CREDENTIAL TOKEN...</h2>
          <p className="text-xs text-zinc-600 font-bold">
            Verifying account identity and loading subscription provisioner profile...
          </p>
        </div>
      </div>
    );
  }

  // 2. Prevent access if user is NOT logged in
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] text-black font-mono flex flex-col justify-between">
        <header className="border-b-4 border-black bg-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xs uppercase hover:bg-black hover:text-[#ccff00] px-3.5 py-2 border-2 border-black transition-colors shadow-[2px_2px_0px_#000000]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO GENERATOR</span>
            </Link>
            <span className="text-xs font-black bg-rose-100 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#000000]">
              ACCESS RESTRICTED
            </span>
          </div>
        </header>

        <main className="max-w-xl mx-auto w-full px-4 py-16 flex-1 flex flex-col items-center justify-center">
          <div className="border-4 border-black bg-white p-8 sm:p-10 shadow-[10px_10px_0px_#000000] space-y-6 text-center w-full">
            <div className="w-16 h-16 border-4 border-black bg-rose-500 text-white mx-auto flex items-center justify-center shadow-[4px_4px_0px_#000000]">
              <Lock className="w-8 h-8 text-black" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                AUTHENTICATION REQUIRED // ACCESS DENIED
              </h1>
              <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium leading-relaxed">
                You must be authenticated to view this user profile, account settings, and active subscription credentials.
              </p>
            </div>

            <div className="border-2 border-black bg-zinc-50 p-3 text-xs text-zinc-600 font-bold uppercase">
              PROTECTED ROUTE: <span className="text-black font-black">/[userid]</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto px-6 py-3 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000] cursor-pointer"
              >
                SIGN IN / REGISTER TO ACCESS
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-3 border-2 border-black bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000]"
              >
                RETURN HOME
              </Link>
            </div>
          </div>
        </main>

        <footer className="border-t-2 border-black bg-white py-4 px-4 text-xs text-center text-zinc-600">
          Nedject // Industrial Optical Matrix • Secure User Protection
        </footer>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  // 3. User is logged in -> Render full profile and info!
  const isAdmin =
    session.user.email?.toLowerCase().includes('neerajrekwar') ||
    session.user.email?.toLowerCase().includes('admin');

  const planConfig = NEDJECT_PLANS[userPlan] || NEDJECT_PLANS.free;

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black flex flex-col">
      {/* 1. TOP HEADER / BREADCRUMBS */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xs uppercase hover:bg-black hover:text-[#ccff00] px-3 py-1.5 border-2 border-black transition-colors shadow-[2px_2px_0px_#000000]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO STUDIO</span>
            </Link>
            <Link
              href="/payment"
              className="hidden sm:flex items-center gap-1.5 font-black text-xs uppercase bg-[#ccff00] hover:bg-black hover:text-[#ccff00] px-3 py-1.5 border-2 border-black transition-colors shadow-[2px_2px_0px_#000000]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPGRADE / PLANS</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 font-black text-xs uppercase bg-black text-[#ccff00] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                <span>ADMIN CONSOLE</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-[#fafaf5] px-3 py-1 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <span className="w-2.5 h-2.5 bg-emerald-500 border border-black inline-block" />
              <span>LOGGED IN: {email}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border-2 border-black bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-900 px-3 py-1.5 text-xs font-black uppercase transition-colors shadow-[2px_2px_0px_#000000] flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN USER DASHBOARD */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        {/* HERO USER IDENTIFICATION CARD */}
        <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 border-4 border-black bg-[#ccff00] text-black flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_#000000] shrink-0">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                    {name || 'USER PROFILE MATRIX'}
                  </h1>
                  <span className="bg-black text-[#ccff00] text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                    {isAdmin ? 'ADMINISTRATOR' : 'VERIFIED ACCOUNT'}
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-mono font-bold flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{email}</span>
                  <span className="text-zinc-300">|</span>
                  <span className="text-zinc-500 uppercase">PROVIDER: {provider}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/payment"
                className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>CHANGE PLAN</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black text-zinc-500 uppercase block">USER / ACCOUNT ID</span>
              <span className="font-black text-black truncate block mt-0.5 text-xs" title={userId}>
                {userId}
              </span>
            </div>
            <div className="border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black text-zinc-500 uppercase block">SUBSCRIPTION PLAN</span>
              <span className="font-black text-emerald-700 uppercase block mt-0.5">
                {userPlan.toUpperCase()}
              </span>
            </div>
            <div className="border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black text-zinc-500 uppercase block">GENERATIONS QUOTA</span>
              <span className="font-black text-black block mt-0.5">
                {userPlan === 'pro' || userPlan === 'enterprise' ? 'UNLIMITED' : `${usageStats.used} / ${usageStats.limit}`}
              </span>
            </div>
            <div className="border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black text-zinc-500 uppercase block">SECURITY PROTOCOL</span>
              <span className="font-black text-black block mt-0.5 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-BIT ENCRYPTED
              </span>
            </div>
          </div>
        </div>

        {/* 3. ADMIN SUBSCRIPTION PROVISIONER CALLOUT BOX (EXACT USER REQUIREMENT) */}
        <div className="border-4 border-black bg-[#f4fde8] p-6 shadow-[8px_8px_0px_#000000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black bg-black text-[#ccff00] flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-[#ccff00] px-2 py-0.5 border border-black inline-block mb-1 shadow-[1px_1px_0px_#000000]">
                  SYSTEM PROVISIONING CONFIRMATION
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase text-black tracking-tight">
                  admin subscription provisioner set all plan bases have set
                </h2>
              </div>
            </div>
            <div className="bg-black text-[#ccff00] border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
              STATUS: PROVISIONED &amp; ACTIVE
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-800 font-sans leading-relaxed">
            The core engine has initialized all baseline entitlements for this account under the unified Nedject subscription specification. All optical calibration layers, barcode symbologies, and high-DPI export channels have been verified by the administrator provisioner.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-black">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>300 &amp; 600 DPI VECTOR EXPORT</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Hardware-calibrated physical print pass with 11,811 PPM pHYs chunks.
              </p>
            </div>
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-black">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ALL 8 BARCODE SYMBOLOGIES</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Code 128, EAN-13, ITF-14, Pharmacode, and industrial checksum validation.
              </p>
            </div>
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-black">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>EVENT PASS &amp; BATCH ZIP</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Bulk generation engine with automated numbering and packaging.
              </p>
            </div>
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-black">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>PROMO &amp; COUPON ENGINE</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Admin coupon matrix with real-time discount calculation and free promos.
              </p>
            </div>
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-black">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ZERO WATERMARKS</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Pristine commercial print outputs for commercial branding and packaging.
              </p>
            </div>
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-black">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>MONGODB PERSISTENCE</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Permanent multi-device history, template presets, and profile sync.
              </p>
            </div>
          </div>
        </div>

        {/* 4. EDITABLE PROFILE DETAILS FORM */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-black" />
              <h3 className="text-sm font-black uppercase text-black">
                ACCOUNT ATTRIBUTES &amp; IDENTITY
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-bold">
              STORED SECURELY IN MONGODB
            </span>
          </div>

          {profileSuccessMsg && (
            <div className="border-2 border-black bg-emerald-50 text-emerald-950 p-3 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="border-2 border-black bg-rose-50 text-rose-950 p-3 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  FULL DISPLAY NAME:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neeraj Rekwar"
                  className="w-full px-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  EMAIL ADDRESS (PRIMARY ID):
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border-2 border-black bg-zinc-100 text-zinc-500 font-mono text-xs font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  DATE OF BIRTH (ATHLETE LOG):
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  OCCUPATION / ENGINEERING ROLE:
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Print Engineer, Software Architect"
                  className="w-full px-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-[11px] text-zinc-500 font-bold">
                Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : 'Just now'}
              </span>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SAVING PROFILE...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>SAVE PROFILE CHANGES</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 5. QUICK ACTIONS & STUDIO TOOLS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="border-4 border-black bg-white p-5 hover:bg-[#ccff00] transition-colors shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <QrCode className="w-6 h-6 text-black" />
              <span className="text-[10px] font-black bg-black text-[#ccff00] px-1.5 py-0.5">300 DPI</span>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase text-black">PHOTO QR STUDIO</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Launch calibrated high-DPI generator with custom frames and Chinese corner trails.
              </p>
            </div>
          </Link>

          <Link
            href="/barcode-pick"
            className="border-4 border-black bg-white p-5 hover:bg-[#ccff00] transition-colors shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <BarcodeIcon className="w-6 h-6 text-black" />
              <span className="text-[10px] font-black bg-black text-[#ccff00] px-1.5 py-0.5">8 FORMATS</span>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase text-black">BARCODE PICK</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Generate Code 128, EAN, ITF-14, and Pharmacode with high precision.
              </p>
            </div>
          </Link>

          <Link
            href="/payment"
            className="border-4 border-black bg-[#f4fde8] p-5 hover:bg-[#ccff00] transition-colors shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <CreditCard className="w-6 h-6 text-black" />
              <span className="text-[10px] font-black bg-black text-[#ccff00] px-1.5 py-0.5">UPGRADE</span>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase text-black">SUBSCRIPTION &amp; PLANS</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Manage your Pro plan, redeem coupon codes, or activate 100% free passes.
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* 6. FOOTER */}
      <footer className="border-t-2 border-black bg-white py-4 px-4 font-mono text-xs text-center text-zinc-600">
        Nedject // Developed by neerajrekwar • Industrial Optical Matrix &amp; User Profile Engine
      </footer>
    </div>
  );
}
