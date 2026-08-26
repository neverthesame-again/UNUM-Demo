import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { domainDetailService } from "../services/domain-detail.service";

export const VideosPanel = ({ domain, videos: initialVideos }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState(initialVideos || []);
  const [loading, setLoading] = useState(initialVideos === undefined);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (initialVideos !== undefined) {
      setVideos(initialVideos);
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const videosData = await domainDetailService.getVideosByDomainSlug(
          domain.slug,
        );
        setVideos(videosData);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [domain.slug, initialVideos]);

  const handleDemoClick = (demo, actionType = null) => {
    const type = actionType || (demo.videoUrl ? "video" : "prototype");

    if (type === "video" && demo.videoUrl) {
      setSelectedVideo(demo);
      setShowModal(true);
    } else if (type === "prototype" && demo.prototypeUrl) {
      if (demo.prototypeUrl.startsWith("/")) {
        navigate(demo.prototypeUrl);
      } else {
        window.open(demo.prototypeUrl, "_blank");
      }
    } else {
      if (demo.videoUrl) {
        setSelectedVideo(demo);
        setShowModal(true);
      } else if (demo.prototypeUrl) {
        if (demo.prototypeUrl.startsWith("/")) {
          navigate(demo.prototypeUrl);
        } else {
          window.open(demo.prototypeUrl, "_blank");
        }
      } else {
        console.log("No URL available for:", demo.title);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="videos-panel">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="videos-panel">
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="videos-panel">
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🎥</div>
          <h3>Videos Coming Soon</h3>
          <p>Video demos for this domain will be available soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-panel">
      {/* Demos Grid */}
      <div className="demos-grid">
        {videos.map((demo, idx) => (
          <div
            key={idx}
            className="demo-card"
            onClick={() => handleDemoClick(demo)}
          >
            <div className="demo-card-content">
              <h3 className="demo-card-title">{demo.title}</h3>
              <p className="demo-card-description">{demo.description}</p>
            </div>
            <div className="demo-card-actions">
              {demo.videoUrl && (
                <button
                  className="demo-action-btn"
                  data-tooltip="View Video"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDemoClick(demo, "video");
                  }}
                >
                  <Icon name="play" size={14} />
                </button>
              )}
              {demo.prototypeUrl && (
                <button
                  className="demo-action-btn"
                  data-tooltip="View Prototype"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDemoClick(demo, "prototype");
                  }}
                >
                  <Icon name="externalLink" size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {showModal && selectedVideo && (
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedVideo.title}
          videoUrl={selectedVideo.videoUrl}
        />
      )}
    </div>
  );
};
