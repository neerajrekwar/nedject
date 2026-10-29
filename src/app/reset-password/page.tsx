'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Home,
  KeyRound,
} from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [userName, setUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [verifying, setVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetCompleted, setResetCompleted] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setIsTokenValid(false);
      setTokenError('No reset token was provided in the URL.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setIsTokenValid(true);
          if (data.email) setEmail(data.email);
          if (data.name) setUserName(data.name);
        } else {
          setIsTokenValid(false);
          setTokenError(data.error || 'Reset link is invalid or expired.');
        }
      } catch (err: any) {
        setIsTokenValid(false);
        setTokenError('Failed to verify token with server.');
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetCompleted(true);

      // Attempt automatic sign in
      if (email) {
        await signIn('credentials', {
          redirect: false,
          email,
          password: newPassword,
        });
      }

      // Redirect after 2.5s
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while resetting password.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-[#ccff00] selection:text-black">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xl font-black uppercase tracking-wider text-[#ccff00] hover:underline"
          >
            <span className="w-4 h-4 bg-[#ccff00] border-2 border-black inline-block" />
            NEDJECT STUDIO
          </Link>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            ACCOUNT CREDENTIAL RECOVERY &amp; SECURITY
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#fcfcf9] text-black border-4 border-black p-6 shadow-[10px_10px_0px_#ccff00] font-mono relative">
          
          {/* 1. Loading State */}
          {verifying && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-black" />
              <p className="text-sm font-bold uppercase tracking-wider">
                Verifying Security Reset Token...
              </p>
            </div>
          )}

          {/* 2. Invalid Token State */}
          {!verifying && !isTokenValid && !resetCompleted && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-600 border-b-2 border-black pb-3">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h2 className="text-base font-black uppercase">LINK EXPIRED OR INVALID</h2>
              </div>

              <div className="bg-rose-50 border-2 border-rose-500 p-3 text-xs text-rose-800 font-bold space-y-1">
                <p>{tokenError || 'This password reset link is invalid, incomplete, or has expired after 1 hour.'}</p>
                <p className="text-[11px] text-zinc-600">For security reasons, password reset tokens are single-use and time-bound.</p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/"
                  className="w-full py-2.5 px-4 bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-all cursor-pointer block text-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>REQUEST NEW RESET LINK</span>
                </Link>

                <Link
                  href="/"
                  className="w-full py-2 px-4 bg-white text-black hover:bg-zinc-100 font-bold text-xs uppercase border-2 border-black flex items-center justify-center gap-2 transition-all cursor-pointer block text-center"
                >
                  <Home className="w-4 h-4" />
                  <span>BACK TO HOME</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. Successful Reset State */}
          {!verifying && resetCompleted && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-14 h-14 bg-[#ccff00] border-3 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_#000000]">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>

              <div>
                <h2 className="text-lg font-black uppercase">PASSWORD RESET COMPLETE!</h2>
                <p className="text-xs text-zinc-600 font-bold mt-1">
                  Your new credentials have been safely encrypted and saved.
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-600 p-3 text-xs font-bold text-emerald-800">
                Logging you into your account and redirecting to Nedject Studio...
              </div>

              <Link
                href="/"
                className="w-full py-3 bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-all cursor-pointer block"
              >
                <span>ENTER STUDIO NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 4. Active Reset Form */}
          {!verifying && isTokenValid && !resetCompleted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b-2 border-black pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-black" />
                  <h2 className="text-base font-black uppercase">SET NEW PASSWORD</h2>
                </div>
                {email && (
                  <p className="text-xs text-zinc-600 font-bold mt-1 truncate">
                    ACCOUNT: <span className="text-black underline">{email}</span>
                    {userName ? ` (${userName})` : ''}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="bg-rose-50 border-2 border-rose-600 p-2.5 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-black mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    NEW PASSWORD
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-zinc-500 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                  </button>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full p-2.5 border-2 border-black bg-white font-mono text-xs font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-black mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full p-2.5 border-2 border-black bg-white font-mono text-xs font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>

              {/* Password Match / Strength helper */}
              <div className="text-[11px] space-y-1 bg-zinc-100 p-2 border border-black">
                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                  <span>Minimum 6 characters</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      newPassword && newPassword === confirmPassword
                        ? 'bg-emerald-500'
                        : 'bg-zinc-400'
                    }`}
                  />
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ENCRYPTING &amp; SAVING...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>SAVE NEW PASSWORD &amp; SIGN IN</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer links */}
        <div className="mt-4 text-center text-xs text-zinc-500 font-mono">
          <span>Remember your credentials? </span>
          <Link href="/" className="font-bold underline text-[#ccff00] hover:text-white">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex items-center justify-center font-mono">
          <div className="text-center space-y-2">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#ccff00]" />
            <p className="text-xs uppercase font-bold">Loading security portal...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
