// TCS Governance Analytics Dashboard Service
// Connects dynamically to Supabase table `dashboard_datasets` with mock dataset fallback

import { supabase } from "../lib/supabase";
import { tcsDashboardMock } from "../data/mock/tcsDashboard.mock.js";

export const tcsDashboardService = {
  // Get all datasets from Supabase (or fallback to mock)
  getDashboardData: async () => {
    try {
      const { data, error } = await supabase
        .from("dashboard_datasets")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn(
          "[TCS Dashboard] Using local mock dataset fallback (Supabase query returned empty/error).",
          error,
        );
        return tcsDashboardMock;
      }

      // Format Supabase dataset rows into dashboard state
      const formatted = { ...tcsDashboardMock };
      data.forEach((row) => {
        if (row.dataset_key && row.data) {
          formatted[row.dataset_key] = row.data;
        }
      });
      return formatted;
    } catch (err) {
      console.error("[TCS Dashboard] Error fetching datasets from Supabase:", err);
      return tcsDashboardMock;
    }
  },

  // Get specific dataset by key
  getDatasetByKey: async (datasetKey) => {
    try {
      const { data, error } = await supabase
        .from("dashboard_datasets")
        .select("*")
        .eq("dataset_key", datasetKey)
        .eq("is_visible", true)
        .single();

      if (error || !data) {
        return tcsDashboardMock[datasetKey] || null;
      }

      return data.data;
    } catch (err) {
      console.error(`[TCS Dashboard] Error fetching ${datasetKey}:`, err);
      return tcsDashboardMock[datasetKey] || null;
    }
  },

  // Update dynamic dataset in Supabase (Admin function)
  updateDataset: async (datasetKey, payload) => {
    try {
      const { data, error } = await supabase
        .from("dashboard_datasets")
        .upsert(
          {
            dataset_key: datasetKey,
            data: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "dataset_key" },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`[TCS Dashboard] Error updating ${datasetKey}:`, err);
      throw err;
    }
  },
};
