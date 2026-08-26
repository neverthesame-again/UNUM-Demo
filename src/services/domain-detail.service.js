// Domain Detail Service - Domain Detail Page Content

import { supabase } from '../lib/supabase';
import { dashboardService } from './dashboard.service';

export const domainDetailService = {
  // Get domain by slug - fetches from backend
  getDomainBySlug: async (slug) => {
    return await dashboardService.getDomainBySlug(slug);
  },

  // Fetch workspaces for a domain
  getWorkspacesByDomainSlug: async (domainSlug) => {
    // First get domain ID from slug
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('id')
      .eq('slug', domainSlug)
      .single();

    if (domainError) throw domainError;

    // Then fetch workspaces
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('domain_id', domain.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Transform to match expected format
    return data.map(w => ({
      id: w.workspace_key,
      name: w.name,
      description: w.description,
      category: w.category,
      appBadge: w.app_badge,
      badgeColor: w.badge_color,
      projects: w.projects_count,
      members: w.members_count,
      includeL3Pipeline: w.include_l3_pipeline
    }));
  },

  // Fetch videos for a domain
  getVideosByDomainSlug: async (domainSlug) => {
    // First get domain ID from slug
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('id')
      .eq('slug', domainSlug)
      .single();

    if (domainError) throw domainError;

    // Then fetch videos
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('domain_id', domain.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const items = data.map((v) => ({
      title: v.title,
      description: v.description,
      videoUrl: v.video_url,
      prototypeUrl: v.prototype_url,
    }));

    // Ensure AI Governance domain has the TCS Dashboard card linking to /tcs-dashboard
    if (domainSlug === "gov" && !items.some((item) => item.title?.toLowerCase().includes("tcs dashboard"))) {
      items.unshift({
        title: "TCS Dashboard",
        description:
          "Intelligent AIOps platform with AI-powered insights, observability metrics, and operational excellence dashboards",
        videoUrl: null,
        prototypeUrl: "/tcs-dashboard",
      });
    }

    return items;
  },

  // Get categories for a domain's workspaces
  getCategoriesByDomainSlug: async (domainSlug) => {
    // First get domain ID from slug
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('id')
      .eq('slug', domainSlug)
      .single();

    if (domainError) throw domainError;

    // Get unique categories from workspaces
    const { data, error } = await supabase
      .from('workspaces')
      .select('category')
      .eq('domain_id', domain.id)
      .eq('is_visible', true);

    if (error) throw error;

    const sortedCategories = Array.from(
      new Set(data.map((w) => w.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    const categories = ['All', ...sortedCategories];
    return categories;
  },

  // Fetch projects for a workspace
  getProjectsByWorkspaceId: async (workspaceId) => {
    // Get workspace UUID from workspace_key
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('workspace_key', workspaceId)
      .single();

    if (workspaceError) throw workspaceError;

    // Then fetch projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspace.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      status: p.status,
      progress: p.progress,
      dueDate: p.due_date,
      members: p.members_count
    }));
  },

  // Fetch skills for a domain
  getSkillsByDomainSlug: async (domainSlug) => {
    // First get domain ID from slug
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('id')
      .eq('slug', domainSlug)
      .single();

    if (domainError) throw domainError;

    // Then fetch skills
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('domain_id', domain.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      emoji: s.emoji,
      category: s.category
    }));
  },

  // Fetch AI tools for a domain
  getAiToolsByDomainSlug: async (domainSlug) => {
    // First get domain ID from slug
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('id')
      .eq('slug', domainSlug)
      .single();

    if (domainError) throw domainError;

    // Then fetch AI tools
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('domain_id', domain.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      emoji: t.emoji,
      category: t.category
    }));
  },

  // Fetch repository for a workspace
  getRepositoryByWorkspaceId: async (workspaceId) => {
    // Get workspace UUID from workspace_key
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('workspace_key', workspaceId)
      .single();

    if (workspaceError) throw workspaceError;

    // Then fetch repository
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('workspace_id', workspace.id)
      .maybeSingle(); // Use maybeSingle since repository might not exist

    if (error) throw error;

    if (!data) return null;

    return {
      repoUrl: data.repo_url,
      repoType: data.repo_type,
      defaultBranch: data.default_branch,
      branchCount: data.branch_count,
      commitCount: data.commit_count,
      prCount: data.pr_count,
      isConnected: data.is_connected
    };
  },

  // Fetch single project by ID (UUID)
  getProjectById: async (projectId) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, workspaces(name, workspace_key, domains(name, slug))')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      progress: data.progress,
      dueDate: data.due_date,
      members: data.members_count,
      workspace: data.workspaces
    };
  },

  // Fetch phases for a project (visible only)
  getPhasesByProjectId: async (projectId) => {
    const { data, error } = await supabase
      .from('project_phases')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(p => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      iconEmoji: p.icon_emoji,
      progress: p.progress,
      isCurrentPhase: p.is_current_phase,
      displayOrder: p.display_order
    }));
  },

  // Fetch repository files for a project (visible only)
  getRepositoryFilesByProjectId: async (projectId) => {
    const { data, error } = await supabase
      .from('project_repository_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(f => ({
      id: f.id,
      fileName: f.file_name,
      fileType: f.file_type,
      fileUrl: f.file_url,
      displayOrder: f.display_order
    }));
  },

  // Fetch members for a project (visible only)
  getMembersByProjectId: async (projectId) => {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      avatarInitials: m.avatar_initials,
      avatarColor: m.avatar_color,
      displayOrder: m.display_order
    }));
  }
};
