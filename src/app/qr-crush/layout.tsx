import type { Metadata } from 'next';
import { createPageMetadata, buildSoftwareApplicationJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'QR Crush — Forensic QR Code Security Auditor & Vector Scanner',
  description:
    'Audit and deconstruct QR codes with deep forensic payload analysis, error correction matrix inspection, security threat detection, and lossless vector reconstruction.',
  path: '/qr-crush',
  keywords: [
    'QR code security analyzer',
    'forensic QR decoder',
    'QR code error correction level',
    'detect malicious QR code',
    'QR payload inspector',
    'SVG QR code reconstructor',
    'quishing protection',
  ],
});

export default function QrCrushLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'QR Crush Forensic Auditor',
      description:
        'Forensic QR code scanner and security auditor analyzing raw bitstreams, ECC parity blocks, and payload integrity.',
      path: '/qr-crush',
      category: 'SecurityApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'QR Crush Auditor', path: '/qr-crush' },
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
