import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let targetUrl = urlParam.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const parsedTarget = new URL(targetUrl);

    // Fetch the target website from the server
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Follow redirects
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!response.ok) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h3>Failed to fetch ${targetUrl} (Status ${response.status})</h3><p>Website returned an error or blocked automated inspection.</p></body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const contentType = response.headers.get('content-type') || 'text/html';

    // If it's HTML, inject <base> tag and remove frame-busting scripts
    if (contentType.includes('text/html')) {
      let html = await response.text();

      const origin = parsedTarget.origin;
      const basePath = parsedTarget.pathname.substring(0, parsedTarget.pathname.lastIndexOf('/') + 1) || '/';
      const baseHref = `${origin}${basePath}`;

      // 1. Inject <base href="..."> right after <head> or at start of document
      const baseTag = `<base href="${baseHref}">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else if (html.includes('<HEAD>')) {
        html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      // 2. Remove standard JavaScript frame-busting scripts like if(top!=self) top.location=self.location
      html = html.replace(/if\s*\(\s*(top|window\.top)\s*!==?\s*(self|window\.self)\s*\)[^;]+;/gi, '// frame-bust stripped');
      html = html.replace(/top\.location\s*=\s*(self|window)\.location/gi, '// frame-bust stripped');

      // Return clean HTML with X-Frame-Options completely stripped!
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          // Explicitly omit X-Frame-Options and Content-Security-Policy to allow embedding!
        },
      });
    }

    // For non-HTML (images, CSS, etc.)
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
      `<html><body style="font-family:sans-serif;padding:2rem;text-align:center;background:#111;color:#fff;">
        <h3 style="color:#ccff00;">Unable to embed ${targetUrl} via Proxy</h3>
        <p style="color:#aaa;font-size:13px;">${err?.message || 'Network request failed'}</p>
        <p style="color:#888;font-size:12px;">Tip: Use the "HD Screenshot" toggle or upload a screenshot to view this website in 4K resolution.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
