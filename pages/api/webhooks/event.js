import { verifyWebhookAuth } from "../../../lib/auth";
import { trackEvent }        from "../../../lib/growlytics";
import { addLog }            from "../../../lib/logger";

const SCORE_MAP = {
  email_opened:           5,
  link_clicked:           10,
  webinar_attended:       25,
  consultation_booked:    40,
  pricing_page_viewed:    15,
  document_submitted:     30,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyWebhookAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, event, properties = {} } = req.body || {};

  if (!email || !event) {
    return res.status(400).json({ error: "email and event are required" });
  }

  const scoreDelta = SCORE_MAP[event] || 0;

  try {
    await trackEvent(email, event, { ...properties, score_delta: scoreDelta });

    addLog({
      type:        "event",
      status:      "success",
      email,
      event,
      score_delta: scoreDelta,
    });

    return res.status(200).json({ success: true, email, event, score_delta: scoreDelta });
  } catch (err) {
    addLog({ type: "event", status: "error", email, event, error: err.message });
    return res.status(500).json({ error: err.message });
  }
}
