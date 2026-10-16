import type { Metadata } from 'next';
import { createPageMetadata, buildSoftwareApplicationJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Google Fit Biometrics & Activity Telemetry Live Dashboard',
  description:
    'Two-way biometrics and health telemetry dashboard synchronizing Steps, Body Weight, Blood Pressure, and Workout sessions with Google Fit cloud APIs.',
  path: '/dashboard',
  keywords: [
    'Google Fit dashboard',
    'biometric telemetry',
    'step count sync',
    'blood pressure tracking',
    'workout sessions log',
    'Google Fitness REST API',
    'health metrics tracker',
  ],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'Google Fit Biometrics Telemetry Dashboard',
      description:
        'Cloud telemetry dashboard syncing daily activity, biometrics, weight, and blood pressure with Google Fit.',
      path: '/dashboard',
      category: 'HealthApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Fitness Dashboard', path: '/dashboard' },
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
