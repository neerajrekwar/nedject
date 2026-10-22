import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = (searchParams.get('page') || 'home').toLowerCase().trim().replace(/^\//, '').replace(/\/$/, '');
    const customTitle = searchParams.get('title') || undefined;
    const customDesc = searchParams.get('desc') || searchParams.get('description') || undefined;
    const customBadge = searchParams.get('badge') || undefined;

    // Determine card category
    let cardType = 'home';
    if (customTitle && pageParam === 'custom') {
      cardType = 'custom';
    } else if (pageParam === 'mochup' || pageParam === 'mockup') {
      cardType = 'mochup';
    } else if (pageParam === 'barcode-pick' || pageParam === 'barcode') {
      cardType = 'barcode-pick';
    } else if (pageParam.includes('normal-dpi') || pageParam.includes('nomral-dpi')) {
      cardType = 'normal-dpi-photo';
    } else if (pageParam.includes('fitness') || pageParam.includes('winter-arc')) {
      cardType = 'fitness-glass';
    } else if (pageParam.includes('qr-crush') || pageParam.includes('crush')) {
      cardType = 'qr-crush';
    } else if (pageParam.includes('payment') || pageParam.includes('pricing') || pageParam.includes('plans')) {
      cardType = 'payment';
    } else if (pageParam.includes('blog')) {
      cardType = 'blog';
    } else if (customTitle) {
      cardType = 'custom';
    }

    // Card Theme Configurations
    let accent = '#ccff00';
    let moduleTag = '300 DPI PHOTO QR // ISO 18004';
    let sysCode = '300 DPI OPTICAL CALIBRATION';
    let badgeText = 'INDUSTRIAL PHOTO QR MATRIX';
    let badgeBg = '#ccff00';
    let badgeColor = '#000000';
    let h1Line1 = 'Industrial 300 DPI';
    let h1Line2 = 'Photo QR Code Studio';
    let desc = 'Floyd-Steinberg error diffusion & optical halftone matrices calibrated for 300 DPI commercial press prints with 100% verified camera scan rates.';
    let footerTags = ['300 DPI PRINT CALIBRATION', '100% SCAN RATE GUARANTEE', 'pHYs CHUNK INJECTION'];

    if (cardType === 'mochup') {
      accent = '#38bdf8';
      moduleTag = 'MOCKUP STUDIO // HARDWARE FRAMES';
      sysCode = 'APPLE TRIO · 9:16 MOBILE · IFRAME';
      badgeText = 'MULTI-DEVICE RESPONSIVE LAB';
      badgeBg = '#38bdf8';
      badgeColor = '#000000';
      h1Line1 = 'Interactive Mockup Studio';
      h1Line2 = '& Viewport Templates';
      desc = 'Pixel-accurate iPhone 16 Pro 9:16, MacBook Pro 16:10, and iPad frames with live URL iframe sandboxing, 4K snapshot exports, and device composition.';
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
      desc = 'Generate GS1-compliant Code-128, EAN-13, UPC-A, ITF-14, and Amazon FNSKU barcode matrices with auto-checksum verification and lossless vector SVG/PDF.';
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
      desc = 'Commercial photo prep engine with silver gelatin tone curve optimization, B/W print calibration, and vector-aligned PDF & PNG exports for offset presses.';
      footerTags = ['SILVER GELATIN B/W CURVE', 'DENSITY WEDGE VERIFIED', 'ZERO PIXELATION PRESS READY'];
    } else if (cardType === 'fitness-glass') {
      accent = '#10b981';
      moduleTag = 'TELEMETRY HUD // FITNESS GLASS';
      sysCode = 'GOOGLE FIT CLOUD TELEMETRY · PROTOCOL';
      badgeText = 'SMART GLASS HEADS-UP CADENCE';
      badgeBg = '#10b981';
      badgeColor = '#000000';
      h1Line1 = 'Fitness Smart Glass';
      h1Line2 = 'Timetable & Cadence HUD';
      desc = 'HUD timetable matrix and weekly training cadence planner engineered for smart glass displays, Google Fit API cloud telemetry, and wearable sports optics.';
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
      desc = 'Deep forensic payload analysis, Shannon entropy scoring, Reed-Solomon ECC parity block diagnostics, and AES-256-GCM encrypted QR payload generation.';
      footerTags = ['FOUR-PASS FORENSIC SCAN', 'AES-256-GCM CIPHER VAULT', 'ANTI-QUISHING DETECTION'];
    } else if (cardType === 'payment') {
      accent = '#fbbf24';
      moduleTag = 'LICENSING // PRO PASS MATRIX';
      sysCode = 'COMMERCIAL LICENSES · UNLIMITED ACCESS';
      badgeText = 'COMMERCIAL ENTERPRISE TIERS';
      badgeBg = '#fbbf24';
      badgeColor = '#000000';
      h1Line1 = 'Pro Quota & Commercial';
      h1Line2 = 'Licensing Plans';
      desc = 'Unlock unlimited 300 DPI high-resolution exports, batch matrix generators, vector barcode downloads, and raw API telemetry with priority SLA.';
      footerTags = ['COMMERCIAL PRINT RIGHTS', 'UNLIMITED 300 DPI EXPORTS', 'INSTANT KEY ACTIVATION'];
    } else if (cardType === 'blog') {
      accent = '#a78bfa';
      moduleTag = 'ENGINEERING MONOGRAPHS // BLOG';
      sysCode = 'TECHNICAL RESEARCH & SPECIFICATIONS';
      badgeText = 'TECHNICAL ENGINEERING BLOG';
      badgeBg = '#a78bfa';
      badgeColor = '#000000';
      h1Line1 = 'Engineering Specifications';
      h1Line2 = '& Print Calibration Log';
      desc = 'Technical deep-dives on 300 DPI halftone rendering, Floyd-Steinberg diffusion kernels, GS1 barcode symbology checksums, and optical security architecture.';
      footerTags = ['PEER-REVIEWED SPECIFICATIONS', 'PRINT LAB RESEARCH', 'OPEN ARCHITECTURE'];
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

            {/* Right Visual Graphic Column */}
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

              {cardType === 'mochup' && (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-around' }}>
                  <div style={{ width: 90, height: 180, border: '3px solid #38bdf8', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8 }}>
                    <div style={{ width: 30, height: 6, backgroundColor: '#000000', borderRadius: 3, marginBottom: 8 }} />
                    <div style={{ fontSize: 9, color: '#ccff00', fontFamily: 'monospace', fontWeight: 'bold' }}>9:16 IPHONE</div>
                  </div>
                  <div style={{ width: 200, height: 140, border: '3px solid #475569', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 10 }}>
                    <div style={{ fontSize: 10, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>MACBOOK PRO 16"</div>
                    <div style={{ width: '100%', height: 70, backgroundColor: '#1e293b', marginTop: 10 }} />
                  </div>
                </div>
              )}

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

              {cardType === 'payment' && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '90%', backgroundColor: '#fbbf24', color: '#000000', padding: '8px 16px', fontWeight: 900, fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>
                    NEDJECT ALL-ACCESS PRO PASS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16, gap: 6 }}>
                    <div style={{ fontSize: 12, color: '#ffffff', fontFamily: 'monospace' }}>✔ Unlimited 300 DPI Exports</div>
                    <div style={{ fontSize: 12, color: '#ffffff', fontFamily: 'monospace' }}>✔ Vector Barcode SVG + PDF</div>
                    <div style={{ fontSize: 12, color: '#ffffff', fontFamily: 'monospace' }}>✔ Full Commercial Print License</div>
                  </div>
                </div>
              )}

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
