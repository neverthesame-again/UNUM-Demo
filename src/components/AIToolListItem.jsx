// AIToolListItem Component - Display AI tool in settings list

import { Icon } from "./Icon";

export const AIToolListItem = ({ tool, onEdit, onToggleVisibility }) => {
  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: "linear-gradient(135deg, #00c8ff, var(--blue5))" }}
      >
        <span
          style={{
            fontSize: "28px",
          }}
        >
          {tool.emoji}
        </span>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{tool.title}</h3>
        </div>
        <p className="settings-item-description">{tool.description}</p>
        <div className="settings-item-meta">
          <span>
            <Icon name="code" size={12} />
            Domain: {tool.domains?.name || "Unknown"}
          </span>
          <span>·</span>
          <span>Category: {tool.category || "None"}</span>
          <span>·</span>
          <span>Order: {tool.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(tool)}
          title="Edit AI tool"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${tool.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(tool)}
          title={tool.is_visible ? "Hide AI tool" : "Show AI tool"}
        >
          <Icon name={tool.is_visible ? "eyeOff" : "eye"} size={16} />
          {tool.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
