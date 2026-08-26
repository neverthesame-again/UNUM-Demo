// WorkspacePanel Component - Display application workspaces for each domain

import { useState } from "react";
import { Icon } from "./Icon";
import { ProjectWorkspace } from "./ProjectWorkspace";
import { getCategoryStyle } from "../constants/domain-colors";
import { PipelineModal } from "./project-detail/PipelineModal";
import { BROWNFIELD_PIPELINE_ENDPOINT } from "../constants/pipeline";

export const WorkspacePanel = ({
  domain,
  workspaces,
  categories,
  selectedWorkspace,
  setSelectedWorkspace,
  domainSlug,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pipelineWorkspace, setPipelineWorkspace] = useState(null);

  // Filter workspaces based on search and category
  const filteredWorkspaces = workspaces.filter((workspace) => {
    const matchesSearch =
      workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workspace.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || workspace.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWorkspaceClick = (workspace) => {
    setSelectedWorkspace(workspace);
  };

  const handleBackToWorkspaces = () => {
    setSelectedWorkspace(null);
  };

  const handleOpenPipeline = (e, workspace) => {
    e.stopPropagation();
    setPipelineWorkspace(workspace);
  };

  // If a workspace is selected, show the project workspace view
  if (selectedWorkspace) {
    return (
      <ProjectWorkspace
        workspace={selectedWorkspace}
        onBack={handleBackToWorkspaces}
        domainSlug={domainSlug || domain?.slug}
      />
    );
  }

  // Empty state
  if (workspaces.length === 0) {
    return (
      <div className="workspace-empty">
        <div className="workspace-empty-icon">🚀</div>
        <h3>Workspaces Coming Soon</h3>
        <p>Application workspaces for this domain will be available soon.</p>
      </div>
    );
  }

  return (
    <div className="workspace-panel">
      <div className="workspace-header">
        <div>
          <div className="workspace-label">
            {domain.title}: Application Workspaces
          </div>
          <p className="workspace-description">
            Select an enterprise platform to launch the autonomous workspace for
            your implementation.
          </p>
        </div>
      </div>

      <div className="workspace-controls">
        <div className="workspace-search-wrap">
          <Icon name="search" size={14} />
          <input
            type="text"
            className="workspace-search"
            placeholder="Search name or title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="workspace-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`workspace-filter-btn ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="workspace-grid">
        {filteredWorkspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="workspace-card"
            onClick={() => handleWorkspaceClick(workspace)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleWorkspaceClick(workspace);
              }
            }}
          >
            <div className="workspace-card-top">
              <div
                className="workspace-app-badge"
                style={{ background: workspace.badgeColor }}
              >
                {workspace.appBadge}
              </div>
              <div
                className="workspace-cat-tag"
                style={getCategoryStyle(workspace.category, categories)}
              >
                {workspace.category}
              </div>
            </div>

            <div className="workspace-card-name">{workspace.name}</div>
            <div className="workspace-card-desc">{workspace.description}</div>

            <div className="workspace-card-meta">
              <span>
                <Icon name="folder" size={12} />
                {workspace.projects} projects
              </span>
              <span>
                <Icon name="users" size={12} />
                {workspace.members} members
              </span>
            </div>

            <div className="workspace-card-actions">
              <div className="workspace-launch-btn">
                <span>Launch Workspace</span>
                <div className="workspace-launch-icon">
                  <Icon name="arrowRight" size={12} />
                </div>
              </div>

              {workspace.includeL3Pipeline && (
                <button
                  type="button"
                  className="workspace-l3-btn"
                  onClick={(e) => handleOpenPipeline(e, workspace)}
                  data-tooltip="Invoke L3 Pipeline"
                  aria-label="Invoke L3 Pipeline"
                >
                  <Icon name="plus" size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredWorkspaces.length === 0 && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🔍</div>
          <h3>No Workspaces Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <PipelineModal
        isOpen={!!pipelineWorkspace}
        onClose={() => setPipelineWorkspace(null)}
        appSlug={pipelineWorkspace?.name || ""}
        featureDescription={pipelineWorkspace?.description || ""}
        endpoint={BROWNFIELD_PIPELINE_ENDPOINT}
        onStarted={() => {}}
      />
    </div>
  );
};
