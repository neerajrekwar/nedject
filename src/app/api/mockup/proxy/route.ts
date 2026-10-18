import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam || !urlParam.trim()) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:monospace;background:#0a0b0e;color:#888;padding:2rem;text-align:center;">
        <h4 style="color:#ccff00;margin-bottom:0.5rem;">[NEDJECT STUDIO] No Target URL Specified</h4>
        <p style="font-size:12px;">Please input a valid website URL in the mockup studio bar above.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  let targetUrl = urlParam.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const hostHeader = req.headers.get('host') || '';

    // Prevent recursive iframe loops if the user enters nedject.vercel.app or current host
    if (
      parsedTarget.hostname.includes('nedject.vercel.app') ||
      (hostHeader && parsedTarget.host === hostHeader)
    ) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                margin: 0;
                padding: 2.5rem 1.5rem;
                background-color: #0c0d10;
                color: #e4e4e7;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 80vh;
                text-align: center;
              }
              .badge {
                display: inline-block;
                background: #000;
                color: #ccff00;
                border: 2px solid #ccff00;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 0.05em;
                margin-bottom: 1rem;
              }
              h2 { font-size: 18px; margin: 0 0 8px 0; color: #fff; font-weight: 900; }
              p { font-size: 12px; color: #a1a1aa; max-width: 420px; line-height: 1.5; margin: 0 auto 1.5rem auto; }
              .btn {
                background: #ccff00;
                color: #000;
                text-decoration: none;
                font-weight: 900;
                font-size: 11px;
                padding: 8px 16px;
                border: 2px solid #000;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="badge">NEDJECT STUDIO PREVIEW</div>
            <h2>Nedject Industrial Web Architecture</h2>
            <p>Self-preview protected: Direct iframe recursion prevented to keep your studio session responsive and error-free.</p>
            <a href="/" target="_blank" class="btn">OPEN NEDJECT IN NEW WINDOW ↗</a>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Prevent local IP / localhost loop
    if (
      parsedTarget.hostname === 'localhost' ||
      parsedTarget.hostname === '127.0.0.1' ||
      parsedTarget.hostname === '0.0.0.0'
    ) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="font-family:monospace;background:#0a0b0e;color:#888;padding:2rem;text-align:center;">
          <h4 style="color:#ccff00;">Localhost Not Accessible from Cloud</h4>
          <p style="font-size:12px;color:#aaa;">Localhost URLs (${targetUrl}) cannot be loaded directly by the cloud proxy. Use a public live website or upload a screenshot directly!</p>
        </body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 10-second fetch timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      cache: 'no-store',
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0e0f12;color:#eee;padding:2.5rem 1.5rem;text-align:center;">
          <h3 style="color:#ccff00;margin-bottom:6px;">Target Server Error (${response.status})</h3>
          <p style="color:#999;font-size:12px;max-width:400px;margin:0 auto 1rem auto;">
            The server at <strong>${parsedTarget.hostname}</strong> responded with status ${response.status}.
          </p>
          <p style="color:#777;font-size:11px;">Tip: Switch to "HD Visual Capture" in the toolbar to generate high-resolution 4K snapshots.</p>
        </body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const contentType = response.headers.get('content-type') || 'text/html';

    // If it's HTML, inject base tag, isolation shield, and strip frame-busters
    if (contentType.includes('text/html')) {
      let html = await response.text();

      const origin = parsedTarget.origin;
      const basePath = parsedTarget.pathname.substring(0, parsedTarget.pathname.lastIndexOf('/') + 1) || '/';
      const baseHref = `${origin}${basePath}`;

      // 1. Strip CSP meta tags and X-Frame-Options meta tags
      html = html.replace(/<meta[^>]*http-equiv=["']?(content-security-policy|x-frame-options)["']?[^>]*>/gi, '');

      // 2. Disarm frame-busting JavaScript constructs
      html = html.replace(/if\s*\(\s*(top|window\.top)\s*!==?\s*(self|window\.self)\s*\)[^;]+;/gi, '// frame-bust stripped');
      html = html.replace(/(top|parent|window\.top|window\.parent)\.location(\s*=\s*|\.href\s*=\s*|\.replace\s*\()/gi, 'window.location$2');
      html = html.replace(/if\s*\(\s*top\.location\s*!==?\s*self\.location\s*\)/gi, 'if (false)');

      // 3. Inject Isolation Shield Script and <base> tag
      const isolationShield = `
        <base href="${baseHref}">
        <script>
          // Nedject Iframe Shield: Isolate child window from parent to prevent client exceptions
          try {
            Object.defineProperty(window, 'top', { get: function() { return window.self; }, configurable: true });
            Object.defineProperty(window, 'parent', { get: function() { return window.self; }, configurable: true });
          } catch(e) {}
          window.onerror = function() { return true; };
          window.onunhandledrejection = function(e) { if (e && e.preventDefault) e.preventDefault(); return true; };
          try { window.onbeforeunload = null; } catch(e) {}
        </script>
      `;

      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${isolationShield}`);
      } else if (html.includes('<HEAD>')) {
        html = html.replace('<HEAD>', `<HEAD>${isolationShield}`);
      } else {
        html = `${isolationShield}${html}`;
      }

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Non-HTML content (CSS, images, etc.)
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Proxy fetch failed:', err);
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem 1rem;text-align:center;background:#0d0e12;color:#eee;">
        <h3 style="color:#ccff00;margin-bottom:8px;">Live Iframe Loading Notice</h3>
        <p style="color:#aaa;font-size:12px;max-width:380px;margin:0 auto 1rem auto;">
          ${err?.name === 'AbortError' ? 'Target website connection timed out.' : 'This website does not permit automated proxy streaming.'}
        </p>
        <div style="background:#181920;border:1px solid #333;padding:10px 14px;border-radius:6px;display:inline-block;margin-bottom:1.2rem;">
          <span style="color:#ccff00;font-size:11px;font-family:monospace;font-weight:bold;">RECOMMENDED:</span>
          <span style="color:#ccc;font-size:11px;font-family:monospace;"> Switch to HD Visual Capture for 100% 4K preview</span>
        </div>
        <br/>
        <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color:#000;background:#ccff00;padding:6px 14px;text-decoration:none;font-weight:bold;font-size:11px;border-radius:4px;border:2px solid #000;">
          OPEN SITE IN NEW TAB ↗
        </a>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
