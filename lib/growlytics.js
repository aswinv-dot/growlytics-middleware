const BASE_URL = process.env.GROWLYTICS_API_URL || "https://api.growlytics.in/v1";
const API_KEY  = process.env.GROWLYTICS_API_KEY;

async function gRequest(path, method = "POST", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      // PLACEHOLDER: update auth header format based on Growlytics docs
      Authorization: `Bearer ${API_KEY}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Growlytics ${method} ${path} failed [${res.status}]: ${JSON.stringify(data)}`
    );
  }
  return data;
}

// PLACEHOLDER: confirm actual endpoint + required fields from Growlytics docs
export async function upsertContact(contact) {
  return gRequest("/contacts", "POST", {
    email: contact.email,
    phone: contact.phone,
    name:  contact.name,
    attributes: {
      product:            contact.product,
      lead_score:         contact.lead_score,
      segment:            contact.segment,
      webinar_attended:   contact.webinar_attended,
      source:             contact.source,
      counselor_assigned: contact.counselor_assigned,
      ...contact.custom_attributes,
    },
  });
}

// PLACEHOLDER: confirm tag endpoint
export async function tagContact(email, tags = []) {
  return gRequest("/contacts/tags", "POST", { email, tags });
}

// PLACEHOLDER: confirm trigger endpoint and param names
export async function triggerAutomation(email, automationName, properties = {}) {
  return gRequest("/automations/trigger", "POST", {
    email,
    automation: automationName,
    properties,
  });
}

// PLACEHOLDER: confirm event endpoint
export async function trackEvent(email, eventName, properties = {}) {
  return gRequest("/events", "POST", {
    email,
    event:      eventName,
    properties,
    timestamp:  new Date().toISOString(),
  });
}
