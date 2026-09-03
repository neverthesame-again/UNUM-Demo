/* eslint-disable react-hooks/set-state-in-effect */
// Domain & Role Dynamic Landing Page Component with Multi-Tab Mock Views

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { landingPageService } from "../services/landing-page.service";
import { BUSINESS_AREAS, getRolesForBusinessArea } from "../constants/business-areas";
import { Footer } from "../components/Footer";
import { Chatbot } from "../components/chatbot";
import InfraPage from "./InfraPage";
import { AdRoleBotWidget } from "../components/AdRoleBotWidget";
import { UnifiedBotWidget } from "../components/UnifiedBotWidget";
import { useToast } from "../components/Toast";
import { PipelineModal } from "../components/project-detail/PipelineModal";
import { AppHealthModal } from "../components/project-detail/AppHealthModal";
import { Modal } from "../components/Modal";
import { Icon } from "../components/Icon";
import {
  GREENFIELD_PIPELINE_URL,
  BROWNFIELD_PIPELINE_ENDPOINT,
} from "../constants/pipeline";
import { WorkspacePanel } from "../components/WorkspacePanel";
import { domainDetailService } from "../services/domain-detail.service";
import { amsOverviewData } from "../data/mock/landing-mock";
import { ActionItemDetailDrawer } from "../components/ActionItemDetailDrawer";


// Controls visibility of the Chatbot floating circle based on business area and role.
// Enabled for Support Engineer & Software Engineer under AI for AMS only.
const isChatbotEnabled = (businessArea, role) => {
  return (
    businessArea === "AI for AMS" &&
    (role === "Support Engineer" ||
      role === "Software Engineer" ||
      role.includes("Support") ||
      role.includes("Engineer"))
  );
};

// ─── Automation Data Grid ────────────────────────────────────────────────────
const AUTOMATION_DATA = [
  {
    "Issue or Task Summary": "Missing product attributes in catalog",
    "Domain": "Product",
    "Category": "Data Quality",
    "Issue Description": "Required product attributes are blank or inconsistent, delaying downstream publishing and analysis.",
    "Automation Trigger": "Record updated",
    "Automated Resolution": "Validate required fields, normalize known values, and route only unresolved exceptions for review.",
    "Recommended Mechanism": "Workflow",
    "Priority": "High",
    "Automation Readiness": "Ready to Build",
    "Frequency": "Real time",
    "Implementation Effort": "Medium",
    "Business Impact": "Improves catalog completeness and reduces manual data cleanup.",
    "Success Metric": "Percent of records auto-corrected; attribute completeness rate",
    "Systems or Data Sources": "Product catalog; master data platform",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Duplicate product records",
    "Domain": "Product",
    "Category": "Data Quality",
    "Issue Description": "Similar product records are created more than once, causing reporting and fulfillment errors.",
    "Automation Trigger": "New item or record",
    "Automated Resolution": "Match on product identifiers and similarity rules, merge safe duplicates, and flag uncertain matches.",
    "Recommended Mechanism": "Workflow",
    "Priority": "High",
    "Automation Readiness": "Needs Review",
    "Frequency": "Real time",
    "Implementation Effort": "High",
    "Business Impact": "Reduces duplicate SKUs and downstream reconciliation.",
    "Success Metric": "Duplicate rate; percent merged automatically",
    "Systems or Data Sources": "Product catalog; ERP",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Stale product documentation",
    "Domain": "Product",
    "Category": "Product Operations",
    "Issue Description": "Product guides and specifications remain active after their review date.",
    "Automation Trigger": "Scheduled",
    "Automated Resolution": "Identify overdue documents, notify owners, and move confirmed obsolete content to an archive.",
    "Recommended Mechanism": "Workflow",
    "Priority": "Medium",
    "Automation Readiness": "Ready to Build",
    "Frequency": "Weekly",
    "Implementation Effort": "Low",
    "Business Impact": "Keeps customer-facing and internal product content current.",
    "Success Metric": "Percent reviewed on time; stale document count",
    "Systems or Data Sources": "SharePoint; product knowledge base",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Product launch checklist gaps",
    "Domain": "Product",
    "Category": "Product Operations",
    "Issue Description": "Launch tasks are missed because checklist completion isn't monitored consistently.",
    "Automation Trigger": "Threshold reached",
    "Automated Resolution": "Detect overdue or incomplete launch tasks, assign reminders, and escalate critical blockers.",
    "Recommended Mechanism": "Workflow",
    "Priority": "Critical",
    "Automation Readiness": "Candidate",
    "Frequency": "Daily",
    "Implementation Effort": "Medium",
    "Business Impact": "Reduces launch delays and missed readiness activities.",
    "Success Metric": "On-time launch task completion; blocker age",
    "Systems or Data Sources": "SharePoint; Planner; Teams",
    "Human Review Required": "FALSE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Product feedback not categorized",
    "Domain": "Product",
    "Category": "Customer Engagement",
    "Issue Description": "Customer feedback arrives as free text and isn't consistently tagged or routed.",
    "Automation Trigger": "New item or record",
    "Automated Resolution": "Classify feedback by theme and sentiment, then route it to the correct product owner.",
    "Recommended Mechanism": "Workflow",
    "Priority": "Medium",
    "Automation Readiness": "Candidate",
    "Frequency": "Real time",
    "Implementation Effort": "Medium",
    "Business Impact": "Speeds product insight and closes routing gaps.",
    "Success Metric": "Classification accuracy; routing time",
    "Systems or Data Sources": "CRM; survey platform; product backlog",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Release notes assembly",
    "Domain": "Product",
    "Category": "Reporting",
    "Issue Description": "Release notes are manually compiled from completed backlog items.",
    "Automation Trigger": "Manual selection",
    "Automated Resolution": "Collect selected completed items, format a standard release-note draft, and send it for approval.",
    "Recommended Mechanism": "Quick Step",
    "Priority": "Medium",
    "Automation Readiness": "Ready to Build",
    "Frequency": "On demand",
    "Implementation Effort": "Low",
    "Business Impact": "Shortens release communication preparation.",
    "Success Metric": "Hours saved per release; edit rate",
    "Systems or Data Sources": "Azure DevOps; SharePoint",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Unassigned inbound leads",
    "Domain": "Sales",
    "Category": "Pipeline Management",
    "Issue Description": "New leads remain without an owner, increasing response time and loss risk.",
    "Automation Trigger": "New item or record",
    "Automated Resolution": "Assign leads using territory, segment, and workload rules, then notify the seller.",
    "Recommended Mechanism": "Workflow",
    "Priority": "Critical",
    "Automation Readiness": "Ready to Build",
    "Frequency": "Real time",
    "Implementation Effort": "Medium",
    "Business Impact": "Improves speed to lead and ownership accountability.",
    "Success Metric": "Median assignment time; unassigned lead count",
    "Systems or Data Sources": "CRM; territory data; Teams",
    "Human Review Required": "FALSE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Stalled sales opportunities",
    "Domain": "Sales",
    "Category": "Pipeline Management",
    "Issue Description": "Opportunities remain in the same stage without recent activity.",
    "Automation Trigger": "Scheduled",
    "Automated Resolution": "Detect inactivity by stage, create follow-up tasks, and escalate high-value stalled deals.",
    "Recommended Mechanism": "Workflow",
    "Priority": "High",
    "Automation Readiness": "Candidate",
    "Frequency": "Daily",
    "Implementation Effort": "Low",
    "Business Impact": "Reduces pipeline leakage and improves forecast hygiene.",
    "Success Metric": "Stalled opportunity count; stage aging",
    "Systems or Data Sources": "CRM; Outlook; Planner",
    "Human Review Required": "FALSE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Quote approval delays",
    "Domain": "Sales",
    "Category": "Pricing and Quotes",
    "Issue Description": "Discounted quotes wait too long for review and approval.",
    "Automation Trigger": "Approval requested",
    "Automated Resolution": "Route quotes by discount and deal size, send reminders, and record the final decision.",
    "Recommended Mechanism": "Approval",
    "Priority": "Critical",
    "Automation Readiness": "Ready to Build",
    "Frequency": "Real time",
    "Implementation Effort": "Medium",
    "Business Impact": "Shortens quote turnaround while preserving pricing controls.",
    "Success Metric": "Approval cycle time; overdue approvals",
    "Systems or Data Sources": "CPQ; SharePoint Approvals; Teams",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "CRM contact data incomplete",
    "Domain": "Sales",
    "Category": "Data Quality",
    "Issue Description": "Account and contact records are missing required fields or use inconsistent formats.",
    "Automation Trigger": "Record updated",
    "Automated Resolution": "Validate email, phone, industry, and territory fields; enrich trusted values and flag exceptions.",
    "Recommended Mechanism": "Workflow",
    "Priority": "High",
    "Automation Readiness": "Needs Review",
    "Frequency": "Real time",
    "Implementation Effort": "High",
    "Business Impact": "Improves reconciliation, segmentation, and target quality.",
    "Success Metric": "CRM completeness score; auto-enrichment rate",
    "Systems or Data Sources": "CRM; enrichment provider",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Meeting follow-up tasks not created",
    "Domain": "Sales",
    "Category": "Customer Engagement",
    "Issue Description": "Action items from customer meetings aren't consistently captured and assigned.",
    "Automation Trigger": "New item or record",
    "Automated Resolution": "Extract agreed actions from meeting notes, create tasks, and notify owners with due dates.",
    "Recommended Mechanism": "Workflow",
    "Priority": "Medium",
    "Automation Readiness": "Candidate",
    "Frequency": "Real time",
    "Implementation Effort": "Medium",
    "Business Impact": "Improves follow-through and customer responsiveness.",
    "Success Metric": "Percent of meetings with follow-up; overdue action count",
    "Systems or Data Sources": "Teams; Outlook; Planner; CRM",
    "Human Review Required": "TRUE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  },
  {
    "Issue or Task Summary": "Weekly pipeline summary preparation",
    "Domain": "Sales",
    "Category": "Reporting",
    "Issue Description": "Sales managers manually assemble pipeline changes, risks, and next actions.",
    "Automation Trigger": "Scheduled",
    "Automated Resolution": "Generate a weekly summary of stage movement, aging, risk, wins, and required follow-ups.",
    "Recommended Mechanism": "Workflow",
    "Priority": "Medium",
    "Automation Readiness": "Ready to Build",
    "Frequency": "Weekly",
    "Implementation Effort": "Low",
    "Business Impact": "Saves manager time and improves pipeline visibility.",
    "Success Metric": "Preparation hours saved; report delivery rate",
    "Systems or Data Sources": "CRM; SharePoint; Teams",
    "Human Review Required": "FALSE",
    "Item Type": "Item",
    "Path": "sites/UNUMLargeDeal/Lists/Product and Sales Automation Grid"
  }
];

const GRID_COLUMNS = [
  { key: "Issue or Task Summary", label: "Issue / Task Summary", width: "240px" },
  { key: "Domain", label: "Domain", width: "100px" },
  { key: "Category", label: "Category", width: "160px" },
  { key: "Issue Description", label: "Issue Description", width: "280px" },
  { key: "Automation Trigger", label: "Automation Trigger", width: "160px" },
  { key: "Automated Resolution", label: "Automated Resolution", width: "280px" },
  { key: "Recommended Mechanism", label: "Recommended Mechanism", width: "190px" },
  { key: "Priority", label: "Priority", width: "100px" },
  { key: "Automation Readiness", label: "Automation Readiness", width: "175px" },
  { key: "Frequency", label: "Frequency", width: "110px" },
  { key: "Implementation Effort", label: "Implementation Effort", width: "185px" },
  { key: "Business Impact", label: "Business Impact", width: "280px" },
  { key: "Success Metric", label: "Success Metric", width: "240px" },
  { key: "Systems or Data Sources", label: "Systems / Data Sources", width: "210px" },
  { key: "Human Review Required", label: "Human Review Required", width: "185px" },
  { key: "Item Type", label: "Item Type", width: "110px" },
  { key: "Path", label: "Path", width: "320px" },
];

const PRIORITY_STYLES = {
  Critical: { bg: "rgba(239, 68, 68, 0.12)", color: "#dc2626", border: "rgba(239, 68, 68, 0.25)" },
  High: { bg: "rgba(249, 115, 22, 0.12)", color: "#d97706", border: "rgba(249, 115, 22, 0.25)" },
  Medium: { bg: "rgba(202, 138, 4, 0.12)", color: "#b45309", border: "rgba(202, 138, 4, 0.25)" },
  Low: { bg: "rgba(34, 197, 94, 0.12)", color: "#15803d", border: "rgba(34, 197, 94, 0.25)" },
};

const READINESS_STYLES = {
  "Ready to Build": { bg: "rgba(34, 197, 94, 0.12)", color: "#15803d" },
  "Candidate": { bg: "rgba(99, 102, 241, 0.12)", color: "#4f46e5" },
  "Needs Review": { bg: "rgba(249, 115, 22, 0.12)", color: "#d97706" },
};

function AutomationDataGrid() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = AUTOMATION_DATA
    .filter(row => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return Object.values(row).some(v => String(v).toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  // CSV download
  const downloadCSV = () => {
    const headers = GRID_COLUMNS.map(c => `"${c.label}"`).join(",");
    const rows = filtered.map(row =>
      GRID_COLUMNS.map(c => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "automation_grid.csv"; a.click(); URL.revokeObjectURL(url);
  };

  // Excel download (TSV wrapped as .xls for broad compatibility)
  const downloadExcel = () => {
    const headers = GRID_COLUMNS.map(c => c.label).join("\t");
    const rows = filtered.map(row => GRID_COLUMNS.map(c => String(row[c.key] ?? "")).join("\t"));
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "automation_grid.xls"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Grid Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", opacity: 0.5, pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search grid…"
              style={{
                background: "var(--surface-input)",
                border: "1px solid var(--border-input)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "12px",
                padding: "7px 12px 7px 30px",
                width: "180px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--border-hover)"}
              onBlur={e => e.target.style.borderColor = "var(--border-input)"}
            />
          </div>
          {/* CSV Button */}
          <button
            onClick={downloadCSV}
            title="Download as CSV"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: isLight ? "#16a34a" : "#4ade80", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.12)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            CSV
          </button>
          {/* Excel Button */}
          <button
            onClick={downloadExcel}
            title="Download as Excel"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: isLight ? "#4f46e5" : "#a5b4fc", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></svg>
            Excel
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: "480px",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        background: "var(--surface-card)",
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border) transparent",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "2800px" }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, zIndex: 10, background: isLight ? "#f8fafc" : "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
              {GRID_COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: sortKey === col.key ? "var(--cyan)" : "var(--text-secondary)",
                    borderBottom: "1px solid var(--border)",
                    borderRight: i < GRID_COLUMNS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    minWidth: col.width,
                    transition: "color 0.15s",
                    background: sortKey === col.key ? "var(--hover-bg)" : "transparent",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {col.label}
                    <span style={{ opacity: sortKey === col.key ? 1 : 0.3, fontSize: "10px" }}>
                      {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const pStyle = PRIORITY_STYLES[row.Priority] || {};
              const rStyle = READINESS_STYLES[row["Automation Readiness"]] || {};
              return (
                <tr
                  key={idx}
                  style={{
                    transition: "background 0.15s",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {GRID_COLUMNS.map((col, ci) => {
                    const val = row[col.key] ?? "—";
                    const isLast = ci === GRID_COLUMNS.length - 1;

                    let cellContent = (
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        {val}
                      </span>
                    );

                    if (col.key === "Issue or Task Summary") {
                      cellContent = (
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.5" }}>
                          {val}
                        </span>
                      );
                    } else if (col.key === "Priority") {
                      cellContent = (
                        <span style={{ display: "inline-block", background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>
                          {val}
                        </span>
                      );
                    } else if (col.key === "Automation Readiness") {
                      cellContent = (
                        <span style={{ display: "inline-block", background: rStyle.bg, color: rStyle.color, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "600" }}>
                          {val}
                        </span>
                      );
                    } else if (col.key === "Human Review Required") {
                      const isTrue = String(val).toUpperCase() === "TRUE";
                      cellContent = (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "600", color: isTrue ? "#ea580c" : "#16a34a" }}>
                          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: isTrue ? "#ea580c" : "#16a34a", flexShrink: 0 }} />
                          {isTrue ? "Yes" : "No"}
                        </span>
                      );
                    } else if (col.key === "Domain") {
                      cellContent = (
                        <span style={{ display: "inline-block", background: val === "Product" ? "rgba(147, 51, 234, 0.1)" : "rgba(13, 148, 136, 0.1)", color: val === "Product" ? "#7c3aed" : "#0f766e", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>
                          {val}
                        </span>
                      );
                    }

                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "11px 14px",
                          borderBottom: "1px solid var(--border-subtle)",
                          borderRight: isLast ? "none" : "1px solid var(--border-subtle)",
                          verticalAlign: "top",
                          maxWidth: col.width,
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={GRID_COLUMNS.length} style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No results match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Showing {filtered.length} of {AUTOMATION_DATA.length} records · Click column headers to sort
        </span>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {

  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showPrdModal, setShowPrdModal] = useState(false);
  const [showAppHealthModal, setShowAppHealthModal] = useState(false);
  const [selectedHealthApp, setSelectedHealthApp] = useState(null);
  const [selectedPrdItem, setSelectedPrdItem] = useState(null);
  const [showClaimsModal, setShowClaimsModal] = useState(false);

  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isPrdChatOpen, setIsPrdChatOpen] = useState(false);
  const [prdChatKey, setPrdChatKey] = useState(0);
  const [selectedActionItem, setSelectedActionItem] = useState(null);

  // All tickets that live in Human-in-The-Loop.
  // They are NOT in the agent_resolve tab initially — they move there only after resolution.
  const HITL_SOURCE_ITEMS = [
    { id: "ar1", num: "INC0048219", service: "Member Portal Auth", subject: "Verification Code Email Not Received - Member Portal Password Reset", desc: "User unable to log in to member portal due to unreceived password reset verification code email.", resolution: "Email Suppression Removal & Verification Reset Flow", status: "Action Required", statusType: "warn", isDeterministic: true, actionLabel: "Agent Resolve" },
    { id: "ar2", num: "INC0047582", service: "Member Registration", subject: "Application Issue - Date of Birth Validation Error", desc: "User unable to log in during registration due to date of birth validation error.", resolution: "DOB Validation & Format Verification Flow", status: "Action Required", statusType: "warn", isDeterministic: true, actionLabel: "Agent Resolve" },
    { id: "ar3", num: "INC0049301", service: "Account Identity", subject: "Application Issue - Existing Account Registration Conflict", desc: "User unable to create account due to system reporting existing account conflict.", resolution: "Account State Verification & Password Reset Guidance Flow", status: "Action Required", statusType: "warn", isDeterministic: true, actionLabel: "Agent Resolve" },
    { id: "arb1", num: "INC0046824", service: "Batch Scheduler", subject: "Batch Job Failure — Auto-Restart Required", desc: "Nightly batch job encountered an exception and stalled. AI auto-restart and lock clearance ready.", system: "Batch Scheduler", resolution: "Automated Batch Job Restart & Lock Clearance", status: "Action Required", statusType: "warn", isIgnio: true, actionLabel: "Auto Resolve", batchTag: "Batch Job Auto-Restart" },
    { id: "arb2", num: "INC0048915", service: "HR Enrollment", subject: "Member Enrollment Batch Stalled — Auto-Resume Required", desc: "Overnight HR member sign-up batch feed paused due to file lock. AI auto-resume ready.", system: "HR Enrollment", resolution: "Automated Member Enrollment Batch Resume", status: "Action Required", statusType: "warn", isIgnio: true, actionLabel: "Auto Resolve", batchTag: "Enrollment Batch Resume" },
  ];

  // Human in The Loop — Agent Resolve / Auto Resolve flow
  const [hitlItems, setHitlItems] = useState(HITL_SOURCE_ITEMS);
  const [hitlResolvedItems, setHitlResolvedItems] = useState([]); // items moved to agent_resolve tab after resolution
  const [hitlSourceItem, setHitlSourceItem] = useState(null);       // deterministic HITL card that opened the modal
  const [hitlIgnioSourceItem, setHitlIgnioSourceItem] = useState(null); // ignio HITL card that opened the modal
  const [metricToggle, setMetricToggle] = useState("AUTO-RESOLVED"); // "AUTO-RESOLVED" or "FTRDR"




  // Application Workspaces States for AD Developer
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(() => {
    const saved = sessionStorage.getItem("landing_selected_workspace");
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  // Selected Domain & Role states (defaulting to user session context or first allowed)
  const allowedDomains = user?.isSuperAdmin
    ? BUSINESS_AREAS.filter(a => a.status !== "coming_soon").map(a => a.name)
    : user?.domains || ["AI for AD"];

  const [selectedArea, setSelectedArea] = useState(() => {
    return user?.activeBusinessArea || (allowedDomains.length > 0 ? allowedDomains[0] : "AI for AD");
  });

  const [selectedRole, setSelectedRole] = useState(() => {
    const role = user?.activeRole;
    if (role === "Admin" || role === "Tester") return "Product Owner";
    return role || "Product Owner";
  });

  const L0_CLASSIFICATIONS = [
    "Acquisition",
    "Medical Management",
    "Back Office Mgmt.",
    "Engagement Management",
    "Corporate Functions",
    "Enterprise",
    "Enterprise Analytics",
    "Enterprise Data",
  ];

  const [selectedL0, setSelectedL0] = useState(() => {
    return sessionStorage.getItem("landing_selected_l0") || "Acquisition";
  });



  // SEL Nexus States for L3/L4 Support Engineer
  const [selNexusOpen, setSelNexusOpen] = useState(false);
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);

  // ignio Auto Resolve Execution States
  const [ignioModalOpen, setIgnioModalOpen] = useState(false);
  const [ignioCurrentStep, setIgnioCurrentStep] = useState(0);
  const [ignioIsRunning, setIgnioIsRunning] = useState(false);
  const [ignioIsResolved, setIgnioIsResolved] = useState(false);
  const [ignioItem, setIgnioItem] = useState(null);

  // Agent Resolve Tab specific states
  const [agentResolveFilter, setAgentResolveFilter] = useState("all");

  // Deterministic Application Issue Auto Resolve Chat States
  const [deterministicModalOpen, setDeterministicModalOpen] = useState(false);
  const [deterministicMessages, setDeterministicMessages] = useState([]);
  const [deterministicIsRunning, setDeterministicIsRunning] = useState(false);
  const [deterministicIsResolved, setDeterministicIsResolved] = useState(false);
  const [deterministicItem, setDeterministicItem] = useState(null);
  const [deterministicInputValue, setDeterministicInputValue] = useState("");
  const [deterministicAgentTyping, setDeterministicAgentTyping] = useState(false);
  const deterministicChatBodyRef = useRef(null);
  const deterministicChatEndRef = useRef(null);
  // Applications Dropdown Menu States
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Applications Data & Dropdown Setup
  const DEFAULT_APP = { id: "bspoke", name: "BSpoke Application", category: "Custom AD", key: "BSPOKE" };

  const DROPDOWN_APPLICATIONS = [
    { id: "bspoke", name: "BSpoke Application", category: "Custom AD", key: "BSPOKE" },
    { id: "snow", name: "ServiceNow", category: "ITSM Platform", key: "SNOW" },
    { id: "orcl", name: "Oracle ERP", category: "Enterprise ERP", key: "ORCL" },
    { id: "sfdc", name: "Salesforce", category: "CRM Platform", key: "SFDC" },
    { id: "pega", name: "Pega", category: "BPM Engine", key: "PEGA" },
    { id: "cc", name: "Contact Center", category: "Voice & AI", key: "CC" },
    { id: "clm", name: "Claims Core Portal", category: "Health Core", key: "CLM" },
  ];

  const APPLICATION_DATA_MAP = {
    "BSpoke Application": {
      epics: [
        { id: "ep1", code: "EPIC-BSPOKE-104", name: "Smart Claims Auto-Adjudication Flow", status: "Active", progress: 80, storiesCount: 10, valueScore: "9.8/10", lead: "Sarah Jenkins", desc: "Automate tier-1 medical claims processing using GenAI pattern matcher." },
        { id: "ep2", code: "EPIC-BSPOKE-108", name: "Provider Portal Self-Service Onboarding", status: "At Risk", progress: 45, storiesCount: 8, valueScore: "9.2/10", lead: "Michael Ross", desc: "Streamline NPI registration and credential verification workflow." },
        { id: "ep3", code: "EPIC-BSPOKE-112", name: "Member Telehealth Integration API", status: "In Refinement", progress: 20, storiesCount: 6, valueScore: "8.9/10", lead: "David Chen", desc: "Real-time virtual care visit scheduling and claims sync API." },
      ],
      user_stories: [
        { id: "st1", code: "BSPOKE-409", title: "Member Claims Instant Lookup API", points: 5, priority: "High", status: "In Review", acStatus: "Needs PO Sign-off", epic: "EPIC-BSPOKE-104", desc: "As a member, I want to query my claim status in real-time so I can track payout progress." },
        { id: "st2", code: "BSPOKE-412", title: "Prior-Authorization Auto-Approval Rules Engine", points: 8, priority: "Critical", status: "In Progress", acStatus: "Approved by AI", epic: "EPIC-BSPOKE-104", desc: "As a provider, I want instant prior-auth approval for routine procedures based on clinical rules." },
        { id: "st3", code: "BSPOKE-415", title: "Provider Network Directory Search API", points: 3, priority: "Medium", status: "Backlog", acStatus: "Drafted", epic: "EPIC-BSPOKE-108", desc: "As a patient, I want to search for in-network physicians by location and specialty." },
        { id: "st4", code: "BSPOKE-418", title: "HIPAA Audit Log Encryption Service", points: 5, priority: "High", status: "Blocked", acStatus: "Pending AC Clarification", epic: "EPIC-BSPOKE-112", desc: "As a compliance officer, I need all telehealth session logs encrypted at rest." },
        { id: "st5", code: "BSPOKE-421", title: "Member Portal Password Reset Self-Service", points: 3, priority: "High", status: "In Progress", acStatus: "Approved", epic: "EPIC-BSPOKE-104", desc: "As a member, I want to reset my account password using SMS MFA verification." },
        { id: "st6", code: "BSPOKE-424", title: "Benefits & Deductible Accumulator Sync", points: 8, priority: "Critical", status: "In Review", acStatus: "Drafted", epic: "EPIC-BSPOKE-104", desc: "As a member, I want my annual deductible balance updated within 2 seconds of claim payment." },
        { id: "st7", code: "BSPOKE-427", title: "Explanation of Benefits (EOB) PDF Generator", points: 5, priority: "Medium", status: "Backlog", acStatus: "Approved", epic: "EPIC-BSPOKE-104", desc: "As a member, I want to download my EOB statement as a secure PDF." },
        { id: "st8", code: "BSPOKE-439", title: "Premium Payment Gateway Integration", points: 8, priority: "High", status: "Backlog", acStatus: "Approved", epic: "EPIC-BSPOKE-104", desc: "As a member, I want to pay monthly healthcare plan premiums via credit card or ACH." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "BSPOKE-409", title: "Successful Claim Payout Retrieval Scenario", format: "GIVEN member ID M-9842100 is active WHEN member queries claim status THEN return claim payout details within 50ms with 200 OK.", status: "Verified" },
        { id: "ac2", story: "BSPOKE-409", title: "Invalid Member Credentials Error Scenario", format: "GIVEN an expired auth token WHEN user requests claim data THEN return HTTP 401 Unauthorized with error code CLM-401.", status: "Needs Clarification" },
        { id: "ac3", story: "BSPOKE-412", title: "High-Risk Procedure Escalation Scenario", format: "GIVEN a procedure code with cost > $5,000 WHEN evaluated by engine THEN route to human medical reviewer.", status: "Verified" },
      ],
    },
    "ServiceNow": {
      epics: [
        { id: "ep1", code: "EPIC-SNOW-201", name: "Automated Incident Remediation & ITSM Workflows", status: "Active", progress: 90, storiesCount: 12, valueScore: "9.9/10", lead: "Alex Rivera", desc: "AI-driven auto-triage and resolution of P1/P2 infrastructure incidents in ServiceNow." },
        { id: "ep2", code: "EPIC-SNOW-204", name: "Change Advisory Board (CAB) AI Risk Evaluator", status: "In Progress", progress: 65, storiesCount: 7, valueScore: "9.4/10", lead: "Elena Rostova", desc: "Predict change request failure probability using historical CMDB telemetry." },
      ],
      user_stories: [
        { id: "st1", code: "SNOW-301", title: "ServiceNow Incident Auto-Assignment via ML Triage", points: 5, priority: "Critical", status: "In Progress", acStatus: "Approved", epic: "EPIC-SNOW-201", desc: "As an IT Operations Manager, I want inbound tickets automatically assigned to the correct tier-2 group based on ML text classification." },
        { id: "st2", code: "SNOW-305", title: "CMDB Asset Dependency Graph Visualization", points: 8, priority: "High", status: "In Review", acStatus: "Drafted", epic: "EPIC-SNOW-204", desc: "As an incident responder, I want a real-time topology map showing impacted downstream microservices." },
        { id: "st3", code: "SNOW-309", title: "Virtual Agent Integration for Password Resets", points: 3, priority: "Medium", status: "Backlog", acStatus: "Approved", epic: "EPIC-SNOW-201", desc: "As an employee, I want the ServiceNow chatbot to reset my Active Directory password automatically." },
        { id: "st4", code: "SNOW-312", title: "SLA Breach Warning & Auto-Escalation Bot", points: 5, priority: "High", status: "In Progress", acStatus: "Approved", epic: "EPIC-SNOW-201", desc: "As a service desk lead, I want push notifications when an incident reaches 75% of its resolution SLA." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "SNOW-301", title: "Automated Incident Assignment SLA Scenario", format: "GIVEN a new P1 incident created in ServiceNow WHEN AI triage agent evaluates ticket THEN assign to on-call team within 15 seconds.", status: "Verified" },
        { id: "ac2", story: "SNOW-305", title: "High-Risk Change CAB Approval Scenario", format: "GIVEN a change request with risk score > 80% WHEN submitted to CAB THEN automatically mandate director approval before release.", status: "Verified" },
      ],
    },
    "Oracle ERP": {
      epics: [
        { id: "ep1", code: "EPIC-ORCL-301", name: "Enterprise Financial Reconciliation & Billing Engine", status: "Active", progress: 75, storiesCount: 9, valueScore: "9.7/10", lead: "Marcus Vance", desc: "Automated GL journal entry matching and invoice discrepancy resolution in Oracle Financials." },
        { id: "ep2", code: "EPIC-ORCL-305", name: "Procurement & Vendor Payment Automation", status: "In Refinement", progress: 40, storiesCount: 6, valueScore: "9.1/10", lead: "Diana Prince", desc: "AI audit of vendor invoices against purchase orders and vendor contracts." },
      ],
      user_stories: [
        { id: "st1", code: "ORCL-501", title: "Automated Invoice 3-Way Matching Engine", points: 8, priority: "Critical", status: "In Progress", acStatus: "Approved", epic: "EPIC-ORCL-301", desc: "As an AP specialist, I want vendor invoices auto-matched against PO and Receiving receipt data." },
        { id: "st2", code: "ORCL-504", title: "General Ledger Period-End Closing Automation", points: 5, priority: "High", status: "In Review", acStatus: "Drafted", epic: "EPIC-ORCL-301", desc: "As a controller, I want automated reconciliation of subledger balances to GL accounts during month-end close." },
        { id: "st3", code: "ORCL-508", title: "Supplier Onboarding & Tax ID Verification", points: 5, priority: "Medium", status: "Backlog", acStatus: "Approved", epic: "EPIC-ORCL-305", desc: "As a procurement manager, I want automated IRS W-9 validation for new vendor registrations." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "ORCL-501", title: "3-Way Invoice Match Auto-Approve Scenario", format: "GIVEN vendor invoice amount matches PO within 0.1% tolerance WHEN processed THEN approve payment automatically without manual review.", status: "Verified" },
        { id: "ac2", story: "ORCL-504", title: "Mismatched GL Balance Alert Scenario", format: "GIVEN a mismatched GL balance at month-end WHEN period close runs THEN alert finance manager with recommended adjustment journal.", status: "Needs Clarification" },
      ],
    },
    "Salesforce": {
      epics: [
        { id: "ep1", code: "EPIC-SFDC-401", name: "Employer Group Sales Lead Scoring & CRM AI", status: "Active", progress: 85, storiesCount: 11, valueScore: "9.6/10", lead: "Rachel Adams", desc: "Predict broker deal closure velocity and automated lead routing in Salesforce Sales Cloud." },
        { id: "ep2", code: "EPIC-SFDC-405", name: "Health Plan Renewal Opportunity Automation", status: "In Progress", progress: 55, storiesCount: 8, valueScore: "9.3/10", lead: "Brandon Taylor", desc: "Automated quote generation and contract renewal workflows for enterprise employer groups." },
      ],
      user_stories: [
        { id: "st1", code: "SFDC-601", title: "Intelligent Lead Scoring & Automated Assignment", points: 5, priority: "High", status: "In Progress", acStatus: "Approved", epic: "EPIC-SFDC-401", desc: "As a sales manager, I want employer leads scored based on company headcount and location." },
        { id: "st2", code: "SFDC-605", title: "Broker Quoting Calculator API Sync", points: 8, priority: "Critical", status: "In Review", acStatus: "Approved", epic: "EPIC-SFDC-405", desc: "As an account executive, I want instant premium rate calculation synced from underwriting engine." },
        { id: "st3", code: "SFDC-609", title: "Customer 360 Health Plan Engagement View", points: 5, priority: "Medium", status: "Backlog", acStatus: "Drafted", epic: "EPIC-SFDC-401", desc: "As a customer success lead, I want a single tab summarizing member enrollment and claim volume." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "SFDC-601", title: "High-Value Lead Routing Scenario", format: "GIVEN a new employer lead with > 500 employees WHEN created in Salesforce THEN set lead score to Hot and assign to Enterprise VP.", status: "Verified" },
        { id: "ac2", story: "SFDC-605", title: "Real-time Rate Calculation Scenario", format: "GIVEN a quote parameters payload WHEN calculated THEN update Salesforce Opportunity expected revenue in real-time.", status: "Verified" },
      ],
    },
    "Pega": {
      epics: [
        { id: "ep1", code: "EPIC-PEGA-501", name: "Healthcare Appeals & Grievances BPM Workflow", status: "Active", progress: 70, storiesCount: 10, valueScore: "9.5/10", lead: "Jonathan Sterling", desc: "Automated SLA tracking and regulatory reporting for member appeals in Pega PRPC." },
        { id: "ep2", code: "EPIC-PEGA-505", name: "Case Management & Clinical Review Pipeline", status: "At Risk", progress: 50, storiesCount: 7, valueScore: "9.0/10", lead: "Samantha Wu", desc: "Nurse reviewer decision support and clinical documentation automation." },
      ],
      user_stories: [
        { id: "st1", code: "PEGA-701", title: "Grievance Case Auto-Creation from Call Transcripts", points: 5, priority: "High", status: "In Progress", acStatus: "Approved", epic: "EPIC-PEGA-501", desc: "As a grievance specialist, I want Pega cases automatically populated from call recording text summaries." },
        { id: "st2", code: "PEGA-705", title: "Nurse Reviewer Clinical Evidence Summarizer", points: 8, priority: "Critical", status: "In Review", acStatus: "Approved", epic: "EPIC-PEGA-505", desc: "As a clinical reviewer, I want AI to highlight relevant medical necessity criteria in uploaded charts." },
        { id: "st3", code: "PEGA-709", title: "Regulatory State Compliance SLA Monitor", points: 3, priority: "Medium", status: "Backlog", acStatus: "Drafted", epic: "EPIC-PEGA-501", desc: "As a compliance manager, I want automated warnings before state-mandated appeal deadlines." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "PEGA-701", title: "Urgent Grievance SLA Trigger Scenario", format: "GIVEN an urgent member grievance logged in Pega WHEN created THEN enforce 24-hour resolution SLA timer with automated manager alerts.", status: "Verified" },
        { id: "ac2", story: "PEGA-705", title: "Medical Record NLP Summarization Scenario", format: "GIVEN medical chart PDF attachments WHEN uploaded to Pega case THEN extract clinical diagnosis codes and summarize key findings.", status: "Verified" },
      ],
    },
    "Contact Center": {
      epics: [
        { id: "ep1", code: "EPIC-CC-601", name: "Conversational Voice AI & Real-Time Agent Assist", status: "Active", progress: 88, storiesCount: 14, valueScore: "9.8/10", lead: "Derek Morgan", desc: "Live call transcription, sentiment analysis, and instant KB suggestion for call center representatives." },
        { id: "ep2", code: "EPIC-CC-605", name: "Interactive Voice Response (IVR) Self-Service Bot", status: "In Progress", progress: 60, storiesCount: 9, valueScore: "9.3/10", lead: "Chloe Bennett", desc: "Voice-enabled benefit verification and claims status checking without agent intervention." },
      ],
      user_stories: [
        { id: "st1", code: "CC-801", title: "Real-Time Agent Assist Knowledge Base Popups", points: 5, priority: "High", status: "In Progress", acStatus: "Approved", epic: "EPIC-CC-601", desc: "As a call center representative, I want relevant knowledge articles popped on screen based on live caller intent." },
        { id: "st2", code: "CC-805", title: "Voice Biometric Caller Authentication Engine", points: 8, priority: "Critical", status: "In Review", acStatus: "Approved", epic: "EPIC-CC-605", desc: "As a member, I want to authenticate over the phone using my unique voiceprint." },
        { id: "st3", code: "CC-809", title: "Post-Call Sentiment Analysis & Quality Scoring", points: 3, priority: "Medium", status: "Backlog", acStatus: "Drafted", epic: "EPIC-CC-601", desc: "As a QA manager, I want automated sentiment scoring across 100% of recorded customer calls." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "CC-805", title: "Voice Biometric Match Authentication Scenario", format: "GIVEN a caller speaking into IVR WHEN voice passphrase matches biometrics THEN authenticate caller without requiring SSN entry.", status: "Verified" },
        { id: "ac2", story: "CC-809", title: "Negative Sentiment Alert Escalation Scenario", format: "GIVEN a caller expressing frustration WHEN sentiment score drops below 30% THEN alert supervisor dashboard in real-time.", status: "Verified" },
      ],
    },
    "Claims Core Portal": {
      epics: [
        { id: "ep1", code: "EPIC-CLM-701", name: "High-Throughput Claims Ingestion & EDI 837 Processor", status: "Active", progress: 92, storiesCount: 15, valueScore: "9.9/10", lead: "Victor Stone", desc: "Process millions of X12 837 professional and institutional claims per hour with sub-second latency." },
        { id: "ep2", code: "EPIC-CLM-705", name: "Fraud, Waste & Abuse (FWA) AI Detection Engine", status: "In Progress", progress: 75, storiesCount: 10, valueScore: "9.6/10", lead: "Natasha Romanoff", desc: "Real-time anomaly detection for suspicious billing patterns and unbundled CPT codes." },
      ],
      user_stories: [
        { id: "st1", code: "CLM-901", title: "EDI 837P & 837I Batch Parser Engine", points: 8, priority: "Critical", status: "In Progress", acStatus: "Approved", epic: "EPIC-CLM-701", desc: "As a claims engine developer, I want high-throughput X12 file parsing with line-item error tracking." },
        { id: "st2", code: "CLM-905", title: "FWA Anomaly Scoring & Claim Hold Rules", points: 8, priority: "High", status: "In Review", acStatus: "Approved", epic: "EPIC-CLM-705", desc: "As a fraud investigator, I want claims with anomaly scores > 85 automatically placed on payment hold." },
        { id: "st3", code: "CLM-909", title: "Duplicate Claim Detection & Auto-Rejection", points: 5, priority: "Medium", status: "Backlog", acStatus: "Approved", epic: "EPIC-CLM-701", desc: "As an adjudication specialist, I want duplicate claims submitted within 30 days flagged and auto-rejected." },
      ],
      acceptance_criteria: [
        { id: "ac1", story: "CLM-901", title: "Batch EDI 837 Parsing Throughput Scenario", format: "GIVEN an EDI 837 file with 50,000 claims WHEN processed by parser THEN complete validation within 120 seconds with 0 data corruption.", status: "Verified" },
        { id: "ac2", story: "CLM-909", title: "Duplicate Claim Auto-Rejection Scenario", format: "GIVEN a claim submitted twice with identical billing date and provider WHEN evaluated THEN mark second claim as duplicate and set status to Rejected.", status: "Verified" },
      ],
    },
  };

  const startIgnioAutoResolve = (item) => {
    setIgnioItem(item);
    setIgnioCurrentStep(1);
    setIgnioIsRunning(true);
    setIgnioIsResolved(false);
    setIgnioModalOpen(true);
  };

  const startDeterministicAutoResolve = (item) => {
    setDeterministicItem(item);
    setDeterministicIsRunning(true);
    setDeterministicIsResolved(false);
    setDeterministicInputValue("");
    setDeterministicAgentTyping(false);

    setDeterministicMessages([
      {
        id: 1,
        sender: "agent",
        text: "Hi, how can I help you?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      }
    ]);
    setDeterministicModalOpen(true);
  };

  useEffect(() => {
    let timer;
    if (deterministicIsRunning && deterministicModalOpen) {
      const stepCount = deterministicMessages.length;
      const isVerificationFlow = deterministicItem?.id === "ar1" || deterministicItem?.service?.includes("Member Portal") || deterministicItem?.subject?.includes("Verification Code") || !deterministicItem?.id;
      const isDobFlow = deterministicItem?.id === "ar2" || deterministicItem?.service?.includes("Registration") || deterministicItem?.subject?.includes("Date of Birth");
      const isAccountConflictFlow = deterministicItem?.id === "ar3" || deterministicItem?.service?.includes("Account Identity") || deterministicItem?.subject?.includes("Existing Account");

      const addMsg = (sender, text) => {
        setDeterministicMessages((prev) => [
          ...prev,
          { id: prev.length + 1, sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
        ]);
      };

      if (isVerificationFlow) {
        if (stepCount === 2) {
          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg("agent", "I'm sorry you're having trouble logging in because the verification code email isn't coming through.\n\nAre you trying to log in, reset your password, or register a new account?");
          }, 6000);
        } else if (stepCount === 4) {
          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg("agent", "I can help you reset your password and get the verification code email delivered.\n\nHave you checked your Spam/Junk (and Promotions, if you use Gmail) folders for the verification code email?");
          }, 7000);
        } else if (stepCount === 6) {
          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg("agent", "I understand-thank you for confirming you've checked Spam/Junk and it's not there.\n\nWhat email address are you using to request the password reset verification code?");
          }, 7000);
        } else if (stepCount === 8) {
          const lastUserMsg = deterministicMessages[deterministicMessages.length - 1]?.text || "";
          const emailMatch = lastUserMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const targetEmail = emailMatch ? emailMatch[0] : (lastUserMsg.trim() || "supriya@yahoo.com");

          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg(
              "agent",
              `I've got it - you're using ${targetEmail} for the password reset.\n\nI checked the status for that email and found it's suppressed (hard bounce), which means our verification/OTP emails are being blocked and won't deliver. I've removed the suppression and cleared the stale verification attempts, so the system is ready to send a new code.\n\nPlease follow these steps:\n\n1. Clear your browser cache and cookies (or open a Private/Incognito window).\n2. Go back to the portal sign-in page and select "Change Password" / "Forgot Password."\n3. Request a new verification code (use only the most recent code).\n4. Check your Inbox (and Spam/Junk again, just in case).\n5. The email will come from no-reply@mail.entrykeyid.com.\n6. Your verification code expires in about 5 minutes-if it expires, wait for it to fully expire before requesting another.\n\nYou should now be able to receive the code and reset your password successfully.`
            );
          }, 8000);
        } else if (stepCount === 9) {
          timer = setTimeout(() => {
            setDeterministicMessages((prev) => [
              ...prev,
              { id: prev.length + 1, sender: "system", text: " Issue is resolved successfully!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), isSuccess: true }
            ]);
            setDeterministicIsRunning(false);
            setDeterministicIsResolved(true);
            if (deterministicItem) {
              deterministicItem.status = "Resolved";
              deterministicItem.statusType = "good";
              deterministicItem.resolution = "Suppression Removed & Verification Reset";
              deterministicItem.timeToResolve = "14 seconds";
              deterministicItem.csat = "5/5 Stars";
              deterministicItem.isResolved = true;
            }
          }, 2000);
        }
      } else if (isDobFlow) {
        if (stepCount === 2) {
          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg("agent", "I'm sorry you're running into that-I'd like to help get you logged in. Are you trying to register for a new account or log in to an existing account?");
          }, 6000);
        } else if (stepCount === 4) {
          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg("agent", "I understand-thanks for confirming you're registering for a new account.\n\nWhat exact date of birth are you entering (please type it exactly as you're inputting it, including any dashes or slashes)?");
          }, 7000);
        } else if (stepCount === 6) {
          const lastUserMsg = deterministicMessages[deterministicMessages.length - 1]?.text || "";
          const dobMatch = lastUserMsg.match(/\d{2}[-/]\d{2}[-/]\d{4}/);
          const typedDob = dobMatch ? dobMatch[0] : (lastUserMsg.trim() || "10-25-1990");

          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg(
              "agent",
              `Thanks-yes, you're entering your date of birth in the correct format. ${typedDob} matches the required MM-DD-YYYY format, so this doesn't look like a formatting issue.\n\nPlease try re-entering it exactly as ${typedDob} (with dashes) and make sure there are no extra spaces before or after it.`
            );
          }, 8000);
        } else if (stepCount === 7) {
          timer = setTimeout(() => {
            setDeterministicMessages((prev) => [
              ...prev,
              { id: prev.length + 1, sender: "system", text: " Issue is resolved successfully!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), isSuccess: true }
            ]);
            setDeterministicIsRunning(false);
            setDeterministicIsResolved(true);
            if (deterministicItem) {
              deterministicItem.status = "Resolved";
              deterministicItem.statusType = "good";
              deterministicItem.resolution = "DOB Format Validated & Account Match Verified";
              deterministicItem.timeToResolve = "12 seconds";
              deterministicItem.csat = "5/5 Stars";
              deterministicItem.isResolved = true;
            }
          }, 2000);
        }
      } else if (isAccountConflictFlow) {
        if (stepCount === 2) {
          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg("agent", "I understand how frustrating that can be. To help me check whether there's an existing, inactive, or blocked account tied to your details, please share the email address you're using to register (the exact one you entered on the sign-up page).");
          }, 6000);
        } else if (stepCount === 4) {
          const lastUserMsg = deterministicMessages[deterministicMessages.length - 1]?.text || "";
          const emailMatch = lastUserMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const targetEmail = emailMatch ? emailMatch[0] : (lastUserMsg.trim() || "supriya@yahoo.com");

          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg(
              "agent",
              `Thanks. I just want to confirm one detail so I can proceed correctly: is ${targetEmail} the exact email address you're entering on the registration page (spelled exactly the same, with no extra spaces)?\n\nOnce you confirm, I'll check whether there's an existing (active/inactive/blocked) account tied to it and guide you on the next step.`
            );
          }, 7000);
        } else if (stepCount === 6) {
          const emailMsg = deterministicMessages.find((m) => m.sender === "user" && m.text.includes("@"))?.text || "supriya@yahoo.com";
          const emailMatch = emailMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          const targetEmail = emailMatch ? emailMatch[0] : "supriya@yahoo.com";

          setDeterministicAgentTyping(true);
          timer = setTimeout(() => {
            setDeterministicAgentTyping(false);
            addMsg(
              "agent",
              `Thank you for confirming. I've checked the records available to me, and ${targetEmail} is not showing as an Active/Inactive/Blocked account in the current list-so there isn't an inactive legacy account I can delete on my side based on this data.\n\nTo get you registered successfully, please try these quick steps:\n\n1. Use "Sign in / Forgot password" (since the system is indicating an account already exists) and attempt a password reset for ${targetEmail}.\n2. If you don't receive the reset email, check Spam/Junk and confirm there are no typos or extra spaces in the email.`
            );
          }, 8000);
        } else if (stepCount === 7) {
          timer = setTimeout(() => {
            setDeterministicMessages((prev) => [
              ...prev,
              { id: prev.length + 1, sender: "system", text: " Issue is resolved successfully!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), isSuccess: true }
            ]);
            setDeterministicIsRunning(false);
            setDeterministicIsResolved(true);
            if (deterministicItem) {
              deterministicItem.status = "Resolved";
              deterministicItem.statusType = "good";
              deterministicItem.resolution = "Account Existence Verified & Reset Guidance Provided";
              deterministicItem.timeToResolve = "11 seconds";
              deterministicItem.csat = "5/5 Stars";
              deterministicItem.isResolved = true;
            }
          }, 2000);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [deterministicIsRunning, deterministicModalOpen, deterministicMessages.length, deterministicItem]);

  // Auto-scroll chat down whenever messages change, agent types, or modal opens
  useEffect(() => {
    if (!deterministicModalOpen) return;

    const scrollToBottom = (behavior = "smooth") => {
      if (deterministicChatEndRef.current) {
        deterministicChatEndRef.current.scrollIntoView({ behavior, block: "end" });
      }
      if (deterministicChatBodyRef.current) {
        deterministicChatBodyRef.current.scrollTop = deterministicChatBodyRef.current.scrollHeight;
      }
    };

    // Keep scrolled to latest message
    scrollToBottom(deterministicMessages.length <= 1 ? "auto" : "smooth");
    const frameId = requestAnimationFrame(() => {
      scrollToBottom(deterministicMessages.length <= 1 ? "auto" : "smooth");
    });
    const timer = setTimeout(() => {
      scrollToBottom(deterministicMessages.length <= 1 ? "auto" : "smooth");
    }, 80);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, [deterministicModalOpen, deterministicMessages, deterministicAgentTyping]);

  useEffect(() => {
    let timer;
    if (ignioIsRunning && ignioCurrentStep > 0 && ignioCurrentStep < 4) {
      timer = setTimeout(() => {
        setIgnioCurrentStep((prev) => prev + 1);
      }, 4500);
    } else if (ignioIsRunning && ignioCurrentStep === 4) {
      timer = setTimeout(() => {
        setIgnioIsRunning(false);
        setIgnioIsResolved(true);
        if (ignioItem) {
          ignioItem.status = "Resolved";
          ignioItem.statusType = "good";
          ignioItem.resolution = ignioItem.resolution || "Autonomous Healing Executed (100% Success)";
          ignioItem.timeToResolve = "18 seconds";
          ignioItem.csat = "5/5 Stars";
          ignioItem.isResolved = true;
        }
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [ignioIsRunning, ignioCurrentStep, ignioItem]);

  // Keep local selection synced with logged-in user profile changes
  useEffect(() => {
    if (user?.activeBusinessArea) {
      setSelectedArea(user.activeBusinessArea);
    }
    if (user?.activeRole) {
      setSelectedRole(user.activeRole);
    }
  }, [user?.activeBusinessArea, user?.activeRole]);

  // Fetch role-specific mock data whenever Domain or Role context changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await landingPageService.getLandingPageData(selectedArea, selectedRole);
        setData(res);

        const savedTab = sessionStorage.getItem("landing_active_tab");
        const hasSavedTab = res?.tabs?.some(t => t.id === savedTab) || (selectedRole === "Developer" && selectedArea === "AI for AD" && savedTab === "applications");

        if (hasSavedTab) {
          setActiveTab(savedTab);
        } else if (res?.tabs && res.tabs.length > 0) {
          setActiveTab(res.tabs[0].id);
        }
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedArea, selectedRole]);


  const handleAreaChange = (newArea) => {
    sessionStorage.removeItem("landing_active_tab");
    sessionStorage.removeItem("landing_selected_workspace");
    setSelectedArea(newArea);

    let availableRoles = getRolesForBusinessArea(newArea).filter(
      r => user?.isSuperAdmin || (user?.roles || []).includes(r.value)
    );

    if (availableRoles && availableRoles.length > 0) {
      setSelectedRole(availableRoles[0].value);
    } else {
      setSelectedRole("");
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("landing_active_tab", tabId);
  };

  const handleHitlAgentResolve = (item) => {
    if (item.isIgnio) {
      // Ignio / Auto Resolve flow
      setHitlIgnioSourceItem(item);
      startIgnioAutoResolve(item);
    } else {
      // Deterministic chat modal flow
      setHitlSourceItem(item);
      startDeterministicAutoResolve(item);
    }
  };

  // When the deterministic chat modal resolves AND it was triggered from a HITL card,
  // update its state to Resolved and keep it in the list below unresolved items.
  useEffect(() => {
    if (deterministicIsResolved && hitlSourceItem) {
      setHitlItems((prev) => {
        const updated = prev.map((i) =>
          i.id === hitlSourceItem.id
            ? { ...i, status: "Resolved", statusType: "good", isResolved: true }
            : i
        );
        return [
          ...updated.filter((i) => i.status !== "Resolved"),
          ...updated.filter((i) => i.status === "Resolved"),
        ];
      });
      setHitlSourceItem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deterministicIsResolved]);


  // When the ignio auto-resolve modal resolves AND it was triggered from a HITL card,
  // update its state to Resolved and keep it in the list below unresolved items.
  useEffect(() => {
    if (ignioIsResolved && hitlIgnioSourceItem) {
      setHitlItems((prev) => {
        const updated = prev.map((i) =>
          i.id === hitlIgnioSourceItem.id
            ? { ...i, status: "Resolved", statusType: "good", isResolved: true }
            : i
        );
        return [
          ...updated.filter((i) => i.status !== "Resolved"),
          ...updated.filter((i) => i.status === "Resolved"),
        ];
      });
      setHitlIgnioSourceItem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ignioIsResolved]);


  const handleSetSelectedWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    if (workspace) {
      sessionStorage.setItem("landing_selected_workspace", JSON.stringify(workspace));
    } else {
      sessionStorage.removeItem("landing_selected_workspace");
    }
  };

  const DEFAULT_DEVELOPER_WORKSPACES = [
    {
      id: "bspoke-app",
      name: "BSpoke Application",
      description: "Core bespoke medical claims auto-adjudication engine & provider onboarding gateway",
      category: "Custom AD",
      appBadge: "BSPOKE",
      badgeColor: "cyan",
      projects: 5,
      inProgress: 4,
      completed: 1,
      avgProgress: 58,
      members: 14,
      includeL3Pipeline: true,
    },
    {
      id: "servicenow-itsm",
      name: "ServiceNow",
      description: "Enterprise ITSM incident management, change requests, and automated ticket resolution portal",
      category: "ITSM Platform",
      appBadge: "SNOW",
      badgeColor: "green",
      projects: 3,
      inProgress: 2,
      completed: 1,
      avgProgress: 72,
      members: 8,
      includeL3Pipeline: true,
    },
    {
      id: "oracle-erp-cloud",
      name: "Oracle ERP",
      description: "Cloud financial management, claims accounting ledger, and provider billing integration",
      category: "Enterprise ERP",
      appBadge: "ORCL",
      badgeColor: "orange",
      projects: 4,
      inProgress: 3,
      completed: 1,
      avgProgress: 58,
      members: 12,
      includeL3Pipeline: false,
    },
    {
      id: "salesforce-crm",
      name: "Salesforce",
      description: "Member 360 CRM, health cloud patient inquiry tracking, and agent assistance portal",
      category: "CRM Platform",
      appBadge: "SFDC",
      badgeColor: "blue",
      projects: 6,
      inProgress: 4,
      completed: 2,
      avgProgress: 65,
      members: 18,
      includeL3Pipeline: false,
    },
    {
      id: "pega-bpm-engine",
      name: "Pega",
      description: "Automated business process management engine for complex prior-authorization workflows",
      category: "BPM Engine",
      appBadge: "PEGA",
      badgeColor: "red",
      projects: 2,
      inProgress: 2,
      completed: 0,
      avgProgress: 60,
      members: 6,
      includeL3Pipeline: true,
    },
    {
      id: "contact-center-ai",
      name: "Contact Center",
      description: "Voice bot, IVR telephony routing, and real-time call transcript summarization microservices",
      category: "Voice & AI",
      appBadge: "CC",
      badgeColor: "purple",
      projects: 3,
      inProgress: 2,
      completed: 1,
      avgProgress: 75,
      members: 10,
      includeL3Pipeline: false,
    },
    {
      id: "claims-core-portal",
      name: "Claims Core Portal",
      description: "Legacy claims intake system, adjudication rules validator, and member EOB generator",
      category: "Health Core",
      appBadge: "CLM",
      badgeColor: "cyan",
      projects: 8,
      inProgress: 5,
      completed: 3,
      avgProgress: 82,
      members: 22,
      includeL3Pipeline: true,
    },
  ];

  // Fetch workspaces for applications tab
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        const data = await domainDetailService.getWorkspacesByDomainSlug("swe");
        const list = (data && data.length > 0) ? data : DEFAULT_DEVELOPER_WORKSPACES;
        setWorkspaces(list);

        const unique = Array.from(
          new Set(list.map((w) => w.category).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));
        setCategories(["All", ...unique]);
      } catch (err) {
        console.error("Failed to load workspaces, fallback to default list:", err);
        setWorkspaces(DEFAULT_DEVELOPER_WORKSPACES);
        const unique = Array.from(
          new Set(DEFAULT_DEVELOPER_WORKSPACES.map((w) => w.category).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));
        setCategories(["All", ...unique]);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    fetchWorkspaces();
  }, []);

  if (loading || !data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading {selectedRole} Workspace ({selectedArea})...</p>
      </div>
    );
  }

  const {
    topbar,
    summary,
    tabs,
    stateOfEnvironment,
    whatRequiresAttention,
    criticalRisks,
    tabData,
  } = data;

  const currentAvailableRoles = getRolesForBusinessArea(selectedArea).filter(
    r => user?.isSuperAdmin || (user?.roles || []).includes(r.value)
  );

  const isPOPage = selectedArea === "AI for AD" && selectedRole === "Product Owner";
  const activeApp = selectedApp || DEFAULT_APP;
  const currentAppData = APPLICATION_DATA_MAP[activeApp.name] || APPLICATION_DATA_MAP["BSpoke Application"];

  let displayTabData = tabData && tabData[activeTab];
  if (isPOPage && currentAppData && displayTabData) {
    if (activeTab === "epics" && currentAppData.epics) {
      displayTabData = { ...displayTabData, items: currentAppData.epics };
    } else if (activeTab === "user_stories" && currentAppData.user_stories) {
      displayTabData = { ...displayTabData, items: currentAppData.user_stories };
    } else if (activeTab === "acceptance_criteria" && currentAppData.acceptance_criteria) {
      displayTabData = { ...displayTabData, items: currentAppData.acceptance_criteria };
    }
  }
  const activeTabData = displayTabData;



  const displayTabs = tabs
    .filter((t) => {
      if (isPOPage) {
        if (t.id === "epics" || t.id === "user_stories" || t.id === "acceptance_criteria") {
          return false;
        }
      }
      if (selectedArea === "AI for AMS" && t.id === "applications") {
        return false;
      }
      return true;
    })
    .map((t) => {
      if (t.id === "agent_resolve") {
        return { ...t, label: "Agent Resolved", badge: 12 };
      }
      if (t.id === "insights") {
        return { ...t, badge: 8 };
      }
      return t;
    });

  if (isPOPage) {
    if (!displayTabs.some((t) => t.id === "applications")) {
      displayTabs.push({ id: "applications", label: "Applications", badge: DROPDOWN_APPLICATIONS.length });
    }
  } else if (selectedArea !== "AI for AMS") {
    if (!displayTabs.some((t) => t.id === "applications")) {
      displayTabs.push({ id: "applications", label: "Applications", badge: workspaces.length || 7 });
    }
  }

  const contextSelectorBar = !selectedWorkspace && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 20px",
        marginBottom: "16px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--cyan)" }}>
          Active Workspace:
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          Viewing as <strong style={{ color: "#3b82f6" }}>{selectedRole}</strong> under <strong style={{ color: "#3b82f6" }}>{selectedArea}</strong>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {selectedArea !== "AI for AMS" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>
              Domain:
            </label>
            <div
              style={{
                background: "var(--surface-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                cursor: "default",
                opacity: 0.9,
              }}
            >
              {selectedArea}
            </div>
          </div>
        )}

        {selectedArea === "AI for AMS" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>
              L0:
            </label>
            <select
              value={selectedL0}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedL0(val);
                sessionStorage.setItem("landing_selected_l0", val);
              }}
              style={{
                background: "var(--surface-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {L0_CLASSIFICATIONS.map((l0) => (
                <option
                  key={l0}
                  value={l0}
                  style={{ background: "var(--surface-select-option)", color: "var(--text-primary)" }}
                >
                  {l0}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>
            Role:
          </label>
          <div
            style={{
              background: "var(--surface-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              cursor: "default",
              opacity: 0.9,
            }}
          >
            {selectedRole}
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedArea === "AI for Infra") {
    return (
      <main className="re-landing-page re-landing-page--infra fade-in">
        {contextSelectorBar}
        <InfraPage />
      </main>
    );
  }

  if (selectedArea === "AI for AMS" && selectedL0 !== "Acquisition") {
    return (
      <main className="re-landing-page fade-in" style={{ minHeight: "85vh", display: "flex", flexDirection: "column" }}>
        {contextSelectorBar}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            minHeight: "450px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px dashed var(--border)",
            borderRadius: "16px",
            margin: "24px 0",
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* Marquee Banner */}
          <div
            style={{
              width: "100%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              padding: "18px 0",
              background: "linear-gradient(90deg, rgba(0, 196, 255, 0.08), rgba(139, 92, 246, 0.08))",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                animation: "l0Marquee 15s linear infinite",
                fontSize: "24px",
                fontWeight: "800",
                letterSpacing: "3px",
                color: "var(--cyan, #00c4ff)",
                textTransform: "uppercase",
              }}
            >
              Coming Soon &nbsp; • &nbsp; {selectedL0} &nbsp; • &nbsp; Under Development &nbsp; • &nbsp; Stay Tuned &nbsp; • &nbsp; Coming Soon &nbsp; • &nbsp; {selectedL0} &nbsp; • &nbsp; Under Development &nbsp; • &nbsp; Stay Tuned &nbsp; • &nbsp; Coming Soon &nbsp; • &nbsp; {selectedL0} &nbsp; • &nbsp; Under Development &nbsp; • &nbsp; Stay Tuned &nbsp; • &nbsp;
            </div>
          </div>

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
              {selectedL0}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "450px", margin: "0 auto" }}>
              This L0 classification workspace is currently blank and coming soon.
            </p>
          </div>
        </div>

        <style>{`
          @keyframes l0Marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </main>
    );
  }


  return (
    <>
      <main className="re-landing-page fade-in">
        {/* Domain & Role Context Selector Bar */}
        {contextSelectorBar}

        {/* Top Header Bar */}
        <header className="re-topbar">
          <div className="re-brand">
            <h1>{topbar.title}</h1>
            <p>{topbar.subtitle}</p>
          </div>
          <div className="re-top-meta">
            <span>
              Platform<b>{topbar.platform}</b>
            </span>
            <span>
              Shift<b>{topbar.shift}</b>
            </span>
            <span>
              Shift Progress<b>{topbar.shiftProgress}</b>
            </span>
            <span className="re-live-badge">{topbar.statusBadge}</span>
          </div>
        </header>

        {/* Shift Summary Section */}
        {!selectedWorkspace && (
          <section className="re-summary">
            <div>
              <div className="re-summary-title">
                {selectedArea === "AI for AD" && selectedRole === "Product Owner"
                  ? `Good morning, Product Owner`
                  : summary.greeting}
              </div>
              <div className="re-summary-sub">
                {selectedArea === "AI for AD" && selectedRole === "Product Owner"
                  ? `${activeApp.name} active workspace - ${currentAppData?.epics?.length || 3} Epics - ${currentAppData?.user_stories?.length || 8} User Stories - ${currentAppData?.acceptance_criteria?.length || 3} Acceptance Criteria ready`
                  : summary.subtext}
              </div>
            </div>
            <div className="re-chips">
              {(() => {
                const ROLE_STATS = {
                  "AI for AD": {
                    "Admin": [{ label: "SPRINT VELOCITY", value: "94%", color: "var(--cyan)" }, { label: "CODE QUALITY", value: "88.5%", color: "#50c878" }],
                    "Product Owner": [{ label: "EPIC READINESS", value: "92%", color: "var(--cyan)" }, { label: "SPRINT CAPACITY", value: "88%", color: "#50c878" }],
                    "Developer": [{ label: "CODE COVERAGE", value: "91.2%", color: "var(--cyan)" }, { label: "TEST PASS RATE", value: "98.4%", color: "#50c878" }],
                    "Tester": [{ label: "PASS RATE", value: "96.8%", color: "var(--cyan)" }, { label: "API COVERAGE", value: "94.5%", color: "#50c878" }],
                  },
                  "AI for AMS": {
                    "Support Engineer": [
                      { label: "AUTO-RESOLVED", value: "64.2%", color: "var(--cyan)" },
                      { label: "FTRDR", value: "99.5%", color: "#50c878", tooltip: "First Time Right Delivery Rate — Percentage of tickets resolved accurately on the first attempt without rework" }
                    ],
                    "Software Engineer": [{ label: "DB THROUGHPUT", value: "+45%", color: "#50c878" }, { label: "PATCH SUCCESS", value: "98.8%", color: "var(--cyan)" }],
                    "L1 Support Engineer": [
                      { label: "AUTO-RESOLVED", value: "64.2%", color: "var(--cyan)" },
                      { label: "FTRDR", value: "99.5%", color: "#50c878", tooltip: "First Time Right Delivery Rate — Percentage of tickets resolved accurately on the first attempt without rework" }
                    ],
                    "L2 Support Engineer": [{ label: "RCA CONFIDENCE", value: "92%", color: "var(--cyan)" }, { label: "SLA REMAINING", value: "2h 45m", color: "var(--gold)" }],
                    "L3 Support Engineer": [{ label: "DB THROUGHPUT", value: "+45%", color: "#50c878" }, { label: "ZERO-DAY VULNS", value: "0", color: "var(--cyan)" }],
                    "L4 Support Engineer": [{ label: "VENDOR SLA", value: "99.9%", color: "#50c878" }, { label: "COST VARIANCE", value: "-4.2%", color: "var(--cyan)" }],
                  },
                };

                if (selectedArea === "AI for AMS" && (selectedRole === "Support Engineer" || selectedRole === "L1 Support Engineer")) {
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ display: "flex", background: "var(--surface-sunken)", borderRadius: "8px", padding: "4px", gap: "4px", border: "1px solid var(--border)" }}>
                        <button
                          onClick={() => setMetricToggle("AUTO-RESOLVED")}
                          style={{ background: metricToggle === "AUTO-RESOLVED" ? "var(--surface-card)" : "transparent", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", boxShadow: metricToggle === "AUTO-RESOLVED" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", color: metricToggle === "AUTO-RESOLVED" ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.2s" }}>
                          Auto-Resolved
                        </button>
                        <button
                          onClick={() => setMetricToggle("FTRDR")}
                          title="First Time Right Delivery Rate — Percentage of tickets resolved on first attempt without rework"
                          style={{ background: metricToggle === "FTRDR" ? "var(--surface-card)" : "transparent", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", boxShadow: metricToggle === "FTRDR" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", color: metricToggle === "FTRDR" ? "var(--text-primary)" : "var(--text-muted)", transition: "all 0.2s" }}>
                          FTRDR
                        </button>
                      </div>
                      <div
                        className={metricToggle === "FTRDR" ? "ftrdr-card-wrapper" : ""}
                        style={{
                          background: "var(--surface-card)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          padding: "8px 16px",
                          minWidth: "130px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          position: "relative",
                          cursor: metricToggle === "FTRDR" ? "help" : "default",
                        }}
                      >
                        <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {metricToggle}
                        </span>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: metricToggle === "AUTO-RESOLVED" ? "var(--cyan)" : "#50c878", lineHeight: 1.1 }}>
                          {metricToggle === "AUTO-RESOLVED" ? "64.2%" : "99.5%"}
                        </span>
                        {metricToggle === "FTRDR" && (
                          <div className="ftrdr-tooltip-popup">
                            <div className="ftrdr-tooltip-title">First Time Right Delivery Rate</div>
                            <div className="ftrdr-tooltip-body">
                              Percentage of tickets or requests resolved on the first attempt without rework.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                const stats = ROLE_STATS[selectedArea]?.[selectedRole];
                if (!stats) return summary.chips.map((chip) => (
                  <span key={chip.id} className={`re-pill ${chip.type === "warn" || chip.type === "danger" ? "warn" : ""}`}>{chip.text}</span>
                ));
                return stats.map((s) => (
                  <div
                    key={s.label}
                    className={s.tooltip ? "ftrdr-card-wrapper" : ""}
                    style={{
                      background: "var(--surface-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      minWidth: "130px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: "22px", fontWeight: "800", color: s.color, lineHeight: 1.1 }}>
                      {s.value}
                    </span>
                    {s.tooltip && (
                      <div className="ftrdr-tooltip-popup">
                        <div className="ftrdr-tooltip-title">First Time Right Delivery Rate</div>
                        <div className="ftrdr-tooltip-body">
                          Percentage of tickets resolved accurately<br />
                          on the first attempt without rework.
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </section>
        )}

        {/* Navigation Tabs Bar */}
        {!selectedWorkspace && (
          <nav className="re-tabs">
            {displayTabs.map((tab) => {
              if (isPOPage && tab.id === "applications") {
                return (
                  <div
                    key={tab.id}
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseEnter={() => setAppDropdownOpen(true)}
                    onMouseLeave={() => setAppDropdownOpen(false)}
                  >
                    <span
                      className="re-tab"
                      onClick={() => setAppDropdownOpen(!appDropdownOpen)}
                      role="button"
                      tabIndex={0}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      Applications
                      {tab.badge && <span className="re-badge">{tab.badge}</span>}
                      <span style={{ fontSize: "10px", marginLeft: "2px" }}></span>
                    </span>

                    {/* Applications Dropdown Menu */}
                    {appDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "6px",
                          width: "290px",
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "10px",
                          boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.6)",
                          zIndex: 1000,
                          overflow: "hidden",
                          padding: "6px",
                          animation: "fadeIn 0.15s ease",
                        }}
                      >
                        <div style={{ padding: "6px 10px 8px 10px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", borderBottom: "1px solid #1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Switch Application ({DROPDOWN_APPLICATIONS.length})
                        </div>
                        {DROPDOWN_APPLICATIONS.map((app, idx) => (
                          <div
                            key={app.id || idx}
                            onClick={() => {
                              setSelectedApp(app);
                              setAppDropdownOpen(false);
                              handleTabClick("epics");
                              showToast(`Loaded Epics, User Stories & Acceptance Criteria for ${app.name}`, "info");
                            }}
                            style={{
                              padding: "8px 10px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: selectedApp?.name === app.name ? "#38bdf8" : "#f1f5f9",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              transition: "all 0.15s ease",
                              background: selectedApp?.name === app.name ? "rgba(56, 189, 248, 0.12)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = selectedApp?.name === app.name ? "rgba(56, 189, 248, 0.12)" : "transparent";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "11px", color: "#0891b2", fontWeight: "700" }}>{idx + 1}.</span>
                              <span>{app.name}</span>
                            </div>
                            <span style={{ fontSize: "10px", color: "#64748b" }}>{app.category}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <span
                  key={tab.id}
                  className={`re-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => handleTabClick(tab.id)}
                  role="button"
                  tabIndex={0}
                >
                  {tab.label}
                  {tab.badge && <span className="re-badge">{tab.badge}</span>}
                </span>
              );
            })}
          </nav>
        )}

        {/* Second Row: Application Sub-Tabs Bar (Appears in a row below when an application is selected from dropdown) */}
        {!selectedWorkspace && isPOPage && selectedApp && currentAppData && activeTab !== "overview" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surface-card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "10px 18px",
              marginTop: "12px",
              marginBottom: "16px",
              boxShadow: "var(--shadow-card)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* Sub-tabs Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handleTabClick("epics")}
                style={{
                  background: activeTab === "epics" ? "var(--blue)" : "var(--surface-input)",
                  color: activeTab === "epics" ? "#ffffff" : "var(--text-primary)",
                  border: activeTab === "epics" ? "none" : "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>Epics & Features</span>
                <span
                  style={{
                    background: activeTab === "epics" ? "rgba(255,255,255,0.25)" : "var(--surface-card)",
                    color: activeTab === "epics" ? "#ffffff" : "var(--cyan)",
                    borderRadius: "50%",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  {currentAppData.epics?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("user_stories")}
                style={{
                  background: activeTab === "user_stories" ? "var(--blue)" : "var(--surface-input)",
                  color: activeTab === "user_stories" ? "#ffffff" : "var(--text-primary)",
                  border: activeTab === "user_stories" ? "none" : "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>User Stories</span>
                <span
                  style={{
                    background: activeTab === "user_stories" ? "rgba(255,255,255,0.25)" : "var(--surface-card)",
                    color: activeTab === "user_stories" ? "#ffffff" : "var(--cyan)",
                    borderRadius: "50%",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  {currentAppData.user_stories?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("acceptance_criteria")}
                style={{
                  background: activeTab === "acceptance_criteria" ? "var(--blue)" : "var(--surface-input)",
                  color: activeTab === "acceptance_criteria" ? "#ffffff" : "var(--text-primary)",
                  border: activeTab === "acceptance_criteria" ? "none" : "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>Acceptance Criteria</span>
                <span
                  style={{
                    background: activeTab === "acceptance_criteria" ? "rgba(255,255,255,0.25)" : "var(--surface-card)",
                    color: activeTab === "acceptance_criteria" ? "#ffffff" : "var(--cyan)",
                    borderRadius: "50%",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  {currentAppData.acceptance_criteria?.length || 0}
                </span>
              </button>
              {/* Overall Status tab */}
              <button
                type="button"
                onClick={() => handleTabClick("overall_status")}
                style={{
                  background: activeTab === "overall_status" ? "var(--blue)" : "var(--surface-input)",
                  color: activeTab === "overall_status" ? "#ffffff" : "var(--text-primary)",
                  border: activeTab === "overall_status" ? "none" : "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>Overall Status</span>
              </button>

              {/* PRD Creation tab — only for BSpoke Application */}
              {activeApp?.id === "bspoke" && (
                <button
                  type="button"
                  onClick={() => {
                    handleTabClick("prd_creation");
                    setIsPrdChatOpen(false);
                  }}
                  style={{
                    background: activeTab === "prd_creation" ? "var(--blue)" : "var(--surface-input)",
                    color: activeTab === "prd_creation" ? "#ffffff" : "var(--text-primary)",
                    border: activeTab === "prd_creation" ? "none" : "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>✦</span>
                  <span>PRD Creation</span>
                </button>
              )}
            </div>

            {/* Active Application Status & Clear Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Selected: <strong style={{ color: "var(--cyan)" }}>{selectedApp.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  handleTabClick("overview");
                }}
                style={{
                  background: "rgba(229, 83, 83, 0.12)",
                  border: "1px solid rgba(229, 83, 83, 0.3)",
                  color: "#e55353",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Clear X
              </button>
            </div>
          </div>
        )}

        {/* Application Info Panel - shown only when Overall Status tab is active */}
        {isPOPage && selectedApp && activeTab === "overall_status" && (() => {
          const wsMatch = DEFAULT_DEVELOPER_WORKSPACES.find(w => w.name === selectedApp.name);
          const totalProjects = wsMatch?.projects ?? 0;
          const inProgress = wsMatch?.inProgress ?? 0;
          const completed = wsMatch?.completed ?? 0;
          const avgProgress = wsMatch?.avgProgress ?? 0;

          const stats = [
            { label: "TOTAL PROJECTS", value: totalProjects, color: "var(--cyan)" },
            { label: "IN PROGRESS", value: inProgress, color: "var(--gold)" },
            { label: "COMPLETED", value: completed, color: "#50c878" },
            { label: "AVG PROGRESS", value: `${avgProgress}%`, color: "#b446ff" },
          ];

          return (
            <div
              className="fade-in"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "4px",
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: "800", color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ─── PRD Creation Tab ─────────────────────────────────────── */}
        {activeTab === "prd_creation" && isPOPage && (
          <div className="fade-in" style={{ marginTop: "4px" }}>

            {/* ── Outer Box ── */}
            <div style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "24px 28px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}>
              {/* Section title */}
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
                  AI PRD Creation
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "6px 0 0" }}>
                  Analyse high-priority incidents and generate a Product Requirement Document with AI
                </p>
              </div>

              {/* ── Inner Incident Card (centered inside outer box) ── */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "24px 28px",
                maxWidth: "560px",
                margin: "0 auto",
                width: "100%",
              }}>
                {/* Card header row — ID + badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary)" }}>
                    CARE-DASHBOARD-HIGH
                  </span>
                  <span style={{
                    fontSize: "12px", fontWeight: "700",
                    background: "var(--cyan)", color: "var(--navy)",
                    padding: "3px 12px", borderRadius: "20px",
                  }}>
                    High Priority
                  </span>
                </div>

                {/* Cyan sub-title */}
                <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--cyan)", marginBottom: "10px" }}>
                  Top 10 Incidents — Care Dashboard, January 2025
                </div>

                {/* Description */}
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.6 }}>
                  Generate a PRD from the top 10 high-priority incidents in the Care Dashboard application for January 2025, including SLA breaches, MTTR and root cause analysis.
                </p>

                {/* Meta badges */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
                  <span style={{
                    fontSize: "12px", fontWeight: "700",
                    background: "rgba(16,185,129,0.12)", color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.3)",
                    padding: "4px 12px", borderRadius: "20px",
                  }}>
                    Urgency: 1 – High
                  </span>
                  <span style={{
                    fontSize: "12px", fontWeight: "700",
                    background: "rgba(6,182,212,0.12)", color: "var(--cyan)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    padding: "4px 12px", borderRadius: "20px",
                  }}>
                    Application: Care Dashboard
                  </span>
                  <span style={{
                    fontSize: "12px", fontWeight: "600",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    padding: "4px 12px", borderRadius: "20px",
                  }}>
                    CARE-DASH-JAN25
                  </span>
                </div>

                {/* Footer row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Application: <strong style={{ color: "var(--text-primary)" }}>BSpoke Application</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setIsPrdChatOpen(true); setPrdChatKey(k => k + 1); }}
                    style={{
                      padding: "9px 20px",
                      background: "var(--cyan)",
                      color: "var(--navy)",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 10px rgba(6,182,212,0.25)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.88";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    🤖 Create PRD
                  </button>
                </div>
              </div>
              {/* ── End inner card ── */}

            </div>
            {/* ── End outer box ── */}

            {/* Chatbot — mounts and auto-fires when Create PRD is clicked */}
            {isPrdChatOpen && (
              <Chatbot
                key={prdChatKey}
                hideFloat={true}
                defaultOpen={true}
              />
            )}
          </div>

        )}


        {/* Tab View 1: Overview Grid View */}
        {activeTab === "overview" && (

          selectedArea === "AI for AMS" && selectedRole === "Support Engineer" ? (
            <>
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>

                {/* 1. Middle 3 Columns Section */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", alignItems: "start" }}>
                  {/* Column 1: Observability */}
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#0ea5e9",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#ffffff",
                      }}
                    >
                      <Icon name="zap" size={18} />
                      <div style={{ fontSize: "14px", fontWeight: "700" }}>
                        Observability
                      </div>
                    </div>
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                      {/* Products Card (Blue) */}
                      <div
                        style={{
                          background: "rgba(59, 130, 246, 0.05)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "6px", borderRadius: "8px", color: "#3b82f6", display: "flex" }}><Icon name="cube" size={16} /></div>
                            <span style={{ fontWeight: "700", fontSize: "14px" }}>Products</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", cursor: "default" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "#10b981",
                                background: "rgba(16, 185, 129, 0.12)",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                              Active
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#3b82f6", letterSpacing: "0.5px", marginTop: "4px", marginBottom: "-4px" }}>
                          IMPACTS TO:
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontSize: "10px", color: "var(--text-secondary)", fontWeight: "500" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="trendingUp" size={14} style={{ color: "#3b82f6" }} /> Quoting</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Quote Accuracy:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>99.1%</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Quote Turnaround:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>1.2 hrs</span></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="file-text" size={14} style={{ color: "#3b82f6" }} /> Applications</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Application Success:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>99.6%</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Avg. Application Time:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>6.3 mins</span></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="users" size={14} style={{ color: "#3b82f6" }} /> Direct Enrollment</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Enrollment Throughput:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>100%</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Enrollment Leakage:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>0.6%</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Sales Card (Green) */}
                      <div
                        style={{
                          background: "rgba(16, 185, 129, 0.05)",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "6px", borderRadius: "8px", color: "#10b981", display: "flex" }}><Icon name="chart" size={16} /></div>
                            <span style={{ fontWeight: "700", fontSize: "14px" }}>Sales</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", cursor: "default" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "#10b981",
                                background: "rgba(16, 185, 129, 0.12)",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                              Active
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontSize: "10px", color: "var(--text-secondary)", fontWeight: "500" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="trendingUp" size={14} style={{ color: "#10b981" }} /> Quoting</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Win Rate:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>34.7%</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Avg. Premium Quoted:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>$1,250</span></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="file-text" size={14} style={{ color: "#10b981" }} /> Applications</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Application Conversion:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>42.8%</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Abandonment Rate:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>12.3%</span></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="users" size={14} style={{ color: "#10b981" }} /> Direct Enrollment</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Direct to Bind Rate:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>62.1%</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Cost per Enrollment:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>$42.18</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Acquisition Card (Purple) */}
                      <div
                        style={{
                          background: "rgba(139, 92, 246, 0.05)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "6px", borderRadius: "8px", color: "#8b5cf6", display: "flex" }}><Icon name="cart" size={16} /></div>
                            <span style={{ fontWeight: "700", fontSize: "14px" }}>Acquisition</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", cursor: "default" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "#10b981",
                                background: "rgba(16, 185, 129, 0.12)",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                              Active
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontSize: "10px", color: "var(--text-secondary)", fontWeight: "500" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="trendingUp" size={14} style={{ color: "#8b5cf6" }} /> Quoting</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Quote Requests:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>24,812</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Cost per Quote:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>$18.73</span></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="file-text" size={14} style={{ color: "#8b5cf6" }} /> Applications</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Applications Started:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>18,942</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Cost per App:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>$37.61</span></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "var(--surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}><Icon name="users" size={14} style={{ color: "#8b5cf6" }} /> Direct Enrollment</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Enrollments:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>6,531</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span>Cost per Enrollment:</span> <span style={{ color: "#10b981", fontWeight: "600", fontSize: "11px" }}>$42.18</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Service (Orange) */}
                      <div
                        style={{
                          background: "rgba(249, 115, 22, 0.05)",
                          border: "1px solid rgba(249, 115, 22, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontWeight: "700",
                          fontSize: "13px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ color: "#f97316", display: "flex" }}><Icon name="message" size={16} /></div>
                          <span style={{ fontWeight: "700", fontSize: "14px" }}>Customer Service</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>

                      {/* Finance & Compliance (Orange/Brown) */}
                      <div
                        style={{
                          background: "rgba(217, 119, 6, 0.05)",
                          border: "1px solid rgba(217, 119, 6, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontWeight: "700",
                          fontSize: "13px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ color: "#d97706", display: "flex" }}><Icon name="file-text" size={16} /></div>
                          <span style={{ fontWeight: "700", fontSize: "14px" }}>Finance & Compliance</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>

                      {/* Operations (Teal) */}
                      <div
                        style={{
                          background: "rgba(20, 184, 166, 0.05)",
                          border: "1px solid rgba(20, 184, 166, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontWeight: "700",
                          fontSize: "13px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ color: "#14b8a6", display: "flex" }}><Icon name="users" size={16} /></div>
                          <span style={{ fontWeight: "700", fontSize: "14px" }}>Operations</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>

                      {/* Legal & Risk (Blue) */}
                      <div
                        style={{
                          background: "rgba(56, 189, 248, 0.05)",
                          border: "1px solid rgba(56, 189, 248, 0.2)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontWeight: "700",
                          fontSize: "13px",
                          width: "100%",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ color: "#38bdf8", display: "flex" }}><Icon name="shield" size={16} /></div>
                          <span style={{ fontWeight: "700", fontSize: "14px" }}>Legal & Risk</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>

                    </div>
                  </div>
                  {/* Column 1: Human Only */}
                  <div
                    style={{
                      background: "var(--surface-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div
                      style={{
                        background: "#2563eb",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#ffffff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "14px" }}>
                        <Icon name="list" size={18} />
                        {amsOverviewData.needsMyAction.title}
                      </div>
                      <span
                        style={{
                          background: "#ffffff",
                          color: "#2563eb",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "12px",
                        }}
                      >
                        {amsOverviewData.needsMyAction.badge}
                      </span>
                    </div>
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                      {amsOverviewData.needsMyAction.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedActionItem({ ...item, _accentColor: "#2563eb" })}
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            cursor: "pointer",
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(37,99,235,0.1)";
                            e.currentTarget.style.borderColor = "#2563eb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }}
                        >

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span
                              style={{
                                background: "#1d4ed8",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {item.tag}
                            </span>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                              {item.meta}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "500", lineHeight: "1.4" }}>
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Human in The Loop */}
                  <div
                    style={{
                      background: "var(--surface-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div
                      style={{
                        background: "#d97706",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#ffffff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "14px" }}>
                        <Icon name="clock" size={18} />
                        {amsOverviewData.waitingForMyApproval.title}
                      </div>
                      <span
                        style={{
                          background: "#ffffff",
                          color: "#d97706",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "12px",
                        }}
                      >
                        {hitlItems.filter((i) => i.status !== "Resolved").length}
                      </span>
                    </div>
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                      {hitlItems.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: "13px" }}>
                          <Icon name="check-circle" size={32} style={{ marginBottom: "8px", color: "#16a34a", display: "block", margin: "0 auto 8px" }} />
                          <div style={{ fontWeight: "700", color: "#16a34a", marginBottom: "4px" }}>All items resolved!</div>
                          <div>All tickets have been sent to Agent Resolve.</div>
                        </div>
                      ) : (
                        hitlItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: item.status === "Resolved" ? "rgba(16, 185, 129, 0.04)" : "var(--surface-card)",
                              border: item.status === "Resolved" ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border)",
                              borderRadius: "10px",
                              padding: "14px 14px 12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {/* Incident Number + Service Tag (Left) + Action Required / Resolved badge (Right) */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <span
                                  style={{
                                    flexShrink: 0,
                                    background: item.status === "Resolved" ? "rgba(16, 185, 129, 0.15)" : "rgba(217, 119, 6, 0.15)",
                                    color: item.status === "Resolved" ? "#10b981" : "#d97706",
                                    border: item.status === "Resolved" ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(217, 119, 6, 0.35)",
                                    borderRadius: "6px",
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    letterSpacing: "0.5px",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {item.num}
                                </span>
                                {(item.service || item.system) && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "var(--text-muted)",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={item.service || item.system}
                                  >
                                    {item.service || item.system}
                                  </span>
                                )}
                              </div>
                              {item.status !== "Resolved" && (
                                <span
                                  style={{
                                    flexShrink: 0,
                                    marginLeft: "auto",
                                    background: "#fff7ed",
                                    color: "#c2410c",
                                    border: "1px solid #fed7aa",
                                    borderRadius: "20px",
                                    padding: "2px 10px",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.status}
                                </span>
                              )}
                            </div>

                            {/* Title / Subject */}
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.4" }}>
                              {item.subject}
                            </div>

                            {/* Description */}
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                              {item.desc}
                            </div>

                            {/* Divider */}
                            <div style={{ height: "1px", background: item.status === "Resolved" ? "rgba(16, 185, 129, 0.15)" : "var(--border)" }} />

                            {/* Action Button OR Resolved Indicator */}
                            {item.status === "Resolved" ? (
                              <div
                                style={{
                                  alignSelf: "flex-start",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  color: "#10b981",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  background: "rgba(16, 185, 129, 0.1)",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                  borderRadius: "8px",
                                  padding: "6px 12px",
                                }}
                              >
                                <Icon name="check" size={14} />
                                <span>Resolved</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleHitlAgentResolve(item)}
                                style={{
                                  alignSelf: "flex-start",
                                  background: item.isIgnio
                                    ? "linear-gradient(135deg, #0ea5e9, #06b6d4)"   // cyan for Auto Resolve
                                    : "linear-gradient(135deg, #6d28d9, #4f46e5)",  // purple for Agent Resolve
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "7px 14px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <Icon name="zap" size={13} />
                                {item.isIgnio ? "Auto Resolve" : "Agent + Human Resolve"}
                              </button>
                            )}
                          </div>
                        ))
                      )}

                    </div>
                  </div>
                </div>
              </div>


              {/* Action Item Detail Drawer */}
              <ActionItemDetailDrawer
                item={selectedActionItem}
                accentColor={selectedActionItem?._accentColor ?? "#2563eb"}
                onClose={() => setSelectedActionItem(null)}
              />
            </>
          ) : (


            <section className="re-grid fade-in">
              {/* Panel 1: State of Environment */}
              <article className="re-panel">
                <div className="re-panel-head">
                  <div className="re-panel-title">{stateOfEnvironment.title}</div>
                  <span className="re-panel-chip">{stateOfEnvironment.tag}</span>
                </div>
                <div className="re-panel-body">
                  <div className="re-metrics">
                    {stateOfEnvironment.metrics.map((m) => (
                      <div key={m.id} className={`re-metric ${m.color}`}>
                        <div className="re-num">{m.count}</div>
                        <div className="re-lbl">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {stateOfEnvironment.items.map((item) => (
                    <div key={item.id} className="re-env-item">
                      <div className="re-row-title">
                        {item.title}
                        <span className={`re-tag ${item.statusType}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="re-row-desc">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Panel 2: What Requires Attention */}
              <article className="re-panel">
                <div className="re-panel-head">
                  <div className="re-panel-title">{whatRequiresAttention.title}</div>
                  <span className="re-panel-chip">{whatRequiresAttention.tag}</span>
                </div>
                <div className="re-panel-body">
                  {whatRequiresAttention.cards.map((card) => (
                    <div key={card.id} className="re-attention-card">
                      <div className="re-card-head">
                        {card.title}
                        <span className={`re-severity ${card.severityType}`}>
                          {card.severity}
                        </span>
                      </div>
                      <div className="re-mini">{card.desc}</div>
                      {card.progress !== null && (
                        <div className="re-progress">
                          <div
                            className="re-bar"
                            style={{ width: `${card.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>

              {/* Panel 3: Critical Risks */}
              <article className="re-panel">
                <div className="re-panel-head">
                  <div className="re-panel-title">{criticalRisks.title}</div>
                  <span className="re-panel-chip">{criticalRisks.tag}</span>
                </div>
                <div className="re-panel-body">
                  {criticalRisks.cards.map((card) => (
                    <div key={card.id} className="re-risk-card">
                      <div className="re-card-head">
                        {card.title}
                        <span className={`re-severity ${card.severityType}`}>
                          {card.severity}
                        </span>
                      </div>
                      <div className="re-mini">{card.desc}</div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )
        )}

        {/* Tab View 2: Specific Dynamic Tab Mock Data View (when tab != overview and tab != applications) */}
        {activeTab !== "overview" && activeTab !== "applications" && activeTabData && (
          <section className="fade-in" style={{ marginTop: "10px" }}>
            <div
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)", fontWeight: "700" }}>
                    {activeTabData.title}
                  </h2>
                  <span
                    style={{
                      background: "rgba(0, 210, 211, 0.12)",
                      border: "1px solid rgba(0, 210, 211, 0.3)",
                      color: "var(--cyan)",
                      padding: "4px 12px",
                      borderRadius: "14px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedRole} - {selectedArea}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                  {activeTabData.sub}
                </p>
              </div>

              {/* Items Card List Grid or Insights Analytics & Cards */}
              {activeTab === "insights" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
                  {/* Simple Insight Cards Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {activeTabData.items && activeTabData.items.map((item, idx) => (
                      <div key={item.id || idx} onClick={() => { if (item.category === "Application Health") { setSelectedHealthApp(item); setShowAppHealthModal(true); } }} style={{
                        cursor: item.category === "Application Health" ? "pointer" : "default", background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "transform 0.2s ease, border-color 0.2s ease",
                      }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "var(--text-primary)",
                                wordBreak: "break-word",
                              }}
                            >
                              {activeTab === "agent_resolve" ? (item.subject || item.name || item.title || item.code || item.num) : (item.code || item.num || item.title || `Item #${idx + 1}`)}
                            </span>
                            {item.status && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  background: item.statusType === "good" ? "rgba(16, 185, 129, 0.15)" : item.statusType === "warn" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                  color: item.statusType === "good" ? "#10b981" : item.statusType === "warn" ? "#f59e0b" : "#ef4444",
                                }}
                              >
                                <span style={{
                                  width: "7px", height: "7px", borderRadius: "50%", display: "inline-block", flexShrink: 0,
                                  background: item.statusType === "good" ? "#10b981" : item.statusType === "warn" ? "#f59e0b" : "#ef4444",
                                }} />
                                {item.status}
                              </span>
                            )}
                          </div>
                          {item.title && item.code && (
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>
                              {item.title}
                            </div>
                          )}
                          {item.desc && (
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                              {item.desc}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                            {item.batchTag && <span style={{ background: "rgba(139,92,246,0.15)", color: "#c084fc", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}> {item.batchTag}</span>}
                            {item.category && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}> {item.category}</span>}
                            {item.confidence && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}> {item.confidence}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!activeTabData.items || activeTabData.items.length === 0) && (
                <AutomationDataGrid />
              )}

              {activeTab !== "insights" && activeTabData.items && activeTabData.items.length > 0 && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {activeTabData.items
                      .filter(item => {
                        if (activeTab !== "agent_resolve") return true;
                        if (agentResolveFilter === "ignio") return item.isIgnio;
                        if (agentResolveFilter === "deterministic") return item.isDeterministic;
                        return true;
                      })
                      .map((item, idx) => (
                        <div
                          key={item.id || idx}
                          onClick={() => { if (item.category === "Application Health") { setSelectedHealthApp(item); setShowAppHealthModal(true); } }}
                          style={{
                            cursor: item.category === "Application Health" ? "pointer" : "default",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-card)",
                            borderRadius: "12px",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "12px",
                            transition: "transform 0.2s ease, border-color 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>


                            {/* Card Header Row */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  color: "var(--text-primary)",
                                  wordBreak: "break-word",
                                }}
                              >
                                {activeTab === "agent_resolve" ? (item.subject || item.name || item.title || item.code || item.num) : (item.code || item.num || item.build || item.name || item.title || item.subject || item.metric || item.query || item.suite || item.vendor || item.prbCode || item.patch || item.area || `Item #${idx + 1}`)}
                              </span>

                              {(item.status || item.severity || item.health || item.acStatus) && (
                                <span
                                  className={`re-tag ${(item.statusType === "danger" || item.severity === "Critical" || item.severity === "P1 Blocker" || item.status === "Failed Gate")
                                    ? "danger"
                                    : (item.statusType === "warn" || item.severity === "High" || item.severity === "Review" || item.status === "At Risk" || item.status === "Warning")
                                      ? "warn"
                                      : "watch"
                                    }`}
                                >
                                  {item.status || item.severity || item.health || item.acStatus}
                                </span>
                              )}
                            </div>

                            {/* Card Sub-title / Main Name if different */}
                            {(item.name || item.title) && (item.code || item.num || item.build || item.prbCode) && (
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--cyan)", marginBottom: "6px" }}>
                                {item.name || item.title}
                              </div>
                            )}

                            {/* Item Details Grid */}
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                              {item.desc && <p style={{ margin: "4px 0", lineHeight: "1.4", flex: 1 }}>{item.desc}</p>}
                              {item.format && <p style={{ margin: "4px 0", fontStyle: "italic", background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "6px", borderLeft: "3px solid var(--cyan)", flex: 1 }}>"{item.format}"</p>}
                              {item.snippet && <pre style={{ margin: "4px 0", background: "#0a1120", padding: "8px", borderRadius: "6px", fontSize: "11px", color: "#38bdf8", overflowX: "auto", flex: 1 }}>{item.snippet}</pre>}
                              {item.rcaSummary && <p style={{ margin: "4px 0" }}><strong>RCA:</strong> {item.rcaSummary}</p>}
                              {item.recommendation && <p style={{ margin: "4px 0", color: "#34d399" }}><strong>Fix:</strong> {item.recommendation}</p>}




                              {/* Key-Value Tag List */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
                                {item.target && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>Target: {item.target}</span>}
                                {item.points && <span style={{ background: "rgba(0,159,218,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}> {item.points} Points</span>}
                                {item.priority && <span style={{ background: "rgba(247,148,29,0.15)", color: "#f7941d", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}> {item.priority}</span>}
                                {item.progress !== undefined && <span style={{ background: "rgba(151,215,0,0.15)", color: "#97d700", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Progress: {item.progress}% Complete</span>}
                                {item.valueScore && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Value: {item.valueScore}</span>}
                                {item.duration && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}> {item.duration}</span>}
                                {item.checks && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>Checks: {item.checks}</span>}
                                {item.reviewScore && <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Score: {item.reviewScore}</span>}
                                {item.passRate && <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Pass: {item.passRate}</span>}
                                {item.slaTimer && <span style={{ background: "rgba(229,83,83,0.15)", color: "#e55353", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}> SLA: {item.slaTimer}</span>}
                                {item.kbMatch && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>KB Match: {item.kbMatch}</span>}
                                {item.confidence && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>Confidence: {item.confidence}</span>}
                                {item.tokensUsed && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>Tokens: {item.tokensUsed}</span>}
                              </div>

                              {/* Application & Ticket Tag */}
                              {(item.code || item.story || item.num) && activeTab !== "agent_resolve" && (
                                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  {activeApp?.name ? (
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                      Application: <strong>{activeApp.name}</strong>
                                    </span>
                                  ) : <div />}
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      color: "#38bdf8",
                                      background: "rgba(56, 189, 248, 0.12)",
                                      border: "1px solid rgba(56, 189, 248, 0.3)",
                                      borderRadius: "6px",
                                      padding: "4px 10px",
                                    }}
                                  >
                                    {item.code || item.story}
                                  </span>
                                </div>
                              )}

                              {/* Action Button for Agent Resolve Incidents */}
                              {activeTab === "agent_resolve" && (
                                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  {item.isResolved ? (
                                    <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <Icon name="check" size={16} /> Issue Resolved Successfully
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.isIgnio) {
                                          startIgnioAutoResolve(item);
                                        } else {
                                          startDeterministicAutoResolve(item);
                                        }
                                      }}
                                      style={{
                                        background: item.isIgnio
                                          ? "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)"
                                          : "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "8px 16px",
                                        fontWeight: "700",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)",
                                        transition: "all 0.2s ease",
                                      }}
                                    >
                                      <Icon name="zap" size={14} /> {item.actionLabel || (item.isIgnio ? "Auto Resolve" : "Agent Resolve")}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Developer Applications Workspace View (for Developer / Software Engineer roles) */}
        {(!isPOPage && (activeTab === "applications" || selectedWorkspace)) && (
          <section className="fade-in" style={{ marginTop: "16px", marginBottom: "30px" }}>
            <WorkspacePanel
              domain={{ name: "Software Engineering", slug: "swe" }}
              workspaces={workspaces}
              categories={categories}
              selectedWorkspace={selectedWorkspace}
              setSelectedWorkspace={handleSetSelectedWorkspace}
              domainSlug="swe"
            />
          </section>
        )}
      </main>

      {/* L2 PRD Generator Preview Modal */}
      {showPrdModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              color: "var(--text-primary)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--cyan)", fontWeight: "700" }}>
                AI-Generated PRD Document - {selectedPrdItem?.prbCode || "PRB003210"}
              </h3>
              <button
                onClick={() => setShowPrdModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>

            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
              <p><strong>Title:</strong> {selectedPrdItem?.title || "Permanent Fix for Memory Leak in Payment Worker Microservice"}</p>
              <p><strong>Incident Reference:</strong> {selectedPrdItem?.prbCode || "PRB003210"} (Mapped to INC008954, INC009012)</p>
              <p><strong>Target Component:</strong> `payment-worker-service` (Node.js/Fastify)</p>
              <hr style={{ borderColor: "var(--border)", margin: "12px 0" }} />

              <h4 style={{ color: "var(--text-primary)", margin: "10px 0 6px" }}>1. Problem Statement</h4>
              <p>The Payment Worker experiences a heap memory growth of ~45MB/hour due to unreleased DB connection handles during webhook retries under peak throughput.</p>

              <h4 style={{ color: "var(--text-primary)", margin: "10px 0 6px" }}>2. Technical Solution</h4>
              <p>Implement explicit connection cleanup in `async finally` blocks and upgrade connection pool manager to v4.2.</p>

              <h4 style={{ color: "var(--text-primary)", margin: "10px 0 6px" }}>3. AD Handoff Requirements</h4>
              <ul>
                <li>Refactor connection pool lifecycle in `src/db/pool.ts`</li>
                <li>Add memory leak regression unit test in Jest</li>
                <li>Target Sprint: Sprint 43 (Priority P2)</li>
              </ul>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowPrdModal(false)}
                style={{
                  padding: "8px 16px",
                  background: "var(--surface-input)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast("PRD Document exported and assigned to AD Team!");
                  setShowPrdModal(false);
                }}
                style={{
                  padding: "8px 16px",
                  background: "var(--cyan)",
                  color: "var(--navy)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Sync with AD Development Backlog &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Bot Widget - shown for AMS Support / Software Engineers */}
      {isChatbotEnabled(selectedArea, selectedRole) && data && (
        <UnifiedBotWidget
          selectedRole={selectedRole}
          data={data}
          domain={selectedArea}
          onOpenChange={setIsBotOpen}
          hideFloat={Boolean(selectedActionItem || showPrdModal || showAppHealthModal || showClaimsModal || selNexusOpen || hitlSourceItem || hitlIgnioSourceItem)}
        />
      )}

      {/* AI for AD Role Bot Widget - shown when "AI for AD" domain is selected */}
      {selectedArea === "AI for AD" && data && (
        <AdRoleBotWidget
          selectedRole={selectedRole}
          data={data}
          onOpenChange={setIsBotOpen}
          hideFloat={Boolean(selectedActionItem || showPrdModal || showAppHealthModal || showClaimsModal || selNexusOpen || hitlSourceItem || hitlIgnioSourceItem)}
        />
      )}

      {/* SEL Nexus Floating Button & Popups for L3 & L4 Support Engineer, or Developer / Product Owner in AI for AD */}
      {(selectedRole === "L3 Support Engineer" ||
        selectedRole === "L4 Support Engineer" ||
        (selectedArea === "AI for AD" && (selectedRole === "Developer" || selectedRole === "Product Owner"))) && (
          <>
            {!selNexusOpen && (
              <div
                className="sel-nexus-float"
                onClick={() => setSelNexusOpen(true)}
                title="Open SEL Nexus Autonomous Pipeline"
              >
                <Icon name="zap" size={18} />
                <span>SEL Nexus</span>
              </div>
            )}

            <Modal
              isOpen={selNexusOpen}
              onClose={() => setSelNexusOpen(false)}
              title="Automation Pipeline"
            >
              <div className="pd-ai-tools-card" style={{ border: "none", background: "transparent", padding: 0, boxShadow: "none", margin: "0 auto", maxWidth: "640px" }}>
                <div className="pd-ai-tools-icon">
                  <Icon name="zap" size={32} />
                </div>
                <h3 className="pd-ai-tools-title" style={{ marginTop: "12px", marginBottom: "8px" }}>Invoke SEL Nexus</h3>
                <p className="pd-ai-tools-desc" style={{ marginBottom: "24px" }}>
                  Run SEL Nexus for &quot;{selectedRole === "L3 Support Engineer" ? "L3 Deep Engineering & Hotfix" : selectedRole === "Product Owner" ? "Product Owner Backlog & AC" : selectedRole === "Developer" ? "AD Developer Workspace" : "L4 Support Platform"}&quot; - governed, autonomous
                  delivery from requirements through implementation.
                </p>

                <div className="pd-ai-tools-actions">
                  <a
                    href={GREENFIELD_PIPELINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-ai-tools-action greenfield"
                    data-tooltip="Invoke Greenfield L3 Autonomous Pipeline"
                    aria-label="Invoke Greenfield L3 Autonomous Pipeline"
                  >
                    <Icon name="externalLink" size={20} />
                    <span className="pd-ai-tools-action-text">
                      <span className="pd-ai-tools-action-title">Green Field</span>
                      <span className="pd-ai-tools-action-subtitle">
                        L3 Autonomous Pipeline
                      </span>
                    </span>
                  </a>

                  <button
                    type="button"
                    className="pd-ai-tools-action brownfield"
                    onClick={() => {
                      setSelNexusOpen(false);
                      setPipelineModalOpen(true);
                    }}
                    data-tooltip="Invoke Application Enhancements L3 Pipeline"
                    aria-label="Invoke Application Enhancements L3 Pipeline"
                  >
                    <Icon name="play" size={20} />
                    <span className="pd-ai-tools-action-text">
                      <span className="pd-ai-tools-action-title">
                        Application Enhancements
                      </span>
                      <span className="pd-ai-tools-action-subtitle">
                        L3 Autonomous Pipeline
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </Modal>

            <PipelineModal
              isOpen={pipelineModalOpen}
              onClose={() => setPipelineModalOpen(false)}
              appSlug="SEL Nexus"
              featureDescription={`${selectedRole} autonomous hotfix & enhancements pipeline execution`}
              endpoint={BROWNFIELD_PIPELINE_ENDPOINT}
              onStarted={() => { }}
            />
          </>
        )}

      {/* Claims Observability Dashboard Modal */}
      {showClaimsModal && (
        <Modal
          isOpen={showClaimsModal}
          onClose={() => setShowClaimsModal(false)}
          title="Member Portal Observability - Member Experience"
          videoUrl="https://ismartams.tcsapps.com/member-portal-observability/"
        />
      )}


      {/* App Health Modal */}
      {showAppHealthModal && (
        <AppHealthModal
          isOpen={showAppHealthModal}
          onClose={() => setShowAppHealthModal(false)}
          app={selectedHealthApp}
        />
      )}

      {/* ignio Auto Resolve Pipeline Modal */}
      {ignioModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !ignioIsRunning) setIgnioModalOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              color: "#f8fafc",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)",
                borderBottom: "1px solid #334155",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="zap" size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                    ignio™ Automated AI Remediation
                  </h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Target: <strong>{ignioItem?.num || "INC009405"}</strong> - {ignioItem?.subject || "Automated Incident Remediation"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIgnioModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}
              >
                X
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Overall Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
                  <span>PIPELINE EXECUTION PROGRESS</span>
                  <span style={{ color: "#38bdf8" }}>{ignioIsResolved ? "100%" : `${Math.round((ignioCurrentStep / 4) * 100)}%`}</span>
                </div>
                <div style={{ height: "8px", background: "#1e293b", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: ignioIsResolved ? "100%" : `${(ignioCurrentStep / 4) * 100}%`,
                      background: ignioIsResolved ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #0891b2, #2563eb)",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Sequential Steps List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  {
                    step: 1,
                    title: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "1. Ingest & Connect: Member Ingestion Queue"
                      : "1. Ingest & Connect: Batch Scheduler Telemetry",
                    desc: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "Connecting to HR Connect ingestion service and checking file transfer queue status."
                      : "Connecting to Control-M Batch Scheduler and fetching worker thread status logs."
                  },
                  {
                    step: 2,
                    title: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "2. Observe & Detect: File Lock & Stream Stall"
                      : "2. Observe & Detect: Stalled Batch Job Identification",
                    desc: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "Identifying file read-lock on enrollment batch feed and unreleased stream handle."
                      : "Detecting thread memory deadlock, unreleased database locks, and batch job failure."
                  },
                  {
                    step: 3,
                    title: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "3. Auto-Resume & Self-Heal: Releasing Lock & Resuming Stream"
                      : "3. Auto-Restart & Self-Heal: Clearing Locks & Resuming Job",
                    desc: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "Clearing file lock, resetting staging pointer, and issuing automated stream resume."
                      : "Releasing stale database locks, clearing worker cache, and issuing automated job restart."
                  },
                  {
                    step: 4,
                    title: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "4. Govern & Verify: Confirming HR Data Flow & Sign-off"
                      : "4. Govern & Verify: Confirming Successful Execution",
                    desc: (ignioItem?.id === "arb2" || ignioItem?.subject?.includes("Enrollment") || ignioItem?.num === "INC0048915" || ignioItem?.num === "RITM004120")
                      ? "Verifying member enrollment records processed successfully and setting ticket status to Resolved."
                      : "Verifying batch job resumed successfully, all records ingested, and setting ticket status to Resolved."
                  },
                ].map((s) => {
                  const isDone = ignioCurrentStep > s.step || ignioIsResolved;
                  const isCurrent = ignioCurrentStep === s.step && ignioIsRunning;

                  return (
                    <div
                      key={s.step}
                      style={{
                        background: isCurrent ? "rgba(8, 145, 178, 0.12)" : isDone ? "rgba(16, 185, 129, 0.08)" : "#1e293b",
                        border: `1px solid ${isCurrent ? "#0891b2" : isDone ? "rgba(16, 185, 129, 0.3)" : "#334155"}`,
                        borderRadius: "10px",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: isDone ? "#10b981" : isCurrent ? "#0891b2" : "#334155",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "12px",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {isDone ? "Done" : isCurrent ? "" : s.step}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: isDone ? "#34d399" : isCurrent ? "#38bdf8" : "#94a3b8" }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                          {s.desc}
                        </div>
                      </div>

                      <div style={{ fontSize: "11px", fontWeight: "600", color: isDone ? "#10b981" : isCurrent ? "#0891b2" : "#64748b" }}>
                        {isDone ? "Completed" : isCurrent ? "Executing..." : "Pending"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resolved Success Banner */}
              {ignioIsResolved && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid #10b981",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    color: "#10b981",
                    marginTop: "8px",
                  }}
                >
                  <div style={{ background: "#10b981", color: "#fff", borderRadius: "50%", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="check" size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>
                      Issue is resolved successfully!
                    </h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>
                      ignio™ automated remediation completed. Incident status has been updated to <strong>Resolved</strong> with 100% health confirmation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIgnioModalOpen(false)}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deterministic Auto Resolve Chat Window Modal */}
      {deterministicModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deterministicIsRunning) setDeterministicModalOpen(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "640px",
              height: "600px",
              maxHeight: "85vh",
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              color: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <style>{`
              @keyframes bounce {
                0%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-4px); }
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
              .typing-dot {
                width: 6px;
                height: 6px;
                background-color: #94a3b8;
                border-radius: 50%;
                display: inline-block;
                animation: bounce 1.4s infinite ease-in-out both;
              }
              .typing-dot:nth-child(1) { animation-delay: -0.32s; }
              .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            `}</style>


            {/* Header */}
            <div
              style={{
                background: "linear-gradient(90deg, #0f172a 0%, #312e81 100%)",
                borderBottom: "1px solid #334155",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                    color: "#fff",
                    padding: "8px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="bot" size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        background: "rgba(139, 92, 246, 0.2)",
                        border: "1px solid rgba(139, 92, 246, 0.4)",
                        color: "#c4b5fd",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "800",
                        fontFamily: "monospace",
                      }}
                    >
                      {deterministicItem?.num || "INC0048219"}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
                      {deterministicItem?.service || deterministicItem?.num || "Automated Resolution Assistant"}
                    </h3>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Ticket: <strong>{deterministicItem?.subject?.split(" - ")[0] || deterministicItem?.subject || "Support Ticket"}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeterministicModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}
              >
                X
              </button>
            </div>

            {/* Chat Body */}
            <div
              ref={deterministicChatBodyRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "#0b0f19",
                scrollBehavior: "smooth",
              }}
            >
              {deterministicMessages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.isSuccess ? "center" : (msg.sender === "user" ? "flex-end" : "flex-start") }}>
                  {msg.isSuccess ? (
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid #10b981",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        color: "#10b981",
                        width: "100%",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      <div style={{ background: "#10b981", color: "#fff", borderRadius: "50%", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="check" size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>
                          Issue is resolved successfully!
                        </h4>
                        <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>
                          Deterministic agent conversational validation completed. Ticket <strong>{deterministicItem?.num || "RITM004120"}</strong> status updated to <strong>Resolved</strong>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        maxWidth: "85%",
                        background: msg.sender === "user" ? "#2563eb" : "#1e293b",
                        border: "1px solid",
                        borderColor: msg.sender === "user" ? "#3b82f6" : "#334155",
                        borderRadius: "12px",
                        borderBottomRightRadius: msg.sender === "user" ? "2px" : "12px",
                        borderBottomLeftRadius: msg.sender !== "user" ? "2px" : "12px",
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#f8fafc",
                        lineHeight: "1.5",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "4px", fontSize: "11px", color: msg.sender === "user" ? "#93c5fd" : "#94a3b8" }}>
                        {msg.sender === "user" ? "User" : "Agent"}
                      </div>
                      {msg.text.split("\n").map((line, i) => {
                        const isListItem = /^\d+\./.test(line.trim());
                        return line === "" ? (
                          <br key={i} />
                        ) : (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              gap: isListItem ? "8px" : "0",
                              alignItems: "flex-start",
                              marginBottom: isListItem ? "4px" : "0",
                            }}
                          >
                            {isListItem && (
                              <span style={{ color: "var(--cyan)", fontWeight: "700", minWidth: "16px" }}>
                                {line.trim().match(/^\d+/)[0]}.
                              </span>
                            )}
                            <span>{isListItem ? line.trim().replace(/^\d+\.\s*/, "") : line}</span>
                          </div>
                        );
                      })}
                      <div style={{ fontSize: "10px", color: msg.sender === "user" ? "#bfdbfe" : "#64748b", marginTop: "6px", textAlign: "right" }}>
                        {msg.time}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {deterministicAgentTyping && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "85%",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      borderBottomLeftRadius: "2px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}

              <div ref={deterministicChatEndRef} style={{ height: "1px", width: "100%", flexShrink: 0 }} />
            </div>

            {/* Input Area / Footer */}
            <div
              style={{
                background: "#0f172a",
                borderTop: "1px solid #1e293b",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {(() => {
                const stepCount = deterministicMessages.length;

                if (stepCount === 1) {
                  let suggestedText = "";
                  if (deterministicItem?.id === "ar1" || deterministicItem?.service?.includes("Member Portal") || deterministicItem?.subject?.includes("Verification Code")) {
                    suggestedText = "I'm unable to log in to the member portal. It keeps asking for a verification code, but I'm not receiving any email";
                  } else if (deterministicItem?.id === "ar2" || deterministicItem?.service?.includes("Registration") || deterministicItem?.subject?.includes("Date of Birth")) {
                    suggestedText = "It says my date of birth is incorrect, but I'm entering the right one. I can't log in";
                  } else if (deterministicItem?.id === "ar3" || deterministicItem?.service?.includes("Account Identity") || deterministicItem?.subject?.includes("Existing Account")) {
                    suggestedText = "I'm trying to create an account, but it keeps saying I already have one";
                  }

                  if (suggestedText) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setDeterministicMessages((prev) => [
                            ...prev,
                            { id: prev.length + 1, sender: "user", text: suggestedText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
                          ]);
                        }}
                        style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          border: "1px solid #3b82f6",
                          color: "#60a5fa",
                          padding: "10px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                          alignSelf: "flex-start",
                          marginBottom: "4px"
                        }}
                        onMouseOver={(e) => e.target.style.background = "rgba(59, 130, 246, 0.2)"}
                        onMouseOut={(e) => e.target.style.background = "rgba(59, 130, 246, 0.1)"}
                      >
                        {suggestedText}
                      </button>
                    );
                  }
                }
                return null;
              })()}

              {!deterministicIsResolved ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!deterministicInputValue.trim() || deterministicAgentTyping) return;
                    setDeterministicMessages((prev) => [
                      ...prev,
                      { id: prev.length + 1, sender: "user", text: deterministicInputValue.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
                    ]);
                    setDeterministicInputValue("");
                  }}
                  style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}
                >
                  <input
                    type="text"
                    value={deterministicInputValue}
                    onChange={(e) => setDeterministicInputValue(e.target.value)}
                    placeholder="Ask about your ticket..."
                    disabled={deterministicAgentTyping}
                    style={{
                      flex: 1,
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#f8fafc",
                      padding: "12px 16px",
                      borderRadius: "24px",
                      fontSize: "14px",
                      outline: "none",
                      opacity: deterministicAgentTyping ? 0.6 : 1,
                      transition: "opacity 0.2s"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!deterministicInputValue.trim() || deterministicAgentTyping}
                    style={{
                      background: deterministicInputValue.trim() && !deterministicAgentTyping ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "#334155",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "42px",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: deterministicInputValue.trim() && !deterministicAgentTyping ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Status: 100% Resolved</span>
                  <button
                    type="button"
                    onClick={() => setDeterministicModalOpen(false)}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 18px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Close & Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
