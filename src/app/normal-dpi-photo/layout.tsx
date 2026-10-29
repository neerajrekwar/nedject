import type { Metadata } from 'next';
import { createPageMetadata, buildSoftwareApplicationJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: '300 DPI Photo Prep & Print Calibration Studio',
  description:
    'Industrial photo preparation engine for 300 DPI high-resolution printing. Commercial B/W calibration, tone curve optimization, and vector-aligned PDF & PNG exports.',
  path: '/normal-dpi-photo',
  keywords: [
    '300 DPI photo converter',
    'photo print calibration',
    'silver gelatin B/W filter',
    'high contrast print mode',
    '300 DPI PDF export',
    'photo resolution calculator',
    'commercial press prep',
  ],
});

export default function NormalDpiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: '300 DPI Photo Prep & Print Calibration Studio',
      description:
        'Industrial photo preparation engine for 300 DPI high-resolution printing with commercial B/W calibration and PDF export.',
      path: '/normal-dpi-photo',
      category: 'DesignApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: '300 DPI Photo Studio', path: '/normal-dpi-photo' },
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
