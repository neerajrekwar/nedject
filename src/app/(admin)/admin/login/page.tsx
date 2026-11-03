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
} from 'lucide-react';
import { authenticateAdmin, fetchAdminRateLimitStatus } from '@/lib/admin-auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError(null);
    setIsLoading(true);

    const result = await authenticateAdmin(email, password);

    if (result.success) {
      const destination =
        callbackUrl && callbackUrl.startsWith('/admin') ? callbackUrl : '/admin/dashboard';
      router.push(destination);
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
          <span>NOINDEX ACTIVE</span>
        </div>
      </div>

      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#ccff00] text-black space-y-6">
        {/* Header */}
        <div className="space-y-2 border-b-2 border-black pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-[11px] border border-black uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>Terminal Console</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-[#ccff00] font-black text-[10px] border border-black uppercase tracking-wider">
              <span>3 TRIES / HR LIMIT</span>
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Admin Login
          </h1>
          <p className="text-xs text-zinc-600 font-sans">
            Enter the authorized admin credentials configured via terminal CLI.
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full border-2 border-black p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa] disabled:bg-zinc-200 disabled:cursor-not-allowed"
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
              className="w-full border-2 border-black p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa] disabled:bg-zinc-200 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`w-full py-3 px-4 border-2 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors cursor-pointer ${
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
                ? 'AUTHENTICATING...'
                : 'SIGN IN WITH CREDENTIALS'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Terminal Info Note */}
        <div className="pt-2 border-t border-zinc-200 text-[11px] text-zinc-500 font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-black font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Credentials managed via terminal CLI:</span>
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
