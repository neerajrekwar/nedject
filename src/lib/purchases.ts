import { getDb } from './mongodb';
import fs from 'fs';
import path from 'path';
import { formatCurrencyAmount, getCurrencySymbol, SupportedCurrency } from './plans-types';

export interface PurchaseItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseRecord {
  _id?: string;
  id: string; // Unique purchase ID (e.g. pur_...)
  userId?: string;
  userEmail: string;
  userName?: string;
  plan: 'free' | 'pro' | 'enterprise' | string;
  planName: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  billingCycle: 'monthly' | 'annual' | 'one-time' | 'lifetime';
  gateway: 'Razorpay' | 'Card' | 'Coupon Promo' | 'Admin Override' | string;
  paymentId?: string;
  orderId?: string;
  status: 'Paid' | 'Active' | 'Pending' | 'Refunded' | 'Cancelled';
  invoiceId: string; // e.g. INV-2026-1042
  date: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
  taxAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  items?: PurchaseItem[];
  customerDetails?: {
    name?: string;
    email: string;
    occupation?: string;
    dob?: string;
  };
}

const PURCHASES_BACKUP_FILE = path.join(process.cwd(), 'data', 'purchases.json');

// Ensure local data backup directory exists
function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
}

function readLocalPurchases(): PurchaseRecord[] {
  ensureDataDir();
  if (fs.existsSync(PURCHASES_BACKUP_FILE)) {
    try {
      const raw = fs.readFileSync(PURCHASES_BACKUP_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn('[Purchases] Error reading purchases.json backup:', e);
    }
  }
  return [];
}

function writeLocalPurchases(records: PurchaseRecord[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(PURCHASES_BACKUP_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Purchases] Error saving purchases.json backup:', e);
  }
}

/**
 * Generate a consistent, sequential or random industrial invoice ID: INV-YYYY-XXXX
 */
export function generateInvoiceId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${rand}`;
}

/**
 * Fetch all purchase and invoice records from the 'purchases' collection in MongoDB for a user
 */
export async function getPurchasesForUser(
  userEmail: string,
  userId?: string
): Promise<PurchaseRecord[]> {
  if (!userEmail && !userId) return [];
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  try {
    const db = await getDb();
    let userCurrencyFromDb = '';
    if (db) {
      try {
        const uDoc = await db.collection('users').findOne({
          email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
        });
        if (uDoc?.currency) userCurrencyFromDb = uDoc.currency.toUpperCase();
      } catch {}
    }

    const isIndianUser =
      normalizedEmail.includes('neerajrekwar') ||
      normalizedEmail.endsWith('.in') ||
      userCurrencyFromDb === 'INR';

    if (db) {
      const query: any = {
        $or: [
          { userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } },
          { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } },
        ],
      };

      if (userId) {
        query.$or.push({ userId });
      }

      const docs = await db
        .collection('purchases')
        .find(query)
        .sort({ date: -1, createdAt: -1 })
        .toArray();

      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          let currency = (doc.currency || userCurrencyFromDb || (isIndianUser ? 'INR' : 'USD')).toUpperCase();
          if (doc.amountFormatted && doc.amountFormatted.includes('₹')) {
            currency = 'INR';
          } else if (isIndianUser && (Number(doc.amount) === 0 || doc.gateway === 'Razorpay' || doc.gateway === 'Admin Override')) {
            currency = 'INR';
          }
          const amount = Number(doc.amount) || 0;
          let amountFormatted = doc.amountFormatted;
          // If stored formatted amount has dollar sign but user bought in INR, reformat with INR symbol ₹
          if (!amountFormatted || (currency === 'INR' && amountFormatted.startsWith('$'))) {
            amountFormatted = formatCurrencyAmount(amount, currency);
          } else if (amount === 0 && currency === 'INR' && amountFormatted.includes('$')) {
            amountFormatted = 'FREE (Admin Granted)';
          }

          return {
            _id: doc._id?.toString(),
            id: doc.id || `pur_${doc._id?.toString().slice(-8)}`,
            userId: doc.userId,
            userEmail: doc.userEmail || doc.email || normalizedEmail,
            userName: doc.userName || doc.name || 'User',
            plan: doc.plan || 'pro',
            planName: doc.planName || (doc.plan === 'enterprise' ? 'Enterprise Studio Pass' : 'Pro Athlete Pass'),
            amount,
            amountFormatted,
            currency,
            billingCycle: doc.billingCycle || 'monthly',
            gateway: doc.gateway || 'Razorpay',
            paymentId: doc.paymentId || doc.razorpay_payment_id || 'pay_verified',
            orderId: doc.orderId || doc.razorpay_order_id,
            status: doc.status || 'Paid',
            invoiceId: doc.invoiceId || generateInvoiceId(),
            date: doc.date || doc.createdAt || new Date().toISOString(),
            createdAt: doc.createdAt || doc.date || new Date().toISOString(),
            taxAmount: doc.taxAmount || 0,
            discountAmount: doc.discountAmount || 0,
            couponCode: doc.couponCode,
            items: doc.items || [
              {
                description: `${doc.planName || 'Nedject Subscription'} - 300/600 DPI Calibrated Matrix`,
                quantity: 1,
                unitPrice: amount,
                total: amount,
              },
            ],
            customerDetails: doc.customerDetails || {
              name: doc.userName || doc.name,
              email: normalizedEmail,
            },
          };
        });
      }

      // If user currently has an upgraded plan (pro or enterprise) in the users collection,
      // but no purchases document was created yet, create an initial recorded purchase!
      const userDoc = await db.collection('users').findOne({
        email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
      });

      if (userDoc && (userDoc.plan === 'pro' || userDoc.plan === 'enterprise')) {
        const isEnt = userDoc.plan === 'enterprise';
        const initialPlanName = isEnt ? 'Enterprise Studio Pass (Annual)' : 'Pro Athlete Pass (Monthly)';
        const initialCurrency = (userDoc.currency || (isIndianUser ? 'INR' : 'USD')).toUpperCase();
        
        let initialAmount = 0;
        if (initialCurrency === 'INR') {
          initialAmount = isEnt ? 14999 : 499;
        } else {
          initialAmount = isEnt ? 249.0 : 9.99;
        }

        const initialInvoiceId = generateInvoiceId();
        const initialDate = userDoc.updatedAt || userDoc.createdAt || new Date().toISOString();
        const formattedAmount = formatCurrencyAmount(initialAmount, initialCurrency);

        const seedRecord: PurchaseRecord = {
          id: `pur_init_${userDoc._id?.toString().slice(-6) || Date.now().toString(36)}`,
          userId: userDoc._id?.toString() || userId,
          userEmail: normalizedEmail,
          userName: userDoc.name || 'Subscriber',
          plan: userDoc.plan,
          planName: initialPlanName,
          amount: initialAmount,
          amountFormatted: formattedAmount,
          currency: initialCurrency,
          billingCycle: isEnt ? 'annual' : 'monthly',
          gateway: userDoc.planAssignedBy === 'admin' ? 'Admin Override' : 'Razorpay',
          paymentId: 'pay_sub_verified_01',
          orderId: 'order_sub_01',
          status: 'Paid',
          invoiceId: initialInvoiceId,
          date: initialDate,
          createdAt: initialDate,
          taxAmount: 0,
          discountAmount: 0,
          items: [
            {
              description: `${initialPlanName} — Unlimited 300/600 DPI Barcode & Optical Studio Pass`,
              quantity: 1,
              unitPrice: initialAmount,
              total: initialAmount,
            },
          ],
          customerDetails: {
            name: userDoc.name,
            email: normalizedEmail,
            occupation: userDoc.occupation,
            dob: userDoc.dob,
          },
        };

        // Insert into MongoDB purchases collection
        try {
          await db.collection('purchases').insertOne({ ...seedRecord } as any);
        } catch (e) {
          console.warn('[Purchases] Auto-seed insert notice:', e);
        }

        return [seedRecord];
      }
    }
  } catch (err) {
    console.warn('[Purchases] MongoDB query error, falling back to local file:', err);
  }

  // Local backup fallback
  const localList = readLocalPurchases();
  return localList.filter(
    (p) =>
      p.userEmail.toLowerCase() === normalizedEmail ||
      (userId && p.userId === userId)
  );
}

/**
 * Record a new completed purchase into the 'purchases' collection
 */
export async function createPurchaseRecord(
  data: Partial<PurchaseRecord> & { userEmail: string; plan: string }
): Promise<PurchaseRecord> {
  const now = new Date().toISOString();
  const invoiceId = data.invoiceId || generateInvoiceId();
  const amount = Number(data.amount) || 0;
  const isEnt = data.plan === 'enterprise';
  const planName = data.planName || (isEnt ? 'Enterprise Studio Pass' : 'Pro Athlete Pass');
  const isIndianUser =
    data.userEmail.toLowerCase().includes('neerajrekwar') ||
    data.userEmail.toLowerCase().endsWith('.in');
  let currency = (data.currency || (isIndianUser ? 'INR' : 'USD')).toUpperCase();
  if (isIndianUser && (amount === 0 || data.gateway === 'Razorpay' || data.gateway === 'Admin Override')) {
    currency = 'INR';
  }

  let amountFormatted = data.amountFormatted;
  if (!amountFormatted || (currency === 'INR' && amountFormatted.startsWith('$'))) {
    amountFormatted = amount === 0 ? 'FREE (Admin Granted)' : formatCurrencyAmount(amount, currency);
  }

  const record: PurchaseRecord = {
    id: data.id || `pur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: data.userId,
    userEmail: data.userEmail.trim().toLowerCase(),
    userName: data.userName || 'Subscriber',
    plan: data.plan,
    planName,
    amount,
    amountFormatted,
    currency,
    billingCycle: data.billingCycle || (data.plan.includes('annual') ? 'annual' : 'monthly'),
    gateway: data.gateway || 'Razorpay',
    paymentId: data.paymentId || `pay_${Date.now()}`,
    orderId: data.orderId || `order_${Date.now()}`,
    status: data.status || 'Paid',
    invoiceId,
    date: data.date || now,
    createdAt: now,
    updatedAt: now,
    taxAmount: data.taxAmount || 0,
    discountAmount: data.discountAmount || 0,
    couponCode: data.couponCode,
    items: data.items || [
      {
        description: `${planName} - High-DPI Calibration Matrix & Symbologies`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ],
    customerDetails: data.customerDetails || {
      name: data.userName,
      email: data.userEmail,
    },
  };

  // 1. Save to MongoDB 'purchases' collection
  try {
    const db = await getDb();
    if (db) {
      await db.collection('purchases').insertOne({ ...record } as any);
    }
  } catch (err) {
    console.warn('[Purchases] Failed to insert to MongoDB purchases:', err);
  }

  // 2. Save to local data backup
  try {
    const localRecords = readLocalPurchases();
    localRecords.unshift(record);
    writeLocalPurchases(localRecords);
  } catch (err) {
    console.warn('[Purchases] Failed to save to local backup:', err);
  }

  return record;
}
