export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = req.headers["authorization"] || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rows = extractRows(req.body);

  if (!rows.length) {
    return res.status(400).json({ error: "No data found" });
  }

  const results = [];

  for (const row of rows) {
    if (!row.email && !row.Email) {
      results.push({ skipped: true });
      continue;
    }

    try {
      const response = await fetch(
        `${process.env.GROWLYTICS_API_URL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROWLYTICS_API_KEY}`,
          },
          body: JSON.stringify(row),
        }
      );

      const data = await response.json().catch(() => ({}));
      results.push({ success: response.ok, status: response.status, data });

    } catch (err) {
      results.push({ success: false, error: err.message });
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
