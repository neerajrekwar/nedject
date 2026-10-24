#!/usr/bin/env node

/**
 * NEDJECT ADMIN TERMINAL CLI
 * Direct Terminal Create, Read, Update, Delete & Database Seeder
 *
 * Usage:
 *   node scripts/admin.mjs help
 *   node scripts/admin.mjs list
 *   node scripts/admin.mjs seed
 *   node scripts/admin.mjs create --title "My Title" --slug "my-slug" --status "published"
 *   node scripts/admin.mjs update --slug "my-slug" --title "New Title" --status "draft"
 *   node scripts/admin.mjs delete --slug "my-slug"
 *   node scripts/admin.mjs export [backup.json]
 *   node scripts/admin.mjs import <backup.json>
 */

import fs from 'fs';
import path from 'path';
import http from 'http';

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const BACKUP_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Ensure data folder exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {}
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

// Parse CLI flags like --title "..." --slug "..."
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

const flags = parseFlags(args.slice(1));

// Helper: Make HTTP request to local Next.js server
async function makeRequest(method, endpoint, payload = null) {
  return new Promise((resolve) => {
    try {
      const url = new URL(endpoint, API_BASE);
      const dataString = payload ? JSON.stringify(payload) : null;

      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname + url.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
        },
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: body });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ ok: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'Request timed out' });
      });

      if (dataString) req.write(dataString);
      req.end();
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

// Read local data file fallback
function getLocalPosts() {
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
    } catch (e) {}
  }
  return [];
}

function saveLocalPosts(posts) {
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

// ---------------- COMMAND HANDLERS ----------------

async function handleHelp() {
  console.log(`
\x1b[1m\x1b[32m=== NEDJECT ADMIN TERMINAL CLI ===\x1b[0m
Direct Create, Read, Update, Delete & Database Seeder

\x1b[1mAvailable Commands:\x1b[0m

  \x1b[36mlist\x1b[0m
    List all current blog posts and their status
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs list

  \x1b[36mcreate\x1b[0m --title "Title" [--slug "slug"] [--category "Print"] [--status "published"]
    Directly create a new blog article
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs create --title "New 300 DPI Prepress Standard" --status published

  \x1b[36mupdate\x1b[0m --slug "slug" [--title "New Title"] [--status "draft" | "published"]
    Directly update a post's title or status
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs update --slug "new-300-dpi-prepress-standard" --status draft

  \x1b[36mdelete\x1b[0m --slug "slug" (or --id "post-id")
    Directly delete an article from the database
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs delete --slug "my-old-post"

  \x1b[36mseed\x1b[0m [--overwrite]
    Seed the database with all industrial technical engineering posts
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs seed --overwrite

  \x1b[36mexport\x1b[0m [output.json]
    Export all articles to a JSON backup file
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs export backup.json

  \x1b[36mimport\x1b[0m <input.json>
    Import and restore articles from a JSON file
    \x1b[90mExample:\x1b[0m node scripts/admin.mjs import backup.json
`);
}

async function handleList() {
  console.log('\x1b[1mFetching articles...\x1b[0m');
  const res = await makeRequest('GET', '/api/admin/posts');

  let posts = [];
  if (res.ok && res.data?.posts) {
    posts = res.data.posts;
  } else {
    posts = getLocalPosts();
  }

  if (posts.length === 0) {
    console.log('\x1b[33mNo posts found. Run "node scripts/admin.mjs seed" to populate default articles.\x1b[0m');
    return;
  }

  console.log(`\n\x1b[1m\x1b[32mFOUND ${posts.length} ARTICLES:\x1b[0m\n`);
  posts.forEach((p, idx) => {
    const statusColor = p.status === 'published' ? '\x1b[32m[PUBLISHED]\x1b[0m' : '\x1b[33m[DRAFT]\x1b[0m';
    console.log(`\x1b[1m#${idx + 1}\x1b[0m ${statusColor} \x1b[1m${p.title}\x1b[0m`);
    console.log(`   \x1b[90mSlug:\x1b[0m /blog/${p.slug} | \x1b[90mCategory:\x1b[0m ${p.category?.title || 'General'} | \x1b[90mID:\x1b[0m ${p._id}`);
    console.log('');
  });
}

async function handleCreate() {
  const title = flags.title || flags.t;
  if (!title) {
    console.error('\x1b[31mError: --title is required.\x1b[0m Example: node scripts/admin.mjs create --title "My Article"');
    process.exit(1);
  }

  const slug = flags.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const status = flags.status === 'draft' ? 'draft' : 'published';
  const categoryTitle = flags.category || 'Print Engineering';

  const newPost = {
    _id: `post-${Date.now()}`,
    _type: 'post',
    title,
    slug,
    excerpt: flags.excerpt || `Direct technical article created via terminal CLI: ${title}`,
    content: `<h2>${title}</h2><p>Article body created via Nedject terminal CLI tools.</p>`,
    category: {
      _id: 'cat-print',
      title: categoryTitle,
      slug: categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      color: '#0055ff',
    },
    author: {
      _id: 'author-neeraj-rekwar',
      name: 'Neeraj Rekwar',
      role: 'Lead Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      bio: 'Lead Engineer of Nedject',
    },
    tags: flags.tags ? flags.tags.split(',') : ['Engineering', 'CLI', '300 DPI'],
    publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    estimatedReadingTime: '4 min read',
    status,
    isFeatured: Boolean(flags.featured),
  };

  // Try API first
  const res = await makeRequest('POST', '/api/admin/posts', newPost);

  // Also persist in local data file
  const local = getLocalPosts();
  local.unshift(newPost);
  saveLocalPosts(local);

  console.log(`\x1b[32m✓ Successfully created article:\x1b[0m`);
  console.log(`  \x1b[1mTitle:\x1b[0m  ${newPost.title}`);
  console.log(`  \x1b[1mSlug:\x1b[0m   /blog/${newPost.slug}`);
  console.log(`  \x1b[1mStatus:\x1b[0m ${newPost.status}`);
  console.log(`  \x1b[1mID:\x1b[0m     ${newPost._id}`);
}

async function handleUpdate() {
  const slug = flags.slug || flags.s;
  const id = flags.id;

  if (!slug && !id) {
    console.error('\x1b[31mError: --slug or --id is required.\x1b[0m Example: node scripts/admin.mjs update --slug "my-slug" --status "draft"');
    process.exit(1);
  }

  const updates = {};
  if (flags.title) updates.title = flags.title;
  if (flags.status) updates.status = flags.status;
  if (flags.excerpt) updates.excerpt = flags.excerpt;

  if (slug) updates.slug = slug;
  if (id) updates._id = id;

  const res = await makeRequest('PUT', '/api/admin/posts', updates);

  // Update local file
  const local = getLocalPosts();
  const idx = local.findIndex((p) => p.slug === slug || p._id === id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalPosts(local);
  }

  console.log(`\x1b[32m✓ Successfully updated article [${slug || id}]:\x1b[0m`, updates);
}

async function handleDelete() {
  const slug = flags.slug || flags.s;
  const id = flags.id;

  if (!slug && !id) {
    console.error('\x1b[31mError: --slug or --id is required.\x1b[0m Example: node scripts/admin.mjs delete --slug "my-slug"');
    process.exit(1);
  }

  const endpoint = slug ? `/api/admin/posts?slug=${encodeURIComponent(slug)}` : `/api/admin/posts?id=${encodeURIComponent(id)}`;
  await makeRequest('DELETE', endpoint);

  // Update local file
  const local = getLocalPosts();
  const filtered = local.filter((p) => p.slug !== slug && p._id !== id);
  saveLocalPosts(filtered);

  console.log(`\x1b[32m✓ Successfully deleted article: ${slug || id}\x1b[0m`);
}

async function handleSeed() {
  console.log('\x1b[1mExecuting database seed via API...\x1b[0m');
  const overwrite = Boolean(flags.overwrite);
  const res = await makeRequest('POST', '/api/admin/seed', { overwrite });

  if (res.ok) {
    if (res.data?.posts) {
      saveLocalPosts(res.data.posts);
    }
    console.log(`\x1b[32m✓ ${res.data?.dbResult || `Database seeded with ${res.data?.seededCount || 5} articles!`}\x1b[0m`);
  } else {
    console.log('\x1b[33mDev server not reachable, fallback to seeding local backup file...\x1b[0m');
    const defaultPosts = [
      {
        _id: 'post-seed-01',
        title: 'Mastering 300 DPI Photo QR Codes for Commercial Print Runs',
        slug: 'mastering-300-dpi-photo-qr-codes-for-high-speed-print',
        status: 'published',
        publishedAt: 'Oct 24, 2026',
        category: { title: 'Print Engineering' },
      },
      {
        _id: 'post-seed-02',
        title: 'Fitness Glass HUD: Real-Time Biometric Telemetry Architecture',
        slug: 'fitness-glass-hud-real-time-biometric-telemetry-google-fit',
        status: 'published',
        publishedAt: 'Oct 24, 2026',
        category: { title: 'Biometrics & HUD' },
      },
    ];
    saveLocalPosts(defaultPosts);
    console.log('\x1b[32m✓ Local data/posts.json seeded!\x1b[0m');
  }
}

async function handleExport() {
  const filename = args[1] || 'nedject-posts-export.json';
  const res = await makeRequest('GET', '/api/admin/seed');

  let payload = res.ok && res.data?.seedPackage ? res.data.seedPackage : { posts: getLocalPosts() };
  fs.writeFileSync(filename, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`\x1b[32m✓ Successfully exported database to: ${filename}\x1b[0m`);
}

async function handleImport() {
  const filename = args[1];
  if (!filename || !fs.existsSync(filename)) {
    console.error(`\x1b[31mError: File "${filename}" not found.\x1b[0m Example: node scripts/admin.mjs import backup.json`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filename, 'utf-8');
  const parsed = JSON.parse(raw);
  const posts = Array.isArray(parsed) ? parsed : parsed.posts || [];

  await makeRequest('POST', '/api/admin/seed', { overwrite: true, customPosts: posts });
  saveLocalPosts(posts);
  console.log(`\x1b[32m✓ Successfully imported ${posts.length} articles from ${filename}!\x1b[0m`);
}

// ---------------- ROUTER ----------------

switch (command.toLowerCase()) {
  case 'list':
  case 'ls':
    handleList();
    break;
  case 'create':
  case 'add':
  case 'new':
    handleCreate();
    break;
  case 'update':
  case 'edit':
    handleUpdate();
    break;
  case 'delete':
  case 'del':
  case 'rm':
    handleDelete();
    break;
  case 'seed':
    handleSeed();
    break;
  case 'export':
    handleExport();
    break;
  case 'import':
    handleImport();
    break;
  case 'help':
  default:
    handleHelp();
    break;
}
