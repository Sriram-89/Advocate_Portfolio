/**
 * lib/notify.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Advocate notification on new appointment booking.
 *
 * Strategy (in order):
 *   1. WhatsApp Business Cloud API  — if WHATSAPP_API_TOKEN + WHATSAPP_PHONE_ID set
 *   2. SMTP email (Nodemailer)      — if SMTP_HOST + SMTP_USER + SMTP_PASS set
 *   3. Console log only             — if neither is configured (dev/fallback)
 *
 * CRITICAL: This function NEVER throws. A notification failure must never
 * prevent the appointment from being saved in Firestore.
 *
 * ── WhatsApp Cloud API setup ─────────────────────────────────────────────────
 * 1. Create a Meta Developer account: https://developers.facebook.com
 * 2. Create a Business App → Add "WhatsApp" product
 * 3. Go to WhatsApp → API Setup → copy the temporary or permanent access token
 *    → set as WHATSAPP_API_TOKEN
 * 4. Copy the Phone Number ID → set as WHATSAPP_PHONE_ID
 * 5. Set WHATSAPP_RECIPIENT_NUMBER = advocate's WhatsApp number (with country code, no +)
 *    e.g. 919876543210
 * 6. In production, create a Message Template named "appointment_alert" in
 *    Meta Business Manager and get it approved. For testing, use the sandbox
 *    number provided by Meta and the pre-approved "hello_world" template,
 *    or send to your own number which you have opted-in on the test sandbox.
 *
 * ── Email (SMTP) setup ───────────────────────────────────────────────────────
 * Works with Gmail, Outlook, or any SMTP provider.
 * Gmail: use an App Password (not your main password):
 *   Google Account → Security → 2-Step Verification → App passwords
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587  SMTP_USER=you@gmail.com  SMTP_PASS=app_password
 * ─────────────────────────────────────────────────────────────────────────────
 */

import nodemailer from 'nodemailer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppointmentDetails {
  appointmentId: string;
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  caseType: string;
}

interface NotifyResult {
  channel: 'whatsapp' | 'email' | 'none';
  success: boolean;
  error?: string;
}

// ─── Message builders ─────────────────────────────────────────────────────────

/**
 * Plain-text message body used for both WhatsApp and email.
 * Keeping it concise so it fits cleanly in a WhatsApp notification.
 */
function buildMessageText(a: AppointmentDetails): string {
  return [
    '🔔 *New Appointment Request*',
    '',
    `📋 *ID:* ${a.appointmentId.slice(0, 10)}`,
    `👤 *Client:* ${a.name}`,
    `📱 *Mobile:* ${a.phone}`,
    `✉️ *Email:* ${a.email || 'Not provided'}`,
    `⚖️ *Case Type:* ${a.caseType}`,
    `📅 *Date:* ${a.preferredDate}`,
    `🕐 *Time:* ${a.preferredTime}`,
    '',
    'Please log in to the admin dashboard to confirm or follow up.',
  ].join('\n');
}

/** HTML version used for email only */
function buildEmailHtml(a: AppointmentDetails): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:#666;white-space:nowrap;font-weight:600;width:140px">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#111;font-weight:500">${value || '—'}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#fff;border:1px solid #e5e7eb">
    <!-- Header -->
    <div style="background:#111111;padding:24px 28px;border-bottom:2px solid #D4AF37">
      <div style="color:#D4AF37;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:4px">Legal Consultation</div>
      <div style="color:#ffffff;font-size:20px;font-weight:700;font-family:Georgia,serif">New Appointment Request</div>
    </div>
    <!-- Body -->
    <div style="padding:24px 28px">
      <p style="margin:0 0 20px;font-size:13px;color:#555;line-height:1.6">
        A new appointment request has been submitted. Details are below.
      </p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb">
        ${row('Appointment ID', a.appointmentId.slice(0, 12))}
        ${row('Client Name', a.name)}
        ${row('Mobile Number', a.phone)}
        ${row('Email Address', a.email)}
        ${row('Case Type', a.caseType)}
        ${row('Preferred Date', a.preferredDate)}
        ${row('Preferred Time', a.preferredTime)}
      </table>
    </div>
    <!-- CTA -->
    <div style="padding:0 28px 28px">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/dashboard"
         style="display:inline-block;background:#D4AF37;color:#111;padding:10px 24px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;margin-top:8px">
        Open Admin Dashboard →
      </a>
    </div>
    <!-- Footer -->
    <div style="background:#f9f9f9;border-top:1px solid #e5e7eb;padding:16px 28px">
      <p style="margin:0;font-size:11px;color:#999;line-height:1.6">
        This is an automated notification. Do not reply to this email.<br>
        Manage appointments at your admin dashboard.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── WhatsApp Cloud API ───────────────────────────────────────────────────────

async function sendWhatsApp(
  appt: AppointmentDetails
): Promise<{ success: boolean; error?: string }> {
  const token     = process.env.WHATSAPP_API_TOKEN;
  const phoneId   = process.env.WHATSAPP_PHONE_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER; // advocate's number

  if (!token || !phoneId || !recipient) {
    return { success: false, error: 'WhatsApp env vars not configured' };
  }

  const messageText = buildMessageText(appt);

  /*
   * We use the "text" message type for simplicity — works immediately in the
   * Meta test sandbox without needing a pre-approved template.
   *
   * For production with real users: switch to a "template" message type with
   * an approved template name. See Meta docs:
   * https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
   */
  const payload = {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'text',
    text: { body: messageText },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return {
        success: false,
        error: `WhatsApp API ${res.status}: ${errBody.slice(0, 200)}`,
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Email (SMTP / Nodemailer) ────────────────────────────────────────────────

async function sendEmail(
  appt: AppointmentDetails
): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to   = process.env.NOTIFY_EMAIL || process.env.SMTP_USER; // defaults to sender

  if (!host || !user || !pass) {
    return { success: false, error: 'SMTP env vars not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true', // true for port 465
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Legal Consultation" <${user}>`,
      to,
      subject: `📋 New Appointment: ${appt.name} — ${appt.caseType} (${appt.preferredDate})`,
      text: buildMessageText(appt).replace(/\*/g, ''), // plain text strips markdown
      html: buildEmailHtml(appt),
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Call this after successfully saving an appointment to Firestore.
 * Tries WhatsApp first, falls back to email, never throws.
 */
export async function sendAppointmentNotification(
  appt: AppointmentDetails
): Promise<NotifyResult> {
  // ── Attempt 1: WhatsApp ────────────────────────────────────────────────────
  const whatsappConfigured =
    !!(process.env.WHATSAPP_API_TOKEN &&
       process.env.WHATSAPP_PHONE_ID &&
       process.env.WHATSAPP_RECIPIENT_NUMBER);

  if (whatsappConfigured) {
    const result = await sendWhatsApp(appt);
    if (result.success) {
      console.info(`[notify] WhatsApp sent for appointment ${appt.appointmentId}`);
      return { channel: 'whatsapp', success: true };
    }
    // Log WhatsApp failure but continue to email fallback
    console.warn(`[notify] WhatsApp failed: ${result.error} — trying email fallback`);
  }

  // ── Attempt 2: Email ───────────────────────────────────────────────────────
  const emailConfigured =
    !!(process.env.SMTP_HOST &&
       process.env.SMTP_USER &&
       process.env.SMTP_PASS);

  if (emailConfigured) {
    const result = await sendEmail(appt);
    if (result.success) {
      console.info(`[notify] Email sent for appointment ${appt.appointmentId}`);
      return { channel: 'email', success: true };
    }
    console.warn(`[notify] Email failed: ${result.error}`);
    return { channel: 'email', success: false, error: result.error };
  }

  // ── No channel configured ──────────────────────────────────────────────────
  console.info(
    `[notify] No notification channel configured. Appointment ${appt.appointmentId} saved to Firestore only.\n` +
    `  → Set WHATSAPP_API_TOKEN + WHATSAPP_PHONE_ID + WHATSAPP_RECIPIENT_NUMBER for WhatsApp\n` +
    `  → Set SMTP_HOST + SMTP_USER + SMTP_PASS for email`
  );
  return { channel: 'none', success: false, error: 'No notification channel configured' };
}
