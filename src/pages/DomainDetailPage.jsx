// Domain Detail Page Component

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { domainDetailService } from "../services/domain-detail.service";
import { DOMAIN_TABS } from "../constants/domain-tabs";
import { Icon } from "../components/Icon";
import { DomainTabs } from "../components/DomainTabs";
import { VideosPanel } from "../components/VideosPanel";
import { WorkspacePanel } from "../components/WorkspacePanel";

export default function DomainDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [tabAvailability, setTabAvailability] = useState({
    workspace: true,
    videos: true,
  });
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [videos, setVideos] = useState([]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(workspaces.map((w) => w.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, [workspaces]);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        setLoading(true);
        const foundDomain = await domainDetailService.getDomainBySlug(slug);
        setDomain(foundDomain);
        setSelectedWorkspace(null);

        // Default to showing all tabs; only hide a tab once we've
        // confirmed it has zero items, so a transient fetch error
        // never hides content that may actually exist.
        let availability = { workspace: true, videos: true };
        let fetchedWorkspaces = [];
        let fetchedVideos = [];
        try {
          const [workspacesData, videosData] = await Promise.all([
            domainDetailService.getWorkspacesByDomainSlug(slug),
            domainDetailService.getVideosByDomainSlug(slug),
          ]);
          fetchedWorkspaces = workspacesData;
          fetchedVideos = videosData;
          availability = {
            workspace: workspacesData.length > 0,
            videos: videosData.length > 0,
          };
        } catch (availabilityError) {
          console.error("Error fetching tab availability:", availabilityError);
        }

        setWorkspaces(fetchedWorkspaces);
        setVideos(fetchedVideos);
        setTabAvailability(availability);
        const firstVisibleTab = DOMAIN_TABS.find(
          (tab) => availability[tab.key] !== false,
        );
        setActiveTab(firstVisibleTab?.key ?? null);
      } catch (error) {
        console.error("Error fetching domain:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDomain();
  }, [slug, navigate]);

  if (loading || !domain) {
    return (
      <div className="detail-page fade-in">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading domain...</p>
        </div>
      </div>
    );
  }

  const visibleTabs = DOMAIN_TABS.filter(
    (tab) => tabAvailability[tab.key] !== false,
  );

  return (
    <>
      <div className="detail-page fade-in">
        <div className="breadcrumb">
          <span
            className="breadcrumb-link"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{domain.title}</span>
        </div>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <Icon name="arrowLeft" size={15} strokeWidth={2.5} />
          Back to All Domains
        </button>

        {!selectedWorkspace && visibleTabs.length > 0 && (
          <DomainTabs
            tabs={visibleTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {visibleTabs.length === 0 ? (
          <div className="workspace-empty">
            <div className="workspace-empty-icon">🚀</div>
            <h3>No Workspaces, Videos or Demos Added</h3>
          </div>
        ) : (
          <>
            {tabAvailability.workspace && (
              <div
                className={`tab-content ${activeTab === "workspace" ? "active" : ""}`}
              >
                <WorkspacePanel
                  domain={domain}
                  workspaces={workspaces}
                  categories={categories}
                  selectedWorkspace={selectedWorkspace}
                  setSelectedWorkspace={setSelectedWorkspace}
                  domainSlug={slug}
                />
              </div>
            )}

            {tabAvailability.videos && (
              <div
                className={`tab-content ${activeTab === "videos" ? "active" : ""}`}
              >
                <VideosPanel domain={domain} videos={videos} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
