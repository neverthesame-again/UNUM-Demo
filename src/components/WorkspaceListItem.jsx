// WorkspaceListItem Component - Display workspace in settings list

import { Icon } from "./Icon";

export const WorkspaceListItem = ({
  workspace,
  onEdit,
  onToggleVisibility,
}) => {
  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: workspace.badge_color }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "12px",
            letterSpacing: "0.3px",
            color: "var(--white)",
          }}
        >
          {workspace.app_badge}
        </span>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{workspace.name}</h3>
        </div>
        <p className="settings-item-description">{workspace.description}</p>
        <div className="settings-item-meta">
          <span>
            <Icon name="code" size={12} />
            Domain: {workspace.domains?.name || "Unknown"}
          </span>
          <span>·</span>
          <span>Category: {workspace.category || "None"}</span>
          <span>·</span>
          <span>Projects: {workspace.projects_count}</span>
          <span>·</span>
          <span>Order: {workspace.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(workspace)}
          title="Edit workspace"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${workspace.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(workspace)}
          title={workspace.is_visible ? "Hide workspace" : "Show workspace"}
        >
          <Icon name={workspace.is_visible ? "eyeOff" : "eye"} size={16} />
          {workspace.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
