'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  Download,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';

interface GenerationItem {
  _id: string;
  id: string;
  title: string;
  content: string;
  format: string;
  contrast: number;
  timestamp: number;
  dateFormatted: string;
  userEmail: string;
  clientIp?: string;
  isPublicOrGuest: boolean;
  options: any;
}

export default function AdminGenerationsPage() {
  const [items, setItems] = useState<GenerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GenerationItem | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (formatFilter !== 'all') params.set('format', formatFilter);

      const res = await fetch(`/api/admin/generations?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items || []);
      }
    } catch (e: any) {
      showNotify('error', 'Failed to fetch generation records: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, [formatFilter]);

  const showNotify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = async (item: GenerationItem) => {
    if (!window.confirm(`Delete generation record "${item.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/generations?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', '✓ Record removed from MongoDB');
        fetchGenerations();
        if (selectedItem?.id === item.id) setSelectedItem(null);
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const handlePurgeGuest = async () => {
    if (!window.confirm('Delete all guest/public generation history records? Authenticated user records will be preserved.')) return;

    try {
      const res = await fetch('/api/admin/generations?purgeGuest=true', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotify('success', `✓ ${data.message}`);
        fetchGenerations();
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* 1. TOP HEADER */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>STUDIO GENERATIONS AUDIT LOG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Optical Generation Ledger
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-0.5 max-w-xl">
            Real-time forensic inspection log for 300 DPI Photo QRs, GS1 Barcodes, and device mockups created across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchGenerations}
            className="px-3 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={handlePurgeGuest}
            className="px-4 py-2 border-2 border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
          >
            Purge Guest Logs
          </button>
        </div>
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

      {/* 2. SEARCH & FORMAT FILTERS BAR */}
      <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchGenerations();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by payload text, email, IP, or title..."
              className="w-full border-2 border-black pl-9 pr-3 py-2 text-xs bg-[#fbfbfa] focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] text-xs font-black uppercase cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Filter Format:</span>
          {(['all', 'PNG', 'PDF', 'SVG', 'Barcode'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={`px-2.5 py-1.5 border border-black font-bold uppercase transition-all ${
                formatFilter === fmt
                  ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-black'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GENERATIONS TABLE */}
      <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-zinc-500">
            Querying qr_history collection...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-black uppercase text-black">0 Generation Records Found</div>
            <p className="text-xs text-zinc-500 font-sans">
              No QR codes match the current filter. Generations made on the public studio appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="border-b-2 border-black bg-zinc-100 font-bold text-zinc-700 uppercase">
                <tr>
                  <th className="p-3.5">Payload / Title</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Contrast</th>
                  <th className="p-3.5">User / Origin</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-black truncate">{item.title}</div>
                      <div className="text-[11px] text-zinc-500 truncate font-mono">
                        {item.content || item.options?.text}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 border border-black bg-zinc-100 text-[10px] font-black uppercase">
                        {item.format}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-zinc-800">
                      {item.contrast}:1
                    </td>

                    <td className="p-3.5">
                      <div className="text-zinc-700 truncate max-w-[140px]">
                        {item.userEmail !== 'guest' ? (
                          <span className="font-bold text-blue-700">{item.userEmail}</span>
                        ) : (
                          <span className="text-zinc-500">Guest</span>
                        )}
                      </div>
                      {item.clientIp && (
                        <div className="text-[10px] text-zinc-400 font-mono">{item.clientIp}</div>
                      )}
                    </td>

                    <td className="p-3.5 text-zinc-500 text-[11px]">
                      {item.dateFormatted}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-2 py-1 border border-black bg-white hover:bg-black hover:text-[#ccff00] font-bold text-[10px] uppercase cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 border border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL FOR INSPECTING ITEM DETAILS */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-[8px_8px_0px_#000000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="text-xs font-black uppercase flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Forensic Optical Inspection: {selectedItem.title}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-zinc-100 border border-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-zinc-600 uppercase block mb-1">Encoded Content:</span>
                <pre className="p-3 bg-zinc-100 border border-black font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {selectedItem.content || selectedItem.options?.text}
                </pre>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2 border border-black bg-zinc-50">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Format</span>
                  <span className="font-black text-black">{selectedItem.format}</span>
                </div>
                <div className="p-2 border border-black bg-zinc-50">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Contrast Ratio</span>
                  <span className="font-black text-black">{selectedItem.contrast}:1</span>
                </div>
                <div className="p-2 border border-black bg-zinc-50">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Author / User</span>
                  <span className="font-black text-black truncate block">{selectedItem.userEmail}</span>
                </div>
                <div className="p-2 border border-black bg-zinc-50">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">IP Address</span>
                  <span className="font-black text-black font-mono">{selectedItem.clientIp || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-zinc-600 uppercase block mb-1">Raw Generation Matrix Options:</span>
                <pre className="p-3 bg-zinc-900 text-[#ccff00] border border-black font-mono text-[11px] max-h-48 overflow-y-auto">
                  {JSON.stringify(selectedItem.options, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border-2 border-black bg-black text-[#ccff00] font-bold uppercase text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
