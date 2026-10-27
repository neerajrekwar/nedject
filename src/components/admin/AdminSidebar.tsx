'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  BarChart3,
  Database,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Flame,
  Zap,
  Sliders,
  Terminal,
  Activity,
  Ticket,
} from 'lucide-react';
import { clearAdminSession, AdminUser } from '@/lib/admin-auth';

interface AdminSidebarProps {
  user: AdminUser | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ user, isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  const navSections = [
    {
      group: 'CORE OPERATIONS',
      items: [
        {
          title: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          badge: 'LIVE',
          activeMatch: (p: string) => p === '/admin' || p === '/admin/dashboard' || p === '/admin/adm',
        },
        {
          title: 'User Accounts',
          href: '/admin/users',
          icon: Users,
          badge: 'TIERS',
          activeMatch: (p: string) => p === '/admin/users',
        },
        {
          title: 'Coupon Codes',
          href: '/admin/coupons',
          icon: Ticket,
          badge: 'PROMO',
          activeMatch: (p: string) => p.startsWith('/admin/coupons'),
        },
        {
          title: 'Studio Audit Log',
          href: '/admin/generations',
          icon: QrCode,
          badge: 'FEED',
          activeMatch: (p: string) => p === '/admin/generations',
        },
      ],
    },
    {
      group: 'PUBLICATIONS & CMS',
      items: [
        {
          title: 'Blog Manager',
          href: '/admin/blog',
          icon: FileText,
          activeMatch: (p: string) => p === '/admin/blog',
        },
        {
          title: 'Write New Post',
          href: '/admin/blog/new',
          icon: PenSquare,
          badge: 'NOTION',
          activeMatch: (p: string) => p === '/admin/blog/new',
        },
      ],
    },
    {
      group: 'SYSTEM & SECURITY',
      items: [
        {
          title: 'Analytics & Metrics',
          href: '/admin/analytics',
          icon: BarChart3,
          activeMatch: (p: string) => p.includes('analytics'),
        },
        {
          title: 'Database & Seeder',
          href: '/admin/seed',
          icon: Database,
          badge: 'CRUD',
          activeMatch: (p: string) => p === '/admin/seed',
        },
        {
          title: 'Security & Terminal CLI',
          href: '/admin/security',
          icon: ShieldCheck,
          badge: 'PBKDF2',
          activeMatch: (p: string) => p === '/admin/security',
        },
        {
          title: 'System Diagnostics',
          href: '/admin/settings',
          icon: Settings,
          badge: 'FLAGS',
          activeMatch: (p: string) => p === '/admin/settings',
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0d14] text-white border-r-2 border-black flex flex-col justify-between font-mono transition-transform duration-200 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* 1. BRAND HEADER */}
      <div>
        <div className="h-16 border-b-2 border-black px-4 flex items-center justify-between bg-black">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 border-2 border-black bg-[#ccff00] text-black font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_#ffffff]">
              N
            </div>
            <div>
              <div className="text-xs font-black tracking-widest text-white uppercase">
                NEDJECT // ADM
              </div>
              <div className="text-[10px] text-[#ccff00] font-bold">
                ENTERPRISE CONSOLE
              </div>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-zinc-400 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. NAVIGATION LINKS */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section) => (
            <div key={section.group}>
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 px-2">
                {section.group}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.activeMatch(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#ffffff] font-black'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1 py-0.2 border ${
                            isActive
                              ? 'bg-black text-[#ccff00] border-black'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Quick Studio Links */}
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 px-2">
              PUBLIC PORTALS
            </div>
            <div className="space-y-1">
              <Link
                href="/blog"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Public Blog</span>
                </div>
                <ExternalLink className="w-3 h-3 text-zinc-600" />
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Studio Home</span>
                </div>
                <ExternalLink className="w-3 h-3 text-zinc-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ADMIN PROFILE & LOGOUT FOOTER */}
      <div className="p-4 border-t-2 border-black bg-black space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#ccff00] bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-xs text-white">NR</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-white truncate">
              {user?.name || 'Neeraj Rekwar'}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {user?.email || 'neerajrekwar817@gmail.com'}
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>SUPER ADMIN ACTIVE</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-1.5 px-3 border border-zinc-700 bg-zinc-900 hover:bg-rose-950 hover:border-rose-600 hover:text-rose-400 text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Log Out</span>
        </button>
      </div>
    </aside>
  );
}
