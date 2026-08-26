// TCS Governance Analytics Dashboard Dataset
// Exact non-hallucinated datasets extracted line-by-line from governance_dashboard.html

export const tcsDashboardMock = {
  // Business Groups & Towers Filters (from governance_dashboard.html)
  businessGroups: [
    { value: "all", label: "All Business Groups" },
    { value: "Shared Services", label: "Market Facing" },
    { value: "Clinical Systems", label: "Health & Network" },
    { value: "Membership & Enrollment", label: "Service & Core Administrations" },
    { value: "Claims, Provider & EDI", label: "Corporate Functions" },
    { value: "Digital, Call Center & Specialty", label: "Horizontal Functions & Shared Platforms" },
  ],
  towers: [
    { value: "all", label: "All Towers" },
    { value: "Tower 1", label: "Tower 1" },
    { value: "Tower 2", label: "Tower 2" },
    { value: "Tower 3", label: "Tower 3" },
    { value: "Tower 4", label: "Tower 4" },
    { value: "Tower 5", label: "Tower 5" },
    { value: "Tower 6", label: "Tower 6" },
    { value: "Tower 7", label: "Tower 7" },
    { value: "Tower 8", label: "Tower 8" },
  ],

  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  // TAB 1: EXECUTIVE SUMMARY (overview)
  overview: {
    kpis: [
      { id: "logged", label: "Logged Incidents", value: "65", trendBadge: "-12%", color: "#009FDA", badgeClass: "positive" },
      { id: "resolved", label: "Resolved Incidents", value: "63", trendBadge: "+8%", color: "#97D700", badgeClass: "positive" },
      { id: "open", label: "Open Inventory", value: "2,500", trendBadge: "+5%", color: "#F7941D", badgeClass: "negative" },
      { id: "major", label: "Major Incidents", value: "0", trendBadge: "-", color: "#F7941D", badgeClass: "warning" },
      { id: "auto", label: "Auto Resolved", value: "35%", trendBadge: "+3%", color: "#00d2d3", badgeClass: "positive" },
      { id: "mttr", label: "MTTR", value: "72 Hrs", trendBadge: "15%", color: "#7b5ea7", badgeClass: "positive" },
    ],
    innerTabs: [
      { id: "sla", label: "SLA Governance" },
      { id: "stability", label: "Service Stability" },
      { id: "quality", label: "Incident Resolution Quality" },
      { id: "trends", label: "Ticket Trends" },
      { id: "major", label: "Major Incident Trends" },
    ],

    // SLA Governance 4 Donut Gauges (from governance_dashboard.html)
    slaGovernance: [
      { label: "Incident Response SLA", percentage: 100, status: "On Target", color: "#97D700" },
      { label: "Incident Resolution SLA", percentage: 98, status: "On Target", color: "#97D700" },
      { label: "SCTASK Resolution SLA", percentage: 98, status: "On Target", color: "#97D700" },
      { label: "Problem Resolution SLA", percentage: 100, status: "On Target", color: "#97D700" },
    ],

    // Service Stability (from governance_dashboard.html)
    serviceStability: {
      tier1Availability: 99.9,
      tier2Availability: 99.0,
      techDebt: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        openData: [250, 230, 210, 180, 160, 145, 130, 110, 90, 80, 75, 60],
        closedData: [10, 30, 50, 80, 100, 120, 150, 170, 190, 200, 220, 230],
      },
      changeSuccessRate: 99,
    },

    // Incident Resolution Quality (from governance_dashboard.html)
    qualityMetrics: {
      ftrPercentage: 96,
      reopenedCount: 2,
      reopenLabel: "Re-opened this month",
      aging: {
        categories: ["Incidents"],
        series: [
          { name: "0-10 Days", data: [200], color: "#2196F3" },
          { name: "11-30 Days", data: [50], color: "#FF7043" },
          { name: "31-60 Days", data: [30], color: "#2E7D32" },
          { name: "61-90 Days", data: [15], color: "#26C6DA" },
          { name: "91-180 Days", data: [10], color: "#8E24AA" },
          { name: "180+ Days", data: [5], color: "#7CB342" },
        ],
      },
      mttrTrend: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [{ name: "MTTR (Hours)", data: [6.5, 6.2, 5.8, 5.5, 6.0, 5.3, 4.8, 5.0, 4.7, 4.5, 5.0, 5.2], color: "#009fda" }],
      },
    },

    // Ticket Trends (from governance_dashboard.html)
    ticketTrends: {
      towerInflow: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [
          { name: "T1", data: [4, 6, 8, 12, 14, 18, 22, 16, 10, 6, 18, 20], color: "#e55353" },
          { name: "T2", data: [10, 12, 14, 16, 22, 16, 13, 10, 8, 6, 5, 4], color: "#f8961e" },
          { name: "T3", data: [12, 14, 16, 10, 8, 14, 16, 18, 14, 20, 22, 24], color: "#009FDA" },
          { name: "T5", data: [24, 32, 20, 24, 32, 30, 20, 16, 14, 8, 4, 2], color: "#00d2d3" },
          { name: "T7", data: [9, 12, 16, 18, 20, 22, 24, 10, 8, 15, 20, 22], color: "#005986" },
        ],
      },
      volumeTrends: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [
          { name: "Market Facing", data: [501, 878, 1081, 1163, 1003, 1422, 1611, 1423, 1525, 1470, 1302, 1603], color: "#e55353" },
          { name: "Health & Network", data: [1343, 1353, 1209, 1498, 1142, 1144, 1278, 1474, 1311, 2124, 1731, 1871], color: "#f8961e" },
          { name: "Service & Core Administrations", data: [6704, 5267, 4740, 4243, 4785, 4680, 4931, 4612, 5558, 6007, 6096, 7780], color: "#009FDA" },
          { name: "Corporate Functions", data: [1100, 1238, 1854, 1762, 2290, 1237, 1402, 1344, 1502, 1595, 1205, 1381], color: "#00d2d3" },
          { name: "Horizontal Functions & Shared Platforms", data: [1210, 1267, 1292, 1323, 1219, 1295, 1671, 1499, 1340, 1518, 1617, 2141], color: "#9b59b6" },
        ],
      },
      problemTickets: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [
          { name: "Market Facing", data: [12, 15, 5, 7, 1, 5, 8, 3, 5, 13, 12, 6], color: "#e55353" },
          { name: "Health & Network", data: [5, 7, 1, 5, 8, 3, 5, 13, 12, 6, 12, 15], color: "#f8961e" },
          { name: "Service & Core Administrations", data: [1, 5, 8, 3, 5, 13, 12, 6, 12, 15, 5, 7], color: "#009FDA" },
          { name: "Corporate Functions", data: [12, 6, 12, 15, 5, 7, 1, 5, 8, 3, 5, 13], color: "#00d2d3" },
          { name: "Horizontal Functions & Shared Platforms", data: [3, 5, 13, 12, 6, 12, 15, 5, 7, 1, 5, 8], color: "#9b59b6" },
        ],
      },
      ritmTrends: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [
          { name: "Market Facing", data: [300, 100, 400, 800, 700, 300, 400, 600, 300, 800, 900, 200], color: "#e55353" },
          { name: "Health & Network", data: [100, 400, 800, 700, 300, 400, 600, 300, 800, 900, 200, 300], color: "#f8961e" },
          { name: "Service & Core Administrations", data: [400, 800, 700, 300, 400, 600, 300, 800, 900, 200, 300, 100], color: "#009FDA" },
          { name: "Corporate Functions", data: [800, 700, 300, 400, 600, 300, 800, 900, 200, 300, 100, 400], color: "#00d2d3" },
          { name: "Horizontal Functions & Shared Platforms", data: [700, 300, 400, 600, 300, 800, 900, 200, 300, 100, 400, 800], color: "#9b59b6" },
        ],
      },
    },

    // Major Incident Trends (from governance_dashboard.html)
    majorTrends: {
      mttd: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [{ name: "MTTD (Mins)", data: [18, 22, 15, 20, 17, 19, 14, 16, 21, 15, 13, 18], color: "#009FDA" }],
      },
      majorIncidents: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [
          { name: "Market Facing", data: [3, 1, 4, 8, 7, 3, 4, 6, 3, 8, 9, 2], color: "#e55353" },
          { name: "Health & Network", data: [1, 4, 8, 7, 3, 4, 6, 3, 8, 9, 2, 3], color: "#f8961e" },
          { name: "Service & Core Administrations", data: [4, 8, 7, 3, 4, 6, 3, 8, 9, 2, 3, 1], color: "#009FDA" },
          { name: "Corporate Functions", data: [8, 7, 3, 4, 6, 3, 8, 9, 2, 3, 1, 4], color: "#00d2d3" },
          { name: "Horizontal Functions & Shared Platforms", data: [7, 3, 4, 6, 3, 8, 9, 2, 3, 1, 4, 8], color: "#9b59b6" },
        ],
      },
      mttr: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        series: [{ name: "MTTR (Hours)", data: [8, 12, 10, 14, 9, 11, 7, 10, 8, 9, 11, 10], color: "#009FDA" }],
      },
    },
  },

  // TAB 2: AIOPS DASHBOARD (business)
  aiops: {
    summary: [
      { label: "Efforts Saved (Hrs)", value: "14,200", color: "#00d2d3" },
      { label: "Cost Avoided", value: "500k $", color: "#a78bfa" },
      { label: "Tickets Auto Resolved", value: "35%", color: "#f8961e" },
      { label: "AI Vs Human Resolution", value: "2:1", color: "#2dd36f" },
    ],
    automationPortfolio: [
      { label: "Agents - In Action", count: 550, percentage: 77.5, color: "#00d2d3" },
      { label: "Agents - Build In Progress", count: 35, percentage: 4.9, color: "#a78bfa" },
      { label: "Use Cases Backlog", count: 125, percentage: 17.6, color: "#f8961e" },
    ],
    shiftLeftEffectiveness: {
      queries: { resolved: 42, converted: 58 },
      noiseReduction: 43,
      ticketShift: 28,
    },
    waiverRows: [
      { id: "WV145140", by: "Alex P", tower: "Shared Services", group: "STL_Horizon_IT_Support", type: "Override", ticket: "INC65432001", date: "04/22/2025", priority: "P1", pending: "Manager 1", sla: "Response", status: "worklist", daysAgo: 0 },
      { id: "WV145141", by: "Maria S", tower: "Clinical Systems", group: "STL_Prime_Support", type: "Discount", ticket: "INC65432015", date: "04/22/2025", priority: "P2", pending: "Manager 2", sla: "Resolution", status: "worklist", daysAgo: 0 },
      { id: "WV145142", by: "David L", tower: "Membership & Enrollment", group: "UMV_Production_Support", type: "Discount", ticket: "INC65432027", date: "04/22/2025", priority: "P3", pending: "Director", sla: "Response", status: "worklist", daysAgo: 0 },
      { id: "WV145143", by: "Sophie T", tower: "Claims, Provider & EDI", group: "IT ABS Core Prod Support", type: "Override", ticket: "INC65432038", date: "04/22/2025", priority: "P2", pending: "Manager 3", sla: "Resolution", status: "worklist", daysAgo: 0 },
      { id: "WV145144", by: "Ryan K", tower: "Digital, Call Center & Specialty", group: "CNC Web Support", type: "Discount", ticket: "INC65432049", date: "04/22/2025", priority: "P4", pending: "Manager 1", sla: "Response", status: "worklist", daysAgo: 0 },
      { id: "WV145145", by: "Carlos M", tower: "ESOC", group: "ESOC_Operations_Support", type: "Override", ticket: "INC65432060", date: "04/25/2025", priority: "P1", pending: "Manager 2", sla: "Response", status: "worklist", daysAgo: 0 },
      { id: "WV145146", by: "Linda K", tower: "AOC", group: "AOC_Application_Support", type: "Discount", ticket: "INC65432070", date: "04/24/2025", priority: "P2", pending: "Manager 3", sla: "Resolution", status: "worklist", daysAgo: 1 },
      { id: "WV145123", by: "Jane A", tower: "Shared Services", group: "STL_Horizon_IT_Support", type: "Override", ticket: "INC65431234", date: "04/20/2025", priority: "P4", pending: "Manager 1", sla: "Response", status: "worklist", daysAgo: 1 },
      { id: "WV145130", by: "Michael B", tower: "Clinical Systems", group: "STL_Prime_Support", type: "Discount", ticket: "INC65431250", date: "04/21/2025", priority: "P2", pending: "Manager 2", sla: "Resolution", status: "inprogress", daysAgo: 0 },
      { id: "WV145131", by: "Sarah C", tower: "Claims, Provider & EDI", group: "IT ABS Core Prod Support", type: "Override", ticket: "INC65431260", date: "04/21/2025", priority: "P1", pending: "VP Operations", sla: "Response", status: "inprogress", daysAgo: 0 },
      { id: "WV145110", by: "Robert D", tower: "Membership & Enrollment", group: "UMV_Production_Support", type: "Override", ticket: "INC65431100", date: "04/18/2025", priority: "P3", pending: "Completed", sla: "Response", status: "approved", daysAgo: 3 },
      { id: "WV145111", by: "Emily E", tower: "Shared Services", group: "STL_Horizon_IT_Support", type: "Discount", ticket: "INC65431110", date: "04/19/2025", priority: "P2", pending: "Completed", sla: "Resolution", status: "approved", daysAgo: 2 },
      { id: "WV145100", by: "Kevin F", tower: "ESOC", group: "ESOC_Operations_Support", type: "Override", ticket: "INC65431000", date: "04/15/2025", priority: "P1", pending: "Rejected", sla: "Response", status: "rejected", daysAgo: 5 },
    ],
  },

  // TAB 3: DEMAND REDUCTION (toil)
  demand_reduction: {
    summary: [
      { label: "Incidents Prevented", value: "13,500", subtitle: "(YTD)", color: "#00d2d3" },
      { label: "Effort Savings (Hours)", value: "2,000", subtitle: "(YTD)", color: "#a78bfa" },
      { label: "Tasks Implemented", value: "75", subtitle: "(YTD)", color: "#2dd36f" },
      { label: "Tasks in Progress", value: "25", subtitle: "", color: "#f8961e" },
      { label: "Task Backlog", value: "50", subtitle: "", color: "#e55353" },
    ],
    droTableRows: [
      { taskId: "DRO1001", title: "Automate L1 Password Reset Flow", businessGroup: "Shared Services", app: "ServiceNow", incidentSavings: "350", effortSavings: 120 },
      { taskId: "DRO1002", title: "DB Log Archival Auto-Cleanup", businessGroup: "Shared Services", app: "Remedy", incidentSavings: "280", effortSavings: 90 },
      { taskId: "DRO1003", title: "Batch Job Auto-Restart Script", businessGroup: "Shared Services", app: "Okta", incidentSavings: "190", effortSavings: 65 },
      { taskId: "DRO1004", title: "Access Request Auto-Provisioning", businessGroup: "Shared Services", app: "Workday", incidentSavings: "410", effortSavings: 140 },
      { taskId: "DRO1005", title: "Lab Result Routing Auto-Correction", businessGroup: "Clinical Systems", app: "Epic", incidentSavings: "220", effortSavings: 75 },
      { taskId: "DRO1006", title: "Appointment Reminder Dispatch Bot", businessGroup: "Clinical Systems", app: "Cerner", incidentSavings: "160", effortSavings: 50 },
      { taskId: "DRO1007", title: "Eligibility Verification Cache Sync", businessGroup: "Membership & Enrollment", app: "Salesforce", incidentSavings: "380", effortSavings: 110 },
      { taskId: "DRO1008", title: "Enrollment Batch Failure Handler", businessGroup: "Membership & Enrollment", app: "Facets", incidentSavings: "140", effortSavings: 45 },
      { taskId: "DRO1009", title: "EDI Rejection Auto-Triage", businessGroup: "Claims, Provider & EDI", app: "EDI Gateway", incidentSavings: "290", effortSavings: 95 },
      { taskId: "DRO1010", title: "Claims Adjudication Auto-Retry", businessGroup: "Claims, Provider & EDI", app: "QNXT", incidentSavings: "310", effortSavings: 105 },
    ],
  },

  // TAB 4: AOC SHIFT LEFT (aoc)
  aoc_shift_left: {
    summary: [
      { label: "L1.5 Ticket Resolution", value: "20%", color: "#00d2d3" },
      { label: "Active SOPs", value: "300", color: "#a78bfa" },
      { label: "SOPs in Backlog", value: "55", color: "#2dd36f" },
    ],
    aocTableRows: [
      { intakeId: "AOC-2012", tower: "Tower-5", businessGroup: "Digital, Call Center & Specialty", app: "Five9", processTitle: "Voicemail transcription queue", frequency: "Weekly", effort: 10, automated: "No" },
      { intakeId: "AOC-2010", tower: "Tower-5", businessGroup: "Claims, Provider & EDI", app: "EDI Gateway", processTitle: "EDI 837 rejection triage", frequency: "Daily", effort: 26, automated: "In Progress" },
      { intakeId: "AOC-2008", tower: "Tower-6", businessGroup: "Membership & Enrollment", app: "Facets", processTitle: "Enrollment status update batch", frequency: "Weekly", effort: 14, automated: "No" },
      { intakeId: "AOC-2003", tower: "Tower-7", businessGroup: "Shared Services", app: "Okta", processTitle: "Access request approval check", frequency: "Weekly", effort: 12, automated: "In Progress" },
      { intakeId: "AOC-2006", tower: "Tower-4", businessGroup: "Clinical Systems", app: "Cerner", processTitle: "Appointment reminder dispatch", frequency: "Daily", effort: 16, automated: "In Progress" },
      { intakeId: "AOC-2002", tower: "Tower-3", businessGroup: "Shared Services", app: "Remedy", processTitle: "Password reset L1 triage", frequency: "Daily", effort: 18, automated: "Yes" },
      { intakeId: "AOC-2011", tower: "Tower-1", businessGroup: "Digital, Call Center & Specialty", app: "Genesys", processTitle: "Call routing exception handling", frequency: "Daily", effort: 19, automated: "Yes" },
      { intakeId: "AOC-2001", tower: "Tower-2", businessGroup: "Shared Services", app: "ServiceNow", processTitle: "Ticket categorization and routing", frequency: "Daily", effort: 24, automated: "Yes" },
      { intakeId: "AOC-2005", tower: "Tower-2", businessGroup: "Clinical Systems", app: "Epic", processTitle: "Lab result acknowledgment routing", frequency: "Daily", effort: 22, automated: "Yes" },
      { intakeId: "AOC-2007", tower: "Tower-1", businessGroup: "Membership & Enrollment", app: "Salesforce", processTitle: "Member eligibility verification", frequency: "Daily", effort: 28, automated: "Yes" },
      { intakeId: "AOC-2004", tower: "Tower-8", businessGroup: "Shared Services", app: "Workday", processTitle: "New hire account provisioning", frequency: "Daily", effort: 30, automated: "Yes" },
      { intakeId: "AOC-2009", tower: "Tower-3", businessGroup: "Claims, Provider & EDI", app: "QNXT", processTitle: "Claim status notification", frequency: "Daily", effort: 20, automated: "Yes" },
    ],
  },
};
