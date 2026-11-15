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

    // 3. Provider Check 1: Gmail SMTP (worker-mailer on Cloudflare Workers edge, nodemailer on Node)
    if (config.smtpUser && config.smtpPass) {
      const isNode = typeof process !== "undefined" && process.release?.name === "node";
      const smtpUser = config.smtpUser.trim();
      const smtpPass = config.smtpPass.replace(/\s+/g, "");
      const fromEmail = "support@certify.studio";
      const fromName = "Certify Security";

      if (!isNode) {
        // Cloudflare Workers Edge Environment: use cloudflare:sockets via worker-mailer
        try {
          const { WorkerMailer } = await import("worker-mailer");
          const mailer = await WorkerMailer.connect({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            credentials: {
              username: smtpUser,
              password: smtpPass,
            },
          });

          await mailer.send({
            from: { name: fromName, email: fromEmail },
            to,
            subject,
            html,
          });

          await mailer.close().catch(() => {});

          logger.info("[EmailService] Email dispatched via Gmail SMTP (worker-mailer) as " + fromEmail, {
            to,
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

          return { delivered: true, status: "SENT" };
        } catch (workerMailerErr: any) {
          logger.warn("[EmailService] worker-mailer Gmail SMTP error, falling back:", {
            error: workerMailerErr?.message,
            to,
            template: templateName,
          });
        }
      } else {
        // Node.js environment: use standard nodemailer
        const smtp = getSmtpTransporter();
        if (smtp) {
          try {
            const fromAddress = `"${fromName}" <${fromEmail}>`;
            const info = await smtp.sendMail({
              from: fromAddress,
              to,
              subject,
              html,
            });

            logger.info("[EmailService] Email dispatched via Gmail SMTP (Node.js) as " + fromEmail, {
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
            logger.warn("[EmailService] Gmail SMTP dispatch failed:", {
              error: smtpErr?.message,
              to,
              template: templateName,
            });
          }
        }
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
   * Generates and dispatches a clean, minimal 6-digit OTP verification email.
   */
  public static async sendOtpVerificationNotice(params: {
    recipientEmail: string;
    recipientName: string;
    otp: string;
  }): Promise<{ delivered: boolean; status: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #FFFFFF; color: #111827; text-align: left;">
        <div style="margin-bottom: 32px;">
          <img src="https://certify.studio/certify-logo.png" alt="Certify" width="124" style="width: 124px; height: auto; display: block; border: 0;" />
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0; letter-spacing: -0.2px;">Verify your email address</h1>
        <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin: 0 0 24px 0;">
          Hello <strong style="color: #111827;">${params.recipientName || "there"}</strong>,<br/>
          Use the 6-digit verification code below to confirm your email and continue setting up your account:
        </p>
        <div style="margin: 28px 0;">
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            ${params.otp}
          </div>
          <div style="font-size: 13px; color: #6B7280; margin-top: 8px;">
            This code will expire in 10 minutes.
          </div>
        </div>
        <p style="font-size: 13px; line-height: 20px; color: #6B7280; margin: 28px 0 0 0;">
          Do not share this code with anyone. If you did not request this verification, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; margin: 0; line-height: 18px;">
          Certify Security • Automated Notification<br/>
          <a href="mailto:support@certify.studio" style="color: #6B7280; text-decoration: none;">support@certify.studio</a>
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
   * Generates and dispatches a clean, minimal 6-digit password reset OTP email.
   */
  public static async sendPasswordResetOtp(params: {
    recipientEmail: string;
    recipientName: string;
    otp: string;
  }): Promise<{ delivered: boolean; status: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #FFFFFF; color: #111827; text-align: left;">
        <div style="margin-bottom: 32px;">
          <img src="https://certify.studio/certify-logo.png" alt="Certify" width="124" style="width: 124px; height: auto; display: block; border: 0;" />
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0; letter-spacing: -0.2px;">Reset your password</h1>
        <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin: 0 0 24px 0;">
          Hello <strong style="color: #111827;">${params.recipientName || "there"}</strong>,<br/>
          We received a request to reset your password for your Certify account. Use the 6-digit code below to set a new password:
        </p>
        <div style="margin: 28px 0;">
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            ${params.otp}
          </div>
          <div style="font-size: 13px; color: #6B7280; margin-top: 8px;">
            This code will expire in 10 minutes.
          </div>
        </div>
        <p style="font-size: 13px; line-height: 20px; color: #6B7280; margin: 28px 0 0 0;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; margin: 0; line-height: 18px;">
          Certify Security • Automated Notification<br/>
          <a href="mailto:support@certify.studio" style="color: #6B7280; text-decoration: none;">support@certify.studio</a>
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
   * Generates and dispatches a clean, minimal email address verification link.
   */
  public static async sendEmailVerificationNotice(params: {
    recipientEmail: string;
    recipientName: string;
    token: string;
    verificationUrl: string;
  }): Promise<{ delivered: boolean; status: string; error?: string }> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #FFFFFF; color: #111827; text-align: left;">
        <div style="margin-bottom: 32px;">
          <img src="https://certify.studio/certify-logo.png" alt="Certify" width="124" style="width: 124px; height: auto; display: block; border: 0;" />
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0; letter-spacing: -0.2px;">Verify your email address</h1>
        <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin: 0 0 24px 0;">
          Hello <strong style="color: #111827;">${params.recipientName || "there"}</strong>,<br/>
          Welcome to Certify. Please verify your email address to activate your account and start your Socratic learning track:
        </p>
        <div style="margin: 28px 0;">
          <a href="${params.verificationUrl}" style="background-color: #111827; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 13px; line-height: 20px; color: #6B7280; margin: 24px 0 0 0;">
          Or copy and paste this link into your browser:<br/>
          <a href="${params.verificationUrl}" style="color: #4B5563; word-break: break-all;">${params.verificationUrl}</a>
        </p>
        <p style="font-size: 13px; line-height: 20px; color: #6B7280; margin: 20px 0 0 0;">
          If you did not create an account with Certify, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; margin: 0; line-height: 18px;">
          Certify Security • Automated Notification<br/>
          <a href="mailto:support@certify.studio" style="color: #6B7280; text-decoration: none;">support@certify.studio</a>
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
    const verificationUrl = `https://certify.studio/verify/${params.credentialId}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #FFFFFF; color: #111827; text-align: left;">
        <div style="margin-bottom: 32px;">
          <img src="https://certify.studio/certify-logo.png" alt="Certify" width="124" style="width: 124px; height: auto; display: block; border: 0;" />
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0; letter-spacing: -0.2px;">Congratulations, ${params.recipientName}!</h1>
        <p style="font-size: 14px; line-height: 22px; color: #4B5563; margin: 0 0 24px 0;">
          You have successfully earned the <strong style="color: #111827;">${params.tier}</strong> credential for <strong style="color: #111827;">${params.courseTitle}</strong>.
        </p>
        <div style="margin: 24px 0;">
          <div style="font-size: 13px; color: #6B7280; margin-bottom: 4px;">Credential ID</div>
          <div style="font-size: 16px; font-weight: 600; color: #111827; font-family: monospace;">
            ${params.credentialId}
          </div>
        </div>
        <p style="font-size: 13px; line-height: 20px; color: #6B7280; margin: 0 0 24px 0;">
          This credential has been deterministically verified and cryptographically signed with RFC 8032 Ed25519.
        </p>
        <div style="margin: 28px 0;">
          <a href="${verificationUrl}" style="background-color: #111827; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; display: inline-block;">
            View Public Verification
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; margin: 0; line-height: 18px;">
          Certify Credentials • Automated Notification<br/>
          <a href="mailto:support@certify.studio" style="color: #6B7280; text-decoration: none;">support@certify.studio</a>
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
