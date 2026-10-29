'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';

export default function BlogManageRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the dedicated Admin Blog Management interface
    const timer = setTimeout(() => {
      router.replace('/admin/blog');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono flex items-center justify-center p-4">
      <div className="max-w-md w-full border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] text-center space-y-5">
        <div className="w-12 h-12 border-2 border-black bg-[#ccff00] text-black mx-auto flex items-center justify-center font-black shadow-[2px_2px_0px_#000000]">
          <BookOpen className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight">
            ADMIN BLOG MANAGEMENT
          </h1>
          <p className="text-xs text-zinc-600 font-bold uppercase leading-relaxed">
            Blog publication management has been centralized inside the protected Admin Console (/admin/blog).
          </p>
        </div>

        <div className="border-2 border-black bg-zinc-50 p-3 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-black" />
          <span className="font-bold">Redirecting to Admin Blog Manager...</span>
        </div>

        <div className="pt-2">
          <Link
            href="/admin/blog"
            className="w-full py-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] transition-all cursor-pointer"
          >
            <span>OPEN ADMIN BLOG CONSOLE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="text-[10px] text-zinc-500 font-bold flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Restricted to Authorized Admin Staff</span>
        </div>
      </div>
    </div>
  );
}
