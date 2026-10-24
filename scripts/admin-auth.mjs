#!/usr/bin/env node

/**
 * NEDJECT ADMIN CREDENTIALS MANAGER (TERMINAL CLI)
 *
 * Full Lifecycle Admin Credentials Manager:
 *   - create: create a new admin credential
 *   - update: update admin password, name, or role
 *   - delete: delete a specific admin by email
 *   - delete-all (delete all): wipe all admin credentials
 *   - all (list): display all configured admin accounts
 *   - verify: verify admin email and password matches stored hash
 *   - seed: seed default/custom admin account with high security
 *   - status: view system credentials and MongoDB sync status
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
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
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

// 3. Storage Reader & Writer
function getCredentialsStore() {
  if (fs.existsSync(CREDS_FILE)) {
    try {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      
      // Normalize to multi-admin structure while maintaining backwards compatibility
      if (data && typeof data === 'object') {
        const admins = Array.isArray(data.admins) ? [...data.admins] : [];
        if (data.email && data.hash && !admins.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
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
  // Keep primary top-level keys for backwards compatibility with single-credential readers
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

  fs.writeFileSync(CREDS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

// 4. Optional MongoDB Synchronizer (if MONGODB_URI is available)
async function syncWithMongoDB(operation, payload) {
  const uri = process.env.MONGODB_URI;
  if (!uri) return { ok: false, reason: 'MONGODB_URI not defined in environment' };

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
    const db = client.db();
    const collection = db.collection('admin_credentials');

    if (operation === 'upsert') {
      await collection.updateOne(
        { email: payload.email.toLowerCase() },
        {
          $set: {
            email: payload.email.toLowerCase(),
            name: payload.name,
            role: payload.role,
            salt: payload.salt,
            hash: payload.hash,
            updatedAt: payload.updatedAt,
          },
          $setOnInsert: {
            createdAt: payload.createdAt || new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    } else if (operation === 'delete') {
      await collection.deleteOne({ email: payload.email.toLowerCase() });
    } else if (operation === 'delete-all') {
      await collection.deleteMany({});
    }

    await client.close();
    return { ok: true, dbName: db.databaseName };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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

// 6. COMMAND IMPLEMENTATIONS

// --- COMMAND: SEED ---
async function handleSeed() {
  const email = (flags.email || flags.e || positional[1] || 'neerajrekwar817@gmail.com').trim().toLowerCase();
  const password = flags.password || flags.p || positional[2] || 'YourStrongPassword';
  const name = flags.name || flags.n || 'Neeraj Rekwar';
  const role = flags.role || flags.r || 'Super Admin';

  if (password.length < 6) {
    console.error('\x1b[31mError: Password must be at least 6 characters long.\x1b[0m\n');
    process.exit(1);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  const now = new Date().toISOString();

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
  const mongoRes = await syncWithMongoDB('upsert', adminDoc);

  console.log('\n\x1b[1m\x1b[32m====================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m   ✓ ADMIN CREDENTIALS SEEDED SUCCESSFULLY          \x1b[0m');
  console.log('\x1b[1m\x1b[32m====================================================\x1b[0m\n');
  console.log(`  \x1b[1mAdmin Email:\x1b[0m     \x1b[36m${email}\x1b[0m`);
  console.log(`  \x1b[1mAdmin Password:\x1b[0m  \x1b[33m${password}\x1b[0m`);
  console.log(`  \x1b[1mAdmin Name:\x1b[0m      ${name}`);
  console.log(`  \x1b[1mAccess Role:\x1b[0m     ${role}`);
  console.log(`  \x1b[1mPassword Hash:\x1b[0m   [PBKDF2-SHA512] ${hash.slice(0, 16)}...`);
  console.log(`  \x1b[1mLocal File:\x1b[0m      .admin-credentials.json (Active & Secured)`);
  if (mongoRes.ok) {
    console.log(`  \x1b[1mMongoDB Sync:\x1b[0m    \x1b[32mSynced to collection "admin_credentials" in DB "${mongoRes.dbName}"\x1b[0m`);
  } else {
    console.log(`  \x1b[1mMongoDB Sync:\x1b[0m    \x1b[90m(Local file storage active, MongoDB not connected)\x1b[0m`);
  }
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
    console.error('  npx admin-auth create --email "admin@example.com" --password "SecretPass" [--name "Name"] [--role "Super Admin"]\n');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('\x1b[31mError: Password must be at least 6 characters long.\x1b[0m\n');
    process.exit(1);
  }

  const store = getCredentialsStore();
  const existingIdx = store.admins.findIndex((a) => a.email.toLowerCase() === email);

  if (existingIdx >= 0 && !force) {
    console.error(`\x1b[31mError: Admin "${email}" already exists.\x1b[0m`);
    console.error('Use \x1b[33mupdate\x1b[0m to modify password, or pass \x1b[36m--force\x1b[0m to overwrite.\n');
    process.exit(1);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  const now = new Date().toISOString();

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
  const mongoRes = await syncWithMongoDB('upsert', adminDoc);

  console.log(`\n\x1b[32m✓ Admin account "${email}" successfully created via terminal!\x1b[0m`);
  console.log(`  \x1b[1mEmail:\x1b[0m     ${email}`);
  console.log(`  \x1b[1mName:\x1b[0m      ${name}`);
  console.log(`  \x1b[1mRole:\x1b[0m      ${role}`);
  console.log(`  \x1b[1mHash:\x1b[0m      ${hash.slice(0, 16)}...`);
  if (mongoRes.ok) {
    console.log(`  \x1b[1mMongoDB:\x1b[0m   \x1b[32mSynced (${mongoRes.dbName})\x1b[0m`);
  }
  console.log('');
}

// --- COMMAND: UPDATE / EDIT ---
async function handleUpdate() {
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();

  if (!email) {
    console.error('\x1b[31mError: Target --email is required for update.\x1b[0m');
    console.error('Usage: npx admin-auth update --email "admin@example.com" [--password "NewPassword"] [--name "New Name"] [--role "Role"]\n');
    process.exit(1);
  }

  const store = getCredentialsStore();
  const idx = store.admins.findIndex((a) => a.email.toLowerCase() === email);

  if (idx < 0) {
    console.error(`\x1b[31mError: Admin "${email}" not found.\x1b[0m`);
    if (store.admins.length > 0) {
      console.log('Available admins:', store.admins.map((a) => a.email).join(', '));
    }
    process.exit(1);
  }

  const current = store.admins[idx];
  const newPassword = flags.password || flags.p;
  const newName = flags.name || flags.n;
  const newRole = flags.role || flags.r;
  const newEmail = (flags['new-email'] || '').trim().toLowerCase();

  if (newPassword) {
    if (newPassword.length < 6) {
      console.error('\x1b[31mError: New password must be at least 6 characters long.\x1b[0m\n');
      process.exit(1);
    }
    current.salt = crypto.randomBytes(16).toString('hex');
    current.hash = hashPassword(newPassword, current.salt);
  }

  if (newName) current.name = newName;
  if (newRole) current.role = newRole;
  if (newEmail && newEmail !== email) {
    current.email = newEmail;
  }

  current.updatedAt = new Date().toISOString();
  store.admins[idx] = current;

  saveCredentialsStore(store);
  const mongoRes = await syncWithMongoDB('upsert', current);

  console.log(`\n\x1b[32m✓ Admin account "${email}" updated successfully!\x1b[0m`);
  console.log(`  \x1b[1mEmail:\x1b[0m   ${current.email}`);
  console.log(`  \x1b[1mName:\x1b[0m    ${current.name}`);
  console.log(`  \x1b[1mRole:\x1b[0m    ${current.role}`);
  if (newPassword) {
    console.log(`  \x1b[1mPassword:\x1b[0m \x1b[33mUpdated to new hash\x1b[0m`);
  }
  if (mongoRes.ok) {
    console.log(`  \x1b[1mMongoDB:\x1b[0m  \x1b[32mSynced\x1b[0m`);
  }
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

  const store = getCredentialsStore();
  const initialCount = store.admins.length;
  store.admins = store.admins.filter((a) => a.email.toLowerCase() !== email);

  if (store.admins.length === initialCount) {
    console.error(`\x1b[31mError: No admin account found with email "${email}".\x1b[0m\n`);
    process.exit(1);
  }

  saveCredentialsStore(store);
  await syncWithMongoDB('delete', { email });

  console.log(`\n\x1b[32m✓ Successfully deleted admin credential: "${email}"\x1b[0m`);
  console.log(`  Remaining admin accounts: ${store.admins.length}\n`);
}

// --- COMMAND: DELETE-ALL (DELETE ALL / CLEAR / WIPE) ---
async function handleDeleteAll() {
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
  await syncWithMongoDB('delete-all', {});

  console.log('\n\x1b[1m\x1b[31m====================================================\x1b[0m');
  console.log('\x1b[1m\x1b[31m   ✓ ALL ADMIN CREDENTIALS HAVE BEEN WIPED CLEAN    \x1b[0m');
  console.log('\x1b[1m\x1b[31m====================================================\x1b[0m\n');
  console.log('  \x1b[90m- .admin-credentials.json is emptied\x1b[0m');
  console.log('  \x1b[90m- MongoDB admin_credentials collection cleared\x1b[0m\n');
  console.log('To seed a new admin account, run:');
  console.log('  \x1b[36mnpx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n');
}

// --- COMMAND: ALL / LIST ---
async function handleList() {
  const store = getCredentialsStore();
  console.log('\n\x1b[1m\x1b[32m=== NEDJECT CONFIGURED ADMIN ACCOUNTS ===\x1b[0m\n');

  if (!store.admins || store.admins.length === 0) {
    console.log('\x1b[33mNo admin credentials configured yet.\x1b[0m');
    console.log('\nRun seed to create primary admin:');
    console.log('  \x1b[36mnpx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n');
    return;
  }

  store.admins.forEach((admin, idx) => {
    const isPrimary = idx === 0 ? '\x1b[32m[PRIMARY ADMIN]\x1b[0m' : '\x1b[90m[ADMIN]\x1b[0m';
    console.log(`\x1b[1m#${idx + 1}\x1b[0m ${isPrimary} \x1b[1m${admin.name}\x1b[0m <\x1b[36m${admin.email}\x1b[0m>`);
    console.log(`   \x1b[90mRole:\x1b[0m ${admin.role} | \x1b[90mID:\x1b[0m ${admin.id || 'N/A'}`);
    console.log(`   \x1b[90mHash:\x1b[0m ${admin.hash ? admin.hash.slice(0, 20) + '...' : 'NONE'} | \x1b[90mUpdated:\x1b[0m ${admin.updatedAt}`);
    console.log('');
  });
}

// --- COMMAND: VERIFY ---
async function handleVerify() {
  // Support flags --email / --password, or positional args [1], [2]
  const email = (flags.email || flags.e || positional[1] || '').trim().toLowerCase();
  const password = flags.password || flags.p || positional[2] || '';

  if (!email || !password) {
    console.error('\n\x1b[31mError: Both --email and --password are required to verify credentials.\x1b[0m\n');
    console.error('Usage:');
    console.error('  \x1b[36mnpx verify --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n');
    process.exit(1);
  }

  const store = getCredentialsStore();
  let matched = store.admins.find((a) => a.email.toLowerCase() === email);

  // Fallback to top-level if store was legacy format
  if (!matched && store.email && store.email.toLowerCase() === email && store.hash) {
    matched = store;
  }

  // Also check MongoDB if local store had no match
  if (!matched && process.env.MONGODB_URI) {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      await client.connect();
      const doc = await client.db().collection('admin_credentials').findOne({ email });
      await client.close();
      if (doc && doc.hash && doc.salt) {
        matched = doc;
      }
    } catch (e) {}
  }

  if (!matched) {
    console.log(`\n\x1b[1m\x1b[31m✗ VERIFICATION FAILED\x1b[0m`);
    console.log(`No admin account found with email: \x1b[33m"${email}"\x1b[0m\n`);
    if (store.admins.length > 0) {
      console.log('Configured admin emails on this system:');
      store.admins.forEach((a) => console.log(`  - \x1b[36m${a.email}\x1b[0m`));
    } else {
      console.log('No admin accounts are currently set. Run seed command:');
      console.log(`  \x1b[36mnpx admin-auth seed --email "${email}" --password "${password}"\x1b[0m`);
    }
    console.log('');
    process.exit(1);
  }

  const testHash = hashPassword(password, matched.salt);

  if (testHash === matched.hash) {
    console.log('\n\x1b[1m\x1b[32m====================================================\x1b[0m');
    console.log('\x1b[1m\x1b[32m   ✓ VERIFIED: ADMIN CREDENTIALS ARE VALID!         \x1b[0m');
    console.log('\x1b[1m\x1b[32m====================================================\x1b[0m\n');
    console.log(`  \x1b[1mEmail:\x1b[0m      \x1b[36m${matched.email}\x1b[0m`);
    console.log(`  \x1b[1mName:\x1b[0m       ${matched.name || 'Neeraj Rekwar'}`);
    console.log(`  \x1b[1mRole:\x1b[0m       ${matched.role || 'Super Admin'}`);
    console.log(`  \x1b[1mAlgorithm:\x1b[0m  PBKDF2-SHA512 (100,000 iterations)`);
    console.log(`  \x1b[1mResult:\x1b[0m     \x1b[32mPASSWORD MATCHES STORED HASH (Access Granted)\x1b[0m`);
    console.log(`\nYou can safely log in at: \x1b[36mhttp://localhost:3000/admin/login\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\n\x1b[1m\x1b[31m✗ VERIFICATION FAILED\x1b[0m`);
    console.log(`\x1b[31mIncorrect password for admin:\x1b[0m \x1b[33m"${email}"\x1b[0m\n`);
    console.log('To update this admin\'s password, run:');
    console.log(`  \x1b[36mnpx admin-auth update --email "${email}" --password "${password}"\x1b[0m\n`);
    process.exit(1);
  }
}

// --- COMMAND: GENERATE ---
async function handleGenerate() {
  const email = (flags.email || flags.e || positional[1] || 'neerajrekwar817@gmail.com').trim().toLowerCase();
  const generatedPassword = crypto.randomBytes(9).toString('base64url');
  flags.email = email;
  flags.password = generatedPassword;
  await handleSeed();
}

// --- COMMAND: STATUS ---
async function handleStatus() {
  const store = getCredentialsStore();
  console.log('\n\x1b[1m\x1b[32m=== NEDJECT TERMINAL ADMIN CREDENTIALS STATUS ===\x1b[0m');

  if (!store.admins || store.admins.length === 0) {
    console.log('\n\x1b[33mNo admin credentials currently configured.\x1b[0m');
    console.log('\nRun seed to initialize:');
    console.log('  \x1b[36mnpx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"\x1b[0m\n');
    return;
  }

  const primary = store.admins[0];
  console.log(`\n  \x1b[1mTotal Admins:\x1b[0m      ${store.admins.length}`);
  console.log(`  \x1b[1mPrimary Admin:\x1b[0m     \x1b[36m${primary.email}\x1b[0m (${primary.name} - ${primary.role})`);
  console.log(`  \x1b[1mLocal Storage:\x1b[0m     .admin-credentials.json [Active]`);
  console.log(`  \x1b[1mLast Modified:\x1b[0m     ${primary.updatedAt}`);
  console.log(`\n  \x1b[90mVerify credentials:\x1b[0m npx verify --email "${primary.email}" --password "<password>"\n`);
}

// --- COMMAND: HELP ---
function handleHelp() {
  console.log(`
\x1b[1m\x1b[32m=== NEDJECT ADMIN CREDENTIALS TERMINAL CLI ===\x1b[0m
Manage admin authentication credentials directly via the terminal.

\x1b[1mAvailable Commands:\x1b[0m

  \x1b[36mseed\x1b[0m [--email "email"] [--password "pass"] [--name "Name"] [--role "Role"]
    Seed default or custom admin credentials with PBKDF2-SHA512 security.
    \x1b[90mExample:\x1b[0m npx admin-auth seed --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"

  \x1b[36mverify\x1b[0m --email "email" --password "pass"
    Verify credentials against stored PBKDF2 hash.
    \x1b[90mExample:\x1b[0m npx verify --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"

  \x1b[36mcreate\x1b[0m --email "email" --password "pass" [--name "Name"] [--role "Role"]
    Create a new admin account.
    \x1b[90mExample:\x1b[0m npx admin-auth create --email "neerajrekwar817@gmail.com" --password "YourStrongPassword"

  \x1b[36mupdate\x1b[0m --email "email" [--password "newPass"] [--name "NewName"] [--role "Role"]
    Update existing admin's password, name, or role.
    \x1b[90mExample:\x1b[0m npx admin-auth update --email "neerajrekwar817@gmail.com" --password "NewPassword123"

  \x1b[36mdelete\x1b[0m --email "email"
    Delete a specific admin account.
    \x1b[90mExample:\x1b[0m npx admin-auth delete --email "admin@example.com"

  \x1b[36mdelete all\x1b[0m (or \x1b[36mdelete-all\x1b[0m)
    Wipe and delete all admin credentials.
    \x1b[90mExample:\x1b[0m npx admin-auth delete all

  \x1b[36mall\x1b[0m (or \x1b[36mlist\x1b[0m)
    List all configured admin credentials.
    \x1b[90mExample:\x1b[0m npx admin-auth all

  \x1b[36mstatus\x1b[0m
    Show system status and primary admin email.
    \x1b[90mExample:\x1b[0m npx admin-auth status

  \x1b[36mgenerate\x1b[0m [--email "email"]
    Generate a random secure password for admin.
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
