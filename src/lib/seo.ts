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
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL ||
    'https://nedject.vercel.app/';

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
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  imageUrl?: string;
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
  ogType = 'website',
  publishedTime,
  modifiedTime,
  authors,
  tags = [],
  imageUrl,
}: PageMetadataParams): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const resolvedCanonical = canonicalUrl || `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`;
  const fullPageUrl = `${siteUrl}${normalizedPath === '/' ? '' : normalizedPath}`;
  const resolvedImage = imageUrl || `${siteUrl}/opengraph-image`;

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

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: Array.from(new Set([...keywords, ...tags, ...defaultKeywords])),
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
      type: ogType,
      locale: 'en_US',
      url: fullPageUrl,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
      ...(ogType === 'article' && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: authors || [`${SITE_NAME} Editorial Team`],
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@Nedject',
      creator: '@Nedject',
      images: [resolvedImage],
    },
  };

  return metadata;
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

/**
 * BlogPosting Schema.org structured data generator
 */
export function buildBlogPostingJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  imageUrl?: string;
  keywords?: string[];
}) {
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}${opts.path.startsWith('/') ? opts.path : `/${opts.path}`}`;
  const image = opts.imageUrl || `${siteUrl}/opengraph-image`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: opts.title,
    description: opts.description,
    image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      '@type': 'Person',
      name: opts.authorName,
      ...(opts.authorUrl ? { url: opts.authorUrl } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/opengraph-image`,
      },
    },
    keywords: opts.keywords?.join(', '),
  };
}

/**
 * Blog Collection / CollectionPage Schema.org structured data generator
 */
export function buildBlogCollectionJsonLd(opts: {
  title: string;
  description: string;
  posts: Array<{
    title: string;
    path: string;
    datePublished: string;
  }>;
}) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: opts.title,
    description: opts.description,
    url: `${siteUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
    },
    blogPost: opts.posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${siteUrl}${post.path.startsWith('/') ? post.path : `/${post.path}`}`,
      datePublished: post.datePublished,
    })),
  };
}
