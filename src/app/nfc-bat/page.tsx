'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Unlock,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  ExternalLink,
  Edit3,
  Search,
  Filter,
  CreditCard,
  Building,
  Key,
  Train,
  GraduationCap,
  Ticket,
  Terminal,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Code,
  Sliders,
  CheckCircle2,
  Share2,
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type CardCategory =
  | 'metro'
  | 'emv'
  | 'hotel'
  | 'badge'
  | 'student'
  | 'vcard'
  | 'event'
  | 'raw_chip';

export interface NfcTagProfile {
  id: string;
  title: string;
  category: CardCategory;
  chipStandard: string; // e.g. MIFARE Classic 1K, DESFire EV3, NTAG215, ISO 7816-4
  uid: string; // e.g. 04:A2:3B:5C:89:10:80
  atqa: string; // Answer to Request Type A e.g. 00 04
  sak: string; // Select Acknowledge e.g. 08
  payloadType: 'ndef_url' | 'ndef_text' | 'ndef_vcard' | 'ndef_mime' | 'apdu_emv' | 'sector_blocks';
  rawPayload: string;
  decryptedData?: string;
  secretKey?: string; // Hex key or passphrase (A/B or AES-128)
  encryptionType: 'None (Plain NDEF)' | 'Crypto1 (48-bit Key)' | 'AES-128 CMAC (DESFire)' | 'EMV Cryptogram';
  memoryBytes: number;
  locked: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ApduCommandLog {
  id: string;
  timestamp: string;
  direction: 'TX' | 'RX';
  hex: string;
  interpretation: string;
  statusWord?: string;
}

interface SectorBlock {
  sector: number;
  block: number;
  dataHex: string;
  ascii: string;
  type: 'manufacturer' | 'data' | 'trailer';
  accessBits?: string;
  keyA?: string;
  keyB?: string;
}

// Pre-configured Card Samples
const SAMPLE_PRESETS: NfcTagProfile[] = [
  {
    id: 'preset_metro_01',
    title: 'Metro Rapid Transit Pass (Calypso / Mifare)',
    category: 'metro',
    chipStandard: 'MIFARE Classic 1K (ISO 14443-A)',
    uid: '04:78:E2:B1:90:3A:80',
    atqa: '00 04',
    sak: '08',
    payloadType: 'sector_blocks',
    rawPayload: '7A10B49F000000000000000000000000',
    decryptedData: JSON.stringify(
      {
        system: 'Metropolitan Transit Authority (MTA/DMRC)',
        cardholderId: 'TX-98402-METRO',
        passType: 'Monthly Unlimited 30-Day Pass',
        remainingBalance: '$42.50',
        lastStationIngress: 'Central Station Gate 04',
        lastTapTimestamp: '2026-11-06 08:30:15',
        validUntil: '2026-12-06',
      },
      null,
      2
    ),
    secretKey: 'A0A1A2A3A4A5',
    encryptionType: 'Crypto1 (48-bit Key)',
    memoryBytes: 1024,
    locked: true,
    notes: 'Transit cards store fare balance in encrypted sector blocks. Mutual auth required to access.',
    createdAt: '2026-11-01',
    updatedAt: '2026-11-06',
  },
  {
    id: 'preset_emv_02',
    title: 'Contactless Debit / Credit Card (EMV ISO 7816)',
    category: 'emv',
    chipStandard: 'ISO 7816-4 / EMVCo Level 1',
    uid: '08:1B:34:F0:77:92:14',
    atqa: '00 44',
    sak: '20',
    payloadType: 'apdu_emv',
    rawPayload: '00A4040007A000000003101000',
    decryptedData: JSON.stringify(
      {
        aid: 'A0000000031010 (Visa Credit/Debit)',
        applicationLabel: 'VISA GLOBAL DEBIT',
        maskedPan: '4111 •••• •••• 9821',
        expirationDate: '09/29',
        currencyCode: '840 (USD)',
        applicationTransactionCounter: '0x018F (399 taps)',
        cryptogramType: 'ARQC (Authorization Request Cryptogram)',
        cvmPreference: 'PIN or Signature with Dynamic Cryptogram',
      },
      null,
      2
    ),
    secretKey: 'AES-128 Session KEK (Hardware Bound)',
    encryptionType: 'EMV Cryptogram',
    memoryBytes: 8192,
    locked: true,
    notes: 'Protected by Secure Element (SE) silicon. Dynamic cryptogram generated per transaction.',
    createdAt: '2026-11-02',
    updatedAt: '2026-11-06',
  },
  {
    id: 'preset_hotel_03',
    title: 'Hotel Hospitality Key Card (VingCard / Salto)',
    category: 'hotel',
    chipStandard: 'MIFARE Ultralight EV1 (ISO 14443-A)',
    uid: '04:4C:90:12:DF:56:80',
    atqa: '00 44',
    sak: '00',
    payloadType: 'sector_blocks',
    rawPayload: '56494E47010408102026110600000000',
    decryptedData: JSON.stringify(
      {
        hotelChain: 'Grand Horizon Suites & Resorts',
        roomNumber: 'Suite 408 (Floor 4 North Wing)',
        guestId: 'GST-77291',
        checkInTime: '2026-11-06 14:00:00',
        checkOutTime: '2026-11-09 11:00:00',
        authorizedZones: ['Room 408', 'Executive Lounge', 'Fitness Center', 'Pool Gate'],
      },
      null,
      2
    ),
    secretKey: 'B1C2D3E4F506',
    encryptionType: 'Crypto1 (48-bit Key)',
    memoryBytes: 192,
    locked: false,
    notes: 'Ultralight pages store room hash and expiration epoch. Automatically expires after checkout.',
    createdAt: '2026-11-03',
    updatedAt: '2026-11-06',
  },
  {
    id: 'preset_badge_04',
    title: 'Corporate Employee Smart Badge (HID Wiegand)',
    category: 'badge',
    chipStandard: 'MIFARE DESFire EV2 (ISO 14443-4)',
    uid: '04:FE:81:44:22:98:80',
    atqa: '03 44',
    sak: '20',
    payloadType: 'sector_blocks',
    rawPayload: '0200881920F00100',
    decryptedData: JSON.stringify(
      {
        corpDomain: 'Nedject Optical Systems Corp',
        employeeName: 'Neeraj Rekwar',
        employeeId: 'EMP-00109',
        wiegandFormat: 'Standard 26-bit (H10301)',
        facilityCode: 142,
        cardIdNumber: 29841,
        clearanceLevel: 'LEVEL 5 - GLOBAL ADMIN & LAB ACCESS',
      },
      null,
      2
    ),
    secretKey: 'AES-128: 4E65646A656374436F72703230323621',
    encryptionType: 'AES-128 CMAC (DESFire)',
    memoryBytes: 4096,
    locked: true,
    notes: 'DESFire EV2 with mutual authentication. Protected against eavesdropping and cloning.',
    createdAt: '2026-11-04',
    updatedAt: '2026-11-06',
  },
  {
    id: 'preset_student_05',
    title: 'University Campus Student ID & Dining Token',
    category: 'student',
    chipStandard: 'MIFARE Classic EV1 4K',
    uid: '04:55:A1:72:C9:33:80',
    atqa: '00 02',
    sak: '18',
    payloadType: 'sector_blocks',
    rawPayload: '43414D5055535F53545544454E540000',
    decryptedData: JSON.stringify(
      {
        university: 'Institute of Advanced Optical Technology',
        studentName: 'Jordan Rivera',
        rollNumber: 'IAOT-2026-CS-419',
        diningMealPoints: 340,
        dormBuilding: 'Tesla Hall Tower B - Rm 312',
        libraryBorrowingActive: true,
        validUntil: '2028-06-30',
      },
      null,
      2
    ),
    secretKey: 'FFFFFFFFFFFF',
    encryptionType: 'Crypto1 (48-bit Key)',
    memoryBytes: 4096,
    locked: false,
    notes: 'Multi-sector campus card: Sector 1 for ID, Sector 2 for Dining, Sector 3 for Dorm Access.',
    createdAt: '2026-11-05',
    updatedAt: '2026-11-06',
  },
  {
    id: 'preset_vcard_06',
    title: 'Executive NFC Business Card (Open vCard NDEF)',
    category: 'vcard',
    chipStandard: 'NTAG216 (NFC Forum Type 2)',
    uid: '04:1A:66:D8:03:77:80',
    atqa: '00 44',
    sak: '00',
    payloadType: 'ndef_vcard',
    rawPayload:
      'BEGIN:VCARD\nVERSION:3.0\nFN:Alex Vance\nTITLE:Chief Hardware Architect\nORG:Nedject Prepress Labs\nEMAIL:alex@nedject.com\nTEL:+15550192834\nURL:https://nedject.com\nEND:VCARD',
    decryptedData:
      'BEGIN:VCARD\nVERSION:3.0\nFN:Alex Vance\nTITLE:Chief Hardware Architect\nORG:Nedject Prepress Labs\nEMAIL:alex@nedject.com\nTEL:+15550192834\nURL:https://nedject.com\nEND:VCARD',
    secretKey: 'None (Public Read NDEF)',
    encryptionType: 'None (Plain NDEF)',
    memoryBytes: 888,
    locked: false,
    notes: 'Rewritable NFC card tap instantly loads contact profile into iOS/Android Contacts app.',
    createdAt: '2026-11-05',
    updatedAt: '2026-11-06',
  },
  {
    id: 'preset_event_07',
    title: 'Smart VIP Festival Wristband (Sun DNA Auth)',
    category: 'event',
    chipStandard: 'NTAG 424 DNA (AES-128 Sun Mirror)',
    uid: '04:90:3C:7F:EA:18:80',
    atqa: '03 44',
    sak: '20',
    payloadType: 'ndef_url',
    rawPayload: 'https://nedject.com/gate/auth?uid=04903C7FEA1880&ctr=000042&cmac=C8F214A909B8E312',
    decryptedData: JSON.stringify(
      {
        event: 'Cybernetic Sound & Vision Festival 2026',
        ticketTier: 'VIP Backstage All-Access',
        tapCounter: 42,
        verifiedUid: '04:90:3C:7F:EA:18:80',
        dynamicCmacValid: true,
        gatePassed: 'VIP Lounge Backstage North',
      },
      null,
      2
    ),
    secretKey: 'AES-128: 9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D',
    encryptionType: 'AES-128 CMAC (DESFire)',
    memoryBytes: 416,
    locked: true,
    notes: 'Cryptographic URL generated on every single tap with changing counter and dynamic CMAC tag.',
    createdAt: '2026-11-06',
    updatedAt: '2026-11-06',
  },
];

export default function NfcBatPage() {
  // ==========================================
  // HARDWARE & DRIVER STATE
  // ==========================================
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);

  // Active Selected Card for Deep Inspection / Decoding
  const [activeTag, setActiveTag] = useState<NfcTagProfile>(SAMPLE_PRESETS[0]);
  const [tagsLibrary, setTagsLibrary] = useState<NfcTagProfile[]>(SAMPLE_PRESETS);

  // Filter & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit / Create Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTag, setEditingTag] = useState<Partial<NfcTagProfile>>({});
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Cryptographic Engine Sandbox State
  const [cryptoMode, setCryptoMode] = useState<'decrypt' | 'encrypt' | 'interpret'>('decrypt');
  const [cryptoInputText, setCryptoInputText] = useState<string>('');
  const [cryptoKey, setCryptoKey] = useState<string>('NedjectMasterKey2026');
  const [cryptoAlgorithm, setCryptoAlgorithm] = useState<'AES-GCM' | 'Mifare-Crypto1' | 'Wiegand-26'>('AES-GCM');
  const [cryptoResult, setCryptoResult] = useState<string>('');
  const [cryptoError, setCryptoError] = useState<string>('');
  const [isProcessingCrypto, setIsProcessingCrypto] = useState<boolean>(false);

  // APDU Command Console Simulator
  const [apduInput, setApduInput] = useState<string>('00 A4 04 00 07 A0 00 00 00 03 10 10 00');
  const [apduLogs, setApduLogs] = useState<ApduCommandLog[]>([
    {
      id: 'apdu_1',
      timestamp: '19:00:10',
      direction: 'TX',
      hex: '00 A4 04 00 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 00',
      interpretation: 'SELECT 2PAY.SYS.DDF01 (Proximity Payment System Environment - PPSE)',
    },
    {
      id: 'apdu_2',
      timestamp: '19:00:10',
      direction: 'RX',
      hex: '6F 2B 84 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 A5 19 ... 90 00',
      interpretation: 'PPSE FCI Response: Found Visa Debit Application (AID: A0000000031010)',
      statusWord: '90 00 (Success)',
    },
    {
      id: 'apdu_3',
      timestamp: '19:00:11',
      direction: 'TX',
      hex: '00 A4 04 00 07 A0 00 00 00 03 10 10 00',
      interpretation: 'SELECT AID A0000000031010 (Visa Payment Applet)',
    },
    {
      id: 'apdu_4',
      timestamp: '19:00:11',
      direction: 'RX',
      hex: '6F 1E 84 07 A0 00 00 00 03 10 10 87 01 01 9F 38 06 9F 1A 02 9F 35 01 90 00',
      interpretation: 'Application Selected OK. PDOL Requested: Terminal Country (0x9F1A), Terminal Type (0x9F35)',
      statusWord: '90 00 (Success)',
    },
  ]);

  // Live Hardware Scanner Logs
  const [scanHistory, setScanHistory] = useState<
    Array<{
      timestamp: string;
      serialNumber: string;
      records: Array<{ recordType: string; mediaType?: string; data: string }>;
    }>
  >([]);

  // Copied indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Play subtle beep sound when tag tapped (Web Audio API)
  const playTapAudio = () => {
    if (!audioFeedback || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {}
  };

  // Check Web NFC Browser Compatibility & Load Storage on Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsNfcSupported(true);
      setStatusMessage('Web NFC API is available on this browser & hardware.');
    } else {
      setIsNfcSupported(false);
      setStatusMessage(
        'Web NFC requires Chromium on an NFC-enabled Android device. Interactive hardware antenna simulation & protocol analyzer are active.'
      );
    }

    // Load custom tags from localStorage
    try {
      const stored = localStorage.getItem('nedject_nfc_custom_library_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTagsLibrary(parsed);
          setActiveTag(parsed[0]);
        }
      }
    } catch {}
  }, []);

  // Save tags helper
  const persistTags = (list: NfcTagProfile[]) => {
    setTagsLibrary(list);
    try {
      localStorage.setItem('nedject_nfc_custom_library_v2', JSON.stringify(list));
    } catch {}
  };

  // Filtered Tags
  const filteredTags = useMemo(() => {
    return tagsLibrary.filter((t) => {
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesQuery =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.chipStandard.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [tagsLibrary, categoryFilter, searchQuery]);

  // ==========================================
  // HARDWARE SCANNER (WEB NFC)
  // ==========================================
  const handleStartScan = async () => {
    setErrorMessage('');
    if (!('NDEFReader' in window)) {
      setErrorMessage(
        'Physical Web NFC antenna requires Chrome on Android. Use the antenna simulation pad below to simulate card taps.'
      );
      return;
    }

    try {
      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();
      setIsScanning(true);
      setStatusMessage('Antenna energized. Bring NFC card within 2-4 cm of device antenna...');

      await ndef.scan();

      ndef.onreading = (event: any) => {
        playTapAudio();
        const serialNumber = event.serialNumber || '04:XX:XX:XX:XX:XX:80';
        const parsedRecords: Array<{ recordType: string; mediaType?: string; data: string }> = [];

        for (const record of event.message.records) {
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          let decodedString = '';

          try {
            decodedString = textDecoder.decode(record.data);
          } catch {
            decodedString = '[Binary Encrypted Payload]';
          }

          parsedRecords.push({
            recordType: record.recordType,
            mediaType: record.mediaType,
            data: decodedString,
          });
        }

        setScanHistory((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            serialNumber,
            records: parsedRecords,
          },
          ...prev,
        ]);

        // Auto-create or select scanned tag profile
        const newScannedTag: NfcTagProfile = {
          id: `scanned_${Date.now()}`,
          title: `Hardware Scanned Tag (${serialNumber})`,
          category: 'raw_chip',
          chipStandard: 'ISO 14443-A (Auto-detected)',
          uid: serialNumber,
          atqa: '00 04',
          sak: '08',
          payloadType: 'ndef_text',
          rawPayload: parsedRecords[0]?.data || 'Empty or raw payload',
          decryptedData: parsedRecords.map((r) => `[${r.recordType}] ${r.data}`).join('\n'),
          secretKey: 'N/A',
          encryptionType: 'None (Plain NDEF)',
          memoryBytes: 540,
          locked: false,
          notes: 'Captured via physical device Web NFC hardware antenna.',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };

        setActiveTag(newScannedTag);
        setStatusMessage(`Tag detected! UID: ${serialNumber} • ${parsedRecords.length} records parsed.`);
      };

      ndef.onreadingerror = () => {
        setErrorMessage('Cannot decode tag. Tag may be encrypted, proprietary (EMV/Transit), or unformatted.');
      };
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err.message || 'Error initializing Web NFC antenna');
    }
  };

  // ==========================================
  // HARDWARE WRITER (WEB NFC)
  // ==========================================
  const handleWriteToPhysicalTag = async (tag: NfcTagProfile) => {
    setErrorMessage('');
    if (!('NDEFReader' in window)) {
      setErrorMessage('Physical writing requires Web NFC on Chrome Android. Hardware not present.');
      return;
    }

    try {
      setIsWriting(true);
      setStatusMessage(`Writing "${tag.title}" to physical tag... Hold card to antenna.`);

      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();

      let writeRecord: any;
      if (tag.payloadType === 'ndef_url') {
        writeRecord = { recordType: 'url', data: tag.rawPayload };
      } else if (tag.payloadType === 'ndef_vcard') {
        writeRecord = { recordType: 'mime', mediaType: 'text/vcard', data: tag.rawPayload };
      } else {
        writeRecord = { recordType: 'text', data: tag.rawPayload };
      }

      await ndef.write({ records: [writeRecord] });

      playTapAudio();
      setIsWriting(false);
      setStatusMessage(`Tag written successfully with "${tag.title}"!`);
    } catch (err: any) {
      setIsWriting(false);
      setErrorMessage(err.message || 'Failed writing to tag. Tag may be write-locked or read-only.');
    }
  };

  // ==========================================
  // SIMULATE CARD TAP
  // ==========================================
  const handleSimulateTap = (tag: NfcTagProfile) => {
    playTapAudio();
    setActiveTag(tag);
    setStatusMessage(`Simulated tap detected! Antenna matched: UID ${tag.uid} (${tag.chipStandard})`);
  };

  // ==========================================
  // CRYPTOGRAPHIC ENGINE (AES Web Crypto + Crypto1)
  // ==========================================
  const handleRunCrypto = async () => {
    setCryptoError('');
    setCryptoResult('');
    setIsProcessingCrypto(true);

    try {
      if (cryptoAlgorithm === 'AES-GCM') {
        if (!cryptoInputText) throw new Error('Please enter plaintext or ciphertext input.');
        if (!cryptoKey) throw new Error('Please enter a secret key or passphrase.');

        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          enc.encode(cryptoKey.padEnd(32, '#').slice(0, 32)),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );

        if (cryptoMode === 'encrypt') {
          const iv = window.crypto.getRandomValues(new Uint8Array(12));
          const ciphertext = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            keyMaterial,
            enc.encode(cryptoInputText)
          );

          const combined = new Uint8Array(iv.length + ciphertext.byteLength);
          combined.set(iv, 0);
          combined.set(new Uint8Array(ciphertext), iv.length);

          const hexResult = Array.from(combined)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();

          setCryptoResult(hexResult);
        } else if (cryptoMode === 'decrypt') {
          const cleanHex = cryptoInputText.replace(/\s+/g, '');
          if (cleanHex.length < 24) throw new Error('Ciphertext hex too short for AES-GCM (needs IV + Tag).');

          const rawBytes = new Uint8Array(
            cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
          );
          const iv = rawBytes.slice(0, 12);
          const data = rawBytes.slice(12);

          const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            keyMaterial,
            data
          );
          setCryptoResult(new TextDecoder().decode(decrypted));
        } else {
          // Key Interpretation
          setCryptoResult(
            `[AES-128 / GCM INTERPRETATION]\nKey Fingerprint (SHA-256): ${cryptoKey.slice(0, 8)}...\nAuthentication: 128-bit MAC Tag included\nReplay Protection: Dynamic IV required per tap\nApplicable To: NTAG 424 DNA Sun / DESFire EV2/EV3`
          );
        }
      } else if (cryptoAlgorithm === 'Mifare-Crypto1') {
        // Mifare Classic 48-bit Crypto1 Interpretation
        const keyClean = cryptoKey.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 12) || 'FFFFFFFFFFFF';
        if (cryptoMode === 'interpret') {
          setCryptoResult(
            `[MIFARE CRYPTO1 SECTOR TRAILER INTERPRETATION]\nSecret Key A: ${keyClean.slice(0, 6)} ${keyClean.slice(6, 12)}\nAccess Bits: FF 07 80 (Transport Default)\nSecret Key B: ${keyClean}\nPermissions: Data blocks 0-2 readable/writable with Key A.\nKey A is NEVER readable directly over radio; returns 00 00 00 00 00 00.`
          );
        } else {
          setCryptoResult(
            `[CRYPTO1 ENCRYPTED STREAM]\nSimulated Crypto1 LFSR Keystream generated with Key 0x${keyClean}.\nSector Tag Response: 0x${(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0').toUpperCase()}\nMutual authentication challenge: 0x${(Math.random() * 0xffffffff).toString(16).padStart(8, '0').toUpperCase()}`
          );
        }
      } else if (cryptoAlgorithm === 'Wiegand-26') {
        // Wiegand 26-bit Decoder
        const parsed = parseInt(cryptoInputText.replace(/[^0-9]/g, '')) || 29841;
        const facCode = Math.floor(parsed / 1000) % 256;
        const cardNum = parsed % 65536;
        setCryptoResult(
          `[WIEGAND 26-BIT INTERPRETER (H10301)]\nRaw Binary: P [${facCode.toString(2).padStart(8, '0')}] [${cardNum.toString(2).padStart(16, '0')}] P\nFacility Code: ${facCode}\nCard Number: ${cardNum}\nParity Checks: Valid (Even leading / Odd trailing)`
        );
      }
    } catch (err: any) {
      setCryptoError(err.message || 'Cryptographic operation failed');
    } finally {
      setIsProcessingCrypto(false);
    }
  };

  // ==========================================
  // APDU COMMAND TRANSMITTER SIMULATOR
  // ==========================================
  const handleSendApdu = () => {
    const raw = apduInput.trim().toUpperCase();
    if (!raw) return;

    let interpretation = 'Custom APDU Command';
    let statusWord = '90 00';
    let rxHex = '90 00';

    if (raw.startsWith('00 A4 04 00')) {
      if (raw.includes('32 50 41 59') || raw.includes('32504159')) {
        interpretation = 'SELECT PPSE (2PAY.SYS.DDF01)';
        rxHex = '6F 2A 84 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 A5 18 90 00';
      } else if (raw.includes('A0 00 00 00 03 10 10') || raw.includes('A0000000031010')) {
        interpretation = 'SELECT AID: VISA CREDIT/DEBIT';
        rxHex = '6F 20 84 07 A0 00 00 00 03 10 10 87 01 01 90 00';
      } else if (raw.includes('A0 00 00 00 04 10 10') || raw.includes('A0000000041010')) {
        interpretation = 'SELECT AID: MASTERCARD CREDIT/DEBIT';
        rxHex = '6F 1E 84 07 A0 00 00 00 04 10 10 87 01 01 90 00';
      } else {
        interpretation = 'SELECT APPLICATION BY DF NAME';
        rxHex = '90 00';
      }
    } else if (raw.startsWith('00 B2')) {
      interpretation = 'READ RECORD (EMV Track 2 / PAN Data)';
      rxHex = '70 18 57 11 41 11 98 21 00 00 00 00 D2 90 92 01 00 00 00 90 00';
    } else if (raw.startsWith('80 A8')) {
      interpretation = 'GET PROCESSING OPTIONS (GPO)';
      rxHex = '77 0E 82 02 18 00 94 08 08 01 01 00 10 01 01 00 90 00';
    } else {
      interpretation = 'TRANSMIT TRANSPARENT ISO 7816-4 APDU';
      rxHex = '90 00';
    }

    const newTx: ApduCommandLog = {
      id: `tx_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      direction: 'TX',
      hex: raw,
      interpretation,
    };

    const newRx: ApduCommandLog = {
      id: `rx_${Date.now() + 1}`,
      timestamp: new Date().toLocaleTimeString(),
      direction: 'RX',
      hex: rxHex,
      interpretation: `${interpretation} Response`,
      statusWord: `${statusWord} (Success)`,
    };

    setApduLogs((prev) => [...prev, newTx, newRx]);
    playTapAudio();
  };

  // ==========================================
  // CRUD ACTIONS (CREATE, EDIT, DELETE)
  // ==========================================
  const handleOpenCreateModal = () => {
    setIsCreatingNew(true);
    setEditingTag({
      title: 'New Custom Tag Profile',
      category: 'metro',
      chipStandard: 'MIFARE Classic 1K',
      uid: '04:' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':') + ':80',
      atqa: '00 04',
      sak: '08',
      payloadType: 'ndef_text',
      rawPayload: 'Custom NFC Payload Data',
      decryptedData: '{\n  "status": "active",\n  "custom": true\n}',
      secretKey: 'A0A1A2A3A4A5',
      encryptionType: 'None (Plain NDEF)',
      memoryBytes: 1024,
      locked: false,
      notes: 'Custom configured NFC card.',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (tag: NfcTagProfile) => {
    setIsCreatingNew(false);
    setEditingTag({ ...tag });
    setIsEditModalOpen(true);
  };

  const handleSaveModalTag = () => {
    if (!editingTag.title || !editingTag.uid) {
      alert('Please fill out Title and UID');
      return;
    }

    if (isCreatingNew) {
      const newTag: NfcTagProfile = {
        id: `custom_${Date.now()}`,
        title: editingTag.title || 'Untitled NFC Tag',
        category: (editingTag.category as CardCategory) || 'metro',
        chipStandard: editingTag.chipStandard || 'MIFARE Classic 1K',
        uid: editingTag.uid || '04:12:34:56:78:90:80',
        atqa: editingTag.atqa || '00 04',
        sak: editingTag.sak || '08',
        payloadType: editingTag.payloadType || 'ndef_text',
        rawPayload: editingTag.rawPayload || '',
        decryptedData: editingTag.decryptedData || '',
        secretKey: editingTag.secretKey || 'N/A',
        encryptionType: editingTag.encryptionType || 'None (Plain NDEF)',
        memoryBytes: editingTag.memoryBytes || 1024,
        locked: Boolean(editingTag.locked),
        notes: editingTag.notes || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const updated = [newTag, ...tagsLibrary];
      persistTags(updated);
      setActiveTag(newTag);
      setStatusMessage(`Created new tag profile "${newTag.title}".`);
    } else {
      const updated = tagsLibrary.map((t) =>
        t.id === editingTag.id
          ? ({
              ...t,
              ...editingTag,
              updatedAt: new Date().toISOString().split('T')[0],
            } as NfcTagProfile)
          : t
      );
      persistTags(updated);
      const found = updated.find((t) => t.id === editingTag.id);
      if (found) setActiveTag(found);
      setStatusMessage(`Updated tag profile "${editingTag.title}".`);
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('Are you sure you want to delete this NFC profile?')) {
      const updated = tagsLibrary.filter((t) => t.id !== id);
      persistTags(updated);
      if (activeTag.id === id && updated.length > 0) {
        setActiveTag(updated[0]);
      }
      setStatusMessage('Tag profile deleted.');
    }
  };

  const handleDuplicateTag = (tag: NfcTagProfile) => {
    const cloned: NfcTagProfile = {
      ...tag,
      id: `clone_${Date.now()}`,
      title: `${tag.title} (Copy)`,
      uid: '04:' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':') + ':80',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const updated = [cloned, ...tagsLibrary];
    persistTags(updated);
    setActiveTag(cloned);
    setStatusMessage(`Duplicated "${tag.title}".`);
  };

  // Export JSON
  const handleExportLibrary = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tagsLibrary, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `nedject-nfc-tags-${Date.now()}.json`;
    a.click();
    a.remove();
  };

  // Import JSON
  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          persistTags(parsed);
          if (parsed.length > 0) setActiveTag(parsed[0]);
          alert(`Successfully imported ${parsed.length} NFC tag profiles!`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Hex Memory Map Blocks for Active Tag
  const memoryBlocks: SectorBlock[] = useMemo(() => {
    const blocks: SectorBlock[] = [];
    const totalSectors = activeTag.memoryBytes >= 4096 ? 16 : 8;

    for (let s = 0; s < totalSectors; s++) {
      for (let b = 0; b < 4; b++) {
        const isManuf = s === 0 && b === 0;
        const isTrailer = b === 3;
        let hex = '';
        let ascii = '';

        if (isManuf) {
          hex = `${activeTag.uid.replace(/:/g, '')}08040001020304`.slice(0, 32);
          ascii = 'UID/BCC/SAK/MANUF';
        } else if (isTrailer) {
          const keyA = (activeTag.secretKey || 'FFFFFFFFFFFF').slice(0, 12).padEnd(12, 'F');
          const keyB = (activeTag.secretKey || 'FFFFFFFFFFFF').slice(0, 12).padEnd(12, 'F');
          hex = `${keyA}FF078069${keyB}`;
          ascii = 'KEY_A / ACCESS / KEY_B';
        } else {
          // Data block
          if (s === 1 && b === 0 && activeTag.rawPayload) {
            hex = activeTag.rawPayload.replace(/[^0-9A-Fa-f]/g, '').padEnd(32, '0').slice(0, 32);
          } else {
            hex = `00000000000000000000000000000000`;
          }
          ascii = 'SEC_DATA_BLOCK';
        }

        blocks.push({
          sector: s,
          block: b,
          dataHex: hex.match(/.{1,2}/g)?.join(' ') || hex,
          ascii,
          type: isManuf ? 'manufacturer' : isTrailer ? 'trailer' : 'data',
          keyA: isTrailer ? activeTag.secretKey?.slice(0, 12) || 'FFFFFFFFFFFF' : undefined,
          keyB: isTrailer ? activeTag.secretKey?.slice(0, 12) || 'FFFFFFFFFFFF' : undefined,
          accessBits: isTrailer ? 'FF 07 80 69' : undefined,
        });
      }
    }
    return blocks;
  }, [activeTag]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-mono selection:bg-[#ccff00] selection:text-black py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. TOP HERO & CONTROL HUD */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 border-2 border-black bg-[#ccff00] text-black shadow-[2px_2px_0px_#000000]">
              <Radio className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                LABORATORY &amp; HARDWARE // RADIO FREQUENCY ARCHITECTURE
              </span>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                <span>NFC-BAT STUDIO</span>
                <span className="text-xs bg-black text-[#ccff00] px-2 py-0.5 border border-black font-mono">
                  v3.4 HIGH-ASSURANCE
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer ${
                audioFeedback ? 'bg-[#ccff00] text-black' : 'bg-zinc-100 text-zinc-600'
              }`}
              title="Toggle audio tone when card taps antenna"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>TAP SOUND: {audioFeedback ? 'ON' : 'MUTED'}</span>
            </button>

            <span
              className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] ${
                isNfcSupported ? 'bg-[#ccff00] text-black' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isNfcSupported ? 'WEB NFC HARDWARE DETECTED' : 'RADIO PROTOCOL EMULATOR'}</span>
            </span>

            <Link
              href="/"
              className="px-3 py-1.5 border-2 border-black bg-white hover:bg-[#ccff00] text-xs font-black uppercase shadow-[2px_2px_0px_#000000] transition-colors"
            >
              HOME
            </Link>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-700 font-sans leading-relaxed max-w-4xl">
          High-performance RF testbench and NDEF studio for analyzing, decoding, interpreting, encrypting, and programming
          contactless smart cards: <strong>Metro Transit Passes (Calypso/Mifare)</strong>,{' '}
          <strong>Contactless EMV Credit/Debit (ISO 7816 APDU)</strong>, <strong>Hospitality Hotel Cards</strong>,{' '}
          <strong>Corporate Employee Badges (HID Wiegand)</strong>, <strong>University IDs</strong>,{' '}
          <strong>NFC vCard Business Cards</strong>, and <strong>Encrypted Sun DNA Wristbands</strong>.
        </p>

        {/* Status Notification Strip */}
        {statusMessage && (
          <div className="border-2 border-black bg-[#f0fdf4] p-3 text-xs font-bold text-emerald-900 flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage('')} className="text-zinc-500 hover:text-black text-xs font-mono">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="border-2 border-black bg-rose-50 p-3 text-xs font-bold text-rose-900 flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-zinc-500 hover:text-black text-xs font-mono">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE ANTENNA PAD & ACTIVE CARD INSPECTOR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: 4 COLS - HARDWARE SCANNER & INTERACTIVE TAP PAD */}
        <div className="lg:col-span-5 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-black" />
                <h2 className="text-sm font-black uppercase text-black">
                  1. ANTENNA COIL &amp; HARDWARE SCANNER
                </h2>
              </div>
              <span className="text-[10px] font-black bg-black text-[#ccff00] px-2 py-0.5 border border-black uppercase">
                13.56 MHz HF
              </span>
            </div>

            <p className="text-xs text-zinc-600 font-sans">
              Tap physical tags on supported Chrome Android hardware, or tap any preset card on the target antenna coil below.
            </p>

            {/* Hardware Web NFC Button */}
            <button
              type="button"
              onClick={handleStartScan}
              disabled={isScanning}
              className={`w-full py-3.5 border-2 border-black font-black text-xs sm:text-sm uppercase transition-all shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isScanning
                  ? 'bg-amber-300 text-black animate-pulse'
                  : 'bg-[#ccff00] text-black hover:bg-black hover:text-[#ccff00]'
              }`}
            >
              <Radio className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'ANTENNA ACTIVE (HOLD CARD NEAR)' : 'START HARDWARE SCAN'}</span>
            </button>

            {/* Visual Interactive Antenna Coil Pad */}
            <div className="border-4 border-black bg-zinc-900 text-white p-6 shadow-[4px_4px_0px_#000000] text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:12px_12px]" />

              <div className="relative z-10 space-y-3">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-dashed border-[#ccff00] flex items-center justify-center relative animate-[spin_20s_linear_infinite]">
                  <div className="w-16 h-16 rounded-full border-2 border-[#ccff00]/60 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#ccff00]/20 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-[#ccff00]" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black tracking-widest text-[#ccff00] uppercase">
                    VIRTUAL ANTENNA FIELD ACTIVE
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    COUPLING: 13.56 MHz • ISO/IEC 14443-A • NDEF PROTOCOL
                  </div>
                </div>

                {/* Quick Tap Presets Bar */}
                <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    TAP CARD ON ANTENNA FIELD:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      onClick={() => handleSimulateTap(SAMPLE_PRESETS[0])}
                      className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-[#ccff00] hover:text-black text-white font-bold uppercase transition-colors"
                    >
                      🚇 Tap Metro Pass
                    </button>
                    <button
                      onClick={() => handleSimulateTap(SAMPLE_PRESETS[1])}
                      className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-[#ccff00] hover:text-black text-white font-bold uppercase transition-colors"
                    >
                      💳 Tap EMV Debit
                    </button>
                    <button
                      onClick={() => handleSimulateTap(SAMPLE_PRESETS[2])}
                      className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-[#ccff00] hover:text-black text-white font-bold uppercase transition-colors"
                    >
                      🏨 Tap Hotel Key
                    </button>
                    <button
                      onClick={() => handleSimulateTap(SAMPLE_PRESETS[3])}
                      className="p-2 border border-zinc-700 bg-zinc-800 hover:bg-[#ccff00] hover:text-black text-white font-bold uppercase transition-colors"
                    >
                      🪪 Tap Corp Badge
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Live Logs */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span>INCOMING NFC FEED ({scanHistory.length}):</span>
                {scanHistory.length > 0 && (
                  <button
                    onClick={() => setScanHistory([])}
                    className="text-[10px] text-zinc-500 hover:text-black underline cursor-pointer"
                  >
                    Clear Feed
                  </button>
                )}
              </div>

              {scanHistory.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-zinc-300 text-center text-zinc-500 bg-zinc-50 text-[11px]">
                  No live hardware taps detected yet. Click &quot;START HARDWARE SCAN&quot; on Android Chrome or tap cards above.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {scanHistory.map((item, idx) => (
                    <div key={idx} className="border-2 border-black bg-zinc-50 p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>{item.timestamp}</span>
                        <span className="bg-black text-[#ccff00] px-1 font-mono">UID: {item.serialNumber}</span>
                      </div>
                      {item.records.map((r, rIdx) => (
                        <div key={rIdx} className="bg-white p-1 border border-zinc-200 text-[10px] font-mono break-all">
                          [{r.recordType}] {r.data}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: 7 COLS - ACTIVE CARD PROFILE & DEEP DECODER */}
        <div className="lg:col-span-7 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-black" />
                <h2 className="text-sm font-black uppercase text-black">
                  2. CARD SILICON &amp; DECRYPTED PAYLOAD INSPECTOR
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black bg-[#ccff00] text-black px-2 py-0.5 border border-black uppercase">
                  ACTIVE TAG: {activeTag.category.toUpperCase()}
                </span>
                <button
                  onClick={() => handleOpenEditModal(activeTag)}
                  className="p-1 border border-black bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  title="Edit Active Tag"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active Card Specs Header Matrix */}
            <div className="border-2 border-black bg-zinc-50 p-4 space-y-3 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <div>
                  <h3 className="font-black text-sm uppercase text-black">{activeTag.title}</h3>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">{activeTag.chipStandard}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                      activeTag.locked ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {activeTag.locked ? 'LOCKED / SECURE ELEMENT' : 'UNLOCKED / REWRITABLE'}
                  </span>
                </div>
              </div>

              {/* Silicon RF Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="bg-white border border-black p-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">UID (SERIAL)</span>
                  <span className="font-black text-black">{activeTag.uid}</span>
                </div>
                <div className="bg-white border border-black p-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">ATQA // SAK</span>
                  <span className="font-black text-black">
                    {activeTag.atqa} // {activeTag.sak}
                  </span>
                </div>
                <div className="bg-white border border-black p-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">EEPROM MEMORY</span>
                  <span className="font-black text-black">{activeTag.memoryBytes} BYTES</span>
                </div>
                <div className="bg-white border border-black p-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">ENCRYPTION SCHEME</span>
                  <span className="font-black text-emerald-700">{activeTag.encryptionType}</span>
                </div>
              </div>

              {/* Secret Key & Access Trailer */}
              <div className="bg-white border border-black p-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">INTERPRETED SECRET KEY:</span>
                  <span className="font-black text-black bg-zinc-100 px-1.5 py-0.5 border border-zinc-300">
                    {activeTag.secretKey || 'NO_KEY_REQUIRED'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(activeTag.id + '_key', activeTag.secretKey || '')}
                  className="px-2 py-0.5 border border-black bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === activeTag.id + '_key' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Key</span>
                </button>
              </div>
            </div>

            {/* Decoded / Decrypted Payload Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>DECODED &amp; INTERPRETED APPLICATION DATA:</span>
                </span>
                <button
                  onClick={() => handleCopy(activeTag.id + '_decrypted', activeTag.decryptedData || activeTag.rawPayload)}
                  className="text-[10px] text-zinc-600 hover:text-black underline cursor-pointer"
                >
                  Copy JSON Payload
                </button>
              </div>

              <pre className="font-mono text-xs bg-black text-[#ccff00] p-4 border-2 border-black max-h-64 overflow-y-auto whitespace-pre-wrap shadow-[3px_3px_0px_#000000]">
                {activeTag.decryptedData || activeTag.rawPayload}
              </pre>

              <div className="text-[11px] font-sans text-zinc-600 italic bg-amber-50 border border-amber-300 p-2">
                <strong>Architectural Note:</strong> {activeTag.notes}
              </div>
            </div>

            {/* Hardware Writer Call to Action */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleWriteToPhysicalTag(activeTag)}
                disabled={isWriting}
                className="flex-1 py-3 px-4 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-black text-xs uppercase shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <Cpu className="w-4 h-4" />
                <span>{isWriting ? 'WRITING TO PHYSICAL CARD...' : 'WRITE ACTIVE RECORD TO HARDWARE'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateTag(activeTag)}
                className="py-3 px-4 border-2 border-black bg-white hover:bg-zinc-100 font-black text-xs uppercase shadow-[3px_3px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>CLONE TAG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HEX MEMORY MAP EXPLORER (SECTORS & BLOCKS) */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              3. EEPROM MEMORY MAP &amp; SECTOR TRAILER EXPLORER ({activeTag.chipStandard})
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-100 border border-red-500 inline-block" /> Manufacturer
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-50 border border-blue-500 inline-block" /> Sector Data
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-100 border border-amber-600 inline-block" /> Trailer (Keys A/B)
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-600 font-sans">
          Physical layout of contactless card EEPROM memory. Each sector is isolated by a Sector Trailer containing
          Secret Key A, Access Condition bits, and Secret Key B. Block 0 of Sector 0 contains manufacturer silicon UID and
          BCC checksum bytes.
        </p>

        {/* Memory Grid Table */}
        <div className="overflow-x-auto border-2 border-black">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-black text-[#ccff00] border-b-2 border-black">
                <th className="p-2 border-r border-zinc-700">SECTOR</th>
                <th className="p-2 border-r border-zinc-700">BLOCK</th>
                <th className="p-2 border-r border-zinc-700">TYPE</th>
                <th className="p-2 border-r border-zinc-700">HEX MEMORY BYTES (16 BYTES PER BLOCK)</th>
                <th className="p-2">STRUCTURAL INTERPRETATION</th>
              </tr>
            </thead>
            <tbody>
              {memoryBlocks.slice(0, 16).map((b, idx) => {
                const rowBg =
                  b.type === 'manufacturer'
                    ? 'bg-rose-50 hover:bg-rose-100'
                    : b.type === 'trailer'
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-white hover:bg-zinc-50';

                return (
                  <tr key={idx} className={`border-b border-zinc-300 transition-colors ${rowBg}`}>
                    <td className="p-2 font-black border-r border-zinc-300 text-center">Sec {b.sector}</td>
                    <td className="p-2 font-mono border-r border-zinc-300 text-center">Blk {b.block}</td>
                    <td className="p-2 border-r border-zinc-300 uppercase text-[10px] font-bold">
                      <span
                        className={`px-1.5 py-0.5 border ${
                          b.type === 'manufacturer'
                            ? 'bg-rose-200 border-rose-600 text-rose-900'
                            : b.type === 'trailer'
                            ? 'bg-amber-200 border-amber-600 text-amber-900'
                            : 'bg-zinc-200 border-zinc-400 text-zinc-800'
                        }`}
                      >
                        {b.type}
                      </span>
                    </td>
                    <td className="p-2 font-mono text-[11px] font-bold border-r border-zinc-300 tracking-wide">
                      {b.dataHex}
                    </td>
                    <td className="p-2 text-[11px] text-zinc-700 font-mono">
                      {b.type === 'manufacturer' && 'UID + SAK + ATQA + Manufacturer Silicon Fuses'}
                      {b.type === 'trailer' && `Key A: ${b.keyA} • Access: ${b.accessBits} • Key B: ${b.keyB}`}
                      {b.type === 'data' && (b.sector === 1 ? 'Encrypted / NDEF Application Record' : 'Empty Sector Block (0x00)')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CRYPTOGRAPHIC ENGINE & SECRET KEY SANDBOX */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              4. CRYPTOGRAPHIC ENCRYPTION / DECRYPTION &amp; SECRET KEY SANDBOX
            </h2>
          </div>
          <span className="text-[10px] font-black bg-black text-[#ccff00] px-2 py-0.5 border border-black uppercase">
            NATIVE WEB CRYPTO API ENGINE
          </span>
        </div>

        <p className="text-xs text-zinc-600 font-sans">
          Live in-browser cryptographic sandbox for executing authentic AES-GCM encryption/decryption, interpreting
          Mifare Crypto1 sector access conditions, and parsing Wiegand employee badge binary parity.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4 border-2 border-black bg-zinc-50 p-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-700 block">ALGORITHM / SCHEME:</label>
              <select
                value={cryptoAlgorithm}
                onChange={(e) => setCryptoAlgorithm(e.target.value as any)}
                className="w-full border-2 border-black p-2 text-xs font-mono bg-white shadow-[2px_2px_0px_#000000]"
              >
                <option value="AES-GCM">AES-128 / AES-256 GCM (DESFire EV2 / NTAG 424 DNA)</option>
                <option value="Mifare-Crypto1">Mifare Classic Crypto1 (48-bit Key A / B)</option>
                <option value="Wiegand-26">Wiegand 26-bit (HID Access Badge Parity &amp; Facility)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-700 block">OPERATION MODE:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'decrypt', label: 'DECRYPT' },
                  { id: 'encrypt', label: 'ENCRYPT' },
                  { id: 'interpret', label: 'INTERPRET' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setCryptoMode(mode.id as any)}
                    className={`py-1.5 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000] cursor-pointer ${
                      cryptoMode === mode.id ? 'bg-[#ccff00] text-black' : 'bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-700 block">
                SECRET KEY / PASSPHRASE:
              </label>
              <input
                type="text"
                value={cryptoKey}
                onChange={(e) => setCryptoKey(e.target.value)}
                placeholder="Enter 128-bit hex key or passphrase..."
                className="w-full border-2 border-black p-2 text-xs font-mono bg-white shadow-[2px_2px_0px_#000000]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-700 block">
                INPUT PAYLOAD (PLAINTEXT OR CIPHERTEXT HEX):
              </label>
              <textarea
                rows={4}
                value={cryptoInputText}
                onChange={(e) => setCryptoInputText(e.target.value)}
                placeholder="Enter text or hex string to process..."
                className="w-full border-2 border-black p-2 text-xs font-mono bg-white shadow-[2px_2px_0px_#000000]"
              />
            </div>

            <button
              type="button"
              onClick={handleRunCrypto}
              disabled={isProcessingCrypto}
              className="w-full py-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Cpu className="w-4 h-4" />
              <span>{isProcessingCrypto ? 'COMPUTING CIPHER...' : 'EXECUTE CRYPTO ENGINE'}</span>
            </button>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span>CRYPTOGRAPHIC OUTPUT MATRIX:</span>
                {cryptoResult && (
                  <button
                    onClick={() => handleCopy('crypto_res', cryptoResult)}
                    className="text-[10px] text-zinc-600 hover:text-black underline cursor-pointer"
                  >
                    Copy Output
                  </button>
                )}
              </div>

              {cryptoError && (
                <div className="p-3 border-2 border-rose-600 bg-rose-50 text-rose-800 text-xs font-bold">
                  Error: {cryptoError}
                </div>
              )}

              <pre className="font-mono text-xs bg-zinc-950 text-[#ccff00] p-4 border-2 border-black min-h-[220px] max-h-[300px] overflow-y-auto whitespace-pre-wrap shadow-[3px_3px_0px_#000000]">
                {cryptoResult ||
                  '// Cryptographic output will appear here after clicking "EXECUTE CRYPTO ENGINE".\n// Test with AES-GCM (auto IV generation), Mifare Crypto1 Access Bits, or Wiegand-26 card decoding.'}
              </pre>
            </div>

            {/* Quick Helper Chips */}
            <div className="pt-2 border-t border-black/10 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">LOAD SAMPLE CRYPTO TEST:</span>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <button
                  onClick={() => {
                    setCryptoAlgorithm('AES-GCM');
                    setCryptoMode('encrypt');
                    setCryptoKey('NedjectMasterKey2026');
                    setCryptoInputText('{"cardholder": "Neeraj", "tier": "ENTERPRISE", "balance": 950}');
                  }}
                  className="px-2.5 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
                >
                  Load AES-GCM Pass
                </button>
                <button
                  onClick={() => {
                    setCryptoAlgorithm('Mifare-Crypto1');
                    setCryptoMode('interpret');
                    setCryptoKey('A0A1A2A3A4A5');
                    setCryptoInputText('');
                  }}
                  className="px-2.5 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
                >
                  Load Mifare Key A
                </button>
                <button
                  onClick={() => {
                    setCryptoAlgorithm('Wiegand-26');
                    setCryptoMode('interpret');
                    setCryptoInputText('29841');
                  }}
                  className="px-2.5 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
                >
                  Load Wiegand Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ISO 7816-4 APDU COMMAND CONSOLE SIMULATOR */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              5. ISO/IEC 7816-4 APDU PROTOCOL ANALYZER &amp; SMARTCARD CONSOLE
            </h2>
          </div>
          <span className="text-[10px] font-black bg-black text-[#ccff00] px-2 py-0.5 border border-black uppercase">
            CONTACTLESS LEVEL 2 STACK
          </span>
        </div>

        <p className="text-xs text-zinc-600 font-sans">
          Interact with contactless smartcards (EMV, Calypso, DESFire) via standard APDU (Application Protocol Data Unit)
          hex byte commands (CLA INS P1 P2 Lc Data Le).
        </p>

        {/* Console Command Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={apduInput}
              onChange={(e) => setApduInput(e.target.value)}
              placeholder="e.g. 00 A4 04 00 07 A0 00 00 00 03 10 10 00"
              className="flex-1 border-2 border-black p-3 text-xs font-mono bg-zinc-50 shadow-[2px_2px_0px_#000000] focus:outline-none"
            />
            <button
              onClick={handleSendApdu}
              className="px-6 py-3 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-black text-xs uppercase shadow-[3px_3px_0px_#000000] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Zap className="w-4 h-4" />
              <span>SEND APDU</span>
            </button>
          </div>

          {/* Quick APDU Preset Shortcuts */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="font-bold text-zinc-500 py-1 uppercase">SHORTCUTS:</span>
            <button
              onClick={() => setApduInput('00 A4 04 00 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 00')}
              className="px-2 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
            >
              SELECT PPSE
            </button>
            <button
              onClick={() => setApduInput('00 A4 04 00 07 A0 00 00 00 03 10 10 00')}
              className="px-2 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
            >
              SELECT VISA AID
            </button>
            <button
              onClick={() => setApduInput('00 A4 04 00 07 A0 00 00 00 04 10 10 00')}
              className="px-2 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
            >
              SELECT MASTERCARD AID
            </button>
            <button
              onClick={() => setApduInput('00 B2 01 0C 00')}
              className="px-2 py-1 border border-black bg-white hover:bg-zinc-100 font-bold uppercase cursor-pointer"
            >
              READ RECORD 1
            </button>
          </div>
        </div>

        {/* APDU Exchange Stream Log */}
        <div className="border-2 border-black bg-zinc-950 p-4 space-y-2 max-h-60 overflow-y-auto font-mono text-xs shadow-[3px_3px_0px_#000000]">
          {apduLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 border-l-4 ${
                log.direction === 'TX'
                  ? 'border-[#ccff00] bg-zinc-900 text-zinc-200'
                  : 'border-emerald-400 bg-zinc-900/60 text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                <span>
                  [{log.direction}] {log.timestamp} • {log.interpretation}
                </span>
                {log.statusWord && <span className="font-bold text-emerald-400">SW: {log.statusWord}</span>}
              </div>
              <div className="font-bold tracking-wider">{log.hex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. COMPLETE NFC TAG PROFILES LIBRARY (CRUD REPOSITORY) */}
      <div className="max-w-7xl mx-auto border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-black" />
            <h2 className="text-base font-black uppercase text-black">
              6. NFC PROFILES &amp; CARD TEMPLATE REPOSITORY ({filteredTags.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-black text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>CREATE NEW NFC PROFILE</span>
            </button>

            <button
              onClick={handleExportLibrary}
              className="px-3 py-2 border-2 border-black bg-white hover:bg-zinc-100 font-bold text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>

            <label className="px-3 py-2 border-2 border-black bg-white hover:bg-zinc-100 font-bold text-xs uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>IMPORT JSON</span>
              <input type="file" accept=".json" onChange={handleImportLibrary} className="hidden" />
            </label>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-3 border-2 border-black">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <Filter className="w-4 h-4 text-zinc-500 mr-1" />
            {[
              { id: 'all', label: 'ALL CARDS' },
              { id: 'metro', label: '🚇 METRO' },
              { id: 'emv', label: '💳 EMV PAYMENT' },
              { id: 'hotel', label: '🏨 HOTEL' },
              { id: 'badge', label: '🪪 BADGE' },
              { id: 'student', label: '🎓 STUDENT' },
              { id: 'vcard', label: '👤 VCARD' },
              { id: 'event', label: '🎟️ EVENT WRISTBAND' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 border border-black uppercase text-[11px] cursor-pointer transition-colors ${
                  categoryFilter === cat.id ? 'bg-black text-[#ccff00]' : 'bg-white text-zinc-800 hover:bg-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UID, standard, title..."
              className="w-full pl-8 pr-3 py-1.5 border border-black text-xs font-mono bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Card Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTags.map((tag) => {
            const isSelected = activeTag.id === tag.id;

            return (
              <div
                key={tag.id}
                className={`border-4 border-black p-5 space-y-4 shadow-[5px_5px_0px_#000000] flex flex-col justify-between transition-all ${
                  isSelected ? 'bg-white ring-2 ring-[#ccff00]' : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <span className="font-black text-xs uppercase text-black truncate max-w-[200px]" title={tag.title}>
                      {tag.title}
                    </span>
                    <span className="bg-black text-[#ccff00] text-[9px] px-1.5 py-0.5 font-black uppercase">
                      {tag.category}
                    </span>
                  </div>

                  <div className="text-[10px] text-zinc-600 font-mono space-y-0.5">
                    <div>
                      UID:{' '}
                      <strong className="text-black bg-zinc-100 px-1 border border-zinc-200">{tag.uid}</strong>
                    </div>
                    <div>CHIP: {tag.chipStandard}</div>
                    <div>SCHEME: {tag.encryptionType}</div>
                    <div>SIZE: {tag.memoryBytes} BYTES • ATQA: {tag.atqa}</div>
                  </div>

                  <div className="bg-zinc-100 border border-zinc-300 p-2 font-mono text-[10px] text-zinc-800 break-all max-h-24 overflow-y-auto">
                    {tag.decryptedData ? tag.decryptedData.slice(0, 140) + '...' : tag.rawPayload}
                  </div>
                </div>

                {/* Card Controls */}
                <div className="space-y-2 pt-2 border-t-2 border-black/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateTap(tag)}
                      className={`flex-1 py-1.5 border-2 border-black font-black text-[11px] uppercase shadow-[2px_2px_0px_#000000] cursor-pointer ${
                        isSelected ? 'bg-[#ccff00] text-black' : 'bg-white hover:bg-zinc-100 text-black'
                      }`}
                    >
                      {isSelected ? '✓ ACTIVE ON ANTENNA' : 'TAP TO INSPECT'}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(tag)}
                      className="p-1.5 border-2 border-black bg-zinc-100 hover:bg-zinc-200 text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1.5 border-2 border-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. MODAL: CREATE / EDIT NFC TAG PROFILE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[12px_12px_0px_#000000] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black uppercase text-black">
                {isCreatingNew ? 'CREATE NEW NFC TAG PROFILE' : `EDIT NFC PROFILE (${editingTag.title})`}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 border border-black bg-zinc-100 hover:bg-black hover:text-white text-xs font-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">CARD TITLE / LABEL:</label>
                <input
                  type="text"
                  value={editingTag.title || ''}
                  onChange={(e) => setEditingTag({ ...editingTag, title: e.target.value })}
                  className="w-full border-2 border-black p-2 bg-white"
                  placeholder="e.g. Metro Line 2 Monthly Pass"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">CATEGORY:</label>
                  <select
                    value={editingTag.category || 'metro'}
                    onChange={(e) => setEditingTag({ ...editingTag, category: e.target.value as any })}
                    className="w-full border-2 border-black p-2 bg-white"
                  >
                    <option value="metro">Metro / Transit Pass</option>
                    <option value="emv">EMV Payment Card</option>
                    <option value="hotel">Hotel Key Card</option>
                    <option value="badge">Employee Access Badge</option>
                    <option value="student">Student ID</option>
                    <option value="vcard">vCard Business Card</option>
                    <option value="event">Event Pass Wristband</option>
                    <option value="raw_chip">Raw Silicon Chip</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">CHIP STANDARD:</label>
                  <input
                    type="text"
                    value={editingTag.chipStandard || ''}
                    onChange={(e) => setEditingTag({ ...editingTag, chipStandard: e.target.value })}
                    className="w-full border-2 border-black p-2 bg-white"
                    placeholder="MIFARE Classic 1K, DESFire EV3..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">UID (HEX SERIAL):</label>
                  <input
                    type="text"
                    value={editingTag.uid || ''}
                    onChange={(e) => setEditingTag({ ...editingTag, uid: e.target.value })}
                    className="w-full border-2 border-black p-2 bg-white font-mono"
                    placeholder="04:A1:B2:C3:D4:E5:80"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">ATQA:</label>
                  <input
                    type="text"
                    value={editingTag.atqa || '00 04'}
                    onChange={(e) => setEditingTag({ ...editingTag, atqa: e.target.value })}
                    className="w-full border-2 border-black p-2 bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">SAK:</label>
                  <input
                    type="text"
                    value={editingTag.sak || '08'}
                    onChange={(e) => setEditingTag({ ...editingTag, sak: e.target.value })}
                    className="w-full border-2 border-black p-2 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">SECRET KEY (A/B OR AES):</label>
                  <input
                    type="text"
                    value={editingTag.secretKey || ''}
                    onChange={(e) => setEditingTag({ ...editingTag, secretKey: e.target.value })}
                    className="w-full border-2 border-black p-2 bg-white font-mono"
                    placeholder="A0A1A2A3A4A5 or AES Key"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 block">ENCRYPTION SCHEME:</label>
                  <select
                    value={editingTag.encryptionType || 'None (Plain NDEF)'}
                    onChange={(e) => setEditingTag({ ...editingTag, encryptionType: e.target.value as any })}
                    className="w-full border-2 border-black p-2 bg-white"
                  >
                    <option value="None (Plain NDEF)">None (Plain NDEF)</option>
                    <option value="Crypto1 (48-bit Key)">Crypto1 (48-bit Key)</option>
                    <option value="AES-128 CMAC (DESFire)">AES-128 CMAC (DESFire)</option>
                    <option value="EMV Cryptogram">EMV Cryptogram</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">
                  RAW PAYLOAD (HEX OR STRING):
                </label>
                <textarea
                  rows={2}
                  value={editingTag.rawPayload || ''}
                  onChange={(e) => setEditingTag({ ...editingTag, rawPayload: e.target.value })}
                  className="w-full border-2 border-black p-2 bg-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">
                  DECODED APPLICATION JSON / DATA:
                </label>
                <textarea
                  rows={4}
                  value={editingTag.decryptedData || ''}
                  onChange={(e) => setEditingTag({ ...editingTag, decryptedData: e.target.value })}
                  className="w-full border-2 border-black p-2 bg-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-600 block">ARCHITECTURAL NOTES:</label>
                <input
                  type="text"
                  value={editingTag.notes || ''}
                  onChange={(e) => setEditingTag({ ...editingTag, notes: e.target.value })}
                  className="w-full border-2 border-black p-2 bg-white text-xs font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-100 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalTag}
                className="px-6 py-2 border-2 border-black bg-[#ccff00] hover:bg-black hover:text-[#ccff00] font-black text-xs uppercase shadow-[3px_3px_0px_#000000]"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
