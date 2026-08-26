// ProjectRepositoryFileListItem Component - Display repository file in settings list

import { Icon } from "./Icon";
import {
  getFileTypeStyle,
  getDisplayFileName,
} from "../constants/repository-file-types";

export const ProjectRepositoryFileListItem = ({
  file,
  onEdit,
  onToggleVisibility,
}) => {
  const typeStyle = getFileTypeStyle(file.file_type);

  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: typeStyle.background }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "13px",
            color: typeStyle.color,
          }}
        >
          {typeStyle.label}
        </span>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">
            {getDisplayFileName(file.file_name, file.file_type)}
          </h3>
        </div>
        <p className="settings-item-description">
          {file.projects?.title || "Unknown project"} (
          {file.projects?.workspaces?.name || "Unknown workspace"})
        </p>
        <div className="settings-item-meta">
          <span>Type: {typeStyle.label}</span>
          <span>·</span>
          <span>
            <Icon name="link" size={12} />
            {file.file_url ? (
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--cyan)" }}
              >
                {file.file_url}
              </a>
            ) : (
              "No link added"
            )}
          </span>
          <span>·</span>
          <span>Order: {file.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(file)}
          title="Edit document"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${file.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(file)}
          title={file.is_visible ? "Hide document" : "Show document"}
        >
          <Icon name={file.is_visible ? "eyeOff" : "eye"} size={16} />
          {file.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
