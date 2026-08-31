import React, { useMemo } from "react";
import { Modal } from "../Modal";

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

  const color = getColor(app.statusType);
  const bg = getBg(app.statusType);

  // Generate deterministic data based on app name
  // Requirement: Most uptime data > 99.5%, exactly 1 day < 99.5% (red), and low error counts (~3-5 total errors).
  const { uptime, errors, dipIndex } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < app.title.length; i++) {
      hash = app.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    // If app status is good, all days should be above 99.5% and green. Otherwise, pick 1 day to dip.
    const dipIndex = app.statusType === 'good' ? -1 : (seed % 4) + 2;

    const uptime = Array(7).fill(0).map((_, i) => {
      if (i === dipIndex) {
        if (app.statusType === 'warn') {
          const dipVal = 99.3 + ((seed * 13) % 5) / 10;
          return parseFloat(dipVal.toFixed(1));
        } else {
          // Only this day is < 99.5% (e.g. 98.4%)
          const dipVal = 98.0 + ((seed * 13) % 12) / 10;
          return parseFloat(dipVal.toFixed(1));
        }
      }
      // All other 6 days are strictly > 99.5% (e.g., 99.6% to 99.9%)
      const normalVal = 99.6 + (((seed * (i + 1) * 7) % 4) / 10);
      return parseFloat(Math.min(99.9, normalVal).toFixed(1));
    });

    // Low error count so app feels like it's running great
    const errors = Array(7).fill(0).map((_, i) => {
      if (i === dipIndex) {
        return 2 + (seed % 2); // 2 or 3 errors on the dip day
      }
      return (seed + i) % 2; // 0 or 1 error on normal days
    });

    return { uptime, errors, dipIndex };
  }, [app.title]);

  // SVG coordinates setup for Uptime line graph: Y-axis 95–100%
  const yMin = 95;
  const yMax = 100;
  const yRange = yMax - yMin;

  const points = uptime.map((val, i) => {
    const x = (i / 6) * 100;
    const y = 100 - (Math.max(0, val - yMin) / yRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  const totalErrors = errors.reduce((a, b) => a + b, 0);
  const maxErrGlobal = Math.max(5, ...errors);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`App Health: ${app.title}`}>
      <div style={{ padding: "20px", color: "var(--text-primary)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "700" }}>{app.title}</h2>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Real-time performance and error tracking</span>
          </div>
          <span style={{
            padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700",
            background: bg, color: color,
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, display: "inline-block" }}></span>
            {app.status}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Uptime Line Graph */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>Uptime & Performance (Last 7 Days)</h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Target: <strong style={{ color: "#10b981" }}>&gt;99.5%</strong>
              </span>
            </div>

            {/* SVG Line Chart */}
            <div style={{ position: "relative", height: "160px", marginBottom: "8px" }}>
              {/* Horizontal grid lines */}
              {[0, 33, 66, 100].map((pct, i) => (
                <div key={i} style={{
                  position: "absolute", top: `${pct}%`, width: "100%",
                  borderTop: "1px dashed rgba(255,255,255,0.07)"
                }} />
              ))}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}>

                {/* Gradient fill under line */}
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,100 ${points} 100,100`}
                  fill="url(#areaGrad)"
                />

                {/* Individual line segments - Highlight if connecting to/from dip day (<99.5%), Green otherwise */}
                {uptime.slice(0, 6).map((val, i) => {
                  const nextVal = uptime[i + 1];
                  const x1 = (i / 6) * 100;
                  const y1 = 100 - (Math.max(0, val - yMin) / yRange) * 100;
                  const x2 = ((i + 1) / 6) * 100;
                  const y2 = 100 - (Math.max(0, nextVal - yMin) / yRange) * 100;
                  const isDipSegment = val < 99.5 || nextVal < 99.5;
                  let segColor = "#10b981";
                  if (isDipSegment) {
                    segColor = app.statusType === 'warn' ? "#f59e0b" : "#ef4444";
                  }

                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={segColor} strokeWidth="2.5" strokeLinecap="round" />
                  );
                })}

                {/* Circles at data points */}
                {uptime.map((val, i) => {
                  const cx = (i / 6) * 100;
                  const cy = 100 - (Math.max(0, val - yMin) / yRange) * 100;
                  const isDip = val < 99.5;
                  let ptColor = "#10b981";
                  if (isDip) {
                    ptColor = app.statusType === 'warn' ? "#f59e0b" : "#ef4444";
                  }
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r={isDip ? "4" : "3"}
                        fill={isDip ? ptColor : "#1e293b"} stroke={ptColor} strokeWidth="2" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {uptime.map((val, i) => {
                const isDip = val < 99.5;
                let labelColor = "#10b981";
                let labelBg = "transparent";
                if (isDip) {
                  labelColor = app.statusType === 'warn' ? "#f59e0b" : "#ef4444";
                  labelBg = app.statusType === 'warn' ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)";
                }
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <span style={{
                      fontSize: "11px", fontWeight: isDip ? "800" : "600", color: labelColor,
                      background: labelBg,
                      padding: isDip ? "2px 6px" : "0",
                      borderRadius: "6px",
                      display: "inline-block"
                    }}>
                      {val}%
                    </span>
                    <span style={{ fontSize: "10px", color: isDip ? labelColor : "var(--text-muted)", marginTop: "2px", fontWeight: isDip ? "700" : "400" }}>
                      Day {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Rate Bar Chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>Error Rate / Incidents (Last 7 Days)</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Total: <strong style={{ color: "#10b981" }}>{totalErrors} errors</strong>
                </span>
                <span style={{ fontSize: "11px", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                  Healthy
                </span>
              </div>
            </div>

            <div style={{ height: "130px", display: "flex", alignItems: "flex-end", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              {errors.map((val, i) => {
                const heightPct = Math.max(val > 0 ? 8 : 0, (val / maxErrGlobal) * 100);
                const isDipDay = i === dipIndex;
                const barColor = isDipDay ? "#f59e0b" : "#10b981";

                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                    <div style={{
                      width: "60%", background: barColor,
                      height: `${heightPct}%`,
                      borderRadius: "4px 4px 0 0",
                      opacity: 0.85,
                      minHeight: val > 0 ? "6px" : "0"
                    }} />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              {errors.map((val, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#10b981" }}>{val}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Day {i + 1}</span>
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

