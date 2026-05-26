import { verifyWebhookAuth }               from "../../../lib/auth";
import { transformContact, resolveSegment } from "../../../lib/transform";
import { upsertContact, tagContact, triggerAutomation } from "../../../lib/growlytics";
import { addLog }                           from "../../../lib/logger";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyWebhookAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const raw = req.body;
  const rows = extractRows(raw);

  if (!rows.length) {
    return res.status(400).json({ error: "No lead data found in payload" });
  }

  const results = [];

  for (const row of rows) {
    const contact = transformContact(row);

    if (!contact.email) {
      results.push({ skipped: true, reason: "no_email", raw: row });
      continue;
    }

    const { segment, automation } = resolveSegment(contact);
    contact.segment = segment;

    try {
      await upsertContact(contact);
      await tagContact(contact.email, [segment, contact.product].filter(Boolean));
      await triggerAutomation(contact.email, automation, {
        product:    contact.product,
        lead_score: contact.lead_score,
        segment,
      });

      addLog({
        type:      "lead_sync",
        status:    "success",
        email:     contact.email,
        segment,
        automation,
        product:   contact.product,
      });

      results.push({ success: true, email: contact.email, segment, automation });

    } catch (err) {
      addLog({
        type:    "lead_sync",
        status:  "error",
        email:   contact.email,
        error:   err.message,
      });
      results.push({ success: false, email: contact.email, error: err.message });
    }
  }

  return res.status(200).json({ processed: results.length, results });
}

function extractRows(body) {
  if (body?.data?.rows && body?.data?.cols) {
    const cols = body.data.cols.map(c => c.name);
    return body.data.rows.map(row =>
      Object.fromEntries(cols.map((col, i) => [col, row[i]]))
    );
  }
  if (Array.isArray(body)) return body;
  if (typeof body === "object" && body !== null) return [body];
  return [];
}
