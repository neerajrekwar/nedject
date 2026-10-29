import fs from 'fs';
import path from 'path';
import { getDb } from '@/lib/mongodb';

export * from './plans-types';
import { ManagedPlan, DEFAULT_PLANS } from './plans-types';

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
