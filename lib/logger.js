const MAX_LOGS = 500;

let logs = [];

export function addLog(entry) {
  logs.unshift({
    id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
}

export function getLogs({ limit = 100, status = null } = {}) {
  let result = logs;
  if (status) result = result.filter(l => l.status === status);
  return result.slice(0, limit);
}

export function getStats() {
  const total   = logs.length;
  const success = logs.filter(l => l.status === "success").length;
  const failed  = logs.filter(l => l.status === "error").length;
  return { total, success, failed };
}
