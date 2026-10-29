'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Sparkles,
  Calendar,
  X,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import QRCode from 'qrcode';
import { PurchaseRecord } from '@/lib/purchases';

interface OrderHistoryTableProps {
  userEmail: string;
  userId?: string;
  activePlan?: string;
}

export const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({
  userEmail,
  userId,
  activePlan = 'free',
}) => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'active'>('all');

  // Invoice Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseRecord | null>(null);
  const [invoiceQrUrl, setInvoiceQrUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch purchases from /api/user/purchases
  const fetchPurchases = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const url = `/api/user/purchases?email=${encodeURIComponent(userEmail)}${
        userId ? `&userId=${encodeURIComponent(userId)}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch purchase records.');
      }

      setPurchases(data.purchases || []);
    } catch (err: any) {
      console.error('[OrderHistoryTable] Error loading purchases:', err);
      setError(err?.message || 'Unable to connect to purchases repository.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchPurchases();
    }
  }, [userEmail, userId]);

  // Generate QR code whenever selected invoice changes
  useEffect(() => {
    if (!selectedInvoice) {
      setInvoiceQrUrl('');
      return;
    }

    const verificationPayload = JSON.stringify({
      invoiceId: selectedInvoice.invoiceId,
      user: selectedInvoice.userEmail,
      amount: selectedInvoice.amountFormatted,
      plan: selectedInvoice.planName,
      date: selectedInvoice.date,
      status: selectedInvoice.status,
      hash: `NEDJECT-VERIFIED-${selectedInvoice.id}`,
    });

    QRCode.toDataURL(verificationPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setInvoiceQrUrl(url))
      .catch((e) => console.warn('QR generation notice:', e));
  }, [selectedInvoice]);

  // Handle copy invoice ID
  const handleCopy = (idText: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(idText);
      setCopiedId(idText);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchesSearch =
        item.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.gateway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.paymentId && item.paymentId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'paid'
          ? item.status.toLowerCase() === 'paid'
          : item.status.toLowerCase() === 'active';

      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  // Calculations for quick metrics
  const totalSpent = useMemo(() => {
    return purchases.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [purchases]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
      {/* 1. SECTION TITLE & METRICS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-black text-[#ccff00] font-black text-[10px] uppercase tracking-wider font-mono">
            <Receipt className="w-3.5 h-3.5" />
            <span>FINANCIAL REPOSITORY // MONGODB PURCHASES COLLECTION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>ORDER HISTORY &amp; INVOICES</span>
            <span className="text-xs bg-zinc-100 border border-black px-2 py-0.5 font-bold text-zinc-800">
              {purchases.length} RECORD{purchases.length === 1 ? '' : 'S'}
            </span>
          </h2>
          <p className="text-xs text-zinc-600 font-sans font-medium">
            Official repository of all previous subscription payments, promo pass redemptions, and downloadable tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchPurchases(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50 transition-all"
            title="Reload from MongoDB purchases collection"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'SYNCING...' : 'REFRESH'}</span>
          </button>

          <Link
            href="/payment"
            className="px-4 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] text-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLORE PLANS</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border-2 border-black bg-[#fbfbfa] p-3 shadow-[2px_2px_0px_#000000]">
          <span className="text-[10px] font-black text-zinc-500 uppercase block">TOTAL ORDERS</span>
          <span className="text-lg font-black text-black block mt-0.5 font-mono">
            {purchases.length}
          </span>
        </div>

        <div className="border-2 border-black bg-[#fbfbfa] p-3 shadow-[2px_2px_0px_#000000]">
          <span className="text-[10px] font-black text-zinc-500 uppercase block">TOTAL EXPENDITURE</span>
          <span className="text-lg font-black text-emerald-700 block mt-0.5 font-mono">
            ${totalSpent.toFixed(2)}
          </span>
        </div>

        <div className="border-2 border-black bg-[#fbfbfa] p-3 shadow-[2px_2px_0px_#000000]">
          <span className="text-[10px] font-black text-zinc-500 uppercase block">ACTIVE SUBSCRIPTION</span>
          <span className="text-xs font-black text-black uppercase block mt-1">
            {activePlan.toUpperCase()} TIER
          </span>
        </div>

        <div className="border-2 border-black bg-[#fbfbfa] p-3 shadow-[2px_2px_0px_#000000]">
          <span className="text-[10px] font-black text-zinc-500 uppercase block">TAX COMPLIANCE</span>
          <span className="text-xs font-black text-emerald-800 uppercase block mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            INVOICES VALID
          </span>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, plan, or gateway..."
            className="w-full pl-9 pr-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-zinc-600 hidden sm:inline">STATUS:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
              statusFilter === 'all'
                ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            ALL ({purchases.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
              statusFilter === 'paid'
                ? 'bg-black text-[#ccff00] shadow-[2px_2px_0px_#000000]'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            PAID
          </button>
        </div>
      </div>

      {/* 4. ERROR NOTICE */}
      {error && (
        <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-900 text-xs font-bold flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchPurchases(true)}
            className="px-2 py-1 bg-rose-900 text-white text-[10px] uppercase font-black"
          >
            RETRY
          </button>
        </div>
      )}

      {/* 5. TABLE / EMPTY STATE / LOADING */}
      {loading ? (
        <div className="border-2 border-black bg-zinc-50 p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-black" />
          <div className="text-xs font-black uppercase tracking-wider">
            QUERYING MONGODB PURCHASES COLLECTION...
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            Loading previous transactions, subscription intervals, and generated invoices.
          </p>
        </div>
      ) : purchases.length === 0 ? (
        /* EMPTY STATE */
        <div className="border-2 border-dashed border-black bg-[#fbfbfa] p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 border-2 border-black bg-[#ccff00] text-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000000]">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black uppercase tracking-tight text-black">
              NO PREVIOUS PURCHASES OR INVOICES FOUND
            </h3>
            <p className="text-xs text-zinc-600 font-sans font-medium leading-relaxed">
              You are currently utilizing the <strong>Free Tier</strong> baseline. Any upgraded subscription passes (Pro or Enterprise) or coupon upgrades will automatically generate official tax invoices stored permanently here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/payment"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000000] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>UPGRADE SUBSCRIPTION NOW</span>
            </Link>
          </div>
        </div>
      ) : filteredPurchases.length === 0 ? (
        /* NO FILTER MATCHES */
        <div className="border-2 border-black bg-zinc-50 p-8 text-center space-y-2">
          <Search className="w-6 h-6 mx-auto text-zinc-400" />
          <p className="text-xs font-black uppercase">NO ORDERS MATCHED YOUR QUERY</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-xs underline font-bold text-black cursor-pointer"
          >
            Clear Search &amp; Filters
          </button>
        </div>
      ) : (
        /* DATA TABLE */
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000000]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black text-[#ccff00] font-black uppercase border-b-2 border-black">
                <th className="p-3 border-r border-zinc-800">INVOICE ID</th>
                <th className="p-3 border-r border-zinc-800">DATE &amp; TIME</th>
                <th className="p-3 border-r border-zinc-800">SUBSCRIPTION / PLAN</th>
                <th className="p-3 border-r border-zinc-800">GATEWAY</th>
                <th className="p-3 border-r border-zinc-800">AMOUNT</th>
                <th className="p-3 border-r border-zinc-800">STATUS</th>
                <th className="p-3 text-right">INVOICE ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black bg-white font-mono">
              {filteredPurchases.map((purchase) => {
                const isPaid = purchase.status.toLowerCase() === 'paid';
                const formattedDate = new Date(purchase.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                const formattedTime = new Date(purchase.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={purchase.id || purchase.invoiceId}
                    className="hover:bg-[#fbfbe8] transition-colors"
                  >
                    {/* Invoice ID */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-black bg-[#ccff00] px-1.5 py-0.5 border border-black text-[11px]">
                          {purchase.invoiceId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(purchase.invoiceId)}
                          className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                          title="Copy Invoice ID"
                        >
                          {copiedId === purchase.invoiceId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap">
                      <div className="font-bold text-black">{formattedDate}</div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formattedTime}</span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap">
                      <div className="font-black text-black uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 border border-black inline-block" />
                        <span>{purchase.planName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
                        INTERVAL: {purchase.billingCycle.toUpperCase()}
                        {purchase.couponCode && (
                          <span className="ml-2 text-emerald-700 bg-emerald-100 px-1 border border-emerald-300">
                            PROMO: {purchase.couponCode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gateway */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap">
                      <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-zinc-600" />
                        <span>{purchase.gateway}</span>
                      </div>
                      {purchase.paymentId && (
                        <div
                          className="text-[10px] text-zinc-400 truncate max-w-[120px]"
                          title={purchase.paymentId}
                        >
                          TX: {purchase.paymentId}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap">
                      <span className="font-black text-xs px-2 py-0.5 bg-black text-[#ccff00] border border-black inline-block">
                        {purchase.amountFormatted}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPaid ? 'bg-emerald-600' : 'bg-zinc-500'
                          }`}
                        />
                        <span>{purchase.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(purchase)}
                          className="px-2.5 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-[#ccff00] text-black text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>VIEW INVOICE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoice(purchase);
                            setTimeout(() => handlePrint(), 250);
                          }}
                          className="p-1.5 border-2 border-black bg-zinc-100 hover:bg-[#ccff00] text-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all"
                          title="Print or Save PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. INTERACTIVE INVOICE MODAL & PRINTABLE DOCUMENT */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-fade-in backdrop-blur-sm print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="relative w-full max-w-2xl bg-white border-4 border-black p-6 sm:p-8 shadow-[12px_12px_0px_#ccff00] print:border-none print:shadow-none print:p-0 text-black font-mono space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Controls (Hidden in print) */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4 print:hidden">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ccff00] text-black font-black text-xs border border-black uppercase">
                <Receipt className="w-4 h-4" />
                <span>OFFICIAL TAX INVOICE &amp; RECEIPT</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 border-2 border-black bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-900 shadow-[2px_2px_0px_#000000] cursor-pointer"
                  title="Close Invoice Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* INVOICE CONTENT (What gets printed / saved) */}
            <div className="space-y-6 bg-white p-2" id="printable-invoice">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-4 border-black pb-6">
                <div>
                  <div className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#ccff00] border-2 border-black inline-block" />
                    <span>NEDJECT SYSTEMS</span>
                  </div>
                  <div className="text-[11px] text-zinc-600 font-bold uppercase mt-1">
                    Industrial Optical Matrix &amp; High-DPI Calibration Lab
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    Operated by neerajrekwar • GST/Tax Reg: IND-OPT-2026-NDJ
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="inline-block border-2 border-black bg-[#ccff00] px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
                    TAX INVOICE
                  </div>
                  <div className="text-xs font-black text-black">
                    INVOICE #: <span className="font-mono">{selectedInvoice.invoiceId}</span>
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    DATE: {new Date(selectedInvoice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Billed To / Billed By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-black bg-zinc-50 p-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 block">
                    BILLED TO (SUBSCRIBER):
                  </span>
                  <div className="text-sm font-black text-black uppercase">
                    {selectedInvoice.userName || userEmail}
                  </div>
                  <div className="text-xs text-zinc-700 font-bold">{selectedInvoice.userEmail}</div>
                  {selectedInvoice.userId && (
                    <div className="text-[10px] text-zinc-500">ID: {selectedInvoice.userId}</div>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-black uppercase text-zinc-500 block">
                    PAYMENT &amp; GATEWAY DETAILS:
                  </span>
                  <div className="text-xs font-bold text-black uppercase">
                    GATEWAY: {selectedInvoice.gateway}
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    PAYMENT ID: {selectedInvoice.paymentId || 'AUTHORIZED'}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-black uppercase flex sm:justify-end items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                    <span>STATUS: {selectedInvoice.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border-2 border-black overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black text-[#ccff00] font-black uppercase">
                      <th className="p-2.5 border-r border-zinc-800">ITEM DESCRIPTION</th>
                      <th className="p-2.5 border-r border-zinc-800 text-center w-16">QTY</th>
                      <th className="p-2.5 border-r border-zinc-800 text-right w-24">RATE</th>
                      <th className="p-2.5 text-right w-28">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-black font-mono">
                    {(selectedInvoice.items && selectedInvoice.items.length > 0
                      ? selectedInvoice.items
                      : [
                          {
                            description: `${selectedInvoice.planName} — Full 300 & 600 DPI Studio Access`,
                            quantity: 1,
                            unitPrice: selectedInvoice.amount,
                            total: selectedInvoice.amount,
                          },
                        ]
                    ).map((item, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-2.5 border-r-2 border-black font-bold">
                          {item.description}
                          <div className="text-[10px] text-zinc-500 font-normal">
                            Period: {selectedInvoice.billingCycle.toUpperCase()} • Hardware calibration matrix included
                          </div>
                        </td>
                        <td className="p-2.5 border-r-2 border-black text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="p-2.5 border-r-2 border-black text-right font-bold">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right font-black text-black">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & QR Verification Barcode */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t-2 border-black pt-4">
                <div className="flex items-center gap-3">
                  {invoiceQrUrl && (
                    <div className="border-2 border-black p-1 bg-white shadow-[2px_2px_0px_#000000]">
                      <img
                        src={invoiceQrUrl}
                        alt="Invoice Verification Matrix"
                        className="w-20 h-20"
                      />
                    </div>
                  )}
                  <div className="space-y-0.5 text-[10px] text-zinc-600 font-mono">
                    <div className="font-black text-black uppercase">AUTHENTICITY MATRIX</div>
                    <div>Scan with smartphone camera to verify cryptographic signature.</div>
                    <div className="text-emerald-700 font-bold uppercase">DIGITALLY SEALED &amp; SIGNED</div>
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs text-right">
                  <div className="flex justify-between text-zinc-600 font-bold">
                    <span>SUBTOTAL:</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 font-bold">
                    <span>ESTIMATED TAX (0%):</span>
                    <span>$0.00</span>
                  </div>
                  {selectedInvoice.couponCode && (
                    <div className="flex justify-between text-emerald-700 font-black">
                      <span>PROMO REDEEMED:</span>
                      <span>{selectedInvoice.couponCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-black pt-1.5 text-sm font-black text-black">
                    <span>TOTAL AMOUNT PAID:</span>
                    <span className="bg-[#ccff00] px-2 py-0.5 border border-black">
                      {selectedInvoice.amountFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="border-t border-zinc-200 pt-3 text-[10px] text-zinc-500 text-center font-sans">
                Thank you for powering your high-precision optical barcode and physical print passes with Nedject. This is a computer-generated tax invoice that requires no physical signature.
              </div>
            </div>

            {/* Bottom Modal Actions (Hidden in Print) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black print:hidden">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase cursor-pointer"
              >
                CLOSE
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT / DOWNLOAD PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
