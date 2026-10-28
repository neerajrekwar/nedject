import { NextRequest, NextResponse } from 'next/server';
import { SupportedCurrency } from '@/lib/plans-db';

export const dynamic = 'force-dynamic';

const EUROZONE_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'HR'
]);

/**
 * Determine supported currency from ISO country code according to specification:
 * - Russia (RU) -> RUB
 * - India (IN) -> INR
 * - United Kingdom (GB) -> GBP
 * - Eurozone -> EUR
 * - Whole world default -> USD
 */
export function mapCountryToCurrency(countryCode: string = ''): SupportedCurrency {
  const code = (countryCode || '').trim().toUpperCase();

  if (code === 'RU') return 'RUB';
  if (code === 'IN') return 'INR';
  if (code === 'GB' || code === 'UK') return 'GBP';
  if (EUROZONE_COUNTRIES.has(code)) return 'EUR';

  // Default for whole world
  return 'USD';
}

export async function GET(req: NextRequest) {
  try {
    // 1. Inspect direct country headers from CDN / Cloud Run / Reverse Proxy
    const headerCountry =
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-country-code') ||
      req.headers.get('x-geo-country');

    if (headerCountry && headerCountry.length === 2 && headerCountry !== 'XX') {
      const currency = mapCountryToCurrency(headerCountry);
      return NextResponse.json({
        success: true,
        countryCode: headerCountry.toUpperCase(),
        currency,
        source: 'header',
      });
    }

    // 2. Extract Client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    let clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '';

    // Handle local dev IPs
    const isLocal =
      !clientIp ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('192.168.');

    // 3. Query ipapi.co
    const url = isLocal
      ? 'https://ipapi.co/json/'
      : `https://ipapi.co/${clientIp}/json/`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Nedject-Geo-Service/1.0',
        Accept: 'application/json',
      },
    }).catch(() => null);

    clearTimeout(timeout);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.country_code) {
        const countryCode = data.country_code.toUpperCase();
        const currency = mapCountryToCurrency(countryCode);

        return NextResponse.json({
          success: true,
          countryCode,
          countryName: data.country_name || countryCode,
          city: data.city,
          ip: data.ip || clientIp,
          currency,
          source: 'ipapi.co',
        });
      }
    }
  } catch (err) {
    console.warn('[Geo API] ipapi.co lookup fallback to USD:', err);
  }

  // Graceful fallback: default to USD
  return NextResponse.json({
    success: true,
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD' as SupportedCurrency,
    source: 'default',
  });
}
