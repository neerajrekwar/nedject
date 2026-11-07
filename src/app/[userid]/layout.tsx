import type { Metadata } from 'next';
import { createPageMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Developer Workspace & Account Profile // Nedject',
  description:
    'Manage active subscriptions, API credentials, generation quotas, invoice history, and organization security settings.',
  path: '/dashboard',
  noIndex: true,
});

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Workspace', path: '/dashboard' },
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
