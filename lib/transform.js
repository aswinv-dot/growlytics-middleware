export function resolveSegment(lead) {
  const score = Number(lead.lead_score || 0);

  if (score >= 50) {
    return { segment: "hot_lead", automation: `hot_${slugify(lead.product)}_drip` };
  }
  if (score >= 20) {
    return { segment: "warm_lead", automation: `warm_${slugify(lead.product)}_drip` };
  }
  return { segment: "cold_lead", automation: `welcome_${slugify(lead.product)}_drip` };
}

// EDIT: update field names to match your Metabase column names
export function transformContact(raw) {
  return {
    email:   raw.email       || raw.Email       || null,
    phone:   raw.phone       || raw.Phone       || null,
    name:    raw.name        || raw.Name        || raw.full_name || "Unknown",
    product: raw.product     || raw.Program     || raw.program  || null,
    source:  raw.source      || raw.utm_source  || "metabase_webhook",

    lead_score:         Number(raw.lead_score || raw.score || 0),
    webinar_attended:   Boolean(raw.webinar_attended),
    counselor_assigned: Boolean(raw.counselor_assigned),

    custom_attributes: pickExtra(raw, [
      "email","phone","name","product","source",
      "lead_score","score","webinar_attended","counselor_assigned",
      "Email","Phone","Name","Program","program",
    ]),
  };
}

function pickExtra(obj, excludeKeys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !excludeKeys.includes(k))
  );
}

function slugify(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
