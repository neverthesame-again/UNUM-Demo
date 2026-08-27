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

  // Generate deterministic data based on app name + strictly correlated to health
  const { uptime, errors } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < app.title.length; i++) {
      hash = app.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    // Good: 99ΓÇô100%, Slow: 92ΓÇô97%, Down: 65ΓÇô80% with sharp drops
    const isGood = app.statusType === 'good';
    const isWarn = app.statusType === 'warn';

    const uptime = Array(7).fill(0).map((_, i) => {
      let base, variance;
      if (isGood)       { base = 99.0; variance = 1.0; }
      else if (isWarn)  { base = 92.0; variance = 5.0; }
      else              { base = 65.0; variance = 15.0; }

      let val = base + (((seed * (i + 1) * 17) % 100) / 100) * variance;
      // Down: make last 2 days worse
      if (!isGood && !isWarn && i >= 5) val -= 12;
      return parseFloat(Math.min(100, Math.max(0, val)).toFixed(1));
    });

    // Good: 0ΓÇô3 errors, Slow: 5ΓÇô18 errors, Down: 30ΓÇô60 errors, spike at end
    const maxErr = isGood ? 3 : isWarn ? 18 : 60;
    const errors = Array(7).fill(0).map((_, i) => {
      let val = Math.floor(((seed * (i + 3) * 23) % 100) / 100 * maxErr);
      if (!isGood && !isWarn && i >= 5) val += 25;
      return val;
    });

    return { uptime, errors };
  }, [app.title, app.statusType]);

  // SVG polyline coords: Y-axis 50ΓÇô100 for good/slow, 0ΓÇô100 for down
  const yMin = app.statusType === 'danger' ? 40 : 85;
  const yMax = 100;
  const yRange = yMax - yMin;

  const points = uptime.map((val, i) => {
    const x = (i / 6) * 100;
    const y = 100 - (Math.max(0, val - yMin) / yRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  const maxErrGlobal = Math.max(10, ...errors);

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
                Min: <strong style={{ color }}>{Math.min(...uptime)}%</strong> &nbsp;|&nbsp; Max: <strong style={{ color }}>{Math.max(...uptime)}%</strong>
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
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,100 ${points} 100,100`}
                  fill="url(#areaGrad)"
                />
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={points}
                />
                {uptime.map((val, i) => {
                  const cx = (i / 6) * 100;
                  const cy = 100 - (Math.max(0, val - yMin) / yRange) * 100;
                  return (
                    <circle key={i} cx={cx} cy={cy} r="2.5"
                      fill="#1e293b" stroke={color} strokeWidth="1.8" />
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {uptime.map((val, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", color }}>{val}%</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Day {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Rate Bar Chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>Error Rate / Incidents (Last 7 Days)</h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Total: <strong style={{ color }}>{errors.reduce((a, b) => a + b, 0)} errors</strong>
              </span>
            </div>

            <div style={{ height: "130px", display: "flex", alignItems: "flex-end", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              {errors.map((val, i) => {
                const heightPct = Math.max(val > 0 ? 4 : 0, (val / maxErrGlobal) * 100);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                    <div style={{
                      width: "70%", background: color,
                      height: `${heightPct}%`,
                      borderRadius: "4px 4px 0 0",
                      opacity: 0.85,
                      minHeight: val > 0 ? "4px" : "0"
                    }} />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              {errors.map((val, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", color }}>{val}</span>
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
