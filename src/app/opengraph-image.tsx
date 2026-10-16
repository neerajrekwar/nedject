import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Nedject — Industrial 300 DPI Photo QR Code & Barcode Studio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0a',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Accent Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: '#ccff00',
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ccff00',
              color: '#000000',
              padding: '6px 14px',
              fontWeight: 900,
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            NEDJECT STUDIO
          </div>
          <div
            style={{
              color: '#888888',
              fontSize: '18px',
              fontFamily: 'monospace',
            }}
          >
            INDUSTRIAL GRADE UTILITIES v2.0
          </div>
        </div>

        {/* Main Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '1050px',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              margin: 0,
            }}
          >
            Industrial 300 DPI Photo QR Code &amp; Barcode Matrix
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Commercial B/W calibration, vector export (SVG, PDF, PNG), Google Fit telemetry sync, and smart cadence engine.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          {['300 DPI Photo Prep', 'Vector Barcodes', 'Forensic QR Scanner', 'Google Fit Cloud API'].map((tag) => (
            <div
              key={tag}
              style={{
                border: '1px solid #333333',
                backgroundColor: '#18181b',
                color: '#e4e4e7',
                padding: '8px 18px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
