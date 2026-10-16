// Email sending and tracking through Resend (https://resend.com).
// Shared by the Vercel functions in /api and the Vite dev server.
//
// Environment:
//   RESEND_API_KEY  API key. Without it the app runs in demo mode: nothing
//                   is sent and delivery/open events are simulated.
//   EMAIL_FROM      Verified sender, e.g. "CC Equipment <quotes@yourdomain.com>".

const RESEND_URL = "https://api.resend.com/emails";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

class EmailError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const list = (value) => (Array.isArray(value) ? value : value ? [value] : []).map((v) => String(v).trim()).filter(Boolean);

function validate(payload) {
  const to = list(payload.to);
  const cc = list(payload.cc);
  const recipients = [...to, ...cc];
  if (!to.length) throw new EmailError("Add at least one recipient.");
  if (recipients.length > MAX_RECIPIENTS) throw new EmailError(`Send to at most ${MAX_RECIPIENTS} people at once.`);
  const bad = recipients.find((r) => !EMAIL_RE.test(r));
  if (bad) throw new EmailError(`"${bad}" isn't a valid email address.`);
  if (!String(payload.subject || "").trim()) throw new EmailError("Add a subject.");
  if (!String(payload.html || payload.text || "").trim()) throw new EmailError("The message is empty.");

  const attachments = (payload.attachments || []).map((a) => ({
    filename: String(a.filename || "attachment.pdf"),
    content: String(a.content || ""),
  }));
  const size = attachments.reduce((total, a) => total + (a.content.length * 3) / 4, 0);
  if (size > MAX_ATTACHMENT_BYTES) throw new EmailError("Attachments are too large.");

  return {
    to,
    cc,
    replyTo: list(payload.replyTo),
    subject: String(payload.subject).trim(),
    html: payload.html ? String(payload.html) : undefined,
    text: payload.text ? String(payload.text) : undefined,
    attachments,
  };
}

export async function sendEmail(payload, env = process.env) {
  const email = validate(payload || {});

  if (!env.RESEND_API_KEY) {
    return { id: `demo-${Date.now().toString(36)}`, demo: true, sentAt: new Date().toISOString() };
  }
  if (!env.EMAIL_FROM) throw new EmailError("EMAIL_FROM is not configured on the server.", 500);

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: email.to,
      cc: email.cc.length ? email.cc : undefined,
      reply_to: email.replyTo.length ? email.replyTo : undefined,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: email.attachments.length ? email.attachments : undefined,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new EmailError(data.message || "The email service rejected the message.", 502);
  return { id: data.id, demo: false, sentAt: new Date().toISOString() };
}

// Demo emails move through the usual stages on a timer so tracking can be shown.
function demoStatus(id) {
  const sentMs = parseInt(id.replace("demo-", ""), 36);
  const age = Date.now() - sentMs;
  const status = age > 90_000 ? "opened" : age > 15_000 ? "delivered" : "sent";
  return { id, status, demo: true, checkedAt: new Date().toISOString() };
}

export async function emailStatus(id, env = process.env) {
  if (!id || !/^[\w-]+$/.test(id)) throw new EmailError("Unknown email id.");
  if (id.startsWith("demo-")) return demoStatus(id);
  if (!env.RESEND_API_KEY) throw new EmailError("Email service is not configured.", 500);

  const response = await fetch(`${RESEND_URL}/${id}`, {
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new EmailError(data.message || "Couldn't check the email status.", 502);
  // Resend reports the latest event: sent, delivered, opened, clicked, bounced, complained...
  return { id, status: data.last_event || "sent", demo: false, checkedAt: new Date().toISOString() };
}

export function emailConfig(env = process.env) {
  return { live: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM) };
}

// Turns any thrown error into an HTTP status and a safe message.
export function toHttpError(error) {
  if (error instanceof EmailError) return { status: error.status, body: { error: error.message } };
  return { status: 500, body: { error: "Something went wrong sending the email." } };
}
