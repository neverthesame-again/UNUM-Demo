import { useEffect } from "react";
import { Icon } from "./Icon";

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

  // Priority badge — uses semi-transparent colors that work in both light & dark mode
  const PRIORITY_STYLES = {
    P1: { bg: "rgba(185,28,28,0.15)",  color: "#ef4444", border: "rgba(185,28,28,0.4)"  },
    P2: { bg: "rgba(180,83,9,0.15)",   color: "#f59e0b", border: "rgba(180,83,9,0.4)"   },
    P3: { bg: "rgba(29,78,216,0.15)",  color: "#60a5fa", border: "rgba(29,78,216,0.4)"  },
  };
  const priorityStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.P3;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1000,
          animation: "fadeInDrawer 0.2s ease",
        }}
      />

      {/* Drawer panel */}
      <div
        className="action-drawer-panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "420px",
          maxWidth: "95vw",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRightDrawer 0.25s ease",
          overflowY: "auto",
        }}
      >
        {/* Coloured header */}
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
              background: "rgba(255,255,255,0.2)",
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
            borderBottom: "1px solid var(--border)",
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
                color: item.ticketed ? "#22c55e" : "var(--text-muted)",
                border: `1px solid ${item.ticketed ? "rgba(22,163,74,0.35)" : "rgba(107,114,128,0.3)"}`,
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

          <div style={{ height: "1px", background: "var(--border)", marginBottom: "16px" }} />

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
                  className="action-ticket-chip"
                  style={{
                    fontFamily: "monospace",
                    border: "1px solid var(--border)",
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
              className="action-status-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                border: "1px solid var(--border)",
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

          <div style={{ height: "1px", background: "var(--border)", marginBottom: "16px" }} />

          <Field label="Description">
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.6",
                color: "var(--text-secondary)",
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
            borderTop: "1px solid var(--border)",
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
            className="action-dismiss-btn"
            style={{
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

        /* Solid opaque background — overrides the near-transparent --surface-card in dark mode */
        .action-drawer-panel {
          background: #ffffff;
          color: #111827;
        }
        [data-theme='dark'] .action-drawer-panel {
          background: #0d1e3a;
          color: #f1f5f9;
        }
        .action-drawer-panel .action-ticket-chip {
          background: #f1f5f9;
          color: #111827;
        }
        [data-theme='dark'] .action-drawer-panel .action-ticket-chip {
          background: #091428;
          color: #e2e8f0;
        }
        .action-drawer-panel .action-status-chip {
          background: #f1f5f9;
          color: #111827;
        }
        [data-theme='dark'] .action-drawer-panel .action-status-chip {
          background: #091428;
          color: #e2e8f0;
        }
        .action-drawer-panel .action-dismiss-btn {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        [data-theme='dark'] .action-drawer-panel .action-dismiss-btn {
          background: #091428;
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.12);
        }
      `}</style>
    </>
  );
}
