import { SupportedCurrency, CURRENCY_SYMBOLS, DEFAULT_PLANS, ManagedPlan } from './plans-types';

export type PlanTier = 'guest' | 'free' | 'pro' | 'enterprise' | 'custom' | string;

export type PremiumFeatureKey =
  | 'insta_clip_4k_poster'
  | 'insta_clip_long_duration'
  | 'insta_clip_audio_synth'
  | 'photo_dpi_600'
  | 'photo_dpi_1200'
  | 'photo_dpi_vector_pdf'
  | 'photo_dpi_vector_svg'
  | 'photo_dpi_high_lpi'
  | 'barcode_industrial_formats'
  | 'barcode_vector_pdf'
  | 'batch_zip_matrix'
  | 'mockup_ultra_4k'
  | 'fitness_unlimited_a4';

export interface FeatureGateDefinition {
  key: PremiumFeatureKey;
  title: string;
  description: string;
  requiredPlan: 'pro' | 'enterprise';
  proPriceUSD: number;
  enterprisePriceUSD: number;
}

export const FEATURE_GATES: Record<PremiumFeatureKey, FeatureGateDefinition> = {
  insta_clip_4k_poster: {
    key: 'insta_clip_4k_poster',
    title: '4K Ultra-HD Poster Export',
    description: 'Render pristine 3840×2160 uncompressed cinematic still frames with zero watermark.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  insta_clip_long_duration: {
    key: 'insta_clip_long_duration',
    title: 'Extended Cinematic Reel Duration (Up to 30s-60s)',
    description: 'Export extended Instagram Reels and cinematic loops beyond the 3s-5s free preview limit.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  insta_clip_audio_synth: {
    key: 'insta_clip_audio_synth',
    title: 'Analog Soundscape Synthesizer',
    description: 'Synthesize custom Lo-Fi 33 RPM needle crackle, 55Hz sub-bass drones, and atmospheric pink noise.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  photo_dpi_600: {
    key: 'photo_dpi_600',
    title: '600 DPI Commercial Print Press Resolution',
    description: 'Ultra-dense 600 DPI physical dot matrix injection for gallery framing and fine-art publishing.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  photo_dpi_1200: {
    key: 'photo_dpi_1200',
    title: '1200 DPI Micro-Engraving Output',
    description: 'Banknote-grade micro-screening with extreme resolution for industrial security printing.',
    requiredPlan: 'enterprise',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  photo_dpi_vector_pdf: {
    key: 'photo_dpi_vector_pdf',
    title: 'ISO Vector Print Card PDF with Bleed & Trim Marks',
    description: 'Commercial PDF/X-1a print-ready press proofs with trim guides and color calibration bars.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  photo_dpi_vector_svg: {
    key: 'photo_dpi_vector_svg',
    title: 'Full Vector SVG Halftone Paths',
    description: 'Infinite-scaling mathematical Bezier paths for laser cutting, vinyl plotting, and CNC engraving.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  photo_dpi_high_lpi: {
    key: 'photo_dpi_high_lpi',
    title: 'High-Frequency Screening (65-85 LPI)',
    description: 'Ultra-fine screen ruling for glossy magazines and luxury brand packaging.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  barcode_industrial_formats: {
    key: 'barcode_industrial_formats',
    title: 'Industrial Barcode Matrix (ITF-14, Code39, Pharmacode)',
    description: 'Master carton logistics, aerospace defense tags, and clinical pharmaceutical barcode symbologies.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  barcode_vector_pdf: {
    key: 'barcode_vector_pdf',
    title: 'Vector PDF & SVG Barcode Press Masters',
    description: 'Pre-calibrated vector barcode proofs for GS1 compliance and corrugated box packaging.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  batch_zip_matrix: {
    key: 'batch_zip_matrix',
    title: 'Batch ZIP Matrix & Event Pass Generator',
    description: 'Automated bulk CSV parsing, parallel rendering, and ZIP packaging of up to 1,000+ codes.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  mockup_ultra_4k: {
    key: 'mockup_ultra_4k',
    title: '4K Ultra-Res Device Mockup Studio',
    description: 'Photorealistic studio hardware scenes, multi-device layouts, and 3840×2160 crisp canvas exports.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
  fitness_unlimited_a4: {
    key: 'fitness_unlimited_a4',
    title: 'Unlimited A4 Habit & Glass HUD Print Sheets',
    description: 'Uncapped physical ball-pen protocol sheet exports with custom biometrics tracking.',
    requiredPlan: 'pro',
    proPriceUSD: 9,
    enterprisePriceUSD: 29,
  },
};

/**
 * Check if a plan allows access to a specific premium feature
 */
export function hasFeatureAccess(
  featureKey: PremiumFeatureKey,
  plan: PlanTier
): { allowed: boolean; gate: FeatureGateDefinition } {
  const gate = FEATURE_GATES[featureKey];
  if (!gate) {
    return {
      allowed: true,
      gate: {
        key: featureKey,
        title: 'Feature',
        description: '',
        requiredPlan: 'pro',
        proPriceUSD: 9,
        enterprisePriceUSD: 29,
      },
    };
  }

  if (plan === 'enterprise' || plan === 'custom') return { allowed: true, gate };
  if (plan === 'pro') {
    return { allowed: gate.requiredPlan !== 'enterprise', gate };
  }

  return { allowed: false, gate };
}

/**
 * Dispatches an event to open the upgrade modal if a feature is locked,
 * returning false if blocked, true if allowed.
 */
export function enforceFeatureAccess(
  featureKey: PremiumFeatureKey,
  userPlan: PlanTier = 'free',
  isLoggedIn: boolean = false
): boolean {
  const { allowed, gate } = hasFeatureAccess(featureKey, userPlan);

  if (!allowed) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('Nedject_feature_locked', {
          detail: {
            featureKey,
            title: gate.title,
            description: gate.description,
            requiredPlan: gate.requiredPlan,
            proPrice: '$9/mo (₹499)',
            enterprisePrice: '$29/mo (₹1,999)',
            isLoggedIn,
            userPlan,
          },
        })
      );
    }
    return false;
  }

  return true;
}

/**
 * Get plan duration limit for Insta-Clip in seconds
 */
export function getMaxClipDuration(plan: PlanTier): number {
  switch (plan) {
    case 'guest':
      return 3;
    case 'free':
      return 5;
    case 'pro':
      return 30;
    case 'enterprise':
      return 60;
    default:
      return 5;
  }
}

/**
 * Get max allowed DPI for normal photo processor
 */
export function getMaxDpi(plan: PlanTier): number {
  switch (plan) {
    case 'enterprise':
      return 1200;
    case 'pro':
      return 600;
    case 'free':
    case 'guest':
    default:
      return 300;
  }
}
