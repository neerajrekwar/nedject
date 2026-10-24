import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

interface AdminRecord {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  salt: string;
  hash: string;
  avatar?: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

async function findAdminCredentials(targetEmail: string): Promise<AdminRecord | null> {
  const normalized = targetEmail.trim().toLowerCase();

  // 1. Check local .admin-credentials.json set via terminal
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      const data = JSON.parse(raw);

      if (data && Array.isArray(data.admins)) {
        const found = data.admins.find((a: any) => a.email && a.email.trim().toLowerCase() === normalized);
        if (found && found.hash && found.salt) {
          return {
            id: found.id || 'admin-terminal-owner',
            email: found.email.trim().toLowerCase(),
            name: found.name || 'Neeraj Rekwar',
            role: found.role || 'Super Admin',
            salt: found.salt,
            hash: found.hash,
            avatar: found.avatar,
          };
        }
      }

      // Check top-level single admin format
      if (data && data.email && data.email.trim().toLowerCase() === normalized && data.hash && data.salt) {
        return {
          id: 'admin-terminal-owner',
          email: data.email.trim().toLowerCase(),
          name: data.name || 'Neeraj Rekwar',
          role: data.role || 'Super Admin',
          salt: data.salt,
          hash: data.hash,
          avatar: data.avatar,
        };
      }
    } catch (e) {
      console.warn('Error reading .admin-credentials.json:', e);
    }
  }

  // 2. Check MongoDB collection 'admin_credentials'
  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection('admin_credentials').findOne({ email: normalized });
      if (doc && doc.hash && doc.salt) {
        return {
          id: doc._id?.toString() || 'admin-mongo-owner',
          email: doc.email.trim().toLowerCase(),
          name: doc.name || 'Neeraj Rekwar',
          role: doc.role || 'Super Admin',
          salt: doc.salt,
          hash: doc.hash,
          avatar: doc.avatar,
        };
      }
    }
  } catch (err) {
    console.warn('MongoDB admin lookup error:', err);
  }

  // 3. Fallback to environment variables if provided
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const envEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (envEmail === normalized) {
      const salt = 'env_salt_default';
      const hash = hashPassword(process.env.ADMIN_PASSWORD, salt);
      return {
        id: 'admin-env-owner',
        email: envEmail,
        name: 'Neeraj Rekwar',
        role: 'Super Admin',
        salt,
        hash,
      };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputPassword = body.password || '';

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const admin = await findAdminCredentials(inputEmail);
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: `No admin account configured for ${inputEmail}. Run "npx admin-auth seed --email ${inputEmail}" in terminal to create admin account.`,
        },
        { status: 403 }
      );
    }

    // Verify password hash
    const testHash = hashPassword(inputPassword, admin.salt);
    if (testHash !== admin.hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password.' },
        { status: 401 }
      );
    }

    // Success response with admin user payload
    const user = {
      id: admin.id || 'admin-terminal-owner',
      email: admin.email,
      name: admin.name || 'Neeraj Rekwar',
      role: (admin.role as any) || 'Super Admin',
      avatar:
        admin.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      lastLogin: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      user,
    });

    // Set secure admin cookie
    response.cookies.set('nedject_admin_token', 'authorized', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
