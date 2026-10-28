/**
 * Utility for persisting and retrieving intended payment / paid-feature destinations
 * across authentication redirects via secure cookies and query params.
 */

export const AUTH_REDIRECT_COOKIE = 'auth_redirect_destination';

/**
 * Get intended destination from client-side cookies
 */
export function getClientRedirectDestination(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + AUTH_REDIRECT_COOKIE.replace(/[-.\\]/g, '\\$&') + '=([^;]*)')
  );
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Store intended destination into a secure cookie for 30 minutes
 */
export function setClientRedirectDestination(destination: string) {
  if (typeof document === 'undefined' || !destination) return;
  const encoded = encodeURIComponent(destination);
  const isHttps = window.location.protocol === 'https:';
  const secureFlag = isHttps ? '; Secure' : '';
  // 1800 seconds = 30 minutes
  document.cookie = `${AUTH_REDIRECT_COOKIE}=${encoded}; path=/; max-age=1800; SameSite=Lax${secureFlag}`;
}

/**
 * Clear the destination cookie after successful login & redirect
 */
export function clearClientRedirectDestination() {
  if (typeof document === 'undefined') return;
  const isHttps = window.location.protocol === 'https:';
  const secureFlag = isHttps ? '; Secure' : '';
  document.cookie = `${AUTH_REDIRECT_COOKIE}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
}
