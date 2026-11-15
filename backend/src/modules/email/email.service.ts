import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../../config/index.js";
import { prisma } from "../../shared/prisma.js";
import { logger } from "../../shared/logger.js";

let resendClient: Resend | null = null;
let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter | null {
  if (smtpTransporter) return smtpTransporter;
  if (config.smtpUser && config.smtpPass) {
    smtpTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.smtpUser.trim(),
        pass: config.smtpPass.replace(/\s+/g, ""), // remove any spaces in 16-char app password
      },
    });
    return smtpTransporter;
  }
  return null;
}

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  if (config.resendApiKey) {
    resendClient = new Resend(config.resendApiKey);
    return resendClient;
  }
  return null;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
  templateName: string;
}

export class EmailService {
  /**
   * Dispatches a transactional email with deduplication and error handling.
   * Fails safely and returns delivery status.
   */
  public static async sendTransactionalEmail(options: SendEmailOptions): Promise<{
    delivered: boolean;
    status: "SENT" | "BLOCKED" | "FAILED" | "DUPLICATE";
    messageId?: string;
    error?: string;
  }> {
    const { to, subject, html, idempotencyKey, templateName } = options;

    // 1. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return { delivered: false, status: "FAILED", error: "Invalid recipient email address" };
    }

    // 2. Idempotency Check: Prevent duplicate notifications
    const existingLog = await prisma.emailLog.findUnique({
      where: { idempotencyKey },
    });

    if (existingLog && existingLog.status === "SENT") {
      logger.info("Duplicate email notification suppressed by idempotency key", { idempotencyKey, to });
      return { delivered: true, status: "DUPLICATE" };
    }

    // 3. Provider Check 1: Gmail SMTP (Dedicated provider for all OTP and auth verifications)
    const isAuthEmail =
      templateName === "OTP_VERIFICATION" ||
      templateName === "PASSWORD_RESET" ||
      templateName === "EMAIL_VERIFICATION";

    const smtp = getSmtpTransporter();
    if (smtp) {
      try {
        const senderUser = config.smtpUser.trim() || "certify.auth@gmail.com";
        const fromAddress = `"Certify Security" <${senderUser}>`;
        const info = await smtp.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });

        logger.info("[EmailService] Email dispatched successfully via Gmail SMTP (certify.auth@gmail.com)", {
          to,
          messageId: info.messageId,
          template: templateName,
        });

        await prisma.emailLog.upsert({
          where: { idempotencyKey },
          create: {
            recipient: to,
            template: templateName,
            idempotencyKey,
            status: "SENT",
          },
          update: {
            status: "SENT",
            errorDetails: null,
          },
        });

        return { delivered: true, status: "SENT", messageId: info.messageId };
      } catch (smtpErr: any) {
        logger.warn("[EmailService] Gmail SMTP dispatch failed, attempting Resend fallback:", {
          error: smtpErr?.message,
          to,
          template: templateName,
        });
        // Fall through to Resend HTTP API
      }
    }

    // 4. Provider Check 2: Resend (Only used for non-OTP transactional notifications if configured)
    const client = getResendClient();
    if (!client) {
      if (config.nodeEnv === "production") {
        logger.error("Production email delivery blocked: Neither SMTP nor RESEND_API_KEY is configured", { to, templateName });
      }
      // Record failure/blocked in database
      await prisma.emailLog.upsert({
        where: { idempotencyKey },
        create: {
          recipient: to,
          template: templateName,
          idempotencyKey,
          status: "FAILED",
          errorDetails: "No email provider configured (Set SMTP_USER/SMTP_PASS)",
        },
        update: {
          status: "FAILED",
          errorDetails: "No email provider configured (Set SMTP_USER/SMTP_PASS)",
        },
      });

      return {
        delivered: false,
        status: "BLOCKED",
        error: "Email delivery blocked: Provider credentials not configured",
      };
    }

    // 5. Send Email via Resend
    try {
      let fromAddress = config.emailFrom || "Certify <onboarding@resend.dev>";
      let response = await client.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      });

      // Automatic fallback to onboarding@resend.dev if custom domain is not yet verified on Resend
      if (
        response.error &&
        fromAddress !== "Certify <onboarding@resend.dev>" &&
        (response.error as any).message?.toLowerCase().includes("domain")
      ) {
        logger.info("Custom domain unverified on Resend. Falling back to sandbox sender onboarding@resend.dev", { to });
        fromAddress = "Certify <onboarding@resend.dev>";
        response = await client.emails.send({
          from: fromAddress,
          to,
          subject,
          html,
        });
      }

      if (response.error) {
        logger.error("Resend provider rejected email dispatch", { error: response.error, to });
        await prisma.emailLog.upsert({
          where: { idempotencyKey },
          create: {
            recipient: to,
            template: templateName,
            idempotencyKey,
            status: "FAILED",
            errorDetails: JSON.stringify(response.error),
          },
          update: {
            status: "FAILED",
            errorDetails: JSON.stringify(response.error),
          },
        });
        return { delivered: false, status: "FAILED", error: response.error.message };
      }

      await prisma.emailLog.upsert({
        where: { idempotencyKey },
        create: {
          recipient: to,
          template: templateName,
          idempotencyKey,
          status: "SENT",
        },
        update: {
          status: "SENT",
          errorDetails: null,
        },
      });

      return { delivered: true, status: "SENT", messageId: response.data?.id };
    } catch (err: any) {
      logger.error("Resend delivery exception", { errorMessage: err?.message, to });
      await prisma.emailLog.upsert({
        where: { idempotencyKey },
        create: {
          recipient: to,
          template: templateName,
          idempotencyKey,
          status: "FAILED",
          errorDetails: err?.message,
        },
        update: {
          status: "FAILED",
          errorDetails: err?.message,
        },
      });
      return { delivered: false, status: "FAILED", error: err?.message };
    }
  }

  /**
   * Generates and dispatches an authentic 6-digit OTP verification email.
   */
  public static async sendOtpVerificationNotice(params: {
    recipientEmail: string;
    recipientName: string;
    otp: string;
  }): Promise<{ delivered: boolean; status: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 36px 32px; background: #0C0C10; color: #FEF5E5; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: left;">
        <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">CERTIFY</span>
          <span style="font-size: 11px; color: #CEA4F2; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; background: rgba(206,164,242,0.12); padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(206,164,242,0.25);">One-Time Passcode</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0; letter-spacing: -0.5px;">Verify your email address</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #A1A1AA; margin: 0 0 24px 0;">
          Hello <strong style="color: #FFFFFF;">${params.recipientName || "Learner"}</strong>,<br/>
          Use the 6-digit verification code below to confirm your email and continue setting up your Socratic learning profile.
        </p>
        <div style="margin: 28px 0; padding: 22px; background: #14131B; border-radius: 14px; border: 1px solid rgba(206,164,242,0.3); text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A1A1AA; margin-bottom: 8px;">6-Digit Verification Code</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #CEA4F2; padding-left: 10px;">
            ${params.otp}
          </div>
          <div style="font-size: 11px; color: #71717A; margin-top: 8px;">Valid for 10 minutes</div>
        </div>
        <div style="margin: 20px 0; padding: 14px 16px; background: rgba(206,164,242,0.06); border-radius: 10px; border-left: 3px solid #CEA4F2;">
          <p style="font-size: 12px; color: #D4D4D8; margin: 0; line-height: 1.5;">
            <strong style="color: #FFFFFF;">Official Verification Notice:</strong> This code was dispatched directly from our official mailer (<strong>certify.auth@gmail.com</strong>). Please enter this 6-digit code in the Certify verification prompt to activate your account.
          </p>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #71717A; margin: 0 0 20px 0;">
          Do not share this code with anyone. Certify will never ask for your code outside of the official verification prompt.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
        <p style="font-size: 11px; color: #52525B; margin: 0;">
          If you did not initiate this request, you can safely ignore this email.
        </p>
      </div>
    `;

    return await this.sendTransactionalEmail({
      to: params.recipientEmail,
      subject: `Your Certify Verification Code: ${params.otp}`,
      html,
      idempotencyKey: `otp-verify:${params.recipientEmail}:${params.otp}`,
      templateName: "OTP_VERIFICATION",
    });
  }

  /**
   * Generates and dispatches an authentic 6-digit password reset OTP email.
   */
  public static async sendPasswordResetOtp(params: {
    recipientEmail: string;
    recipientName: string;
    otp: string;
  }): Promise<{ delivered: boolean; status: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 36px 32px; background: #0C0C10; color: #FEF5E5; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: left;">
        <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">CERTIFY</span>
          <span style="font-size: 11px; color: #F59E0B; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; background: rgba(245,158,11,0.12); padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(245,158,11,0.25);">Password Reset</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0; letter-spacing: -0.5px;">Reset your password</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #A1A1AA; margin: 0 0 24px 0;">
          Hello <strong style="color: #FFFFFF;">${params.recipientName || "Learner"}</strong>,<br/>
          We received a request to reset your password for your Certify account. Use the 6-digit code below to set a new password:
        </p>
        <div style="margin: 28px 0; padding: 22px; background: #14131B; border-radius: 14px; border: 1px solid rgba(245,158,11,0.3); text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A1A1AA; margin-bottom: 8px;">6-Digit Reset Code</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #F59E0B; padding-left: 10px;">
            ${params.otp}
          </div>
          <div style="font-size: 11px; color: #71717A; margin-top: 8px;">Valid for 10 minutes</div>
        </div>
        <div style="margin: 20px 0; padding: 14px 16px; background: rgba(245,158,11,0.08); border-radius: 10px; border-left: 3px solid #F59E0B;">
          <p style="font-size: 12px; color: #D4D4D8; margin: 0; line-height: 1.5;">
            <strong style="color: #FFFFFF;">Official Security Notice:</strong> This password reset code was dispatched directly from our official mailer (<strong>certify.auth@gmail.com</strong>). Certify staff will never ask for this code. If you did not request this, you may safely ignore this message.
          </p>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #71717A; margin: 0 0 20px 0;">
          If you did not request this password reset, please ignore this email or ensure your account is secure.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
        <p style="font-size: 11px; color: #52525B; margin: 0;">
          Certify Security Team • Automated Notification
        </p>
      </div>
    `;

    return await this.sendTransactionalEmail({
      to: params.recipientEmail,
      subject: `Reset Your Certify Password: ${params.otp}`,
      html,
      idempotencyKey: `pwd-reset:${params.recipientEmail}:${params.otp}`,
      templateName: "PASSWORD_RESET",
    });
  }

  /**
   * Generates and dispatches an email address verification link / code.
   */
  public static async sendEmailVerificationNotice(params: {
    recipientEmail: string;
    recipientName: string;
    token: string;
    verificationUrl: string;
  }): Promise<{ delivered: boolean; status: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background: #0E0E13; color: #FEF5E5; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">CERTIFY</span>
          <span style="font-size: 11px; margin-left: 8px; color: #10B981; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Account Verification</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin-top: 0;">Verify your email address</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #A1A1AA;">
          Hello ${params.recipientName || "Learner"},<br/>
          Welcome to Certify. To protect academic integrity and enable verified cryptographic credential issuance, please verify your email address.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${params.verificationUrl}" style="background-color: #7C3AED; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 12px; line-height: 1.5; color: #71717A;">
          Or paste this verification link into your browser:<br/>
          <a href="${params.verificationUrl}" style="color: #A78BFA; word-break: break-all;">${params.verificationUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 28px 0;" />
        <p style="font-size: 11px; color: #52525B; margin: 0;">
          If you did not create a Certify account, you can safely ignore this email.
        </p>
      </div>
    `;

    return await this.sendTransactionalEmail({
      to: params.recipientEmail,
      subject: "Verify your email address — Certify",
      html,
      idempotencyKey: `email-verify:${params.recipientEmail}:${params.token}`,
      templateName: "EMAIL_VERIFICATION",
    });
  }

  /**
   * Generates and dispatches a credential issuance notification.
   */
  public static async sendCertificateIssuedNotice(params: {
    recipientEmail: string;
    recipientName: string;
    courseTitle: string;
    credentialId: string;
    tier: string;
  }): Promise<void> {
    const verificationUrl = `https://certify.pages.dev/verify/${params.credentialId}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0d9488;">Congratulations, ${params.recipientName}!</h2>
        <p>You have earned the <strong>${params.tier}</strong> credential for <strong>${params.courseTitle}</strong>.</p>
        <p>Your credential ID is: <code>${params.credentialId}</code></p>
        <p>This credential has been deterministically verified and cryptographically signed with RFC 8032 Ed25519.</p>
        <p style="margin-top: 24px;">
          <a href="${verificationUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Public Verification
          </a>
        </p>
      </div>
    `;

    await this.sendTransactionalEmail({
      to: params.recipientEmail,
      subject: `Credential Awarded: ${params.courseTitle} (${params.tier})`,
      html,
      idempotencyKey: `cert-issued:${params.credentialId}`,
      templateName: "CERTIFICATE_ISSUED",
    });
  }
}
