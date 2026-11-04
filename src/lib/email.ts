import nodemailer from 'nodemailer';

interface SendPasswordResetParams {
  to: string;
  resetUrl: string;
  token: string;
  userName?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
  previewUrl?: string;
}

// Extract and normalize SMTP configuration
export function getEmailConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  
  const user =
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    process.env.EMAIL_USER ||
    process.env.EMAIL_FROM ||
    'neerajrekwar817@gmail.com';

  const rawPass =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.SMTP_KEY ||
    process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    '';

  // Google generates 16-character App Passwords with spaces (e.g. "abcd efgh ijkl mnop").
  // Stripping spaces ensures authentication passes without cryptic 535 errors.
  const pass = rawPass.trim().replace(/\s+/g, '');

  const from = process.env.SMTP_FROM || `Nedject Studio <${user}>`;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    isConfigured: Boolean(user && pass),
  };
}

export function isEmailConfigured(): boolean {
  return getEmailConfig().isConfigured;
}

/**
 * Creates a Nodemailer transporter instance optimized for Gmail and standard SMTP
 */
function createTransporter() {
  const config = getEmailConfig();

  if (!config.isConfigured) {
    return null;
  }

  const isGmail =
    config.host.toLowerCase().includes('gmail') ||
    config.user.toLowerCase().endsWith('@gmail.com') ||
    config.user.toLowerCase().endsWith('@googlemail.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 12000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 12000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

/**
 * Sends a password reset email to the user
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  token,
  userName,
}: SendPasswordResetParams): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const displayName = userName || 'Nedject User';

  // If SMTP is not yet configured, log reset link to terminal and return simulated success
  if (!config.isConfigured) {
    console.log('\n======================================================');
    console.log('[SMTP NOTICE] SMTP_KEY is not configured or detected yet.');
    console.log(`[PASSWORD RESET REQUEST] Recipient: ${to}`);
    console.log(`[PASSWORD RESET URL] ${resetUrl}`);
    console.log(`[RESET TOKEN] ${token}`);
    console.log('To deliver real Gmail emails, ensure SMTP_KEY is set in .env.local');
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      previewUrl: resetUrl,
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'Transporter initialization failed',
    };
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Nedject Password</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #0d0e12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 4px solid #000000; box-shadow: 8px 8px 0px #ccff00;">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 28px; background-color: #000000; border-bottom: 3px solid #ccff00;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #ccff00; text-transform: uppercase;">
                NEDJECT
              </div>
              <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #888888; letter-spacing: 1px; margin-top: 4px;">
                SECURITY &amp; IDENTITY AUTHENTICATION
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px 24px 28px;">
        <h1 style="font-size: 20px; font-weight: 900; margin: 0 0 16px 0; color: #000000; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">
          Password Reset Request
        </h1>

        <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 16px 0;">
          Hello <strong>${displayName}</strong>,
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 24px 0;">
          We received a request to reset the password for your Nedject account associated with <strong>${to}</strong>. Click the button below to choose a new secure password:
        </p>

        <!-- CTA Button -->
        <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center" style="background-color: #ccff00; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000;">
              <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: monospace; font-size: 14px; font-weight: 900; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                RESET PASSWORD NOW &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Link Fallback -->
        <p style="font-size: 12px; line-height: 1.6; color: #666666; margin: 24px 0 8px 0;">
          If the button above does not work, copy and paste this URL directly into your web browser:
        </p>
        <p style="font-size: 11px; word-break: break-all; background-color: #f4f4f5; border: 1px solid #d4d4d8; padding: 10px; font-family: monospace; color: #09090b; margin: 0 0 24px 0;">
          <a href="${resetUrl}" style="color: #000000; text-decoration: underline;">${resetUrl}</a>
        </p>

        <!-- Notice Box -->
        <div style="background-color: #fffbeb; border: 2px solid #f59e0b; padding: 14px; margin-top: 24px;">
          <p style="font-size: 12px; font-weight: 700; color: #92400e; margin: 0 0 4px 0; font-family: monospace;">
            IMPORTANT SECURITY DETAILS:
          </p>
          <ul style="font-size: 12px; color: #78350f; margin: 0; padding-left: 18px; line-height: 1.5;">
            <li>This link will expire automatically in <strong>1 hour</strong>.</li>
            <li>If you did not request this password reset, please ignore this email. Your account remains completely secure.</li>
            <li>Nedject staff will never ask for your password.</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 2px solid #e2e8f0; font-size: 11px; color: #64748b; font-family: monospace; text-align: center;">
        <div>&copy; ${new Date().getFullYear()} NEDJECT. ALL RIGHTS RESERVED.</div>
        <div style="margin-top: 4px;">High-performance QR &amp; Barcode Engineering Studio</div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const emailText = `
NEDJECT - PASSWORD RESET REQUEST
================================

Hello ${displayName},

We received a request to reset the password for your Nedject account associated with ${to}.

To reset your password, visit the following URL:
${resetUrl}

This link is valid for 1 hour.

If you did not request this change, you can safely ignore this email.

--
Nedject Studio
© ${new Date().getFullYear()} Nedject. All rights reserved.
`;

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject: 'Reset your Nedject account password',
      text: emailText,
      html: emailHtml,
    });

    console.log(`[SMTP SUCCESS] Password reset email sent to ${to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('[SMTP ERROR] Failed to send password reset email:', error);
    return {
      success: false,
      error: error?.message || 'Failed to dispatch email via SMTP',
      previewUrl: resetUrl,
    };
  }
}

export interface SendVerificationCodeParams {
  to: string;
  code: string;
  userName?: string;
  appUrl?: string;
}

/**
 * Generates a high-contrast, professional, responsive HTML email template for Nedject verification
 */
export function generateVerificationEmailHtml({
  to,
  code,
  userName,
  appUrl,
}: SendVerificationCodeParams): string {
  const displayName = userName?.trim() || 'Athlete User';
  const cleanCode = String(code).trim().padStart(6, '0').slice(0, 6);
  const digits = cleanCode.split('');
  const baseUrl = appUrl || process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const directVerifyUrl = `${baseUrl}/login?email=${encodeURIComponent(to)}`;

  // Generate 6 individual styled digit cells
  const digitCellsHtml = digits
    .map(
      (d) => `
      <td align="center" style="padding: 0 4px;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" width="46" height="56" style="width: 46px; height: 56px; background-color: #ffffff; border: 3px solid #000000; box-shadow: 3px 3px 0px #ccff00; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; color: #000000; line-height: 56px; text-align: center;">
              ${d}
            </td>
          </tr>
        </table>
      </td>`
    )
    .join('');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Your Nedject Verification Code: ${cleanCode}</title>
  <style type="text/css">
    /* Client-specific resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: #0b0c10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    /* Interactive styling */
    .cta-btn:hover {
      background-color: #000000 !important;
      color: #ccff00 !important;
    }
    
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .content-wrapper { padding: 24px 18px !important; }
      .digit-cell { width: 38px !important; height: 48px !important; font-size: 26px !important; line-height: 48px !important; }
      .brand-title { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #0b0c10; color: #111111;">
  <center style="width: 100%; background-color: #0b0c10;">
    
    <!-- Outer Email Wrapper -->
    <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      <tr>
        <td align="center">
          
          <!-- MAIN CARD WITH BRUTALIST BRAND SHADOW -->
          <table border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #ffffff; border: 4px solid #000000; box-shadow: 10px 10px 0px #ccff00;">
            
            <!-- BRAND HEADER -->
            <tr>
              <td style="background-color: #000000; padding: 24px 28px; border-bottom: 3px solid #ccff00;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td align="left" valign="middle">
                      <!-- NEDJECT LOGO BADGE -->
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="background-color: #000000; border: 2px solid #ccff00; padding: 6px 12px;">
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <!-- Mini QR Icon Graphic -->
                                <td style="padding-right: 8px;">
                                  <table border="0" cellspacing="0" cellpadding="0" style="background-color: #ccff00; width: 16px; height: 16px;">
                                    <tr>
                                      <td align="center" valign="middle">
                                        <div style="width: 6px; height: 6px; background-color: #000000;"></div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <!-- Logo Text -->
                                <td>
                                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 900; color: #ccff00; letter-spacing: 2px; text-transform: uppercase;">
                                    NEDJECT
                                  </span>
                                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 1px; margin-left: 6px; text-transform: uppercase;">
                                    // genQRstudio
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" valign="middle">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: 900; color: #000000; background-color: #ccff00; border: 1px solid #000000; padding: 3px 8px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                        VERIFIED 256-BIT
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- HERO NOTICE STRIP -->
            <tr>
              <td style="background-color: #f4f4ec; padding: 10px 28px; border-bottom: 2px solid #000000; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1px;">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border: 1px solid #000000; margin-right: 6px; vertical-align: middle;"></span>
                SECURITY GATEWAY &middot; MANDATORY INBOX CONFIRMATION
              </td>
            </tr>

            <!-- BODY CONTENT -->
            <tr>
              <td style="padding: 36px 32px 28px 32px;" class="content-wrapper">
                
                <h1 style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px 0;" class="brand-title">
                  VERIFY YOUR EMAIL ADDRESS
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #222222; margin: 0 0 16px 0;">
                  Hello <strong>${displayName}</strong>,
                </p>

                <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 24px 0;">
                  Thank you for creating an account on <strong>Nedject genQRstudio</strong>. To secure your account and prevent alias looping, enter the following 6-digit confirmation code:
                </p>

                <!-- 6-DIGIT CODE INTERACTIVE PRESENTATION -->
                <table border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #fafaf5; border: 3px solid #000000; box-shadow: 6px 6px 0px #000000; margin: 28px 0 24px 0;">
                  <tr>
                    <td align="center" style="padding: 24px 16px 20px 16px;">
                      
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 900; color: #555555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px;">
                        YOUR 6-DIGIT CONFIRMATION CODE
                      </div>

                      <!-- Individual Digit Boxes -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                          ${digitCellsHtml}
                        </tr>
                      </table>

                      <!-- Copyable Raw String Fallback -->
                      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #d4d4d8;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #555555; text-transform: uppercase; margin-right: 6px;">
                          Double-click or copy:
                        </span>
                        <code style="font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: 900; background-color: #ffffff; border: 1px solid #000000; padding: 3px 8px; color: #000000; letter-spacing: 2px;">
                          ${cleanCode}
                        </code>
                      </div>

                      <!-- Expiry Notice -->
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 900; color: #dc2626; margin-top: 12px; text-transform: uppercase;">
                        &#9200; CODE EXPIRES IN 15 MINUTES
                      </div>

                    </td>
                  </tr>
                </table>

                <!-- DIRECT ACTION CTA BUTTON -->
                <table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin: 24px 0;">
                  <tr>
                    <td align="center">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="background-color: #ccff00; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000;">
                            <a href="${directVerifyUrl}" target="_blank" class="cta-btn" style="display: inline-block; padding: 14px 32px; font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 900; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                              VERIFY &amp; ACTIVATE ACCOUNT &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- ACCOUNT & SECURITY ADVISORY BOX -->
                <table border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #fffde6; border: 2px solid #ca8a04; margin-top: 24px;">
                  <tr>
                    <td style="padding: 16px 18px;">
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 900; color: #854d0e; text-transform: uppercase; margin-bottom: 8px;">
                        &#9888; SECURITY &amp; USAGE POLICY:
                      </div>
                      <ul style="font-size: 12px; line-height: 1.6; color: #713f12; margin: 0; padding-left: 18px;">
                        <li>This code is strictly issued for <strong>${to}</strong>.</li>
                        <li><strong>Anti-Loop Policy:</strong> Nedject disallows email subaddressing (<code>+</code> aliases) to prevent duplicate accounts and credit abuse.</li>
                        <li>If you did not request this code, you can safely ignore this email. No account will be activated without entering this code.</li>
                        <li>Nedject engineers or staff will never request your code or password.</li>
                      </ul>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color: #000000; padding: 24px 28px; border-top: 3px solid #ccff00; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #a1a1aa; text-align: center;">
                <div style="color: #ccff00; font-weight: 900; font-size: 12px; letter-spacing: 1px; margin-bottom: 4px;">
                  NEDJECT // genQRstudio
                </div>
                <div style="color: #71717a; margin-bottom: 12px;">
                  High-Performance 300 DPI Barcode, QR Code &amp; Event Matrix Engine
                </div>
                <div style="color: #52525b; font-size: 10px; border-top: 1px solid #27272a; padding-top: 12px;">
                  &copy; ${new Date().getFullYear()} NEDJECT. ALL RIGHTS RESERVED. &middot; CONFIDENTIAL &middot; AUTOMATED TRANSMISSION
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </center>
</body>
</html>`;
}

/**
 * Sends a mandatory 6-digit email verification code to the user's inbox
 */
export async function sendVerificationCodeEmail({
  to,
  code,
  userName,
  appUrl,
}: SendVerificationCodeParams): Promise<SendEmailResult & { code?: string }> {
  const config = getEmailConfig();
  const displayName = userName || 'Nedject Athlete';

  const emailHtml = generateVerificationEmailHtml({
    to,
    code,
    userName: displayName,
    appUrl,
  });

  const emailText = `
NEDJECT // genQRstudio - MANDATORY EMAIL VERIFICATION
===================================================

Hello ${displayName},

Your 6-digit email verification code for ${to} is:

>>>  ${code}  <<<

This code is valid for 15 minutes. Enter it on the verification screen to activate your account.

Direct Verification Link:
${appUrl || process.env.APP_URL || 'http://localhost:3000'}/login?email=${encodeURIComponent(to)}

Security Policy:
- This code was generated for ${to}.
- Nedject prohibits email plus-sign aliases (+ subaddressing) to prevent duplicate loop exploits.
- If you did not request this verification, you can safely disregard this email.

--
Nedject Studio
© ${new Date().getFullYear()} Nedject. All rights reserved.
`;

  // If SMTP is not yet configured, log verification code prominently to terminal
  if (!config.isConfigured) {
    console.log('\n======================================================');
    console.log('   NEDJECT MANDATORY INBOX VERIFICATION DISPATCH');
    console.log('======================================================');
    console.log(`[RECIPIENT INBOX] : ${to}`);
    console.log(`[VERIFY 6-DIGIT CODE] : >>>  ${code}  <<<`);
    console.log(`[VALIDITY] : 15 Minutes`);
    console.log('To deliver real Gmail/SMTP emails, configure GMAIL_APP_PASSWORD in .env.local');
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      code,
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'Transporter initialization failed',
      code,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject: `[Nedject] Your 6-Digit Verification Code: ${code}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`[SMTP SUCCESS] Verification code sent to ${to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      code,
    };
  } catch (error: any) {
    console.error('[SMTP ERROR] Failed to send verification code email:', error);
    console.log('\n======================================================');
    console.log('   FALLBACK SIMULATION - VERIFICATION CODE DISPATCH');
    console.log(`[RECIPIENT INBOX] : ${to}`);
    console.log(`[VERIFY 6-DIGIT CODE] : >>>  ${code}  <<<`);
    console.log('======================================================\n');
    return {
      success: true,
      simulated: true,
      error: error?.message || 'SMTP delivery failed; fallback simulated',
      code,
    };
  }
}
