// Central Configuration for Business Areas and Roles Mapping

export const BUSINESS_AREAS = [
  {
    id: "ai-for-ad",
    name: "AI for AD",
    status: "active",
    roles: [
      { value: "Product Owner", label: "Product Owner" },
      { value: "Developer", label: "Developer" },
    ],
  },
  {
    id: "ai-for-ams",
    name: "AI for AMS",
    status: "active",
    roles: [
      { value: "Support Engineer", label: "Support Engineer" },
      { value: "Software Engineer", label: "Software Engineer" },
    ],
  },
  {
    id: "ai-for-infra",
    name: "AI for Infra",
    status: "active",
    roles: [
      { value: "Infra Engineer", label: "Infra Engineer" },
      { value: "SRE / NOC Lead", label: "SRE / NOC Lead" },
    ],
  },
  {
    id: "ai-for-business",
    name: "AI for Business",
    status: "coming_soon",
    roles: [],
  },
];

// Helper to get roles for a given Business Area name
export const getRolesForBusinessArea = (businessAreaName) => {
  const area = BUSINESS_AREAS.find((item) => item.name === businessAreaName);
  return area ? area.roles : [];
};
