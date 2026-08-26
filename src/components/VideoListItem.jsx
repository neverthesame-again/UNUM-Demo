// VideoListItem Component - Display video in settings list

import { Icon } from "./Icon";

export const VideoListItem = ({ video, onEdit, onToggleVisibility }) => {
  const hasVideoUrl = Boolean(video.video_url);
  const hasPrototypeUrl = Boolean(video.prototype_url);
  const iconBackground =
    hasVideoUrl && hasPrototypeUrl
      ? "linear-gradient(135deg, var(--blue2), #f97316)"
      : hasPrototypeUrl
        ? "linear-gradient(135deg, var(--gold), #f97316)"
        : "linear-gradient(135deg, var(--blue2), var(--cyan))";

  return (
    <div className="settings-list-item">
      <div
        className="settings-item-icon"
        style={{ background: iconBackground }}
      >
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {hasVideoUrl && <Icon name="play" size={14} color="var(--white)" />}
          {hasPrototypeUrl && (
            <Icon name="externalLink" size={14} color="var(--white)" />
          )}
        </div>
      </div>
      <div className="settings-item-content">
        <div className="settings-item-header">
          <h3 className="settings-item-title">{video.title}</h3>
        </div>
        <p className="settings-item-description">{video.description}</p>
        <div className="settings-item-meta">
          <span>
            <Icon name="code" size={12} />
            Domain: {video.domains?.name || "Unknown"}
          </span>
          <span>·</span>
          <span>Status: {video.status}</span>
          {video.video_url && (
            <>
              <span>·</span>
              <span>
                <Icon name="play" size={12} />
                Video URL
              </span>
            </>
          )}
          {video.prototype_url && (
            <>
              <span>·</span>
              <span>
                <Icon name="externalLink" size={12} />
                Prototype URL
              </span>
            </>
          )}
          <span>·</span>
          <span>Order: {video.display_order}</span>
        </div>
      </div>
      <div className="settings-item-actions">
        <button
          className="settings-item-action-btn"
          onClick={() => onEdit(video)}
          title="Edit video"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button
          className={`settings-item-action-btn ${video.is_visible ? "hide" : "show"}`}
          onClick={() => onToggleVisibility(video)}
          title={video.is_visible ? "Hide video" : "Show video"}
        >
          <Icon name={video.is_visible ? "eyeOff" : "eye"} size={16} />
          {video.is_visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
