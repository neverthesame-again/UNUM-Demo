// ProjectPhaseListItem Component - Display project phase in settings list

import { Icon } from "./Icon";

export const ProjectPhaseListItem = ({ phase, onEdit, onToggleVisibility }) => {
  const getProgressColor = (progress) => {
    if (progress === 100) return "linear-gradient(135deg, #10b981, #059669)";
    if (progress >= 70) return "linear-gradient(135deg, #f59e0b, #ea580c)";
    return "linear-gradient(135deg, #6366f1, #8b5cf6)";
  };

  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: getProgressColor(phase.progress), fontSize: "20px" }}
      >
        {phase.icon_emoji || "🔒"}
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{phase.title}</h3>
          {phase.is_current_phase && (
            <span
              style={{
                background: "rgba(var(--cyan-glow-rgb), 0.15)",
                color: "var(--cyan)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginLeft: "8px",
              }}
            >
              Current Phase
            </span>
          )}
        </div>
        <p className="settings-item-description">
          {phase.subtitle}
          {phase.description ? ` — ${phase.description}` : ""}
        </p>
        <div className="settings-item-meta">
          <span>Progress: {phase.progress}%</span>
          <span>·</span>
          <span>Order: {phase.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(phase)}
          title="Edit phase"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${phase.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(phase)}
          title={phase.is_visible ? "Hide phase" : "Show phase"}
        >
          <Icon name={phase.is_visible ? "eyeOff" : "eye"} size={16} />
          {phase.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
