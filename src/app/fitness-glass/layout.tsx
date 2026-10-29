import type { Metadata } from 'next';
import { createPageMetadata, buildSoftwareApplicationJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Fitness Smart Glass Timetable & Training Cadence Engine',
  description:
    'HUD timetable matrix and weekly training cadence planner engineered for smart glass displays, sports optics, and wearable Heads-Up Displays.',
  path: '/fitness-glass',
  keywords: [
    'smart glass fitness timetable',
    'wearable HUD training cadence',
    'sports optics heads up display',
    'fitness timetable planner',
    'athletic training schedule engine',
    'wearable glass display',
  ],
});

export default function FitnessGlassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'Fitness Smart Glass Timetable Engine',
      description:
        'Optic-calibrated training cadence and HUD timetable planner for wearable smart glasses and athletic displays.',
      path: '/fitness-glass',
      category: 'SportsApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Fitness Smart Glass', path: '/fitness-glass' },
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
