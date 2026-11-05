'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wifi,
  Radio,
  FileText,
  Link as LinkIcon,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  ShieldCheck,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
  Smartphone,
  ExternalLink,
  Edit,
} from 'lucide-react';

interface StoredNfcRecord {
  id: string;
  title: string;
  recordType: 'url' | 'text' | 'vcard' | 'custom';
  payload: string;
  tagType: string;
  createdAt: string;
  byteSize: number;
}

export default function NfcBatPage() {
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scan Results Log
  const [scannedLogs, setScannedLogs] = useState<
    Array<{
      timestamp: string;
      serialNumber?: string;
      records: Array<{ recordType: string; mediaType?: string; data: string }>;
    }>
  >([]);

  // Write Form States
  const [formType, setFormType] = useState<'url' | 'text' | 'vcard' | 'custom'>('url');
  const [formTitle, setFormTitle] = useState<string>('My Digital Badge');
  const [formUrl, setFormUrl] = useState<string>('https://nedject.com');
  const [formText, setFormText] = useState<string>('Nedject Authorized Pass');
  const [vcardName, setVcardName] = useState<string>('Alex Rivera');
  const [vcardEmail, setVcardEmail] = useState<string>('alex@example.com');
  const [vcardPhone, setVcardPhone] = useState<string>('+1 (555) 019-2834');
  const [customJson, setCustomJson] = useState<string>('{\n  "service": "nedject_pass",\n  "version": 1\n}');

  // Stored Local Records (CRUD)
  const [savedRecords, setSavedRecords] = useState<StoredNfcRecord[]>([]);

  // Check Web NFC Browser Compatibility on Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsNfcSupported(true);
      setStatusMessage('Web NFC API is available on this browser/hardware.');
    } else {
      setIsNfcSupported(false);
      setStatusMessage(
        'Web NFC requires Chromium on an NFC-enabled Android device. Interactive simulation & NDEF encoder are active.'
      );
    }

    // Load saved tag library from localStorage
    try {
      const stored = localStorage.getItem('nedject_nfc_saved_tags_v1');
      if (stored) {
        setSavedRecords(JSON.parse(stored));
      } else {
        // Seed default educational sample tags
        const initialSeeds: StoredNfcRecord[] = [
          {
            id: 'nfc_seed_1',
            title: 'Digital Business Card (vCard)',
            recordType: 'vcard',
            payload: 'BEGIN:VCARD\nVERSION:3.0\nFN:Alex Rivera\nEMAIL:alex@nedject.com\nTEL:+15550192834\nEND:VCARD',
            tagType: 'NFC Forum Type 2 (NTAG213)',
            createdAt: new Date().toLocaleDateString(),
            byteSize: 94,
          },
          {
            id: 'nfc_seed_2',
            title: 'Secure Event Pass Web Link',
            recordType: 'url',
            payload: 'https://nedject.com/fitness-glass/winter-arc-2026',
            tagType: 'NFC Forum Type 4',
            createdAt: new Date().toLocaleDateString(),
            byteSize: 48,
          },
        ];
        setSavedRecords(initialSeeds);
        localStorage.setItem('nedject_nfc_saved_tags_v1', JSON.stringify(initialSeeds));
      }
    } catch {}
  }, []);

  // Save records helper
  const persistRecords = (list: StoredNfcRecord[]) => {
    setSavedRecords(list);
    try {
      localStorage.setItem('nedject_nfc_saved_tags_v1', JSON.stringify(list));
    } catch {}
  };

  // 1. Live Web NFC Scan Handler
  const handleStartScan = async () => {
    setErrorMessage('');
    if (!('NDEFReader' in window)) {
      setErrorMessage(
        'Web NFC hardware scanning requires Chrome on Android with NFC enabled. Use the simulator below to test NDEF decoding.'
      );
      return;
    }

    try {
      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();
      setIsScanning(true);
      setStatusMessage('Ready! Hold your unencrypted NFC tag near your device antenna...');

      await ndef.scan();

      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber || 'N/A';
        const parsedRecords: Array<{ recordType: string; mediaType?: string; data: string }> = [];

        for (const record of event.message.records) {
          let textDecoder = new TextDecoder(record.encoding || 'utf-8');
          let decodedString = '';

          try {
            if (record.recordType === 'text') {
              decodedString = textDecoder.decode(record.data);
            } else if (record.recordType === 'url') {
              decodedString = textDecoder.decode(record.data);
            } else {
              decodedString = textDecoder.decode(record.data);
            }
          } catch {
            decodedString = '[Binary Payload]';
          }

          parsedRecords.push({
            recordType: record.recordType,
            mediaType: record.mediaType,
            data: decodedString,
          });
        }

        setScannedLogs((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            serialNumber,
            records: parsedRecords,
          },
          ...prev,
        ]);

        setStatusMessage(`Tag read successfully! Serial: ${serialNumber}`);
      };

      ndef.onreadingerror = () => {
        setErrorMessage('Cannot read standard NDEF data from this tag.');
      };
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err.message || 'Error starting Web NFC scanner');
    }
  };

  // 2. Live Web NFC Write Handler
  const handleWriteTag = async () => {
    setErrorMessage('');
    const currentPayload = getCurrentPayloadString();

    if (!('NDEFReader' in window)) {
      // In non-supported browsers, save record to library
      handleSaveToLibrary();
      setStatusMessage('Payload formatted & saved to library (Web NFC hardware unavailable on this platform).');
      return;
    }

    try {
      setIsWriting(true);
      setStatusMessage('Approaching antenna... Hold an NFC tag close to write payload.');

      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();

      let writeRecord: any;
      if (formType === 'url') {
        writeRecord = { recordType: 'url', data: formUrl };
      } else if (formType === 'text') {
        writeRecord = { recordType: 'text', data: formText };
      } else {
        writeRecord = { recordType: 'mime', mediaType: 'text/vcard', data: currentPayload };
      }

      await ndef.write({ records: [writeRecord] });

      setIsWriting(false);
      setStatusMessage('Tag successfully written with NDEF record!');
      handleSaveToLibrary();
    } catch (err: any) {
      setIsWriting(false);
      setErrorMessage(err.message || 'Failed writing to tag. Tag may be write-protected or read-only.');
    }
  };

  // Helper to compile current form payload
  const getCurrentPayloadString = (): string => {
    if (formType === 'url') return formUrl;
    if (formType === 'text') return formText;
    if (formType === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nEMAIL:${vcardEmail}\nTEL:${vcardPhone}\nEND:VCARD`;
    }
    return customJson;
  };

  // 3. Save to Library (CRUD - Create)
  const handleSaveToLibrary = () => {
    const payload = getCurrentPayloadString();
    const newRecord: StoredNfcRecord = {
      id: `nfc_${Date.now()}`,
      title: formTitle || 'Untitled NFC Record',
      recordType: formType,
      payload,
      tagType: formType === 'url' ? 'NFC Forum Type 2' : 'NFC Forum Type 4',
      createdAt: new Date().toLocaleDateString(),
      byteSize: new Blob([payload]).size,
    };

    persistRecords([newRecord, ...savedRecords]);
    setStatusMessage(`Saved "${newRecord.title}" to NFC tag library.`);
  };

  // Delete Record (CRUD - Delete)
  const handleDeleteRecord = (id: string) => {
    persistRecords(savedRecords.filter((r) => r.id !== id));
  };

  // Copy payload helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulated Test Reader for Desktop & Non-NFC Devices
  const handleSimulateTagRead = (sampleType: 'business' | 'url' | 'badge') => {
    const samples = {
      business: {
        serialNumber: '04:7A:B2:91:0F:3D:80',
        records: [
          {
            recordType: 'mime',
            mediaType: 'text/vcard',
            data: 'BEGIN:VCARD\nVERSION:3.0\nFN:Jordan Smith\nTITLE:Prepress Studio Director\nEMAIL:jordan@nedject.com\nEND:VCARD',
          },
        ],
      },
      url: {
        serialNumber: '04:1C:89:E2:44:11:80',
        records: [
          {
            recordType: 'url',
            mediaType: 'text/plain',
            data: 'https://nedject.com/pay-to-use',
          },
        ],
      },
      badge: {
        serialNumber: '04:88:2E:70:9A:3F:81',
        records: [
          {
            recordType: 'text',
            mediaType: 'text/plain',
            data: 'NEDJECT-EMPLOYEE-ID: #81920 (Tier: PRO Matrix)',
          },
        ],
      },
    };

    const chosen = samples[sampleType];
    setScannedLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        serialNumber: chosen.serialNumber,
        records: chosen.records,
      },
      ...prev,
    ]);
    setStatusMessage(`Simulated NFC tag read successfully: Serial ${chosen.serialNumber}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. HERO HEADER */}
      <div className="max-w-6xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 border-2 border-black bg-[#ccff00] text-black shadow-[2px_2px_0px_#000000]">
              <Radio className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                LABORATORY &amp; HARDWARE // OPTICAL &amp; RADIO APPARATUS
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                NFC-BAT STUDIO // NDEF READER &amp; ENCODER
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] ${
                isNfcSupported
                  ? 'bg-[#ccff00] text-black'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isNfcSupported ? 'WEB NFC HARDWARE DETECTED' : 'NDEF SIMULATOR & ENCODER'}</span>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-700 font-sans leading-relaxed max-w-3xl">
          Inspect, decode, structure, and write open standard <strong>NDEF (NFC Data Exchange Format)</strong> records
          for smart business cards, interactive museum displays, dynamic URLs, and employee profile tokens.
        </p>

        {/* Status Notification Strip */}
        {statusMessage && (
          <div className="border-2 border-black bg-[#f0fdf4] p-3 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="border-2 border-black bg-rose-50 p-3 text-xs font-bold text-rose-900 flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE: SCANNER & WRITER */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUMN A: NFC SCANNER / DECODER */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-black" />
                <h2 className="text-sm font-black uppercase text-black">
                  1. NFC SCANNER &amp; NDEF DECODER
                </h2>
              </div>
              <span className="text-[10px] font-black bg-black text-[#ccff00] px-2 py-0.5 border border-black uppercase">
                ISO/IEC 14443
              </span>
            </div>

            <p className="text-xs text-zinc-600 font-sans">
              Tap any compatible NFC tag, smart wristband, or digital business card against your device to capture its
              payload and structural metadata.
            </p>

            {/* Scan Control Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleStartScan}
                disabled={isScanning}
                className={`w-full py-3.5 border-2 border-black font-black text-xs sm:text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer ${
                  isScanning
                    ? 'bg-amber-300 text-black animate-pulse'
                    : 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00]'
                }`}
              >
                <Radio className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'SCANNER ACTIVE (TAP TAG NOW)' : 'START HARDWARE SCAN'}</span>
              </button>

              {/* Simulation options for testing on desktop / non-NFC hardware */}
              {!isNfcSupported && (
                <div className="pt-2 border-t border-black/20 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                    DESKTOP SIMULATION TESTING MODES:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSimulateTagRead('business')}
                      className="p-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 font-bold uppercase cursor-pointer"
                    >
                      Simulate vCard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateTagRead('url')}
                      className="p-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 font-bold uppercase cursor-pointer"
                    >
                      Simulate URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateTagRead('badge')}
                      className="p-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 font-bold uppercase cursor-pointer"
                    >
                      Simulate ID
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Read Feed Log */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span>INCOMING NFC PAYLOAD FEED ({scannedLogs.length}):</span>
                {scannedLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setScannedLogs([])}
                    className="text-[10px] text-zinc-500 hover:text-black underline cursor-pointer"
                  >
                    Clear Feed
                  </button>
                )}
              </div>

              {scannedLogs.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-zinc-300 text-center space-y-2 text-zinc-500 bg-zinc-50">
                  <Smartphone className="w-8 h-8 mx-auto text-zinc-400 stroke-1" />
                  <p className="text-xs font-bold uppercase">No Tags Scanned Yet</p>
                  <p className="text-[11px] font-sans text-zinc-400">
                    Initiate a hardware scan or use simulation buttons above to preview NDEF parsing.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {scannedLogs.map((log, index) => (
                    <div
                      key={index}
                      className="border-2 border-black bg-zinc-50 p-3 space-y-2 shadow-[2px_2px_0px_#000000]"
                    >
                      <div className="flex items-center justify-between text-[11px] border-b border-black/10 pb-1">
                        <span className="font-bold text-zinc-600">
                          TIME: <strong className="text-black">{log.timestamp}</strong>
                        </span>
                        <span className="font-black bg-black text-[#ccff00] px-1.5 py-0.2 text-[10px]">
                          SERIAL: {log.serialNumber}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {log.records.map((rec, rIdx) => (
                          <div key={rIdx} className="bg-white border border-black p-2 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase">
                              <span>TYPE: {rec.recordType}</span>
                              {rec.mediaType && <span>MIME: {rec.mediaType}</span>}
                            </div>
                            <pre className="font-mono text-[11px] text-zinc-900 whitespace-pre-wrap break-all bg-zinc-100 p-1.5 border border-zinc-200">
                              {rec.data}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN B: NFC WRITER / NDEF ENCODER */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] space-y-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-black" />
              <h2 className="text-sm font-black uppercase text-black">
                2. NDEF RECORD ENCODER &amp; WRITER
              </h2>
            </div>
            <span className="text-[10px] font-black bg-[#ccff00] text-black px-2 py-0.5 border border-black uppercase">
              WRITE APPARATUS
            </span>
          </div>

          <p className="text-xs text-zinc-600 font-sans">
            Configure standard NDEF messages to program rewritable NFC tags (e.g. NTAG213, NTAG215, NTAG216, MIFARE Ultralight).
          </p>

          {/* Record Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black block">
              SELECT RECORD TYPE:
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-black">
              {[
                { type: 'url', label: 'URL', icon: LinkIcon },
                { type: 'text', label: 'TEXT', icon: FileText },
                { type: 'vcard', label: 'VCARD', icon: User },
                { type: 'custom', label: 'MIME', icon: Layers },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = formType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormType(item.type as any)}
                    className={`py-2 px-1 border-2 border-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] ${
                      isSelected
                        ? 'bg-black text-[#ccff00]'
                        : 'bg-white text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Record Input Form */}
          <div className="space-y-3 border-2 border-black bg-zinc-50 p-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-600 block">
                RECORD TITLE / LABEL:
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full border-2 border-black px-3 py-1.5 text-xs font-mono bg-white focus:outline-none"
                placeholder="e.g. Reception Desk Guest Wi-Fi"
              />
            </div>

            {formType === 'url' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">
                  TARGET URI / WEBSITE LINK:
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full border-2 border-black px-3 py-1.5 text-xs font-mono bg-white focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {formType === 'text' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">
                  PLAIN TEXT PAYLOAD:
                </label>
                <textarea
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full border-2 border-black p-2.5 text-xs font-mono bg-white focus:outline-none"
                  placeholder="Enter text or token ID..."
                />
              </div>
            )}

            {formType === 'vcard' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-600 block">
                      FULL NAME:
                    </label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full border-2 border-black px-2.5 py-1 text-xs font-mono bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-600 block">
                      TELEPHONE:
                    </label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full border-2 border-black px-2.5 py-1 text-xs font-mono bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">
                    EMAIL ADDRESS:
                  </label>
                  <input
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    className="w-full border-2 border-black px-2.5 py-1 text-xs font-mono bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {formType === 'custom' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">
                  CUSTOM MIME (APPLICATION/JSON):
                </label>
                <textarea
                  rows={4}
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  className="w-full border-2 border-black p-2.5 text-xs font-mono bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Compiled Preview Box */}
            <div className="pt-2 border-t border-black/10 text-[11px] space-y-1">
              <span className="font-bold text-zinc-500 uppercase block">
                NDEF BYTE PAYLOAD PREVIEW:
              </span>
              <pre className="font-mono text-[10px] bg-zinc-200 p-2 border border-zinc-300 overflow-x-auto whitespace-pre-wrap break-all text-black">
                {getCurrentPayloadString()}
              </pre>
            </div>
          </div>

          {/* Action Write Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveToLibrary}
              className="py-3 px-3 border-2 border-black bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>SAVE TO LIBRARY</span>
            </button>

            <button
              type="button"
              onClick={handleWriteTag}
              disabled={isWriting}
              className="py-3 px-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{isWriting ? 'WRITING...' : 'WRITE TO TAG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. STORED NFC TAG PROFILES LIBRARY (CRUD SECTION) */}
      <div className="max-w-6xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              3. STORED NFC PROFILES &amp; TAG LIBRARY ({savedRecords.length})
            </h2>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase">
            LOCAL PERSISTENT MATRIX
          </span>
        </div>

        {savedRecords.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-zinc-300 text-center text-zinc-500 font-bold text-xs uppercase bg-zinc-50">
            No Saved Records in Library. Encode one above to persist it.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRecords.map((item) => (
              <div
                key={item.id}
                className="border-2 border-black bg-zinc-50 p-4 space-y-3 shadow-[3px_3px_0px_#000000] flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                    <span className="font-black text-xs uppercase text-black truncate max-w-[180px]">
                      {item.title}
                    </span>
                    <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.2 font-black uppercase">
                      {item.recordType}
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-500 font-bold space-y-0.5">
                    <div>TAG SPEC: {item.tagType}</div>
                    <div>SIZE: {item.byteSize} BYTES • {item.createdAt}</div>
                  </div>

                  <div className="bg-white border border-black p-2 font-mono text-[10px] text-zinc-800 break-all max-h-24 overflow-y-auto">
                    {item.payload}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/20 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.payload)}
                    className="flex-1 py-1.5 border border-black bg-white hover:bg-zinc-100 font-bold text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-black" />
                        <span>COPY PAYLOAD</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(item.id)}
                    className="p-1.5 border border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 transition-colors cursor-pointer"
                    title="Delete record from library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. EDUCATIONAL CARD SECURITY ARCHITECTURE & SPECIFICATIONS */}
      <div className="max-w-6xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-3">
          <ShieldCheck className="w-5 h-5 text-black" />
          <h2 className="text-base font-black uppercase text-black">
            4. NFC CARDS SECURITY ARCHITECTURE &amp; SPECIFICATIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-sans">
          {/* Card Type 1: Open Standard Tags */}
          <div className="border-2 border-black bg-emerald-50/60 p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block" />
              <h3 className="font-black text-sm uppercase text-black">
                OPEN NDEF TAGS (NTAG213 / 215 / 216)
              </h3>
            </div>
            <p className="text-zinc-700 font-medium">
              Used in digital business cards, interactive posters, event wristbands, and product packaging. These
              communicate using open NDEF records that can be freely read, decoded, or written by any standard smartphone or
              browser Web NFC reader without cryptographic keys.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-800 text-[11px] font-bold">
              <li>Memory range: 144 bytes to 888 bytes</li>
              <li>Standardized by NFC Forum (Type 2 Tag standard)</li>
              <li>Supports write-locking / permanent read-only fuses</li>
            </ul>
          </div>

          {/* Card Type 2: Secure Elements & Transit Smartcards */}
          <div className="border-2 border-black bg-amber-50/70 p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-mono">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <h3 className="font-black text-sm uppercase text-black">
                SECURE ELEMENTS (TRANSIT &amp; PAYMENT CARDS)
              </h3>
            </div>
            <p className="text-zinc-700 font-medium">
              Metro transit cards (DMRC, Oyster, Suica) and contactless EMV credit/debit cards do not use standard open NDEF
              memory. Instead, they execute isolated applets inside a certified <strong>Secure Element (SE)</strong> with
              hardware cryptographic coprocessors (DES/AES/ECC).
            </p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-800 text-[11px] font-bold">
              <li>Mutual authentication handshakes prevent eavesdropping</li>
              <li>Dynamic cryptograms change on every contactless transaction</li>
              <li>Protected by hardware tamper-resistant silicon boundaries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
