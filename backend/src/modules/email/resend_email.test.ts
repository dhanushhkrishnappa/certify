import { describe, it, expect, vi } from "vitest";
import { EmailService } from "./email.service.js";
import { prisma } from "../../shared/prisma.js";

describe("Resend Transactional Email Service", () => {
  it("rejects invalid recipient email addresses", async () => {
    const result = await EmailService.sendTransactionalEmail({
      to: "not-an-email",
      subject: "Test",
      html: "<p>Hello</p>",
      idempotencyKey: "test-invalid-1",
      templateName: "TEST",
    });

    expect(result.delivered).toBe(false);
    expect(result.status).toBe("FAILED");
    expect(result.error).toContain("Invalid recipient email");
  });

  it("suppresses duplicate email dispatches via idempotencyKey", async () => {
    vi.spyOn(prisma.emailLog, "findUnique").mockResolvedValue({
      id: "log-1",
      recipient: "alice@certify.edu",
      template: "CERTIFICATE_ISSUED",
      idempotencyKey: "cert-issued:CERT-2026-PY-12345",
      status: "SENT",
      errorDetails: null,
      sentAt: new Date(),
    });

    const result = await EmailService.sendTransactionalEmail({
      to: "alice@certify.edu",
      subject: "Credential Awarded",
      html: "<p>Congrats</p>",
      idempotencyKey: "cert-issued:CERT-2026-PY-12345",
      templateName: "CERTIFICATE_ISSUED",
    });

    expect(result.delivered).toBe(true);
    expect(result.status).toBe("DUPLICATE");

    vi.restoreAllMocks();
  });

  it("fails closed when RESEND_API_KEY is not configured and records the failure", async () => {
    const origSmtpUser = process.env.SMTP_USER;
    const origSmtpPass = process.env.SMTP_PASS;
    const origResendKey = process.env.RESEND_API_KEY;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.RESEND_API_KEY;

    try {
      vi.spyOn(prisma.emailLog, "findUnique").mockResolvedValue(null);
      const upsertSpy = vi.spyOn(prisma.emailLog, "upsert").mockResolvedValue({} as any);

      const result = await EmailService.sendTransactionalEmail({
        to: "bob@certify.edu",
        subject: "Notice",
        html: "<p>Notice</p>",
        idempotencyKey: "notice-bob-1",
        templateName: "NOTICE",
      });

      expect(result.delivered).toBe(false);
      expect(result.status).toBe("BLOCKED");
      expect(result.error).toContain("Provider credentials not configured");
      expect(upsertSpy).toHaveBeenCalled();
    } finally {
      if (origSmtpUser !== undefined) process.env.SMTP_USER = origSmtpUser;
      if (origSmtpPass !== undefined) process.env.SMTP_PASS = origSmtpPass;
      if (origResendKey !== undefined) process.env.RESEND_API_KEY = origResendKey;
      vi.restoreAllMocks();
    }
  });
});
