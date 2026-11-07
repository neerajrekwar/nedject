import type { Metadata } from 'next';
import {
  createPageMetadata,
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Insta-Clip — 9:16 Kinetic Video Canvas & 4K Frame Studio // Nedject',
  description:
    'Extract crystal-clear 4K video frames, compose 9:16 social posters, and render lossless canvas graphics entirely client-side with zero cloud uploads.',
  path: '/insta-clip',
  keywords: [
    'Insta-Clip',
    'video frame extractor',
    '9:16 poster canvas',
    'social story exporter',
    'client-side video tool',
    '4K frame grabber',
  ],
});

export default function InstaClipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = [
    buildSoftwareApplicationJsonLd({
      name: 'Insta-Clip Poster & Frame Studio',
      description:
        'Client-side video frame extraction and 9:16 kinetic story poster composition engine.',
      path: '/insta-clip',
      category: 'MultimediaApplication',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Insta-Clip Studio', path: '/insta-clip' },
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
