import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';
import { PRESET_POSTS } from '@/lib/sanity';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastMod = new Date();

  const blogPostEntries: MetadataRoute.Sitemap = PRESET_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: `${siteUrl}`,
      lastModified: lastMod,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: lastMod,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogPostEntries,
    {
      url: `${siteUrl}/normal-dpi-photo`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/barcode-pick`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/qr-crush`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/google-fit`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified: lastMod,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/fitness-glass`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/payment`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tip`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
