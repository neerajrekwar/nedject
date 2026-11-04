'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Terminal,
  KeyRound,
  ShieldAlert,
  Clock,
  ShieldCheck,
  Mail,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  authenticateAdmin,
  verifyAdminCode,
  resendAdminCode,
  fetchAdminRateLimitStatus,
} from '@/lib/admin-auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [simulatedDevCode, setSimulatedDevCode] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [retryAfterMinutes, setRetryAfterMinutes] = useState<number | null>(null);

  // Check rate limit status on mount
  useEffect(() => {
    let isMounted = true;
    fetchAdminRateLimitStatus().then((status) => {
      if (!isMounted || !status) return;
      if (status.isLocked) {
        setIsLocked(true);
        setRemainingAttempts(0);
        setRetryAfterMinutes(status.retryAfterMinutes);
        setError(
          `Rate limit exceeded: 3 attempts used in the last hour. Console access locked for ${status.retryAfterMinutes} min.`
        );
      } else {
        setRemainingAttempts(status.remainingAttempts);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cooldown timer for resending 6-digit code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Submit email & password
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = await authenticateAdmin(email.trim().toLowerCase(), password);

    if (result.success) {
      if (result.requireVerification) {
        // Transition to Step 2: 6-digit email code
        setIsLoading(false);
        setStep('verify');
        setVerifyEmail(result.email || email.trim().toLowerCase());
        setResendCooldown(30);
        setSuccessMessage(
          result.message || '6-digit confirmation code dispatched to your admin email.'
        );
        if (result.devCode) {
          setSimulatedDevCode(result.devCode);
        }
      } else {
        // Direct authentication fallback
        const destination =
          callbackUrl && callbackUrl.startsWith('/admin') ? callbackUrl : '/admin/dashboard';
        router.push(destination);
      }
    } else {
      setIsLoading(false);
      setError(result.error || 'Authentication failed. Check credentials set in terminal.');

      if (result.isLocked) {
        setIsLocked(true);
        setRemainingAttempts(0);
        setRetryAfterMinutes(result.retryAfterMinutes ?? 60);
      } else if (typeof result.remainingAttempts === 'number') {
        setRemainingAttempts(result.remainingAttempts);
        if (result.remainingAttempts === 0) {
          setIsLocked(true);
        }
      }
    }
  };

  // Step 2: Verify 6-digit code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const cleanCode = verifyCode.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = await verifyAdminCode(verifyEmail, cleanCode);

    if (result.success) {
      setSuccessMessage('Verification confirmed! Entering admin console...');
      const destination =
        callbackUrl && callbackUrl.startsWith('/admin') ? callbackUrl : '/admin/dashboard';
      setTimeout(() => {
        router.push(destination);
      }, 400);
    } else {
      setIsLoading(false);
      setError(result.error || 'Invalid or expired verification code.');

      if (result.isLocked) {
        setIsLocked(true);
        setRemainingAttempts(0);
        setRetryAfterMinutes(result.retryAfterMinutes ?? 60);
      } else if (typeof result.remainingAttempts === 'number') {
        setRemainingAttempts(result.remainingAttempts);
        if (result.remainingAttempts === 0) {
          setIsLocked(true);
        }
      }
    }
  };

  // Resend 6-digit code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending || isLocked) return;
    setIsResending(true);
    setError(null);

    const result = await resendAdminCode(verifyEmail);
    setIsResending(false);

    if (result.success) {
      setResendCooldown(30);
      setSuccessMessage(
        result.message || `A fresh 6-digit verification code has been dispatched to ${verifyEmail}.`
      );
      if (result.devCode) {
        setSimulatedDevCode(result.devCode);
      }
    } else {
      setError(result.error || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="w-full max-w-md font-mono">
      {/* Return link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-[#ccff00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Studio</span>
        </Link>

        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-[10px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>2-STEP AUTH ACTIVE</span>
        </div>
      </div>

      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#ccff00] text-black space-y-6">
        {/* Header */}
        <div className="space-y-2 border-b-2 border-black pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-[11px] border border-black uppercase">
              {step === 'credentials' ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{step === 'credentials' ? 'Terminal Console' : 'Step 2: 2FA Verification'}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-[#ccff00] font-black text-[10px] border border-black uppercase tracking-wider">
              <span>3 TRIES / HR LIMIT</span>
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            {step === 'credentials' ? 'Admin Login' : 'Verify Email Code'}
          </h1>
          <p className="text-xs text-zinc-600 font-sans">
            {step === 'credentials'
              ? 'Enter authorized admin credentials configured via terminal CLI.'
              : `Enter the 6-digit confirmation code dispatched to ${verifyEmail}.`}
          </p>
        </div>

        {/* Rate limit status bar */}
        <div className="p-2.5 border-2 border-black bg-[#f5f5f0] text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isLocked ? (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold text-black uppercase">
              {isLocked ? 'Console Locked' : 'Rate Limiter:'}
            </span>
          </div>
          <div>
            {isLocked ? (
              <span className="font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 border border-rose-400">
                LOCKED (0/3 LEFT)
              </span>
            ) : (
              <span className="font-bold text-zinc-800">
                {remainingAttempts !== null ? `${remainingAttempts}/3 attempts left` : '3 attempts / hour'}
              </span>
            )}
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div className="p-3.5 border-2 border-black bg-rose-50 text-rose-900 text-xs space-y-2 shadow-[3px_3px_0px_#dc2626]">
            <div className="flex items-center gap-2 font-black uppercase text-rose-900">
              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Security Lockout Triggered</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Maximum 3 failed login attempts exceeded in the past 60 minutes.
              {retryAfterMinutes ? ` Please wait approximately ${retryAfterMinutes} minutes before retrying.` : ' Access is temporarily suspended.'}
            </p>
            <div className="pt-1 text-[10px] text-rose-700 font-mono">
              Terminal admins can reset lock: <code className="font-bold">npx admin-auth unblock</code>
            </div>
          </div>
        )}

        {/* Success Message Banner */}
        {successMessage && !isLocked && (
          <div className="p-3 border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2 shadow-[2px_2px_0px_#059669]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* General Error Display */}
        {error && !isLocked && (
          <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-800 text-xs flex items-start gap-2 shadow-[2px_2px_0px_#e11d48]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="space-y-1">
              <span className="font-bold block">{error}</span>
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <span className="text-[11px] text-rose-700 block">
                  Warning: {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining this hour before lockout.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dev Mode Simulated Code Banner */}
        {simulatedDevCode && step === 'verify' && (
          <div className="p-3 border-2 border-dashed border-black bg-yellow-50 text-yellow-900 text-xs font-mono space-y-1">
            <div className="font-bold flex items-center gap-1.5 uppercase text-[10px]">
              <Terminal className="w-3 h-3" />
              <span>Terminal / Simulated Code (SMTP not set):</span>
            </div>
            <div className="text-lg font-black tracking-widest text-black">
              {simulatedDevCode}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* VIEW 1: CREDENTIALS FORM (EMAIL & PASSWORD)                  */}
        {/* ============================================================= */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isLocked}
                placeholder="admin@example.com"
                className="w-full border-2 border-black p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa] disabled:bg-zinc-200 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000]"
                autoFocus={!isLocked}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isLocked}
                placeholder="••••••••••••"
                className="w-full border-2 border-black p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa] disabled:bg-zinc-200 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className={`w-full py-3 px-4 border-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isLocked
                  ? 'bg-zinc-300 text-zinc-600 border-zinc-400 cursor-not-allowed shadow-none'
                  : 'bg-black text-[#ccff00] hover:bg-zinc-800 disabled:opacity-50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {isLocked
                  ? 'CONSOLE LOCKED (3/3 USED)'
                  : isLoading
                  ? 'VERIFYING CREDENTIALS...'
                  : 'PROCEED TO 2FA VERIFICATION'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ============================================================= */}
        {/* VIEW 2: 6-DIGIT EMAIL VERIFICATION CODE FORM                */}
        {/* ============================================================= */}
        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="bg-zinc-50 border-2 border-black p-3 text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase text-zinc-500">
                Verification Dispatched To:
              </div>
              <div className="font-black text-black text-xs flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>{verifyEmail}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase text-black">
                  6-Digit Verification Code
                </label>
                <span className="text-[10px] font-mono font-bold text-zinc-500">
                  Valid for 15 mins
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                required
                disabled={isLoading || isLocked}
                placeholder="123456"
                className="w-full border-2 border-black p-3 text-center text-xl font-black font-mono tracking-[0.4em] text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa] disabled:bg-zinc-200 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000]"
                autoFocus
              />
            </div>

            {/* Resend Code Button & Countdown */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex items-center gap-1 font-bold text-zinc-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Email / Password</span>
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResending || isLocked}
                className="inline-flex items-center gap-1 font-black text-black hover:underline disabled:text-zinc-400 disabled:no-underline"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : isResending
                    ? 'Resending...'
                    : 'Resend Code'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked || verifyCode.trim().length !== 6}
              className={`w-full py-3 px-4 border-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isLocked || verifyCode.trim().length !== 6
                  ? 'bg-zinc-300 text-zinc-600 border-zinc-400 cursor-not-allowed shadow-none'
                  : 'bg-black text-[#ccff00] hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
              <span>
                {isLoading ? 'CONFIRMING 6-DIGIT CODE...' : 'VERIFY CODE & ENTER CONSOLE'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Terminal Info Note */}
        <div className="pt-2 border-t border-zinc-200 text-[11px] text-zinc-500 font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-black font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Console Credentials & 2FA Security:</span>
          </div>
          <code className="block bg-zinc-100 p-1.5 border border-zinc-300 text-[10px] text-zinc-800">
            node scripts/admin-auth.mjs set --email ... --password ...
          </code>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 border-2 border-black bg-white font-mono text-xs font-bold">
          INITIALIZING SECURE ADMIN CONSOLE...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
