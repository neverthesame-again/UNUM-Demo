// DomainListItem Component - Display domain in settings list

import { Icon } from "./Icon";

export const DomainListItem = ({ domain, onEdit, onToggleVisibility }) => {
  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: `rgba(${hexToRgb(domain.accent_color)}, 0.18)` }}
      >
        <Icon name={domain.icon_name} size={24} color={domain.accent_color} />
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{domain.name}</h3>
          <span
            className={`settings-item-badge ${domain.is_visible ? "active" : "inactive"}`}
          >
            {domain.is_visible ? "Active" : "Hidden"}
          </span>
        </div>
        <p className="settings-item-description">{domain.description}</p>
        <div className="settings-item-meta">
          <span>
            <Icon name="link" size={12} />
            {domain.route}
          </span>
          <span>·</span>
          <span>Slug: {domain.slug}</span>
          <span>·</span>
          <span>Order: {domain.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(domain)}
          title="Edit domain"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${domain.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(domain)}
          title={domain.is_visible ? "Hide domain" : "Show domain"}
        >
          <Icon name={domain.is_visible ? "eyeOff" : "eye"} size={16} />
          {domain.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};

// Helper: Convert hex color to RGB values
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "30, 107, 255"; // Default blue
}
