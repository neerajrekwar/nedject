'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  UserCheck,
  ExternalLink,
  Activity,
  HeartPulse,
  Scale,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export function DataTransparencySection() {
  return (
    <section
      id="privacy-transparency"
      aria-label="Google OAuth and Data Transparency Disclosure"
      className="w-full py-16 md:py-20 border-b-2 border-black bg-white font-sans text-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Section Header */}
        <div className="border-b-2 border-black pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#ccff00] px-3 py-1 font-mono text-xs font-black tracking-widest text-black shadow-[3px_3px_0px_#000000]">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>GOOGLE OAUTH // DATA TRANSPARENCY DISCLOSURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-black font-mono">
              USER DATA &amp; GOOGLE FIT PRIVACY
            </h2>
            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-sans">
              Nedject is dedicated to radical transparency. Below is an open disclosure of why our application requests Google authentication, the exact Google Fit telemetry we access, and our strict adherence to Google&apos;s Limited Use requirements. Visible to all users without requiring account login.
            </p>
          </div>

          {/* Quick Legal Links Box */}
          <div className="border-2 border-black bg-[#f5f5f0] p-4 shadow-[4px_4px_0px_#000000] font-mono text-xs shrink-0 max-w-xs space-y-2">
            <div className="font-black uppercase text-black text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#ccff00] border border-black inline-block" />
              <span>OFFICIAL LEGAL DOCUMENTS</span>
            </div>
            <div className="space-y-1 pt-1">
              <Link
                href="/privacy"
                className="flex items-center justify-between text-blue-700 hover:text-black font-bold underline"
              >
                <span>Privacy Policy (/privacy)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/terms"
                className="flex items-center justify-between text-zinc-700 hover:text-black font-bold underline"
              >
                <span>Terms of Service (/terms)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-300">
              Controller: Neeraj Rekwar &bull; neerajrekwar817@gmail.com
            </div>
          </div>
        </div>

        {/* 1. Purpose for Requesting User Data */}
        <div className="space-y-4">
          <div className="font-mono text-xs font-black uppercase tracking-wider text-zinc-500">
            [1.0] PURPOSE FOR REQUESTING GOOGLE USER DATA
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Identity */}
            <div className="border-2 border-black bg-[#fbfbfa] p-6 shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="w-8 h-8 border-2 border-black bg-black text-[#ccff00] flex items-center justify-center font-mono font-black text-xs">
                01
              </div>
              <h3 className="font-mono font-black text-base uppercase text-black">
                Account Authentication
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                We access <code>openid</code>, <code>userinfo.email</code>, and <code>userinfo.profile</code> solely to authenticate your identity, secure your studio session, and associate your custom 300 DPI QR presets and barcodes with your account.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Password Storage</span>
              </div>
            </div>

            {/* Fitness Activity */}
            <div className="border-2 border-black bg-[#fbfbfa] p-6 shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="w-8 h-8 border-2 border-black bg-[#ccff00] text-black flex items-center justify-center font-mono font-black text-xs">
                02
              </div>
              <h3 className="font-mono font-black text-base uppercase text-black flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span>Activity &amp; Steps Telemetry</span>
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                We request <code>fitness.activity.read</code> to sync daily steps, active workout duration, and burned calories directly into the <strong>Fitness Glass HUD</strong> and Winter Arc cadence chart. Write access is used strictly when you choose to log completed workouts back to Google Fit.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Athletic Cadence Visualization</span>
              </div>
            </div>

            {/* Vitals & Body */}
            <div className="border-2 border-black bg-[#fbfbfa] p-6 shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="w-8 h-8 border-2 border-black bg-blue-400 text-black flex items-center justify-center font-mono font-black text-xs">
                03
              </div>
              <h3 className="font-mono font-black text-base uppercase text-black flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-700" />
                <span>Body &amp; Blood Pressure Vitals</span>
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                We request <code>fitness.body.read</code> and <code>fitness.blood_pressure.read</code> to plot body weight progression, BMI milestones, and resting blood pressure for athlete recovery monitoring. Write access permits saving manual health readings on your explicit confirmation.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Safety &amp; Milestone Tracking</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Google Limited Use Verbatim Banner */}
        <div className="border-4 border-black bg-[#ccff00]/20 p-6 md:p-8 shadow-[6px_6px_0px_#000000] space-y-4 font-mono">
          <div className="flex items-center gap-2 font-black text-xs uppercase text-black">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <span>MANDATORY GOOGLE API SERVICES USER DATA POLICY STATEMENT</span>
          </div>
          
          <blockquote className="border-l-4 border-black pl-4 py-1 text-sm md:text-base font-bold text-black leading-relaxed">
            &ldquo;Nedject&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-800 hover:text-black font-black"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.&rdquo;
          </blockquote>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            
            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase text-black">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Zero Data Selling</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-normal">
                We never sell, rent, or transfer your Google data or fitness records to data brokers or third parties.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase text-black">
                <EyeOff className="w-4 h-4 text-rose-700" />
                <span>Zero Ad Targeting</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-normal">
                Google user data is never used for serving ads, personalized marketing, or behavioral consumer profiling.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase text-black">
                <Cpu className="w-4 h-4 text-purple-700" />
                <span>No AI Training</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-normal">
                Your health telemetry is never used to train or fine-tune machine learning or foundational AI models.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase text-black">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>No Human Review</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-normal">
                No humans inspect your data except upon your explicit troubleshooting request or legal requirement.
              </p>
            </div>

          </div>
        </div>

        {/* 3. User Sovereign Rights & Instant Revocation */}
        <div className="border-2 border-black bg-[#f5f5f0] p-6 md:p-8 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono text-xs">
          <div className="space-y-2 max-w-2xl font-sans">
            <div className="font-mono font-black text-xs uppercase text-black flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>YOU RETAIN 100% SOVEREIGNTY OVER YOUR DATA</span>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed">
              You can instantly revoke Nedject&apos;s access to your Google account at any time via Google Account Settings, or request permanent deletion of your account and tokens by emailing <strong>neerajrekwar817@gmail.com</strong>. All data will be purged within 48 to 72 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 border-2 border-black bg-white hover:bg-black hover:text-[#ccff00] text-black font-black uppercase tracking-wider text-center transition-colors"
            >
              <span>Manage Google Permissions</span>
            </a>
            <Link
              href="/privacy"
              className="w-full sm:w-auto px-5 py-2.5 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 font-black uppercase tracking-wider text-center shadow-[2px_2px_0px_#000000] transition-colors"
            >
              <span>Read Full Privacy Policy →</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
