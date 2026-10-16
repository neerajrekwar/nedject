import type { Metadata } from 'next';
import {
  createPageMetadata,
  buildSoftwareApplicationJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Multi-Device Mockup Studio & Responsive Website Templates',
  description:
    'Interactive multi-device mockup frame studio for mobile, tablet, and desktop viewports. Test responsive website templates, industrial SaaS layouts, and custom web URLs with realistic hardware bezels.',
  path: '/mochup',
  keywords: [
    'mockup studio',
    'website mockup generator',
    'mobile tablet desktop templates',
    'responsive viewport tester',
    'iPhone 16 Pro mockup',
    'MacBook Pro mockup',
    'iPad mockup frame',
    'responsive design testing',
    'device frame preview',
  ],
});

export default function MochupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appJsonLd = buildSoftwareApplicationJsonLd({
    name: 'Nedject Multi-Device Mockup & Template Studio',
    description:
      'Interactive multi-device mockup frame studio for mobile, tablet, and desktop viewports with realistic hardware bezels and live website templates.',
    path: '/mochup',
    category: 'DesignApplication',
  });

  const breadcrumbsJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Mockup & Template Studio', path: '/mochup' },
  ]);

  return (
    <>
      {children}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
    </>
  );
}
