import type { Metadata } from 'next';
import { createPageMetadata, getSiteUrl } from '@/lib/seo';

const siteUrl = getSiteUrl();

export const metadata: Metadata = createPageMetadata({
  title: '300 DPI Photo Prep & Print Calibration Studio',
  description:
    'Industrial photo preparation engine for 300 DPI high-resolution printing. Commercial B/W calibration, tone curve optimization, and vector-aligned PDF & PNG exports.',
  path: '/nomral-dpi-photo',
  canonicalUrl: `${siteUrl}/normal-dpi-photo`, // Canonical points to the authoritative URL
});

export default function NomralDpiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
