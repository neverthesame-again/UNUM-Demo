import React, { useMemo } from "react";
import { Modal } from "../Modal";

// Day labels for the 7-day trailing window
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Color helpers based on statusType
const getColor = (statusType) => {
  if (statusType === 'good') return '#10b981';   // green
  if (statusType === 'warn') return '#f59e0b';   // amber
  return '#ef4444';                              // red (down)
};

const getBg = (statusType) => {
  if (statusType === 'good') return 'rgba(16, 185, 129, 0.15)';
  if (statusType === 'warn') return 'rgba(245, 158, 11, 0.15)';
  return 'rgba(239, 68, 68, 0.15)';
};

export const AppHealthModal = ({ isOpen, onClose, app }) => {
  if (!app) return null;

  const appColor = getColor(app.statusType);
  const appBg = getBg(app.statusType);

  const isDownApp = app.statusType === 'danger' || app.status === 'Down' || app.title.toLowerCase().includes('sales connect');
  const isWarn = app.statusType === 'warn';

  // Generate 7-day data with per-app seeded random errors (max 8 per day)
  const dayData = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < app.title.length; i++) {
      hash = app.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    // Seeded pseudo-random helper: returns 0–max integer
    const rand = (idx, max) => {
      const x = Math.sin(seed + idx * 9301 + 49297) * 233280;
      return Math.floor(Math.abs(x - Math.floor(x)) * (max + 1));
    };

    return DAYS.map((day, i) => {
      const isWed = day === "Wed" || i === 2;

      if (isDownApp) {
        if (isWed) {
          // Wednesday spike — still capped at 8
          return {
            day,
            fullDay: FULL_DAYS[i],
            uptime: 99.4,
            errors: 3,
            isWed: true,
            color: "#ef4444",
            bg: "rgba(239, 68, 68, 0.15)",
          };
        } else {
          // Other days: 0–4 errors, healthy green
          const greenUptimes = [99.8, 99.7, 99.4, 99.9, 99.6, 99.8, 99.9];
          return {
            day,
            fullDay: FULL_DAYS[i],
            uptime: greenUptimes[i],
            errors: rand(i, 4),
            isWed: false,
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.15)",
          };
        }
      } else if (isWarn) {
        // Warning app: 3–8 errors
        const warnUptimes = [97.8, 98.2, 96.9, 98.4, 97.6, 98.1, 98.5];
        return {
          day,
          fullDay: FULL_DAYS[i],
          uptime: warnUptimes[i],
          errors: rand(i + 10, 5) + 3,
          isWed,
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.15)",
        };
      } else {
        // Good healthy app: 0–3 errors
        const goodUptimes = [99.8, 99.9, 99.7, 99.8, 99.9, 99.7, 99.9];
        return {
          day,
          fullDay: FULL_DAYS[i],
          uptime: goodUptimes[i],
          errors: rand(i + 20, 3),
          isWed,
          color: "#10b981",
          bg: "rgba(16, 185, 129, 0.15)",
        };
      }
    });
  }, [app.title, app.statusType, isDownApp, isWarn]);

  // SVG polyline coords: Y-axis 98.8–100 covers 99.4–100% ranges smoothly
  const yMin = isWarn ? 95.0 : 98.8;
  const yMax = 100.0;
  const yRange = yMax - yMin;

  const points = dayData.map((d, i) => {
    const x = (i / 6) * 100;
    const y = 100 - (Math.max(0, d.uptime - yMin) / yRange) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  const maxErrGlobal = Math.max(10, ...dayData.map(d => d.errors));
  const totalErrors = dayData.reduce((sum, d) => sum + d.errors, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`App Health: ${app.title}`}>
      <div style={{ padding: "20px", color: "var(--text-primary)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "700" }}>{app.title}</h2>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Real-time 7-day health telemetry & SLA tracking</span>
          </div>
          <span style={{
            padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700",
            background: appBg, color: appColor,
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: appColor, display: "inline-block" }}></span>
            {app.status}
          </span>
        </div>

        {/* Highlight Banner if App is Down on Wednesday */}
        {isDownApp && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "var(--text-primary)"
          }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <div>
              <strong style={{ color: "#ef4444" }}>Wednesday SLA Incident (99.4% Uptime):</strong> Outage detected on Wednesday (3 errors). All other days remained fully operational (&gt;99.6% SLA).
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Uptime Line Graph */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>Uptime & Performance (Last 7 Days)</h3>
              <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#10b981" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span> Healthy (≥99.6%)
                </span>
                {isDownApp && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#ef4444" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span> Outage (99.4%)
                  </span>
                )}
              </div>
            </div>

            {/* SVG Line Chart */}
            <div style={{ position: "relative", height: "160px", marginBottom: "8px" }}>
              {/* Horizontal grid lines */}
              {[10, 35, 60, 85].map((pct, i) => (
                <div key={i} style={{
                  position: "absolute", top: `${pct}%`, width: "100%",
                  borderTop: "1px dashed rgba(255,255,255,0.07)"
                }} />
              ))}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}>

                <defs>
                  {/* Multi-color gradient along the line */}
                  <linearGradient id={`lineGrad-${app.id || 'app'}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={dayData[0].color} />
                    <stop offset="18%" stopColor={dayData[1].color} />
                    <stop offset="33.33%" stopColor={dayData[2].color} />
                    <stop offset="48%" stopColor={dayData[3].color} />
                    <stop offset="100%" stopColor={dayData[6].color} />
                  </linearGradient>

                  {/* Gradient fill under line */}
                  <linearGradient id={`areaGrad-${app.id || 'app'}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDownApp ? "#10b981" : appColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isDownApp ? "#10b981" : appColor} stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                <polygon
                  points={`0,100 ${points} 100,100`}
                  fill={`url(#areaGrad-${app.id || 'app'})`}
                />
                <polyline
                  fill="none"
                  stroke={isDownApp ? `url(#lineGrad-${app.id || 'app'})` : appColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={points}
                />
                {dayData.map((d, i) => {
                  const cx = (i / 6) * 100;
                  const cy = 100 - (Math.max(0, d.uptime - yMin) / yRange) * 80 - 10;
                  return (
                    <g key={i}>
                      {d.isWed && isDownApp && (
                        <circle cx={cx} cy={cy} r="5.5" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                          <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="3.2"
                        fill={d.color}
                        stroke="#0f172a"
                        strokeWidth="1.8"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              {dayData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    padding: "4px 2px",
                    borderRadius: "8px",
                    background: d.isWed && isDownApp ? "rgba(239, 68, 68, 0.12)" : "transparent",
                    border: d.isWed && isDownApp ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "700", color: d.color }}>{d.uptime}%</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: d.isWed ? "700" : "500",
                    color: d.isWed && isDownApp ? "#ef4444" : "var(--text-secondary)",
                    marginTop: "2px"
                  }}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Rate Bar Chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>Error Rate / Incidents (Last 7 Days)</h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Total: <strong style={{ color: isDownApp ? "#ef4444" : appColor }}>{totalErrors} errors</strong>
              </span>
            </div>

            <div style={{ height: "130px", display: "flex", alignItems: "flex-end", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              {dayData.map((d, i) => {
                const heightPct = Math.max(d.errors > 0 ? 6 : 0, (d.errors / maxErrGlobal) * 100);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                    <div style={{
                      width: "65%",
                      background: d.color,
                      height: `${heightPct}%`,
                      borderRadius: "4px 4px 0 0",
                      opacity: d.isWed && isDownApp ? 1 : 0.85,
                      boxShadow: d.isWed && isDownApp ? "0 0 10px rgba(239, 68, 68, 0.45)" : "none",
                      minHeight: d.errors > 0 ? "4px" : "0",
                      transition: "height 0.25s ease"
                    }} />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              {dayData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    padding: "4px 2px",
                    borderRadius: "8px",
                    background: d.isWed && isDownApp ? "rgba(239, 68, 68, 0.12)" : "transparent",
                    border: d.isWed && isDownApp ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid transparent",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "700", color: d.color }}>{d.errors}</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: d.isWed ? "700" : "500",
                    color: d.isWed && isDownApp ? "#ef4444" : "var(--text-secondary)",
                    marginTop: "2px"
                  }}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "8px 20px", background: "var(--accent)", color: "white",
            border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
          }}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
