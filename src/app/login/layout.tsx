import type { Metadata } from 'next';
import { createPageMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Sign In & Developer Access Portal // Nedject',
  description:
    'Access your Nedject developer workspace, commercial license keys, generation usage monitoring, and bespoke custom tier configurations.',
  path: '/login',
  keywords: [
    'Nedject login',
    'developer portal',
    'API key manager',
    'account access',
    'single sign-on',
  ],
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Sign In', path: '/login' },
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
