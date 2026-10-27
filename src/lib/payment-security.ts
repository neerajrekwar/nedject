import crypto from 'crypto';

/**
 * Payment Security & Anti-Fraud Engine
 * Protects against test cards, carding attacks, replay attacks, price tampering, and mock bypasses.
 */

// Known Test Card Prefixes and Full Numbers (Stripe, Razorpay, Braintree, Visa/MC/Amex test sets)
const TEST_CARD_PATTERNS: RegExp[] = [
  // Stripe Test Cards
  /^4242[0-9]{12}$/, // 4242 4242 4242 4242
  /^400000[0-9]{10}$/, // 4000 0000 0000 0002 / 0001
  /^411111[0-9]{10}$/, // 4111 1111 1111 1111
  /^555555[0-9]{10}$/, // 5555 5555 5555 4444
  /^378282[0-9]{9}$/,  // 3782 8224 6310 005 (Amex test)
  /^371449[0-9]{9}$/,  // 3714 4963 5398 431
  /^601111[0-9]{10}$/, // Discover test
  /^305693[0-9]{8}$/,  // Diners Club test
  /^356600[0-9]{10}$/, // JCB test
  /^510510[0-9]{10}$/, // Mastercard test
  /^520082[0-9]{10}$/, // Mastercard test
  /^510000[0-9]{10}$/, // Mastercard test

  // Razorpay Test Cards
  /^401288[0-9]{10}$/, // Razorpay test Visa
  /^512345[0-9]{10}$/, // Razorpay test MC
  /^524242[0-9]{10}$/, // Razorpay test MC
  /^438100[0-9]{10}$/, // Razorpay test
  /^455673[0-9]{10}$/, // Razorpay test
  /^4000000000000000$/,

  // Repeating dummy sequences
  /^(\d)\1{14,18}$/, // e.g. 1111111111111111, 0000000000000000
  /^12345678[0-9]{8}$/,
  /^12341234[0-9]{8}$/,
  /^98765432[0-9]{8}$/,
];

const KNOWN_TEST_BINS = [
  '424242',
  '400000',
  '411111',
  '555555',
  '378282',
  '371449',
  '601111',
  '401288',
  '512345',
  '524242',
  '438100',
  '455673',
  '510510',
  '510000',
];

/**
 * Validates a card number using the Luhn Algorithm (Mod-10 Checksum).
 */
export function validateLuhnChecksum(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Checks if a card number is a known test card or contains simulated bypass patterns.
 */
export function isKnownTestCard(cardNumber: string): { isTest: boolean; reason?: string } {
  const sanitized = cardNumber.replace(/\D/g, '');

  if (!sanitized) {
    return { isTest: false };
  }

  // 1. Check known test BINs
  for (const bin of KNOWN_TEST_BINS) {
    if (sanitized.startsWith(bin)) {
      return {
        isTest: true,
        reason: `Known test card BIN (${bin}...) detected. Real payment credentials required.`,
      };
    }
  }

  // 2. Check test card regex patterns
  for (const pattern of TEST_CARD_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        isTest: true,
        reason: 'Known test card or simulation sequence detected. Test cards are blocked.',
      };
    }
  }

  // 3. Check for obvious sequential patterns
  if (
    sanitized.includes('123456789') ||
    sanitized.includes('987654321') ||
    sanitized.startsWith('0000') ||
    sanitized.startsWith('1111')
  ) {
    return {
      isTest: true,
      reason: 'Invalid sequential test pattern detected. Please enter a valid card.',
    };
  }

  return { isTest: false };
}

/**
 * Detects card brand based on BIN ranges.
 */
export function detectCardBrand(cardNumber: string): 'Visa' | 'Mastercard' | 'American Express' | 'RuPay' | 'Discover' | 'Unknown' {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (!sanitized) return 'Unknown';

  if (/^4/.test(sanitized)) {
    return 'Visa';
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(sanitized)) {
    return 'Mastercard';
  }
  if (/^3[47]/.test(sanitized)) {
    return 'American Express';
  }
  if (/^(60|6521|6522)/.test(sanitized)) {
    return 'RuPay';
  }
  if (/^6(011|5|4[4-9])/.test(sanitized)) {
    return 'Discover';
  }

  return 'Unknown';
}

/**
 * Validates expiration date (MM/YY or MM/YYYY).
 */
export function validateExpiry(expiryStr: string): { valid: boolean; reason?: string } {
  const cleaned = expiryStr.trim();
  const match = cleaned.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) {
    return { valid: false, reason: 'Invalid format. Use MM/YY' };
  }

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return { valid: false, reason: 'Invalid month (01-12 required)' };
  }

  if (year < 100) {
    year += 2000;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, reason: 'Card has expired' };
  }

  if (year > currentYear + 20) {
    return { valid: false, reason: 'Expiration date too far in the future' };
  }

  return { valid: true };
}

/**
 * Validates CVV.
 */
export function validateCVV(cvv: string, cardBrand: string = 'Visa'): { valid: boolean; reason?: string } {
  const clean = cvv.trim();
  const requiredLen = cardBrand === 'American Express' ? 4 : 3;

  if (!/^\d+$/.test(clean)) {
    return { valid: false, reason: 'CVV must contain numbers only' };
  }

  if (clean.length !== requiredLen) {
    return { valid: false, reason: `CVV must be ${requiredLen} digits` };
  }

  // Reject dummy test CVVs
  if (clean === '000' || clean === '123' || clean === '999') {
    return { valid: false, reason: 'Dummy test CVV detected' };
  }

  return { valid: true };
}

/**
 * Cryptographic Server-Side Order Signing
 * Binds orderId, planId, billingCycle, amount, currency, and email into an HMAC signature.
 */
const SERVER_HMAC_SECRET =
  process.env.PAYMENT_HMAC_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'nedject_optical_matrix_secure_payment_vault_salt_2026';

export interface OrderSignaturePayload {
  orderId: string;
  planId: string;
  billingCycle: string;
  amount: number;
  currency: string;
  userEmail: string;
  expiresAt: number; // Unix timestamp
  couponCode?: string;
}

export function generateSignedOrderToken(payload: OrderSignaturePayload): string {
  const rawData = [
    payload.orderId,
    payload.planId,
    payload.billingCycle,
    payload.amount,
    payload.currency,
    payload.userEmail.toLowerCase().trim(),
    payload.expiresAt,
    payload.couponCode || 'NONE',
  ].join(':');

  const hmac = crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(rawData).digest('hex');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${base64Payload}.${hmac}`;
}

export function verifySignedOrderToken(
  token: string,
  expectedOrderId: string,
  expectedPlanId: string,
  expectedEmail?: string
): { valid: boolean; payload?: OrderSignaturePayload; reason?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, reason: 'Missing cryptographic order token' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Malformed order security token' };
    }

    const [base64Payload, providedHmac] = parts;
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr) as OrderSignaturePayload;

    // Verify token expiry
    if (Date.now() > payload.expiresAt) {
      return { valid: false, reason: 'Payment order token expired. Please re-initiate.' };
    }

    // Verify orderId matches
    if (payload.orderId !== expectedOrderId) {
      return { valid: false, reason: 'Order ID mismatch in cryptographic token' };
    }

    // Verify plan matches
    if (payload.planId !== expectedPlanId) {
      return { valid: false, reason: 'Plan mismatch in cryptographic token' };
    }

    // Verify email if provided
    if (expectedEmail && payload.userEmail && payload.userEmail.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()) {
      return { valid: false, reason: 'User identity mismatch in cryptographic token' };
    }

    // Recalculate HMAC
    const rawData = [
      payload.orderId,
      payload.planId,
      payload.billingCycle,
      payload.amount,
      payload.currency,
      payload.userEmail.toLowerCase().trim(),
      payload.expiresAt,
      payload.couponCode || 'NONE',
    ].join(':');

    const expectedHmac = crypto.createHmac('sha256', SERVER_HMAC_SECRET).update(rawData).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedHmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );

    if (!isValid) {
      return { valid: false, reason: 'Tampered order signature detected' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, reason: `Token verification error: ${err.message}` };
  }
}

/**
 * Idempotency & Replay Attack Protection
 * Ensures a payment ID cannot be redeemed or reused multiple times.
 */
const processedPayments = new Map<string, { timestamp: number; plan: string; email: string }>();

export function checkAndRecordPaymentIdempotency(
  paymentId: string,
  plan: string,
  email: string
): { isDuplicate: boolean; reason?: string } {
  if (!paymentId) {
    return { isDuplicate: true, reason: 'Missing payment ID' };
  }

  // Clean old entries older than 24 hours
  const now = Date.now();
  for (const [id, entry] of processedPayments.entries()) {
    if (now - entry.timestamp > 86400000) {
      processedPayments.delete(id);
    }
  }

  if (processedPayments.has(paymentId)) {
    return {
      isDuplicate: true,
      reason: 'This payment transaction ID has already been redeemed and processed.',
    };
  }

  processedPayments.set(paymentId, { timestamp: now, plan, email });
  return { isDuplicate: false };
}

/**
 * In-Memory Rate Limiting for Payment Initiation & Card Testing
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkPaymentRateLimit(key: string, limit: number = 8, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
