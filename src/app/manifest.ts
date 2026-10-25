import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Nedject - 300 DPI Photo QR & Vector Barcode Studio',
    short_name: 'Nedject',
    description: 'Ultra-crisp 300 DPI Photo QR codes, vector barcodes, and biometrics glass telemetry.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09090b',
    theme_color: '#09090b',
    categories: ['utilities', 'productivity', 'design', 'business'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Photo QR Studio',
        short_name: 'QR Studio',
        description: 'Generate scannable 300 DPI photo QR codes',
        url: '/nomral-dpi-photo',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Barcode Engine',
        short_name: 'Barcodes',
        description: 'Create FNSKU, UPC, and Code 128 barcodes',
        url: '/#barcode-generator',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Fitness Glass Arc',
        short_name: 'Fitness',
        description: 'Smart glass telemetry and biometrics',
        url: '/fitness-glass',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
