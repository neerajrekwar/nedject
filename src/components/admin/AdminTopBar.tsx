'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  Plus,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AdminUser } from '@/lib/admin-auth';

interface AdminTopBarProps {
  user: AdminUser | null;
  onToggleSidebar: () => void;
}

export function AdminTopBar({ user, onToggleSidebar }: AdminTopBarProps) {
  const pathname = usePathname();

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname.includes('/blog/new')) return ['Admin', 'Blog Management', 'Create New Post'];
    if (pathname.includes('/blog/edit')) return ['Admin', 'Blog Management', 'Edit Post'];
    if (pathname.includes('/blog')) return ['Admin', 'Blog Management', 'All Articles'];
    if (pathname.includes('/analytics')) return ['Admin', 'Analytics & Revenue', 'Telemetry'];
    if (pathname.includes('/users')) return ['Admin', 'User Accounts', 'Access Tiers'];
    if (pathname.includes('/generations')) return ['Admin', 'Studio Audit', 'Generation Ledger'];
    if (pathname.includes('/security')) return ['Admin', 'Security & Auth', 'Terminal CLI'];
    if (pathname.includes('/settings')) return ['Admin', 'System Health', 'Feature Flags'];
    if (pathname.includes('/seed')) return ['Admin', 'Database', 'CRUD & Seeder'];
    return ['Admin Console', 'Executive Dashboard', 'Overview'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b-2 border-black px-4 sm:px-6 flex items-center justify-between font-mono">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 border border-black bg-zinc-100 hover:bg-zinc-200 text-black"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? 'font-black text-black uppercase'
                    : 'text-zinc-500 hidden sm:inline'
                }
              >
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && (
                <span className="text-zinc-400 hidden sm:inline">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center: System Status Pill (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-black text-[11px]">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span className="font-bold text-zinc-700">STATUS:</span>
        <span className="font-black text-black">SYS_NOMINAL (VERCEL EDGE)</span>
        <span className="text-zinc-400">&bull;</span>
        <span className="text-emerald-700 font-bold">OAUTH READY</span>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/admin/blog/new"
          className="px-3 py-1.5 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Post</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="p-1.5 border border-black bg-white hover:bg-zinc-100 text-black text-xs flex items-center gap-1"
          title="Open Public Website"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
