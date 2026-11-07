import type { Metadata } from 'next';
import {
  createPageMetadata,
  buildSoftwareApplicationJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'NFC Bat — Precision Optical Specimen & NDEF Encoding Lab // Nedject',
  description:
    'Deterministic NFC NTAG213/215/216 bitstream encoding with curated Batman precision bat patterns and optical camera scannability verification.',
  path: '/nfc-bat',
  keywords: [
    'NFC bat pattern',
    'NTAG215 encoder',
    'NDEF payload formatter',
    'Batman optical specimen',
    'ISO 14443-A compliance',
    'high-frequency RFID',
    'optical specimen preset',
  ],
});

export default function NfcBatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'NFC Bat Precision Optical Specimen Lab',
      description:
        'Deterministic NFC NTAG bitstream encoding and curated Batman precision bat pattern optical scanner verification.',
      path: '/nfc-bat',
      category: 'DeveloperApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'NFC Bat Lab', path: '/nfc-bat' },
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
