// Settings Page - Manage Cards

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import { DomainListItem } from "../components/DomainListItem";
import { DomainForm } from "../components/forms/DomainForm";
import { WorkspaceListItem } from "../components/WorkspaceListItem";
import { WorkspaceForm } from "../components/forms/WorkspaceForm";
import { ProjectListItem } from "../components/ProjectListItem";
import { ProjectForm } from "../components/forms/ProjectForm";
import { SkillListItem } from "../components/SkillListItem";
import { SkillForm } from "../components/forms/SkillForm";
import { AIToolListItem } from "../components/AIToolListItem";
import { AIToolForm } from "../components/forms/AIToolForm";
import { VideoListItem } from "../components/VideoListItem";
import { VideoForm } from "../components/forms/VideoForm";
import { ProjectPhaseListItem } from "../components/ProjectPhaseListItem";
import { ProjectPhaseForm } from "../components/forms/ProjectPhaseForm";
import { ProjectMemberListItem } from "../components/ProjectMemberListItem";
import { ProjectMemberForm } from "../components/forms/ProjectMemberForm";
import { ProjectRepositoryFileListItem } from "../components/ProjectRepositoryFileListItem";
import { RepositoryFileForm } from "../components/forms/RepositoryFileForm";
import { dashboardService } from "../services/dashboard.service";
import { useToast } from "../components/Toast";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeParentTab, setActiveParentTab] = useState("domains");
  const [activeSubTab, setActiveSubTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Domains state
  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [domainSubmitError, setDomainSubmitError] = useState(null);

  // Workspaces state
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [workspaceSubmitError, setWorkspaceSubmitError] = useState(null);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectSubmitError, setProjectSubmitError] = useState(null);

  // Skills state
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillSubmitError, setSkillSubmitError] = useState(null);

  // AI Tools state
  const [aitools, setAITools] = useState([]);
  const [loadingAITools, setLoadingAITools] = useState(false);
  const [showAIToolModal, setShowAIToolModal] = useState(false);
  const [editingAITool, setEditingAITool] = useState(null);
  const [aiToolSubmitError, setAIToolSubmitError] = useState(null);

  // Videos state
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoSubmitError, setVideoSubmitError] = useState(null);

  // Project Phases state
  const [phases, setPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);

  // Project Members state
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Project Repository Files state
  const [repoFiles, setRepoFiles] = useState([]);
  const [loadingRepoFiles, setLoadingRepoFiles] = useState(false);
  const [showRepoFileModal, setShowRepoFileModal] = useState(false);
  const [editingRepoFile, setEditingRepoFile] = useState(null);

  // Project Details sub-section
  const [pdSection, setPdSection] = useState("phases");

  const parentTabs = [
    { id: "domains", label: "Domains", icon: "code" },
    { id: "workspaces", label: "Workspaces", icon: "folder" },
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "skills", label: "Skills", icon: "zap" },
    { id: "aitools", label: "AI Tools", icon: "zap" },
    { id: "videos", label: "Videos & Demos", icon: "play" },
    { id: "projectdetails", label: "Project Details", icon: "layers" },
  ];

  // Fetch data based on active parent tab
  useEffect(() => {
    // Clear search when switching tabs
    setSearchQuery("");

    if (activeParentTab === "domains") {
      fetchDomains();
    } else if (activeParentTab === "workspaces") {
      fetchWorkspaces();
      if (domains.length === 0) fetchDomains(); // Need domains for workspace form
    } else if (activeParentTab === "projects") {
      fetchProjects();
      if (workspaces.length === 0) fetchWorkspaces(); // Need workspaces for project form
    } else if (activeParentTab === "skills") {
      fetchSkills();
      if (domains.length === 0) fetchDomains(); // Need domains for skill form
    } else if (activeParentTab === "aitools") {
      fetchAITools();
      if (domains.length === 0) fetchDomains(); // Need domains for AI tool form
    } else if (activeParentTab === "videos") {
      fetchVideos();
      if (domains.length === 0) fetchDomains(); // Need domains for video form
    } else if (activeParentTab === "projectdetails") {
      fetchPhases();
      fetchMembers();
      fetchRepoFiles();
      if (projects.length === 0) fetchProjects(); // Need projects for phase/member/repository forms
    }
  }, [activeParentTab]);

  const fetchDomains = async () => {
    try {
      setLoadingDomains(true);
      const data = await dashboardService.getAllDomainsForAdmin();
      setDomains(data);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
      showToast("Failed to load domains", "error");
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleAddDomain = () => {
    setEditingDomain(null);
    setShowDomainModal(true);
  };

  const handleEditDomain = (domain) => {
    setEditingDomain(domain);
    setShowDomainModal(true);
  };

  const handleSubmitDomain = async (formData) => {
    try {
      setDomainSubmitError(null);

      if (editingDomain) {
        // Update existing domain
        await dashboardService.updateDomain(editingDomain.id, formData);
        showToast("Domain updated successfully");
      } else {
        // Add new domain
        await dashboardService.addDomain(formData);
        showToast("Domain added successfully");
      }

      setShowDomainModal(false);
      setEditingDomain(null);
      fetchDomains();
    } catch (error) {
      console.error("Failed to save domain:", error);
      if (error.field) {
        setDomainSubmitError({ field: error.field, message: error.message });
      } else {
        showToast("Failed to save domain", "error");
      }
    }
  };

  const handleToggleDomainVisibility = async (domain) => {
    try {
      await dashboardService.toggleDomainVisibility(
        domain.id,
        domain.is_visible,
      );
      showToast(
        domain.is_visible
          ? "Domain hidden successfully"
          : "Domain shown successfully",
      );
      fetchDomains();
    } catch (error) {
      console.error("Failed to toggle domain visibility:", error);
      showToast("Failed to update domain", "error");
    }
  };

  // ========== WORKSPACE HANDLERS ==========

  const fetchWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      const data = await dashboardService.getAllWorkspacesForAdmin();
      setWorkspaces(data);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      showToast("Failed to load workspaces", "error");
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const handleAddWorkspace = () => {
    setEditingWorkspace(null);
    setShowWorkspaceModal(true);
  };

  const handleEditWorkspace = (workspace) => {
    setEditingWorkspace(workspace);
    setShowWorkspaceModal(true);
  };

  const handleSubmitWorkspace = async (formData) => {
    try {
      setWorkspaceSubmitError(null);

      if (editingWorkspace) {
        await dashboardService.updateWorkspace(editingWorkspace.id, formData);
        showToast("Workspace updated successfully");
      } else {
        await dashboardService.addWorkspace(formData);
        showToast("Workspace added successfully");
      }

      setShowWorkspaceModal(false);
      setEditingWorkspace(null);
      fetchWorkspaces();
    } catch (error) {
      console.error("Failed to save workspace:", error);
      if (error.field) {
        setWorkspaceSubmitError({ field: error.field, message: error.message });
      } else {
        showToast("Failed to save workspace", "error");
      }
    }
  };

  const handleToggleWorkspaceVisibility = async (workspace) => {
    try {
      await dashboardService.toggleWorkspaceVisibility(
        workspace.id,
        workspace.is_visible,
      );
      showToast(
        workspace.is_visible
          ? "Workspace hidden successfully"
          : "Workspace shown successfully",
      );
      fetchWorkspaces();
    } catch (error) {
      console.error("Failed to toggle workspace visibility:", error);
      showToast("Failed to update workspace", "error");
    }
  };

  // ========== PROJECT HANDLERS ==========

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await dashboardService.getAllProjectsForAdmin();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      showToast("Failed to load projects", "error");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleSubmitProject = async (formData) => {
    try {
      setProjectSubmitError(null);

      if (editingProject) {
        await dashboardService.updateProject(editingProject.id, formData);
        showToast("Project updated successfully");
      } else {
        await dashboardService.addProject(formData);
        showToast("Project added successfully");
      }

      setShowProjectModal(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error("Failed to save project:", error);
      if (error.field) {
        setProjectSubmitError({ field: error.field, message: error.message });
      } else {
        showToast("Failed to save project", "error");
      }
    }
  };

  const handleToggleProjectVisibility = async (project) => {
    try {
      await dashboardService.toggleProjectVisibility(
        project.id,
        project.is_visible,
      );
      showToast(
        project.is_visible
          ? "Project hidden successfully"
          : "Project shown successfully",
      );
      fetchProjects();
    } catch (error) {
      console.error("Failed to toggle project visibility:", error);
      showToast("Failed to update project", "error");
    }
  };

  // ========== SKILL HANDLERS ==========

  const fetchSkills = async () => {
    try {
      setLoadingSkills(true);
      const data = await dashboardService.getAllSkillsForAdmin();
      setSkills(data);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      showToast("Failed to load skills", "error");
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleAddSkill = () => {
    setEditingSkill(null);
    setShowSkillModal(true);
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setShowSkillModal(true);
  };

  const handleSubmitSkill = async (formData) => {
    try {
      setSkillSubmitError(null);

      if (editingSkill) {
        await dashboardService.updateSkill(editingSkill.id, formData);
        showToast("Skill updated successfully");
      } else {
        await dashboardService.addSkill(formData);
        showToast("Skill added successfully");
      }

      setShowSkillModal(false);
      setEditingSkill(null);
      fetchSkills();
    } catch (error) {
      console.error("Failed to save skill:", error);
      if (error.field) {
        setSkillSubmitError({ field: error.field, message: error.message });
      } else {
        showToast("Failed to save skill", "error");
      }
    }
  };

  const handleToggleSkillVisibility = async (skill) => {
    try {
      await dashboardService.toggleSkillVisibility(skill.id, skill.is_visible);
      showToast(
        skill.is_visible
          ? "Skill hidden successfully"
          : "Skill shown successfully",
      );
      fetchSkills();
    } catch (error) {
      console.error("Failed to toggle skill visibility:", error);
      showToast("Failed to update skill", "error");
    }
  };

  // ========== AI TOOL HANDLERS ==========

  const fetchAITools = async () => {
    try {
      setLoadingAITools(true);
      const data = await dashboardService.getAllAIToolsForAdmin();
      setAITools(data);
    } catch (error) {
      console.error("Failed to fetch AI tools:", error);
      showToast("Failed to load AI tools", "error");
    } finally {
      setLoadingAITools(false);
    }
  };

  const handleAddAITool = () => {
    setEditingAITool(null);
    setShowAIToolModal(true);
  };

  const handleEditAITool = (tool) => {
    setEditingAITool(tool);
    setShowAIToolModal(true);
  };

  const handleSubmitAITool = async (formData) => {
    try {
      setAIToolSubmitError(null);

      if (editingAITool) {
        await dashboardService.updateAITool(editingAITool.id, formData);
        showToast("AI tool updated successfully");
      } else {
        await dashboardService.addAITool(formData);
        showToast("AI tool added successfully");
      }

      setShowAIToolModal(false);
      setEditingAITool(null);
      fetchAITools();
    } catch (error) {
      console.error("Failed to save AI tool:", error);
      if (error.field) {
        setAIToolSubmitError({ field: error.field, message: error.message });
      } else {
        showToast("Failed to save AI tool", "error");
      }
    }
  };

  const handleToggleAIToolVisibility = async (tool) => {
    try {
      await dashboardService.toggleAIToolVisibility(tool.id, tool.is_visible);
      showToast(
        tool.is_visible
          ? "AI tool hidden successfully"
          : "AI tool shown successfully",
      );
      fetchAITools();
    } catch (error) {
      console.error("Failed to toggle AI tool visibility:", error);
      showToast("Failed to update AI tool", "error");
    }
  };

  // ========== VIDEO HANDLERS ==========

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const data = await dashboardService.getAllVideosForAdmin();
      setVideos(data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      showToast("Failed to load videos", "error");
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    setShowVideoModal(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setShowVideoModal(true);
  };

  const handleSubmitVideo = async (formData) => {
    try {
      setVideoSubmitError(null);

      if (editingVideo) {
        await dashboardService.updateVideo(editingVideo.id, formData);
        showToast("Video updated successfully");
      } else {
        await dashboardService.addVideo(formData);
        showToast("Video added successfully");
      }

      setShowVideoModal(false);
      setEditingVideo(null);
      fetchVideos();
    } catch (error) {
      console.error("Failed to save video:", error);
      if (error.field) {
        setVideoSubmitError({ field: error.field, message: error.message });
      } else {
        showToast("Failed to save video", "error");
      }
    }
  };

  const handleToggleVideoVisibility = async (video) => {
    try {
      await dashboardService.toggleVideoVisibility(video.id, video.is_visible);
      showToast(
        video.is_visible
          ? "Video hidden successfully"
          : "Video shown successfully",
      );
      fetchVideos();
    } catch (error) {
      console.error("Failed to toggle video visibility:", error);
      showToast("Failed to update video", "error");
    }
  };

  // ========== PROJECT PHASE HANDLERS ==========

  const fetchPhases = async () => {
    try {
      setLoadingPhases(true);
      const data = await dashboardService.getAllPhasesForAdmin();
      setPhases(data);
    } catch (error) {
      console.error("Failed to fetch phases:", error);
      showToast("Failed to load phases", "error");
    } finally {
      setLoadingPhases(false);
    }
  };

  const handleAddPhase = () => {
    setEditingPhase(null);
    setShowPhaseModal(true);
  };

  const handleEditPhase = (phase) => {
    setEditingPhase(phase);
    setShowPhaseModal(true);
  };

  const handleSubmitPhase = async (formData) => {
    try {
      if (editingPhase) {
        await dashboardService.updatePhase(editingPhase.id, formData);
        showToast("Phase updated successfully");
      } else {
        await dashboardService.addPhase(formData);
        showToast("Phase added successfully");
      }

      setShowPhaseModal(false);
      setEditingPhase(null);
      fetchPhases();
    } catch (error) {
      console.error("Failed to save phase:", error);
      showToast("Failed to save phase", "error");
    }
  };

  const handleTogglePhaseVisibility = async (phase) => {
    try {
      await dashboardService.togglePhaseVisibility(phase.id, phase.is_visible);
      showToast(
        phase.is_visible
          ? "Phase hidden successfully"
          : "Phase shown successfully",
      );
      fetchPhases();
    } catch (error) {
      console.error("Failed to toggle phase visibility:", error);
      showToast("Failed to update phase", "error");
    }
  };

  // ========== PROJECT MEMBER HANDLERS ==========

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const data = await dashboardService.getAllMembersForAdmin();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      showToast("Failed to load members", "error");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleSubmitMember = async (formData) => {
    try {
      if (editingMember) {
        await dashboardService.updateMember(editingMember.id, formData);
        showToast("Member updated successfully");
      } else {
        await dashboardService.addMember(formData);
        showToast("Member added successfully");
      }

      setShowMemberModal(false);
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      console.error("Failed to save member:", error);
      showToast("Failed to save member", "error");
    }
  };

  const handleToggleMemberVisibility = async (member) => {
    try {
      await dashboardService.toggleMemberVisibility(
        member.id,
        member.is_visible,
      );
      showToast(
        member.is_visible
          ? "Member hidden successfully"
          : "Member shown successfully",
      );
      fetchMembers();
    } catch (error) {
      console.error("Failed to toggle member visibility:", error);
      showToast("Failed to update member", "error");
    }
  };

  // ========== PROJECT REPOSITORY FILE HANDLERS ==========

  const fetchRepoFiles = async () => {
    try {
      setLoadingRepoFiles(true);
      const data = await dashboardService.getAllRepositoryFilesForAdmin();
      setRepoFiles(data);
    } catch (error) {
      console.error("Failed to fetch repository files:", error);
      showToast("Failed to load repository files", "error");
    } finally {
      setLoadingRepoFiles(false);
    }
  };

  const handleAddRepoFile = () => {
    setEditingRepoFile(null);
    setShowRepoFileModal(true);
  };

  const handleEditRepoFile = (file) => {
    setEditingRepoFile(file);
    setShowRepoFileModal(true);
  };

  const handleSubmitRepoFile = async (formData) => {
    try {
      if (editingRepoFile) {
        await dashboardService.updateRepositoryFile(
          editingRepoFile.id,
          formData,
        );
        showToast("Document updated successfully");
      } else {
        await dashboardService.addRepositoryFile(formData);
        showToast("Document added successfully");
      }

      setShowRepoFileModal(false);
      setEditingRepoFile(null);
      fetchRepoFiles();
    } catch (error) {
      console.error("Failed to save document:", error);
      showToast("Failed to save document", "error");
    }
  };

  const handleToggleRepoFileVisibility = async (file) => {
    try {
      await dashboardService.toggleRepositoryFileVisibility(
        file.id,
        file.is_visible,
      );
      showToast(
        file.is_visible
          ? "Document hidden successfully"
          : "Document shown successfully",
      );
      fetchRepoFiles();
    } catch (error) {
      console.error("Failed to toggle document visibility:", error);
      showToast("Failed to update document", "error");
    }
  };

  // Filter all data based on active sub-tab and search query
  const filteredDomains = domains.filter((domain) => {
    const matchesVisibility =
      activeSubTab === "active" ? domain.is_visible : !domain.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      domain.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const matchesVisibility =
      activeSubTab === "active" ? workspace.is_visible : !workspace.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      workspace.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      workspace.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.workspace_key
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredProjects = projects.filter((project) => {
    const matchesVisibility =
      activeSubTab === "active" ? project.is_visible : !project.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredSkills = skills.filter((skill) => {
    const matchesVisibility =
      activeSubTab === "active" ? skill.is_visible : !skill.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      skill.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredAITools = aitools.filter((tool) => {
    const matchesVisibility =
      activeSubTab === "active" ? tool.is_visible : !tool.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      tool.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredVideos = videos.filter((video) => {
    const matchesVisibility =
      activeSubTab === "active" ? video.is_visible : !video.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.video_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.prototype_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.status?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredPhases = phases.filter((phase) => {
    const matchesVisibility =
      activeSubTab === "active" ? phase.is_visible : !phase.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      phase.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phase.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phase.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredMembers = members.filter((member) => {
    const matchesVisibility =
      activeSubTab === "active" ? member.is_visible : !member.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const filteredRepoFiles = repoFiles.filter((file) => {
    const matchesVisibility =
      activeSubTab === "active" ? file.is_visible : !file.is_visible;
    const matchesSearch =
      searchQuery === "" ||
      file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.file_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.projects?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  const getAddButtonLabel = () => {
    const projectDetailsLabels = {
      phases: "+ Add Phase",
      members: "+ Add Member",
      repository: "+ Add Document",
    };

    const labels = {
      domains: "+ Add Domain",
      workspaces: "+ Add Workspace",
      projects: "+ Add Project",
      skills: "+ Add Skill",
      aitools: "+ Add AI Tool",
      videos: "+ Add Card",
      projectdetails: projectDetailsLabels[pdSection] || "+ Add",
    };
    return labels[activeParentTab] || "+ Add";
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your application cards and content
          </p>
        </div>
        <button className="settings-close-btn" onClick={() => navigate(-1)}>
          <Icon name="close" size={16} />
          Close
        </button>
      </div>

      <div className="settings-tabs-container">
        <div className="settings-parent-tabs">
          {parentTabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-parent-tab ${activeParentTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveParentTab(tab.id)}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          <div className="settings-sub-header">
            <div className="settings-sub-tabs">
              <button
                className={`settings-sub-tab ${activeSubTab === "active" ? "active" : ""}`}
                onClick={() => setActiveSubTab("active")}
              >
                Active
              </button>
              <button
                className={`settings-sub-tab ${activeSubTab === "inactive" ? "active" : ""}`}
                onClick={() => setActiveSubTab("inactive")}
              >
                Inactive
              </button>
            </div>
            <button
              className="settings-add-btn"
              onClick={() => {
                if (activeParentTab === "domains") handleAddDomain();
                else if (activeParentTab === "workspaces") handleAddWorkspace();
                else if (activeParentTab === "projects") handleAddProject();
                else if (activeParentTab === "skills") handleAddSkill();
                else if (activeParentTab === "aitools") handleAddAITool();
                else if (activeParentTab === "videos") handleAddVideo();
                else if (activeParentTab === "projectdetails") {
                  if (pdSection === "phases") handleAddPhase();
                  else if (pdSection === "members") handleAddMember();
                  else handleAddRepoFile();
                }
              }}
            >
              {getAddButtonLabel()}
            </button>
          </div>
          {/* Project Details sub-section toggle */}
          {activeParentTab === "projectdetails" && (
            <div className="settings-pd-section-toggle">
              <button
                className={`settings-pd-toggle-btn ${pdSection === "phases" ? "active" : ""}`}
                onClick={() => setPdSection("phases")}
              >
                📋 Phases
              </button>
              <button
                className={`settings-pd-toggle-btn ${pdSection === "members" ? "active" : ""}`}
                onClick={() => setPdSection("members")}
              >
                👥 Members
              </button>
              <button
                className={`settings-pd-toggle-btn ${pdSection === "repository" ? "active" : ""}`}
                onClick={() => setPdSection("repository")}
              >
                📁 Repository
              </button>
            </div>
          )}
          {/* Search Bar */}
          <div className="settings-search-wrap">
            <Icon name="search" size={16} color="var(--muted)" />
            <input
              type="text"
              className="settings-search"
              placeholder={`Search ${activeParentTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="settings-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <div className="settings-list">
            {activeParentTab === "domains" && (
              <>
                {loadingDomains ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading domains...</p>
                  </div>
                ) : filteredDomains.length > 0 ? (
                  <>
                    {filteredDomains.map((domain) => (
                      <DomainListItem
                        key={domain.id}
                        domain={domain}
                        onEdit={handleEditDomain}
                        onToggleVisibility={handleToggleDomainVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredDomains.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredDomains.length === 1 ? "domain" : "domains"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">📊</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Domains
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "All domains are currently hidden. Switch to Inactive tab to view them."
                        : "No hidden domains. All domains are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "workspaces" && (
              <>
                {loadingWorkspaces ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading workspaces...</p>
                  </div>
                ) : filteredWorkspaces.length > 0 ? (
                  <>
                    {filteredWorkspaces.map((workspace) => (
                      <WorkspaceListItem
                        key={workspace.id}
                        workspace={workspace}
                        onEdit={handleEditWorkspace}
                        onToggleVisibility={handleToggleWorkspaceVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredWorkspaces.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredWorkspaces.length === 1
                        ? "workspace"
                        : "workspaces"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">🏢</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Workspaces
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "All workspaces are currently hidden. Switch to Inactive tab to view them."
                        : "No hidden workspaces. All workspaces are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "projects" && (
              <>
                {loadingProjects ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading projects...</p>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <>
                    {filteredProjects.map((project) => (
                      <ProjectListItem
                        key={project.id}
                        project={project}
                        onEdit={handleEditProject}
                        onToggleVisibility={handleToggleProjectVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredProjects.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredProjects.length === 1 ? "project" : "projects"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">📁</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Projects
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "All projects are currently hidden. Switch to Inactive tab to view them."
                        : "No hidden projects. All projects are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "skills" && (
              <>
                {loadingSkills ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading skills...</p>
                  </div>
                ) : filteredSkills.length > 0 ? (
                  <>
                    {filteredSkills.map((skill) => (
                      <SkillListItem
                        key={skill.id}
                        skill={skill}
                        onEdit={handleEditSkill}
                        onToggleVisibility={handleToggleSkillVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredSkills.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredSkills.length === 1 ? "skill" : "skills"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">🎯</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Skills
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "All skills are currently hidden. Switch to Inactive tab to view them."
                        : "No hidden skills. All skills are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "aitools" && (
              <>
                {loadingAITools ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading AI tools...</p>
                  </div>
                ) : filteredAITools.length > 0 ? (
                  <>
                    {filteredAITools.map((tool) => (
                      <AIToolListItem
                        key={tool.id}
                        tool={tool}
                        onEdit={handleEditAITool}
                        onToggleVisibility={handleToggleAIToolVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredAITools.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredAITools.length === 1 ? "AI tool" : "AI tools"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">🤖</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"} AI
                      Tools
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "All AI tools are currently hidden. Switch to Inactive tab to view them."
                        : "No hidden AI tools. All AI tools are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "videos" && (
              <>
                {loadingVideos ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading videos...</p>
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <>
                    {filteredVideos.map((video) => (
                      <VideoListItem
                        key={video.id}
                        video={video}
                        onEdit={handleEditVideo}
                        onToggleVisibility={handleToggleVideoVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredVideos.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredVideos.length === 1 ? "video" : "videos"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">🎥</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Videos
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "All videos are currently hidden. Switch to Inactive tab to view them."
                        : "No hidden videos. All videos are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "projectdetails" && pdSection === "phases" && (
              <>
                {loadingPhases ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading phases...</p>
                  </div>
                ) : filteredPhases.length > 0 ? (
                  <>
                    {filteredPhases.map((phase) => (
                      <ProjectPhaseListItem
                        key={phase.id}
                        phase={phase}
                        onEdit={handleEditPhase}
                        onToggleVisibility={handleTogglePhaseVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredPhases.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredPhases.length === 1 ? "phase" : "phases"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">📋</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Phases
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "No active phases. Add a phase or switch to Inactive tab."
                        : "No hidden phases. All phases are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "projectdetails" && pdSection === "members" && (
              <>
                {loadingMembers ? (
                  <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading members...</p>
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <>
                    {filteredMembers.map((member) => (
                      <ProjectMemberListItem
                        key={member.id}
                        member={member}
                        onEdit={handleEditMember}
                        onToggleVisibility={handleToggleMemberVisibility}
                      />
                    ))}
                    <div className="settings-list-footer">
                      Showing {filteredMembers.length}{" "}
                      {activeSubTab === "active" ? "active" : "hidden"}{" "}
                      {filteredMembers.length === 1 ? "member" : "members"}
                    </div>
                  </>
                ) : (
                  <div className="settings-empty">
                    <div className="settings-empty-icon">👤</div>
                    <h3>
                      No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                      Members
                    </h3>
                    <p>
                      {activeSubTab === "active"
                        ? "No active members. Add a member or switch to Inactive tab."
                        : "No hidden members. All members are currently active."}
                    </p>
                  </div>
                )}
              </>
            )}
            {activeParentTab === "projectdetails" &&
              pdSection === "repository" && (
                <>
                  {loadingRepoFiles ? (
                    <div className="dashboard-loading">
                      <div className="loading-spinner"></div>
                      <p>Loading repository files...</p>
                    </div>
                  ) : filteredRepoFiles.length > 0 ? (
                    <>
                      {filteredRepoFiles.map((file) => (
                        <ProjectRepositoryFileListItem
                          key={file.id}
                          file={file}
                          onEdit={handleEditRepoFile}
                          onToggleVisibility={handleToggleRepoFileVisibility}
                        />
                      ))}
                      <div className="settings-list-footer">
                        Showing {filteredRepoFiles.length}{" "}
                        {activeSubTab === "active" ? "active" : "hidden"}{" "}
                        {filteredRepoFiles.length === 1
                          ? "document"
                          : "documents"}
                      </div>
                    </>
                  ) : (
                    <div className="settings-empty">
                      <div className="settings-empty-icon">📁</div>
                      <h3>
                        No {activeSubTab === "active" ? "Active" : "Hidden"}{" "}
                        Documents
                      </h3>
                      <p>
                        {activeSubTab === "active"
                          ? "No active documents. Add a document or switch to Inactive tab."
                          : "No hidden documents. All documents are currently active."}
                      </p>
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>

      {/* Domain Modal */}
      {showDomainModal && (
        <Modal
          isOpen={showDomainModal}
          onClose={() => {
            setShowDomainModal(false);
            setEditingDomain(null);
            setDomainSubmitError(null);
          }}
          title={editingDomain ? "Edit Domain" : "Add New Domain"}
        >
          <DomainForm
            domain={editingDomain}
            domains={domains}
            submitError={domainSubmitError}
            onSubmit={handleSubmitDomain}
            onCancel={() => {
              setShowDomainModal(false);
              setEditingDomain(null);
              setDomainSubmitError(null);
            }}
          />
        </Modal>
      )}

      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <Modal
          isOpen={showWorkspaceModal}
          onClose={() => {
            setShowWorkspaceModal(false);
            setEditingWorkspace(null);
            setWorkspaceSubmitError(null);
          }}
          title={editingWorkspace ? "Edit Workspace" : "Add New Workspace"}
        >
          <WorkspaceForm
            workspace={editingWorkspace}
            domains={domains}
            workspaces={workspaces}
            submitError={workspaceSubmitError}
            onSubmit={handleSubmitWorkspace}
            onCancel={() => {
              setShowWorkspaceModal(false);
              setEditingWorkspace(null);
              setWorkspaceSubmitError(null);
            }}
          />
        </Modal>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <Modal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
            setProjectSubmitError(null);
          }}
          title={editingProject ? "Edit Project" : "Add New Project"}
        >
          <ProjectForm
            project={editingProject}
            workspaces={workspaces}
            projects={projects}
            submitError={projectSubmitError}
            onSubmit={handleSubmitProject}
            onCancel={() => {
              setShowProjectModal(false);
              setEditingProject(null);
              setProjectSubmitError(null);
            }}
          />
        </Modal>
      )}

      {/* Skill Modal */}
      {showSkillModal && (
        <Modal
          isOpen={showSkillModal}
          onClose={() => {
            setShowSkillModal(false);
            setEditingSkill(null);
            setSkillSubmitError(null);
          }}
          title={editingSkill ? "Edit Skill" : "Add New Skill"}
        >
          <SkillForm
            skill={editingSkill}
            domains={domains}
            skills={skills}
            submitError={skillSubmitError}
            onSubmit={handleSubmitSkill}
            onCancel={() => {
              setShowSkillModal(false);
              setEditingSkill(null);
              setSkillSubmitError(null);
            }}
          />
        </Modal>
      )}

      {/* AI Tool Modal */}
      {showAIToolModal && (
        <Modal
          isOpen={showAIToolModal}
          onClose={() => {
            setShowAIToolModal(false);
            setEditingAITool(null);
            setAIToolSubmitError(null);
          }}
          title={editingAITool ? "Edit AI Tool" : "Add New AI Tool"}
        >
          <AIToolForm
            tool={editingAITool}
            domains={domains}
            aiTools={aitools}
            submitError={aiToolSubmitError}
            onSubmit={handleSubmitAITool}
            onCancel={() => {
              setShowAIToolModal(false);
              setEditingAITool(null);
              setAIToolSubmitError(null);
            }}
          />
        </Modal>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <Modal
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setEditingVideo(null);
            setVideoSubmitError(null);
          }}
          title={editingVideo ? "Edit Card" : "Add New Card"}
        >
          <VideoForm
            video={editingVideo}
            domains={domains}
            videos={videos}
            submitError={videoSubmitError}
            onSubmit={handleSubmitVideo}
            onCancel={() => {
              setShowVideoModal(false);
              setEditingVideo(null);
              setVideoSubmitError(null);
            }}
          />
        </Modal>
      )}

      {/* Phase Modal */}
      {showPhaseModal && (
        <Modal
          isOpen={showPhaseModal}
          onClose={() => {
            setShowPhaseModal(false);
            setEditingPhase(null);
          }}
          title={editingPhase ? "Edit Phase" : "Add New Phase"}
        >
          <ProjectPhaseForm
            phase={editingPhase}
            projects={projects}
            onSubmit={handleSubmitPhase}
            onCancel={() => {
              setShowPhaseModal(false);
              setEditingPhase(null);
            }}
          />
        </Modal>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <Modal
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false);
            setEditingMember(null);
          }}
          title={editingMember ? "Edit Member" : "Add New Member"}
        >
          <ProjectMemberForm
            member={editingMember}
            projects={projects}
            onSubmit={handleSubmitMember}
            onCancel={() => {
              setShowMemberModal(false);
              setEditingMember(null);
            }}
          />
        </Modal>
      )}

      {/* Repository File Modal */}
      {showRepoFileModal && (
        <Modal
          isOpen={showRepoFileModal}
          onClose={() => {
            setShowRepoFileModal(false);
            setEditingRepoFile(null);
          }}
          title={editingRepoFile ? "Edit Document" : "Add New Document"}
        >
          <RepositoryFileForm
            file={editingRepoFile}
            projects={projects}
            onSubmit={handleSubmitRepoFile}
            onCancel={() => {
              setShowRepoFileModal(false);
              setEditingRepoFile(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};
