// Dashboard Service - Dashboard Page Content

import { supabase } from "../lib/supabase";

// Maps a Postgres unique constraint name to the form field it protects and
// the message to show inline. Extend this when adding a unique constraint
// for another entity (e.g. domains.slug).
const UNIQUE_CONSTRAINTS = {
  workspaces_name_unique: {
    field: "name",
    message: "A workspace with this name already exists",
  },
  workspaces_key_unique: {
    field: "workspace_key",
    message: "A workspace with this key already exists",
  },
  domains_name_unique: {
    field: "name",
    message: "A domain with this name already exists",
  },
  domains_slug_unique: {
    field: "slug",
    message: "A domain with this slug already exists",
  },
  projects_workspace_title_unique: {
    field: "title",
    message: "A project with this title already exists in this workspace",
  },
  skills_domain_title_unique: {
    field: "title",
    message: "A skill with this title already exists in this domain",
  },
  ai_tools_domain_title_unique: {
    field: "title",
    message: "An AI tool with this title already exists in this domain",
  },
  videos_domain_title_unique: {
    field: "title",
    message: "A video/card with this title already exists in this domain",
  },
};

// Postgres unique_violation (23505) -> rethrow with a `field` so the UI can
// show it as an inline form error instead of a generic toast.
const toDuplicateAwareError = (error) => {
  if (error.code === "23505") {
    const match = Object.entries(UNIQUE_CONSTRAINTS).find(([constraintName]) =>
      error.message?.includes(constraintName),
    );
    if (match) {
      const [, { field, message }] = match;
      const dupError = new Error(message);
      dupError.field = field;
      return dupError;
    }
  }
  return error;
};

export const dashboardService = {
  // Get dashboard header content (badge, title, subtitle)
  getDashboardContent: () => {
    return {
      badge: "Welcome back, User",
      title: "One GuideWell AI",
      subtitle:
        "Understands intent, Engages AI and humans — Select a domain to explore",
    };
  },

  // Fetch domain cards from Supabase
  getDomainCards: async () => {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching domains from Supabase:", error);
      throw error;
    }

    // Explicit icon mapping from guidewell-html landing page icons
    const htmlIconMap = {
      swe: "code",
      itops: "server",
      mod: "building",
      biz: "trendingUp",
      mkt: "layoutList",
      intel: "database",
      gov: "shieldCheck",
      cat: "affiliate",
    };

    // Transform Supabase data to match expected format
    const firstCardAccentColor = data[0]?.accent_color || "#1e6bff";

    return data.map((domain) => {
      const accentColor =
        domain.slug === "intel" ? firstCardAccentColor : domain.accent_color;

      return {
        slug: domain.slug,
        title: domain.name,
        description: domain.description,
        accentColor: accentColor,
        iconKey: htmlIconMap[domain.slug] || domain.icon_name,
        iconBg: `rgba(${hexToRgb(accentColor)}, 0.18)`,
        route: domain.route,
        badgeText: domain.badge_text,
        metrics: domain.metrics,
      };
    });
  },

  // Get single domain by slug
  getDomainBySlug: async (slug) => {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("slug", slug)
      .eq("is_visible", true)
      .single();

    if (error) {
      console.error(`Error fetching domain ${slug}:`, error);
      throw error;
    }

    const accentColor = data.slug === "intel" ? "#1e6bff" : data.accent_color;

    return {
      slug: data.slug,
      title: data.name,
      description: data.description,
      accentColor: accentColor,
      iconKey: data.icon_name,
      iconBg: `rgba(${hexToRgb(accentColor)}, 0.18)`,
      route: data.route,
      badgeText: data.badge_text,
      metrics: data.metrics,
    };
  },

  // ========== ADMIN FUNCTIONS ==========

  // Get ALL domains (including hidden) for admin management
  getAllDomainsForAdmin: async () => {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all domains:", error);
      throw error;
    }

    return data;
  },

  // Add new domain
  addDomain: async (domainData) => {
    const { data, error } = await supabase
      .from("domains")
      .insert([
        {
          slug: domainData.slug,
          name: domainData.name,
          description: domainData.description,
          route: domainData.route,
          icon_name: domainData.icon_name,
          accent_color: domainData.accent_color,
          badge_text: domainData.badge_text,
          metrics: domainData.metrics || {},
          is_visible:
            domainData.is_visible !== undefined ? domainData.is_visible : true,
          display_order: domainData.display_order || 999,
          status: domainData.status || "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding domain:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Update existing domain
  updateDomain: async (id, domainData) => {
    const updateData = {};

    if (domainData.slug !== undefined) updateData.slug = domainData.slug;
    if (domainData.name !== undefined) updateData.name = domainData.name;
    if (domainData.description !== undefined)
      updateData.description = domainData.description;
    if (domainData.route !== undefined) updateData.route = domainData.route;
    if (domainData.icon_name !== undefined)
      updateData.icon_name = domainData.icon_name;
    if (domainData.accent_color !== undefined)
      updateData.accent_color = domainData.accent_color;
    if (domainData.badge_text !== undefined)
      updateData.badge_text = domainData.badge_text;
    if (domainData.metrics !== undefined)
      updateData.metrics = domainData.metrics;
    if (domainData.is_visible !== undefined)
      updateData.is_visible = domainData.is_visible;
    if (domainData.display_order !== undefined)
      updateData.display_order = domainData.display_order;
    if (domainData.status !== undefined) updateData.status = domainData.status;

    const { data, error } = await supabase
      .from("domains")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating domain:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Toggle domain visibility (hide/unhide)
  toggleDomainVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("domains")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling domain visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== WORKSPACE ADMIN FUNCTIONS ==========

  // Get ALL workspaces (including hidden) for admin management
  getAllWorkspacesForAdmin: async () => {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*, domains(name, slug)")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all workspaces:", error);
      throw error;
    }

    return data;
  },

  // Add new workspace
  addWorkspace: async (workspaceData) => {
    const { data, error } = await supabase
      .from("workspaces")
      .insert([
        {
          domain_id: workspaceData.domain_id,
          workspace_key: workspaceData.workspace_key,
          name: workspaceData.name,
          description: workspaceData.description,
          category: workspaceData.category,
          app_badge: workspaceData.app_badge,
          badge_color: workspaceData.badge_color,
          projects_count: workspaceData.projects_count || 0,
          members_count: workspaceData.members_count || 0,
          is_visible:
            workspaceData.is_visible !== undefined
              ? workspaceData.is_visible
              : true,
          include_l3_pipeline:
            workspaceData.include_l3_pipeline !== undefined
              ? workspaceData.include_l3_pipeline
              : false,
          display_order: workspaceData.display_order || 999,
          status: workspaceData.status || "active",
        },
      ])
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error adding workspace:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Update existing workspace
  updateWorkspace: async (id, workspaceData) => {
    const updateData = {};

    if (workspaceData.domain_id !== undefined)
      updateData.domain_id = workspaceData.domain_id;
    if (workspaceData.workspace_key !== undefined)
      updateData.workspace_key = workspaceData.workspace_key;
    if (workspaceData.name !== undefined) updateData.name = workspaceData.name;
    if (workspaceData.description !== undefined)
      updateData.description = workspaceData.description;
    if (workspaceData.category !== undefined)
      updateData.category = workspaceData.category;
    if (workspaceData.app_badge !== undefined)
      updateData.app_badge = workspaceData.app_badge;
    if (workspaceData.badge_color !== undefined)
      updateData.badge_color = workspaceData.badge_color;
    if (workspaceData.projects_count !== undefined)
      updateData.projects_count = workspaceData.projects_count;
    if (workspaceData.members_count !== undefined)
      updateData.members_count = workspaceData.members_count;
    if (workspaceData.is_visible !== undefined)
      updateData.is_visible = workspaceData.is_visible;
    if (workspaceData.include_l3_pipeline !== undefined)
      updateData.include_l3_pipeline = workspaceData.include_l3_pipeline;
    if (workspaceData.display_order !== undefined)
      updateData.display_order = workspaceData.display_order;
    if (workspaceData.status !== undefined)
      updateData.status = workspaceData.status;

    const { data, error } = await supabase
      .from("workspaces")
      .update(updateData)
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error updating workspace:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Toggle workspace visibility (hide/unhide)
  toggleWorkspaceVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("workspaces")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error toggling workspace visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== PROJECT ADMIN FUNCTIONS ==========

  // Get ALL projects (including hidden) for admin management
  getAllProjectsForAdmin: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*, workspaces(name, workspace_key, domains(name, slug))")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all projects:", error);
      throw error;
    }

    return data;
  },

  // Add new project
  addProject: async (projectData) => {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          workspace_id: projectData.workspace_id,
          title: projectData.title,
          description: projectData.description,
          type: projectData.type,
          status: projectData.status,
          progress: projectData.progress || 0,
          due_date: projectData.due_date,
          members_count: projectData.members_count || 0,
          is_visible:
            projectData.is_visible !== undefined
              ? projectData.is_visible
              : true,
          display_order: projectData.display_order || 999,
        },
      ])
      .select("*, workspaces(name, workspace_key, domains(name, slug))")
      .single();

    if (error) {
      console.error("Error adding project:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Update existing project
  updateProject: async (id, projectData) => {
    const updateData = {};

    if (projectData.workspace_id !== undefined)
      updateData.workspace_id = projectData.workspace_id;
    if (projectData.title !== undefined) updateData.title = projectData.title;
    if (projectData.description !== undefined)
      updateData.description = projectData.description;
    if (projectData.type !== undefined) updateData.type = projectData.type;
    if (projectData.status !== undefined)
      updateData.status = projectData.status;
    if (projectData.progress !== undefined)
      updateData.progress = projectData.progress;
    if (projectData.due_date !== undefined)
      updateData.due_date = projectData.due_date;
    if (projectData.members_count !== undefined)
      updateData.members_count = projectData.members_count;
    if (projectData.is_visible !== undefined)
      updateData.is_visible = projectData.is_visible;
    if (projectData.display_order !== undefined)
      updateData.display_order = projectData.display_order;

    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .select("*, workspaces(name, workspace_key, domains(name, slug))")
      .single();

    if (error) {
      console.error("Error updating project:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Toggle project visibility (hide/unhide)
  toggleProjectVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("projects")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, workspaces(name, workspace_key, domains(name, slug))")
      .single();

    if (error) {
      console.error("Error toggling project visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== SKILL ADMIN FUNCTIONS ==========

  // Get ALL skills (including hidden) for admin management
  getAllSkillsForAdmin: async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*, domains(name, slug)")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all skills:", error);
      throw error;
    }

    return data;
  },

  // Add new skill
  addSkill: async (skillData) => {
    const { data, error } = await supabase
      .from("skills")
      .insert([
        {
          domain_id: skillData.domain_id,
          title: skillData.title,
          description: skillData.description,
          emoji: skillData.emoji,
          category: skillData.category,
          is_visible:
            skillData.is_visible !== undefined ? skillData.is_visible : true,
          display_order: skillData.display_order || 999,
        },
      ])
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error adding skill:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Update existing skill
  updateSkill: async (id, skillData) => {
    const updateData = {};

    if (skillData.domain_id !== undefined)
      updateData.domain_id = skillData.domain_id;
    if (skillData.title !== undefined) updateData.title = skillData.title;
    if (skillData.description !== undefined)
      updateData.description = skillData.description;
    if (skillData.emoji !== undefined) updateData.emoji = skillData.emoji;
    if (skillData.category !== undefined)
      updateData.category = skillData.category;
    if (skillData.is_visible !== undefined)
      updateData.is_visible = skillData.is_visible;
    if (skillData.display_order !== undefined)
      updateData.display_order = skillData.display_order;

    const { data, error } = await supabase
      .from("skills")
      .update(updateData)
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error updating skill:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Toggle skill visibility (hide/unhide)
  toggleSkillVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("skills")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error toggling skill visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== AI TOOL ADMIN FUNCTIONS ==========

  // Get ALL AI tools (including hidden) for admin management
  getAllAIToolsForAdmin: async () => {
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*, domains(name, slug)")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all AI tools:", error);
      throw error;
    }

    return data;
  },

  // Add new AI tool
  addAITool: async (toolData) => {
    const { data, error } = await supabase
      .from("ai_tools")
      .insert([
        {
          domain_id: toolData.domain_id,
          title: toolData.title,
          description: toolData.description,
          emoji: toolData.emoji,
          category: toolData.category,
          is_visible:
            toolData.is_visible !== undefined ? toolData.is_visible : true,
          display_order: toolData.display_order || 999,
        },
      ])
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error adding AI tool:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Update existing AI tool
  updateAITool: async (id, toolData) => {
    const updateData = {};

    if (toolData.domain_id !== undefined)
      updateData.domain_id = toolData.domain_id;
    if (toolData.title !== undefined) updateData.title = toolData.title;
    if (toolData.description !== undefined)
      updateData.description = toolData.description;
    if (toolData.emoji !== undefined) updateData.emoji = toolData.emoji;
    if (toolData.category !== undefined)
      updateData.category = toolData.category;
    if (toolData.is_visible !== undefined)
      updateData.is_visible = toolData.is_visible;
    if (toolData.display_order !== undefined)
      updateData.display_order = toolData.display_order;

    const { data, error } = await supabase
      .from("ai_tools")
      .update(updateData)
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error updating AI tool:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Toggle AI tool visibility (hide/unhide)
  toggleAIToolVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("ai_tools")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error toggling AI tool visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== VIDEO ADMIN OPERATIONS ==========

  // Get all videos for admin (including hidden)
  getAllVideosForAdmin: async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*, domains(name, slug)")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all videos:", error);
      throw error;
    }

    return data;
  },

  // Add new video
  addVideo: async (videoData) => {
    const { data, error } = await supabase
      .from("videos")
      .insert([
        {
          domain_id: videoData.domain_id,
          title: videoData.title,
          description: videoData.description,
          video_url: videoData.video_url || null,
          prototype_url: videoData.prototype_url || null,
          status: videoData.status || "active",
          is_visible:
            videoData.is_visible !== undefined ? videoData.is_visible : true,
          display_order: videoData.display_order || 999,
        },
      ])
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error adding video:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Update existing video
  updateVideo: async (id, videoData) => {
    const updateData = {};

    if (videoData.domain_id !== undefined)
      updateData.domain_id = videoData.domain_id;
    if (videoData.title !== undefined) updateData.title = videoData.title;
    if (videoData.description !== undefined)
      updateData.description = videoData.description;
    if (videoData.video_url !== undefined)
      updateData.video_url = videoData.video_url || null;
    if (videoData.prototype_url !== undefined)
      updateData.prototype_url = videoData.prototype_url || null;
    if (videoData.status !== undefined) updateData.status = videoData.status;
    if (videoData.is_visible !== undefined)
      updateData.is_visible = videoData.is_visible;
    if (videoData.display_order !== undefined)
      updateData.display_order = videoData.display_order;

    const { data, error } = await supabase
      .from("videos")
      .update(updateData)
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error updating video:", error);
      throw toDuplicateAwareError(error);
    }

    return data;
  },

  // Toggle video visibility (hide/unhide)
  toggleVideoVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("videos")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, domains(name, slug)")
      .single();

    if (error) {
      console.error("Error toggling video visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== PROJECT DETAIL ADMIN FUNCTIONS ==========

  // Get single project by ID
  getProjectById: async (projectId) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*, workspaces(name, workspace_key, domains(name, slug))")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project by ID:", error);
      throw error;
    }

    return data;
  },

  // ========== PROJECT PROGRESS SYNC HELPER ==========

  // Recalculate project progress from visible phases average and update project
  recalculateProjectProgress: async (projectId) => {
    try {
      // Fetch all visible phases for this project
      const { data: phases, error: fetchError } = await supabase
        .from("project_phases")
        .select("progress")
        .eq("project_id", projectId)
        .eq("is_visible", true);

      if (fetchError) throw fetchError;

      // Compute average progress
      const avgProgress =
        phases.length > 0
          ? Math.round(
              phases.reduce((sum, p) => sum + p.progress, 0) / phases.length,
            )
          : 0;

      // Auto-derive status
      const newStatus = avgProgress === 100 ? "Completed" : "In Progress";

      // Update the project
      const { error: updateError } = await supabase
        .from("projects")
        .update({ progress: avgProgress, status: newStatus })
        .eq("id", projectId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error recalculating project progress:", error);
    }
  },

  // ========== PROJECT PHASE ADMIN FUNCTIONS ==========

  // Get ALL phases for a project (including hidden) for admin
  getAllPhasesForAdmin: async (projectId) => {
    let query = supabase
      .from("project_phases")
      .select("*, projects(title, workspaces(name))")
      .order("display_order", { ascending: true });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all phases:", error);
      throw error;
    }

    return data;
  },

  // Add new phase
  addPhase: async (phaseData) => {
    const { data, error } = await supabase
      .from("project_phases")
      .insert([
        {
          project_id: phaseData.project_id,
          title: phaseData.title,
          subtitle: phaseData.subtitle || null,
          description: phaseData.description || null,
          icon_emoji: phaseData.icon_emoji || "🔒",
          progress: phaseData.progress || 0,
          is_current_phase: phaseData.is_current_phase || false,
          is_visible: true,
          display_order: phaseData.display_order || 999,
        },
      ])
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error adding phase:", error);
      throw error;
    }

    // Recalculate project progress after adding phase
    await dashboardService.recalculateProjectProgress(phaseData.project_id);

    return data;
  },

  // Update existing phase
  updatePhase: async (id, phaseData) => {
    const updateData = {};

    if (phaseData.project_id !== undefined)
      updateData.project_id = phaseData.project_id;
    if (phaseData.title !== undefined) updateData.title = phaseData.title;
    if (phaseData.subtitle !== undefined)
      updateData.subtitle = phaseData.subtitle;
    if (phaseData.description !== undefined)
      updateData.description = phaseData.description;
    if (phaseData.icon_emoji !== undefined)
      updateData.icon_emoji = phaseData.icon_emoji;
    if (phaseData.progress !== undefined)
      updateData.progress = phaseData.progress;
    if (phaseData.is_current_phase !== undefined)
      updateData.is_current_phase = phaseData.is_current_phase;
    if (phaseData.is_visible !== undefined)
      updateData.is_visible = phaseData.is_visible;
    if (phaseData.display_order !== undefined)
      updateData.display_order = phaseData.display_order;

    const { data, error } = await supabase
      .from("project_phases")
      .update(updateData)
      .eq("id", id)
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error updating phase:", error);
      throw error;
    }

    // Recalculate project progress after updating phase
    const projectId = phaseData.project_id || data.project_id;
    await dashboardService.recalculateProjectProgress(projectId);

    return data;
  },

  // Toggle phase visibility
  togglePhaseVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("project_phases")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error toggling phase visibility:", error);
      throw error;
    }

    // Recalculate project progress after toggling visibility
    await dashboardService.recalculateProjectProgress(data.project_id);

    return data;
  },

  // ========== PROJECT MEMBER ADMIN FUNCTIONS ==========

  // Get ALL members for a project (including hidden) for admin
  getAllMembersForAdmin: async (projectId) => {
    let query = supabase
      .from("project_members")
      .select("*, projects(title, workspaces(name))")
      .order("display_order", { ascending: true });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all members:", error);
      throw error;
    }

    return data;
  },

  // Add new member
  addMember: async (memberData) => {
    const { data, error } = await supabase
      .from("project_members")
      .insert([
        {
          project_id: memberData.project_id,
          name: memberData.name,
          role: memberData.role,
          avatar_color: memberData.avatar_color || "#6366f1",
          is_visible: true,
          display_order: memberData.display_order || 999,
        },
      ])
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error adding member:", error);
      throw error;
    }

    return data;
  },

  // Update existing member
  updateMember: async (id, memberData) => {
    const updateData = {};

    if (memberData.project_id !== undefined)
      updateData.project_id = memberData.project_id;
    if (memberData.name !== undefined) updateData.name = memberData.name;
    if (memberData.role !== undefined) updateData.role = memberData.role;
    if (memberData.avatar_color !== undefined)
      updateData.avatar_color = memberData.avatar_color;
    if (memberData.is_visible !== undefined)
      updateData.is_visible = memberData.is_visible;
    if (memberData.display_order !== undefined)
      updateData.display_order = memberData.display_order;

    const { data, error } = await supabase
      .from("project_members")
      .update(updateData)
      .eq("id", id)
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error updating member:", error);
      throw error;
    }

    return data;
  },

  // Toggle member visibility
  toggleMemberVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("project_members")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error toggling member visibility:", error);
      throw error;
    }

    return data;
  },

  // ========== PROJECT REPOSITORY FILE ADMIN FUNCTIONS ==========

  // Get ALL repository files for a project (including hidden) for admin
  getAllRepositoryFilesForAdmin: async (projectId) => {
    let query = supabase
      .from("project_repository_files")
      .select("*, projects(title, workspaces(name))")
      .order("display_order", { ascending: true });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching all repository files:", error);
      throw error;
    }

    return data;
  },

  // Add new repository file
  addRepositoryFile: async (fileData) => {
    const { data, error } = await supabase
      .from("project_repository_files")
      .insert([
        {
          project_id: fileData.project_id,
          file_name: fileData.file_name,
          file_type: fileData.file_type,
          file_url: fileData.file_url || null,
          is_visible: true,
          display_order: fileData.display_order || 999,
        },
      ])
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error adding repository file:", error);
      throw error;
    }

    return data;
  },

  // Update existing repository file
  updateRepositoryFile: async (id, fileData) => {
    const updateData = {};

    if (fileData.project_id !== undefined)
      updateData.project_id = fileData.project_id;
    if (fileData.file_name !== undefined)
      updateData.file_name = fileData.file_name;
    if (fileData.file_type !== undefined)
      updateData.file_type = fileData.file_type;
    if (fileData.file_url !== undefined)
      updateData.file_url = fileData.file_url || null;
    if (fileData.is_visible !== undefined)
      updateData.is_visible = fileData.is_visible;
    if (fileData.display_order !== undefined)
      updateData.display_order = fileData.display_order;

    const { data, error } = await supabase
      .from("project_repository_files")
      .update(updateData)
      .eq("id", id)
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error updating repository file:", error);
      throw error;
    }

    return data;
  },

  // Toggle repository file visibility
  toggleRepositoryFileVisibility: async (id, currentVisibility) => {
    const { data, error } = await supabase
      .from("project_repository_files")
      .update({ is_visible: !currentVisibility })
      .eq("id", id)
      .select("*, projects(title, workspaces(name))")
      .single();

    if (error) {
      console.error("Error toggling repository file visibility:", error);
      throw error;
    }

    return data;
  },
};

// Helper: Convert hex color to RGB values for backgrounds
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "30, 107, 255"; // Default blue
}
