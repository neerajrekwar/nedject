import type { Metadata } from 'next';
import { createPageMetadata, buildBreadcrumbJsonLd, getSiteUrl, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Pay to Use & Plans Pricing | Nedject Studio',
  description:
    'Flexible plans for industrial QR generation, 300 DPI high-resolution exports, unlimited batch processing, and vector barcode downloads.',
  path: '/pay-to-use',
  keywords: [
    'Nedject pay to use',
    'QR studio plans',
    '300 DPI export license',
    'barcode vector commercial license',
    'unlimited QR generator subscription',
  ],
});

export default function PayToUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = getSiteUrl();
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Nedject Studio Pro Subscription',
      description:
        'Industrial 300 DPI Photo QR Code generation, vector barcode exports, and cloud telemetry features.',
      brand: {
        '@type': 'Brand',
        name: SITE_NAME,
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Pro Pass Monthly',
          price: '9.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/pay-to-use`,
        },
        {
          '@type': 'Offer',
          name: 'Lifetime Enterprise',
          price: '49.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/pay-to-use`,
        },
      ],
    },
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Pricing & Plans', path: '/pay-to-use' },
    ]),
  ];

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
