export function verifyWebhookAuth(req) {
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) return true;

  const auth  = req.headers["authorization"] || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === secret;
}
