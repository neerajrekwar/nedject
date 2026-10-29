import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanConfig {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  badge?: string;
  description: string;
  monthlyInr: number;
  yearlyInr: number;
  monthlyUsd: number;
  yearlyUsd: number;
  generationLimit: number; // 2 or 10 or 99999
  features: PlanFeature[];
}

export const NEDJECT_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Nedject Free Tier',
    description: 'Essential optical tools for casual and hobbyist printing.',
    monthlyInr: 0,
    yearlyInr: 0,
    monthlyUsd: 0,
    yearlyUsd: 0,
    generationLimit: 10,
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
  pro: {
    id: 'pro',
    name: 'Nedject Pro Studio',
    badge: 'MOST POPULAR',
    description: 'High-performance optical engine for creators, print designers & businesses.',
    monthlyInr: 499,
    yearlyInr: 3999, // ~33% off
    monthlyUsd: 9,
    yearlyUsd: 79,
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
    description: 'Maximum throughput and custom integrations for high-volume workflows.',
    monthlyInr: 1999,
    yearlyInr: 14999, // ~37% off
    monthlyUsd: 29,
    yearlyUsd: 249,
    generationLimit: 99999,
    features: [
      { text: 'Everything in Pro Studio', included: true },
      { text: '1200 DPI Ultra-Fine Vector & SVG Direct Stream', included: true, highlight: true },
      { text: 'Bulk 1,000+ Barcode / QR Batch Exporter', included: true },
      { text: 'REST API Key Access for Automated Pipelines', included: true },
      { text: 'Dedicated Server Worker Allocation', included: true },
      { text: 'Custom Pass Templates & Corporate Styling', included: true },
      { text: 'SLA Guaranteed 99.9% Optical Generation Uptime', included: true },
      { text: '1-on-1 Engineering Support by neerajrekwar', included: true },
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
