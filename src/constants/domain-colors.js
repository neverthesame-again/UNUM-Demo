// Domain Color Palette
// Use these colors when adding new domain cards to maintain design consistency
// Colors will be used alternatively/randomly for new domains

export const DOMAIN_COLORS = [
  '#1e6bff', // Blue - Used for SWE
  '#00c4ff', // Cyan - Used for IT Ops
  '#f5a623', // Gold/Orange - Used for Modernization
  '#10b981', // Green - Used for Business Intelligence
  '#8b5cf6', // Purple - Used for AI Marketplace
  '#06b6d4', // Teal - Used for Enterprise Intelligence
  '#ef4444', // Red - Used for AI Governance
  '#f59e0b', // Amber - Used for AI Catalog
  
  // === EXTRA COLORS FOR FUTURE DOMAINS ===
  // Use these when adding new domain cards
  '#ec4899', // Pink - Available for new domains
  '#14b8a6', // Emerald - Available for new domains
  '#6366f1', // Indigo - Available for new domains
  '#f97316', // Orange - Available for new domains
];

// Helper: Get next color for a new domain based on current count
export const getNextColor = (currentDomainCount) => {
  return DOMAIN_COLORS[currentDomainCount % DOMAIN_COLORS.length];
};

// Helper: Get random color from palette
export const getRandomColor = () => {
  return DOMAIN_COLORS[Math.floor(Math.random() * DOMAIN_COLORS.length)];
};

// Available icon names for new domains (matches Icon.jsx)
export const AVAILABLE_ICONS = [
  'code',        // Used for SWE
  'server',      // Used for IT Ops
  'building',    // Used for Modernization
  'trendingUp',  // Used for Business Intelligence
  'layoutList',  // Used for AI Marketplace
  'database',    // Used for Enterprise Intelligence
  'shieldCheck', // Used for AI Governance
  'affiliate',   // Used for AI Catalog
  'monitor',
  'layers',
  'chart',
  'cart',
  'cube',
  'shield',
  'grid',
  
  // === EXTRA ICONS FOR FUTURE DOMAINS ===
  // Available when creating new domain cards
  'settings',  // For configuration/admin domains
  'bell',      // For notifications/alerts domains
  'zap',       // For performance/automation domains
  
  // Other available icons (already in Icon.jsx)
  'sun',
  'play',
  'folder',
  'users',
  'calendar',
  'search',
  'message',
];

// Helper: Get next icon for a new domain based on current count
export const getNextIcon = (currentDomainCount) => {
  return AVAILABLE_ICONS[currentDomainCount % AVAILABLE_ICONS.length];
};

// Helper: Get random icon from available list
export const getRandomIcon = () => {
  return AVAILABLE_ICONS[Math.floor(Math.random() * AVAILABLE_ICONS.length)];
};

// ============================================
// CATEGORY COLOR SYSTEM
// ============================================
// Category badges get dynamic colors for visual variety
// Same category = same color (deterministic via hash)

export const CATEGORY_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1' },   // Indigo
  { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899' },   // Pink
  { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' },   // Emerald
  { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },   // Amber
  { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4' },    // Cyan
  { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6' },   // Purple
  { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },    // Red
  { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },    // Green
  { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },   // Orange
  { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7' },   // Purple Variant
  { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' },   // Blue
  { bg: 'rgba(244, 114, 182, 0.15)', border: '#f472b6' },  // Pink Variant
  { bg: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6' },   // Teal
  { bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c' },   // Orange Variant
  { bg: 'rgba(132, 204, 22, 0.15)', border: '#84cc16' },   // Lime
  { bg: 'rgba(217, 70, 239, 0.15)', border: '#d946ef' },   // Fuchsia
  { bg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9' },   // Sky
  { bg: 'rgba(234, 88, 12, 0.15)', border: '#ea580c' },    // Orange Red
  { bg: 'rgba(74, 222, 128, 0.15)', border: '#4ade80' },   // Green Variant
  { bg: 'rgba(192, 132, 252, 0.15)', border: '#c084fc' },  // Purple Light
];

// Get color for a category by its position in the sorted category list (no collisions)
export const getCategoryColor = (categoryName, allCategories = []) => {
  if (!categoryName) return CATEGORY_COLORS[0];

  const sorted = [...allCategories].filter(c => c !== 'All').sort();
  const index = sorted.indexOf(categoryName);
  const colorIndex = index === -1 ? 0 : index % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[colorIndex];
};

// Helper: Get inline style for category badge
export const getCategoryStyle = (categoryName, allCategories = []) => {
  const color = getCategoryColor(categoryName, allCategories);
  return {
    background: color.bg,
    borderColor: color.border,
    color: color.border,
  };
};

// ============================================
// WORKSPACE GRADIENT COLORS
// ============================================
// Gradient colors for workspace badges
// These match the existing workspace data in the database

export const WORKSPACE_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',  // Indigo to Purple
  'linear-gradient(135deg, #f472b6, #a855f7)',  // Pink to Purple
  'linear-gradient(135deg, #34d399, #06b6d4)',  // Emerald to Cyan
  'linear-gradient(135deg, #ff6b6b, #ffd166)',  // Red to Yellow
  'linear-gradient(135deg, #34d399, #10b981)',  // Emerald to Green
  'linear-gradient(135deg, #fbbf24, #f59e0b)',  // Amber to Orange
  'linear-gradient(135deg, #60a5fa, #818cf8)',  // Blue to Indigo
  'linear-gradient(135deg, #f472b6, #ec4899)',  // Pink to Pink Dark
  'linear-gradient(135deg, #0ea5e9, #0284c7)',  // Sky to Blue
  'linear-gradient(135deg, #a855f7, #9333ea)',  // Purple to Purple Dark
  'linear-gradient(135deg, #00c8ff, #0055ff)',  // Cyan to Blue
  'linear-gradient(135deg, #06b6d4, #0891b2)',  // Cyan to Teal
  'linear-gradient(135deg, #34d399, #059669)',  // Emerald to Green Dark
  'linear-gradient(135deg, #ff6b6b, #dc2626)',  // Red to Red Dark
  'linear-gradient(135deg, #60a5fa, #3b82f6)',  // Blue to Blue Dark
  'linear-gradient(135deg, #a855f7, #7c3aed)',  // Purple to Purple Darker
];
