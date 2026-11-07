import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPage = (searchParams.get('page') || 'home').toLowerCase().trim();
    const pageParam = rawPage.replace(/^\/+/, '').replace(/\/+$/, '');
    const customTitle = searchParams.get('title') || undefined;
    const customDesc = searchParams.get('desc') || searchParams.get('description') || undefined;
    const customBadge = searchParams.get('badge') || undefined;

    // Determine card category
    let cardType = 'home';
    if (customTitle && pageParam === 'custom') {
      cardType = 'custom';
    } else if (pageParam.includes('nfc') || pageParam.includes('bat')) {
      cardType = 'nfc-bat';
    } else if (pageParam === 'mochup' || pageParam === 'mockup') {
      cardType = 'mochup';
    } else if (pageParam === 'barcode-pick' || pageParam === 'barcode') {
      cardType = 'barcode-pick';
    } else if (pageParam.includes('normal-dpi') || pageParam.includes('nomral-dpi')) {
      cardType = 'normal-dpi-photo';
    } else if (pageParam.includes('winter-arc')) {
      cardType = 'winter-arc-2026';
    } else if (pageParam.includes('fitness')) {
      cardType = 'fitness-glass';
    } else if (pageParam.includes('qr-crush') || pageParam.includes('crush')) {
      cardType = 'qr-crush';
    } else if (
      pageParam.includes('payment') ||
      pageParam.includes('pricing') ||
      pageParam.includes('plans') ||
      pageParam.includes('pay-to-use')
    ) {
      cardType = 'payment';
    } else if (pageParam.includes('insta-clip') || pageParam.includes('clip')) {
      cardType = 'insta-clip';
    } else if (
      pageParam.includes('docs-api') ||
      pageParam === 'api' ||
      pageParam.includes('docs/api')
    ) {
      cardType = 'docs-api';
    } else if (pageParam.includes('docs')) {
      cardType = 'docs';
    } else if (pageParam.includes('dashboard') || pageParam.includes('google-fit')) {
      cardType = 'dashboard';
    } else if (pageParam.includes('blog')) {
      cardType = 'blog';
    } else if (pageParam.includes('tip')) {
      cardType = 'tip';
    } else if (pageParam.includes('privacy')) {
      cardType = 'privacy';
    } else if (pageParam.includes('terms')) {
      cardType = 'terms';
    } else if (
      pageParam.includes('login') ||
      pageParam.includes('auth') ||
      pageParam.includes('reset-password')
    ) {
      cardType = 'login';
    } else if (customTitle) {
      cardType = 'custom';
    }

    // Default configuration: Home / Studio
    let accent = '#ccff00';
    let moduleTag = '300 DPI PHOTO QR // ISO 18004';
    let sysCode = '300 DPI OPTICAL CALIBRATION';
    let badgeText = 'INDUSTRIAL PHOTO QR MATRIX';
    let badgeBg = '#ccff00';
    let badgeColor = '#000000';
    let h1Line1 = 'Industrial 300 DPI';
    let h1Line2 = 'Photo QR Code Studio';
    let desc =
      'Floyd-Steinberg error diffusion & optical halftone matrices calibrated for 300 DPI commercial press prints with 100% verified camera scan rates.';
    let footerTags = ['300 DPI PRINT CALIBRATION', '100% SCAN RATE GUARANTEE', 'pHYs CHUNK INJECTION'];

    if (cardType === 'nfc-bat') {
      accent = '#ccff00';
      moduleTag = 'NFC BAT // OPTICAL SPECIMEN';
      sysCode = '13.56 MHZ · ISO 14443-A · BAT SYMBOLOGY';
      badgeText = 'CURATED BATMAN SPECIMEN PRESET';
      badgeBg = '#ccff00';
      badgeColor = '#000000';
      h1Line1 = 'NFC Bat Precision';
      h1Line2 = 'Optical Specimen Lab';
      desc =
        'Deterministic NFC NTAG213/215/216 bitstream encoding with curated Batman precision bat patterns and optical camera scannability verification.';
      footerTags = ['ISO 14443-A COMPLIANCE', 'BATMAN BAT PATTERN SPECIMEN', 'NDEF PAYLOAD FORMATTER'];
    } else if (cardType === 'mochup') {
      accent = '#38bdf8';
      moduleTag = 'MOCKUP STUDIO // HARDWARE FRAMES';
      sysCode = 'APPLE TRIO · 9:16 MOBILE · IFRAME';
      badgeText = 'MULTI-DEVICE RESPONSIVE LAB';
      badgeBg = '#38bdf8';
      badgeColor = '#000000';
      h1Line1 = 'Interactive Mockup Studio';
      h1Line2 = '& Viewport Templates';
      desc =
        'Pixel-accurate iPhone 16 Pro 9:16, MacBook Pro 16:10, and iPad frames with live URL iframe sandboxing, 4K snapshot exports, and device composition.';
      footerTags = ['9:16 MOBILE NATIVE', 'SANDBOXED IFRAMES', '4K RETINA EXPORT'];
    } else if (cardType === 'barcode-pick') {
      accent = '#eab308';
      moduleTag = 'LOGISTICS // 1D/2D SYMBOLOGY';
      sysCode = 'UPC · EAN-13 · CODE-128 · FNSKU';
      badgeText = 'WAREHOUSE & SUPPLY CHAIN BARCODES';
      badgeBg = '#eab308';
      badgeColor = '#000000';
      h1Line1 = 'Industrial Barcode Generator';
      h1Line2 = '& Vector Studio';
      desc =
        'Generate GS1-compliant Code-128, EAN-13, UPC-A, ITF-14, and Amazon FNSKU barcode matrices with auto-checksum verification and lossless vector SVG/PDF.';
      footerTags = ['VECTOR SVG + PDF PRINT EXPORT', 'GS1-COMPLIANT CHECKSUM', 'AUTO-CALCULATED MOD-10'];
    } else if (cardType === 'normal-dpi-photo') {
      accent = '#ffffff';
      moduleTag = 'PRINT CALIBRATION // 300 DPI PREP';
      sysCode = '72 DPI SCREEN VS 300 DPI PRESS';
      badgeText = 'PRESS-READY PHOTO PREPARATION';
      badgeBg = '#ffffff';
      badgeColor = '#000000';
      h1Line1 = '300 DPI Photo Prep';
      h1Line2 = '& Print Calibration';
      desc =
        'Commercial photo prep engine with silver gelatin tone curve optimization, B/W print calibration, and vector-aligned PDF & PNG exports for offset presses.';
      footerTags = ['SILVER GELATIN B/W CURVE', 'DENSITY WEDGE VERIFIED', 'ZERO PIXELATION PRESS READY'];
    } else if (cardType === 'winter-arc-2026') {
      accent = '#10b981';
      moduleTag = 'WINTER ARC // 90-DAY PROTOCOL';
      sysCode = 'TACTICAL CADENCE · WINTER 2026';
      badgeText = '90-DAY DISCIPLINE MATRIX';
      badgeBg = '#10b981';
      badgeColor = '#000000';
      h1Line1 = 'Winter Arc 2026';
      h1Line2 = 'Tactical HUD Protocol';
      desc =
        'Dedicated 90-day winter physical conditioning protocol with daily cadence check-ins, biometric milestones, Google Fit telemetry, and Heads-Up Display exports.';
      footerTags = ['90-DAY WINTER CONDITIONING', 'DAILY CADENCE CHECK-INS', 'HEADS-UP OPTICS EXPORT'];
    } else if (cardType === 'fitness-glass') {
      accent = '#10b981';
      moduleTag = 'TELEMETRY HUD // FITNESS GLASS';
      sysCode = 'GOOGLE FIT CLOUD TELEMETRY · PROTOCOL';
      badgeText = 'SMART GLASS HEADS-UP CADENCE';
      badgeBg = '#10b981';
      badgeColor = '#000000';
      h1Line1 = 'Fitness Smart Glass';
      h1Line2 = 'Timetable & Cadence HUD';
      desc =
        'HUD timetable matrix and weekly training cadence planner engineered for smart glass displays, Google Fit API cloud telemetry, and wearable sports optics.';
      footerTags = ['WEARABLE HUD INTERFACE', 'GOOGLE FIT CLOUD TELEMETRY', 'WINTER ARC 2026 PROTOCOL'];
    } else if (cardType === 'qr-crush') {
      accent = '#ef4444';
      moduleTag = 'FORENSIC AUDITOR // QR CRUSH';
      sysCode = 'AES-256 PBKDF2 · SHANNON ENTROPY';
      badgeText = 'OPTICAL FORENSICS & CIPHER LAB';
      badgeBg = '#ef4444';
      badgeColor = '#ffffff';
      h1Line1 = 'QR Crush Forensic Lab';
      h1Line2 = '& Crypto Auditor';
      desc =
        'Deep forensic payload analysis, Shannon entropy scoring, Reed-Solomon ECC parity block diagnostics, and AES-256-GCM encrypted QR payload generation.';
      footerTags = ['FOUR-PASS FORENSIC SCAN', 'AES-256-GCM CIPHER VAULT', 'ANTI-QUISHING DETECTION'];
    } else if (cardType === 'payment') {
      accent = '#fbbf24';
      moduleTag = 'LICENSING // PRO & CUSTOM PASS';
      sysCode = 'COMMERCIAL LICENSES · UNLIMITED ACCESS';
      badgeText = 'COMMERCIAL & BESPOKE CUSTOM TIERS';
      badgeBg = '#fbbf24';
      badgeColor = '#000000';
      h1Line1 = 'Pro Quota & Bespoke';
      h1Line2 = 'Custom Architecture';
      desc =
        'Unlock unlimited 300 DPI high-resolution exports, batch matrix generators, vector barcode downloads, tailored custom VPCs, and raw API telemetry.';
      footerTags = ['COMMERCIAL PRINT RIGHTS', 'UNLIMITED 300 DPI EXPORTS', 'BESPOKE CUSTOM CLUSTERS'];
    } else if (cardType === 'insta-clip') {
      accent = '#f43f5e';
      moduleTag = 'INSTA-CLIP // KINETIC STUDIO';
      sysCode = '9:16 VERTICAL CANVAS · 4K EXTRACTION';
      badgeText = 'INSTA-POSTER & FRAME STUDIO';
      badgeBg = '#f43f5e';
      badgeColor = '#ffffff';
      h1Line1 = 'Insta-Clip Poster';
      h1Line2 = '& Video Frame Studio';
      desc =
        'Direct in-browser video frame extraction, 9:16 story poster typography, and lossless high-resolution canvas snapshots without cloud uploads.';
      footerTags = ['ZERO-UPLOAD PRIVACY', '9:16 ASPECT RATIO', 'LOSSLESS CANVAS SNAPSHOTS'];
    } else if (cardType === 'docs-api') {
      accent = '#a855f7';
      moduleTag = 'REST API // DEVELOPER SDK';
      sysCode = 'FAST HTTP KERNEL · 3,000+ RPM CLUSTER';
      badgeText = 'HIGH-THROUGHPUT CLOUD REST API';
      badgeBg = '#a855f7';
      badgeColor = '#ffffff';
      h1Line1 = 'Cloud REST API Reference';
      h1Line2 = '& Developer SDKs';
      desc =
        'Integrate 300 DPI optical QR rendering, barcode generation, and PDF prepress pipelines directly into your production backend in minutes.';
      footerTags = ['CURL / TS / PYTHON / GO', 'MULTI-CURRENCY BILLING', 'SUB-50MS LATENCY'];
    } else if (cardType === 'docs') {
      accent = '#38bdf8';
      moduleTag = 'DOCS // KNOWLEDGE BASE';
      sysCode = 'SPECIFICATIONS · API GUIDES · ARCHITECTURE';
      badgeText = 'ENGINEERING PLATFORM MANUAL';
      badgeBg = '#38bdf8';
      badgeColor = '#000000';
      h1Line1 = 'Developer Docs';
      h1Line2 = '& Platform Manual';
      desc =
        'Complete developer documentation, prepress standards, cryptographic verification procedures, and hardware specifications for Nedject.';
      footerTags = ['API REFERENCE', 'PREPRESS STANDARDS', 'STEP-BY-STEP GUIDES'];
    } else if (cardType === 'dashboard') {
      accent = '#06b6d4';
      moduleTag = 'BIOMETRICS // HUD TELEMETRY';
      sysCode = 'GOOGLE FIT REST API · 24-HR CADENCE';
      badgeText = 'REAL-TIME BIOMETRIC TELEMETRY';
      badgeBg = '#06b6d4';
      badgeColor = '#000000';
      h1Line1 = 'Google Fit Cloud';
      h1Line2 = 'Telemetry Dashboard';
      desc =
        'Real-time synchronization with Google Fit cloud APIs, biometric telemetry aggregation, AHA blood pressure tracking, and smart glass HUD cadence.';
      footerTags = ['GOOGLE FIT API SYNC', 'AHA BLOOD PRESSURE', 'ENCRYPTED CLIENT STORAGE'];
    } else if (cardType === 'blog') {
      accent = '#a78bfa';
      moduleTag = 'ENGINEERING MONOGRAPHS // BLOG';
      sysCode = 'TECHNICAL RESEARCH & SPECIFICATIONS';
      badgeText = 'TECHNICAL ENGINEERING BLOG';
      badgeBg = '#a78bfa';
      badgeColor = '#000000';
      h1Line1 = 'Engineering Specifications';
      h1Line2 = '& Print Calibration Log';
      desc =
        'Technical deep-dives on 300 DPI halftone rendering, Floyd-Steinberg diffusion kernels, GS1 barcode symbology checksums, and optical security architecture.';
      footerTags = ['PEER-REVIEWED SPECIFICATIONS', 'PRINT LAB RESEARCH', 'OPEN ARCHITECTURE'];
    } else if (cardType === 'tip') {
      accent = '#f59e0b';
      moduleTag = 'COMMUNITY // SUPPORT MATRIX';
      sysCode = 'INDEPENDENT ENGINEERING · ZERO ADS';
      badgeText = 'CREATOR SPONSORSHIP LEDGER';
      badgeBg = '#f59e0b';
      badgeColor = '#000000';
      h1Line1 = 'Support & Sponsor';
      h1Line2 = 'Nedject Development';
      desc =
        'Fuel continuous independent engineering of open-source print calibration kernels, forensic auditors, and zero-tracker optical tooling.';
      footerTags = ['DIRECT DEVELOPER SUPPORT', 'NO CORPORATE SPONSORS', 'ETHEREAL CONTRIBUTIONS'];
    } else if (cardType === 'privacy' || cardType === 'terms') {
      accent = '#22c55e';
      moduleTag = 'SECURITY // LEGAL POLICIES';
      sysCode = 'PRIVACY FIRST · OAUTH 2.0 PROTOCOL';
      badgeText = cardType === 'privacy' ? 'GOOGLE LIMITED USE COMPLIANCE' : 'TERMS & SLA AGREEMENTS';
      badgeBg = '#22c55e';
      badgeColor = '#000000';
      h1Line1 = cardType === 'privacy' ? 'Privacy & Security' : 'Terms of Service';
      h1Line2 = cardType === 'privacy' ? 'Compliance Portal' : '& Licensing SLA';
      desc =
        cardType === 'privacy'
          ? 'Full disclosure of Google OAuth 2.0 Limited Use compliance, zero-tracker client privacy, cryptographic isolation, and data deletion rights.'
          : 'Clear terms governing commercial 300 DPI print licensing, developer API throughput, SLA uptime guarantees, and refund policies.';
      footerTags = ['LIMITED USE COMPLIANT', 'ZERO THIRD-PARTY TRACKERS', 'END-TO-END DATA RIGHTS'];
    } else if (cardType === 'login') {
      accent = '#eab308';
      moduleTag = 'AUTH // DEVELOPER VAULT';
      sysCode = 'PBKDF2 SHA-256 · NEXT-AUTH SESSION';
      badgeText = 'SECURE ACCESS GATEWAY';
      badgeBg = '#eab308';
      badgeColor = '#000000';
      h1Line1 = 'Developer Portal';
      h1Line2 = '& Key Access Vault';
      desc =
        'Authenticate securely to manage commercial API credentials, monitor generation usage quotas, and manage custom enterprise subscriptions.';
      footerTags = ['NEXT-AUTH GOOGLE OAUTH', 'PBKDF2 KEY ENCRYPTION', 'SESSION TIMEOUT GUARD'];
    } else if (cardType === 'custom') {
      accent = '#ccff00';
      moduleTag = customBadge ? customBadge.toUpperCase() : 'NEDJECT // INDUSTRIAL SUITE';
      sysCode = 'HIGH-PRECISION DIGITAL TOOLS';
      badgeText = customBadge || 'COMMERCIAL SPECIFICATION';
      badgeBg = '#ccff00';
      badgeColor = '#000000';
      h1Line1 = customTitle || 'Nedject Studio';
      h1Line2 = '';
      desc = customDesc || 'High-precision digital tools and 300 DPI commercial print calibration.';
      footerTags = ['HIGH PRECISION SUITE', 'ZERO CLIENT-SIDE TRACKERS', 'ISO/IEC STANDARDS CERTIFIED'];
    }

    // Dynamic overrides if query parameters exist
    if (customTitle && cardType !== 'custom') {
      h1Line1 = customTitle;
      h1Line2 = '';
    }
    if (customDesc && cardType !== 'custom') {
      desc = customDesc;
    }
    if (customBadge && cardType !== 'custom') {
      badgeText = customBadge;
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#090a0c',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.08) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.08) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            padding: '40px 50px',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Top Neon Border Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              backgroundColor: accent,
            }}
          />

          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#111111',
              border: '2px solid #262626',
              height: 56,
              paddingRight: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  backgroundColor: accent,
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: 17,
                  fontFamily: 'monospace',
                  padding: '0 20px',
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                NEDJECT // STUDIO
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  paddingLeft: 20,
                  display: 'flex',
                }}
              >
                [ {moduleTag} ]
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  marginRight: 10,
                }}
              />
              <div
                style={{
                  color: '#a1a1aa',
                  fontWeight: 'bold',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              >
                {sysCode}
              </div>
            </div>
          </div>

          {/* Main Card Body */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 30,
              marginBottom: 30,
            }}
          >
            {/* Left Content Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 620,
              }}
            >
              {/* Neo-brutalist Badge */}
              <div
                style={{
                  display: 'flex',
                  alignSelf: 'flex-start',
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  fontWeight: 800,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  padding: '8px 16px',
                  border: '2px solid #000000',
                  boxShadow: '3px 3px 0px #000000',
                  marginBottom: 20,
                }}
              >
                {badgeText}
              </div>

              {/* Headline */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  marginBottom: 18,
                }}
              >
                <div>{h1Line1}</div>
                {h1Line2 && <div>{h1Line2}</div>}
              </div>

              {/* Description */}
              <div
                style={{
                  color: '#a1a1aa',
                  fontSize: 18,
                  fontFamily: 'monospace',
                  lineHeight: 1.45,
                }}
              >
                {desc}
              </div>
            </div>

            {/* Right Visual Graphic Column (Tailored Neo-Brutalist Visual Graphic) */}
            <div
              style={{
                width: 440,
                height: 330,
                backgroundColor: '#121316',
                border: `3px solid ${accent}`,
                boxShadow: `8px 8px 0px rgba(0,0,0,0.8)`,
                display: 'flex',
                flexDirection: 'column',
                padding: 20,
                boxSizing: 'border-box',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* 1. HOME / 300 DPI QR STUDIO */}
              {cardType === 'home' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexWrap: 'wrap',
                      padding: 16,
                      boxSizing: 'border-box',
                      border: '4px solid #000000',
                      position: 'relative',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 22, height: 22, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 10, height: 10, backgroundColor: '#ccff00' }} />
                      </div>
                    </div>
                    <div style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 22, height: 22, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 10, height: 10, backgroundColor: '#000000' }} />
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 16, left: 16, width: 44, height: 44, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 22, height: 22, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 10, height: 10, backgroundColor: '#000000' }} />
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      backgroundColor: '#000000',
                      border: '2px solid #ccff00',
                      color: '#ccff00',
                      padding: '8px 18px',
                      fontWeight: 900,
                      fontSize: 13,
                      fontFamily: 'monospace',
                    }}
                  >
                    300 DPI // 1:1 RASTER
                  </div>
                </div>
              )}

              {/* 2. NFC BAT SPECIMEN */}
              {cardType === 'nfc-bat' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div
                    style={{
                      width: 240,
                      height: 140,
                      backgroundColor: '#000000',
                      border: '3px solid #ccff00',
                      boxShadow: '4px 4px 0px #ccff00',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 12,
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, backgroundColor: '#ccff00', borderRadius: '50%' }} />
                      <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 900, color: '#ccff00' }}>
                        🦇 BATMAN SPECIMEN 🦇
                      </span>
                    </div>
                    {/* Simulated Bat-Wing Matrix Wireframe */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 34, height: 16, backgroundColor: '#ccff00', clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }} />
                      <div style={{ width: 48, height: 28, backgroundColor: '#ffffff', border: '2px solid #ccff00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 16, height: 16, backgroundColor: '#000000' }} />
                      </div>
                      <div style={{ width: 34, height: 16, backgroundColor: '#ccff00', clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)' }} />
                    </div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#a1a1aa', marginTop: 10 }}>
                      ISO 14443-A // 13.56 MHz // NTAG215
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      backgroundColor: '#ccff00',
                      color: '#000000',
                      padding: '6px 14px',
                      fontWeight: 900,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                  >
                    OPTICAL BAT PATTERN VERIFIED
                  </div>
                </div>
              )}

              {/* 3. MOCHUP / MOCKUP */}
              {cardType === 'mochup' && (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-around' }}>
                  <div style={{ width: 90, height: 180, border: '3px solid #38bdf8', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8 }}>
                    <div style={{ width: 30, height: 6, backgroundColor: '#000000', borderRadius: 3, marginBottom: 8 }} />
                    <div style={{ fontSize: 9, color: '#ccff00', fontFamily: 'monospace', fontWeight: 'bold' }}>9:16 IPHONE</div>
                  </div>
                  <div style={{ width: 200, height: 140, border: '3px solid #475569', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 10 }}>
                    <div style={{ fontSize: 10, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>MACBOOK PRO 16&quot;</div>
                    <div style={{ width: '100%', height: 70, backgroundColor: '#1e293b', marginTop: 10 }} />
                  </div>
                </div>
              )}

              {/* 4. BARCODE PICK */}
              {cardType === 'barcode-pick' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'monospace', color: '#eab308', marginBottom: 12 }}>
                    FNSKU: X0034B76QR // GS1 UPC-A
                  </div>
                  <div style={{ display: 'flex', height: 120, alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 16px', border: '3px solid #000000' }}>
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 4, 3, 1].map((w, idx) => (
                      <div key={idx} style={{ width: w * 2.5, height: '100%', backgroundColor: idx % 2 === 0 ? '#000000' : 'transparent', marginRight: 2 }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff', marginTop: 14 }}>
                    (01) 0 12345 67890 5
                  </div>
                </div>
              )}

              {/* 5. NORMAL DPI PHOTO */}
              {cardType === 'normal-dpi-photo' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ display: 'flex', width: '100%', height: 40, border: '2px solid #ffffff', marginBottom: 20 }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                      <div key={val} style={{ flex: 1, backgroundColor: `rgb(${val * 28}, ${val * 28}, ${val * 28})` }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#ccff00', fontWeight: 'bold' }}>
                    300 DPI COMMERCIAL OFFSET PRESS READY
                  </div>
                </div>
              )}

              {/* 6. WINTER ARC 2026 */}
              {cardType === 'winter-arc-2026' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: 140, height: 140, borderRadius: '50%', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 90, height: 90, borderRadius: '50%', border: '2px dashed #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#ccff00', fontFamily: 'monospace' }}>DAY 90</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#10b981', marginTop: 14, fontWeight: 'bold' }}>
                    WINTER ARC PROTOCOL // LOCKED
                  </div>
                </div>
              )}

              {/* 7. FITNESS GLASS */}
              {cardType === 'fitness-glass' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: 140, height: 140, borderRadius: '50%', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px dashed #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#ccff00', fontFamily: 'monospace' }}>182 SPM</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#10b981', marginTop: 14, fontWeight: 'bold' }}>
                    HUD CADENCE PROTOCOL // ACTIVE
                  </div>
                </div>
              )}

              {/* 8. QR CRUSH */}
              {cardType === 'qr-crush' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ border: '2px solid #ef4444', backgroundColor: '#2d060d', padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85%' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444', fontFamily: 'monospace', marginBottom: 6 }}>
                      🔒 AES-256-GCM VAULT
                    </div>
                    <div style={{ fontSize: 11, color: '#ffffff', fontFamily: 'monospace' }}>
                      SHANNON ENTROPY: 7.989 BITS / BYTE
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#fca5a5', marginTop: 14 }}>
                    FOUR-PASS REED-SOLOMON FORENSIC AUDIT
                  </div>
                </div>
              )}

              {/* 9. PAYMENT & BESPOKE CUSTOM */}
              {cardType === 'payment' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '92%', backgroundColor: '#000000', border: '2px solid #fbbf24', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
                      <span>TIER 4: BESPOKE CUSTOM</span>
                      <span style={{ color: '#ccff00' }}>3,000+ RPM</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#d4d4d8', fontFamily: 'monospace' }}>
                      ✔ Private VPC / Dedicated Clusters
                    </div>
                    <div style={{ fontSize: 11, color: '#d4d4d8', fontFamily: 'monospace' }}>
                      ✔ Unlimited 300 DPI Generation Quota
                    </div>
                    <div style={{ fontSize: 11, color: '#d4d4d8', fontFamily: 'monospace' }}>
                      ✔ 99.99% High-Availability SLA
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#fbbf24', marginTop: 14, fontWeight: 'bold' }}>
                    MULTI-CURRENCY (INR / USD / EUR / GBP / RUB)
                  </div>
                </div>
              )}

              {/* 10. INSTA-CLIP */}
              {cardType === 'insta-clip' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: 130, height: 180, border: '3px solid #f43f5e', backgroundColor: '#1a050c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#f43f5e', fontWeight: 900 }}>9:16 FRAME</div>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
                      {[20, 35, 15, 40, 25, 30, 10, 38].map((h, i) => (
                        <div key={i} style={{ width: 4, height: h, backgroundColor: '#f43f5e' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#ffffff' }}>4K CANVA EXPORT</div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#f43f5e', marginTop: 12, fontWeight: 'bold' }}>
                    CLIENT-SIDE ZERO CLOUD UPLOAD
                  </div>
                </div>
              )}

              {/* 11. DOCS-API */}
              {cardType === 'docs-api' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '95%', backgroundColor: '#000000', border: '2px solid #a855f7', padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#a855f7', fontWeight: 'bold', marginBottom: 6 }}>$ curl -X POST /api/v1/qr</div>
                    <div style={{ color: '#94a3b8' }}>-H &quot;X-Nedject-Key: ned_live_...&quot;</div>
                    <div style={{ color: '#94a3b8' }}>-d &#123;&quot;dpi&quot;: 300, &quot;format&quot;: &quot;png&quot;&#125;</div>
                    <div style={{ color: '#22c55e', marginTop: 8, fontWeight: 'bold' }}>&gt; HTTP 200 OK [100% SCAN VERIFIED]</div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#a855f7', marginTop: 12, fontWeight: 'bold' }}>
                    SDK SUPPORT: TS · PYTHON · GO · CURL
                  </div>
                </div>
              )}

              {/* 12. DOCS */}
              {cardType === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#071626', border: '2px solid #38bdf8', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>
                      PLATFORM ARCHITECTURE &amp; MANUAL
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                      • Section 1: Prepress Optical Half-Tones
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                      • Section 2: GS1 Barcode Symbology
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                      • Section 3: REST API &amp; Webhook Integration
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8', marginTop: 12, fontWeight: 'bold' }}>
                    PEER-REVIEWED TECHNICAL MANUAL
                  </div>
                </div>
              )}

              {/* 13. DASHBOARD / GOOGLE FIT */}
              {cardType === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#051b24', border: '2px solid #06b6d4', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#06b6d4', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
                      <span>TELEMETRY STREAM</span>
                      <span style={{ color: '#22c55e' }}>● LIVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'monospace', color: '#ffffff' }}>
                      <span>HEART RATE: 142 BPM</span>
                      <span>CADENCE: 180 SPM</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                      SYNCED VIA GOOGLE FIT REST API
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#06b6d4', marginTop: 12, fontWeight: 'bold' }}>
                    HEADS-UP SMART GLASS HUD COMPATIBLE
                  </div>
                </div>
              )}

              {/* 14. BLOG */}
              {cardType === 'blog' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#a78bfa', color: '#000000', padding: '6px 14px', fontWeight: 900, fontSize: 12, fontFamily: 'monospace', textAlign: 'center' }}>
                    TECHNICAL RESEARCH MONOGRAPHS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 14, gap: 8, width: '90%' }}>
                    <div style={{ backgroundColor: '#2e284a', padding: '6px 12px', fontSize: 11, color: '#c4b5fd', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
                      <span>RFC-01</span> <span>300 DPI Halftone Diffusion</span>
                    </div>
                    <div style={{ backgroundColor: '#2e284a', padding: '6px 12px', fontSize: 11, color: '#c4b5fd', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
                      <span>RFC-02</span> <span>GS1 Modulo-10 Checksum</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 15. TIP */}
              {cardType === 'tip' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#261a05', border: '2px solid #f59e0b', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>⚡</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>
                      DEVELOPER SPONSOR LEDGER
                    </div>
                    <div style={{ fontSize: 11, color: '#d4d4d8', fontFamily: 'monospace', marginTop: 4, textAlign: 'center' }}>
                      Empower independent, tracker-free tools.
                    </div>
                  </div>
                </div>
              )}

              {/* 16. PRIVACY / TERMS */}
              {(cardType === 'privacy' || cardType === 'terms') && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#052312', border: '2px solid #22c55e', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>🛡️</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#22c55e', fontFamily: 'monospace' }}>
                      VERIFIED LEGAL &amp; SECURITY PROTOCOL
                    </div>
                    <div style={{ fontSize: 10, color: '#d4d4d8', fontFamily: 'monospace', marginTop: 6, textAlign: 'center' }}>
                      Zero third-party trackers. Google Limited Use compliant.
                    </div>
                  </div>
                </div>
              )}

              {/* 17. LOGIN / AUTH */}
              {cardType === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#211804', border: '2px solid #eab308', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>🔑</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#eab308', fontFamily: 'monospace' }}>
                      DEVELOPER KEY VAULT
                    </div>
                    <div style={{ fontSize: 10, color: '#d4d4d8', fontFamily: 'monospace', marginTop: 6, textAlign: 'center' }}>
                      PBKDF2 SHA-256 encrypted authentication &amp; quota keys.
                    </div>
                  </div>
                </div>
              )}

              {/* 18. CUSTOM */}
              {cardType === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ccff00', fontFamily: 'monospace', textAlign: 'center' }}>
                    {h1Line1}
                  </div>
                  <div style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'monospace', marginTop: 14, textAlign: 'center' }}>
                    {moduleTag}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#111111',
              border: '1.5px solid #262626',
              height: 44,
              padding: '0 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {footerTags.map((tag, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginRight: 28 }}>
                  <span style={{ color: accent, marginRight: 6, fontSize: 12 }}>✔</span>
                  <span style={{ color: '#d4d4d8', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                color: '#71717a',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              DEVELOPED BY NEERAJREKWAR
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to generate OpenGraph card:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate OpenGraph card', message: error?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
