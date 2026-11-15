import crypto from "crypto";
import { logger } from "../../shared/logger.js";

// Type declaration for Cloudflare Workers runtime socket binding
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      SMTP_USER?: string;
      SMTP_PASS?: string;
    }
  }
}

export interface SmtpSendOptions {
  host?: string;
  port?: number;
  username: string;
  password: string;
  fromName?: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Native Cloudflare Workers SMTP client over cloudflare:sockets (Port 465 SSL/TLS).
 * Connects directly to smtp.gmail.com without third-party dependencies or node net polyfill bugs.
 */
export async function sendEmailViaCloudflareSockets(
  options: SmtpSendOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = options.host || "smtp.gmail.com";
  const port = options.port || 465;

  let cfSockets: any;
  try {
    const moduleName = "cloudflare:sockets";
    cfSockets = await import(moduleName);
  } catch (err: any) {
    return { success: false, error: "cloudflare:sockets module is unavailable in this runtime" };
  }

  if (!cfSockets || typeof cfSockets.connect !== "function") {
    return { success: false, error: "cloudflare:sockets.connect is not a function" };
  }

  logger.info("[CloudflareSMTP] Opening TLS connection to " + host + ":" + port);

  const socket = cfSockets.connect(
    { hostname: host, port },
    { secureTransport: "on", allowHalfOpen: false }
  );

  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");

  async function writeLine(line: string): Promise<void> {
    await writer.write(encoder.encode(line + "\r\n"));
  }

  async function readReply(expectedCode?: number): Promise<{ code: number; text: string }> {
    let buffer = "";
    const timeoutMs = 15000;

    while (true) {
      let timer: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout reading from SMTP server (${timeoutMs}ms)`)), timeoutMs);
      });

      const { value, done } = await Promise.race([reader.read(), timeoutPromise]).finally(() => clearTimeout(timer));
      if (done) throw new Error("SMTP connection closed unexpectedly by server");

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split(/\r?\n/);
      let lastLine = "";
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().length > 0) {
          lastLine = lines[i];
          break;
        }
      }

      if (/^\d{3} /.test(lastLine)) {
        const code = parseInt(lastLine.slice(0, 3), 10);
        if (expectedCode && code !== expectedCode) {
          throw new Error(`SMTP Error [Expected ${expectedCode}, got ${code}]: ${buffer.trim()}`);
        }
        return { code, text: buffer };
      }
    }
  }

  try {
    // 1. Greet (expect 220)
    await readReply(220);

    // 2. EHLO
    await writeLine("EHLO certify.studio");
    await readReply(250);

    // 3. AUTH LOGIN
    await writeLine("AUTH LOGIN");
    await readReply(334);

    // 4. Send Base64 Username
    const userB64 = Buffer.from(options.username.trim()).toString("base64");
    await writeLine(userB64);
    await readReply(334);

    // 5. Send Base64 Password
    const passB64 = Buffer.from(options.password.replace(/\s+/g, "")).toString("base64");
    await writeLine(passB64);
    await readReply(235); // 235 Accepted

    // 6. MAIL FROM
    // Use the authenticated Google account in envelope MAIL FROM
    await writeLine(`MAIL FROM:<${options.username.trim()}>`);
    await readReply(250);

    // 7. RCPT TO
    await writeLine(`RCPT TO:<${options.to.trim()}>`);
    await readReply(250);

    // 8. DATA
    await writeLine("DATA");
    await readReply(354);

    // 9. Send Headers and Base64 Encoded HTML Body
    const messageId = `<${crypto.randomUUID()}@certify.studio>`;
    const fromHeader = options.fromName
      ? `"${options.fromName}" <${options.fromEmail}>`
      : options.fromEmail;

    const subjectB64 = Buffer.from(options.subject, "utf-8").toString("base64");
    const htmlB64 = Buffer.from(options.html, "utf-8").toString("base64");
    const htmlChunks = htmlB64.match(/.{1,76}/g)?.join("\r\n") || htmlB64;

    const mimeMessage = [
      `From: ${fromHeader}`,
      `To: <${options.to.trim()}>`,
      `Reply-To: <${options.fromEmail}>`,
      `Subject: =?UTF-8?B?${subjectB64}?=`,
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      htmlChunks,
      `.`,
    ].join("\r\n");

    await writeLine(mimeMessage);
    await readReply(250); // 250 2.0.0 OK

    // 10. QUIT
    await writeLine("QUIT").catch(() => {});
    try {
      reader.releaseLock();
      writer.releaseLock();
      await socket.close().catch(() => {});
    } catch {}

    logger.info("[CloudflareSMTP] Email successfully dispatched via Gmail SMTP:465", {
      to: options.to,
      from: options.fromEmail,
      messageId,
    });

    return { success: true, messageId };
  } catch (err: any) {
    logger.error("[CloudflareSMTP] SMTP transmission error:", {
      error: err?.message,
      to: options.to,
    });
    try {
      reader.releaseLock();
      writer.releaseLock();
      await socket.close().catch(() => {});
    } catch {}
    return { success: false, error: err?.message || String(err) };
  }
}
