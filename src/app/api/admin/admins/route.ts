import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function getStoredAdmins() {
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.admins)) return data.admins;
      if (data.email) return [data];
    } catch (e) {}
  }
  return [];
}

function saveStoredAdmins(admins: any[]) {
  const primary = admins[0] || null;
  const payload = {
    email: primary ? primary.email : '',
    name: primary ? primary.name : 'Neeraj Rekwar',
    role: primary ? primary.role : 'Super Admin',
    salt: primary ? primary.salt : '',
    hash: primary ? primary.hash : '',
    updatedAt: new Date().toISOString(),
    admins,
  };
  fs.writeFileSync(CREDS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const db = await getDb();
    let mongoAdmins: any[] = [];
    if (db) {
      mongoAdmins = await db.collection('admin_credentials').find({}).toArray();
    }

    const local = getStoredAdmins();
    const map = new Map<string, any>();

    for (const a of local) {
      if (a.email) map.set(a.email.toLowerCase(), a);
    }
    for (const a of mongoAdmins) {
      if (a.email) map.set(a.email.toLowerCase(), { ...map.get(a.email.toLowerCase()), ...a });
    }

    const list = Array.from(map.values()).map((a, idx) => ({
      id: a.id || a._id?.toString() || `admin-${idx}`,
      email: a.email,
      name: a.name || 'Admin',
      role: a.role || 'Super Admin',
      updatedAt: a.updatedAt || new Date().toISOString(),
      isPrimary: idx === 0,
      hashPreview: a.hash ? `${a.hash.slice(0, 16)}...` : undefined,
    }));

    return NextResponse.json({
      success: true,
      admins: list,
      total: list.length,
      algorithm: 'PBKDF2-SHA512 (100,000 iterations)',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const name = body.name || 'Admin User';
    const role = body.role || 'Super Admin';

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const now = new Date().toISOString();

    const newAdmin = {
      id: `admin-${Date.now()}`,
      email,
      name,
      role,
      salt,
      hash,
      createdAt: now,
      updatedAt: now,
    };

    const current = getStoredAdmins().filter((a: any) => a.email.toLowerCase() !== email);
    current.push(newAdmin);
    saveStoredAdmins(current);

    const db = await getDb();
    if (db) {
      await db.collection('admin_credentials').updateOne(
        { email },
        { $set: newAdmin },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Admin account for ${email} created successfully`,
      admin: { email, name, role },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;
    const name = body.name;
    const role = body.role;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required for update' }, { status: 400 });
    }

    const current = getStoredAdmins();
    const idx = current.findIndex((a: any) => a.email.toLowerCase() === email);

    if (idx < 0) {
      return NextResponse.json({ success: false, error: 'Admin account not found' }, { status: 404 });
    }

    const target = current[idx];
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      target.salt = crypto.randomBytes(16).toString('hex');
      target.hash = hashPassword(password, target.salt);
    }
    if (name) target.name = name;
    if (role) target.role = role;
    target.updatedAt = new Date().toISOString();

    current[idx] = target;
    saveStoredAdmins(current);

    const db = await getDb();
    if (db) {
      await db.collection('admin_credentials').updateOne(
        { email },
        { $set: target },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Admin account ${email} updated successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email parameter is required' }, { status: 400 });
    }

    const current = getStoredAdmins().filter((a: any) => a.email.toLowerCase() !== email);
    saveStoredAdmins(current);

    const db = await getDb();
    if (db) {
      await db.collection('admin_credentials').deleteOne({ email });
    }

    return NextResponse.json({
      success: true,
      message: `Admin account ${email} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
