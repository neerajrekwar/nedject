import fs from 'fs';
import path from 'path';
import { getDb } from './mongodb';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_inr' | 'fixed_usd';
  discountValue: number; // e.g. 50 (for 50%) or 200 (for ₹200)
  applicablePlans: ('all' | 'pro' | 'enterprise')[];
  applicableBillingCycles: ('all' | 'monthly' | 'yearly')[];
  maxRedemptions: number; // -1 or 0 for unlimited
  timesRedeemed: number;
  expiresAt: string | null; // ISO string or null
  isActive: boolean;
  isPinned?: boolean; // Only coupons with isPinned === true are displayed on public /payment checkout
  pinnedTag?: string; // Optional chip tag (e.g. "OFFICIAL", "LIMITED TIME")
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'cpn_winter_2026',
    code: 'WINTER2026',
    description: 'Winter Arc 2026 - 50% Off Any Subscription Plan',
    discountType: 'percentage',
    discountValue: 50,
    applicablePlans: ['all'],
    applicableBillingCycles: ['all'],
    maxRedemptions: 500,
    timesRedeemed: 28,
    expiresAt: '2026-12-31T23:59:59.000Z',
    isActive: true,
    isPinned: true,
    pinnedTag: 'OFFICIAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Admin Console',
    notes: 'Official Winter Arc launch promo voucher',
  },
  {
    id: 'cpn_pro_100_free',
    code: 'PRO100FREE',
    description: 'VIP 100% Free Pro Tier Upgrade Voucher',
    discountType: 'percentage',
    discountValue: 100,
    applicablePlans: ['pro'],
    applicableBillingCycles: ['all'],
    maxRedemptions: 100,
    timesRedeemed: 14,
    expiresAt: '2027-01-01T00:00:00.000Z',
    isActive: true,
    isPinned: false, // VIP/Free test coupons must NOT be pinned publicly by default
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Super Admin',
    notes: 'Full complimentary 100% off discount voucher for testers and VIP partners',
  },
  {
    id: 'cpn_diwali_30',
    code: 'FESTIVAL30',
    description: 'Special 30% Off on Pro & Enterprise Yearly Plans',
    discountType: 'percentage',
    discountValue: 30,
    applicablePlans: ['pro', 'enterprise'],
    applicableBillingCycles: ['yearly'],
    maxRedemptions: 1000,
    timesRedeemed: 82,
    expiresAt: '2026-11-30T23:59:59.000Z',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Marketing Desk',
    notes: 'Seasonal festival discount for annual commitments',
  },
  {
    id: 'cpn_flat_200',
    code: 'SAVE200',
    description: 'Flat ₹200 Instant Off on Pro Subscriptions',
    discountType: 'fixed_inr',
    discountValue: 200,
    applicablePlans: ['pro'],
    applicableBillingCycles: ['all'],
    maxRedemptions: 250,
    timesRedeemed: 41,
    expiresAt: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Lead Engineer',
    notes: 'Flat cash deduction promo',
  },
];

// Helper to ensure data directory and file exist
function readLocalCoupons(): Coupon[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(COUPONS_FILE)) {
      fs.writeFileSync(COUPONS_FILE, JSON.stringify(DEFAULT_COUPONS, null, 2), 'utf8');
      return DEFAULT_COUPONS;
    }
    const content = fs.readFileSync(COUPONS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(DEFAULT_COUPONS, null, 2), 'utf8');
    return DEFAULT_COUPONS;
  } catch (err) {
    console.warn('[Coupons] Error reading local coupons file:', err);
    return DEFAULT_COUPONS;
  }
}

function writeLocalCoupons(coupons: Coupon[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2), 'utf8');
  } catch (err) {
    console.error('[Coupons] Error writing local coupons file:', err);
  }
}

// Memory cache fallback
let memoryCoupons: Coupon[] = [];

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const db = await getDb();
    if (db) {
      const dbCoupons = await db.collection<Coupon>('coupons').find({}).toArray();
      if (dbCoupons && dbCoupons.length > 0) {
        return dbCoupons.map((c) => ({
          ...c,
          id: c.id || (c as any)._id?.toString(),
        }));
      }
    }
  } catch (e) {
    // Mongo fallback
  }

  const local = readLocalCoupons();
  if (local.length > 0) {
    memoryCoupons = local;
    return local;
  }

  return memoryCoupons.length > 0 ? memoryCoupons : DEFAULT_COUPONS;
}

export async function getCouponByCode(rawCode: string): Promise<Coupon | null> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return null;

  try {
    const db = await getDb();
    if (db) {
      const found = await db.collection<Coupon>('coupons').findOne({ code });
      if (found) {
        return {
          ...found,
          id: found.id || (found as any)._id?.toString(),
        };
      }
    }
  } catch (e) {}

  const all = await getAllCoupons();
  return all.find((c) => c.code.toUpperCase() === code) || null;
}

export async function createCoupon(data: Partial<Coupon> & { code: string }): Promise<Coupon> {
  const normalizedCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!normalizedCode) {
    throw new Error('Coupon code cannot be empty.');
  }

  const existing = await getCouponByCode(normalizedCode);
  if (existing) {
    throw new Error(`Coupon code "${normalizedCode}" already exists.`);
  }

  const now = new Date().toISOString();
  const newCoupon: Coupon = {
    id: `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code: normalizedCode,
    description: data.description || `${normalizedCode} Promo Voucher`,
    discountType: data.discountType || 'percentage',
    discountValue: Number(data.discountValue) || 10,
    applicablePlans: data.applicablePlans && data.applicablePlans.length > 0 ? data.applicablePlans : ['all'],
    applicableBillingCycles: data.applicableBillingCycles && data.applicableBillingCycles.length > 0 ? data.applicableBillingCycles : ['all'],
    maxRedemptions: data.maxRedemptions !== undefined ? Number(data.maxRedemptions) : -1,
    timesRedeemed: 0,
    expiresAt: data.expiresAt || null,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy || 'Admin',
    notes: data.notes || '',
  };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('coupons').insertOne({ ...newCoupon });
    }
  } catch (e) {
    console.warn('[Coupons] Note: mongo write failed, saving to local json:', e);
  }

  const local = readLocalCoupons();
  local.unshift(newCoupon);
  writeLocalCoupons(local);
  memoryCoupons = local;

  return newCoupon;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
  const now = new Date().toISOString();
  const cleanUpdates = { ...updates, updatedAt: now };

  if (cleanUpdates.code) {
    cleanUpdates.code = cleanUpdates.code.trim().toUpperCase();
  }

  try {
    const db = await getDb();
    if (db) {
      await db.collection('coupons').updateOne({ id }, { $set: cleanUpdates });
    }
  } catch (e) {}

  const local = readLocalCoupons();
  const index = local.findIndex((c) => c.id === id);
  if (index >= 0) {
    local[index] = { ...local[index], ...cleanUpdates };
    writeLocalCoupons(local);
    memoryCoupons = local;
    return local[index];
  }

  return null;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('coupons').deleteOne({ id });
    }
  } catch (e) {}

  const local = readLocalCoupons();
  const filtered = local.filter((c) => c.id !== id);
  writeLocalCoupons(filtered);
  memoryCoupons = filtered;
  return true;
}

export async function recordCouponRedemption(code: string, userEmail?: string): Promise<boolean> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return false;

  const newCount = (coupon.timesRedeemed || 0) + 1;

  try {
    const db = await getDb();
    if (db) {
      await db.collection('coupons').updateOne(
        { code: coupon.code },
        { 
          $set: { timesRedeemed: newCount, updatedAt: new Date().toISOString() },
          $push: { redemptions: { userEmail: userEmail || 'anonymous', redeemedAt: new Date().toISOString() } } as any
        }
      );
    }
  } catch (e) {}

  const local = readLocalCoupons();
  const found = local.find((c) => c.code === coupon.code);
  if (found) {
    found.timesRedeemed = newCount;
    found.updatedAt = new Date().toISOString();
    writeLocalCoupons(local);
  }

  return true;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: Coupon;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  savingsPercentage: number;
  isFreeUpgrade: boolean;
  currency: string;
}

/**
 * Validates a coupon code against a specific plan, billing cycle, and base price
 */
export async function validateCouponForPlan({
  rawCode,
  planId,
  billingCycle,
  currency = 'INR',
  basePrice,
}: {
  rawCode: string;
  planId: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  currency?: string;
  basePrice: number;
}): Promise<CouponValidationResult> {
  const coupon = await getCouponByCode(rawCode);

  if (!coupon) {
    return {
      valid: false,
      error: `Coupon "${rawCode.toUpperCase()}" does not exist. Check code and try again.`,
      originalPrice: basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      savingsPercentage: 0,
      isFreeUpgrade: false,
      currency,
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is currently deactivated or suspended.`,
      coupon,
      originalPrice: basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      savingsPercentage: 0,
      isFreeUpgrade: false,
      currency,
    };
  }

  // Check expiration
  if (coupon.expiresAt) {
    const expiry = new Date(coupon.expiresAt).getTime();
    if (expiry < Date.now()) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" has expired on ${new Date(coupon.expiresAt).toLocaleDateString()}.`,
        coupon,
        originalPrice: basePrice,
        discountAmount: 0,
        finalPrice: basePrice,
        savingsPercentage: 0,
        isFreeUpgrade: false,
        currency,
      };
    }
  }

  // Check max redemptions
  if (coupon.maxRedemptions > 0 && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" has reached its maximum quota of ${coupon.maxRedemptions} redemptions.`,
      coupon,
      originalPrice: basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      savingsPercentage: 0,
      isFreeUpgrade: false,
      currency,
    };
  }

  // Check applicable plans
  const planMatch =
    coupon.applicablePlans.includes('all') ||
    coupon.applicablePlans.includes(planId);

  if (!planMatch) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is only applicable to ${coupon.applicablePlans.join(', ').toUpperCase()} tiers.`,
      coupon,
      originalPrice: basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      savingsPercentage: 0,
      isFreeUpgrade: false,
      currency,
    };
  }

  // Check applicable billing cycle
  const cycleMatch =
    coupon.applicableBillingCycles.includes('all') ||
    coupon.applicableBillingCycles.includes(billingCycle);

  if (!cycleMatch) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is only applicable to ${coupon.applicableBillingCycles.join(', ').toUpperCase()} billing cycles.`,
      coupon,
      originalPrice: basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      savingsPercentage: 0,
      isFreeUpgrade: false,
      currency,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, coupon.discountValue));
    discount = Math.round((basePrice * pct) / 100);
  } else if (coupon.discountType === 'fixed_inr') {
    if (currency === 'INR') {
      discount = Math.min(basePrice, coupon.discountValue);
    } else {
      // rough convert INR discount to USD (~85 INR = $1)
      const approxUsd = Math.round(coupon.discountValue / 85);
      discount = Math.min(basePrice, approxUsd);
    }
  } else if (coupon.discountType === 'fixed_usd') {
    if (currency === 'USD') {
      discount = Math.min(basePrice, coupon.discountValue);
    } else {
      // convert USD to INR (~85 INR = $1)
      const approxInr = coupon.discountValue * 85;
      discount = Math.min(basePrice, approxInr);
    }
  }

  const finalPrice = Math.max(0, basePrice - discount);
  const isFreeUpgrade = finalPrice === 0;
  const savingsPct = basePrice > 0 ? Math.round((discount / basePrice) * 100) : 100;

  return {
    valid: true,
    coupon,
    originalPrice: basePrice,
    discountAmount: discount,
    finalPrice,
    savingsPercentage: savingsPct,
    isFreeUpgrade,
    currency,
  };
}

/**
 * Returns only coupons that have been explicitly pinned by an admin in /admin/coupons
 * Filters out expired, deactivated, or exhausted coupons.
 */
export async function getPinnedPublicCoupons(): Promise<
  Array<{
    code: string;
    label: string;
    tag: string;
    description: string;
    discountType: string;
    discountValue: number;
    applicablePlans: string[];
  }>
> {
  const all = await getAllCoupons();
  const now = new Date();

  return all
    .filter((c) => {
      if (!c.isActive || !c.isPinned) return false;
      if (c.expiresAt && new Date(c.expiresAt) < now) return false;
      if (c.maxRedemptions > 0 && c.timesRedeemed >= c.maxRedemptions) return false;
      return true;
    })
    .map((c) => ({
      code: c.code,
      label:
        c.discountType === 'percentage'
          ? `${c.discountValue}% OFF`
          : c.discountType === 'fixed_inr'
          ? `FLAT ₹${c.discountValue} OFF`
          : `FLAT $${c.discountValue} OFF`,
      tag: c.pinnedTag || (c.discountValue === 100 ? 'PROMO' : 'OFFER'),
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      applicablePlans: c.applicablePlans,
    }));
}

