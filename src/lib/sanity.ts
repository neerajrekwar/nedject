export interface SanityAuthor {
  _id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: string;
  color: string;
}

export interface SanityPost {
  _id: string;
  _type: 'post';
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown or Portable Text representation
  mainImage: {
    url: string;
    alt: string;
    caption?: string;
  };
  author: SanityAuthor;
  category: SanityCategory;
  tags: string[];
  publishedAt: string;
  estimatedReadingTime: string;
  isFeatured?: boolean;
  status: 'published' | 'draft';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export const PRESET_AUTHORS: Record<string, SanityAuthor> = {
  alex: {
    _id: 'author-alex-vance',
    name: 'Alex Vance',
    role: 'Principal Print & Optical Imaging Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    bio: '15+ years engineering industrial prepress workflows, flexographic calibration, and high-DPI rasterization matrices for global packaging conglomerates.',
  },
  marcus: {
    _id: 'author-marcus-chen',
    name: 'Marcus Chen',
    role: 'Logistics & Barcode Standards Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'GS1 Standards Committee advisor specializing in automated supply chain optical identification, thermal transfer dynamics, and Amazon FNSKU compliance.',
  },
  elena: {
    _id: 'author-elena-rostova',
    name: 'Elena Rostova',
    role: 'Cybersecurity & Threat Intelligence Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Former enterprise incident responder focused on physical-to-digital attack vectors, QR phishing (quishing), and forensic payload auditing.',
  },
};

export const PRESET_CATEGORIES: Record<string, SanityCategory> = {
  print: {
    _id: 'cat-print-eng',
    title: 'Print Engineering',
    slug: 'print-engineering',
    color: '#0055ff',
  },
  supplyChain: {
    _id: 'cat-supply-chain',
    title: 'Supply Chain & Logistics',
    slug: 'supply-chain',
    color: '#10b981',
  },
  cybersecurity: {
    _id: 'cat-cybersecurity',
    title: 'Cybersecurity & Auditing',
    slug: 'cybersecurity',
    color: '#ef4444',
  },
};

export const PRESET_POSTS: SanityPost[] = [
  {
    _id: 'sanity-post-001',
    _type: 'post',
    title: 'Mastering 300 DPI Photo QR Codes for High-Speed Commercial Print Runs',
    slug: 'mastering-300-dpi-photo-qr-codes-for-high-speed-print',
    excerpt:
      'A deep dive into dot gain compensation, Quiet Zone geometry, CMYK ink separation, and Reed-Solomon Error Correction Level H to guarantee 100% optical readability at 300+ DPI on commercial flexographic and offset presses.',
    mainImage: {
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85',
      alt: 'Industrial prepress calibration and high-speed photo QR code print matrix',
      caption: 'Calibration test strip magnified at 200x showing pure black module boundary crispness without ink bleed.',
    },
    author: PRESET_AUTHORS.alex,
    category: PRESET_CATEGORIES.print,
    tags: ['300 DPI', 'Print Calibration', 'QR Code', 'CMYK', 'Dot Gain', 'Prepress'],
    publishedAt: '2026-03-24T09:00:00Z',
    estimatedReadingTime: '6 min read',
    isFeatured: true,
    status: 'published',
    seo: {
      metaTitle: 'Mastering 300 DPI Photo QR Codes for Commercial Print Runs | Nedject',
      metaDescription:
        'Technical guide on 300 DPI Photo QR code generation, dot gain compensation, Reed-Solomon Level H error correction, and Quiet Zone requirements for flexo and offset printing.',
    },
    content: `## The 72 DPI Fallacy in Commercial Printing

Every print production manager has encountered the dreaded digital export trap: a QR code designed on a standard 72 DPI screen resolution pasted directly into an InDesign packaging layout. When sent to a high-speed flexographic or offset web press running at 800 feet per minute, the rasterization algorithm attempts to interpolate the pixel grid, rounding module corners into blurred edges.

Industrial barcode and 2D matrix scanners rely on razor-sharp luminance transitions. If the transition between a dark module and a light background spans more than **8% of module width** due to low-resolution anti-aliasing or dot bleed, scanner decodability drops precipitously from **Grade A to Grade F**.

\`\`\`
Digital Screen (72 DPI)  ──>  Interpolation Blur  ──>  Decodability Failure (Grade F)
Nedject Studio (300 DPI) ──>  Sub-pixel Threshold ──>  100% Optical Readability (Grade A)
\`\`\`

---

## Calculating Physical Dimensions at 300 DPI

To produce a verifiable, ISO/IEC 18004 compliant QR code, you must calibrate the exact pixel dimensions against the physical label dimensions. The fundamental equation is:

$$\\text{Target Pixels} = \\text{Physical Dimension (Inches)} \\times 300\\text{ DPI}$$

| Print Use Case | Physical Size (in) | Physical Size (mm) | 300 DPI Canvas Matrix | Recommended Version |
| :--- | :--- | :--- | :--- | :--- |
| Event Badges & Lanyards | 1.50" × 1.50" | 38.1 × 38.1 mm | 450 × 450 px | Version 4 (33×33 modules) |
| Retail Product Cartons | 0.85" × 0.85" | 21.6 × 21.6 mm | 255 × 255 px | Version 3 (29×29 modules) |
| Industrial Equipment Plates | 2.50" × 2.50" | 63.5 × 63.5 mm | 750 × 750 px | Version 6 (41×41 modules) |
| Exhibition Vinyl Banners | 6.00" × 6.00" | 152.4 × 152.4 mm | 1800 × 1800 px | Version 8 (49×49 modules) |

---

## Reed-Solomon Error Correction Level H (30%) & Center Photos

Nedject's signature photo-embed engine relies on **Reed-Solomon Level H Error Correction**. Standard QR specifications define four levels:

1. **Level L (Low)**: Recovers ~7% corrupted data.
2. **Level M (Medium)**: Recovers ~15% corrupted data.
3. **Level Q (Quartile)**: Recovers ~25% corrupted data.
4. **Level H (High)**: Recovers up to **30% damaged or obscured modules**.

When placing a high-contrast company logo or user portrait in the center of the QR matrix, you are intentionally obscuring up to 25% of the central codewords. Because Level H reserves 30% parity bytes, the scanning engine reconstructs the original URL or text payload with mathematical certainty.

> **Key Rule**: The central photo must never encroach into the three primary Finder Patterns (the large square targets in the top-left, top-right, and bottom-left corners) or the Timing Patterns running between them.

---

## Dot Gain Compensation and B/W Optical Thresholding

Liquid inks, particularly on porous kraft paper or uncoated carton board, naturally spread outwards as the paper fibers absorb the vehicle fluid. This phenomenon is known as **dot gain** (mechanical spread).

If a QR module is output at 50% width and expands by 12% on press, the dark modules expand while the white channels contract. In severe cases, the timing track bridges together, making the code completely unreadable.

### Nedject Prepress Calibration Strategy:
- **Erosion Filtering**: Pre-erode dark module edges by 1 to 2 pixels prior to 300 DPI rasterization when targeting uncoated stock.
- **Pure K-Channel Separation**: Export QR artwork strictly as single-channel **100% Black (C:0 M:0 Y:0 K:100)**. Never use 4-color Rich Black (e.g., C:60 M:40 Y:40 K:100) which risks registration shift during plate vibrations.
- **High-Pass Photo Blending**: Convert center portraits to 300 DPI halftone or dithered 1-bit monochromes to ensure zero color plate misalignment.

---

## The Mandatory ISO/IEC 18004 Quiet Zone

The **Quiet Zone** is the solid blank margin surrounding the QR code. Standard specifications dictate a margin of **at least 4 modules wide** on all four sides.

\`\`\`
┌──────────────────────────────────────────────┐
│  QUIET ZONE (Minimum 4 Module Widths)        │
│    ┌────────────────────────────────────┐    │
│    │  █▀▀▀▀▀█  ▄▄  █ ▄▄▄▄▄ █▀▀▀▀▀█      │    │
│    │  █ ███ █  ██  █  ███  █ ███ █      │    │
│    │  █ ▀▀▀ █  ▄▀▄ █ ▄   ▄ █ ▀▀▀ █      │    │
│    │  ▀▀▀▀▀▀▀  ▀ ▀ ▀ ▀   ▀ ▀▀▀▀▀▀▀      │    │
│    │  ▄▄▄ ▄▄▄▄▀▄█▄▄▀ █▀█▄▀▄ ▄▄▄▄▄▄      │    │
│    │  █▀▀▀▀▀█  ▄▀ ▄█▀▀▄█▄▄ █   ▄▄       │    │
│    │  ▀▀▀▀▀▀▀  ▀  ▀  ▀▀▀   ▀▀▀  ▀       │    │
│    └────────────────────────────────────┘    │
│  SOLID WHITE / NO GRAPHICS / NO TEXT         │
└──────────────────────────────────────────────┘
\`\`\`

If artwork or text invades this margin, the decoder's Edge Detection algorithm fails to establish the baseline contrast ratio, triggering an immediate scan failure.

---

## Pre-Press Checklist for Commercial Production

Before releasing your final packaging die-lines to your print vendor, verify the following six factors:

1. [x] Canvas is rendered at **300 DPI or higher** (vector SVG preferred for variable data).
2. [x] Error Correction set strictly to **Level H (30%)** when center photo is present.
3. [x] Quiet zone of **4 modules** preserved with no overlapping gradients.
4. [x] Color separation isolated to **100% K Black plate**.
5. [x] Physical size exceeds the minimum threshold of **0.80 inches (20 mm)** for consumer camera focus.
6. [x] ANSI/ISO verification scan tests at **Grade A** on printed substrate proof.`,
  },
  {
    _id: 'sanity-post-002',
    _type: 'post',
    title: 'The Industrial Barcode Blueprint: Precision Formatting for UPC-A, EAN-13, and Amazon FNSKU',
    slug: 'complete-guide-to-industrial-barcodes-upc-ean-code128',
    excerpt:
      'Comprehensive guide to 1D linear symbology, Modulo 10 check digit algorithms, thermal transfer label stock calibration, and Amazon FNSKU compliance for automated warehouse fulfillment.',
    mainImage: {
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=85',
      alt: 'Automated warehouse logistics center with industrial barcode scanning',
      caption: 'High-speed automated sorter reading 1D Code 128 logistics labels at 12 m/s.',
    },
    author: PRESET_AUTHORS.marcus,
    category: PRESET_CATEGORIES.supplyChain,
    tags: ['Barcode', 'UPC-A', 'EAN-13', 'Code 128', 'FNSKU', 'Thermal Printing', 'GS1'],
    publishedAt: '2026-03-18T14:30:00Z',
    estimatedReadingTime: '8 min read',
    isFeatured: false,
    status: 'published',
    seo: {
      metaTitle: 'Industrial Barcode Blueprint: UPC-A, EAN-13, Code 128 & FNSKU | Nedject',
      metaDescription:
        'Engineers guide to 1D linear barcodes: Modulo 10 calculation, thermal transfer label stock, Amazon FNSKU requirements, and vector SVG generation.',
    },
    content: `## The Physics of 1D Laser Scanning and X-Dimension

In automated distribution centers, laser scanners sweep across linear barcodes at frequencies exceeding **1,200 scans per second**. The laser beam measures the reflected light intensity as it travels across alternating bars and spaces.

The fundamental measurement unit of any 1D barcode is the **X-Dimension** — the width of the narrowest bar or space in the symbol:

- **Retail Point of Sale (UPC-A/EAN-13)**: Standard nominal X-dimension is **0.0130 inches (0.33 mm)**. Acceptable range is 0.264 mm (80%) to 0.660 mm (200%).
- **Warehouse Logistics (GS1-128 / ITF-14)**: Typical X-dimension is **0.020 to 0.040 inches (0.50 to 1.0 mm)** to enable long-range scanning from forklifts up to 30 feet away.

\`\`\`
Wide Bar ──>  ████ (3X)
Space    ──>       (1X or 2X)
Narrow   ──>  █    (1X = X-Dimension)
\`\`\`

---

## UPC-A vs EAN-13: Structure & Modulo 10 Check Digits

Both UPC-A (predominant in North America) and EAN-13 (global international standard) share the same underlying GS1 digit structure. In fact, every 12-digit UPC-A can be represented in EAN-13 simply by prepending a zero.

### The Modulo 10 Algorithm

The final digit of every UPC-A or EAN-13 barcode is a mathematical **Check Digit**, calculated using an alternating weight sum:

1. Sum all digits in odd positions (1st, 3rd, 5th, etc.) and multiply by **3**.
2. Sum all digits in even positions (2nd, 4th, 6th, etc.) and multiply by **1**.
3. Add the two sums together.
4. The check digit is the smallest number needed to round the total sum up to the nearest multiple of 10.

\`\`\`ts
// Modulo 10 Check Digit calculation in TypeScript
export function calculateUPCACheckDigit(elevenDigits: string): number {
  const digits = elevenDigits.split('').map(Number);
  let oddSum = 0;
  let evenSum = 0;

  for (let i = 0; i < digits.length; i++) {
    if (i % 2 === 0) oddSum += digits[i]; // 1st, 3rd, 5th (0-indexed)
    else evenSum += digits[i];
  }

  const total = oddSum * 3 + evenSum;
  const remainder = total % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}
\`\`\`

If a barcode label is printed with an incorrect check digit, modern retail scanners reject the scan instantaneously before querying the inventory database.

---

## Code 128 & GS1-128: High-Density Alphanumeric Encoding

While UPC and EAN are strictly numeric, **Code 128** is an ultra-high-density symbology capable of encoding all 128 ASCII characters. It features three internal character sets:

- **Subset A**: Standard uppercase letters, numbers, punctuation, and ASCII control characters (NUL, LF, CR, TAB).
- **Subset B**: Complete uppercase and lowercase ASCII alphabet, plus numbers and standard symbols.
- **Subset C**: Optimized double-density numeric mode. Every 2-digit number (00–99) is compressed into a single bar-space pattern, cutting label width in half!

Nedject Studio dynamically switches between Subsets B and C to guarantee the shortest possible barcode length for your logistics labels.

---

## Amazon FNSKU Label Specifications

Amazon Fulfillment by Amazon (FBA) mandates **Fulfillment Network Stock Keeping Unit (FNSKU)** barcodes on every unit entering fulfillment centers:

1. **Symbology**: Must be formatted in **Code 128A/B**.
2. **Label Dimensions**: Standard sizes are **1.0" × 2.0"** (25.4 × 50.8 mm) or **1.0" × 3.0"** (25.4 × 76.2 mm).
3. **Typography**: The FNSKU code (e.g., \`X003ABC123\`), title, and item condition (\`New\` or \`Used\`) must appear directly below the bars in clear human-readable font (minimum 8pt).
4. **Thermal Print Stock**: Direct thermal labels printed with inferior ribbon degrade under warehouse fluorescent UV light. Always use **Thermal Transfer labels with resin/wax ribbon** to pass optical intake scanners without chargeback fines.

---

## Vector SVG vs Pixel Raster Export

When exporting barcodes from Nedject's Barcode Pick engine, **always prioritize SVG vector format**:

- **Vectors (SVG)**: Render direct mathematical path geometries (\`<rect>\` elements) that scale infinitely without sub-pixel rounding artifacts.
- **High-DPI PNG (300/600 DPI)**: Recommended when importing directly into thermal printer spoolers (Zebra ZPL, Dymo, Brother) where each pixel maps 1:1 to a physical thermal printhead heating element.`,
  },
  {
    _id: 'sanity-post-003',
    _type: 'post',
    title: 'Forensic QR Code Auditing: Detecting Malicious Payloads, Redirection Hijacking, and Tampered Matrices',
    slug: 'qr-code-security-audit-detecting-malicious-payloads',
    excerpt:
      'Technical analysis of modern Quishing attack vectors, multi-hop redirect manipulation, Unicode homograph attacks, and forensic inspection techniques for enterprise perimeter defense.',
    mainImage: {
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&h=630&q=85',
      alt: 'Cybersecurity forensic terminal analyzing encrypted matrix payloads',
      caption: 'Real-time packet inspection of a multi-hop QR redirect attempting credential harvesting.',
    },
    author: PRESET_AUTHORS.elena,
    category: PRESET_CATEGORIES.cybersecurity,
    tags: ['QR Security', 'Quishing', 'Forensic Audit', 'Payload Inspection', 'Zero-Trust'],
    publishedAt: '2026-03-10T11:15:00Z',
    estimatedReadingTime: '7 min read',
    isFeatured: false,
    status: 'published',
    seo: {
      metaTitle: 'Forensic QR Code Auditing: Quishing, Redirects & Security | Nedject',
      metaDescription:
        'Deep-dive into QR code forensic analysis, detecting malicious redirection, physical sticker tampering, and automated inspection in enterprise environments.',
    },
    content: `## The Anatomy of Modern QR-Phishing (Quishing)

As corporate email gateways have matured with AI-powered attachment detonation and natural language link analyzers, threat actors have turned to physical-to-digital vectors: **Quishing (QR-Phishing)**.

By embedding malicious links inside an image-based QR code attached to a PDF or emailed directly, the payload evades traditional text-based email crawlers. The victim scans the code using a personal mobile device that sits outside the enterprise's Zero-Trust Network Architecture (ZTNA) and DNS-sinkhole protections.

\`\`\`
Corporate Email  ──> [Image QR Code] ──> Bypasses Text Crawlers
      │
      ▼ (Scanned via Phone)
Unprotected 5G Network ──> Credential Harvester (MFA Hijack)
\`\`\`

---

## Forensic Payload Dissection: Beyond the Naked URL

When conducting a forensic audit of a suspicious QR code with **Nedject's QR Crush engine**, the inspector extracts several raw layers:

### 1. Hexadecimal Byte Stream Inspection
Deconstructing the raw 8-bit byte stream reveals if the QR encoder inserted hidden zero-width spaces (\`\\u200B\`), bidirectional overrides (\`\\u202E\`), or UTF-8 homoglyph characters designed to deceive both the scanner and the user.

### 2. Multi-Hop Redirect Trace
Attackers rarely point a QR code directly to a malicious phishing landing page. Instead, they bounce through multiple legitimate intermediaries:

1. **Hop 1**: Legitimate URL shortener or tracking platform (e.g., bit.ly, tinyurl, or cloud open-redirect endpoint).
2. **Hop 2**: Compromised WordPress or Magento site acting as an evasion gateway.
3. **Hop 3**: Reverse-proxy MFA bypass kit (e.g., Evilginx) serving an exact clone of the target login portal.

\`\`\`bash
# CLI trace simulation:
curl -ILs -o /dev/null -w "%{url_effective}\\n" "https://short.link/xyz"
\`\`\`

---

## Physical Sticker Overlay & Matrix Tampering Detection

In public spaces — such as parking meters, EV charging stations, and restaurant payment terminals — attackers frequently use **physical sticker overlays**. They print high-gloss adhesive QR stickers and place them directly over the legitimate merchant's QR matrix.

### Forensic Indicators of Physical Tampering:
- **Substrate Thickness Variance**: Using calibrated optical micrometers to detect stepped relief around the border of the code.
- **Finder Pattern Skew**: Subtle angular misalignment between the sticker's positioning squares and the permanent signage frame.
- **Contrast Differential**: Differences in UV fluorescence between thermal paper stickers and silkscreened aluminum plates.

---

## Automated Inspection Pipeline Architecture

Enterprise defense teams are incorporating automated QR code quarantine pipelines into their SOC workflows:

| Pipeline Stage | Inspection Parameter | Failure Action |
| :--- | :--- | :--- |
| **Stage 1: Ingest** | Optical QR decode via \`jsqr\` / OpenCV matrix parser | Reject unparseable codes |
| **Stage 2: Payload Unpack** | URL canonicalization, Punycode / IDN homograph translation | Flag deceptive domains |
| **Stage 3: Headless Hop** | Follow HTTP 301/302 redirects in sandboxed Chromium cluster | Block known C2 networks |
| **Stage 4: DOM Scan** | Check final landing page for password fields and brand mimicry | Quarantine email attachment |
| **Stage 5: Certificate Audit** | Validate SSL certificate age (< 48 hours = high threat score) | Terminate active sessions |

---

## Enterprise Mitigation Guidelines

To protect your organization against sophisticated Quishing campaigns:

1. **Enforce FIDO2 / WebAuthn Hardware Keys**: Physical security keys (YubiKeys) are cryptographically bound to the browser's origin URL, rendering stolen credentials useless even on fake login sites.
2. **Deploy On-Device Mobile URL Protection**: Ensure corporate mobile devices inspect outbound browser intents before loading external domains.
3. **Mandate QR Auditing Tools**: Train staff to inspect QR destinations using forensic tools like **Nedject QR Crush** before authenticating or transferring funds.`,
  },
];

// Sanity Client & Storage Manager
const STORAGE_KEY = 'nedject_sanity_posts_v1';

export function getAllPosts(): SanityPost[] {
  if (typeof window === 'undefined') {
    return PRESET_POSTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_POSTS));
      return PRESET_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return PRESET_POSTS;
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
    return PRESET_POSTS;
  }
}

export function getPostBySlug(slug: string): SanityPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export function savePost(post: SanityPost): SanityPost[] {
  if (typeof window === 'undefined') return PRESET_POSTS;

  const posts = getAllPosts();
  const existingIndex = posts.findIndex((p) => p._id === post._id || p.slug === post.slug);

  let updated: SanityPost[];
  if (existingIndex >= 0) {
    updated = [...posts];
    updated[existingIndex] = post;
  } else {
    updated = [post, ...posts];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event so listeners on the same page can re-render
    window.dispatchEvent(new Event('nedject_sanity_updated'));
  } catch (e) {
    console.error('Failed to save post to localStorage:', e);
  }

  return updated;
}

export function deletePost(id: string): SanityPost[] {
  if (typeof window === 'undefined') return PRESET_POSTS;

  const posts = getAllPosts();
  const updated = posts.filter((p) => p._id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nedject_sanity_updated'));
  } catch (e) {
    console.error('Failed to delete post from localStorage:', e);
  }

  return updated;
}

export function resetPostsToPreset(): SanityPost[] {
  if (typeof window === 'undefined') return PRESET_POSTS;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PRESET_POSTS));
    window.dispatchEvent(new Event('nedject_sanity_updated'));
  } catch (e) {
    console.error('Failed to reset posts:', e);
  }

  return PRESET_POSTS;
}
