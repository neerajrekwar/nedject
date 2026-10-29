import type { Metadata } from 'next';
import { createPageMetadata, buildSoftwareApplicationJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Industrial Barcode Generator & Vector Studio (UPC, EAN, Code 128, FNSKU)',
  description:
    'Generate industrial-grade 1D barcodes with vector SVG, high-DPI PNG, and print-ready PDF export. Complete compliance for Amazon FNSKU, GS1 UPC-A, EAN-13, and Code 128.',
  path: '/barcode-pick',
  keywords: [
    'barcode generator',
    'Amazon FNSKU generator',
    'UPC barcode maker',
    'EAN-13 generator',
    'Code 128 vector barcode',
    'ITF-14 barcode',
    'print ready barcode PDF',
    'vector barcode SVG',
    'GS1 compliance',
  ],
});

export default function BarcodePickLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'Industrial Barcode Generator & Vector Studio',
      description:
        'Industrial barcode generation tool supporting Amazon FNSKU, UPC-A, EAN-13, Code 128, and ITF-14 with SVG and PDF export.',
      path: '/barcode-pick',
      category: 'BusinessApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Barcode Pick Studio', path: '/barcode-pick' },
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
