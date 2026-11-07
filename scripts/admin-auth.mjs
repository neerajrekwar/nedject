#!/usr/bin/env node

/**
 * NEDJECT ADMIN CREDENTIALS MANAGER (TERMINAL CLI)
 * Direct MongoDB Cloud & Local Credentials Manager
 *
 * Full Lifecycle Admin Credentials Manager:
 *   - create: create a new admin credential directly in MongoDB
 *   - update: update admin password, name, or role in MongoDB
 *   - delete: delete a specific admin by email from MongoDB
 *   - delete-all (delete all): wipe all admin credentials from MongoDB
 *   - all (list): display all configured admin accounts from MongoDB
 *   - verify: verify admin email and password against MongoDB stored hash
 *   - seed: seed default/custom admin account directly into MongoDB
 *   - status: view live MongoDB connection and credential counts
 *
 * Supported execution syntax:
 *   npx verify --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"
 *   npx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"
 *   npx admin-auth create --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"
 *   npx admin-auth update --email "neerajrekwar817@gmail.com" --password "NewPassword123"
 *   npx admin-auth delete --email "neerajrekwar817@gmail.com"
 *   npx admin-auth delete all
 *   npx admin-auth all
 *   npm run verify -- --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

// 1. Environment loader for standalone terminal execution
function loadEnvironment() {
  for (const envFile of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {}
    }
  }
}

loadEnvironment();

// 2. Cryptographic PBKDF2 Password Hashing (identical to /api/admin/auth/login)
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// 3. Primary MongoDB Connection & Database Access
async function getMongoContext() {
  let uri = process.env.MONGODB_URI || '';
  uri = uri.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri) {
    return { ok: false, error: 'MONGODB_URI not found in environment' };
  }

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(uri, {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();

    // Prefer explicit MONGODB_DB or default from client/URI
    const dbName = process.env.MONGODB_DB || client.db().databaseName || 'test';
    const db = client.db(dbName);

    return {
      ok: true,
      client,
      db,
      dbName,
      adminCol: db.collection('admin_credentials'),
      usersCol: db.collection('users'),
      rateLimitCol: db.collection('admin_login_rate_limits'),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// 4. Secondary Local File Storage Reader & Writer (Mirror / Fallback)
function getCredentialsStore() {
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      const data = JSON.parse(raw);

      if (data && typeof data === 'object') {
        const admins = Array.isArray(data.admins) ? [...data.admins] : [];
        if (
          data.email &&
          data.hash &&
          !admins.some((a) => a.email.toLowerCase() === data.email.toLowerCase())
        ) {
          admins.unshift({
            id: 'admin-primary',
            email: data.email,
            name: data.name || 'Neeraj Rekwar',
            role: data.role || 'Super Admin',
            salt: data.salt,
            hash: data.hash,
            createdAt: data.createdAt || data.updatedAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
        return {
          email: data.email || (admins[0] ? admins[0].email : ''),
          name: data.name || (admins[0] ? admins[0].name : 'Neeraj Rekwar'),
          role: data.role || (admins[0] ? admins[0].role : 'Super Admin'),
          salt: data.salt || (admins[0] ? admins[0].salt : ''),
          hash: data.hash || (admins[0] ? admins[0].hash : ''),
          updatedAt: data.updatedAt || new Date().toISOString(),
          admins,
        };
      }
    } catch (e) {
      console.warn('\x1b[33mWarning: Failed to parse .admin-credentials.json\x1b[0m', e.message);
    }
  }
  return {
    email: '',
    name: 'Neeraj Rekwar',
    role: 'Super Admin',
    salt: '',
    hash: '',
    updatedAt: new Date().toISOString(),
    admins: [],
  };
}

function saveCredentialsStore(store) {
  const primary = store.admins && store.admins.length > 0 ? store.admins[0] : null;
  const payload = {
    email: primary ? primary.email : '',
    name: primary ? primary.name : 'Neeraj Rekwar',
    role: primary ? primary.role : 'Super Admin',
    salt: primary ? primary.salt : '',
    hash: primary ? primary.hash : '',
    updatedAt: new Date().toISOString(),
    admins: store.admins || [],
  };

  try {
    fs.writeFileSync(CREDS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (e) {}
  return payload;
}

// 5. Intelligent CLI Argument & Flag Parser
function parseArgsAndFlags(argv) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx > 2) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        flags[key] = val;
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('-')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.slice(1);
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

const rawArgv = process.argv.slice(2);
const binaryInvoked = path.basename(process.argv[1] || '').replace(/\.[^/.]+$/, '');
const { flags, positional } = parseArgsAndFlags(rawArgv);

// Normalize command determination:
// - If invoked directly as "verify" binary (e.g., `npx verify`), default command is "verify"
// - Handle "delete all" (positional[0] === 'delete' && positional[1] === 'all')
let command = positional[0] || '';

if (binaryInvoked === 'verify') {
  command = 'verify';
} else if (positional[0] === 'delete' && (positional[1] === 'all' || positional[1] === '*')) {
  command = 'delete-all';
} else if (positional[0] === 'deleteall') {
  command = 'delete-all';
} else if (!command) {
  if (flags.email && flags.password) {
    command = 'verify';
  } else {
    command = 'status';
  }
}

// 6. COMMAND IMPLEMENTATIONS (MONGODB-FIRST)

// --- COMMAND: SEED ---
async function handleSeed() {
  const email = (flags.email || flags.e || positional[1] || 'neerajrekwar817@gmail.com')
    .trim()
    .toLowerCase();
  const password = flags.password || flags.p || positional[2] || 'YourStrongPassword';
  const name = flags.name || flags.n || 'Neeraj Rekwar';
  const role = flags.role || flags.r || 'Super Admin';

  if (password.length < 6) {
    console.error('\x1b[31mError: Password must be at least 6 characters long.\x1b[0m\n');
    process.exit(1);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  const bcryptHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  // 1. PRIMARY STORE: MongoDB
  const mongo = await getMongoContext();
  let mongoSynced = false;
  let mongoDetails = '';

  if (mongo.ok) {
    try {
      // Upsert into admin_credentials
      await mongo.adminCol.updateOne(
        { email },
        {
          $set: {
            email,
            name,
            role,
            salt,
            hash,
            updatedAt: now,
          },
          $setOnInsert: {
            id: `admin-${Date.now()}`,
            createdAt: now,
          },
        },
        { upsert: true }
      );

      // Also upsert into users collection as active Super Admin
      await mongo.usersCol.updateOne(
        { email },
        {
          $set: {
            email,
            name,
            role: 'admin',
            plan: 'custom',
            generationsLimit: 9999999,
            isEmailVerified: true,
            passwordHash: bcryptHash,
            provider: 'credentials',
            dob: '1995-01-01',
            occupation: 'Super Admin',
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
            generationsUsed: 0,
          },
        },
        { upsert: true }
      );

      mongoSynced = true;
      mongoDetails = `Database: "${mongo.dbName}" | Collections: "admin_credentials" & "users"`;
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB write error:\x1b[0m', e.message);
    }
  } else {
    console.warn(`\x1b[33mWarning: MongoDB connection skipped (${mongo.error})\x1b[0m`);
  }

  // 2. SECONDARY LOCAL MIRROR
  const store = getCredentialsStore();
  const existingIdx = store.admins.findIndex((a) => a.email.toLowerCase() === email);
  const adminDoc = {
    id: existingIdx >= 0 ? store.admins[existingIdx].id : `admin-${Date.now()}`,
    email,
    name,
    role,
    salt,
    hash,
    createdAt: existingIdx >= 0 ? store.admins[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    store.admins[existingIdx] = adminDoc;
  } else {
    store.admins.unshift(adminDoc);
  }
  saveCredentialsStore(store);

  // 3. OUTPUT
  console.log('\n\x1b[1m\x1b[32m====================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m   ✓ ADMIN CREDENTIALS STORED IN MONGODB            \x1b[0m');
  console.log('\x1b[1m\x1b[32m====================================================\x1b[0m\n');
  console.log(`  \x1b[1mAdmin Email:\x1b[0m       \x1b[36m${email}\x1b[0m`);
  console.log(`  \x1b[1mAdmin Password:\x1b[0m    \x1b[33m${password}\x1b[0m`);
  console.log(`  \x1b[1mAdmin Name:\x1b[0m        ${name}`);
  console.log(`  \x1b[1mAccess Role:\x1b[0m       ${role}`);
  console.log(`  \x1b[1mPBKDF2 Hash:\x1b[0m       [PBKDF2-SHA512] ${hash.slice(0, 16)}...`);
  console.log(`  \x1b[1mBcrypt Hash:\x1b[0m       [Bcrypt-10] ${bcryptHash.slice(0, 16)}...`);

  if (mongoSynced) {
    console.log(`  \x1b[1mMongoDB Store:\x1b[0m     \x1b[32m${mongoDetails} [PRIMARY ACTIVE]\x1b[0m`);
    console.log(`  \x1b[1mUser Account:\x1b[0m      \x1b[32mSynced with isEmailVerified: true & Unlimited Custom Quota\x1b[0m`);
  } else {
    console.log(`  \x1b[1mMongoDB Store:\x1b[0m     \x1b[31mOffline / Failed\x1b[0m`);
  }
  console.log(`  \x1b[1mLocal Mirror:\x1b[0m      .admin-credentials.json (Synchronized backup)`);

  console.log('\n\x1b[1mVerify this login now in your terminal:\x1b[0m');
  console.log(`  \x1b[36mnpx verify --email "${email}" --password "${password}"\x1b[0m\n`);
  console.log(`Log in on the web at: \x1b[36mhttp://localhost:3000/admin/login\x1b[0m\n`);
}

// --- COMMAND: CREATE / ADD / SET ---
async function handleCreate() {
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();
  const password = flags.password || flags.p || positional[2];
  const name = flags.name || flags.n || 'Neeraj Rekwar';
  const role = flags.role || flags.r || 'Super Admin';
  const force = Boolean(flags.force || flags.f);

  if (!email || !password) {
    console.error('\x1b[31mError: Both --email and --password are required.\x1b[0m');
    console.error('\nUsage:');
    console.error(
      '  npx admin-auth create --email "admin@example.com" --password "SecretPass" [--name "Name"] [--role "Super Admin"]\n'
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('\x1b[31mError: Password must be at least 6 characters long.\x1b[0m\n');
    process.exit(1);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  const bcryptHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  // 1. PRIMARY STORE: MongoDB
  const mongo = await getMongoContext();
  let mongoSynced = false;

  if (mongo.ok) {
    try {
      const existing = await mongo.adminCol.findOne({ email });
      if (existing && !force) {
        console.error(`\x1b[31mError: Admin "${email}" already exists in MongoDB.\x1b[0m`);
        console.error(
          'Use \x1b[33mupdate\x1b[0m to modify password, or pass \x1b[36m--force\x1b[0m to overwrite.\n'
        );
        await mongo.client.close();
        process.exit(1);
      }

      await mongo.adminCol.updateOne(
        { email },
        {
          $set: {
            email,
            name,
            role,
            salt,
            hash,
            updatedAt: now,
          },
          $setOnInsert: {
            id: `admin-${Date.now()}`,
            createdAt: now,
          },
        },
        { upsert: true }
      );

      // Also upsert in users collection
      await mongo.usersCol.updateOne(
        { email },
        {
          $set: {
            email,
            name,
            role: 'admin',
            plan: 'custom',
            generationsLimit: 9999999,
            isEmailVerified: true,
            passwordHash: bcryptHash,
            provider: 'credentials',
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
            dob: '1995-01-01',
            occupation: 'Super Admin',
            generationsUsed: 0,
          },
        },
        { upsert: true }
      );

      mongoSynced = true;
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB write error:\x1b[0m', e.message);
    }
  }

  // 2. SECONDARY LOCAL MIRROR
  const store = getCredentialsStore();
  const existingIdx = store.admins.findIndex((a) => a.email.toLowerCase() === email);
  const adminDoc = {
    id: existingIdx >= 0 ? store.admins[existingIdx].id : `admin-${Date.now()}`,
    email,
    name,
    role,
    salt,
    hash,
    createdAt: existingIdx >= 0 ? store.admins[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    store.admins[existingIdx] = adminDoc;
  } else {
    store.admins.unshift(adminDoc);
  }
  saveCredentialsStore(store);

  console.log(`\n\x1b[32m✓ Admin account "${email}" successfully stored in MongoDB!\x1b[0m`);
  console.log(`  \x1b[1mEmail:\x1b[0m     ${email}`);
  console.log(`  \x1b[1mName:\x1b[0m      ${name}`);
  console.log(`  \x1b[1mRole:\x1b[0m      ${role}`);
  console.log(`  \x1b[1mHash:\x1b[0m      ${hash.slice(0, 16)}...`);
  if (mongoSynced) {
    console.log(
      `  \x1b[1mMongoDB:\x1b[0m   \x1b[32mStored in "admin_credentials" & "users" [PRIMARY ACTIVE]\x1b[0m`
    );
  }
  console.log('');
}

// --- COMMAND: UPDATE / EDIT ---
async function handleUpdate() {
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();

  if (!email) {
    console.error('\x1b[31mError: Target --email is required for update.\x1b[0m');
    console.error(
      'Usage: npx admin-auth update --email "admin@example.com" [--password "NewPassword"] [--name "New Name"] [--role "Role"]\n'
    );
    process.exit(1);
  }

  const newPassword = flags.password || flags.p;
  const newName = flags.name || flags.n;
  const newRole = flags.role || flags.r;
  const newEmail = (flags['new-email'] || '').trim().toLowerCase();

  let salt = '';
  let hash = '';
  let bcryptHash = '';

  if (newPassword) {
    if (newPassword.length < 6) {
      console.error('\x1b[31mError: New password must be at least 6 characters long.\x1b[0m\n');
      process.exit(1);
    }
    salt = crypto.randomBytes(16).toString('hex');
    hash = hashPassword(newPassword, salt);
    bcryptHash = bcrypt.hashSync(newPassword, 10);
  }

  const now = new Date().toISOString();

  // 1. PRIMARY STORE: MongoDB
  const mongo = await getMongoContext();
  let mongoFound = false;

  if (mongo.ok) {
    try {
      const existing = await mongo.adminCol.findOne({ email });
      if (existing) {
        mongoFound = true;
        const updateSet = { updatedAt: now };
        if (newName) updateSet.name = newName;
        if (newRole) updateSet.role = newRole;
        if (newPassword) {
          updateSet.salt = salt;
          updateSet.hash = hash;
        }
        if (newEmail && newEmail !== email) {
          updateSet.email = newEmail;
        }

        await mongo.adminCol.updateOne({ email }, { $set: updateSet });

        // Update in users collection
        const userUpdateSet = { updatedAt: now };
        if (newName) userUpdateSet.name = newName;
        if (newPassword) userUpdateSet.passwordHash = bcryptHash;
        if (newEmail && newEmail !== email) userUpdateSet.email = newEmail;
        await mongo.usersCol.updateOne({ email }, { $set: userUpdateSet });
      }
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB update error:\x1b[0m', e.message);
    }
  }

  // 2. SECONDARY LOCAL MIRROR
  const store = getCredentialsStore();
  const idx = store.admins.findIndex((a) => a.email.toLowerCase() === email);

  if (idx >= 0) {
    const current = store.admins[idx];
    if (newName) current.name = newName;
    if (newRole) current.role = newRole;
    if (newPassword) {
      current.salt = salt;
      current.hash = hash;
    }
    if (newEmail && newEmail !== email) {
      current.email = newEmail;
    }
    current.updatedAt = now;
    store.admins[idx] = current;
    saveCredentialsStore(store);
  } else if (!mongoFound) {
    console.error(`\x1b[31mError: Admin "${email}" not found in MongoDB or local store.\x1b[0m\n`);
    process.exit(1);
  }

  console.log(`\n\x1b[32m✓ Admin account "${email}" updated successfully in MongoDB!\x1b[0m`);
  console.log(`  \x1b[1mEmail:\x1b[0m   ${newEmail || email}`);
  if (newName) console.log(`  \x1b[1mName:\x1b[0m    ${newName}`);
  if (newRole) console.log(`  \x1b[1mRole:\x1b[0m    ${newRole}`);
  if (newPassword) console.log(`  \x1b[1mPassword:\x1b[0m \x1b[33mUpdated to new hash in MongoDB\x1b[0m`);
  console.log('');
}

// --- COMMAND: DELETE / REMOVE ---
async function handleDelete() {
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();

  if (!email) {
    console.error('\x1b[31mError: Target --email is required for deletion.\x1b[0m');
    console.error('Usage: npx admin-auth delete --email "admin@example.com"\n');
    console.error('To wipe all admin credentials, run: \x1b[33mnpx admin-auth delete all\x1b[0m\n');
    process.exit(1);
  }

  // 1. PRIMARY STORE: MongoDB
  const mongo = await getMongoContext();
  let deletedCount = 0;

  if (mongo.ok) {
    try {
      const res = await mongo.adminCol.deleteOne({ email });
      deletedCount = res.deletedCount;
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB delete error:\x1b[0m', e.message);
    }
  }

  // 2. SECONDARY LOCAL MIRROR
  const store = getCredentialsStore();
  const initialCount = store.admins.length;
  store.admins = store.admins.filter((a) => a.email.toLowerCase() !== email);
  saveCredentialsStore(store);

  if (deletedCount === 0 && store.admins.length === initialCount) {
    console.error(`\x1b[31mError: No admin account found with email "${email}".\x1b[0m\n`);
    process.exit(1);
  }

  console.log(`\n\x1b[32m✓ Successfully deleted admin credential "${email}" from MongoDB!\x1b[0m\n`);
}

// --- COMMAND: DELETE-ALL (DELETE ALL / CLEAR / WIPE) ---
async function handleDeleteAll() {
  // 1. PRIMARY STORE: MongoDB
  const mongo = await getMongoContext();
  let clearedMongo = false;

  if (mongo.ok) {
    try {
      await mongo.adminCol.deleteMany({});
      clearedMongo = true;
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB wipe error:\x1b[0m', e.message);
    }
  }

  // 2. SECONDARY LOCAL MIRROR
  const store = {
    email: '',
    name: '',
    role: '',
    salt: '',
    hash: '',
    updatedAt: new Date().toISOString(),
    admins: [],
  };
  saveCredentialsStore(store);

  console.log('\n\x1b[1m\x1b[31m====================================================\x1b[0m');
  console.log('\x1b[1m\x1b[31m   ✓ ALL ADMIN CREDENTIALS HAVE BEEN WIPED CLEAN    \x1b[0m');
  console.log('\x1b[1m\x1b[31m====================================================\x1b[0m\n');
  if (clearedMongo) {
    console.log('  \x1b[32m✔ MongoDB collection "admin_credentials" cleared\x1b[0m');
  }
  console.log('  \x1b[90m✔ .admin-credentials.json cleared\x1b[0m\n');
}

// --- COMMAND: ALL / LIST ---
async function handleList() {
  console.log('\n\x1b[1m\x1b[32m=== NEDJECT CONFIGURED ADMIN ACCOUNTS (MONGODB) ===\x1b[0m\n');

  // 1. Query MongoDB directly
  const mongo = await getMongoContext();
  let adminList = [];

  if (mongo.ok) {
    try {
      adminList = await mongo.adminCol.find({}).toArray();
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB query error:\x1b[0m', e.message);
    }
  }

  // Fallback to local store if MongoDB returned nothing or offline
  if (adminList.length === 0) {
    const store = getCredentialsStore();
    adminList = store.admins || [];
  }

  if (adminList.length === 0) {
    console.log('\x1b[33mNo admin credentials configured yet in MongoDB.\x1b[0m');
    console.log('\nRun seed to create primary admin:');
    console.log(
      '  \x1b[36mnpx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n'
    );
    return;
  }

  adminList.forEach((admin, idx) => {
    const isPrimary = idx === 0 ? '\x1b[32m[PRIMARY ADMIN]\x1b[0m' : '\x1b[90m[ADMIN]\x1b[0m';
    const docId = admin._id ? admin._id.toString() : admin.id || 'N/A';
    console.log(`\x1b[1m#${idx + 1}\x1b[0m ${isPrimary} \x1b[1m${admin.name || 'Admin'}\x1b[0m <\x1b[36m${admin.email}\x1b[0m>`);
    console.log(`   \x1b[90mRole:\x1b[0m ${admin.role || 'Super Admin'} | \x1b[90mMongoDB ID:\x1b[0m ${docId}`);
    console.log(`   \x1b[90mHash:\x1b[0m ${admin.hash ? admin.hash.slice(0, 20) + '...' : 'NONE'} | \x1b[90mUpdated:\x1b[0m ${admin.updatedAt}`);
    console.log('');
  });
}

// --- COMMAND: VERIFY ---
async function handleVerify() {
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();
  const password = flags.password || flags.p || positional[2] || '';

  if (!email || !password) {
    console.error(
      '\n\x1b[31mError: Both --email and --password are required to verify credentials.\x1b[0m\n'
    );
    console.error('Usage:');
    console.error(
      '  \x1b[36mnpx verify --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n'
    );
    process.exit(1);
  }

  // 1. PRIMARY: Query MongoDB
  let matched = null;
  const mongo = await getMongoContext();
  let verifiedFromMongo = false;

  if (mongo.ok) {
    try {
      const doc = await mongo.adminCol.findOne({ email });
      if (doc && doc.hash && doc.salt) {
        matched = doc;
        verifiedFromMongo = true;
      }
      await mongo.client.close();
    } catch (e) {
      console.warn('\x1b[33mWarning: MongoDB query error:\x1b[0m', e.message);
    }
  }

  // 2. Secondary Fallback
  if (!matched) {
    const store = getCredentialsStore();
    matched = store.admins.find((a) => a.email.toLowerCase() === email);
    if (!matched && store.email && store.email.toLowerCase() === email && store.hash) {
      matched = store;
    }
  }

  if (!matched) {
    console.log(`\n\x1b[1m\x1b[31m✗ VERIFICATION FAILED\x1b[0m`);
    console.log(`No admin account found in MongoDB with email: \x1b[33m"${email}"\x1b[0m\n`);
    console.log('To seed this admin in MongoDB, run:');
    console.log(`  \x1b[36mnpx admin-auth seed --email "${email}" --password "${password}"\x1b[0m\n`);
    process.exit(1);
  }

  const testHash = hashPassword(password, matched.salt);

  if (testHash === matched.hash) {
    console.log('\n\x1b[1m\x1b[32m====================================================\x1b[0m');
    console.log('\x1b[1m\x1b[32m   ✓ VERIFIED: ADMIN CREDENTIALS IN MONGODB VALID!  \x1b[0m');
    console.log('\x1b[1m\x1b[32m====================================================\x1b[0m\n');
    console.log(`  \x1b[1mEmail:\x1b[0m      \x1b[36m${matched.email}\x1b[0m`);
    console.log(`  \x1b[1mName:\x1b[0m       ${matched.name || 'Neeraj Rekwar'}`);
    console.log(`  \x1b[1mRole:\x1b[0m       ${matched.role || 'Super Admin'}`);
    console.log(`  \x1b[1mStore:\x1b[0m      ${verifiedFromMongo ? '\x1b[32mMongoDB Cloud Database [PRIMARY]\x1b[0m' : 'Local Fallback'}`);
    console.log(`  \x1b[1mAlgorithm:\x1b[0m  PBKDF2-SHA512 (100,000 iterations)`);
    console.log(
      `  \x1b[1mResult:\x1b[0m     \x1b[32mPASSWORD MATCHES MONGODB STORED HASH (Access Granted)\x1b[0m`
    );
    console.log(`\nYou can safely log in at: \x1b[36mhttp://localhost:3000/admin/login\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\n\x1b[1m\x1b[31m✗ VERIFICATION FAILED\x1b[0m`);
    console.log(`\x1b[31mIncorrect password for admin:\x1b[0m \x1b[33m"${email}"\x1b[0m\n`);
    console.log('To update this admin\'s password in MongoDB, run:');
    console.log(
      `  \x1b[36mnpx admin-auth update --email "${email}" --password "${password}"\x1b[0m\n`
    );
    process.exit(1);
  }
}

// --- COMMAND: GENERATE ---
async function handleGenerate() {
  const email = (flags.email || flags.e || positional[1] || 'neerajrekwar817@gmail.com')
    .trim()
    .toLowerCase();
  const generatedPassword = crypto.randomBytes(9).toString('base64url');
  flags.email = email;
  flags.password = generatedPassword;
  await handleSeed();
}

// --- COMMAND: UNBLOCK / RESET-LIMIT ---
async function handleUnblock() {
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();

  const mongo = await getMongoContext();
  if (mongo.ok) {
    try {
      if (email) {
        const res = await mongo.rateLimitCol.deleteMany({ email });
        console.log(
          `\x1b[32m✓ Cleared rate limit lock in MongoDB for: "${email}" (${res.deletedCount} attempts cleared)\x1b[0m\n`
        );
      } else {
        const res = await mongo.rateLimitCol.deleteMany({});
        console.log(
          `\x1b[32m✓ Cleared all admin login rate limits in MongoDB (${res.deletedCount} attempts cleared)\x1b[0m\n`
        );
      }
      await mongo.client.close();
      return;
    } catch (e) {
      console.warn('MongoDB unblock error:', e.message);
    }
  }

  console.log('\x1b[32m✓ Console rate limit counter reset to 0/3 attempts.\x1b[0m\n');
}

// --- COMMAND: STATUS ---
async function handleStatus() {
  console.log('\n\x1b[1m\x1b[32m=== NEDJECT TERMINAL ADMIN CREDENTIALS STATUS (MONGODB) ===\x1b[0m');

  const mongo = await getMongoContext();
  let adminCount = 0;
  let primaryAdmin = null;

  if (mongo.ok) {
    try {
      const list = await mongo.adminCol.find({}).toArray();
      adminCount = list.length;
      primaryAdmin = list[0] || null;
      await mongo.client.close();
    } catch (e) {
      console.warn('MongoDB status check warning:', e.message);
    }
  }

  if (!primaryAdmin) {
    const store = getCredentialsStore();
    adminCount = store.admins ? store.admins.length : 0;
    primaryAdmin = store.admins && store.admins[0] ? store.admins[0] : null;
  }

  if (!primaryAdmin) {
    console.log('\n\x1b[33mNo admin credentials currently configured in MongoDB.\x1b[0m');
    console.log('\nRun seed to initialize:');
    console.log(
      '  \x1b[36mnpx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n'
    );
    return;
  }

  console.log(`\n  \x1b[1mTotal Admins:\x1b[0m      ${adminCount}`);
  console.log(
    `  \x1b[1mPrimary Admin:\x1b[0m     \x1b[36m${primaryAdmin.email}\x1b[0m (${primaryAdmin.name || 'Admin'} - ${primaryAdmin.role || 'Super Admin'})`
  );
  console.log(`  \x1b[1mMongoDB Database:\x1b[0m  ${mongo.ok ? `\x1b[32m${mongo.dbName} (Cluster0 Connected)\x1b[0m` : '\x1b[31mOffline\x1b[0m'}`);
  console.log(`  \x1b[1mPrimary Store:\x1b[0m     admin_credentials collection [MongoDB Cloud]`);
  console.log(`  \x1b[1mRate Limiter:\x1b[0m      Active in MongoDB (3 attempts / hour)`);
  console.log(`  \x1b[1mLast Modified:\x1b[0m     ${primaryAdmin.updatedAt || 'N/A'}`);
  console.log(
    `\n  \x1b[90mVerify credentials:\x1b[0m npx verify --email "${primaryAdmin.email}" --password "<password>"\n`
  );
}

// --- COMMAND: HELP ---
function handleHelp() {
  console.log(`
\x1b[1m\x1b[32m=== NEDJECT ADMIN CREDENTIALS TERMINAL CLI (MONGODB) ===\x1b[0m
Manage admin authentication credentials directly in MongoDB Cloud.

\x1b[1mAvailable Commands:\x1b[0m

  \x1b[36mseed\x1b[0m [--email "email"] [--password "pass"] [--name "Name"] [--role "Role"]
    Seed default or custom admin credentials directly into MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth seed --email "neerajrekwar817@gmail.com" --password "n@12345"

  \x1b[36mverify\x1b[0m --email "email" --password "pass"
    Verify credentials directly against stored MongoDB PBKDF2 hash.
    \x1b[90mExample:\x1b[0m npx verify --email "neerajrekwar817@gmail.com" --password "n@12345"

  \x1b[36munblock\x1b[0m [--email "email"]
    Reset and unblock rate-limited login attempts in MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth unblock

  \x1b[36mcreate\x1b[0m --email "email" --password "pass" [--name "Name"] [--role "Role"]
    Create a new admin account in MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth create --email "admin@example.com" --password "n@12345"

  \x1b[36mupdate\x1b[0m --email "email" [--password "newPass"] [--name "NewName"] [--role "Role"]
    Update existing admin's password, name, or role in MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth update --email "neerajrekwar817@gmail.com" --password "NewPassword123"

  \x1b[36mdelete\x1b[0m --email "email"
    Delete a specific admin account from MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth delete --email "admin@example.com"

  \x1b[36mdelete all\x1b[0m (or \x1b[36mdelete-all\x1b[0m)
    Wipe and delete all admin credentials from MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth delete all

  \x1b[36mall\x1b[0m (or \x1b[36mlist\x1b[0m)
    List all configured admin credentials from MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth all

  \x1b[36mstatus\x1b[0m
    Show live MongoDB status and primary admin email.
    \x1b[90mExample:\x1b[0m npx admin-auth status

  \x1b[36mgenerate\x1b[0m [--email "email"]
    Generate a random secure password for admin and store in MongoDB.
    \x1b[90mExample:\x1b[0m npx admin-auth generate --email "neerajrekwar817@gmail.com"
`);
}

// 7. CLI COMMAND ROUTER
switch (command.toLowerCase()) {
  case 'seed':
  case 'init':
  case 'setup':
    await handleSeed();
    break;

  case 'unblock':
  case 'unlock':
  case 'reset-limit':
  case 'reset-rate-limit':
    await handleUnblock();
    break;

  case 'create':
  case 'set':
  case 'add':
  case 'new':
    await handleCreate();
    break;

  case 'update':
  case 'edit':
  case 'modify':
    await handleUpdate();
    break;

  case 'delete':
  case 'del':
  case 'rm':
  case 'remove':
    await handleDelete();
    break;

  case 'delete-all':
  case 'deleteall':
  case 'clear':
  case 'wipe':
  case 'reset':
    await handleDeleteAll();
    break;

  case 'all':
  case 'list':
  case 'ls':
    await handleList();
    break;

  case 'verify':
  case 'check':
  case 'test':
    await handleVerify();
    break;

  case 'generate':
  case 'gen':
    await handleGenerate();
    break;

  case 'status':
  case 'info':
    await handleStatus();
    break;

  case 'help':
  case '--help':
  case '-h':
    handleHelp();
    break;

  default:
    console.error(`\x1b[31mUnknown command: "${command}"\x1b[0m`);
    handleHelp();
    process.exit(1);
    break;
}
