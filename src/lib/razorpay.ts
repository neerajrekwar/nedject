import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanConfig {
  id: 'free' | 'starter' | 'pro' | 'enterprise' | string;
  name: string;
  badge?: string;
  description: string;
  monthlyInr: number;
  yearlyInr: number;
  lifetimeInr?: number;
  monthlyUsd: number;
  yearlyUsd: number;
  lifetimeUsd?: number;
  generationLimit: number; // 2 or 10 or 500 or 99999
  features: PlanFeature[];
}

export const NEDJECT_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Nedject Free Tier',
    description: 'Essential optical tools for casual and hobbyist printing.',
    monthlyInr: 0,
    yearlyInr: 0,
    lifetimeInr: 0,
    monthlyUsd: 0,
    yearlyUsd: 0,
    lifetimeUsd: 0,
    generationLimit: 10,
    features: [
      { text: '2 Guest / 10 Authenticated Generations', included: true },
      { text: 'Standard 300 DPI PNG Canvas Output', included: true },
      { text: 'High-contrast B/W Print Calibration', included: true },
      { text: 'Basic Barcode Pick (Code128, EAN-13, UPC)', included: true },
      { text: 'Normal Photo DPI Upscaler (150-300 DPI)', included: true },
      { text: 'Pear API Gateway Trial (20 RPM, 1 Domain)', included: true },
      { text: '600 DPI Vector PDF & CMYK Color Separation', included: false },
      { text: 'Priority Server Queue & Unlimited Generations', included: false },
    ],
  },
  starter: {
    id: 'starter',
    name: 'Nedject Creator Credits',
    badge: 'CREDITS BASED',
    description: '500 high-resolution optical and API generation credits with origin whitelist network security.',
    monthlyInr: 399,
    yearlyInr: 3999,
    lifetimeInr: 7999,
    monthlyUsd: 4.99,
    yearlyUsd: 49.0,
    lifetimeUsd: 89.0,
    generationLimit: 500,
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
  pro: {
    id: 'pro',
    name: 'Nedject Pro Studio',
    badge: 'MOST POPULAR',
    description: 'High-performance optical engine for creators, print designers & businesses.',
    monthlyInr: 849,
    yearlyInr: 7999,
    lifetimeInr: 15999,
    monthlyUsd: 9.99,
    yearlyUsd: 99.0,
    lifetimeUsd: 199.0,
    generationLimit: 99999,
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
  enterprise: {
    id: 'enterprise',
    name: 'Nedject Enterprise Matrix',
    badge: 'ENTERPRISE',
    description: 'Maximum throughput and prepress vector engine for high-volume workflows.',
    monthlyInr: 2499,
    yearlyInr: 19999,
    lifetimeInr: 39999,
    monthlyUsd: 29.0,
    yearlyUsd: 249.0,
    lifetimeUsd: 499.0,
    generationLimit: 999999,
    features: [
      { text: 'Everything in Pro Studio Included', included: true, highlight: true },
      { text: 'Full prepress vector engine & Unlimited prepress license', included: true, highlight: true },
      { text: '1200 DPI Ultra-Fine Vector & SVG Direct Stream', included: true, highlight: true },
      { text: 'Bulk 1,000+ Barcode / QR Batch Exporter', included: true },
      { text: 'REST API Key Access for Automated Pipelines', included: true },
      { text: 'Dedicated Server Worker Allocation', included: true },
      { text: 'Custom Pass Templates & Corporate Styling', included: true },
      { text: 'SLA Guaranteed 99.9% Optical Generation Uptime', included: true },
    ],
  },
  custom: {
    id: 'custom',
    name: 'Nedject Bespoke Custom Tier',
    badge: 'TAILORED ARCHITECTURE',
    description: 'Fully customized volume, dedicated on-premise hardware profiles, custom SLA, and direct engineering consultation.',
    monthlyInr: 7999,
    yearlyInr: 69999,
    lifetimeInr: 119999,
    monthlyUsd: 99.0,
    yearlyUsd: 899.0,
    lifetimeUsd: 1499.0,
    generationLimit: 9999999,
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
};

// Aliased for backwards compatibility
export const RAZORPAY_PLANS = NEDJECT_PLANS;

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
    keySecret &&
    keyId.trim().length > 5 &&
    !keyId.includes('your_') &&
    !keyId.includes('placeholder')
  );
}

export function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.warn('[Razorpay] Client initialization note:', err);
    return null;
  }
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return false;
  }

  try {
    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generated === signature;
  } catch (e) {
    console.error('[Razorpay] Signature verification error:', e);
    return false;
  }
}
