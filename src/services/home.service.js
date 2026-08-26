// Home Service - Home Page Content

import { homePageMock } from '../data/mock/home.mock';
import { supabase } from '../lib/supabase';

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

export const homeService = {
  getHeroContent: () => {
    return homePageMock.hero;
  },
  
  getStats: () => {
    return homePageMock.stats;
  },
  
  getMissionContent: () => {
    return homePageMock.mission;
  },
  
  getPillarsSection: () => {
    return homePageMock.pillarsSection;
  },
  
  // Fetch pillar cards from backend - filters and orders by pillarSlugs
  getPillarCards: async () => {
    const { pillarSlugs } = homePageMock;
    
    try {
      // Fetch all visible domains from backend
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('is_visible', true);

      if (error) throw error;

      // Filter and order domains by pillarSlugs order
      return pillarSlugs.map(slug => {
        const domain = data.find(d => d.slug === slug);
        if (!domain) return null;
        
        return {
          slug: domain.slug,
          title: domain.name,
          description: domain.description,
          accentColor: domain.accent_color,
          iconKey: domain.icon_name,
          iconBg: `rgba(${hexToRgb(domain.accent_color)}, 0.18)`
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error fetching pillar cards:', error);
      return [];
    }
  }
};
