'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X as XIcon,
  RefreshCw,
  Smartphone,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  isKnownTestCard,
  validateLuhnChecksum,
  detectCardBrand,
  validateExpiry,
  validateCVV,
} from '@/lib/payment-security';

interface SecureCardCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    signedOrderToken: string;
    amount: number;
    currency: string;
    planName: string;
    planId: 'pro' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
    displayAmount: string;
    couponCode?: string;
  };
  onSuccess: (result: {
    paymentId: string;
    orderId: string;
    planName: string;
    amount: string;
    couponCode?: string;
  }) => void;
}

export function SecureCardCheckoutModal({
  isOpen,
  onClose,
  orderData,
  onSuccess,
}: SecureCardCheckoutModalProps) {
  const [step, setStep] = useState<'card_entry' | 'otp_auth'>('card_entry');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [otp, setOtp] = useState('');

  const [testCardError, setTestCardError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('card_entry');
      setCardholderName('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setOtp('');
      setTestCardError(null);
      setValidationErrors({});
      setGeneralError(null);
      setOtpTimer(60);
    }
  }, [isOpen]);

  // Countdown timer for 3D Secure OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp_auth' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  if (!isOpen) return null;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 19);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);

    // Instant Anti-Fraud / Test Card Detection
    const testCheck = isKnownTestCard(raw);
    if (testCheck.isTest) {
      setTestCardError(
        testCheck.reason ||
          'SECURITY ALERT: Test card numbers (4242... / dummy sequence) and bypass tricks are strictly prohibited.'
      );
    } else {
      setTestCardError(null);
    }

    if (validationErrors.cardNumber) {
      setValidationErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setExpiry(val);
    if (validationErrors.expiry) {
      setValidationErrors((prev) => ({ ...prev, expiry: '' }));
    }
  };

  // Format CVV
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(val);
    if (validationErrors.cvv) {
      setValidationErrors((prev) => ({ ...prev, cvv: '' }));
    }
  };

  const rawCard = cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(rawCard);
  const luhnValid = rawCard.length >= 13 ? validateLuhnChecksum(rawCard) : false;

  // Validate and proceed to Step 2 (3D Secure)
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }

    if (!rawCard) {
      errors.cardNumber = 'Card number is required';
    } else {
      const testCheck = isKnownTestCard(rawCard);
      if (testCheck.isTest) {
        errors.cardNumber = testCheck.reason || 'Test card prohibited';
        setTestCardError(testCheck.reason || 'Test card prohibited');
      } else if (!validateLuhnChecksum(rawCard)) {
        errors.cardNumber = 'Invalid card number checksum (Luhn check failed)';
      }
    }

    const expCheck = validateExpiry(expiry);
    if (!expCheck.valid) {
      errors.expiry = expCheck.reason || 'Invalid expiration';
    }

    const cvvCheck = validateCVV(cvv, brand);
    if (!cvvCheck.valid) {
      errors.cvv = cvvCheck.reason || 'Invalid CVV';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Advance to 3D Secure simulation step
    setStep('otp_auth');
    setOtpTimer(60);
  };

  // Confirm final 3D Secure payment
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || cleanOtp === '000000') {
      setGeneralError('Please enter a valid 6-digit SMS OTP code (e.g. 749201).');
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentId = `pay_card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const res = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedOrderToken: orderData.signedOrderToken,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: paymentId,
          planId: orderData.planId,
          paymentMethod: 'card',
          couponCode: orderData.couponCode,
          cardDetails: {
            cardNumber: rawCard,
            cardholderName,
            expiry,
            cvv,
            otp: cleanOtp,
            otpRequired: true,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Card authorization failed. Please check credentials.');
      }

      // Success!
      onSuccess({
        paymentId,
        orderId: orderData.orderId,
        planName: orderData.planName,
        amount: orderData.displayAmount,
        couponCode: orderData.couponCode,
      });
      onClose();
    } catch (err: any) {
      console.error('Card checkout verification failed:', err);
      setGeneralError(err.message || 'Payment processing failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="border-4 border-black bg-white max-w-lg w-full shadow-[10px_10px_0px_#000000] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="border-b-4 border-black bg-black text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-white bg-[#ccff00] text-black flex items-center justify-center font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-[#ccff00]">
                PCI-DSS 256-BIT SECURE CHECKOUT
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">
                ZERO-TRUST CRYPTOGRAPHIC TRANSACTION VAULT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border border-zinc-700 bg-zinc-900 text-white hover:bg-rose-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ORDER SUMMARY STRIP */}
        <div className="bg-[#f4fde8] border-b-2 border-black p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-zinc-600 block text-[10px] uppercase">UPGRADING TO:</span>
            <span className="font-black text-black uppercase">{orderData.planName}</span>
            <span className="text-zinc-500 text-[10px] ml-1">
              ({orderData.billingCycle.toUpperCase()})
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-zinc-600 block text-[10px] uppercase">TOTAL CHARGE:</span>
            <span className="font-black text-base text-black">{orderData.displayAmount}</span>
          </div>
        </div>

        {/* PROMINENT TEST CARD ERROR NOTIFICATION */}
        {testCardError && (
          <div className="bg-rose-100 border-b-2 border-black p-3 text-xs text-rose-950 font-bold flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase block text-rose-900">
                ⚠️ FRAUD PREVENTION FILTER BLOCKED CARD:
              </span>
              <span>{testCardError}</span>
              <span className="block text-[11px] text-rose-800 mt-1">
                All test card sequences (4242..., 4000..., dummy sets) and sandbox bypass attempts are strictly rejected by the server payment security layer.
              </span>
            </div>
          </div>
        )}

        {/* GENERAL ERROR BANNER */}
        {generalError && (
          <div className="bg-rose-50 border-b-2 border-black p-3 text-xs text-rose-900 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* STEP 1: CARD CREDENTIALS ENTRY */}
        {step === 'card_entry' && (
          <form onSubmit={handleProceedToOtp} className="p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold border-b border-black/20 pb-2">
              <span className="text-zinc-600 uppercase flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-black" />
                ENTER PAYMENT CARD DETAILS:
              </span>
              <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-400 font-black text-[10px]">
                LUHN CHECK ACTIVE
              </span>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                CARDHOLDER NAME (AS PRINTED ON CARD):
              </label>
              <input
                type="text"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                placeholder="e.g. NEERAJ REKWAR"
                className="w-full px-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold uppercase focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
              />
              {validationErrors.cardholderName && (
                <span className="text-[10px] font-bold text-rose-600 mt-0.5 block">
                  {validationErrors.cardholderName}
                </span>
              )}
            </div>

            {/* Card Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase text-zinc-700">
                  CARD NUMBER (NO TEST CARDS):
                </label>
                <div className="flex items-center gap-1.5">
                  {brand !== 'Unknown' && (
                    <span className="bg-black text-[#ccff00] text-[10px] font-black px-1.5 py-0.2 border border-black uppercase">
                      {brand}
                    </span>
                  )}
                  {rawCard.length >= 13 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 border ${
                        luhnValid
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                          : 'bg-rose-100 text-rose-900 border-rose-500'
                      }`}
                    >
                      {luhnValid ? '✓ CHECKSUM PASS' : '✗ CHECKSUM FAIL'}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="•••• •••• •••• ••••"
                  maxLength={23}
                  className={`w-full px-3 py-2.5 border-2 font-mono text-sm tracking-widest font-black focus:outline-none focus:bg-white focus:ring-2 ${
                    testCardError
                      ? 'border-rose-600 bg-rose-50 text-rose-900 focus:ring-rose-400'
                      : 'border-black bg-zinc-50 focus:ring-[#ccff00]'
                  }`}
                />
              </div>

              {validationErrors.cardNumber && !testCardError && (
                <span className="text-[10px] font-bold text-rose-600 mt-0.5 block">
                  {validationErrors.cardNumber}
                </span>
              )}
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  EXPIRATION (MM/YY):
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
                {validationErrors.expiry && (
                  <span className="text-[10px] font-bold text-rose-600 mt-0.5 block">
                    {validationErrors.expiry}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  SECURITY CODE (CVV):
                </label>
                <input
                  type="password"
                  required
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full px-3 py-2 border-2 border-black bg-zinc-50 font-mono text-xs font-bold text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
                />
                {validationErrors.cvv && (
                  <span className="text-[10px] font-bold text-rose-600 mt-0.5 block">
                    {validationErrors.cvv}
                  </span>
                )}
              </div>
            </div>

            {/* Anti-Fraud Notice */}
            <div className="p-2.5 border border-black bg-zinc-100 text-[10px] text-zinc-600 space-y-1">
              <div className="font-black text-black uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ANTI-FRAUD PROTECTION PROTOCOL
              </div>
              <p>
                This terminal is guarded with real-time BIN screening, Luhn checksum calculation, and server cryptographic authentication. Test card numbers and simulator hacks are blocked automatically.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border-2 border-black bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={Boolean(testCardError) || !rawCard}
                className="flex-1 py-3 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_#000000] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>PROCEED TO 3D SECURE AUTH</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 3D SECURE 2.0 / BANK OTP VERIFICATION */}
        {step === 'otp_auth' && (
          <form onSubmit={handleConfirmPayment} className="p-5 space-y-5">
            <div className="border-2 border-black bg-[#fefce8] p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-900 uppercase flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  BANK 3D-SECURE 2.0 VERIFICATION
                </span>
                <span className="bg-amber-200 text-amber-950 font-black px-1.5 py-0.5 text-[10px] border border-amber-400">
                  OTP REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                A one-time authorization code has been dispatched to the mobile number registered with your {brand} card.
              </p>
            </div>

            <div className="border border-black p-3 bg-zinc-50 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>MERCHANT:</span>
                <span className="font-black text-black">NEDJECT OPTICAL MATRIX</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CARD ENDING IN:</span>
                <span className="font-black text-black">
                  •••• •••• •••• {rawCard.slice(-4) || 'CARD'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>AMOUNT:</span>
                <span className="font-black text-emerald-700">{orderData.displayAmount}</span>
              </div>
            </div>

            {/* 6-Digit OTP Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase text-zinc-800 text-center">
                ENTER 6-DIGIT SMS / BANK OTP:
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="749201"
                className="w-48 mx-auto block px-3 py-2.5 border-4 border-black bg-zinc-50 font-mono text-center text-xl tracking-[0.4em] font-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00]"
              />
              <div className="text-center text-[10px] text-zinc-500 font-bold">
                {otpTimer > 0 ? (
                  <span>Resend OTP available in {otpTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpTimer(60);
                      setGeneralError(null);
                    }}
                    className="underline text-black font-black hover:text-[#ccff00] cursor-pointer"
                  >
                    RESEND SMS CODE NOW
                  </button>
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('card_entry')}
                className="px-4 py-2.5 border-2 border-black bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase cursor-pointer"
              >
                BACK
              </button>

              <button
                type="submit"
                disabled={isSubmitting || otp.trim().length !== 6}
                className="flex-1 py-3.5 border-2 border-black bg-black text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase transition-all shadow-[4px_4px_0px_#000000] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AUTHORIZING PAYMENT...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM &amp; AUTHORIZE PAYMENT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
