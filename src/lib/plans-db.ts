import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/mongodb';

export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'RUB';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  RUB: '₽',
};

export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  USD: 'US Dollar ($)',
  INR: 'Indian Rupee (₹)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  RUB: 'Russian Ruble (₽)',
};

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
}

export interface ManagedPlan {
  id: 'free' | 'pro' | 'enterprise' | string;
  name: string;
  badge?: string;
  description: string;
  generationLimit: number;
  active: boolean;
  pricing: Record<SupportedCurrency, PlanPricing>;
  features: PlanFeature[];
  updatedAt?: string;
}

export const DEFAULT_PLANS: ManagedPlan[] = [
  {
    id: 'free',
    name: 'Nedject Free Tier',
    description: 'Essential optical tools for casual and hobbyist printing.',
    generationLimit: 10,
    active: true,
    pricing: {
      USD: { monthly: 0, yearly: 0 },
      INR: { monthly: 0, yearly: 0 },
      EUR: { monthly: 0, yearly: 0 },
      GBP: { monthly: 0, yearly: 0 },
      RUB: { monthly: 0, yearly: 0 },
    },
    features: [
      { text: '2 Guest / 10 Authenticated Generations', included: true },
      { text: 'Standard 300 DPI PNG Canvas Output', included: true },
      { text: 'High-contrast B/W Print Calibration', included: true },
      { text: 'Basic Barcode Pick (Code128, EAN-13, UPC)', included: true },
      { text: 'Normal Photo DPI Upscaler (150-300 DPI)', included: true },
      { text: '600 DPI Vector PDF & CMYK Color Separation', included: false },
      { text: 'Batch ZIP Matrix & Event Pass Generator', included: false },
      { text: 'Priority Server Queue & Unlimited Generations', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Nedject Pro Studio',
    badge: 'MOST POPULAR',
    description: 'High-performance optical engine for creators, print designers & businesses.',
    generationLimit: 99999,
    active: true,
    pricing: {
      USD: { monthly: 9, yearly: 79 },
      INR: { monthly: 499, yearly: 3999 },
      EUR: { monthly: 8, yearly: 75 },
      GBP: { monthly: 7, yearly: 69 },
      RUB: { monthly: 799, yearly: 6999 },
    },
    features: [
      { text: 'UNLIMITED 300 & 600 DPI Generations', included: true, highlight: true },
      { text: '600 DPI Vector PDF (Print Press Ready)', included: true, highlight: true },
      { text: 'Full Barcode Suite (All 8 Industrial Formats)', included: true },
      { text: 'Batch ZIP Matrix & Automated Pass Export', included: true },
      { text: 'Photo QR Visual Blend & Logo Overlay Matrix', included: true },
      { text: 'Persistent Cloud Storage & Cross-Device Sync', included: true },
      { text: 'Zero Watermark & Full Commercial License', included: true },
      { text: 'VIP Discord Support & Priority Processing', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Nedject Enterprise Matrix',
    badge: 'ENTERPRISE',
    description: 'Maximum throughput and custom integrations for high-volume workflows.',
    generationLimit: 99999,
    active: true,
    pricing: {
      USD: { monthly: 29, yearly: 249 },
      INR: { monthly: 1999, yearly: 14999 },
      EUR: { monthly: 27, yearly: 229 },
      GBP: { monthly: 24, yearly: 199 },
      RUB: { monthly: 2499, yearly: 19999 },
    },
    features: [
      { text: 'Everything in Pro Studio Included', included: true, highlight: true },
      { text: 'Unlimited Batch Matrix & Event Pass Generation', included: true, highlight: true },
      { text: 'Dedicated Vector PDF Press Profile & Preflight Check', included: true },
      { text: 'Custom CMYK/RGB Optical Color Calibration Curves', included: true },
      { text: 'Team Quota Sharing & Multi-Seat Sub-Accounts', included: true },
      { text: 'Priority Server Queue & Ultra-Low Latency Rendering', included: true },
      { text: '99.9% Uptime SLA & Dedicated Technical Account Manager', included: true },
      { text: 'Custom Contract & GST / VAT Invoice Provisioning', included: true },
    ],
  },
];

const LOCAL_PLANS_FILE = path.join(process.cwd(), 'src', 'data', 'plans.json');

function ensureDataDir() {
  const dir = path.dirname(LOCAL_PLANS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readLocalPlans(): ManagedPlan[] {
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_PLANS_FILE)) {
      const content = fs.readFileSync(LOCAL_PLANS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[PlansDB] Failed reading local plans file, using default seed:', err);
  }
  return DEFAULT_PLANS;
}

export function writeLocalPlans(plans: ManagedPlan[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_PLANS_FILE, JSON.stringify(plans, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[PlansDB] Failed writing local plans file:', err);
    return false;
  }
}

/**
 * Get all managed plans from MongoDB, falling back to local file and defaults
 */
export async function getAllPlans(): Promise<ManagedPlan[]> {
  try {
    const db = await getDb();
    if (db) {
      const records = await db.collection('plans').find({}).toArray();
      if (records && records.length > 0) {
        return records.map((r: any) => ({
          id: r.id || r._id?.toString(),
          name: r.name,
          badge: r.badge,
          description: r.description,
          generationLimit: Number(r.generationLimit) || 10,
          active: r.active !== false,
          pricing: r.pricing || DEFAULT_PLANS.find(p => p.id === r.id)?.pricing || DEFAULT_PLANS[0].pricing,
          features: Array.isArray(r.features) ? r.features : [],
          updatedAt: r.updatedAt,
        }));
      }
    }
  } catch (err) {
    console.warn('[PlansDB] MongoDB getAllPlans fallback to local:', err);
  }

  return readLocalPlans();
}

/**
 * Save or update a managed plan (Admin Only)
 */
export async function savePlan(plan: ManagedPlan): Promise<ManagedPlan> {
  const now = new Date().toISOString();
  const updatedPlan: ManagedPlan = {
    ...plan,
    updatedAt: now,
  };

  // 1. Update in MongoDB
  try {
    const db = await getDb();
    if (db) {
      await db.collection('plans').updateOne(
        { id: plan.id },
        { $set: { ...updatedPlan } },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn('[PlansDB] MongoDB savePlan notice:', err);
  }

  // 2. Update local JSON backup
  try {
    const currentPlans = readLocalPlans();
    const index = currentPlans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      currentPlans[index] = updatedPlan;
    } else {
      currentPlans.push(updatedPlan);
    }
    writeLocalPlans(currentPlans);
  } catch (err) {
    console.warn('[PlansDB] Local savePlan notice:', err);
  }

  return updatedPlan;
}

/**
 * Reset plans to default seed
 */
export async function resetPlansToDefault(): Promise<ManagedPlan[]> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('plans').deleteMany({});
      for (const p of DEFAULT_PLANS) {
        await db.collection('plans').insertOne({ ...p, updatedAt: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.warn('[PlansDB] Reset default notice:', err);
  }

  writeLocalPlans(DEFAULT_PLANS);
  return DEFAULT_PLANS;
}
