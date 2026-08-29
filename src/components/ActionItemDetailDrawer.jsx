import { useEffect } from "react";
import { Icon } from "./Icon";

const PRIORITY_COLORS = {
  P1: { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" },
  P2: { bg: "#fef3c7", color: "#b45309", border: "#fcd34d" },
  P3: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.8px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500", lineHeight: "1.5" }}>
        {children}
      </div>
    </div>
  );
}

export function ActionItemDetailDrawer({ item, onClose, accentColor = "#2563eb" }) {
  // Close on Escape key
  useEffect(() => {
    if (!item) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [item, onClose]);

  if (!item) return null;

  const priorityStyle = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.P3;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1000,
          animation: "fadeInDrawer 0.2s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "420px",
          maxWidth: "95vw",
          background: "var(--surface-card, #1e1e2e)",
          borderLeft: "1px solid var(--border, #2d2d3d)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRightDrawer 0.25s ease",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: accentColor,
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "4px",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              {item.tag}
            </span>
            <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px", lineHeight: "1.4" }}>
              {item.text}
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", marginTop: "4px" }}>
              {item.meta}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "18px",
              lineHeight: 1,
            }}
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Action Required Banner */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid var(--border, #2d2d3d)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <Icon name="zap" size={14} />
          <span style={{ fontSize: "12px", fontWeight: "700", color: accentColor }}>
            Action Required:
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "600" }}>
            {item.actionRequired}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", flex: 1 }}>
          {/* Priority + Ticketed badges */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <span
              style={{
                background: priorityStyle.bg,
                color: priorityStyle.color,
                border: `1px solid ${priorityStyle.border}`,
                borderRadius: "6px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icon name="alert-circle" size={11} />
              {item.priority} Priority
            </span>

            <span
              style={{
                background: item.ticketed ? "rgba(22,163,74,0.15)" : "rgba(107,114,128,0.15)",
                color: item.ticketed ? "#16a34a" : "#9ca3af",
                border: `1px solid ${item.ticketed ? "rgba(22,163,74,0.4)" : "rgba(107,114,128,0.3)"}`,
                borderRadius: "6px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icon name={item.ticketed ? "check-circle" : "minus-circle"} size={11} />
              {item.ticketed ? "Ticketed" : "Non-Ticketed"}
            </span>
          </div>

          <div style={{ height: "1px", background: "var(--border, #2d2d3d)", marginBottom: "16px" }} />

          <Field label="Application">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="box" size={13} />
              {item.appName}
            </span>
          </Field>

          {item.ticketed && item.ticketId && (
            <Field label="Ticket ID">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="tag" size={13} />
                <span
                  style={{
                    fontFamily: "monospace",
                    background: "rgba(255,255,255,0.08)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                >
                  {item.ticketId}
                </span>
              </span>
            </Field>
          )}

          <Field label="Status">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid var(--border, #2d2d3d)",
                borderRadius: "6px",
                padding: "3px 10px",
                fontSize: "12px",
              }}
            >
              <Icon name="activity" size={12} />
              {item.status}
            </span>
          </Field>

          <Field label="Due Date">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="calendar" size={13} />
              {item.dueDate}
            </span>
          </Field>

          <Field label="Assigned To">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="user" size={13} />
              {item.assignedTo}
            </span>
          </Field>

          <div style={{ height: "1px", background: "var(--border, #2d2d3d)", marginBottom: "16px" }} />

          <Field label="Description">
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.6",
                color: "var(--text-secondary, #9ca3af)",
              }}
            >
              {item.description}
            </p>
          </Field>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border, #2d2d3d)",
            display: "flex",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <button
            style={{
              flex: 1,
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Icon name="check" size={14} />
            {item.actionRequired}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border, #2d2d3d)",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRightDrawer {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeInDrawer {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
