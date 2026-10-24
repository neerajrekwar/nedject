'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Terminal,
  KeyRound,
} from 'lucide-react';
import { authenticateAdmin } from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await authenticateAdmin(email, password);
    if (result.success) {
      router.push('/admin/dashboard');
    } else {
      setError(result.error || 'Authentication failed. Check credentials set in terminal.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md font-mono">
      {/* Return link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-[#ccff00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Studio</span>
        </Link>
      </div>

      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#ccff00] text-black space-y-6">
        {/* Header */}
        <div className="space-y-2 border-b-2 border-black pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-[11px] border border-black uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Terminal-Authenticated Console</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Admin Login
          </h1>
          <p className="text-xs text-zinc-600 font-sans">
            Enter the admin credentials configured via terminal CLI.
          </p>
        </div>

        {error && (
          <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
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
              placeholder="admin@example.com"
              className="w-full border-2 border-black p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa]"
              autoFocus
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
              placeholder="••••••••••••"
              className="w-full border-2 border-black p-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#ccff00] bg-[#fbfbfa]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] transition-colors cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'AUTHENTICATING...' : 'SIGN IN WITH CREDENTIALS'}</span>
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
