import type { Metadata } from 'next';

export const SITE_NAME = 'Nedject';
export const DEFAULT_BRAND_TITLE = 'Nedject — Industrial 300 DPI Photo QR Code & Barcode Studio';
export const DEFAULT_DESCRIPTION =
  'Industrial-grade 300 DPI Photo QR Code generator, vector barcode studio (UPC, EAN, FNSKU, Code 128), Google Fit cloud telemetry dashboard, and smart timetable cadence engine.';

/**
 * Returns the fully-qualified base URL without a trailing slash.
 */
export function getSiteUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    'https://ais-pre-wu4yus7fs652j6wksn2vmo-615430009365.asia-southeast1.run.app';

  let cleaned = rawUrl.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export interface PageMetadataParams {
  title: string;
  description: string;
  path: string;
  canonicalUrl?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Builds standard, search-engine-ready Next.js Metadata with canonical tags,
 * OpenGraph, Twitter cards, and crawler directives.
 */
export function createPageMetadata({
  title,
  description,
  path,
  canonicalUrl,
  keywords = [],
  noIndex = false,
}: PageMetadataParams): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const resolvedCanonical = canonicalUrl || `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`;
  const fullPageUrl = `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`;

  const defaultKeywords = [
    '300 DPI QR code',
    'photo QR code generator',
    'high resolution QR code',
    'barcode generator',
    'vector barcode SVG',
    'FNSKU barcode',
    'UPC barcode generator',
    'Code 128 generator',
    'Google Fit API dashboard',
    'biometric telemetry',
    'health tracking app',
    'Nedject studio',
  ];

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: Array.from(new Set([...keywords, ...defaultKeywords])),
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: resolvedCanonical,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: false,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: fullPageUrl,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@Nedject',
      creator: '@Nedject',
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

/**
 * Structured Data (Schema.org) JSON-LD generator for WebApplication
 */
export function buildSoftwareApplicationJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  category?: string;
  price?: string;
}) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${opts.path.startsWith('/') ? opts.path : `/${opts.path}`}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    url,
    applicationCategory: opts.category || 'UtilityApplication',
    operatingSystem: 'All Modern Web Browsers, iOS, Android, macOS, Windows, Linux',
    description: opts.description,
    browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
    offers: {
      '@type': 'Offer',
      price: opts.price || '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

/**
 * BreadcrumbList Schema.org structured data generator
 */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
