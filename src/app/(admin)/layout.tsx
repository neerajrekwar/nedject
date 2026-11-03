import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restricted Admin Console — Nedject Studio',
  description: 'Industrial administration console and internal management terminal.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
