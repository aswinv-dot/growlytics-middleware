import { useState, useEffect } from "react";
import styles from "../styles/Dashboard.module.css";

const STATUS_COLOR = { success: "#C5FF00", error: "#ff4d4d", skipped: "#888" };

export default function Dashboard() {
  const [data, setData]         = useState({ stats: {}, logs: [] });
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [trigger, setTrigger]   = useState({ email: "", automation: "" });
  const [trigStatus, setTrig]   = useState(null);

  const fetchLogs = async () => {
    const status = filter === "all" ? "" : `&status=${filter}`;
    const res = await fetch(`/api/logs?limit=100${status}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const t = setInterval(fetchLogs, 10000);
    return () => clearInterval(t);
  }, [filter]);

  const handleTrigger = async () => {
    setTrig("sending...");
    try {
      const res = await fetch("/api/growlytics/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WEBHOOK_SECRET || ""}`,
        },
        body: JSON.stringify(trigger),
      });
      const json = await res.json();
      setTrig(json.success ? "sent" : `error: ${json.error}`);
    } catch (e) {
      setTrig(`error: ${e.message}`);
    }
  };

  const { stats } = data;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.logo}>VORTEX<span>LABS</span></div>
        <div className={styles.subtitle}>Growlytics Middleware</div>
        <button className={styles.refresh} onClick={fetchLogs}>↻ Refresh</button>
      </header>

      <div className={styles.stats}>
        <Stat label="Total Processed" value={stats.total ?? 0} />
        <Stat label="Success" value={stats.success ?? 0} accent="#C5FF00" />
        <Stat label="Errors" value={stats.failed ?? 0} accent="#ff4d4d" />
        <Stat label="Success Rate"
          value={stats.total ? `${Math.round((stats.success / stats.total) * 100)}%` : "—"}
          accent="#C5FF00"
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Manual Trigger</h2>
        </div>
        <div className={styles.triggerRow}>
          <input
            className={styles.input}
            placeholder="email@example.com"
            value={trigger.email}
            onChange={e => setTrigger(p => ({ ...p, email: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="automation_name e.g. warm_germany_oc_drip"
            value={trigger.automation}
            onChange={e => setTrigger(p => ({ ...p, automation: e.target.value }))}
          />
          <button className={styles.btn} onClick={handleTrigger}>Trigger</button>
        </div>
        {trigStatus && <div className={styles.trigStatus}>{trigStatus}</div>}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Activity Log</h2>
          <div className={styles.filters}>
            {["all","success","error"].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ""}`}
                onClick={() => setFilter(f)}
              >{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : data.logs.length === 0 ? (
          <div className={styles.empty}>No logs yet. Waiting for webhooks...</div>
        ) : (
          <div className={styles.table}>
            <div className={styles.thead}>
              <span>Time</span>
              <span>Type</span>
              <span>Email</span>
              <span>Details</span>
              <span>Status</span>
            </div>
            {data.logs.map(log => (
              <div key={log.id} className={styles.row}>
                <span className={styles.time}>{formatTime(log.timestamp)}</span>
                <span className={styles.tag}>{log.type}</span>
                <span className={styles.email}>{log.email || "—"}</span>
                <span className={styles.detail}>
                  {log.automation || log.event || log.error || "—"}
                </span>
                <span style={{ color: STATUS_COLOR[log.status] || "#fff" }}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        Aswin Raaju &nbsp;|&nbsp;
        <a href="tel:+917094956963">+91 70949 56963</a> &nbsp;|&nbsp;
        <a href="mailto:v.aswinraaju@gmail.com">v.aswinraaju@gmail.com</a>
      </footer>
    </div>
  );
}

function Stat({ label, value, accent = "#fff" }) {
  return (
    <div style={{ "--accent": accent }} className={`${styles.statCard}`}>
      <div className={styles.statValue} style={{ color: accent }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
