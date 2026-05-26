import { getLogs, getStats } from "../../lib/logger";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit  = parseInt(req.query.limit  || "100");
  const status = req.query.status || null;

  return res.status(200).json({
    stats: getStats(),
    logs:  getLogs({ limit, status }),
  });
}
