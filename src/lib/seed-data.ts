import { SanityPost, PRESET_AUTHORS, PRESET_CATEGORIES, PRESET_POSTS, savePost, deletePost, getAllPosts } from './sanity';

export interface SeedPackage {
  version: string;
  timestamp: string;
  posts: SanityPost[];
  categories: typeof PRESET_CATEGORIES;
  authors: typeof PRESET_AUTHORS;
}

export const EXTENDED_SEED_POSTS: SanityPost[] = [
  ...PRESET_POSTS,
  {
    _id: 'sanity-post-004',
    _type: 'post',
    title: 'Fitness Glass HUD: Real-Time Biometric Telemetry Architecture via Google Fit API',
    slug: 'fitness-glass-hud-real-time-biometric-telemetry-google-fit',
    excerpt:
      'A systems architecture breakdown of the Fitness Glass telemetry dashboard: token lifecycle management, OAuth 2.0 PKCE handshakes, client-side caching of systolic vitals, and rendering high-contrast SVG dials at 60 FPS.',
    mainImage: {
      url: 'https://images.unsplash.com/photo-1510519138161-58434650c820?auto=format&fit=crop&w=1200&h=630&q=85',
      alt: 'Smart glass heads-up display biometrics and cadence telemetry interface',
      caption: 'Real-time telemetry HUD rendering steps, heart rate cadence, and active burn.',
    },
    author: {
      _id: 'author-neeraj-rekwar',
      name: 'Neeraj Rekwar',
      role: 'Lead Architect & Systems Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      bio: 'Lead engineer of Nedject, genQRstudio, and Fitness Glass telemetry engines.',
    },
    category: {
      _id: 'cat-biometrics',
      title: 'Biometric Telemetry & HUD',
      slug: 'biometric-telemetry',
      color: '#ccff00',
    },
    tags: ['Google Fit API', 'Telemetry', 'HUD', 'OAuth 2.0', 'Limited Use', 'Winter Arc'],
    publishedAt: '2026-03-20T10:00:00Z',
    estimatedReadingTime: '5 min read',
    isFeatured: true,
    status: 'published',
    seo: {
      metaTitle: 'Fitness Glass HUD: Telemetry Architecture via Google Fit API | Nedject',
      metaDescription:
        'Technical architecture for connecting wearable telemetry, Google Fit cloud sync, and 60 FPS SVG heads-up display dashboards.',
    },
    content: `## The Real-Time Biometrics Problem in Wearable HUDs

Athletes executing high-intensity cadence blocks cannot afford to swipe through mobile screens or wait for laggy HTTP polling to review heart rate recovery and target step thresholds. The **Fitness Glass** heads-up display module requires deterministic, sub-second telemetry visualization while strictly complying with the **Google API Services User Data Policy**.

\`\`\`
Google Fit Cloud API  ──>  Encrypted Token Refresh  ──>  Client-Side Memory Cache  ──>  60 FPS HUD Dial
\`\`\`

---

## 1. OAuth 2.0 PKCE Handshake & Ephemeral Token Storage

To protect athlete privacy, Nedject adopts an ephemeral token architecture:
1. **Short-Lived Access Tokens**: Granted with 60-minute TTLs, cached only in secure memory or signed session cookies.
2. **Refresh Tokens**: Encrypted at rest using AES-256 and never transmitted to client JavaScript.
3. **Limited Use Enforcement**: Telemetry is never stored in permanent external third-party databases without explicit export.

---

## 2. Telemetry Ingestion Pipeline

The HUD queries three essential Google Fit data sources:
- \`com.google.step_count.delta\`: Aggregated daily step count and interval cadences.
- \`com.google.calories.expended\`: Basal and active calorie expenditure.
- \`com.google.blood_pressure\`: Resting systolic and diastolic recovery vitals for athlete safety.

Each data point is fed directly into an optimized SVG gauge matrix designed with pure zero-radius industrial aesthetics.`,
  },
  {
    _id: 'sanity-post-005',
    _type: 'post',
    title: 'Amazon FNSKU vs GS1 UPC-A: Barcode Verification Standards for High-Velocity Fulfillment',
    slug: 'amazon-fnsku-vs-gs1-upc-barcode-verification-standards',
    excerpt:
      'A deep dive into optical Grade A barcode verifiers, X-dimension tolerances, thermal transfer ribbon selection, and Amazon FBA inbound compliance for retail and packaging engineers.',
    mainImage: {
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=85',
      alt: 'Automated fulfillment warehouse optical barcode scanner sorting parcels',
      caption: 'High-speed automated sorter reading GS1-128 and FNSKU labels on conveyor belts.',
    },
    author: PRESET_AUTHORS.marcus,
    category: PRESET_CATEGORIES.supplyChain,
    tags: ['FNSKU', 'UPC-A', 'Code 128', 'Barcode', 'Amazon FBA', 'ISO/IEC 15416'],
    publishedAt: '2026-03-18T14:30:00Z',
    estimatedReadingTime: '7 min read',
    isFeatured: false,
    status: 'published',
    seo: {
      metaTitle: 'Amazon FNSKU vs GS1 UPC-A Barcode Standards | Nedject',
      metaDescription:
        'Complete guide to ISO/IEC 15416 barcode verification, quiet zone tolerances, and avoiding Amazon FBA inbound rejections.',
    },
    content: `## The Cost of Rejected Inbound Pallets

A barcode that scans effortlessly on a smartphone camera can fail catastrophically when placed under an industrial overhead laser scanner traveling at 3 meters per second. Amazon fulfillment centers inspect incoming cartons with **ISO/IEC 15416 Grade A/B verifiers**. If symbol contrast, modulation, or edge determination drops below Grade C, the inbound shipment is flagged for unplanned prep fees or outright return.

---

## Key Differences: FNSKU vs UPC-A

| Metric | Amazon FNSKU (Code 128) | GS1 UPC-A |
| :--- | :--- | :--- |
| **Symbology** | Alphanumeric Code 128 Subsets A/B/C | 12-Digit Numeric Only |
| **Purpose** | Fulfillment Network Stock Keeping Unit (Seller-Specific) | Global Trade Item Number (GTIN-12) |
| **Nominal X-Dimension** | 10.0 mil (0.254 mm) minimum | 13.0 mil (0.330 mm) standard |
| **Quiet Zones** | Minimum 10x X-dimension or 0.25 inches | Minimum 9x X-dimension left/right |

Nedject's **Barcode Pick** engine renders pure SVG vectors with sub-pixel quiet zone margins, ensuring 100% compliance on thermal wax-resin printers.`,
  },
];

/**
 * Executes a full database seed across localStorage and active collections
 */
export function seedDatabase(options?: { overwrite?: boolean }): {
  success: boolean;
  count: number;
  message: string;
} {
  if (typeof window === 'undefined') {
    return { success: false, count: 0, message: 'Server-side execution not applicable.' };
  }

  try {
    const current = getAllPosts();
    let postsToSave: SanityPost[];

    if (options?.overwrite) {
      postsToSave = EXTENDED_SEED_POSTS;
    } else {
      // Merge unique posts by slug
      const existingSlugs = new Set(current.map((p) => p.slug));
      const newPosts = EXTENDED_SEED_POSTS.filter((p) => !existingSlugs.has(p.slug));
      postsToSave = [...current, ...newPosts];
    }

    localStorage.setItem('nedject_sanity_posts_v1', JSON.stringify(postsToSave));
    window.dispatchEvent(new Event('nedject_sanity_updated'));

    return {
      success: true,
      count: postsToSave.length,
      message: `Database successfully seeded with ${postsToSave.length} articles!`,
    };
  } catch (e: any) {
    return {
      success: false,
      count: 0,
      message: e?.message || 'Failed to seed database.',
    };
  }
}

/**
 * Direct Create Post Function
 */
export function directCreatePost(input: Partial<SanityPost>): SanityPost {
  const title = input.title?.trim() || 'Untitled Technical Article';
  const slug = input.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const post: SanityPost = {
    _id: input._id || `post-${Date.now()}`,
    _type: 'post',
    title,
    slug,
    excerpt: input.excerpt?.trim() || title,
    content: input.content || '<p>Initial article body content.</p>',
    mainImage: input.mainImage || {
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85',
      alt: title,
      caption: 'Technical schematic overview.',
    },
    author: input.author || PRESET_AUTHORS.alex,
    category: input.category || PRESET_CATEGORIES.print,
    tags: input.tags || ['300 DPI', 'Engineering', 'Calibration'],
    publishedAt: input.publishedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    estimatedReadingTime: input.estimatedReadingTime || '5 min read',
    isFeatured: input.isFeatured || false,
    status: input.status || 'published',
    seo: input.seo || { metaTitle: title, metaDescription: input.excerpt || title },
  };

  savePost(post);
  return post;
}

/**
 * Direct Update Post Function
 */
export function directUpdatePost(idOrSlug: string, updates: Partial<SanityPost>): SanityPost | null {
  const all = getAllPosts();
  const existing = all.find((p) => p._id === idOrSlug || p.slug === idOrSlug);
  if (!existing) return null;

  const merged: SanityPost = {
    ...existing,
    ...updates,
    _id: existing._id,
  };

  savePost(merged);
  return merged;
}

/**
 * Direct Delete Post Function
 */
export function directDeletePost(idOrSlug: string): boolean {
  const all = getAllPosts();
  const found = all.find((p) => p._id === idOrSlug || p.slug === idOrSlug);
  if (!found) return false;

  deletePost(found._id);
  return true;
}

/**
 * Exports complete database to a clean JSON string
 */
export function exportAllDataAsJson(): string {
  const pkg: SeedPackage = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    posts: getAllPosts(),
    categories: PRESET_CATEGORIES,
    authors: PRESET_AUTHORS,
  };
  return JSON.stringify(pkg, null, 2);
}

/**
 * Imports database from JSON string
 */
export function importDataFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    let postsToSave: SanityPost[] = [];

    if (Array.isArray(parsed)) {
      postsToSave = parsed;
    } else if (parsed && Array.isArray(parsed.posts)) {
      postsToSave = parsed.posts;
    } else {
      return { success: false, count: 0, error: 'JSON does not contain a valid posts array.' };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('nedject_sanity_posts_v1', JSON.stringify(postsToSave));
      window.dispatchEvent(new Event('nedject_sanity_updated'));
    }

    return { success: true, count: postsToSave.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'Invalid JSON syntax.' };
  }
}
