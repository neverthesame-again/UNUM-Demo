import React, { useMemo } from "react";
import { Modal } from "../Modal";

export const AppHealthModal = ({ isOpen, onClose, app }) => {
  if (!app) return null;

  // Generate deterministic data strictly based on app status
  const { uptime, errors } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < app.title.length; i++) {
      hash = app.title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    
    const isGood = app.statusType === 'good';
    const isWarn = app.statusType === 'warn';
    
    // Generate 7 days of uptime
    const uptime = Array(7).fill(0).map((_, i) => {
        let base, variance;
        if (isGood) {
            base = 99.0;
            variance = 1.0; // 99.0 to 100.0
        } else if (isWarn) {
            base = 95.0;
            variance = 4.0; // 95.0 to 99.0
        } else {
            base = 80.0;
            variance = 10.0; // 80.0 to 90.0, with a possible sharp drop on last days
        }
        
        let val = base + (((seed * (i + 1) * 17) % 100) / 100) * variance;
        
        // If critical, make the last day really bad
        if (!isGood && !isWarn && i >= 5) {
            val -= 10;
        }
        return parseFloat(Math.min(100, Math.max(0, val)).toFixed(1));
    });
    
    // Generate 7 days of errors
    const errors = Array(7).fill(0).map((_, i) => {
        let maxErr = isGood ? 3 : (isWarn ? 15 : 45);
        let val = Math.floor(((seed * (i + 3) * 23) % 100) / 100 * maxErr);
        
        // If critical, spike errors on last days
        if (!isGood && !isWarn && i >= 5) {
            val += 20;
        }
        return val;
    });
    
    return { uptime, errors };
  }, [app.title, app.statusType]);

  // SVG Line Chart coordinates for Uptime
  // Y-axis range: 70 to 100 for better visibility of drops
  const yMin = 70;
  const yMax = 100;
  const yRange = yMax - yMin;
  
  const points = uptime.map((val, i) => {
      const x = (i / 6) * 100;
      const y = 100 - (Math.max(0, val - yMin) / yRange) * 100;
      return `${x},${y}`;
  }).join(' ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`App Health: ${app.title}`} maxWidth="800px">
      <div style={{ padding: "20px", color: "var(--text-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "20px" }}>{app.title} Health Overview</h2>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Real-time performance and error tracking</span>
          </div>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "700",
              background: app.statusType === "good" ? "rgba(16, 185, 129, 0.15)" : app.statusType === "warn" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: app.statusType === "good" ? "#10b981" : app.statusType === "warn" ? "#f59e0b" : "#ef4444",
            }}
          >
            {app.status}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Uptime Line Chart */}
          <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ margin: "0", fontSize: "16px" }}>Uptime & Performance (Last 7 Days)</h3>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Min: {Math.min(...uptime)}% | Max: {Math.max(...uptime)}%</span>
            </div>
            
            <div style={{ position: "relative", height: "180px", marginBottom: "20px", padding: "10px 0" }}>
              {/* Grid lines */}
              <div style={{ position: "absolute", top: "0", width: "100%", borderTop: "1px dashed rgba(255,255,255,0.1)" }}></div>
              <div style={{ position: "absolute", top: "50%", width: "100%", borderTop: "1px dashed rgba(255,255,255,0.1)" }}></div>
              <div style={{ position: "absolute", bottom: "0", width: "100%", borderTop: "1px dashed rgba(255,255,255,0.1)" }}></div>
              
              {/* Line Graph */}
              <svg viewBox="0 -5 100 110" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <polyline fill="none" stroke={app.statusType === 'good' ? '#10b981' : app.statusType === 'warn' ? '#f59e0b' : '#ef4444'} strokeWidth="2.5" points={points} />
                {uptime.map((val, i) => {
                    const cx = (i / 6) * 100;
                    const cy = 100 - (Math.max(0, val - yMin) / yRange) * 100;
                    return (
                        <g key={i}>
                            <circle cx={cx} cy={cy} r="2.5" fill="#fff" stroke={app.statusType === 'good' ? '#10b981' : app.statusType === 'warn' ? '#f59e0b' : '#ef4444'} strokeWidth="1.5" />
                        </g>
                    )
                })}
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 5px" }}>
               {uptime.map((val, i) => (
                 <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: "600" }}>{val}%</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>Day {i + 1}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Error Rate Bar Chart */}
          <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px" }}>Error Rate / Incidents (Last 7 Days)</h3>
            <div style={{ height: "140px", display: "flex", alignItems: "flex-end", gap: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              {errors.map((val, i) => {
                const maxErrGlobal = Math.max(10, ...errors);
                const heightPct = (val / maxErrGlobal) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                    <div style={{ 
                        width: "60%", 
                        background: app.statusType === 'good' ? '#10b981' : app.statusType === 'warn' ? '#f59e0b' : '#ef4444', 
                        height: `${heightPct}%`, 
                        borderRadius: "4px 4px 0 0", 
                        minHeight: val > 0 ? "4px" : "0",
                        opacity: 0.8
                    }}></div>
                  </div>
                )
              })}
            </div>
            
            {/* X-axis labels for errors */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 5px", marginTop: "8px" }}>
               {errors.map((val, i) => (
                 <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-primary)", fontWeight: "600" }}>{val}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>Day {i + 1}</span>
                 </div>
               ))}
            </div>
          </div>
          
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
};
