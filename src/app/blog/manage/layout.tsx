import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Sanity CMS Blog Management Studio',
  description:
    'Sanity Studio content management desk for Nedject print engineering, barcode architecture, and optical security publications.',
  path: '/blog/manage',
  noIndex: true, // Content management desk should not be indexed by search crawlers
});

export default function BlogManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#111113] text-zinc-100">{children}</div>;
}
