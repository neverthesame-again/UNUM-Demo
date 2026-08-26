// src/services/incidents.service.js
// Fetches live incident data from the Supabase `incidents` table.

import { supabase } from "../lib/supabase";

export const incidentsService = {
  /**
   * Fetch top incidents matching filters.
   * @param {number} limit - Number of incidents to return (default 10)
   * @param {object} filters - Optional query filters { application, priority, startDate, endDate }
   * @returns {Promise<Array>} - Array of incident records
   */
  getTopIncidents: async (limit = 10, filters = {}) => {
    let query = supabase
      .from("incidents")
      .select(
        "id, application, business_service, short_description, impact, urgency, assigned_group, category, environment, sla_breached, age_days, mttr_hours, incident_date"
      );

    if (filters.application) {
      query = query.ilike("application", `%${filters.application}%`);
    }
    if (filters.priority) {
      query = query.or(`impact.ilike.%${filters.priority}%,urgency.ilike.%${filters.priority}%`);
    }
    if (filters.startDate) {
      query = query.gte("incident_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("incident_date", filters.endDate);
    }

    const { data, error } = await query
      .order("incident_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Incidents] Error fetching incidents:", error);
      throw error;
    }

    return data || [];
  },
};

/**
 * Formats an array of incident rows into a readable markdown-style string
 * that can be displayed directly in the chat bubble.
 * @param {Array} incidents
 * @returns {string}
 */
export function formatIncidentsAsMarkdown(incidents) {
  if (!incidents || incidents.length === 0) {
    return "No incidents found in the database.";
  }

  const rows = incidents.map((inc, idx) => {
    const parts = [
      `**${idx + 1}. ${inc.id}**`,
      inc.short_description ? `📌 ${inc.short_description}` : null,
      inc.application ? `🖥️ Application: ${inc.application}` : null,
      inc.business_service ? `🏢 Service: ${inc.business_service}` : null,
      inc.category ? `🗂️ Category: ${inc.category}` : null,
      inc.impact ? `⚡ Impact: ${inc.impact}` : null,
      inc.urgency ? `🔴 Urgency: ${inc.urgency}` : null,
      inc.environment ? `🌐 Environment: ${inc.environment}` : null,
      inc.assigned_group ? `👥 Assigned: ${inc.assigned_group}` : null,
      inc.sla_breached ? `⏱️ SLA Breached: ${inc.sla_breached}` : null,
      inc.age_days != null ? `📅 Age: ${inc.age_days} days` : null,
      inc.mttr_hours != null ? `🕐 MTTR: ${inc.mttr_hours}h` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return parts;
  });

  return `### 🔟 Top 10 Incidents\n\n${rows.join("\n\n---\n\n")}`;
}
