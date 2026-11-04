import { getDb } from './mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  validateEmailForAuth,
  getCanonicalEmail,
  generateVerificationCode,
} from './email-security';
import { sendVerificationCodeEmail } from './email';

export interface GoogleFitUserTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
  updatedAt: string;
}

export interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  canonicalEmail?: string;
  dob: string; // Date of Birth YYYY-MM-DD
  occupation: string;
  passwordHash?: string;
  provider: 'google' | 'x' | 'instagram' | 'credentials';
  providerAccountId?: string;
  image?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise' | string;
  subscriptionBillingCycle?: 'monthly' | 'annual' | 'lifetime' | string | null;
  subscriptionStatus?: 'active' | 'none' | 'cancelled' | string;
  subscriptionExpiresAt?: string | null;
  planAssignedBy?: string;
  generationsLimit: number;
  generationsUsed: number;
  googleFitTokens?: GoogleFitUserTokens;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback if MongoDB connection is unavailable during runtime
const memoryUsers = new Map<string, UserProfile>();

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const canonical = getCanonicalEmail(normalizedEmail);
  const db = await getDb();

  if (db) {
    try {
      const user = await db.collection<UserProfile>('users').findOne({
        $or: [
          { email: normalizedEmail },
          { canonicalEmail: canonical },
        ],
      });
      if (user) {
        return {
          ...user,
          _id: user._id?.toString(),
        };
      }
    } catch (e) {
      console.warn('Failed to find user in MongoDB, checking fallback:', e);
    }
  }

  for (const u of memoryUsers.values()) {
    if (u.email === normalizedEmail || (u.canonicalEmail && u.canonicalEmail === canonical)) {
      return u;
    }
  }

  return null;
}

export async function findUserById(idOrEmail: string): Promise<UserProfile | null> {
  if (!idOrEmail) return null;
  const decoded = decodeURIComponent(idOrEmail).trim();
  const db = await getDb();
  if (db) {
    try {
      if (/^[0-9a-fA-F]{24}$/.test(decoded)) {
        const { ObjectId } = await import('mongodb');
        const user = await db.collection<UserProfile>('users').findOne({ _id: new ObjectId(decoded) as any });
        if (user) return { ...user, _id: user._id?.toString() };
      }
      const user = await db.collection<UserProfile>('users').findOne({
        $or: [
          { email: decoded.toLowerCase() },
          { providerAccountId: decoded },
        ],
      });
      if (user) return { ...user, _id: user._id?.toString() };
    } catch (e) {
      console.warn('Failed to find user by ID in MongoDB, checking fallback:', e);
    }
  }
  return memoryUsers.get(decoded.toLowerCase()) || null;
}


export async function createUser(data: {
  name: string;
  email: string;
  dob?: string;
  occupation?: string;
  password?: string;
  provider: 'google' | 'x' | 'instagram' | 'credentials';
  providerAccountId?: string;
  image?: string;
}): Promise<UserProfile> {
  const emailVal = validateEmailForAuth(data.email);
  if (!emailVal.valid) {
    throw new Error(emailVal.error || 'Invalid email address provided.');
  }

  const normalizedEmail = emailVal.normalizedEmail;
  const canonicalEmail = emailVal.canonicalEmail;

  // Check for duplicate account using standard email or canonical alias
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please sign in or use another email.');
  }

  const now = new Date().toISOString();

  let passwordHash: string | undefined;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
  }

  // Mandatory verification: OAuth users are pre-verified by provider; credentials users require verification code
  const isEmailVerified = data.provider !== 'credentials';
  let emailVerificationCode: string | undefined;
  let emailVerificationExpires: string | undefined;

  if (!isEmailVerified) {
    emailVerificationCode = generateVerificationCode();
    emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
  }

  const newUser: UserProfile = {
    name: data.name || 'Anonymous User',
    email: normalizedEmail,
    canonicalEmail,
    dob: data.dob || '',
    occupation: data.occupation || '',
    passwordHash,
    provider: data.provider,
    providerAccountId: data.providerAccountId,
    image: data.image,
    plan: 'free',
    generationsLimit: 10, // 10 limit with auth
    generationsUsed: 0,
    isEmailVerified,
    emailVerificationCode,
    emailVerificationExpires,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (db) {
    try {
      const docToInsert = { ...newUser };
      delete docToInsert._id;
      const result = await db.collection('users').insertOne(docToInsert as any);
      newUser._id = result.insertedId.toString();
    } catch (e) {
      console.warn('Failed to insert user into MongoDB, saving to memory fallback:', e);
    }
  }

  memoryUsers.set(normalizedEmail, newUser);
  return newUser;
}

/**
 * Verifies a 6-digit email verification code for a user
 */
export async function verifyUserEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const cleanCode = (code || '').trim();

  if (!normalizedEmail || !cleanCode) {
    return { success: false, error: 'Email and 6-digit verification code are required.' };
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  if (user.isEmailVerified) {
    return { success: true, user };
  }

  if (!user.emailVerificationCode || !user.emailVerificationExpires) {
    return { success: false, error: 'No active verification code found. Please request a new code.' };
  }

  // Check expiration
  if (new Date() > new Date(user.emailVerificationExpires)) {
    return { success: false, error: 'Verification code has expired. Please click "Resend Code" to receive a fresh code.' };
  }

  if (user.emailVerificationCode !== cleanCode) {
    return { success: false, error: 'Incorrect verification code. Please check your inbox and enter the 6-digit code.' };
  }

  // Code matches! Mark account as verified and clear temporary verification credentials
  const now = new Date().toISOString();

  const db = await getDb();
  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: user.email },
        {
          $set: { isEmailVerified: true, updatedAt: now },
          $unset: { emailVerificationCode: '', emailVerificationExpires: '' },
        }
      );
    } catch (e) {
      console.warn('Failed to update email verification status in MongoDB:', e);
    }
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  user.updatedAt = now;
  memoryUsers.set(user.email, user);

  return { success: true, user };
}

/**
 * Issues and sends a new 6-digit email verification code to the user's inbox
 */
export async function issueAndSendVerificationCode(
  email: string
): Promise<{ success: boolean; error?: string; simulatedCode?: string }> {
  const emailVal = validateEmailForAuth(email);
  if (!emailVal.valid) {
    return { success: false, error: emailVal.error };
  }

  const user = await findUserByEmail(emailVal.normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  if (user.isEmailVerified) {
    return { success: false, error: 'This email address is already verified. You may sign in directly.' };
  }

  const newCode = generateVerificationCode();
  const newExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const db = await getDb();
  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: user.email },
        {
          $set: {
            emailVerificationCode: newCode,
            emailVerificationExpires: newExpiry,
            updatedAt: now,
          },
        }
      );
    } catch (e) {
      console.warn('Failed to update verification code in MongoDB:', e);
    }
  }

  user.emailVerificationCode = newCode;
  user.emailVerificationExpires = newExpiry;
  user.updatedAt = now;
  memoryUsers.set(user.email, user);

  const sendResult = await sendVerificationCodeEmail({
    to: user.email,
    code: newCode,
    userName: user.name,
  });

  return {
    success: true,
    simulatedCode: sendResult.simulated ? newCode : undefined,
  };
}

export async function updateUserProfile(
  email: string,
  updates: {
    name?: string;
    dob?: string;
    occupation?: string;
    generationsUsed?: number;
    generationsLimit?: number;
    plan?: 'free' | 'starter' | 'pro' | 'enterprise' | string;
    subscriptionBillingCycle?: 'monthly' | 'annual' | 'lifetime' | string | null;
    subscriptionStatus?: 'active' | 'none' | 'cancelled' | string;
    subscriptionExpiresAt?: string | null;
    planAssignedBy?: string;
  }
): Promise<UserProfile | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  const now = new Date().toISOString();

  const updateFields: Partial<UserProfile> = {
    ...updates,
    updatedAt: now,
  };

  if (db) {
    try {
      const result = await db.collection('users').findOneAndUpdate(
        { email: normalizedEmail },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
      if (result) {
        const updated = {
          ...(result as any),
          _id: (result as any)._id?.toString(),
        } as UserProfile;
        memoryUsers.set(normalizedEmail, updated);
        return updated;
      }
    } catch (e) {
      console.warn('Failed to update user in MongoDB, updating memory fallback:', e);
    }
  }

  const existing = memoryUsers.get(normalizedEmail);
  if (existing) {
    const updated = { ...existing, ...updateFields };
    memoryUsers.set(normalizedEmail, updated);
    return updated;
  }

  return null;
}

export async function verifyUserPassword(email: string, plainPassword: string): Promise<UserProfile | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return null;

  const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export async function saveUserGoogleFitTokens(
  email: string,
  tokens: { accessToken: string; refreshToken?: string; expiresAt: number; scope?: string }
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  const now = new Date().toISOString();

  const fitTokens: GoogleFitUserTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    scope: tokens.scope,
    updatedAt: now,
  };

  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: normalizedEmail },
        { $set: { googleFitTokens: fitTokens, updatedAt: now } }
      );
    } catch (e) {
      console.warn('Failed to save Google Fit tokens to MongoDB, updating memory fallback:', e);
    }
  }

  const existing = memoryUsers.get(normalizedEmail);
  if (existing) {
    existing.googleFitTokens = fitTokens;
    existing.updatedAt = now;
    memoryUsers.set(normalizedEmail, existing);
  }
}

export async function getUserGoogleFitTokens(email: string): Promise<GoogleFitUserTokens | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);
  return user?.googleFitTokens || null;
}

export async function deleteUserGoogleFitTokens(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  const now = new Date().toISOString();

  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: normalizedEmail },
        { $unset: { googleFitTokens: '' }, $set: { updatedAt: now } }
      );
    } catch (e) {
      console.warn('Failed to delete Google Fit tokens from MongoDB:', e);
    }
  }

  const existing = memoryUsers.get(normalizedEmail);
  if (existing) {
    delete existing.googleFitTokens;
    existing.updatedAt = now;
    memoryUsers.set(normalizedEmail, existing);
  }
}

/**
 * Creates a secure password reset token, saves its hash & expiry (1 hour) to MongoDB,
 * and returns the raw unhashed token for the email link.
 */
export async function createPasswordResetToken(
  email: string
): Promise<{ token: string; user: UserProfile } | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) return null;

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

  const db = await getDb();
  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: normalizedEmail },
        {
          $set: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: expires,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    } catch (e) {
      console.warn('Failed to save reset token to MongoDB, updating fallback:', e);
    }
  }

  const memUser = memoryUsers.get(normalizedEmail);
  if (memUser) {
    memUser.resetPasswordToken = hashedToken;
    memUser.resetPasswordExpires = expires;
    memoryUsers.set(normalizedEmail, memUser);
  }

  return { token: rawToken, user };
}

/**
 * Verifies that a password reset token exists and has not expired.
 */
export async function verifyPasswordResetToken(token: string): Promise<UserProfile | null> {
  if (!token || typeof token !== 'string') return null;

  const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const now = new Date().toISOString();
  const db = await getDb();

  if (db) {
    try {
      const user = await db.collection<UserProfile>('users').findOne({
        $or: [
          { resetPasswordToken: hashedToken },
          { resetPasswordToken: token.trim() },
        ],
        resetPasswordExpires: { $gt: now },
      });

      if (user) {
        return {
          ...user,
          _id: user._id?.toString(),
        };
      }
    } catch (e) {
      console.warn('Failed to verify token in MongoDB, checking fallback:', e);
    }
  }

  for (const memUser of memoryUsers.values()) {
    if (
      (memUser.resetPasswordToken === hashedToken || memUser.resetPasswordToken === token.trim()) &&
      memUser.resetPasswordExpires &&
      memUser.resetPasswordExpires > now
    ) {
      return memUser;
    }
  }

  return null;
}

/**
 * Sets a new password for the user holding a valid reset token,
 * hashes the password with bcrypt, and invalidates the token.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Reset token is required' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  const user = await verifyPasswordResetToken(token);
  if (!user) {
    return {
      success: false,
      error: 'Password reset link is invalid or has expired. Please request a new one.',
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const now = new Date().toISOString();
  const db = await getDb();

  if (db) {
    try {
      await db.collection('users').updateOne(
        { email: user.email },
        {
          $set: {
            passwordHash,
            updatedAt: now,
          },
          $unset: {
            resetPasswordToken: '',
            resetPasswordExpires: '',
          },
        }
      );
    } catch (e) {
      console.error('Failed to update password in MongoDB:', e);
      return { success: false, error: 'Database update failed. Please try again.' };
    }
  }

  const memUser = memoryUsers.get(user.email);
  if (memUser) {
    memUser.passwordHash = passwordHash;
    delete memUser.resetPasswordToken;
    delete memUser.resetPasswordExpires;
    memUser.updatedAt = now;
    memoryUsers.set(user.email, memUser);
  }

  return { success: true, email: user.email };
}
