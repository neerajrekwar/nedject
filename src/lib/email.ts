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
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.EMAIL_FROM ||
    'neerajrekwar817@gmail.com';

  const pass =
    process.env.SMTP_KEY ||
    process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    '';

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
 * Creates a Nodemailer transporter instance
 */
function createTransporter() {
  const config = getEmailConfig();

  if (!config.isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
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

interface SendVerificationCodeParams {
  to: string;
  code: string;
  userName?: string;
}

/**
 * Sends a mandatory 6-digit email verification code to the user's inbox
 */
export async function sendVerificationCodeEmail({
  to,
  code,
  userName,
}: SendVerificationCodeParams): Promise<SendEmailResult & { code?: string }> {
  const config = getEmailConfig();
  const displayName = userName || 'Nedject Athlete';

  // If SMTP is not yet configured, log verification code prominently to terminal
  if (!config.isConfigured) {
    console.log('\n======================================================');
    console.log('   NEDJECT MANDATORY INBOX VERIFICATION DISPATCH');
    console.log('======================================================');
    console.log(`[RECIPIENT INBOX] : ${to}`);
    console.log(`[VERIFY 6-DIGIT CODE] : >>>  ${code}  <<<`);
    console.log(`[VALIDITY] : 15 Minutes`);
    console.log('To deliver real Gmail/SMTP emails, configure SMTP_KEY in .env.local');
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

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Nedject Verification Code</title>
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
                IDENTITY &amp; ACCOUNT VERIFICATION GATEWAY
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px 24px 28px;">
        <div style="display: inline-block; background-color: #ccff00; color: #000000; border: 2px solid #000000; padding: 4px 10px; font-family: monospace; font-size: 11px; font-weight: 900; letter-spacing: 1px; margin-bottom: 16px; text-transform: uppercase;">
          MANDATORY INBOX VERIFICATION
        </div>

        <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 16px 0; color: #000000; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">
          Verify Your Email Address
        </h1>

        <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 16px 0;">
          Hello <strong>${displayName}</strong>,
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 24px 0;">
          To complete your account registration and prevent duplicate loops, enter the following 6-digit verification code on the verification screen:
        </p>

        <!-- 6-Digit Code Display Box -->
        <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0; width: 100%;">
          <tr>
            <td align="center" style="background-color: #fafaf5; border: 3px solid #000000; box-shadow: 6px 6px 0px #000000; padding: 24px 16px;">
              <div style="font-family: monospace; font-size: 11px; font-weight: 900; color: #666666; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                YOUR 6-DIGIT VERIFICATION CODE
              </div>
              <div style="font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #000000; padding-left: 10px;">
                ${code}
              </div>
              <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #dc2626; margin-top: 10px;">
                &#9200; EXPIRES IN 15 MINUTES
              </div>
            </td>
          </tr>
        </table>

        <!-- Security Details Box -->
        <div style="background-color: #fefce8; border: 2px solid #ca8a04; padding: 14px; margin-top: 24px;">
          <p style="font-size: 12px; font-weight: 900; color: #854d0e; margin: 0 0 6px 0; font-family: monospace;">
            SECURITY POLICY &amp; RULES:
          </p>
          <ul style="font-size: 12px; color: #713f12; margin: 0; padding-left: 18px; line-height: 1.5;">
            <li>This verification code is strictly intended for <strong>${to}</strong>.</li>
            <li>Nedject accounts enforce strict single-identity verification without alias loops.</li>
            <li>Never share this code with anyone. Staff will never ask for your verification code.</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 2px solid #e2e8f0; font-size: 11px; color: #64748b; font-family: monospace; text-align: center;">
        <div>&copy; ${new Date().getFullYear()} NEDJECT // GENQRSTUDIO. ALL RIGHTS RESERVED.</div>
        <div style="margin-top: 4px;">High-performance Identity &amp; QR Barcode Engineering Studio</div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const emailText = `
NEDJECT - MANDATORY EMAIL VERIFICATION
======================================

Hello ${displayName},

Your 6-digit email verification code for ${to} is:

>>>  ${code}  <<<

This code is valid for 15 minutes. Enter it on the verification screen to activate your account.

If you did not request this verification code, please ignore this email.

--
Nedject Studio
© ${new Date().getFullYear()} Nedject. All rights reserved.
`;

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject: `Your Nedject Verification Code: ${code}`,
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
