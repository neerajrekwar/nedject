import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Admin Blog Management | Nedject Editorial',
  description:
    'Dedicated content management desk for Nedject print engineering, barcode architecture, and optical security publications.',
  path: '/blog/manage',
  noIndex: true,
});

export default function BlogManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#f5f5f0] text-black">{children}</div>;
}
