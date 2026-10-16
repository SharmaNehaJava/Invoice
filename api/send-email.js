import { sendEmail, toHttpError } from "../server/email.js";

// POST /api/send-email  { to, cc, replyTo, subject, html, text, attachments }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  try {
    return res.status(200).json(await sendEmail(req.body));
  } catch (error) {
    const { status, body } = toHttpError(error);
    return res.status(status).json(body);
  }
}
