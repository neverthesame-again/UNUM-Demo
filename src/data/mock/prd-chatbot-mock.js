// src/data/mock/prd-chatbot-mock.js
// Mock conversation responses for AI PRD Creation flow based on Incident SYNINC0000012

export const PRD_WELCOME_MESSAGE =
  "Hi! How can I help you with GuideWell AI Hub IT operations or incident data today?";

export const PRD_PREDEFINED_PROMPTS = [
  "Provide the top 10 incident details where the Priority is 'Moderate' and the Application is 'MyMember Benefits Portal - Production' for January 2026",
];

export const MOCK_INCIDENT_ROW = {
  incidentNumber: "SYNINC0000012",
  created: "16-Jan-2026 12:36",
  resolved: "21-Jan-2026 12:36",
  closed: "21-Jan-2026 12:36",
  application: "MyMember Benefits Portal - Production",
  environment: "Synthetic Test",
  state: "Closed",
  priority: "Moderate",
  impact: "Moderate - Single user issue, limited business impact",
  urgency: "Moderate - No service disruption",
  severity: "3 - Low",
  category: "Access",
  resolutionType: "Resolved by remediation",
  resolutionCategory: "Data Issue",
  problem: "",
  assignmentGroup: "Synthetic Benefits Support",
  shortDescription: "Dental Coverage Not Displayed",
  description:
    "Synthetic incident. The portal does not display the expected dental coverage not displayed for a covered spouse. Mock member reference: MOCKMBR000012; mock dependent reference: MOCKDEP000012. No production customer data is included.",
  resolutionNotes:
    "Synthetic resolution: Spouse and child have matching display names, causing ambiguous person selection. Show separate person cards using relationship and masked dependent ID, and retrieve coverage using the unique dependent identifier.",
  customerName: "Mock Member 0012",
  dateOfBirth: "13-Jan-1982",
  ssn: "000-22-1012",
  email: "mock.member0012@example.com",
  memberNumber: "MOCKMBR000012",
  phone: "202-555-1012",
  dataPrivacyStatus: "Fully synthetic mock record; no source PHI/PII retained",
  rootCause:
    "Spouse and child have matching display names, causing ambiguous person selection.",
  suggestedUiResolution:
    "Show separate person cards using relationship and masked dependent ID, and retrieve coverage using the unique dependent identifier.",
};

// Step 1: Top 10 Incidents Table
export const MOCK_TOP_10_INCIDENTS_RESPONSE = `Here are the details for the moderate-priority MyMember Benefits Portal incidents recorded in January 2026:

| Incident ID | Date | Description | Impact | Environment | Root Cause | MTTR (Hours) | SLA Breached |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SYNINC0000012** | 2026-01-16 | MyMember Benefits Portal dental coverage not displayed | Single User | Synthetic Test | Ambiguous Person Selection | 120.0 | No |
| SYNINC0000019 | 2026-01-29 | MyMember Benefits Portal copay accumulator delay | Multiple Users | Production | Batch Synchronization Delay | 18.4 | No |
| SYNINC0000018 | 2026-01-26 | MyMember Benefits Portal dependent card download failure | Multiple Users | Production | PDF Service Timeout | 14.2 | No |
| SYNINC0000017 | 2026-01-24 | MyMember Benefits Portal vision plan deductible mismatch | Site/Dept | Production | Data Mapping Issue | 52.0 | Yes |
| SYNINC0000016 | 2026-01-21 | MyMember Benefits Portal pharmacy tier pricing not updating | Multiple Users | Production | Cache Invalidation Lag | 16.5 | No |
| SYNINC0000015 | 2026-01-19 | MyMember Benefits Portal member profile sync error | Multiple Users | Production | Integration Failure | 22.1 | No |
| SYNINC0000014 | 2026-01-15 | MyMember Benefits Portal login session timeout loop | Single User | QA | Token Expiry Drift | 145.0 | No |
| SYNINC0000013 | 2026-01-12 | MyMember Benefits Portal provider directory search empty | Multiple Users | Production | Elasticsearch Re-index Lag | 8.6 | No |
| SYNINC0000011 | 2026-01-08 | MyMember Benefits Portal claims status delayed | Multiple Users | Production | Data Mapping Issue | 24.3 | No |
| SYNINC0000010 | 2026-01-04 | MyMember Benefits Portal enrollment confirmation email missing | Single User | Production | SMTP Relay Throttling | 6.8 | No |

### Summary Metrics
- **Total Incidents**: 10
- **SLA Compliance**: 90% (1 SLA breach recorded)
- **Primary Environment**: Production / Synthetic Test (9 out of 10 incidents)
- **Primary Root Causes**: Person Disambiguation & Data Mapping (3 incidents), Integration & Timeout (3 incidents), Cache & Batch Delays (2 incidents)

generate RCA for incident id:SYNINC0000012`;

// Step 2: Root Cause Analysis (RCA)
export const MOCK_RCA_RESPONSE = `Root Cause Analysis (RCA) — Incident #SYNINC0000012
Incident Summary: During normal member portal operations, the MyMember Benefits Portal experienced an access and display issue where covered dental benefits failed to render for a covered spouse due to ambiguous person selection.

Incident Metadata:
- Application: MyMember Benefits Portal - Production
- Environment: Synthetic Test
- Impact: Moderate - Single user issue, limited business impact
- Urgency: Moderate - No service disruption
- Severity: 3 - Low
- Category: Access
- Assigned Group: Synthetic Benefits Support
- Created Date: 16-Jan-2026 12:36
- Resolved Date: 21-Jan-2026 12:36
- Closed Date: 21-Jan-2026 12:36
- Customer / Member: Mock Member 0012 (DOB: 13-Jan-1982)
- Member Number: MOCKMBR000012 | Dependent Ref: MOCKDEP000012
- Masked SSN: 000-22-1012 | Email: mock.member0012@example.com | Phone: 202-555-1012
- Data Privacy Status: Fully synthetic mock record; no source PHI/PII retained

Root Cause & Technical Trigger: Support investigation determined that the underlying issue was: **Spouse and child have matching display names, causing ambiguous person selection.** The frontend person selector keyed selection state off display names rather than immutable unique dependent identifiers, causing the spouse's dental coverage query to collapse or be superseded by the child's record.

Resolution & Fix Applied:
- Resolution Code: Resolved by remediation
- Resolution Category: Data Issue
- Resolution Notes: Synthetic resolution: Spouse and child have matching display names, causing ambiguous person selection. Show separate person cards using relationship and masked dependent ID, and retrieve coverage using the unique dependent identifier.
- SLA & Recovery Impact: Mean Time to Repair (MTTR) was recorded at 120.0 hours. The SLA was maintained, and no breach occurred.

Suggested UI Resolution:
Show separate person cards using relationship and masked dependent ID, and retrieve coverage using the unique dependent identifier.

Preventative Action Items:
1. Implement distinct Person Selection Cards showing relationship badges ('Spouse', 'Child') and masked dependent IDs (DEP-***-0012).
2. Update frontend coverage API queries to strictly require immutable surrogate keys (dependent_id) instead of display names.
3. Add automated test coverage in synthetic test suites to validate dependent name collisions within identical family policies.

Do you want to create Jira feature enhancment request ticket?`;

// Step 3: Jira Ticket Created
export const MOCK_JIRA_RESPONSE = `🎫 JIRA Ticket Created Successfully!
Ticket Details:

Ticket ID: SCRUM-48
Summary: Implement Dependent Disambiguation and Unique ID Coverage Retrieval in MyMember Benefits Portal
Status: Created / Backlog

Would you like me to analyze this enhancement and create a detailed PRD?`;

// Step 4: Full PRD
export const MOCK_PRD_RESPONSE = `Product Requirement Document (PRD)

1. Executive Summary & Problem Statement
Executive Summary
Following incident SYNINC0000012 ("Dental Coverage Not Displayed in MyMember Benefits Portal"), which impacted a covered spouse due to ambiguous person selection from identical display names, engineering has identified a critical need for unique-identifier-based dependent disambiguation. This PRD outlines the requirements for SCRUM-48: Implement Dependent Disambiguation and Unique ID Coverage Retrieval in MyMember Benefits Portal. The initiative replaces flat name-based selection with distinct Person Cards displaying relationship badges and masked IDs, backed by immutable surrogate keys (dependent_id) for coverage queries.

Problem Statement
Currently, the MyMember Benefits Portal frontend relies on display names to track active dependent selection and query coverage details. When family members share identical display names (e.g., spouse and child with matching first/last names or generation fixtures):
- The frontend person selector collapses them into a single ambiguous state.
- Downstream coverage lookups retrieve the child's record instead of the spouse's, resulting in an empty or restricted dental coverage screen.
- Members cannot verify benefits or access dental ID cards, driving high-touch support escalations to Synthetic Benefits Support (MTTR 120 hrs).

2. Objectives & Scope
Objectives
- Eliminate Ambiguous Person Selection: Ensure 100% disambiguation of all covered family members, regardless of matching or identical display names.
- Unique-Identifier-Driven Coverage: Guarantee that coverage retrieval queries use immutable surrogate keys (dependent_id) rather than names.
- Zero Blank Coverage Views: Provide clear, informative empty/status states for dependents not enrolled in specific benefit plans.
- Reduce Support Escalations: Eliminate access-related support tickets for missing dependent coverage.

Scope
In-Scope:
- Person Selection Card component displaying Full Name, Relationship Badge ('Spouse', 'Child'), Masked Dependent ID (DEP-***-0012), and DOB preview.
- Frontend state management and API contract updates to bind queries strictly to dependent_id.
- Empty state handling and multi-benefit category switching (Dental, Vision, Medical).
Out-of-Scope:
- Modifications to core policy underwriting or claims adjudication engines.
- Full enterprise Master Patient Index (MPI) overhaul.

3. User Personas & Use Cases
Personas
- Policyholder / Member: Needs clear, intuitive family member selection to manage dental and medical benefits without confusion.
- Covered Spouse / Dependent: Requires verified real-time access to dental coverage details, deductibles, and digital ID cards.
- Benefits Support Specialist: Needs portal parity to view exact dependent disambiguation details during inquiries.

Key Use Cases
- Disambiguated Dependent Selection: When opening the benefits hub, the member sees separate cards for their Spouse and Child with distinct relationship tags and masked IDs.
- Accurate Dental Coverage View: Clicking the Spouse card immediately retrieves and displays the active "Premium Dental Choice Plus" coverage details.
- Responsive Person Switching: Toggling between family cards updates the active coverage view smoothly without full page reloads.

4. Functional Requirements
FR-1: Person Selection Card Grid Component
- The UI must render individual selectable cards for each enrolled dependent.
- Each card must display: Full Name, Relationship Chip ('Spouse', 'Child', 'Primary'), Masked Dependent ID, and DOB preview.
- The selected card must feature a distinct accent border, subtle elevation, and an active checkmark.

FR-2: Immutable Unique Identifier Query Contract
- All coverage lookup endpoints must require dependent_id (GET /api/v2/dependents/{dependent_id}/coverage?type=dental).
- Deprecate any name-based parameters in API queries.

FR-3: Reactive Benefit Tab Synchronization
- Selecting a person card must reactively update all benefit tabs (Dental, Medical, Vision) using client state management.
- Display skeleton shimmer placeholders during data fetching to prevent layout shifts.

FR-4: Informative Empty State Handling
- If a selected dependent does not carry active dental coverage, render an explicit message: "[Name] (Spouse) is not enrolled in Dental coverage under this plan." with self-service enrollment links.

5. Non-Functional Requirements (Security, Performance, SLA)
- Performance: Card selection transition < 100ms; coverage API latency < 400ms (P95).
- Security & Privacy: Strict masking of PII (SSN, Full IDs); zero PII in URL parameters; synthetic data privacy compliance.
- Accessibility (a11y): Full WCAG 2.1 Level AA compliance with keyboard navigation and screen-reader ARIA announcements.
- Responsiveness: Fully responsive layout supporting mobile (375px+), tablet, and desktop viewports.

6. System Architecture & Technical Specifications
[Member Portal Frontend]
        │
        ├── (User selects Person Card: Spouse ID: MOCKDEP000012)
        ▼
[API Gateway / BFF Service]
        │
        ├── (Validate dependent_id against policy MOCKMBR000012)
        ▼
[Benefits & Eligibility Microservice]
        │
        ├── (Fetch Dental Coverage by MOCKDEP000012)
        ▼
[Render Dental Plan Summary, Copays, Deductibles & ID Card]

Technologies: React 18, Vite, Supabase / REST API, WCAG 2.1 AA tokens.
API Contracts: Strict validation schema enforcing non-null dependent_id on all coverage requests.

7. Success Metrics & Release Milestones
Success Metrics
- 0 Repeat Tickets: 0 incidents reported for missing dental coverage due to ambiguous dependent names.
- 100% Self-Service Resolution: Members successfully view dependent dental benefits on first load.
- 15% Call Center Deflection: Reduction in tier 1 inquiries regarding dependent coverage access.

Release Milestones
- Milestone 1 (Sprint 1): API specification update and unit tests for dependent_id coverage endpoint.
- Milestone 2 (Sprint 2): Person Card UI component development, relationship chips, and state binding.
- Milestone 3 (Sprint 3): Synthetic regression suite validation with identical name fixtures, staging deployment.
- Milestone 4 (Sprint 4): Production canary release and telemetry monitoring.

[📥 Download PRD (.docx)](#download-prd)

Switch to the [SEL Nexus Automation Pipeline](https://mnnb9bbkgu.ap-south-1.awsapprunner.com/agents/automation) to execute SEL Nexus.`;

/**
 * Determines the appropriate mock response based on the incoming user message
 * and recent bot conversation history.
 */
export function getPrdMockResponse(userText, messages = []) {
  const clean = (userText || "").trim().toLowerCase();

  // Find the last bot message in the conversation history
  const botMsgs = messages.filter((m) => m.sender === "bot");
  const lastBot = botMsgs.length > 0 ? botMsgs[botMsgs.length - 1].text : "";

  // 1. Check if user is responding "yes" (or affirmative) to a prior bot prompt
  const isAffirmative =
    clean === "yes" ||
    clean.startsWith("yes") ||
    clean === "y" ||
    clean === "sure" ||
    clean === "yep" ||
    clean === "ok" ||
    clean === "okay" ||
    clean === "please" ||
    clean.includes("create jira") ||
    clean.includes("create prd") ||
    clean.includes("generate prd");

  // Step 4: Prior message asked about creating a PRD
  if (
    lastBot.includes("Would you like me to analyze this enhancement and create a detailed PRD?") &&
    isAffirmative
  ) {
    return {
      text: MOCK_PRD_RESPONSE,
      quickReplies: [],
    };
  }

  // Step 3: Prior message asked about creating a Jira ticket
  if (
    lastBot.includes("Do you want to create Jira feature enhancment request ticket?") &&
    isAffirmative
  ) {
    return {
      text: MOCK_JIRA_RESPONSE,
      quickReplies: ["yes", "no"],
    };
  }

  // If user says "no"
  if (clean === "no" || clean === "nope" || clean === "cancel") {
    if (lastBot.includes("Do you want to create Jira")) {
      return {
        text: "Understood. No Jira ticket was created. Let me know if you would like an RCA for another incident or have other inquiries.",
        quickReplies: [],
      };
    }
    if (lastBot.includes("create a detailed PRD")) {
      return {
        text: "Understood. The Jira ticket SCRUM-48 remains logged. Let me know if you would like me to assist with anything else.",
        quickReplies: [],
      };
    }
  }

  // Step 2: User requests RCA
  if (
    clean.includes("rca") ||
    clean.includes("syninc0000012") ||
    clean.includes("root cause") ||
    clean.includes("inc2784087")
  ) {
    return {
      text: MOCK_RCA_RESPONSE,
      quickReplies: ["yes", "no"],
    };
  }

  // Step 1: User asks for top 10 incidents / incident list / general incident query
  if (
    clean.includes("top 10") ||
    clean.includes("top 5") ||
    clean.includes("incident details") ||
    clean.includes("mymember") ||
    clean.includes("care dashboard") ||
    clean.includes("january 2026") ||
    clean.includes("january 2025") ||
    clean.includes("incidents") ||
    clean.includes("incident")
  ) {
    return {
      text: MOCK_TOP_10_INCIDENTS_RESPONSE,
      quickReplies: ["generate RCA for incident id:SYNINC0000012"],
    };
  }

  // Default fallback for this workspace
  return {
    text: `I can help you review top incidents, generate root cause analyses (RCA), create Jira feature enhancement tickets, and build Product Requirement Documents (PRD).

Try asking:
- "Provide the top 10 incident details where the Priority is 'Moderate' and the Application is 'MyMember Benefits Portal - Production' for January 2026"
- "generate RCA for incident id:SYNINC0000012"`,
    quickReplies: [
      "generate RCA for incident id:SYNINC0000012",
    ],
  };
}
