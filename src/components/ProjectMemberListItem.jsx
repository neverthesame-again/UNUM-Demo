// ProjectMemberListItem Component - Display project member in settings list

import { Icon } from "./Icon";

export const ProjectMemberListItem = ({
  member,
  onEdit,
  onToggleVisibility,
}) => {
  const getInitials = (name, storedInitials) => {
    if (storedInitials) return storedInitials;
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{
          background: member.avatar_color || "#6366f1",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "16px",
            color: "var(--white)",
          }}
        >
          {getInitials(member.name, member.avatar_initials)}
        </span>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{member.name}</h3>
        </div>
        <p className="settings-item-description">{member.role}</p>
        <div className="settings-item-meta">
          <span>Color: {member.avatar_color || "#6366f1"}</span>
          <span>·</span>
          <span>Order: {member.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(member)}
          title="Edit member"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${member.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(member)}
          title={member.is_visible ? "Hide member" : "Show member"}
        >
          <Icon name={member.is_visible ? "eyeOff" : "eye"} size={16} />
          {member.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
