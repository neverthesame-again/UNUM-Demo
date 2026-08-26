// Home Page Mock Data

export const homePageMock = {
  hero: {
    eyebrow: "GuideWell AI HUB PLATFORM",
    title: "One GuideWell",
    highlight: "Uniting AI Across Domains",
    subtitle:
      "A unified AI platform that intelligently engages AI and humans—transforming how organizations innovate, collaborate, and deliver value across domains",
  },
  stats: [
    { value: "8", label: "AI Domains" },
    { value: "50+", label: "AI Demos & Prototypes" },
    { value: "20+", label: "Project Workspaces" },
    { value: "98%", label: "Compliance Rate" },
  ],
  mission: {
    sectionLabel: "Our Initiative",
    title: "AI That Works for Everyone at GuideWell",
    paragraphs: [
      "One GuideWell AI is a strategic initiative to embed intelligent automation across every domain of the enterprise—from software engineering and IT operations to business intelligence and governance—creating a seamlessly connected ecosystem that drives innovation, efficiency, and better business outcomes",
      "By unifying eight distinct AI domains under a single platform, One GuideWell AI eliminates silos, accelerates decision-making, and enables teams to discover, build, test, and scale AI solutions through demos, prototypes, intelligent agents, and collaborative project workspaces. Secure, scalable, and compliant by design, the platform empowers organizations to unlock the full potential of AI",
    ],
    pills: [
      {
        text: "Proactive healthcare intelligence & automation",
        color: "#1e6bff",
      },
      {
        text: "Automated operations reducing manual overhead 60%",
        color: "#00c4ff",
      },
      {
        text: "Legacy modernization with zero business disruption",
        color: "#f5a623",
      },
      {
        text: "Unified business intelligence across all departments",
        color: "#b446ff",
      },
      {
        text: "Enterprise-grade governance, HIPAA & CMS compliant",
        color: "#50c878",
      },
      {
        text: "Low-code tools — anyone can build & deploy AI agents",
        color: "#ff9632",
      },
    ],
  },
  pillarsSection: {
    sectionLabel: "AI HUB Capabilities",
    title: "Eight Pillars of Intelligence",
  },
  // Domain slugs in display order - full domain data fetched from backend
  pillarSlugs: ["swe", "itops", "mod", "biz", "mkt", "intel", "gov", "cat"],
};
