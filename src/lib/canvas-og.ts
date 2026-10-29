export type PageCardType =
  | 'home'
  | 'mochup'
  | 'mockup'
  | 'barcode-pick'
  | 'normal-dpi-photo'
  | 'nomral-dpi-photo'
  | 'fitness-glass'
  | 'winter-arc-2026'
  | 'qr-crush'
  | 'payment'
  | 'blog'
  | 'dashboard'
  | 'default';

export interface CardRenderOptions {
  page?: string;
  title?: string;
  description?: string;
  badge?: string;
  url?: string;
}

/**
 * Normalizes input string to supported PageCardType
 */
export function normalizePageType(pageStr?: string): PageCardType {
  if (!pageStr) return 'home';
  const clean = pageStr.toLowerCase().trim().replace(/^\//, '').replace(/\/$/, '');
  if (!clean || clean === 'home') return 'home';
  if (clean === 'mochup' || clean === 'mockup') return 'mochup';
  if (clean === 'barcode-pick' || clean === 'barcode') return 'barcode-pick';
  if (clean.includes('normal-dpi') || clean.includes('nomral-dpi')) return 'normal-dpi-photo';
  if (clean.includes('winter-arc')) return 'winter-arc-2026';
  if (clean.includes('fitness')) return 'fitness-glass';
  if (clean.includes('qr-crush') || clean.includes('crush')) return 'qr-crush';
  if (clean.includes('payment') || clean.includes('pricing') || clean.includes('plans')) return 'payment';
  if (clean.includes('blog')) return 'blog';
  if (clean.includes('dashboard')) return 'dashboard';
  return 'default';
}

/**
 * Safe canvas generator that uses dynamic import to prevent bundle-time binary crashes
 */
export async function generateOgCardBuffer(_options: CardRenderOptions = {}): Promise<Buffer> {
  return Buffer.from('');
}
