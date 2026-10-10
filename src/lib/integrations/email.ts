import 'server-only';
import nodemailer from 'nodemailer';

export function emailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function transport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(to: string | string[], subject: string, text: string, replyTo?: string): Promise<void> {
  if (!emailConfigured()) throw new Error('not_configured');
  await transport().sendMail({ from: process.env.SMTP_FROM, to, subject, text, replyTo });
}

export function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}
