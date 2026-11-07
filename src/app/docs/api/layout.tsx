import type { Metadata } from 'next';
import {
  createPageMetadata,
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Cloud REST API Reference & Developer SDKs // Nedject Docs',
  description:
    'Integrate 300 DPI optical QR rendering, GS1 vector barcodes, and prepress raster engines into your applications with our high-throughput REST API.',
  path: '/docs/api',
  keywords: [
    'Nedject API',
    'QR code API',
    'barcode API',
    'REST endpoints',
    'optical engine SDK',
    'sub-50ms render latency',
    'developer authentication',
  ],
});

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'Nedject Cloud REST API',
      description:
        'High-throughput REST API for commercial 300 DPI QR generation, GS1 vector barcode synthesis, and prepress rasterization.',
      path: '/docs/api',
      category: 'DeveloperApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Documentation', path: '/docs' },
      { name: 'Cloud REST API', path: '/docs/api' },
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
