// Member Portal Observability - Claims Dashboard Component

import { useState, useEffect } from "react";
import { Icon } from "./Icon";

export function MemberPortalObservabilityDashboard({ onClose }) {
  const [timeRange, setTimeRange] = useState("1h");
  const [selectedService, setSelectedService] = useState("all");
  const [logs, setLogs] = useState([
    { id: 1, time: "19:07:42.102", level: "INFO", service: "ClaimsGateway", msg: "POST /v2/claims/adjudicate - 200 OK (28ms)" },
    { id: 2, time: "19:07:38.845", level: "INFO", service: "EligibilityEngine", msg: "Validated Member ID M-9842100 (Coverage Active)" },
    { id: 3, time: "19:07:35.512", level: "INFO", service: "AIRulesEngine", msg: "Ruleset v4.2 applied to Claim #CLM-2026-9812 - Auto-Approved" },
    { id: 4, time: "19:07:29.118", level: "INFO", service: "EDI837Parser", msg: "Ingested batch file EDI_20260825_837I.dat (42 records)" },
    { id: 5, time: "19:07:22.901", level: "WARN", service: "DBPool", msg: "Connection pool 78% utilized - Auto-scaling node added" },
    { id: 6, time: "19:07:15.340", level: "INFO", service: "PaymentLedger", msg: "EFT Batch #8812 queued for settlement ($14,290.00)" },
    { id: 7, time: "19:07:08.210", level: "INFO", service: "ClaimsGateway", msg: "GET /v2/claims/status/CLM-2026-9810 - 200 OK (14ms)" },
  ]);

  // Live telemetry stream simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const services = ["ClaimsGateway", "EligibilityEngine", "AIRulesEngine", "PaymentLedger", "EDI837Parser"];
      const randomSvc = services[Math.floor(Math.random() * services.length)];
      const isWarn = Math.random() < 0.15;
      const level = isWarn ? "WARN" : "INFO";
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + "." + Math.floor(Math.random() * 900 + 100);
      const claimId = "CLM-2026-" + Math.floor(Math.random() * 8999 + 1000);
      const ms = Math.floor(Math.random() * 35 + 12);

      const newLog = {
        id: Date.now(),
        time: timeStr,
        level,
        service: randomSvc,
        msg: isWarn
          ? `High throughput burst on ${randomSvc} (retry count: 0, ms: ${ms}ms)`
          : `Processed claim payload ${claimId} successfully (${ms}ms)`,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 24)]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const externalUrl = "https://qfrtch9abe.us-east-1.awsapprunner.com/";
  const intranetUrl = "https://ismartams.tcsapps.com/member-portal-observability/";

  const filteredLogs = selectedService === "all" 
    ? logs 
    : logs.filter(l => l.service.toLowerCase().includes(selectedService.toLowerCase()));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "#0b0f19",
        color: "#f3f4f6",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #1e293b",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)",
          borderBottom: "1px solid #1e293b",
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              background: "#0891b2",
              padding: "10px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 0 15px rgba(8, 145, 178, 0.4)",
            }}
          >
            <Icon name="zap" size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                Member Portal Observability — Claims Dashboard
              </h2>
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }}></span>
                System Operational (99.98%)
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span>Environment: <strong style={{ color: "#e2e8f0" }}>prod-us-east-1</strong></span>
              <span>•</span>
              <span>Intranet URL: <code style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "1px 6px", borderRadius: "4px" }}>{intranetUrl}</code></span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(8, 145, 178, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(8, 145, 178, 0.4)",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(8, 145, 178, 0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(8, 145, 178, 0.15)"; }}
          >
            <Icon name="externalLink" size={14} /> Open External Portal ↗
          </a>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94a3b8",
                fontSize: "16px",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px", background: "#0b0f19" }}>
        
        {/* 1. Metric Counter KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Total Claims Processed (Today)</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>142,850</div>
            <div style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>▲ +12.4% vs previous 24h</span>
            </div>
          </div>

          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Auto-Adjudication Rate</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>94.2%</div>
            <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "4px", fontWeight: "600" }}>Target SLA: &gt; 90.0%</div>
          </div>

          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Average E2E Latency</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#a855f7", marginTop: "4px" }}>38 ms</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontWeight: "600" }}>p95: 112ms | p99: 180ms</div>
          </div>

          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Error & SLA Breaches</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>0</div>
            <div style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", fontWeight: "600" }}>100% SLA Compliance</div>
          </div>
        </div>

        {/* 2. Visual Graphs & Health Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "16px" }}>
          
          {/* Real-time Claims Throughput Graph */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
                📈 Real-Time Claims Throughput (req/sec)
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}
              >
                <option value="1h">Last 1 Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
              </select>
            </div>

            {/* Sparkline / Bar Chart */}
            <div style={{ height: "150px", display: "flex", alignItems: "flex-end", gap: "6px", padding: "10px 0", borderBottom: "1px solid #334155" }}>
              {[45, 62, 78, 55, 89, 94, 82, 100, 115, 98, 120, 142, 138, 150, 162, 155, 170, 168, 182, 195].map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    background: idx >= 17 ? "#0891b2" : "rgba(8, 145, 178, 0.4)",
                    height: `${(val / 200) * 100}%`,
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease",
                  }}
                  title={`Time: -${(20 - idx) * 3}m | Throughput: ${val * 10} req/s`}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
              <span>60 min ago</span>
              <span>30 min ago</span>
              <span style={{ color: "#38bdf8", fontWeight: "600" }}>Now (1,950 req/s)</span>
            </div>
          </div>

          {/* Microservices Health Checklist */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
              ⚡ Member Portal Claims Microservices Status
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Claims Gateway API (/v2/claims)", latency: "12ms", uptime: "100%", status: "Healthy" },
                { name: "Member Eligibility Engine", latency: "15ms", uptime: "99.99%", status: "Healthy" },
                { name: "AI Auto-Adjudication Processor", latency: "42ms", uptime: "99.95%", status: "Healthy" },
                { name: "Payment & Benefits Ledger Sync", latency: "18ms", uptime: "100%", status: "Healthy" },
                { name: "EDI 837 Batch Ingestion Service", latency: "22ms", uptime: "99.98%", status: "Healthy" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Latency: {item.latency} | Uptime: {item.uptime}</div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ● {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Real-Time Telemetry & Log Terminal */}
        <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "10px", padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8" }}>📟 Live Telemetry & Event Stream</span>
              <span style={{ fontSize: "10px", background: "rgba(8, 145, 178, 0.2)", color: "#38bdf8", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                Live Feed (2.5s)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "12px", color: "#94a3b8" }}>Filter Service:</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ background: "#1e293b", color: "#f8fafc", border: "1px solid #334155", borderRadius: "6px", padding: "4px 8px", fontSize: "12px" }}
              >
                <option value="all">All Microservices</option>
                <option value="ClaimsGateway">Claims Gateway</option>
                <option value="EligibilityEngine">Eligibility Engine</option>
                <option value="AIRulesEngine">AI Rules Engine</option>
                <option value="PaymentLedger">Payment Ledger</option>
                <option value="EDI837Parser">EDI 837 Parser</option>
              </select>
            </div>
          </div>

          <div
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              padding: "14px 16px",
              fontFamily: "'Consolas', 'Courier New', monospace",
              fontSize: "12px",
              height: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {filteredLogs.map((log) => (
              <div key={log.id} style={{ display: "flex", gap: "10px", lineHeight: "1.4" }}>
                <span style={{ color: "#64748b" }}>[{log.time}]</span>
                <span style={{ color: log.level === "WARN" ? "#f59e0b" : "#10b981", fontWeight: "bold", width: "45px" }}>
                  {log.level}
                </span>
                <span style={{ color: "#38bdf8", fontWeight: "600", width: "130px" }}>[{log.service}]</span>
                <span style={{ color: "#cbd5e1" }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
