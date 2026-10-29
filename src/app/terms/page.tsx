import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Shield,
  AlertTriangle,
  CreditCard,
  HeartPulse,
  Scale,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { getSiteUrl, SITE_NAME } from '@/lib/seo';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Terms of Service | Nedject — 300 DPI Photo QR & Fitness Telemetry Studio',
  description:
    'Terms of Service for Nedject, genQRstudio, and Fitness Glass. Review terms regarding platform access, acceptable use, Google OAuth authentication, billing, and liability.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service — Nedject',
    description:
      'Official Terms of Service governing access and usage of Nedject 300 DPI Photo QR Code Studio, Barcode Pick, and Fitness Glass telemetry.',
    url: `${siteUrl}/terms`,
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'February 24, 2026';

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Top Banner Navigation */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-30 font-mono">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:text-[#00aa00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Studio</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-zinc-500">Legal Documents //</span>
            <Link
              href="/privacy"
              className="text-zinc-600 hover:text-black transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-black bg-black text-[#ccff00] px-2.5 py-0.5 border border-black"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="border-b-2 border-black bg-black text-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 font-mono">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ccff00] text-black font-black text-xs uppercase mb-4 border border-black shadow-[2px_2px_0px_#ffffff]">
            <Scale className="w-4 h-4" />
            <span>Binding Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            Terms of Service
          </h1>
          <p className="mt-3 text-zinc-300 text-sm sm:text-base max-w-2xl font-sans">
            Please read these Terms of Service carefully before utilizing Nedject, our 300 DPI Photo QR Studio, barcode generators, or the Fitness Glass &amp; Google Fit telemetry engine.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div>
              <span className="text-white font-bold">App:</span> Nedject (genQRstudio)
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">Effective Date:</span> {lastUpdated}
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">Developer:</span> Neeraj Rekwar
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-4 py-12 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Left TOC (Desktop) */}
          <aside className="lg:col-span-4 font-mono text-xs order-2 lg:order-1">
            <div className="lg:sticky lg:top-20 border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-4">
              <div className="font-black text-xs uppercase border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Table of Contents</span>
                <span className="text-[10px] text-zinc-500">8 SECTIONS</span>
              </div>
              <nav className="space-y-1.5 text-zinc-700">
                <a href="#acceptance" className="block hover:text-black hover:font-bold py-0.5">
                  1. Acceptance of Terms
                </a>
                <a href="#services" className="block hover:text-black hover:font-bold py-0.5">
                  2. Description of Services
                </a>
                <a href="#accounts-oauth" className="block hover:text-black hover:font-bold py-0.5">
                  3. Accounts &amp; OAuth Access
                </a>
                <a href="#acceptable-use" className="block hover:text-black hover:font-bold py-0.5">
                  4. Acceptable Use Policy
                </a>
                <a href="#health-disclaimer" className="block hover:text-black hover:font-bold py-0.5 text-black font-bold">
                  5. Fitness &amp; Health Disclaimer
                </a>
                <a href="#billing" className="block hover:text-black hover:font-bold py-0.5">
                  6. Subscriptions &amp; Payments
                </a>
                <a href="#liability" className="block hover:text-black hover:font-bold py-0.5">
                  7. Warranties &amp; Liability
                </a>
                <a href="#contact" className="block hover:text-black hover:font-bold py-0.5">
                  8. Contact &amp; Governing Law
                </a>
              </nav>

              <div className="pt-4 border-t border-zinc-200">
                <div className="text-[11px] font-bold uppercase text-zinc-500 mb-1">
                  Developer Notice
                </div>
                <div className="p-2.5 bg-[#f5f5f0] border border-black text-[11px] text-zinc-700 leading-snug">
                  Nedject is maintained by Neeraj Rekwar. Use of Google OAuth is governed by Google API Terms of Service.
                </div>
              </div>
            </div>
          </aside>

          {/* Core Body Sections */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-10">
            
            {/* 1. Acceptance */}
            <section id="acceptance" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 01</span>
                <span>/</span>
                <span>Agreement</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  By visiting, accessing, or using <strong>Nedject</strong> (including genQRstudio, barcode tools, mockup modules, and the Fitness Glass engine located at <code className="bg-zinc-100 px-1 py-0.5 border border-zinc-300 font-mono text-xs">{siteUrl}</code>), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our Privacy Policy.
                </p>
                <p>
                  If you disagree with any portion of these Terms, you must immediately cease using the application and disconnect any associated OAuth authorizations.
                </p>
              </div>
            </section>

            {/* 2. Description of Services */}
            <section id="services" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 02</span>
                <span>/</span>
                <span>Capabilities</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                2. Description of Services
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  Nedject delivers a unified suite of technical optical and wellness utilities:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-zinc-700">
                  <li><strong>300 DPI Photo QR Studio:</strong> High-resolution optical matrix generation with pHYs chunk injection for physical print calibration.</li>
                  <li><strong>Barcode Pick &amp; Vectors:</strong> Standard symbology generation (UPC-A, EAN-13, FNSKU, Code 128) in SVG and PNG formats.</li>
                  <li><strong>Mockup &amp; Social Studio:</strong> Dynamic canvas previews and OpenGraph social banner generation.</li>
                  <li><strong>Fitness Glass &amp; Winter Arc:</strong> Cloud telemetry aggregation utilizing Google Fit REST APIs for athletic training logs and cardiovascular monitoring.</li>
                </ul>
              </div>
            </section>

            {/* 3. Accounts & OAuth Access */}
            <section id="accounts-oauth" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 03</span>
                <span>/</span>
                <span>Authentication</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                3. Accounts, Security &amp; OAuth Access
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  Certain features require account registration or third-party OAuth authentication (such as Google OAuth 2.0).
                </p>
                <div className="border border-black p-4 bg-[#f5f5f0] space-y-2 text-xs">
                  <div className="font-bold font-mono uppercase text-black">OAuth Credential Security:</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-700">
                    <li>You are responsible for safeguarding your login credentials.</li>
                    <li>When connecting Google Fit, you grant Nedject permission to access the specific scopes you authorize (such as activity and body metrics).</li>
                    <li>You may revoke Nedject&apos;s OAuth authorization at any time via your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="underline font-bold text-black">Google Account Security Settings</a>.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Acceptable Use Policy */}
            <section id="acceptable-use" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 04</span>
                <span>/</span>
                <span>Conduct</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  You agree to use Nedject solely for lawful purposes. You shall NOT:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-rose-600">[X]</span>
                    <span>Generate QR codes or barcodes containing malicious links, phishing URLs, spyware, or malware exploits.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-rose-600">[X]</span>
                    <span>Attempt to reverse engineer, bypass rate limits, or launch denial-of-service attacks against the application.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-rose-600">[X]</span>
                    <span>Scrape or extract telemetry data of other users without explicit authorization.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-rose-600">[X]</span>
                    <span>Misrepresent your identity or falsify biometric records.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 5. Fitness & Health Disclaimer */}
            <section id="health-disclaimer" className="border-4 border-black bg-amber-50 p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-800 uppercase mb-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>Section 05 // Important Health Disclaimer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono text-black">
                5. Fitness &amp; Medical Disclaimer
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-900">
                <p className="font-bold">
                  Nedject and the Fitness Glass / Winter Arc engine provide wellness, workout tracking, and biometric calculation tools for informational and recreational purposes ONLY.
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-zinc-800">
                  <li><strong>NOT MEDICAL ADVICE:</strong> Nothing contained in Nedject should be construed as medical diagnosis, treatment, or clinical health advice.</li>
                  <li><strong>CONSULT A PHYSICIAN:</strong> Always consult with a qualified physician or healthcare provider before beginning any strenuous workout routine, diet, or Winter Arc challenge.</li>
                  <li><strong>NO EMERGENCY USE:</strong> Nedject is not an emergency medical service and does not detect life-threatening cardiac events.</li>
                </ul>
              </div>
            </section>

            {/* 6. Subscriptions & Payments */}
            <section id="billing" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 06</span>
                <span>/</span>
                <span>Commercial</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                6. Subscriptions, Payments &amp; Fair Use
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  Nedject offers both free tiers and paid Pro upgrades. Payments are processed securely via authorized payment gateways (Razorpay).
                </p>
                <div className="border border-zinc-300 p-4 bg-[#fbfbfa] text-xs space-y-2">
                  <div><strong>Quotas:</strong> Free users receive standard generation quotas (10 generations/month), while Pro subscribers enjoy unlimited 300 DPI exports and telemetry sync.</div>
                  <div><strong>Fair Use:</strong> Pro subscriptions are designated for individual or small-studio usage. Automated mass scraping accounts may be throttled.</div>
                  <div><strong>Refund Policy:</strong> If you experience technical defects preventing generation, contact <a href="mailto:neerajrekwar817@gmail.com" className="font-bold underline">neerajrekwar817@gmail.com</a> within 14 days for assistance or refund evaluation.</div>
                </div>
              </div>
            </section>

            {/* 7. Warranties & Liability */}
            <section id="liability" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 07</span>
                <span>/</span>
                <span>Legal Limits</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                7. Disclaimer of Warranties &amp; Limitation of Liability
              </h2>
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-800 uppercase font-mono">
                <p>
                  THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEDJECT AND DEVELOPER NEERAJ REKWAR DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
                </p>
                <p>
                  IN NO EVENT SHALL NEDJECT OR ITS DEVELOPERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICES OR QR CODES.
                </p>
              </div>
            </section>

            {/* 8. Contact & Governing Law */}
            <section id="contact" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 08</span>
                <span>/</span>
                <span>Jurisdiction</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                8. Contact &amp; Governing Law
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws without regard to conflict of law principles.
                </p>
                <div className="border border-black p-4 bg-[#f5f5f0] font-mono text-xs space-y-2">
                  <div><strong>Developer:</strong> Neeraj Rekwar</div>
                  <div><strong>Email:</strong> <a href="mailto:neerajrekwar817@gmail.com" className="underline text-blue-700">neerajrekwar817@gmail.com</a></div>
                  <div><strong>Developer Support:</strong> <a href="mailto:dev.neerajrekwar@gmail.com" className="underline text-blue-700">dev.neerajrekwar@gmail.com</a></div>
                  <div><strong>Website:</strong> <a href={siteUrl} className="underline text-black">{siteUrl}</a></div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Bottom Sub-Bar */}
      <footer className="border-t-2 border-black bg-white py-6 font-mono text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <div>
            © {new Date().getFullYear()} Nedject // Developed by Neeraj Rekwar.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-black">Studio</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="font-bold text-black">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
