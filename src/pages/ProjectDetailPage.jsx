// ProjectDetailPage - Full project detail view with 5 tabs

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { domainDetailService } from "../services/domain-detail.service";
import { OverviewTab } from "../components/project-detail/OverviewTab";
import { TeamTab } from "../components/project-detail/TeamTab";
import { RepositoryTab } from "../components/project-detail/RepositoryTab";
import { AiToolsTab } from "../components/project-detail/AiToolsTab";
import { ComingSoonTab } from "../components/project-detail/ComingSoonTab";

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        // Fetch project and phases in parallel
        const [projectData, phasesData] = await Promise.all([
          domainDetailService.getProjectById(projectId),
          domainDetailService.getPhasesByProjectId(projectId),
        ]);
        setProject(projectData);
        setPhases(phasesData);
      } catch (err) {
        console.error("Failed to fetch project data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Compute progress from phases average
  const computedProgress =
    phases.length > 0
      ? Math.round(
          phases.reduce((sum, p) => sum + p.progress, 0) / phases.length,
        )
      : project?.progress || 0;

  // Auto-derive status from computed progress
  const computedStatus =
    computedProgress === 100 ? "Completed" : project?.status === "Completed" && phases.length === 0 ? "Completed" : "In Progress";

  const getProgressColor = (progress) => {
    if (progress === 100) return "#50c878";
    if (progress >= 70) return "#f5a623";
    return "#00c4ff";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "team", label: "Team", icon: "👥" },
    // { id: "featureInfo", label: "Feature Info", icon: "📄" }, // hidden for now
    { id: "aiTools", label: "AI Tools", icon: "✦" },
    { id: "repository", label: "Repository", icon: "📁" },
  ];

  if (loading) {
    return (
      <div className="pd-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pd-page">
        <div className="workspace-empty">
          <div className="workspace-empty-icon">❌</div>
          <h3>Project Not Found</h3>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <button className="project-open-btn" onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" size={12} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <button className="pd-breadcrumb-link" onClick={() => navigate(-1)}>
          ← Projects
        </button>
        <span className="pd-breadcrumb-sep">›</span>
        <span className="pd-breadcrumb-current">{project.title}</span>
      </div>

      {/* Header Bar - uses computed progress from phases */}
      <div className="pd-header">
        <div className="pd-header-left">
          <span
            className={`pd-status-badge ${computedStatus === "Completed" ? "completed" : "in-progress"}`}
          >
            {computedStatus}
          </span>
          <span className="pd-type-label">{project.type}</span>
          <span className="pd-progress-label">Progress</span>
          <div className="pd-header-progress-bar">
            <div
              className="pd-header-progress-fill"
              style={{
                width: `${computedProgress}%`,
                background: `linear-gradient(90deg, ${getProgressColor(computedProgress)}, ${getProgressColor(computedProgress)}cc)`,
              }}
            />
          </div>
        </div>
        <div className="pd-header-right">
          <span
            className="pd-header-progress-value"
            style={{ color: getProgressColor(computedProgress) }}
          >
            {computedProgress}%
          </span>
          <span className="pd-header-meta">
            {project.dueDate && (
              <>
                Ends {project.dueDate}
              </>
            )}
            {project.members > 0 && (
              <>
                {project.dueDate ? " · " : ""}
                {project.members} members
              </>
            )}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="pd-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pd-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="pd-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pd-tab-content">
        {activeTab === "overview" && (
          <OverviewTab project={project} phases={phases} computedStatus={computedStatus} />
        )}
        {activeTab === "team" && <TeamTab project={project} />}
        {activeTab === "featureInfo" && (
          <ComingSoonTab tabName="Feature Info" icon="📄" />
        )}
        {activeTab === "aiTools" && <AiToolsTab project={project} />}
        {activeTab === "repository" && <RepositoryTab project={project} />}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
