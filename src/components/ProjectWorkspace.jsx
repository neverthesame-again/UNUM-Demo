// ProjectWorkspace Component - Display projects, skills, AI tools, and repository for a workspace

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { domainDetailService } from "../services/domain-detail.service";

export const ProjectWorkspace = ({ workspace, onBack, domainSlug }) => {
  const { slug: paramSlug } = useParams();
  const slug = paramSlug || domainSlug || "swe";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Types");

  // Data states
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [aiTools, setAiTools] = useState([]);

  // Loading states
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingAiTools, setLoadingAiTools] = useState(true);

  // Fetch projects for workspace
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await domainDetailService.getProjectsByWorkspaceId(
          workspace.id,
        );
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [workspace.id]);

  // Fetch skills for domain
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await domainDetailService.getSkillsByDomainSlug(slug);
        setSkills(data);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [slug]);

  // Fetch AI tools for domain
  useEffect(() => {
    const fetchAiTools = async () => {
      try {
        setLoadingAiTools(true);
        const data = await domainDetailService.getAiToolsByDomainSlug(slug);
        setAiTools(data);
      } catch (err) {
        console.error("Failed to fetch AI tools:", err);
      } finally {
        setLoadingAiTools(false);
      }
    };

    fetchAiTools();
  }, [slug]);

  // Filter projects based on search and filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All Types" ||
      project.type === activeFilter ||
      project.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate project stats
  const projectStats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    avgProgress:
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
          )
        : 0,
  };

  const getStatusClass = (status) => {
    return status === "Completed"
      ? "project-tag-completed"
      : "project-tag-progress";
  };

  const getTypeClass = (type) => {
    return type === "Greenfield"
      ? "project-tag-greenfield"
      : "project-tag-brownfield";
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "#50c878";
    if (progress >= 70) return "#f5a623";
    return "#1e6bff";
  };

  return (
    <div className="project-workspace">
      <div className="project-workspace-header">
        <button className="project-back-btn" onClick={onBack}>
          <Icon name="arrowLeft" size={14} />
        </button>
        <div>
          <h2 className="project-workspace-title">{workspace.name}</h2>
          <p className="project-workspace-subtitle">{workspace.description}</p>
        </div>
      </div>

      <div className="project-tabs">
        <button
          className={`project-tab ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
        <button
          className={`project-tab ${activeTab === "skills" ? "active" : ""}`}
          onClick={() => setActiveTab("skills")}
        >
          Skills
        </button>
        <button
          className={`project-tab ${activeTab === "aitools" ? "active" : ""}`}
          onClick={() => setActiveTab("aitools")}
        >
          AI Tools
        </button>
      </div>

      {activeTab === "projects" && (
        <div className="project-tab-content">
          {loadingProjects ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : (
            <>
              <div className="project-stats-grid">
                <div className="project-stat-card">
                  <div className="project-stat-label">Total Projects</div>
                  <div className="project-stat-number">
                    {projectStats.total}
                  </div>
                </div>
                <div className="project-stat-card">
                  <div className="project-stat-label">In Progress</div>
                  <div
                    className="project-stat-number"
                    style={{ color: "var(--gold)" }}
                  >
                    {projectStats.inProgress}
                  </div>
                </div>
                <div className="project-stat-card">
                  <div className="project-stat-label">Completed</div>
                  <div
                    className="project-stat-number"
                    style={{ color: "#50c878" }}
                  >
                    {projectStats.completed}
                  </div>
                </div>
                <div className="project-stat-card">
                  <div className="project-stat-label">Avg Progress</div>
                  <div
                    className="project-stat-number"
                    style={{ color: "#b446ff" }}
                  >
                    {projectStats.avgProgress}%
                  </div>
                </div>
              </div>

              <div className="project-controls">
                <div
                  className="workspace-search-wrap"
                  style={{ maxWidth: "280px" }}
                >
                  <Icon name="search" size={14} />
                  <input
                    type="text"
                    className="workspace-search"
                    placeholder="Search project name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="project-filters">
                  {[
                    "All Types",
                    "Brownfield",
                    "Greenfield",
                    "Completed",
                    "In Progress",
                  ].map((filter) => (
                    <button
                      key={filter}
                      className={`workspace-filter-btn ${activeFilter === filter ? "active" : ""}`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="project-cards-grid">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <h3 className="project-card-title">{project.title}</h3>
                    </div>
                    <div className="project-tags">
                      <span
                        className={`project-tag ${getTypeClass(project.type)}`}
                      >
                        {project.type}
                      </span>
                      <span
                        className={`project-tag ${getStatusClass(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="project-card-description">
                      {project.description}
                    </p>
                    <div className="project-progress-section">
                      <div className="project-progress-header">
                        <span>Progress</span>
                        <span
                          style={{
                            color: getProgressColor(project.progress),
                            fontWeight: 700,
                          }}
                        >
                          {project.progress}%
                        </span>
                      </div>
                      <div className="project-progress-bar">
                        <div
                          className="project-progress-fill"
                          style={{
                            width: `${project.progress}%`,
                            background: `linear-gradient(90deg, ${getProgressColor(project.progress)}, ${getProgressColor(project.progress)}dd)`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="project-card-meta">
                      <span>
                        <Icon name="calendar" size={12} />
                        {project.dueDate}
                      </span>
                      <span>
                        <Icon name="users" size={12} />
                        {project.members} members
                      </span>
                    </div>
                    <button
                      className="project-open-btn"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      Open Project
                      <Icon name="arrowRight" size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="workspace-empty">
                  <div className="workspace-empty-icon">🔍</div>
                  <h3>No Projects Found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "skills" && (
        <div className="project-tab-content">
          {loadingSkills ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Loading skills...</p>
            </div>
          ) : (
            <div className="skills-grid">
              {skills.map((skill) => (
                <div key={skill.id} className="skill-card">
                  <div className="skill-icon">{skill.emoji}</div>
                  <div className="skill-title">{skill.title}</div>
                  <div className="skill-desc">{skill.description}</div>
                  <button className="skill-action-btn">Launch Skill</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "aitools" && (
        <div className="project-tab-content">
          {loadingAiTools ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Loading AI tools...</p>
            </div>
          ) : (
            <div className="aitools-grid">
              {aiTools.map((tool) => (
                <div key={tool.id} className="aitool-card">
                  <div className="aitool-icon">{tool.emoji}</div>
                  <div className="aitool-title">{tool.title}</div>
                  <div className="aitool-desc">{tool.description}</div>
                  <button className="aitool-action-btn">Open Tool</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
