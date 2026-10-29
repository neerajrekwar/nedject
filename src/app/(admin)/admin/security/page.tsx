'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Terminal,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  updatedAt: string;
  isPrimary?: boolean;
  hashPreview?: string;
}

export default function AdminSecurityPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New admin form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Super Admin');
  const [showPassword, setShowPassword] = useState(false);

  // Edit password state
  const [editAdminEmail, setEditAdminEmail] = useState<string | null>(null);
  const [updatePassword, setUpdatePassword] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmins(data.admins || []);
      }
    } catch (e: any) {
      showNotify('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      showNotify('error', 'Email and password are required');
      return;
    }
    if (newPassword.length < 6) {
      showNotify('error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName || 'Admin Operator',
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ ${data.message}`);
        setNewEmail('');
        setNewPassword('');
        setNewName('');
        fetchAdmins();
      } else {
        showNotify('error', data.error || 'Failed to create admin');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const handleUpdatePassword = async (email: string) => {
    if (!updatePassword || updatePassword.length < 6) {
      showNotify('error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: updatePassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ Password updated for ${email}`);
        setEditAdminEmail(null);
        setUpdatePassword('');
        fetchAdmins();
      } else {
        showNotify('error', data.error || 'Failed to update password');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (!window.confirm(`Permanently delete admin account "${email}"?`)) return;

    try {
      const res = await fetch(`/api/admin/admins?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ ${data.message}`);
        fetchAdmins();
      } else {
        showNotify('error', data.error || 'Failed to delete admin');
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const primaryAdmin = admins[0] || null;

  return (
    <div className="space-y-8 font-mono">
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURITY, PBKDF2 &amp; TERMINAL CLI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Admin Credentials &amp; Terminal CLI
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-0.5 max-w-xl">
            Cryptographic authentication registry. All credentials use PBKDF2-SHA512 (100,000 rounds) with per-user cryptographic salts and sync simultaneously with MongoDB and local terminal store.
          </p>
        </div>

        <button
          onClick={fetchAdmins}
          className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold uppercase flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 border-2 text-xs font-bold flex items-center gap-2 shadow-[4px_4px_0px_#000000] ${
            notification.type === 'success'
              ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
              : 'border-rose-600 bg-rose-50 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 2. SECURITY SPECIFICATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">HASHING ALGORITHM</div>
          <div className="text-lg font-black text-black">PBKDF2-SHA512</div>
          <div className="text-[11px] text-zinc-600">100,000 iterations &bull; 512-bit key</div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">SALT ENTROPY</div>
          <div className="text-lg font-black text-black">128-Bit Random</div>
          <div className="text-[11px] text-zinc-600">CSPRNG crypto.randomBytes(16)</div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">SESSION COOKIE POLICY</div>
          <div className="text-lg font-black text-black">HttpOnly &bull; Lax</div>
          <div className="text-[11px] text-zinc-600">7-Day MaxAge &bull; SameSite</div>
        </div>
      </div>

      {/* 3. TERMINAL CLI RUNNER CHEATSHEET */}
      <div className="border-2 border-black bg-[#0a0d14] text-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-[#ccff00] font-black text-xs uppercase">
            <Terminal className="w-4 h-4" />
            <span>Interactive Terminal Commands (1-Click Copy)</span>
          </div>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 font-bold">
            NPX &bull; STANDALONE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Verify Command */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="text-zinc-400 text-[11px] font-bold">1. Verify Admin Password:</div>
            <pre className="text-emerald-400 overflow-x-auto text-[11px] select-all">
              {`npx verify --email "${primaryAdmin?.email || 'neerajrekwar817@gmail.com'}" --password "YourStrongPassword"`}
            </pre>
            <button
              onClick={() =>
                copyToClipboard(
                  `npx verify --email "${primaryAdmin?.email || 'neerajrekwar817@gmail.com'}" --password "YourStrongPassword"`,
                  'verify'
                )
              }
              className="mt-1 px-2.5 py-1 bg-black text-[#ccff00] border border-zinc-700 hover:border-[#ccff00] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'verify' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd === 'verify' ? 'COPIED!' : 'Copy Verify Command'}</span>
            </button>
          </div>

          {/* Seed Command */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="text-zinc-400 text-[11px] font-bold">2. Seed Default Credentials:</div>
            <pre className="text-blue-400 overflow-x-auto text-[11px] select-all">
              {`npx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"`}
            </pre>
            <button
              onClick={() =>
                copyToClipboard(
                  `npx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"`,
                  'seed'
                )
              }
              className="mt-1 px-2.5 py-1 bg-black text-[#ccff00] border border-zinc-700 hover:border-[#ccff00] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'seed' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd === 'seed' ? 'COPIED!' : 'Copy Seed Command'}</span>
            </button>
          </div>

          {/* Create Command */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="text-zinc-400 text-[11px] font-bold">3. Create New Admin Account:</div>
            <pre className="text-yellow-400 overflow-x-auto text-[11px] select-all">
              {`npx admin-auth create --email "operator@nedject.com" --password "SecretPass123" --role "Lead Engineer"`}
            </pre>
            <button
              onClick={() =>
                copyToClipboard(
                  `npx admin-auth create --email "operator@nedject.com" --password "SecretPass123" --role "Lead Engineer"`,
                  'create'
                )
              }
              className="mt-1 px-2.5 py-1 bg-black text-[#ccff00] border border-zinc-700 hover:border-[#ccff00] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'create' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd === 'create' ? 'COPIED!' : 'Copy Create Command'}</span>
            </button>
          </div>

          {/* List All Command */}
          <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="text-zinc-400 text-[11px] font-bold">4. List All Configured Admins:</div>
            <pre className="text-purple-400 overflow-x-auto text-[11px] select-all">
              {`npx admin-auth all`}
            </pre>
            <button
              onClick={() => copyToClipboard(`npx admin-auth all`, 'all')}
              className="mt-1 px-2.5 py-1 bg-black text-[#ccff00] border border-zinc-700 hover:border-[#ccff00] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedCmd === 'all' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd === 'all' ? 'COPIED!' : 'Copy List Command'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CURRENT ACTIVE ADMINS TABLE & CREATE FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT: ADMINS TABLE */}
        <div className="lg:col-span-2 border-2 border-black bg-white shadow-[6px_6px_0px_#000000] p-6 space-y-4">
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Configured Admin Accounts ({admins.length})</span>
            </div>
          </div>

          <div className="space-y-3">
            {admins.map((admin, idx) => (
              <div
                key={admin.email}
                className="p-4 border-2 border-black bg-[#fbfbfa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-black">{admin.name}</span>
                    <span
                      className={`px-1.5 py-0.2 border text-[9px] font-bold uppercase ${
                        admin.isPrimary || idx === 0
                          ? 'bg-[#ccff00] border-black text-black'
                          : 'bg-zinc-200 border-zinc-400 text-zinc-700'
                      }`}
                    >
                      {admin.role}
                    </span>
                    {(admin.isPrimary || idx === 0) && (
                      <span className="text-[9px] font-bold text-emerald-700 uppercase">[PRIMARY]</span>
                    )}
                  </div>
                  <div className="text-zinc-600 font-mono mt-0.5">{admin.email}</div>
                  {admin.hashPreview && (
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Hash: [PBKDF2] {admin.hashPreview}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {editAdminEmail === admin.email ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="password"
                        placeholder="New Password (min 6)"
                        value={updatePassword}
                        onChange={(e) => setUpdatePassword(e.target.value)}
                        className="border border-black p-1 text-xs w-40"
                      />
                      <button
                        onClick={() => handleUpdatePassword(admin.email)}
                        className="px-2 py-1 bg-black text-[#ccff00] font-bold text-[10px]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditAdminEmail(null);
                          setUpdatePassword('');
                        }}
                        className="px-2 py-1 bg-zinc-200 text-zinc-700 font-bold text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditAdminEmail(admin.email)}
                        className="px-2.5 py-1 border border-black bg-white hover:bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase"
                      >
                        Change Pass
                      </button>
                      {admins.length > 1 && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.email)}
                          className="p-1 border border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: CREATE NEW ADMIN FORM */}
        <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] p-6 space-y-4">
          <div className="border-b-2 border-black pb-3">
            <div className="text-xs font-black uppercase text-black flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Create New Admin</span>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border-2 border-black p-2 bg-[#fbfbfa] focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Display Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Neeraj Rekwar"
                className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Access Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border border-black p-2 bg-[#fbfbfa] focus:outline-none"
              >
                <option value="Super Admin">Super Admin (Full Root Permissions)</option>
                <option value="Lead Engineer">Lead Engineer (Engineering Telemetry)</option>
                <option value="Editor">Editor (Notion Publications Only)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Initial Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full border-2 border-black p-2 bg-[#fbfbfa] focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Create Admin Account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
