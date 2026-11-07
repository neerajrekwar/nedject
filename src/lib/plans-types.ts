export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'RUB';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  RUB: '₽',
};

export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  USD: 'US Dollar ($)',
  INR: 'Indian Rupee (₹)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  RUB: 'Russian Ruble (₽)',
};

export function getCurrencySymbol(currency?: string): string {
  if (!currency) return '₹';
  const c = currency.trim().toUpperCase();
  if (c === 'INR') return '₹';
  if (c === 'USD') return '$';
  if (c === 'EUR') return '€';
  if (c === 'GBP') return '£';
  if (c === 'RUB') return '₽';
  return (CURRENCY_SYMBOLS as any)[c] || (c.includes('INR') ? '₹' : '$');
}

export function formatCurrencyAmount(
  amount: number,
  currency: string = 'INR',
  options?: { showFree?: boolean }
): string {
  const symbol = getCurrencySymbol(currency);
  const c = (currency || 'INR').trim().toUpperCase();
  const num = Number(amount) || 0;
  if (num === 0 && options?.showFree !== false) return `FREE (${symbol}0)`;
  if (c === 'INR') {
    return `${symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  if (c === 'RUB') {
    return `${symbol}${num.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;
  }
  return `${symbol}${num.toFixed(2)}`;
}

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
  lifetime: number;
}

export interface PlanCycleDetails {
  durationDays: number | null; // e.g. 30, 365, null for lifetime
  label: string; // e.g. "30 DAYS", "365 DAYS", "NO EXPIRY"
  subtitle: string; // Detailed badge/subtext
}

export interface ManagedPlan {
  id: 'free' | 'starter' | 'pro' | 'enterprise' | string;
  name: string;
  badge?: string;
  description: string;
  generationLimit: number;
  creditType?: 'credits' | 'unlimited';
  monthlyCredits?: number;
  apiAccess?: boolean;
  rateLimitRpm?: number;
  allowedOriginsLimit?: number;
  active: boolean;
  pricing: Record<SupportedCurrency, PlanPricing>;
  cycles?: {
    monthly?: PlanCycleDetails;
    yearly?: PlanCycleDetails;
    lifetime?: PlanCycleDetails;
  };
  features: PlanFeature[];
  updatedAt?: string;
}

export const DEFAULT_PLANS: ManagedPlan[] = [
  {
    id: 'free',
    name: 'Nedject Free Tier',
    badge: 'FREE FOREVER',
    description: 'Essential optical tools for casual and hobbyist printing.',
    generationLimit: 10,
    creditType: 'credits',
    monthlyCredits: 10,
    apiAccess: true,
    rateLimitRpm: 20,
    allowedOriginsLimit: 1,
    active: true,
    pricing: {
      USD: { monthly: 0, yearly: 0, lifetime: 0 },
      INR: { monthly: 0, yearly: 0, lifetime: 0 },
      EUR: { monthly: 0, yearly: 0, lifetime: 0 },
      GBP: { monthly: 0, yearly: 0, lifetime: 0 },
      RUB: { monthly: 0, yearly: 0, lifetime: 0 },
    },
    cycles: {
      monthly: {
        durationDays: 30,
        label: '30 DAYS',
        subtitle: '2 Guest / 10 Auth Generations • Active for 30 days',
      },
      yearly: {
        durationDays: 365,
        label: '365 DAYS',
        subtitle: 'Standard free access • 1-year renewal',
      },
      lifetime: {
        durationDays: null,
        label: 'NO EXPIRY',
        subtitle: 'Free Tier (No Expiry)',
      },
    },
    features: [
      { text: '2 Guest / 10 Authenticated Generations', included: true },
      { text: 'Standard 300 DPI PNG Canvas Output', included: true },
      { text: 'Basic Barcode Pick (Code128, EAN-13, UPC)', included: true },
      { text: 'High-contrast B/W Print Calibration', included: true },
      { text: 'Normal Photo DPI Upscaler (150-300 DPI)', included: true },
      { text: 'Pear API Gateway Trial (20 RPM, 1 Domain)', included: true },
      { text: '600 DPI Vector PDF & CMYK Color Separation', included: false },
      { text: 'Priority Server Queue & Unlimited Generations', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Nedject Creator Pack',
    badge: 'CREDITS BASED',
    description: '500 high-resolution optical and API generation credits with origin whitelist network security.',
    generationLimit: 500,
    creditType: 'credits',
    monthlyCredits: 500,
    apiAccess: true,
    rateLimitRpm: 60,
    allowedOriginsLimit: 5,
    active: true,
    pricing: {
      USD: { monthly: 4.99, yearly: 49.0, lifetime: 89.0 },
      INR: { monthly: 399, yearly: 3999, lifetime: 7999 },
      EUR: { monthly: 4.69, yearly: 46.0, lifetime: 85.0 },
      GBP: { monthly: 3.99, yearly: 39.0, lifetime: 75.0 },
      RUB: { monthly: 449, yearly: 4499, lifetime: 8499 },
    },
    cycles: {
      monthly: {
        durationDays: 30,
        label: '30 DAYS',
        subtitle: '$4.99/mo rate • 500 Generation Credits • Active for 30 days',
      },
      yearly: {
        durationDays: 365,
        label: '365 DAYS',
        subtitle: '$49.00/yr rate • 6,000 Annual Credits • 1-year expiration',
      },
      lifetime: {
        durationDays: null,
        label: 'NO EXPIRY',
        subtitle: 'Creator Lifetime • 500 Monthly Renewing Credits',
      },
    },
    features: [
      { text: '500 High-Res Canvas & API Generations / Mo', included: true, highlight: true },
      { text: 'Full Pear API Key Gateway Access', included: true, highlight: true },
      { text: 'Origin Whitelist Network Defense (Up to 5 Domains)', included: true },
      { text: 'Standard 300 & 600 DPI PNG Canvas Output', included: true },
      { text: 'Full Barcode Suite (All 8 Industrial Formats)', included: true },
      { text: '60-second Sliding Window Rate Limiting (60 RPM)', included: true },
      { text: 'Zero Watermark & Full Commercial License', included: true },
      { text: 'Developer Discord & Email Support', included: true },
    ],
  },
  {
    id: 'pro',
    name: 'Nedject Pro Studio',
    badge: 'MOST POPULAR',
    description: 'High-performance optical engine for creators, print designers & businesses.',
    generationLimit: 99999,
    creditType: 'unlimited',
    monthlyCredits: 99999,
    apiAccess: true,
    rateLimitRpm: 300,
    allowedOriginsLimit: 10,
    active: true,
    pricing: {
      USD: { monthly: 9.99, yearly: 99.0, lifetime: 199.0 },
      INR: { monthly: 849, yearly: 7999, lifetime: 15999 },
      EUR: { monthly: 9.49, yearly: 94.0, lifetime: 189.0 },
      GBP: { monthly: 7.99, yearly: 79.0, lifetime: 159.0 },
      RUB: { monthly: 899, yearly: 8999, lifetime: 17999 },
    },
    cycles: {
      monthly: {
        durationDays: 30,
        label: '30 DAYS',
        subtitle: '$9.99/mo rate • Unlimited 300 DPI exports • Active for 30 days',
      },
      yearly: {
        durationDays: 365,
        label: '365 DAYS',
        subtitle: '$99.00/yr rate • Full annual Pro access • 1-year expiration',
      },
      lifetime: {
        durationDays: null,
        label: 'NO EXPIRY',
        subtitle: 'Pro Lifetime (No Expiry)',
      },
    },
    features: [
      { text: 'UNLIMITED 300 & 600 DPI Generations', included: true, highlight: true },
      { text: '600 DPI Vector PDF (Print Press Ready)', included: true, highlight: true },
      { text: 'Full Barcode Suite (All 8 Industrial Formats)', included: true },
      { text: 'Batch ZIP Matrix & Automated Pass Export', included: true },
      { text: 'Photo QR Visual Blend & Logo Overlay Matrix', included: true },
      { text: 'Persistent Cloud Storage & Cross-Device Sync', included: true },
      { text: 'Zero Watermark & Full Commercial License', included: true },
      { text: 'VIP Discord Support & Priority Processing', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Nedject Enterprise Matrix',
    badge: 'ENTERPRISE',
    description: 'Maximum throughput and prepress vector engine for high-volume workflows.',
    generationLimit: 999999,
    creditType: 'unlimited',
    monthlyCredits: 999999,
    apiAccess: true,
    rateLimitRpm: 1200,
    allowedOriginsLimit: 50,
    active: true,
    pricing: {
      USD: { monthly: 29.0, yearly: 249.0, lifetime: 499.0 },
      INR: { monthly: 2499, yearly: 19999, lifetime: 39999 },
      EUR: { monthly: 27.0, yearly: 229.0, lifetime: 459.0 },
      GBP: { monthly: 24.0, yearly: 199.0, lifetime: 399.0 },
      RUB: { monthly: 2699, yearly: 22999, lifetime: 45999 },
    },
    cycles: {
      monthly: {
        durationDays: 30,
        label: '30 DAYS',
        subtitle: '$29.00/mo rate • Full prepress vector engine • 30 days',
      },
      yearly: {
        durationDays: 365,
        label: '365 DAYS',
        subtitle: '$249.00/yr rate • Unlimited prepress license • 1-year expiration',
      },
      lifetime: {
        durationDays: null,
        label: 'NO EXPIRY',
        subtitle: 'Enterprise Lifetime (No Expiry)',
      },
    },
    features: [
      { text: 'Everything in Pro Studio Included', included: true, highlight: true },
      { text: 'Unlimited Batch Matrix & Event Pass Generation', included: true, highlight: true },
      { text: 'Dedicated Vector PDF Press Profile & Preflight Check', included: true },
      { text: 'Custom CMYK/RGB Optical Color Calibration Curves', included: true },
      { text: 'Team Quota Sharing & Multi-Seat Sub-Accounts', included: true },
      { text: 'Priority Server Queue & Ultra-Low Latency Rendering', included: true },
      { text: '99.9% Uptime SLA & Dedicated Technical Account Manager', included: true },
      { text: 'Custom Contract & GST / VAT Invoice Provisioning', included: true },
    ],
  },
  {
    id: 'custom',
    name: 'Nedject Bespoke Custom Tier',
    badge: 'TAILORED ARCHITECTURE',
    description: 'Fully customized volume, dedicated on-premise hardware profiles, custom SLA, and direct engineering consultation.',
    generationLimit: 9999999,
    creditType: 'unlimited',
    monthlyCredits: 9999999,
    apiAccess: true,
    rateLimitRpm: 3000,
    allowedOriginsLimit: 100,
    active: true,
    pricing: {
      USD: { monthly: 99.0, yearly: 899.0, lifetime: 1499.0 },
      INR: { monthly: 7999, yearly: 69999, lifetime: 119999 },
      EUR: { monthly: 95.0, yearly: 849.0, lifetime: 1399.0 },
      GBP: { monthly: 79.0, yearly: 729.0, lifetime: 1199.0 },
      RUB: { monthly: 9499, yearly: 84999, lifetime: 139999 },
    },
    cycles: {
      monthly: {
        durationDays: 30,
        label: '30 DAYS',
        subtitle: '$99.00/mo rate • Bespoke volume & custom SLA • Tailored monthly billing',
      },
      yearly: {
        durationDays: 365,
        label: '365 DAYS',
        subtitle: '$899.00/yr rate • Annual bespoke agreement • Dedicated engineering channel & custom symbology',
      },
      lifetime: {
        durationDays: null,
        label: 'NO EXPIRY',
        subtitle: 'Custom Perpetual License (No Expiry)',
      },
    },
    features: [
      { text: 'Custom Optical Matrix & Proprietary Symbologies', included: true, highlight: true },
      { text: 'Dedicated High-Throughput Cluster & 3,000+ RPM API Limit', included: true, highlight: true },
      { text: 'Unlimited Multi-Seat Team Access & Granular RBAC Permissions', included: true },
      { text: 'Zero Rate-Limiting Overhead & Custom Whitelist Domains (100+)', included: true },
      { text: 'Custom Hardware Calibration Profile (Laser, Inkjet, Offset Press, Flexo)', included: true },
      { text: 'Direct 24/7 Slack / WhatsApp Engineering Bridge & 99.99% SLA Guarantee', included: true },
      { text: 'Bespoke Invoicing, Purchase Orders, GST / VAT & Net-30 Payment Terms', included: true },
      { text: 'On-Premise Container Deployment / Private VPC Architecture Options', included: true },
    ],
  },
];

export function getPlanCyclePrice(
  plan: ManagedPlan,
  cycle: 'monthly' | 'yearly' | 'lifetime' | 'annual',
  currency: SupportedCurrency = 'USD'
): number {
  const normCycle = cycle === 'annual' ? 'yearly' : cycle;
  const rates = plan.pricing?.[currency] || plan.pricing?.USD || { monthly: 0, yearly: 0, lifetime: 0 };
  if (normCycle === 'yearly') return rates.yearly ?? 0;
  if (normCycle === 'lifetime') return rates.lifetime ?? (rates.yearly ? rates.yearly * 2 : 0);
  return rates.monthly ?? 0;
}

export function getPlanCycleSubtitle(
  plan: ManagedPlan,
  cycle: 'monthly' | 'yearly' | 'lifetime' | 'annual'
): string {
  const normCycle = cycle === 'annual' ? 'yearly' : cycle;
  if (plan.cycles?.[normCycle]?.subtitle) {
    return plan.cycles[normCycle]!.subtitle;
  }
  if (plan.id === 'starter') {
    if (normCycle === 'monthly') return '$4.99/mo rate • 500 Generation Credits • Active for 30 days';
    if (normCycle === 'yearly') return '$49.00/yr rate • 6,000 Annual Credits • 1-year expiration';
    return 'Creator Lifetime • 500 Monthly Renewing Credits';
  }
  if (plan.id === 'pro') {
    if (normCycle === 'monthly') return '$9.99/mo rate • Unlimited 300 DPI exports • Active for 30 days';
    if (normCycle === 'yearly') return '$99.00/yr rate • Full annual Pro access • 1-year expiration';
    return 'Pro Lifetime (No Expiry)';
  }
  if (plan.id === 'enterprise') {
    if (normCycle === 'monthly') return '$29.00/mo rate • Full prepress vector engine • 30 days';
    if (normCycle === 'yearly') return '$249.00/yr rate • Unlimited prepress license • 1-year expiration';
    return 'Enterprise Lifetime (No Expiry)';
  }
  if (plan.id === 'custom') {
    if (normCycle === 'monthly') return '$99.00/mo rate • Bespoke volume & custom SLA • Tailored monthly billing';
    if (normCycle === 'yearly') return '$899.00/yr rate • Annual bespoke agreement • Dedicated engineering channel';
    return 'Custom Perpetual License (No Expiry)';
  }
  return plan.description;
}

