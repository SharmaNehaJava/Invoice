import { emailConfig, emailStatus, toHttpError } from "../server/email.js";

// GET /api/email-status?id=...   latest tracking event for one email
// GET /api/email-status          whether real sending is configured
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }
  const id = new URL(req.url, "http://localhost").searchParams.get("id");
  try {
    return res.status(200).json(id ? await emailStatus(id) : emailConfig());
  } catch (error) {
    const { status, body } = toHttpError(error);
    return res.status(status).json(body);
  }
}
