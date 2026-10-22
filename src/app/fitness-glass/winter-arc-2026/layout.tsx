import type { Metadata } from 'next';
import { createPageMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Winter Arc 2026 — 90-Day Tactical Protocol & HUD Cadence',
  description:
    'Dedicated 90-day winter physical conditioning protocol with daily cadence check-ins, biometric milestones, Google Fit telemetry, and Heads-Up Display schedule exports.',
  path: '/fitness-glass/winter-arc-2026',
  keywords: [
    'winter arc 2026',
    '90 day fitness protocol',
    'tactical training cadence',
    'smart glass HUD schedule',
    'biometric telemetry',
    'athletic conditioning matrix',
  ],
});

export default function WinterArcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Fitness Glass', path: '/fitness-glass' },
    { name: 'Winter Arc 2026 Protocol', path: '/fitness-glass/winter-arc-2026' },
  ]);

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
