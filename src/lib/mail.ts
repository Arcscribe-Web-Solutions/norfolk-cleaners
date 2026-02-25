/**
 * SMTP Email Client
 * -----------------
 * Optional — disabled by default. Set ENABLE_SMTP=true to activate.
 *
 * Uses Nodemailer for sending transactional emails (contact forms,
 * notifications, password resets, etc.).
 */

import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { requireFeature } from "./features";

const globalForMail = globalThis as unknown as {
  __mailTransport?: Transporter;
};

function createTransport(): Transporter {
  requireFeature("smtp");

  const options: SMTPTransport.Options = {
    host: process.env.SMTP_HOST ?? "smtp.example.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASSWORD ?? "",
    },
  };

  return nodemailer.createTransport(options);
}

/**
 * Returns a singleton Nodemailer transporter.
 */
export function getTransport(): Transporter {
  if (!globalForMail.__mailTransport) {
    globalForMail.__mailTransport = createTransport();
  }
  return globalForMail.__mailTransport;
}

/** Default "from" address built from env vars. */
function getDefaultFrom(): string {
  const name = process.env.SMTP_FROM_NAME ?? "Client Site";
  const email = process.env.SMTP_FROM_EMAIL ?? "noreply@example.com";
  return `"${name}" <${email}>`;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

/**
 * Send an email.
 *
 * @example
 * ```ts
 * await sendMail({
 *   to: "customer@example.com",
 *   subject: "Thank you for your enquiry",
 *   html: "<p>We'll be in touch shortly.</p>",
 * });
 * ```
 */
export async function sendMail(options: SendMailOptions) {
  const transport = getTransport();

  const result = await transport.sendMail({
    from: options.from ?? getDefaultFrom(),
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  });

  return result;
}

/**
 * Test the SMTP connection. Returns true if the server responds.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const transport = getTransport();
    await transport.verify();
    return true;
  } catch {
    return false;
  }
}
