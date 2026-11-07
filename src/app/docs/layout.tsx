import type { Metadata } from 'next';
import {
  createPageMetadata,
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Developer Documentation & Architectural Guides // Nedject',
  description:
    'Complete developer documentation, prepress standards, cryptographic verification procedures, and hardware specifications for Nedject.',
  path: '/docs',
  keywords: [
    'Nedject documentation',
    'prepress manual',
    'halftone specifications',
    'API guides',
    'optical scanning',
    'GS1 barcode compliance',
  ],
});

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'Nedject Developer Documentation',
      description:
        'Comprehensive technical manual for prepress optical screening, QR forensics, and barcode symbology.',
      path: '/docs',
      category: 'Documentation',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Documentation', path: '/docs' },
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
