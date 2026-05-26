import { verifyWebhookAuth } from "../../../lib/auth";
import { triggerAutomation } from "../../../lib/growlytics";
import { addLog }            from "../../../lib/logger";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyWebhookAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, automation, properties = {} } = req.body || {};

  if (!email || !automation) {
    return res.status(400).json({ error: "email and automation are required" });
  }

  try {
    const result = await triggerAutomation(email, automation, properties);

    addLog({
      type:       "manual_trigger",
      status:     "success",
      email,
      automation,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    addLog({ type: "manual_trigger", status: "error", email, automation, error: err.message });
    return res.status(500).json({ error: err.message });
  }
}
