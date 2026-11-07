import type { Metadata } from 'next';
import { createPageMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Reset Password & Account Security // Nedject',
  description:
    'Secure password recovery and cryptographic credential updating for Nedject developer accounts.',
  path: '/reset-password',
  noIndex: true,
});

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Reset Password', path: '/reset-password' },
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
