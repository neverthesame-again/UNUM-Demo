// Modal Component - Generic Modal for Forms and Videos

import { useEffect } from "react";
import { Icon } from "./Icon";

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  videoIcon,
  videoUrl,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // If children provided, render form modal
  if (children) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-box modal-form">
          <div className="modal-header">
            <div className="modal-title">{title}</div>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="modal-form-body">{children}</div>
        </div>
      </div>
    );
  }

  // Otherwise render video modal

  // Helper function to determine video type and get embed URL
  const getVideoEmbedInfo = (url) => {
    if (!url) return null;

    // YouTube video
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId;
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      }
      return {
        type: "youtube",
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      };
    }

    // Vimeo video
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return {
        type: "vimeo",
        embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : null,
      };
    }

    // SharePoint/OneDrive video
    if (url.includes("sharepoint.com") || url.includes("1drv.ms")) {
      // If URL already has embed parameter, use it directly
      if (url.includes("embed")) {
        return {
          type: "sharepoint",
          embedUrl: url,
        };
      }
      // Convert share link to embed URL by adding embed parameter
      const separator = url.includes("?") ? "&" : "?";
      return {
        type: "sharepoint",
        embedUrl: `${url}${separator}embed=1`,
      };
    }

    // Direct video file (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        type: "direct",
        embedUrl: url,
      };
    }

    // Default: treat as iframe-embeddable URL
    return {
      type: "iframe",
      embedUrl: url,
    };
  };

  const videoInfo = getVideoEmbedInfo(videoUrl);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box modal-box-video">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <div className="modal-header-actions">
            {videoUrl && (
              <button
                className="modal-action-btn"
                onClick={() => window.open(videoUrl, "_blank")}
                aria-label="Open in new tab"
                title="Open in new tab"
              >
                <Icon name="externalLink" size={16} />
              </button>
            )}
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="modal-video">
          {videoInfo && videoInfo.embedUrl ? (
            <>
              {videoInfo.type === "direct" ? (
                <video
                  controls
                  autoPlay
                  className="modal-video-player"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "calc(94vh - 120px)",
                    borderRadius: "8px",
                  }}
                >
                  <source src={videoInfo.embedUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={videoInfo.embedUrl}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="modal-video-player"
                  style={{
                    width: "100%",
                    height: videoInfo.type === "iframe" ? "calc(88vh - 100px)" : undefined,
                    aspectRatio: videoInfo.type === "iframe" ? "auto" : "16/9",
                    maxHeight: "calc(94vh - 100px)",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
              )}
            </>
          ) : (
            <>
              <div className="modal-video-play">
                <div
                  className="play-triangle"
                  style={{
                    borderWidth: "10px 0 10px 20px",
                    marginLeft: "5px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  textAlign: "center",
                  padding: "0 32px",
                }}
              >
                ▶ {title}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
