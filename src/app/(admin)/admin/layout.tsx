'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { getAdminSession, AdminUser } from '@/lib/admin-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const checkAuth = () => {
      const session = getAdminSession();
      setAdminUser(session);
      setIsCheckingAuth(false);

      if (!session && !isLoginPage) {
        router.push('/admin/login');
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('nedject_admin_auth_changed', handleAuthChange);
    return () => window.removeEventListener('nedject_admin_auth_changed', handleAuthChange);
  }, [pathname, isLoginPage, router]);

  // If on login page, render full-screen standalone login without sidebar/topbar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col justify-center items-center p-4 font-mono selection:bg-[#ccff00] selection:text-black">
        {children}
      </div>
    );
  }

  // Prevent flash while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center font-mono text-xs text-zinc-600">
        <div className="flex items-center gap-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000]">
          <span className="w-2.5 h-2.5 bg-[#ccff00] border border-black inline-block animate-spin" />
          <span className="font-bold">VERIFYING ADMIN CONSOLE AUTHORIZATION...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex">
      {/* 1. FIXED ADMIN SIDEBAR */}
      <AdminSidebar
        user={adminUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* 2. MAIN ADMIN CONTENT CONTAINER ALIGNED WITH SIDEBAR */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <AdminTopBar
          user={adminUser}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
