/**
 * Email Security & Normalization Utility
 * 
 * Prevents account looping and subaddressing alias abuse:
 * - Detects and blocks email plus-addressing (e.g. user+tag@domain.com, example+yo@gmail.com)
 * - Computes canonical root email representations to block dot-trick loops (e.g. j.o.h.n@gmail.com vs john@gmail.com)
 */

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  normalizedEmail: string;
  canonicalEmail: string;
}

/**
 * Checks if an email contains plus-addressing subaddress aliases (e.g. name+tag@domain.com)
 */
export function hasEmailPlusSubaddress(rawEmail: string): boolean {
  if (!rawEmail || typeof rawEmail !== 'string') return false;
  const parts = rawEmail.trim().split('@');
  if (parts.length !== 2) return false;
  return parts[0].includes('+');
}

/**
 * Strictly validates an email address for registration and login.
 * Prohibits '+' subaddressing loops and returns canonical representation.
 */
export function validateEmailForAuth(rawEmail: string): EmailValidationResult {
  const email = (rawEmail || '').trim().toLowerCase();

  if (!email) {
    return {
      valid: false,
      error: 'Email address is required.',
      normalizedEmail: '',
      canonicalEmail: '',
    };
  }

  // Basic RFC 5322 email syntax validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email) || !email.includes('@')) {
    return {
      valid: false,
      error: 'Please enter a valid email address (e.g. name@domain.com).',
      normalizedEmail: email,
      canonicalEmail: '',
    };
  }

  const [localPart, domainPart] = email.split('@');

  if (!localPart || !domainPart || !domainPart.includes('.')) {
    return {
      valid: false,
      error: 'Please enter a valid email address with a domain.',
      normalizedEmail: email,
      canonicalEmail: '',
    };
  }

  // 1. STRICT ENFORCEMENT: Disallow '+' plus-sign subaddressing
  // Examples blocked: example+yo@gmail.com, user+1@outlook.com, tester+free@domain.com
  if (localPart.includes('+')) {
    return {
      valid: false,
      error: 'Email aliases with a plus sign (+) (e.g. example+tag@gmail.com) are not allowed. Please enter your primary email address without "+" symbols.',
      normalizedEmail: email,
      canonicalEmail: '',
    };
  }

  // 2. Canonicalization (Dot-trick and domain normalization for Google/Gmail/Outlook)
  let canonicalLocal = localPart;
  let canonicalDomain = domainPart;

  if (domainPart === 'gmail.com' || domainPart === 'googlemail.com') {
    // Gmail ignores dots in the local-part (j.o.h.n == john)
    canonicalLocal = canonicalLocal.replace(/\./g, '');
    canonicalDomain = 'gmail.com';
  } else if (domainPart === 'google.com') {
    canonicalLocal = canonicalLocal.replace(/\./g, '');
  } else if (domainPart === 'outlook.com' || domainPart === 'hotmail.com') {
    canonicalDomain = 'outlook.com';
  }

  const canonicalEmail = `${canonicalLocal}@${canonicalDomain}`;

  return {
    valid: true,
    normalizedEmail: email,
    canonicalEmail,
  };
}

/**
 * Returns the canonical email identity to prevent duplicate accounts
 */
export function getCanonicalEmail(rawEmail: string): string {
  const result = validateEmailForAuth(rawEmail);
  return result.canonicalEmail || (rawEmail || '').trim().toLowerCase();
}

/**
 * Generates a cryptographically random 6-digit numeric verification code
 */
export function generateVerificationCode(): string {
  // Generates 6 digits between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
}
