export interface MockupDevice {
  id: string;
  name: string;
  category: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  dpr: number;
  radius: number;
  bezel: number;
  notchType?: 'dynamic-island' | 'notch' | 'punch-hole' | 'camera-dot' | 'none';
  aspectRatio: string;
  description: string;
}

export const MOCKUP_DEVICES: MockupDevice[] = [
  // Mobile Devices
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    category: 'mobile',
    width: 393,
    height: 852,
    dpr: 3,
    radius: 54,
    bezel: 12,
    notchType: 'dynamic-island',
    aspectRatio: '19.5:9',
    description: 'Flagship iOS mobile viewport (393 × 852 pt)',
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Galaxy S24 Ultra',
    category: 'mobile',
    width: 412,
    height: 915,
    dpr: 3.5,
    radius: 36,
    bezel: 10,
    notchType: 'punch-hole',
    aspectRatio: '20:9',
    description: 'Modern Android flagship viewport (412 × 915 pt)',
  },
  {
    id: 'pixel-9-pro',
    name: 'Google Pixel 9 Pro',
    category: 'mobile',
    width: 412,
    height: 924,
    dpr: 3,
    radius: 46,
    bezel: 11,
    notchType: 'punch-hole',
    aspectRatio: '20:9',
    description: 'Stock Android 15 reference device (412 × 924 pt)',
  },
  {
    id: 'iphone-se',
    name: 'Compact Mobile (iPhone SE)',
    category: 'mobile',
    width: 375,
    height: 667,
    dpr: 2,
    radius: 38,
    bezel: 14,
    notchType: 'camera-dot',
    aspectRatio: '16:9',
    description: 'Compact 375px baseline mobile viewport',
  },

  // Tablet Devices
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    category: 'tablet',
    width: 834,
    height: 1194,
    dpr: 2,
    radius: 36,
    bezel: 18,
    notchType: 'camera-dot',
    aspectRatio: '4:3',
    description: 'Primary tablet portrait/landscape baseline (834 × 1194 pt)',
  },
  {
    id: 'ipad-mini',
    name: 'iPad Mini 8.3"',
    category: 'tablet',
    width: 744,
    height: 1133,
    dpr: 2,
    radius: 32,
    bezel: 16,
    notchType: 'camera-dot',
    aspectRatio: '3:2',
    description: 'Compact tablet viewport for reading & dashboards',
  },
  {
    id: 'surface-pro-9',
    name: 'Surface Pro 9',
    category: 'tablet',
    width: 912,
    height: 1368,
    dpr: 2,
    radius: 20,
    bezel: 16,
    notchType: 'none',
    aspectRatio: '3:2',
    description: 'Windows 11 hybrid tablet/laptop viewport',
  },

  // Desktop & Laptop Devices
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    category: 'desktop',
    width: 1440,
    height: 900,
    dpr: 2,
    radius: 20,
    bezel: 18,
    notchType: 'notch',
    aspectRatio: '16:10',
    description: 'Industry-standard 1440px laptop desktop baseline',
  },
  {
    id: 'desktop-hd',
    name: 'Studio Display 27" (1080p Viewport)',
    category: 'desktop',
    width: 1920,
    height: 1080,
    dpr: 2,
    radius: 14,
    bezel: 22,
    notchType: 'camera-dot',
    aspectRatio: '16:9',
    description: 'Full HD widescreen desktop viewport (1920 × 1080)',
  },
  {
    id: 'ultrawide-34',
    name: 'UltraWide Monitor 34"',
    category: 'desktop',
    width: 2560,
    height: 1080,
    dpr: 1.5,
    radius: 12,
    bezel: 20,
    notchType: 'none',
    aspectRatio: '21:9',
    description: 'Panoramic multi-column widescreen display (2560 × 1080)',
  },
];

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  badge: string;
  themeColor: string;
}

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: 'industrial-studio',
    name: 'Nedject 300 DPI QR Studio',
    category: 'Industrial SaaS',
    tagline: 'High-Precision Photo QR & Prepress Calibration Suite',
    description:
      'High-converting brutalist SaaS landing page with real-time vector matrix calibration, Reed-Solomon Level H error recovery, and interactive DPI slider.',
    badge: 'Brutalist High-DPI',
    themeColor: '#ccff00',
  },
  {
    id: 'apex-logistics',
    name: 'Apex Barcode & Supply Chain Portal',
    category: 'Logistics & Warehousing',
    tagline: 'Automated 1D Symbology & Thermal Fulfillment System',
    description:
      'Modern logistics and distribution center web portal featuring UPC-A/EAN-13 check digit validators, 4x6 label print queues, and ANSI Grade A telemetry.',
    badge: 'Supply Chain',
    themeColor: '#3b82f6',
  },
  {
    id: 'titan-forensics',
    name: 'Titan QR Threat & Quishing Forensics',
    category: 'Cybersecurity',
    tagline: 'Zero-Trust Optical Payload & Multi-Hop Audit Console',
    description:
      'Dark-mode enterprise security dashboard for analyzing phishing payloads, Unicode homograph deception, and adhesive sticker overlay tampering.',
    badge: 'Cyber Defense',
    themeColor: '#ef4444',
  },
  {
    id: 'pulse-biometrics',
    name: 'Pulse Google Fit Cadence HUD',
    category: 'Health & Fitness',
    tagline: 'Real-Time Biometrics & Measurable Target Goals',
    description:
      'Futuristic dark HUD fitness interface tracking step cadence, blood pressure trends, and smart training timetables synchronized with Google Fit.',
    badge: 'Telemetry HUD',
    themeColor: '#10b981',
  },
  {
    id: 'architect-portfolio',
    name: 'Principal Systems Architect Bio Matrix',
    category: 'Executive Portfolio',
    tagline: 'Engineering Leadership, Patents & System Architecture',
    description:
      'Editorial portfolio layout for senior software architects, featuring interactive verified credentials, vCard 3.0 generation, and system design case studies.',
    badge: 'Executive Bio',
    themeColor: '#f59e0b',
  },
];
