import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Activity,
  FileText,
  Mail,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
  Server,
  Key,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { getSiteUrl, SITE_NAME } from '@/lib/seo';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Privacy Policy | Nedject — 300 DPI Photo QR & Fitness Telemetry Studio',
  description:
    'Comprehensive Privacy Policy for Nedject, genQRstudio, and Fitness Glass. Full disclosure of Google OAuth 2.0, Google Fit API scopes, Google API Services User Data Policy Limited Use compliance, cryptographic security, and data deletion rights.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy — Nedject',
    description:
      'Learn how Nedject safeguards your data, complies with the Google API Services User Data Policy Limited Use requirements, and protects Google Fit telemetry.',
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'February 24, 2026';
  const effectiveDate = 'February 24, 2026';

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Top Banner Navigation */}
      <nav className="border-b-2 border-black bg-white sticky top-0 z-30 font-mono">
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
              className="font-black bg-black text-[#ccff00] px-2.5 py-0.5 border border-black"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-zinc-600 hover:text-black transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="border-b-2 border-black bg-black text-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 font-mono">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ccff00] text-black font-black text-xs uppercase mb-4 border border-black shadow-[2px_2px_0px_#ffffff]">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Legal &amp; Compliance Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            Privacy Policy
          </h1>
          <p className="mt-3 text-zinc-300 text-sm sm:text-base max-w-2xl font-sans">
            How Nedject (&ldquo;genQRstudio&rdquo; and &ldquo;Fitness Glass&rdquo;) collects, processes, protects, and handles personal data, Google OAuth authentication tokens, and Google Fit health telemetry.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div>
              <span className="text-white font-bold">Application Name:</span> Nedject
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">Homepage:</span>{' '}
              <a href={siteUrl} className="text-[#ccff00] underline">{siteUrl}</a>
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">Effective Date:</span> {effectiveDate}
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">Last Updated:</span> {lastUpdated}
            </div>
          </div>
        </div>
      </header>

      {/* Compliance Quick Badges */}
      <section className="border-b-2 border-black bg-zinc-100 py-4 font-mono">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white p-2.5 border border-black">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Google Limited Use Verified</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 border border-black">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold">Zero Data Selling</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 border border-black">
            <EyeOff className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-bold">Zero Ad Targeting</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 border border-black">
            <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">No AI Model Training</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-4 py-12 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Left Navigation (Desktop) */}
          <aside className="lg:col-span-4 font-mono text-xs order-2 lg:order-1">
            <div className="lg:sticky lg:top-20 border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] space-y-4">
              <div className="font-black text-xs uppercase border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Table of Contents</span>
                <span className="text-[10px] text-zinc-500">10 SECTIONS</span>
              </div>
              <nav className="space-y-1.5 text-zinc-700">
                <a href="#summary" className="block hover:text-black hover:font-bold py-0.5">
                  1. Executive Summary &amp; Scope
                </a>
                <a href="#controller" className="block hover:text-black hover:font-bold py-0.5">
                  2. Identity of Data Controller
                </a>
                <a href="#scopes-breakdown" className="block hover:text-black hover:font-bold py-0.5 text-black font-bold">
                  3. Google OAuth &amp; Sensitive Scopes
                </a>
                <a href="#google-data-policy" className="block hover:text-black hover:font-bold py-0.5 text-black font-bold">
                  4. Google API Limited Use Policy
                </a>
                <a href="#other-data" className="block hover:text-black hover:font-bold py-0.5">
                  5. Other Data Collected
                </a>
                <a href="#data-usage" className="block hover:text-black hover:font-bold py-0.5">
                  6. Purpose &amp; Usage of Data
                </a>
                <a href="#storage-retention" className="block hover:text-black hover:font-bold py-0.5">
                  7. Storage, Security &amp; Retention
                </a>
                <a href="#subprocessors" className="block hover:text-black hover:font-bold py-0.5">
                  8. Third-Party Sub-Processors
                </a>
                <a href="#user-rights" className="block hover:text-black hover:font-bold py-0.5">
                  9. Your Rights &amp; Access Revocation
                </a>
                <a href="#contact" className="block hover:text-black hover:font-bold py-0.5">
                  10. Contact Information
                </a>
              </nav>

              <div className="pt-4 border-t border-zinc-200">
                <div className="text-[11px] font-bold uppercase text-zinc-500 mb-1">
                  Google Verification Note
                </div>
                <div className="p-2.5 bg-[#f5f5f0] border border-black text-[11px] text-zinc-700 leading-snug">
                  Nedject strictly adheres to the Google API Services User Data Policy, including all Limited Use prohibitions.
                </div>
              </div>
            </div>
          </aside>

          {/* Core Body Sections */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-10">
            
            {/* 1. Summary */}
            <section id="summary" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 01</span>
                <span>/</span>
                <span>Overview</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                1. Executive Summary &amp; Scope
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  Welcome to <strong>Nedject</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). This Privacy Policy applies to the web application hosted at{' '}
                  <code className="bg-zinc-100 px-1.5 py-0.5 border border-zinc-300 font-mono text-xs">{siteUrl}</code>{' '}
                  (including all sub-routes, pages, and feature suites such as genQRstudio and Fitness Glass).
                </p>
                <p>
                  Nedject provides advanced digital design utilities (300 DPI high-resolution Photo QR Codes, vector barcode generators) alongside the <strong>Fitness Glass &amp; Winter Arc</strong> health telemetry HUD. Because Fitness Glass interfaces with Google Fit to visualize athletic metrics, we maintain the highest standards of data security, privacy, and compliance with Google&apos;s strict Trust &amp; Safety guidelines.
                </p>
                <p>
                  <strong>Core Guarantees:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-zinc-700">
                  <li>We <strong>never sell, lease, or monetize</strong> your personal data or fitness telemetry.</li>
                  <li>We <strong>never serve advertisements</strong> or use your data for advertising targeting or behavioral profiling.</li>
                  <li>We <strong>never train AI or machine learning models</strong> on your private Google Fit data.</li>
                  <li>We <strong>do not permit human inspection</strong> of your telemetry except under narrow, legally mandated or user-authorized security exceptions.</li>
                  <li>You maintain <strong>complete sovereignty</strong>: you can revoke access or purge your data at any time.</li>
                </ul>
              </div>
            </section>

            {/* 2. Identity of Data Controller */}
            <section id="controller" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 02</span>
                <span>/</span>
                <span>Legal Identity</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                2. Identity of Data Controller
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  The legal data controller responsible for the processing of your personal data on Nedject is:
                </p>
                <div className="border-2 border-black p-4 bg-[#ccff00]/10 font-mono text-xs space-y-2">
                  <div className="font-black text-sm text-black uppercase">Nedject Software Engineering</div>
                  <div>Application Name: <strong className="text-black">Nedject</strong></div>
                  <div>Official Homepage URL: <a href={siteUrl} className="underline text-black">{siteUrl}</a></div>
                  <div>Lead Developer &amp; Data Controller: <strong className="text-black">Neeraj Rekwar</strong></div>
                  <div>Primary Contact &amp; Compliance Email: <a href="mailto:neerajrekwar817@gmail.com" className="font-bold underline text-blue-700">neerajrekwar817@gmail.com</a></div>
                  <div>Developer Support Email: <a href="mailto:dev.neerajrekwar@gmail.com" className="font-bold underline text-blue-700">dev.neerajrekwar@gmail.com</a></div>
                  <div>Developer GitHub: <a href="https://github.com/neerajrekwar" target="_blank" rel="noreferrer" className="underline hover:text-black">github.com/neerajrekwar</a></div>
                </div>
                <p className="text-xs text-zinc-600">
                  For any privacy inquiries, GDPR/CCPA data rights requests, or security vulnerability disclosures, you can directly reach our Data Controller at <a href="mailto:neerajrekwar817@gmail.com" className="font-bold underline">neerajrekwar817@gmail.com</a>.
                </p>
              </div>
            </section>

            {/* 3. Google OAuth & Sensitive Scopes Breakdown */}
            <section id="scopes-breakdown" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 03</span>
                <span>/</span>
                <span>OAuth &amp; Scopes Disclosure</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                3. Google OAuth 2.0 &amp; Google Fit API Scopes
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  Nedject uses Google OAuth 2.0 to authenticate users and power the <strong>Fitness Glass</strong> HUD telemetry dashboard. We adhere strictly to the principle of <em>Data Minimization</em>: we only request access to scopes that are directly necessary to deliver user-initiated features.
                </p>
                <p>
                  Below is an exhaustive disclosure of each Google OAuth scope requested, the exact data accessed, and the explicit user-facing functionality it powers:
                </p>

                <div className="space-y-4 pt-2">
                  
                  {/* Identity Scopes */}
                  <div className="border border-black p-4 bg-zinc-50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5">Identity Scopes</span>
                      <span className="text-[11px] font-mono text-zinc-600">Authentication</span>
                    </div>
                    <div className="font-mono text-xs text-zinc-900 font-bold mb-1">
                      openid, .../auth/userinfo.email, .../auth/userinfo.profile
                    </div>
                    <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                      <li><strong>Exact Data Accessed:</strong> Your primary Google email address, account name, Google unique user ID, and avatar picture URL.</li>
                      <li><strong>User-Facing Feature:</strong> Securely authenticates your login session on Nedject, associates your generated QR and barcode assets with your account, and displays your user avatar in the navigation bar.</li>
                      <li><strong>Need Justification:</strong> Necessary to identify you without requiring separate password storage.</li>
                    </ul>
                  </div>

                  {/* Activity Scope */}
                  <div className="border border-black p-4 bg-zinc-50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs bg-[#ccff00] text-black px-2 py-0.5 border border-black">Fitness Activity Scopes</span>
                      <span className="text-[11px] font-mono text-zinc-600">Sensitive Scope</span>
                    </div>
                    <div className="font-mono text-xs text-zinc-900 font-bold mb-1">
                      https://www.googleapis.com/auth/fitness.activity.read<br />
                      https://www.googleapis.com/auth/fitness.activity.write
                    </div>
                    <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                      <li><strong>Exact Data Accessed:</strong> Daily step counts, active calorie burn, workout duration, distance traversed, and logged athletic activities (running, cycling, strength training).</li>
                      <li><strong>User-Facing Feature:</strong> Renders your interactive Winter Arc training cadence, daily streak counter, and activity telemetry graph within the Fitness Glass smart dashboard.</li>
                      <li><strong>Write Permission Justification:</strong> Used exclusively when you explicitly click &ldquo;Sync Workout Log&rdquo; to record a completed training session to your Google Fit account from the dashboard.</li>
                    </ul>
                  </div>

                  {/* Body Scope */}
                  <div className="border border-black p-4 bg-zinc-50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-900">Body Metrics Scopes</span>
                      <span className="text-[11px] font-mono text-zinc-600">Sensitive Scope</span>
                    </div>
                    <div className="font-mono text-xs text-zinc-900 font-bold mb-1">
                      https://www.googleapis.com/auth/fitness.body.read<br />
                      https://www.googleapis.com/auth/fitness.body.write
                    </div>
                    <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                      <li><strong>Exact Data Accessed:</strong> Body weight, height, body mass index (BMI), and body composition measurements.</li>
                      <li><strong>User-Facing Feature:</strong> Plots athletic progress trendlines, body composition changes, and BMI milestone targets over customizable 30-day and 90-day athletic cycles.</li>
                      <li><strong>Write Permission Justification:</strong> Allows you to record newly logged weigh-ins directly from the Nedject telemetry interface to Google Fit upon your affirmative confirmation.</li>
                    </ul>
                  </div>

                  {/* Blood Pressure Scope */}
                  <div className="border border-black p-4 bg-zinc-50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs bg-rose-100 text-rose-900 px-2 py-0.5 border border-rose-900">Cardiovascular Vitals Scopes</span>
                      <span className="text-[11px] font-mono text-zinc-600">Sensitive Scope</span>
                    </div>
                    <div className="font-mono text-xs text-zinc-900 font-bold mb-1">
                      https://www.googleapis.com/auth/fitness.blood_pressure.read<br />
                      https://www.googleapis.com/auth/fitness.blood_pressure.write
                    </div>
                    <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                      <li><strong>Exact Data Accessed:</strong> Systolic and diastolic blood pressure readings and measurement timestamps.</li>
                      <li><strong>User-Facing Feature:</strong> Visualizes cardiovascular recovery vitals and resting blood pressure telemetry to verify recovery safety during high-intensity training blocks.</li>
                      <li><strong>Write Permission Justification:</strong> Permits the user to save verified manual blood pressure readings taken with personal monitors to their central health log.</li>
                    </ul>
                  </div>

                </div>
              </div>
            </section>

            {/* 4. Google API User Data Policy / Limited Use Compliance */}
            <section id="google-data-policy" className="border-4 border-black bg-[#ccff00]/15 p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-black uppercase mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <span>Section 04 // Google Trust &amp; Safety Mandatory Disclosure</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono text-black">
                4. Google API Services User Data Policy Compliance (Limited Use)
              </h2>
              
              <div className="space-y-4 text-sm leading-relaxed text-zinc-900">
                <div className="border-2 border-black bg-white p-5 font-mono text-xs font-bold leading-relaxed shadow-[2px_2px_0px_#000000]">
                  &ldquo;Nedject&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-blue-700 hover:text-black font-black"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.&rdquo;
                </div>

                <p className="font-semibold text-zinc-900">
                  To ensure complete compliance with the Google Limited Use requirements, Nedject strictly operates under the following four non-negotiable principles:
                </p>

                <div className="space-y-3 pt-1">
                  
                  <div className="border border-black bg-white p-4">
                    <div className="flex items-center gap-2 font-mono font-black text-xs uppercase mb-1.5 text-black">
                      <Lock className="w-4 h-4 text-emerald-700" />
                      <span>1. Prohibition on Selling or Transferring Google User Data</span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      Nedject will <strong>NEVER sell, license, rent, trade, or transfer</strong> any information obtained through Google APIs or Google Fit to any third party, data broker, advertising network, or analytics vendor. We do not engage in any commercial exchange of user health data.
                    </p>
                  </div>

                  <div className="border border-black bg-white p-4">
                    <div className="flex items-center gap-2 font-mono font-black text-xs uppercase mb-1.5 text-black">
                      <EyeOff className="w-4 h-4 text-rose-700" />
                      <span>2. Prohibition on Advertising &amp; Marketing</span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      Google user data is <strong>NEVER used or transferred</strong> for serving advertisements, interest-based ad targeting, retargeting campaigns, marketing communications, or consumer behavior profiling. Nedject is 100% ad-free; we monetize solely via voluntary subscription tiers (Pro quotas).
                    </p>
                  </div>

                  <div className="border border-black bg-white p-4">
                    <div className="flex items-center gap-2 font-mono font-black text-xs uppercase mb-1.5 text-black">
                      <UserCheck className="w-4 h-4 text-blue-700" />
                      <span>3. Prohibition on Human Review of Google User Data</span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      No human engineer, employee, or contractor is permitted to read or inspect your private Google Fit data or Google account information. Human review is restricted exclusively to the following four narrow exceptions:
                    </p>
                    <ul className="list-disc list-inside text-xs text-zinc-600 mt-1.5 space-y-1">
                      <li>We obtain your prior, affirmative, explicit agreement to view specific error logs for technical troubleshooting;</li>
                      <li>It is strictly necessary for system security purposes, such as investigating a malware attack or bug abuse;</li>
                      <li>It is required to comply with applicable statutory law, judicial order, or enforceable governmental demand; or</li>
                      <li>The data is completely aggregated and anonymized for internal technical system reliability monitoring.</li>
                    </ul>
                  </div>

                  <div className="border border-black bg-white p-4">
                    <div className="flex items-center gap-2 font-mono font-black text-xs uppercase mb-1.5 text-black">
                      <Cpu className="w-4 h-4 text-purple-700" />
                      <span>4. Prohibition on Machine Learning &amp; AI Model Training</span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      Nedject <strong>DOES NOT use Google user data or Google Fit telemetry</strong> to train, fine-tune, retrain, or improve generalized Artificial Intelligence (AI) models, Machine Learning (ML) models, large language models (LLMs), or neural networks.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* 5. Other Data Collected */}
            <section id="other-data" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 05</span>
                <span>/</span>
                <span>Other Data</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                5. Other Information Collected
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  Beyond Google OAuth, Nedject collects the following categories of data when you utilize our creation studio:
                </p>
                <div className="space-y-3">
                  <div className="border border-zinc-300 p-3.5 bg-zinc-50">
                    <h3 className="font-bold text-xs uppercase font-mono mb-1">A. Client-Side Image &amp; Optical Generator Processing</h3>
                    <p className="text-xs text-zinc-700">
                      When creating 300 DPI Photo QR codes or vector barcodes, pixel rasterization and optical calibration occur <strong>directly inside your web browser via HTML5 Canvas</strong>. We do not store, view, or retain your raw uploaded images on our servers; processing remains local to your device.
                    </p>
                  </div>
                  <div className="border border-zinc-300 p-3.5 bg-zinc-50">
                    <h3 className="font-bold text-xs uppercase font-mono mb-1">B. Account Quotas &amp; Subscription Tier</h3>
                    <p className="text-xs text-zinc-700">
                      We track account tier status (Guest: 2 generations, Free: 10 generations, Pro: Unlimited) and usage timestamps to prevent automated rate-limit abuse and enforce plan limits.
                    </p>
                  </div>
                  <div className="border border-zinc-300 p-3.5 bg-zinc-50">
                    <h3 className="font-bold text-xs uppercase font-mono mb-1">C. Technical Logs &amp; Anonymous Metrics</h3>
                    <p className="text-xs text-zinc-700">
                      Our hosting infrastructure collects standard HTTP server logs (IP address, user-agent string, page request timestamps) for security diagnostics and edge performance monitoring. These logs do not contain health telemetry.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Purpose & Usage of Data */}
            <section id="data-usage" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 06</span>
                <span>/</span>
                <span>Data Processing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                6. Purpose &amp; Usage of Collected Data
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  We process data only when we have a valid legal basis (contractual necessity, user consent, or legitimate security interest). We use collected data strictly for:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-zinc-700">
                  <li><strong>Feature Delivery:</strong> Rendering your real-time fitness metrics, training calendar, and custom barcode configurations.</li>
                  <li><strong>Authentication &amp; Session Continuity:</strong> Maintaining your logged-in session state via secure, encrypted cookies.</li>
                  <li><strong>Security &amp; Abuse Prevention:</strong> Detecting distributed denial-of-service (DDoS) attacks, brute-force attempts, and unauthorized scraping.</li>
                  <li><strong>Service Communications:</strong> Notifying you regarding essential security updates or major changes to our terms or privacy policy.</li>
                </ul>
              </div>
            </section>

            {/* 7. Storage, Security & Retention */}
            <section id="storage-retention" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 07</span>
                <span>/</span>
                <span>Security Standards</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                7. Storage, Security Safeguards &amp; Retention Timelines
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  We implement enterprise-grade technical and organizational safeguards to shield your data against unauthorized access, alteration, disclosure, or destruction:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="border border-black p-4 bg-[#fbfbfa]">
                    <div className="font-bold font-mono text-xs uppercase mb-1.5 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Encryption in Transit &amp; Rest</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      All traffic between your browser and our edge servers is encrypted using modern <strong>TLS 1.3 with 256-bit certificates</strong>. Tokens and sensitive secrets stored in backend databases are encrypted at rest using AES-256 standards.
                    </p>
                  </div>
                  <div className="border border-black p-4 bg-[#fbfbfa]">
                    <div className="font-bold font-mono text-xs uppercase mb-1.5 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Ephemeral Telemetry Caching</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Google Fit telemetry queried via API is kept in transient session memory or temporary cache to render charts. We do not maintain unencrypted historical fitness databases outside your direct Google Fit cloud account.
                    </p>
                  </div>
                </div>

                <div className="border-2 border-black p-4 bg-zinc-50 font-mono text-xs space-y-2">
                  <div className="font-black uppercase text-zinc-900">Data Retention Timelines:</div>
                  <ul className="list-disc list-inside text-zinc-700 space-y-1">
                    <li><strong>OAuth Access Tokens:</strong> Ephemeral; expire automatically within 60 minutes or upon logout.</li>
                    <li><strong>OAuth Refresh Tokens:</strong> Stored securely in encrypted form only for active users, and purged immediately upon disconnection or deletion request.</li>
                    <li><strong>Account Profile &amp; Quotas:</strong> Retained for the duration of your active account lifecycle.</li>
                    <li><strong>Server Diagnostic Logs:</strong> Automatically rotated and permanently wiped after 30 days.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 8. Third-Party Sub-Processors */}
            <section id="subprocessors" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 08</span>
                <span>/</span>
                <span>Infrastructure</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                8. Third-Party Sub-Processors
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  To host and run Nedject globally, we engage trusted infrastructure sub-processors who adhere to stringent security agreements:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border border-zinc-300">
                    <thead className="bg-zinc-100 border-b border-zinc-300">
                      <tr>
                        <th className="p-2.5">Sub-Processor</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Role &amp; Function</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="p-2.5 font-bold">Vercel Inc.</td>
                        <td className="p-2.5 text-zinc-600">United States / Global Edge</td>
                        <td className="p-2.5 text-zinc-700">Cloud web hosting, Next.js serverless runtime, and global CDN delivery.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Google Cloud Platform</td>
                        <td className="p-2.5 text-zinc-600">United States</td>
                        <td className="p-2.5 text-zinc-700">OAuth 2.0 authentication infrastructure and Google Fit API endpoint routing.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Google Analytics 4 (GA4)</td>
                        <td className="p-2.5 text-zinc-600">United States</td>
                        <td className="p-2.5 text-zinc-700">Aggregated, anonymized website page view statistics. <em>Zero health data or Google Fit telemetry is ever shared with GA4.</em></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 9. User Rights & How to Revoke Access */}
            <section id="user-rights" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 09</span>
                <span>/</span>
                <span>User Control &amp; Deletion</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                9. Your Rights &amp; How to Revoke Access
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  You hold full sovereign authority over your personal information and Google permissions under GDPR, CCPA, and global privacy frameworks:
                </p>

                {/* Revocation Box */}
                <div className="border-2 border-black p-5 bg-[#f5f5f0] space-y-3 font-mono text-xs">
                  <div className="font-black uppercase text-black flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>How to Revoke Google Permissions (Instant Disconnect):</span>
                  </div>
                  <p className="font-sans text-xs text-zinc-700">
                    You can instantly revoke Nedject&apos;s access to your Google Account at any time through Google&apos;s centralized security portal:
                  </p>
                  <div className="pt-1">
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-black text-[#ccff00] hover:bg-zinc-800 px-4 py-2 border-2 border-black font-black uppercase tracking-wider transition-colors shadow-[2px_2px_0px_#000000]"
                    >
                      <span>Google Account Permissions Portal</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="text-[11px] font-sans text-zinc-600 space-y-1 pt-1">
                    <div>1. Visit <code className="bg-white px-1 border border-zinc-300">https://myaccount.google.com/permissions</code></div>
                    <div>2. Locate <strong>&ldquo;Nedject&rdquo;</strong> in the list of third-party apps with account access.</div>
                    <div>3. Click <strong>&ldquo;Remove Access&rdquo;</strong> (or &ldquo;Delete all connections&rdquo;).</div>
                    <div>4. Nedject will immediately lose all ability to query or interact with your Google Fit data.</div>
                  </div>
                </div>

                {/* Account Deletion Box */}
                <div className="border-2 border-black p-5 bg-white space-y-3">
                  <div className="font-black font-mono text-xs uppercase flex items-center gap-2 text-rose-700 text-sm">
                    <Trash2 className="w-4 h-4" />
                    <span>Right to Permanent Erasure (Complete Data Deletion):</span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    You have the right to request the permanent deletion of your account, stored OAuth tokens, and associated data from our servers. To execute a deletion request:
                  </p>
                  <div className="border border-zinc-300 p-3 bg-zinc-50 font-mono text-xs space-y-1">
                    <div>Send an email to: <a href="mailto:neerajrekwar817@gmail.com" className="font-bold underline text-blue-700">neerajrekwar817@gmail.com</a></div>
                    <div>Subject line: <strong>DATA DELETION REQUEST</strong></div>
                    <div>Include: Your registered Google email address.</div>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800">
                    ✓ Commitment: We guarantee that all user data, authentication tokens, and account records will be permanently purged within 48 to 72 hours (maximum 7 business days) of receiving your request.
                  </p>
                </div>

              </div>
            </section>

            {/* 10. Contact Information */}
            <section id="contact" className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                <span>Section 10</span>
                <span>/</span>
                <span>Legal Contact</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-4 font-mono">
                10. Contact Information &amp; Regulatory Inquiries
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-zinc-800">
                <p>
                  If you have questions, feedback, or regulatory inquiries regarding this Privacy Policy or our compliance with Google&apos;s Limited Use requirements:
                </p>
                <div className="border-2 border-black p-4 bg-[#f5f5f0] font-mono text-xs space-y-2">
                  <div><strong>Application Name:</strong> Nedject (genQRstudio &amp; Fitness Glass)</div>
                  <div><strong>Official Website:</strong> <a href={siteUrl} className="underline text-black">{siteUrl}</a></div>
                  <div><strong>Data Controller &amp; Lead Engineer:</strong> Neeraj Rekwar</div>
                  <div><strong>Primary Inquiries:</strong> <a href="mailto:neerajrekwar817@gmail.com" className="underline text-blue-700">neerajrekwar817@gmail.com</a></div>
                  <div><strong>Developer Support:</strong> <a href="mailto:dev.neerajrekwar@gmail.com" className="underline text-blue-700">dev.neerajrekwar@gmail.com</a></div>
                  <div><strong>Privacy Policy Link:</strong> <a href={`${siteUrl}/privacy`} className="underline text-black">{siteUrl}/privacy</a></div>
                  <div><strong>Terms of Service Link:</strong> <a href={`${siteUrl}/terms`} className="underline text-black">{siteUrl}/terms</a></div>
                  <div><strong>Response SLA:</strong> We respond to all privacy and data rights requests within 48 business hours.</div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Bottom Footer Sub-Bar */}
      <footer className="border-t-2 border-black bg-white py-6 font-mono text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <div>
            © {new Date().getFullYear()} Nedject // Developed by Neeraj Rekwar. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-black">Studio</Link>
            <span>•</span>
            <Link href="/privacy" className="font-bold text-black">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
