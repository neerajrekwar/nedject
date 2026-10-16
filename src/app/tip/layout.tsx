import type { Metadata } from 'next';
import { createPageMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Support Nedject Studio | Creator Tip & Pro Support',
  description:
    'Support the continuous engineering of high-precision 300 DPI Photo QR codes, forensic analyzers, and open industrial barcode tools.',
  path: '/tip',
  keywords: [
    'support Nedject studio',
    'developer tip',
    'QR code studio contribution',
    'indie maker support',
  ],
});

export default function TipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Support & Tip', path: '/tip' },
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
