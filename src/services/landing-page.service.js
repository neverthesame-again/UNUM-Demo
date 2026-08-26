// Landing Page Service Provider

import { getMockDataForRole } from "../data/mock/landing-mock";

export const landingPageService = {
  // Returns landing page structured dataset by Domain & Role
  getLandingPageData: async (businessArea, role) => {
    // Simulated async fetch to prepare for future Supabase DB integration
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getMockDataForRole(businessArea, role);
        resolve(data);
      }, 100);
    });
  },
};
