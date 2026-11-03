'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6 bg-[#f5f5f0] text-black font-mono">
      <div className="max-w-lg w-full bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000000] text-center">
        <div className="w-12 h-12 bg-black text-[#ccff00] border-2 border-black mx-auto mb-4 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
          RECOVERABLE ERROR CAUGHT
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
          Something went wrong
        </h2>

        <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
          {error?.message || 'A transient application state error occurred. You can reload this view safely.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>TRY AGAIN</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-100 text-black font-bold text-xs border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
