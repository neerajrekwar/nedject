import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/mongodb';

export * from './plans-types';
import { ManagedPlan, DEFAULT_PLANS } from './plans-types';

const PLANS_FILE = path.join(process.cwd(), 'data', 'plans.json');

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
}

export function readLocalPlans(): ManagedPlan[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PLANS_FILE)) {
      const content = fs.readFileSync(PLANS_FILE, 'utf-8');
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
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2), 'utf-8');
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
        return records.map((r: any) => {
          const defaultPlan = DEFAULT_PLANS.find((p) => p.id === r.id);
          const rawPricing = r.pricing || defaultPlan?.pricing || DEFAULT_PLANS[0].pricing;
          const mergedPricing: any = {};
          const currencies = ['USD', 'INR', 'EUR', 'GBP', 'RUB'] as const;
          for (const c of currencies) {
            mergedPricing[c] = {
              monthly: Number(rawPricing[c]?.monthly ?? defaultPlan?.pricing[c]?.monthly ?? 0),
              yearly: Number(rawPricing[c]?.yearly ?? defaultPlan?.pricing[c]?.yearly ?? 0),
              lifetime: Number(
                rawPricing[c]?.lifetime ??
                  defaultPlan?.pricing[c]?.lifetime ??
                  (Number(rawPricing[c]?.yearly || 0) * 2 || 0)
              ),
            };
          }

          return {
            id: r.id || r._id?.toString(),
            name: r.name,
            badge: r.badge,
            description: r.description,
            generationLimit: Number(r.generationLimit) || defaultPlan?.generationLimit || 10,
            creditType: r.creditType || defaultPlan?.creditType || (r.generationLimit > 50000 ? 'unlimited' : 'credits'),
            monthlyCredits: Number(r.monthlyCredits ?? defaultPlan?.monthlyCredits ?? r.generationLimit ?? 10),
            apiAccess: r.apiAccess !== undefined ? Boolean(r.apiAccess) : (defaultPlan?.apiAccess ?? true),
            rateLimitRpm: Number(r.rateLimitRpm ?? defaultPlan?.rateLimitRpm ?? 60),
            allowedOriginsLimit: Number(r.allowedOriginsLimit ?? defaultPlan?.allowedOriginsLimit ?? 5),
            active: r.active !== false,
            pricing: mergedPricing,
            cycles: r.cycles || defaultPlan?.cycles,
            features: Array.isArray(r.features) ? r.features : defaultPlan?.features || [],
            updatedAt: r.updatedAt,
          };
        });
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
