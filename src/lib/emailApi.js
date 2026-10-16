// Talks to the /api email functions (see server/email.js).

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The email couldn't be sent.");
  return data;
}

export const sendEmail = (payload) =>
  request("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const fetchEmailStatus = (id) => request(`/api/email-status?id=${encodeURIComponent(id)}`);

export const fetchEmailConfig = () => request("/api/email-status");

// Tracking stages, in order. Anything after "sent" means the provider saw it.
export const EMAIL_STATUSES = {
  sent: { label: "Sent", tone: "neutral", rank: 1 },
  delivered: { label: "Delivered", tone: "info", rank: 2 },
  opened: { label: "Opened", tone: "success", rank: 3 },
  clicked: { label: "Clicked", tone: "success", rank: 4 },
  bounced: { label: "Bounced", tone: "error", rank: 5 },
  complained: { label: "Marked as spam", tone: "error", rank: 5 },
  delivery_delayed: { label: "Delayed", tone: "warning", rank: 1 },
};

export const isFinalStatus = (status) => ["clicked", "bounced", "complained"].includes(status);

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Simple branded HTML wrapper. `preformatted` keeps column alignment for cost sheets.
export function emailHtml({ message, company, rep, preformatted = "" }) {
  const body = escapeHtml(message).replace(/\n/g, "<br>");
  const pre = preformatted
    ? `<pre style="font:13px/1.5 Menlo,Consolas,monospace;background:#f7f8fa;border:1px solid #e3e6eb;border-radius:8px;padding:12px;white-space:pre-wrap">${escapeHtml(preformatted)}</pre>`
    : "";
  const signature = [rep.name, company.name, rep.phone, rep.email].filter(Boolean).map(escapeHtml).join("<br>");
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111827">
<div style="max-width:600px;margin:0 auto;background:#ffffff">
<div style="height:4px;background:#f0b44d"></div>
<div style="padding:24px">
<p style="margin:0 0 16px;font-size:18px;font-weight:bold">${escapeHtml(company.name || "")}</p>
<div style="font-size:14px;line-height:1.6">${body}</div>
${pre}
<p style="margin:24px 0 0;font-size:13px;color:#6b7280">${signature}</p>
</div></div></body></html>`;
}
