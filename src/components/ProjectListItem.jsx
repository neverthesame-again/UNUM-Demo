// ProjectListItem Component - Display project in settings list

import { Icon } from "./Icon";

export const ProjectListItem = ({ project, onEdit, onToggleVisibility }) => {
  // Get type badge color
  const getTypeBadgeColor = (type) => {
    return type === "Greenfield"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "linear-gradient(135deg, #f59e0b, #ea580c)";
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    return status === "Completed"
      ? "linear-gradient(135deg, #06b6d4, #0891b2)"
      : "linear-gradient(135deg, #6366f1, #8b5cf6)";
  };

  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: getTypeBadgeColor(project.type) }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "20px",
            color: "var(--white)",
          }}
        >
          {project.progress}%
        </span>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{project.title}</h3>
        </div>
        <p className="settings-item-description">{project.description}</p>
        <div className="settings-item-meta">
          <span>
            <Icon name="folder" size={12} />
            Workspace: {project.workspaces?.name || "Unknown"}
          </span>
          <span>·</span>
          <span>Type: {project.type}</span>
          <span>·</span>
          <span>Status: {project.status}</span>
          <span>·</span>
          <span>Members: {project.members_count}</span>
          <span>·</span>
          <span>Due: {project.due_date || "N/A"}</span>
          <span>·</span>
          <span>Order: {project.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(project)}
          title="Edit project"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${project.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(project)}
          title={project.is_visible ? "Hide project" : "Show project"}
        >
          <Icon name={project.is_visible ? "eyeOff" : "eye"} size={16} />
          {project.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
