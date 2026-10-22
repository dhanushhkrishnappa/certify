import { Resend } from "resend";
import { config } from "../../config/index.js";
import { prisma } from "../../shared/prisma.js";
import { logger } from "../../shared/logger.js";

let resendClient: Resend | null = null;

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

    // 3. Provider Availability Check
    const client = getResendClient();
    if (!client) {
      if (config.nodeEnv === "production") {
        logger.error("Production email delivery blocked: RESEND_API_KEY is not configured", { to, templateName });
      }
      // Record failure/blocked in database
      await prisma.emailLog.upsert({
        where: { idempotencyKey },
        create: {
          recipient: to,
          template: templateName,
          idempotencyKey,
          status: "FAILED",
          errorDetails: "RESEND_API_KEY not configured",
        },
        update: {
          status: "FAILED",
          errorDetails: "RESEND_API_KEY not configured",
        },
      });

      return {
        delivered: false,
        status: "BLOCKED",
        error: "Email delivery blocked: Provider credentials not configured",
      };
    }

    // 4. Send Email via Resend
    try {
      const response = await client.emails.send({
        from: config.emailFrom || "Certify Platform <security@certify.edu>",
        to,
        subject,
        html,
      });

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
