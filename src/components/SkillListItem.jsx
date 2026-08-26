// SkillListItem Component - Display skill in settings list

import { Icon } from "./Icon";

export const SkillListItem = ({ skill, onEdit, onToggleVisibility }) => {
  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
      >
        <span
          style={{
            fontSize: "28px",
          }}
        >
          {skill.emoji}
        </span>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{skill.title}</h3>
        </div>
        <p className="settings-item-description">{skill.description}</p>
        <div className="settings-item-meta">
          <span>
            <Icon name="code" size={12} />
            Domain: {skill.domains?.name || "Unknown"}
          </span>
          <span>·</span>
          <span>Category: {skill.category || "None"}</span>
          <span>·</span>
          <span>Order: {skill.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(skill)}
          title="Edit skill"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${skill.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(skill)}
          title={skill.is_visible ? "Hide skill" : "Show skill"}
        >
          <Icon name={skill.is_visible ? "eyeOff" : "eye"} size={16} />
          {skill.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
