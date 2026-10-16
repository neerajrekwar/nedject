import type { Metadata } from 'next';
import {
  createPageMetadata,
  buildBlogCollectionJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';
import { PRESET_POSTS } from '@/lib/sanity';

export const metadata: Metadata = createPageMetadata({
  title: 'Engineering & Print Calibration Blog',
  description:
    'Technical guides, industrial specifications, and forensic research on 300 DPI Photo QR codes, vector barcodes (UPC/EAN/Code 128), and cybersecurity auditing.',
  path: '/blog',
  keywords: [
    'print engineering blog',
    '300 DPI QR tutorial',
    'UPC barcode guide',
    'Code 128 tutorial',
    'Amazon FNSKU specifications',
    'quishing security audit',
    'Sanity CMS blog',
  ],
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const blogJsonLd = buildBlogCollectionJsonLd({
    title: 'Nedject Engineering & Print Calibration Blog',
    description:
      'Technical guides, industrial specifications, and forensic research on 300 DPI Photo QR codes, vector barcodes, and optical security.',
    posts: PRESET_POSTS.map((p) => ({
      title: p.title,
      path: `/blog/${p.slug}`,
      datePublished: p.publishedAt,
    })),
  });

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Engineering Blog', path: '/blog' },
  ]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black">
      {children}

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
    </div>
  );
}
