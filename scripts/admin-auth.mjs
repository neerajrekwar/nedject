#!/usr/bin/env node

/**
 * NEDJECT ADMIN CREDENTIALS MANAGER (TERMINAL CLI)
 * 
 * Manage admin login credentials strictly through the terminal.
 * 
 * Usage:
 *   node scripts/admin-auth.mjs status
 *   node scripts/admin-auth.mjs set --email "admin@example.com" --password "MySecretPass"
 *   node scripts/admin-auth.mjs generate [--email "admin@example.com"]
 *   node scripts/admin-auth.mjs verify --email "admin@example.com" --password "MySecretPass"
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CREDS_FILE = path.join(process.cwd(), '.admin-credentials.json');

// Parse flags like --email "..." --password "..."
function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

const args = process.argv.slice(2);
const command = args[0] || 'status';
const flags = parseFlags(args.slice(1));

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function getCredentials() {
  if (fs.existsSync(CREDS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CREDS_FILE, 'utf-8'));
    } catch (e) {}
  }
  return null;
}

function saveCredentials(creds) {
  fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
}

function handleStatus() {
  const creds = getCredentials();
  console.log('\n\x1b[1m\x1b[32m=== NEDJECT TERMINAL ADMIN CREDENTIALS ===\x1b[0m');
  if (!creds) {
    console.log('\x1b[33mNo admin credentials set yet.\x1b[0m');
    console.log('Run: \x1b[36mnode scripts/admin-auth.mjs set --email <email> --password <password>\x1b[0m\n');
    return;
  }

  console.log(`  \x1b[1mConfigured Email:\x1b[0m ${creds.email}`);
  console.log(`  \x1b[1mPassword Hash:\x1b[0m    [SECURED PBKDF2-SHA512] (${creds.hash.slice(0, 16)}...)`);
  console.log(`  \x1b[1mLast Updated:\x1b[0m     ${creds.updatedAt}`);
  console.log('\nUse this email and password to log in at: \x1b[36m/admin/login\x1b[0m\n');
}

function handleSet() {
  const email = (flags.email || flags.e || '').trim().toLowerCase();
  const password = flags.password || flags.p;

  if (!email || !password) {
    console.error('\x1b[31mError: Both --email and --password are required.\x1b[0m');
    console.error('Example: node scripts/admin-auth.mjs set --email "neerajrekwar817@gmail.com" --password "MySecretPass"\n');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('\x1b[31mError: Password must be at least 6 characters long.\x1b[0m\n');
    process.exit(1);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  const creds = {
    email,
    salt,
    hash,
    updatedAt: new Date().toISOString(),
  };

  saveCredentials(creds);

  console.log('\n\x1b[32m✓ Admin credentials successfully updated via terminal!\x1b[0m');
  console.log(`  \x1b[1mEmail:\x1b[0m    ${email}`);
  console.log(`  \x1b[1mPassword:\x1b[0m [CONFIGURED IN TERMINAL]`);
  console.log(`  \x1b[1mStorage:\x1b[0m  .admin-credentials.json (Git-ignored & Private)\n`);
}

function handleGenerate() {
  const email = (flags.email || flags.e || 'neerajrekwar817@gmail.com').trim().toLowerCase();
  const generatedPassword = crypto.randomBytes(8).toString('base64url');

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(generatedPassword, salt);

  const creds = {
    email,
    salt,
    hash,
    updatedAt: new Date().toISOString(),
  };

  saveCredentials(creds);

  console.log('\n\x1b[32m✓ New random admin credentials generated via terminal!\x1b[0m');
  console.log(`  \x1b[1mAdmin Email:\x1b[0m    \x1b[36m${email}\x1b[0m`);
  console.log(`  \x1b[1mAdmin Password:\x1b[0m \x1b[1m\x1b[33m${generatedPassword}\x1b[0m`);
  console.log('\nSave this password! You can now log into \x1b[36m/admin/login\x1b[0m.\n');
}

function handleVerify() {
  const email = (flags.email || flags.e || '').trim().toLowerCase();
  const password = flags.password || flags.p;

  const creds = getCredentials();
  if (!creds) {
    console.log('\x1b[31mNo credentials found.\x1b[0m');
    process.exit(1);
  }

  if (creds.email !== email) {
    console.log(`\x1b[31m✗ Email mismatch: given "${email}", expected "${creds.email}"\x1b[0m`);
    process.exit(1);
  }

  const testHash = hashPassword(password, creds.salt);
  if (testHash === creds.hash) {
    console.log('\x1b[32m✓ Verified! Credentials match terminal configuration.\x1b[0m');
  } else {
    console.log('\x1b[31m✗ Password incorrect.\x1b[0m');
    process.exit(1);
  }
}

switch (command.toLowerCase()) {
  case 'set':
    handleSet();
    break;
  case 'generate':
  case 'gen':
    handleGenerate();
    break;
  case 'verify':
  case 'check':
    handleVerify();
    break;
  case 'status':
  default:
    handleStatus();
    break;
}
