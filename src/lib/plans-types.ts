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

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
}

export interface ManagedPlan {
  id: 'free' | 'pro' | 'enterprise' | string;
  name: string;
  badge?: string;
  description: string;
  generationLimit: number;
  active: boolean;
  pricing: Record<SupportedCurrency, PlanPricing>;
  features: PlanFeature[];
  updatedAt?: string;
}

export const DEFAULT_PLANS: ManagedPlan[] = [
  {
    id: 'free',
    name: 'Nedject Free Tier',
    description: 'Essential optical tools for casual and hobbyist printing.',
    generationLimit: 10,
    active: true,
    pricing: {
      USD: { monthly: 0, yearly: 0 },
      INR: { monthly: 0, yearly: 0 },
      EUR: { monthly: 0, yearly: 0 },
      GBP: { monthly: 0, yearly: 0 },
      RUB: { monthly: 0, yearly: 0 },
    },
    features: [
      { text: '2 Guest / 10 Authenticated Generations', included: true },
      { text: 'Standard 300 DPI PNG Canvas Output', included: true },
      { text: 'High-contrast B/W Print Calibration', included: true },
      { text: 'Basic Barcode Pick (Code128, EAN-13, UPC)', included: true },
      { text: 'Normal Photo DPI Upscaler (150-300 DPI)', included: true },
      { text: '600 DPI Vector PDF & CMYK Color Separation', included: false },
      { text: 'Batch ZIP Matrix & Event Pass Generator', included: false },
      { text: 'Priority Server Queue & Unlimited Generations', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Nedject Pro Studio',
    badge: 'MOST POPULAR',
    description: 'High-performance optical engine for creators, print designers & businesses.',
    generationLimit: 99999,
    active: true,
    pricing: {
      USD: { monthly: 9, yearly: 79 },
      INR: { monthly: 499, yearly: 3999 },
      EUR: { monthly: 8, yearly: 75 },
      GBP: { monthly: 7, yearly: 69 },
      RUB: { monthly: 799, yearly: 6999 },
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
    description: 'Maximum throughput and custom integrations for high-volume workflows.',
    generationLimit: 99999,
    active: true,
    pricing: {
      USD: { monthly: 29, yearly: 249 },
      INR: { monthly: 1999, yearly: 14999 },
      EUR: { monthly: 27, yearly: 229 },
      GBP: { monthly: 24, yearly: 199 },
      RUB: { monthly: 2499, yearly: 19999 },
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
];
