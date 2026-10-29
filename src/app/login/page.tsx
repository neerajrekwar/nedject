'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Lock,
  Mail,
  User,
  Calendar,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  QrCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const callbackUrl = searchParams?.get('callbackUrl') || searchParams?.get('redirect') || '/payment';
  const planParam = searchParams?.get('plan');
  const isFromPayment = callbackUrl.includes('/payment');

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [name, setName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [dob, setDob] = useState('');
  const [occupation, setOccupation] = useState('');

  // Forgot Password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  // If already authenticated, redirect immediately to intended destination
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  // Display OAuth error if passed from NextAuth URL
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      if (errorParam === 'OAuthAccountNotLinked') {
        setError('This email is already associated with another login provider. Please sign in with your password.');
      } else if (errorParam === 'CredentialsSignin') {
        setError('Invalid email or password credentials. Please verify your details.');
      } else {
        setError(`Authentication error: ${errorParam}`);
      }
    }
  }, [searchParams]);

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const destination = callbackUrl.startsWith('http')
        ? callbackUrl
        : `${window.location.origin}${callbackUrl}`;
      await signIn('google', { callbackUrl: destination });
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google authentication.');
      setLoading(false);
    }
  };

  // Handle Credentials Sign In
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!signInEmail || !signInPassword) {
      setError('Please provide both your email address and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: signInEmail.trim().toLowerCase(),
        password: signInPassword,
        callbackUrl,
      });

      if (!res?.ok) {
        throw new Error(res?.error || 'Invalid email or password. Please verify your credentials.');
      }

      setSuccessMessage('Authentication verified! Redirecting to your destination...');
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle User Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!signUpEmail || !signUpPassword) {
      setError('Email and password are required to register.');
      setLoading(false);
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Athlete User',
          email: signUpEmail.trim().toLowerCase(),
          password: signUpPassword,
          dob: dob.trim(),
          occupation: occupation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create your account.');
      }

      // Automatically sign in upon registration
      const signinRes = await signIn('credentials', {
        redirect: false,
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        callbackUrl,
      });

      if (!signinRes?.ok) {
        setSuccessMessage('Account registered! Please sign in with your new password.');
        setTab('signin');
        setSignInEmail(signUpEmail);
        setLoading(false);
        return;
      }

      setSuccessMessage('Account created and authenticated! Redirecting to payment...');
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
      setLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!forgotEmail) {
      setError('Please provide your account email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send password reset link.');
      }

      setForgotSent(true);
      setSuccessMessage('Password reset link has been generated.');
      if (data?.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* CARD CONTAINER */}
      <div className="border-4 border-black bg-white shadow-[10px_10px_0px_#000000] p-6 sm:p-8 space-y-6">
        
        {/* BRAND & HEADER BANNER */}
        <div className="space-y-3 text-center border-b-2 border-black pb-5">
          <div className="inline-flex items-center gap-2 bg-black text-[#ccff00] px-3 py-1 border-2 border-black font-black text-xs sm:text-sm tracking-tight shadow-[2px_2px_0px_#000000]">
            <QrCode className="w-4 h-4 text-[#ccff00]" />
            <span>Nedject // genQRstudio</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight">
            {tab === 'signin'
              ? 'ACCOUNT LOGIN'
              : tab === 'signup'
              ? 'CREATE ACCOUNT'
              : 'RESET PASSWORD'}
          </h1>

          {/* Intended Payment / Upgrade Notice */}
          {isFromPayment && (
            <div className="bg-[#ccff00] text-black border-2 border-black px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                SIGN IN TO ACTIVATE YOUR {planParam ? planParam.toUpperCase() : 'PRO'} UPGRADE
              </span>
            </div>
          )}

          <p className="text-[11px] text-zinc-600 font-bold uppercase">
            {tab === 'signin'
              ? 'Sign in to access your quota, saved matrices, and subscription passes'
              : tab === 'signup'
              ? 'Register with your name, date of birth, and occupation'
              : 'Enter your email to receive a secure password reset link'}
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="grid grid-cols-2 border-2 border-black bg-zinc-100 shadow-[3px_3px_0px_#000000]">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
              tab === 'signin'
                ? 'bg-black text-[#ccff00]'
                : 'text-black hover:bg-zinc-200'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider transition-colors border-l-2 border-black cursor-pointer ${
              tab === 'signup'
                ? 'bg-black text-[#ccff00]'
                : 'text-black hover:bg-zinc-200'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
          <div className="border-2 border-black bg-rose-50 text-rose-950 p-3 text-xs font-bold flex items-start gap-2 shadow-[2px_2px_0px_#000000]">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="border-2 border-black bg-emerald-50 text-emerald-950 p-3 text-xs font-bold flex items-start gap-2 shadow-[2px_2px_0px_#000000]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{successMessage}</span>
          </div>
        )}

        {/* GOOGLE ONE-CLICK AUTH */}
        {tab !== 'forgot' && (
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 border-2 border-black bg-white hover:bg-[#ccff00] text-black font-black text-xs uppercase flex items-center justify-center gap-2.5 transition-all shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t-2 border-black w-full" />
              <span className="bg-white px-2 text-[10px] font-black uppercase text-zinc-500 absolute">
                OR SIGN IN WITH EMAIL
              </span>
            </div>
          </div>
        )}

        {/* TAB 1: SIGN IN FORM */}
        {tab === 'signin' && (
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-zinc-700 block">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="athlete@studio.com"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase text-zinc-700 block">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[10px] font-black uppercase text-zinc-600 hover:text-black underline cursor-pointer"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs sm:text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN TO ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-zinc-700 block">
                FULL NAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Miller"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-zinc-700 block">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-zinc-700 block">
                PASSWORD (MIN 6 CHARS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-700 block">
                  DATE OF BIRTH
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-700 block">
                  OCCUPATION
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Designer / Athlete"
                    className="w-full pl-8 pr-2 py-1.5 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-2 border-black bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00] font-black text-xs sm:text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>CREATING ACCOUNT...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT &amp; PROCEED</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: FORGOT PASSWORD FORM */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-zinc-700 block">
                ENTER ACCOUNT EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="athlete@studio.com"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            {devResetUrl && (
              <div className="p-3 border-2 border-black bg-[#ccff00]/20 text-xs font-mono space-y-1">
                <span className="font-black text-black block">DIRECT RESET LINK:</span>
                <Link
                  href={devResetUrl}
                  className="text-blue-700 underline break-all font-bold block"
                >
                  {devResetUrl}
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'SENDING LINK...' : 'SEND RESET LINK'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className="w-full py-2 border border-black text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase transition-colors"
            >
              BACK TO SIGN IN
            </button>
          </form>
        )}

        {/* BOTTOM UTILITY LINKS */}
        <div className="pt-3 border-t-2 border-black/20 flex flex-wrap items-center justify-between text-[11px] font-bold text-zinc-600 gap-2">
          <Link
            href={callbackUrl}
            className="flex items-center gap-1 hover:text-black underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN WITHOUT SIGNING IN</span>
          </Link>

          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-BIT ENCRYPTED</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] text-black font-mono flex items-center justify-center p-4 sm:p-6 selection:bg-[#ccff00] selection:text-black">
      <Suspense
        fallback={
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000000] text-center space-y-3 font-mono">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-black" />
            <span className="text-xs font-black uppercase tracking-wider block">
              LOADING AUTHENTICATION MODULE...
            </span>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </main>
  );
}
