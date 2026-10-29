import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { GlobalNavbar } from "@/components/auth/GlobalNavbar";
import { StoryShareButton } from "@/components/story/StoryShareButton";
import { GA_TRACKING_ID } from "@/lib/gtag";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getSiteUrl, SITE_NAME, DEFAULT_BRAND_TITLE, DEFAULT_DESCRIPTION } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_BRAND_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "300 DPI QR code",
    "photo QR code generator",
    "high resolution QR code",
    "vector barcode generator",
    "FNSKU barcode",
    "UPC barcode generator",
    "Code 128 generator",
    "Google Fit API dashboard",
    "fitness smart glass",
    "biometrics telemetry",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: DEFAULT_BRAND_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: `${siteUrl}/api/og?page=home`,
        width: 1200,
        height: 630,
        alt: DEFAULT_BRAND_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_BRAND_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: "@Nedject",
    images: [`${siteUrl}/api/og?page=home`],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nedject",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa_maskable_icon_x192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa_maskable_icon_x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple_touch_icon_x192.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION &&
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION !== "fdsa" &&
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim().length > 4
        ? [process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION, "google4859c180d3ad54a0"]
        : "google4859c180d3ad54a0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* PWA Mobile Optimization & Safari Meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nedject" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />

        {/* Google Analytics 4 (gtag.js) in <head> for Google Search Console ownership verification */}
        {GA_TRACKING_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#f5f5f0] text-black">
        <AuthProvider>
          <GlobalNavbar />
          <div className="flex-1 flex flex-col">{children}</div>
          {/* Global Floating Story Share Button for Each Page */}
          <StoryShareButton
            variant="floating"
            label="SHARE STORY"
          />
        </AuthProvider>

        {/* Global Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": SITE_NAME,
                "url": siteUrl,
                "description": DEFAULT_DESCRIPTION,
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": SITE_NAME,
                "url": siteUrl,
                "logo": `${siteUrl}/opengraph-image`,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": DEFAULT_BRAND_TITLE,
                "url": siteUrl,
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "All",
                "description": DEFAULT_DESCRIPTION,
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                },
              },
            ]),
          }}
        />
      </body>
    </html>
  );
}

