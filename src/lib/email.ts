import { Resend } from 'resend';
import { isPlaceholderValue, isProduction, safeErrorForLog } from './env';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  providerStatus?: string;
  mocked?: boolean;
}

export interface VerificationEmailParams {
  to: string;
  fullName: string;
  verificationUrl: string;
}

export interface PasswordResetEmailParams {
  to: string;
  fullName: string;
  resetUrl: string;
}

// In-memory test mock store for automated testing without outbound HTTP calls
let testMockEnabled = process.env.NODE_ENV === 'test';
const testMockSentEmails: Array<{
  to: string;
  subject: string;
  template: 'verification' | 'password_reset';
  timestamp: Date;
}> = [];

export function setEmailTestMock(enabled: boolean): void {
  // The mock can never be enabled in a production process.
  testMockEnabled = enabled && process.env.NODE_ENV !== 'production';
}

export function getSentTestEmails() {
  return [...testMockSentEmails];
}

export function clearTestEmails() {
  testMockSentEmails.length = 0;
}

function getResendClient(): { resend: Resend | null; fromEmail: string; configError?: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const configuredFrom = process.env.EMAIL_FROM?.trim();
  const fromEmail = configuredFrom || (isProduction() ? '' : 'Code Nexus <onboarding@resend.dev>');

  if (!apiKey || isPlaceholderValue(apiKey) || !apiKey.startsWith('re_')) {
    return {
      resend: null,
      fromEmail,
      configError: 'RESEND_API_KEY is not configured with a real Resend API key.',
    };
  }

  if (!fromEmail || isPlaceholderValue(fromEmail)) {
    return {
      resend: null,
      fromEmail,
      configError: 'EMAIL_FROM must be configured with a verified sender identity.',
    };
  }

  if (isProduction() && /@resend\.dev>/i.test(fromEmail)) {
    return {
      resend: null,
      fromEmail,
      configError: 'EMAIL_FROM must use a verified production domain, not the Resend test sender.',
    };
  }

  return {
    resend: new Resend(apiKey),
    fromEmail,
  };
}

/**
 * Sends a transactional email via Resend HTTPS API.
 * Never logs secrets or full verification tokens to the console.
 */
async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailResult> {
  // Test mock check
  if (testMockEnabled) {
    testMockSentEmails.push({
      to,
      subject,
      template: subject.includes('Verify') ? 'verification' : 'password_reset',
      timestamp: new Date(),
    });
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      providerStatus: 'mocked_success',
      mocked: true,
    };
  }

  const { resend, fromEmail, configError } = getResendClient();

  if (!resend || configError) {
    // In development mode, explain how to set up Resend without crashing
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Email Service Warning] Cannot dispatch transactional email: ${configError}. Configure Resend in .env to enable real delivery.`
      );
    }
    return {
      success: false,
      error: configError || 'Resend client is unconfigured',
      providerStatus: 'unconfigured',
    };
  }

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text,
    });

    if (response.error) {
      console.error(
        `[Resend API Error] Provider rejected the request: ${safeErrorForLog(response.error.message)}`
      );
      return {
        success: false,
        error: 'Email provider rejected the request.',
        providerStatus: 'rejected',
      };
    }

    if (response.data?.id) {
      return {
        success: true,
        messageId: response.data.id,
        providerStatus: 'accepted_by_resend',
      };
    }

    return {
      success: false,
      error: 'Resend API returned an empty response.',
      providerStatus: 'unknown',
    };
  } catch (err: any) {
    console.error(
      `[Resend Network Exception] ${safeErrorForLog(err)}`
    );
    return {
      success: false,
      error: 'Network failure when contacting email provider.',
      providerStatus: 'network_failure',
    };
  }
}

/**
 * Builds HTML template for Code Nexus email verification
 */
function buildVerificationHtml(fullName: string, verificationUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Code Nexus Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #2563eb); border-radius: 12px; padding: 10px 18px; color: #ffffff; font-weight: 800; font-size: 20px; letter-spacing: -0.5px;">
                CODE NEXUS
              </div>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px;">Master Engineering. Build Systems. Earn Certifications.</p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #f8fafc; text-align: center;">Verify Your Email Address</h1>
            </td>
          </tr>

          <!-- Body Text -->
          <tr>
            <td style="padding-bottom: 24px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 12px;">Hello <strong>${escapeHtml(fullName)}</strong>,</p>
              <p style="margin: 0 0 16px;">Thank you for registering on <strong>Code Nexus</strong>. To activate your account, access our 10 language tracks, interactive compiler sandbox, and official certification exams, please verify your email address below:</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #2563eb); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
                Verify Email Address
              </a>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding-bottom: 20px; border-top: 1px solid #1e293b; padding-top: 20px; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px;">⏰ <strong>Security Notice:</strong> This verification link will expire in <strong>24 hours</strong> and can only be used once.</p>
              <p style="margin: 0 0 8px;">If the button above does not work, copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all; color: #38bdf8; font-family: monospace; font-size: 11px;">${verificationUrl}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px; color: #64748b; font-size: 11px; text-align: center;">
              <p style="margin: 0 0 4px;">If you did not create an account on Code Nexus, you can safely ignore this email.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Code Nexus. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds HTML template for Code Nexus password reset
 */
function buildPasswordResetHtml(fullName: string, resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Code Nexus Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #2563eb); border-radius: 12px; padding: 10px 18px; color: #ffffff; font-weight: 800; font-size: 20px; letter-spacing: -0.5px;">
                CODE NEXUS
              </div>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px;">Security & Account Protection</p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #f8fafc; text-align: center;">Reset Your Password</h1>
            </td>
          </tr>

          <!-- Body Text -->
          <tr>
            <td style="padding-bottom: 24px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 12px;">Hello <strong>${escapeHtml(fullName)}</strong>,</p>
              <p style="margin: 0 0 16px;">We received a request to reset the password for your Code Nexus account. Click the button below to choose a new password:</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #e11d48); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px rgba(244, 63, 94, 0.4);">
                Reset Password
              </a>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding-bottom: 20px; border-top: 1px solid #1e293b; padding-top: 20px; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px;">⏰ <strong>Security Notice:</strong> This reset link will expire in <strong>1 hour</strong> and can only be used once.</p>
              <p style="margin: 0 0 8px;">If the button above does not work, copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all; color: #f43f5e; font-family: monospace; font-size: 11px;">${resetUrl}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px; color: #64748b; font-size: 11px; text-align: center;">
              <p style="margin: 0 0 4px;">If you did not request a password reset, you can safely ignore this email. Your current password remains secure.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Code Nexus. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendVerificationEmail(params: VerificationEmailParams): Promise<EmailResult> {
  const subject = 'Verify your Code Nexus Account';
  const html = buildVerificationHtml(params.fullName, params.verificationUrl);
  const text = `Hello ${params.fullName},\n\nThank you for signing up for Code Nexus! Please verify your email address by visiting this link:\n\n${params.verificationUrl}\n\nThis verification link expires in 24 hours.\n\n— The Code Nexus Team`;

  return sendViaResend(params.to, subject, html, text);
}

export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<EmailResult> {
  const subject = 'Reset your Code Nexus Password';
  const html = buildPasswordResetHtml(params.fullName, params.resetUrl);
  const text = `Hello ${params.fullName},\n\nWe received a request to reset your Code Nexus password. Please reset your password by visiting this link:\n\n${params.resetUrl}\n\nThis link expires in 1 hour and can only be used once.\n\nIf you did not make this request, you can safely ignore this email.\n\n— The Code Nexus Team`;

  return sendViaResend(params.to, subject, html, text);
}
