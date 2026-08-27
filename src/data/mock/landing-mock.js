// Dynamic Mock Data Provider for Landing Page across Domains, Roles & Navigation Tabs
// Domains: AI for AD, AI for AMS
// Roles: Admin, Product Owner, Developer, Tester (AI for AD)
//        L1 Support Engineer, L2 Support Engineer, L3 Support Engineer, L4 Support Engineer (AI for AMS)

export const roleMockData = {
  "AI for AD": {
    Admin: {
      topbar: {
        title: "AI for AD · Domain Admin Assist",
        subtitle: "Enterprise AD Governance, Agent Mesh Telemetry & Pipeline Orchestration",
        platform: "AD-Admin",
        shift: "Sprint 42 Governance | AD Domain · Active",
        shiftProgress: "85%",
        statusBadge: "● AD AGENT MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, AD Admin — Domain pipeline and agent telemetry overview.",
        subtext: "4 project workspaces active · 18 agentic automations running · 3 budget & access reviews pending",
        chips: [
          { id: "c1", text: "Sprint Velocity 94.2% · 2 days remaining", type: "info" },
          { id: "c2", text: "Agent Token Quota 78% utilized", type: "warn" },
          { id: "c3", text: "2 Pending Role Escalations", type: "danger" },
          { id: "c4", text: "Code Quality Gate 88.5% Pass", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "pipelines", label: "Pipelines", badge: 4 },
        { id: "security", label: "Security & Compliance", badge: 3 },
        { id: "agents", label: "Agentic Mesh", badge: 18 },
      ],
      stateOfEnvironment: {
        title: "AD Domain Workspace Status",
        tag: "Sprint 42 Real-time",
        metrics: [
          { id: "m1", count: 2, label: "Critical", color: "red" },
          { id: "m2", count: 5, label: "High", color: "orange" },
          { id: "m3", count: 12, label: "Med", color: "blue" },
          { id: "m4", count: 28, label: "Low", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "Claims Portal v2.4 (React/Node)",
            status: "Security Risk",
            statusType: "danger",
            desc: "CVE-2026-8812 in npm package · 3 PRs blocked on security gate",
          },
          {
            id: "e2",
            title: "Prior-Auth API Microservice (Go)",
            status: "At Risk",
            statusType: "warn",
            desc: "Staging deployment latency +18% · 2 agent actions queued",
          },
          {
            id: "e3",
            title: "Member Enrollment Portal",
            status: "Healthy",
            statusType: "watch",
            desc: "45 PRs merged · SonarQube quality gate 98% · Zero security flaws",
          },
        ],
      },
      whatRequiresAttention: {
        title: "What Requires Attention",
        tag: "4 Admin Alerts",
        cards: [
          {
            id: "a1",
            title: "P2 · Security Audit Gate Failed on Claims API",
            severity: "Review",
            severityType: "review",
            desc: "Claims-Service · 2 vulnerabilities in npm dependencies",
            progress: 85,
          },
          {
            id: "a2",
            title: "P3 · Development Compute Budget Exceeded",
            severity: "At risk",
            severityType: "critical",
            desc: "Dev Cluster 3 · Token limit 92% reached for GenAI Code Agent",
            progress: 92,
          },
          {
            id: "a3",
            title: "P1 · Developer Role Access Approval",
            severity: "Act now",
            severityType: "critical",
            desc: "Pending admin sign-off for 2 new engineers on Claims Repo",
            progress: null,
          },
        ],
      },
      criticalRisks: {
        title: "Domain Governance Risks",
        tag: "Sprint 42",
        cards: [
          {
            id: "r1",
            title: "Sprint SLA Risk · 4 Stories blocked on Architecture Gate",
            severity: "Critical",
            severityType: "critical",
            desc: "Architectural review needed before Sprint 42 freeze in 48h",
          },
          {
            id: "r2",
            title: "API Rate Limit Warning on GenAI Agent",
            severity: "Elevated",
            severityType: "high",
            desc: "Code Generation API approaching 85% hourly token cap",
          },
          {
            id: "r3",
            title: "Pipeline Failure Spike on Staging Cluster",
            severity: "Elevated",
            severityType: "high",
            desc: "Integration test pipeline failure rate up 8.2% overnight",
          },
        ],
      },
      askYourCoworker: {
        title: "AD Admin Agent Orchestrator",
        sub: "Domain governance, access management, token quota & security audit assistant",
        botGreeting: "Hello Admin! I have audited the AD Domain workspace and agent mesh.",
        headline: "4 active project pipelines, 18 agentic automations active. Security audit failure detected in Claims API.",
        actionNeeded: "PR #342 flagged with CVE-2026-8812. Approving automated dependency bump runbook will fix vulnerability.",
        suggestedNext: "Review Security Audit Gate & approve dependency patch runbook.",
        chatMode: "normal",
      },
      tabData: {
        pipelines: {
          title: "CI/CD Build & Deployment Pipelines",
          sub: "Real-time orchestration status across AD microservices and build targets",
          items: [
            { id: "pipe1", name: "Claims-Portal-UI (React)", build: "#412", target: "Staging-US-East", status: "Failed Gate", statusType: "danger", duration: "4m 12s", commit: "feat(claims): add prior-auth modal", author: "Alex Mercer" },
            { id: "pipe2", name: "Prior-Auth-Service (Go)", build: "#409", target: "UAT-Cluster-1", status: "In Progress", statusType: "warn", duration: "2m 45s", commit: "fix(db): connection pool tune", author: "Sarah Connor" },
            { id: "pipe3", name: "Member-Portal-Service (Node)", build: "#405", target: "Production-East", status: "Success", statusType: "success", duration: "3m 10s", commit: "chore: bump security deps", author: "DevOps Bot" },
            { id: "pipe4", name: "Notification-Worker (Python)", build: "#398", target: "Staging-US-East", status: "Success", statusType: "success", duration: "1m 55s", commit: "feat: add SMS retry queue", author: "David Chen" },
          ],
        },
        security: {
          title: "Security, CVE Audits & Role Compliance",
          sub: "Automated vulnerability scanning, HIPAA compliance checks and access reviews",
          items: [
            { id: "sec1", code: "CVE-2026-8812", component: "axios v0.21.1", severity: "High", repo: "claims-adjudication-service", status: "Fix Available", action: "Approve npm audit fix runbook" },
            { id: "sec2", code: "HIPAA-AUDIT-402", component: "PHI Encryption at Rest", severity: "Medium", repo: "member-data-vault", status: "Compliant", action: "Passed automated HIPAA linter" },
            { id: "sec3", code: "RBAC-ESC-012", component: "Developer Role Escalation", severity: "Critical", repo: "claims-adjudication-service", status: "Pending Admin Approval", action: "Review elevation request for John Doe" },
          ],
        },
        agents: {
          title: "Agentic Mesh Telemetry & Resource Quotas",
          sub: "Autonomous AI agent performance, token consumption and execution history",
          items: [
            { id: "ag1", name: "CodeGen Agent (Claude 3.5)", status: "Active", throughput: "142 req/hr", tokensUsed: "78% (780k/1M)", latency: "420ms", successRate: "98.2%" },
            { id: "ag2", name: "QA Healing Agent (Playwright Bot)", status: "Active", throughput: "85 req/hr", tokensUsed: "45% (450k/1M)", latency: "210ms", successRate: "96.4%" },
            { id: "ag3", name: "Security Gate Agent (Sonar AI)", status: "Idle", throughput: "12 req/hr", tokensUsed: "15% (150k/1M)", latency: "180ms", successRate: "100%" },
          ],
        },
      },
    },

    "Product Owner": {
      topbar: {
        title: "AI for AD · Product Owner Assist",
        subtitle: "GenAI Requirements Workbench, User Story Synthesizer & Epic Backlog Engine",
        platform: "AD-PO",
        shift: "Sprint 42 Backlog Refinement | Active",
        shiftProgress: "90%",
        statusBadge: "● BACKLOG AI ENGINE · LIVE",
      },
      summary: {
        greeting: "Good morning, Product Owner — Sprint 42 backlog summary is ready.",
        subtext: "6 User Stories generated by AI · 3 Epics updated · 2 Acceptance Criteria reviews needed",
        chips: [
          { id: "c1", text: "Epic Readiness Score 92%", type: "info" },
          { id: "c2", text: "3 Stories missing AC definition", type: "warn" },
          { id: "c3", text: "Sprint Capacity 88% allocated", type: "info" },
          { id: "c4", text: "Customer Impact Score 9.4/10", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "epics", label: "Epics & Features", badge: 3 },
        { id: "user_stories", label: "User Stories", badge: 8 },
        { id: "acceptance_criteria", label: "Acceptance Criteria", badge: 3 },
      ],
      stateOfEnvironment: {
        title: "Active Epics & Feature Releases",
        tag: "Sprint 42 Backlog",
        metrics: [
          { id: "m1", count: 1, label: "Blocked", color: "red" },
          { id: "m2", count: 4, label: "In Review", color: "orange" },
          { id: "m3", count: 9, label: "In Progress", color: "blue" },
          { id: "m4", count: 15, label: "Backlog", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "EPIC-104: Smart Claims Auto-Adjudication Flow",
            status: "Active",
            statusType: "success",
            desc: "8/10 Stories completed · AI Acceptance Criteria validation passed",
          },
          {
            id: "e2",
            title: "EPIC-108: Provider Portal Onboarding Flow",
            status: "At Risk",
            statusType: "warn",
            desc: "2 User Stories awaiting PO sign-off · Dependency on Security API",
          },
          {
            id: "e3",
            title: "EPIC-112: Member Telehealth Integration",
            status: "In Refinement",
            statusType: "watch",
            desc: "Backlog grooming scheduled for 14:00 ET · 4 AI User Stories ready",
          },
        ],
      },
      whatRequiresAttention: {
        title: "Backlog Items Needing PO Input",
        tag: "3 PO Actions",
        cards: [
          {
            id: "a1",
            title: "P2 · User Story #409 requires AC clarification",
            severity: "Review",
            severityType: "review",
            desc: "Member Claims Lookup · Given-When-Then criteria drafted by AI",
            progress: 70,
          },
          {
            id: "a2",
            title: "P3 · Scope Drift detected in Provider Directory Epic",
            severity: "At risk",
            severityType: "critical",
            desc: "3 new sub-tasks added during dev sprint without PO story points",
            progress: 60,
          },
          {
            id: "a3",
            title: "P1 · Unassigned Story Dependencies for Sprint 43",
            severity: "Act now",
            severityType: "critical",
            desc: "2 Stories blocked until API spec is finalized by PO",
            progress: null,
          },
        ],
      },
      criticalRisks: {
        title: "Release & Feature Scope Risks",
        tag: "Sprint 42 Target",
        cards: [
          {
            id: "r1",
            title: "Release Target Slippage · Member Portal v3 delayed by 3 days",
            severity: "Critical",
            severityType: "critical",
            desc: "2 Epics blocked due to missing business compliance approval",
          },
          {
            id: "r2",
            title: "HIPAA Audit Trail Requirement Missing in Story #312",
            severity: "Elevated",
            severityType: "high",
            desc: "AI audit detector flagged missing data encryption story criteria",
          },
          {
            id: "r3",
            title: "Unapproved Feature Request Submitted by Business",
            severity: "Elevated",
            severityType: "high",
            desc: "Change request CR-991 needs PO evaluation before Sprint 43",
          },
        ],
      },
      askYourCoworker: {
        title: "Product Owner AI Co-pilot",
        sub: "User story generation, BDD acceptance criteria & backlog prioritization agent",
        botGreeting: "Hi PO! I have analyzed Epic-104 and generated BDD user stories.",
        headline: "14 user stories processed, 3 stories automatically enriched with Given-When-Then BDD acceptance criteria.",
        actionNeeded: "Story #409 (Member Claims Lookup) needs PO review on edge-case error handling requirements.",
        suggestedNext: "Review & approve AI-generated Acceptance Criteria for Story #409.",
        chatMode: "normal",
      },
      tabData: {
        epics: {
          title: "Epics & Feature Release Catalog",
          sub: "Manage enterprise epics, feature readiness scores & release roadmaps",
          items: [
            { id: "ep1", code: "EPIC-104", name: "Smart Claims Auto-Adjudication Flow", status: "Active", progress: 80, storiesCount: 10, valueScore: "9.8/10", lead: "Sarah Jenkins", desc: "Automate tier-1 medical claims processing using GenAI pattern matcher." },
            { id: "ep2", code: "EPIC-108", name: "Provider Portal Self-Service Onboarding", status: "At Risk", progress: 45, storiesCount: 8, valueScore: "9.2/10", lead: "Michael Ross", desc: "Streamline NPI registration and credential verification workflow." },
            { id: "ep3", code: "EPIC-112", name: "Member Telehealth Integration API", status: "In Refinement", progress: 20, storiesCount: 6, valueScore: "8.9/10", lead: "David Chen", desc: "Real-time virtual care visit scheduling and claims sync API." },
          ],
        },
        user_stories: {
          title: "User Story Backlog & AI Enrichment",
          sub: "Sprint 42 active stories with AI-generated acceptance criteria & story point estimates",
          items: [
            { id: "st1", code: "STORY-409", title: "Member Claims Instant Lookup API", points: 5, priority: "High", status: "In Review", acStatus: "Needs PO Sign-off", epic: "EPIC-104", desc: "As a member, I want to query my claim status in real-time so I can track payout progress." },
            { id: "st2", code: "STORY-412", title: "Prior-Authorization Auto-Approval Rules", points: 8, priority: "Critical", status: "In Progress", acStatus: "Approved by AI", epic: "EPIC-104", desc: "As a provider, I want instant prior-auth approval for routine procedures based on clinical rules." },
            { id: "st3", code: "STORY-415", title: "Provider Network Directory Search API", points: 3, priority: "Medium", status: "Backlog", acStatus: "Drafted", epic: "EPIC-108", desc: "As a patient, I want to search for in-network physicians by location and specialty." },
            { id: "st4", code: "STORY-418", title: "HIPAA Audit Log Encryption Service", points: 5, priority: "High", status: "Blocked", acStatus: "Pending AC Clarification", epic: "EPIC-112", desc: "As a compliance officer, I need all telehealth session logs encrypted at rest." },
            { id: "st5", code: "STORY-421", title: "Member Portal Password Reset Self-Service", points: 3, priority: "High", status: "In Progress", acStatus: "Approved", epic: "EPIC-104", desc: "As a member, I want to reset my account password using SMS MFA verification." },
            { id: "st6", code: "STORY-424", title: "Benefits & Deductible Accumulator Sync", points: 8, priority: "Critical", status: "In Review", acStatus: "Drafted", epic: "EPIC-104", desc: "As a member, I want my annual deductible balance updated within 2 seconds of claim payment." },
            { id: "st7", code: "STORY-427", title: "Explanation of Benefits (EOB) PDF Generator", points: 5, priority: "Medium", status: "Backlog", acStatus: "Approved", epic: "EPIC-104", desc: "As a member, I want to download my EOB statement as a secure PDF." },
            { id: "st8", code: "STORY-430", title: "Real-time Notification Webhook Engine", points: 5, priority: "High", status: "In Progress", acStatus: "Drafted", epic: "EPIC-108", desc: "As a provider, I want push notifications when a prior-authorization decision is posted." },
            { id: "st9", code: "STORY-433", title: "Provider NPI Credential Auto-Validator", points: 8, priority: "Critical", status: "In Review", acStatus: "Approved", epic: "EPIC-108", desc: "As an onboarding manager, I want automated verification of NPI numbers against CMS registry." },
            { id: "st10", code: "STORY-436", title: "Telehealth Appointment Booking Flow", points: 5, priority: "High", status: "In Progress", acStatus: "Drafted", epic: "EPIC-112", desc: "As a patient, I want to schedule a virtual doctor appointment directly from the portal." },
            { id: "st11", code: "STORY-439", title: "Premium Payment Gateway Integration", points: 8, priority: "High", status: "Backlog", acStatus: "Approved", epic: "EPIC-104", desc: "As a member, I want to pay monthly healthcare plan premiums via credit card or ACH." },
            { id: "st12", code: "STORY-442", title: "Prescription Refill Status Tracker", points: 3, priority: "Medium", status: "In Review", acStatus: "Drafted", epic: "EPIC-112", desc: "As a member, I want to track my mail-order prescription delivery status." },
            { id: "st13", code: "STORY-445", title: "Member ID Card Digital Wallet Export", points: 5, priority: "Low", status: "Backlog", acStatus: "Approved", epic: "EPIC-104", desc: "As a member, I want to export my insurance ID card to Apple Wallet & Google Wallet." },
            { id: "st14", code: "STORY-448", title: "Multi-Factor Auth (MFA) Push Challenge", points: 5, priority: "High", status: "In Progress", acStatus: "Drafted", epic: "EPIC-104", desc: "As a security engineer, I want biometric push authentication for sensitive member portal logins." },
          ],
        },
        acceptance_criteria: {
          title: "BDD Acceptance Criteria Workbench",
          sub: "Given-When-Then criteria validation generated by AI Requirements Agent",
          items: [
            { id: "ac1", story: "STORY-409", title: "Successful Claim Payout Retrieval Scenario", format: "GIVEN member ID M-9842100 is active WHEN member queries claim status THEN return claim payout details within 50ms with 200 OK.", status: "Verified" },
            { id: "ac2", story: "STORY-409", title: "Invalid Member Credentials Error Scenario", format: "GIVEN an expired auth token WHEN user requests claim data THEN return HTTP 401 Unauthorized with error code CLM-401.", status: "Needs Clarification" },
            { id: "ac3", story: "STORY-412", title: "High-Risk Procedure Escalation Scenario", format: "GIVEN a procedure code with cost > $5,000 WHEN evaluated by engine THEN route to human medical reviewer.", status: "Verified" },
            { id: "ac4", story: "STORY-415", title: "Provider Search Radius Location Scenario", format: "GIVEN member ZIP code 32256 WHEN searching in-network physicians THEN return results sorted by distance within 25 miles.", status: "Verified" },
            { id: "ac5", story: "STORY-418", title: "HIPAA Audit Encryption Verification Scenario", format: "GIVEN telehealth session log payload WHEN written to database THEN encrypt payload with AES-256-GCM before write.", status: "Verified" },
            { id: "ac6", story: "STORY-421", title: "Self-Service Password Reset Token Scenario", format: "GIVEN a valid SMS OTP code WHEN submitted by user THEN issue short-lived password reset token valid for 15 minutes.", status: "Verified" },
          ],
        },
      },
    },

    Developer: {
      topbar: {
        title: "AI for AD · Developer AI Workbench",
        subtitle: "GenAI Code Generation, Unit Test Synthesizer & Code Review Engine",
        platform: "AD-Dev",
        shift: "Active Development | Branch: `feature/claims-v2`",
        shiftProgress: "100%",
        statusBadge: "● CODE AI AGENT · LIVE",
      },
      summary: {
        greeting: "Good morning, Developer — 3 Pull Requests reviewed by AI Code Agent.",
        subtext: "12 commits analyzed · 98.4% unit test pass rate · 2 code suggestions ready for merge",
        chips: [
          { id: "c1", text: "PR #214 Approved by AI Reviewer", type: "info" },
          { id: "c2", text: "SonarQube Tech Debt: 0.4 days", type: "info" },
          { id: "c3", text: "2 Security Hotspots in claims-service.js", type: "danger" },
          { id: "c4", text: "Code Coverage: 91.2% (+2.4%)", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "pull_requests", label: "Pull Requests", badge: 3 },
        { id: "code_quality", label: "Code Quality", badge: 2 },
        { id: "test_synthesis", label: "Unit Tests", badge: 12 },
      ],
      stateOfEnvironment: {
        title: "Services & Branch Health",
        tag: "Branch `feature/claims-v2`",
        metrics: [
          { id: "m1", count: 1, label: "Failing Test", color: "red" },
          { id: "m2", count: 3, label: "Open PRs", color: "orange" },
          { id: "m3", count: 8, label: "Passing Builds", color: "blue" },
          { id: "m4", count: 14, label: "Services", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "claims-adjudication-service (Node.js/TypeScript)",
            status: "Warning",
            statusType: "warn",
            desc: "Memory leakage detected in load test · 1 failing unit test on async queue",
          },
          {
            id: "e2",
            title: "auth-token-gateway (Go)",
            status: "Healthy",
            statusType: "success",
            desc: "All 142 unit tests passing · Zero security vulnerabilities · 99ms build time",
          },
          {
            id: "e3",
            title: "member-notification-worker (Python/FastAPI)",
            status: "Healthy",
            statusType: "watch",
            desc: "Async queue throughput optimal · Coverage 94.8% · Clean SonarQube run",
          },
        ],
      },
      whatRequiresAttention: {
        title: "Code Reviews & Refactoring Alerts",
        tag: "3 Dev Action Items",
        cards: [
          {
            id: "a1",
            title: "P2 · Vulnerable Package Dependency in package.json",
            severity: "Act now",
            severityType: "critical",
            desc: "Claims-Service · npm audit found high risk in axios v0.21.1",
            progress: 80,
          },
          {
            id: "a2",
            title: "P3 · Code Duplication > 4% in claims-calculator.ts",
            severity: "Review",
            severityType: "review",
            desc: "Refactoring suggestion generated by AI code agent",
            progress: 45,
          },
          {
            id: "a3",
            title: "P2 · Unhandled Rejection in async webhook handler",
            severity: "At risk",
            severityType: "critical",
            desc: "Potential process exit crash under high network load",
            progress: null,
          },
        ],
      },
      criticalRisks: {
        title: "Build & Integration Blockers",
        tag: "CI/CD Pipeline",
        cards: [
          {
            id: "r1",
            title: "Build Failure on PR #219 (TypeScript Compilation Error)",
            severity: "Critical",
            severityType: "critical",
            desc: "Interface type mismatch in `MemberProfileResponse` struct",
          },
          {
            id: "r2",
            title: "API Contract Mismatch with Provider Gateway v1",
            severity: "Elevated",
            severityType: "high",
            desc: "Endpoint `/api/v1/provider` returned extra required header requirement",
          },
          {
            id: "r3",
            title: "Database Migration Script Missing Rollback Block",
            severity: "Elevated",
            severityType: "high",
            desc: "Migration `20260819_add_claims_index.sql` failed lint check",
          },
        ],
      },
      askYourCoworker: {
        title: "Developer AI Co-pilot",
        sub: "AI code generation, unit test synthesizer & refactoring agent",
        botGreeting: "Hey Dev! I analyzed your latest branch diff on `feature/claims-v2`.",
        headline: "Code quality score 94/100. 1 potential null dereference bug detected in `claimProcessor.ts:42`.",
        actionNeeded: "Review line 42 refactoring snippet and apply the auto-generated Jest unit tests.",
        suggestedNext: "Run `npm test` locally or click to auto-commit unit tests to your branch.",
        chatMode: "normal",
      },
      tabData: {
        pull_requests: {
          title: "Open Pull Requests & AI Review Workbench",
          sub: "Review code diffs, automated AI code reviews and CI check statuses",
          items: [
            { id: "pr1", num: "PR #214", title: "feat(claims): add real-time auto-adjudication engine", branch: "feature/claims-v2", status: "Approved by AI", statusType: "success", checks: "12/12 Passed", reviewScore: "96/100", author: "John Developer" },
            { id: "pr2", num: "PR #219", title: "fix(auth): update JWT token validation logic", branch: "fix/jwt-expiry", status: "Check Failed", statusType: "danger", checks: "11/12 Passed (TypeCheck Error)", reviewScore: "82/100", author: "Sarah Jenkins" },
            { id: "pr3", num: "PR #222", title: "refactor(notify): async SQS queue handler", branch: "refactor/queue", status: "In Review", statusType: "warn", checks: "12/12 Passed", reviewScore: "90/100", author: "Alex Mercer" },
          ],
        },
        code_quality: {
          title: "SonarQube & Static Code Analysis",
          sub: "Tech debt, code coverage, duplication index and security hotspots",
          items: [
            { id: "cq1", metric: "Technical Debt", value: "0.4 days", target: "< 1.0 day", status: "Pass", color: "green", desc: "Estimated effort to fix code smells across repository" },
            { id: "cq2", metric: "Code Duplication", value: "4.2%", target: "< 3.0%", status: "Warning", color: "orange", desc: "Duplicated lines found in `claims-calculator.ts`" },
            { id: "cq3", metric: "Security Hotspots", value: "2 Open", target: "0 Open", status: "Action Needed", color: "red", desc: "Hardcoded timeout threshold and unvalidated query string" },
          ],
        },
        test_synthesis: {
          title: "AI Unit Test Synthesizer",
          sub: "Auto-generated Jest & Go unit test suites with coverage reports",
          items: [
            { id: "ut1", module: "claimProcessor.ts", testsCount: 24, coverage: "94.2%", status: "Passing", generatedBy: "AI Test Agent", snippet: "describe('ClaimProcessor', () => { it('should process valid claim', async () => {...}) })" },
            { id: "ut2", module: "authGateway.go", testsCount: 18, coverage: "98.5%", status: "Passing", generatedBy: "AI Test Agent", snippet: "func TestValidateToken(t *testing.T) { token := generateValidToken()... }" },
            { id: "ut3", module: "paymentWebhook.ts", testsCount: 12, coverage: "78.0%", status: "Failing (1)", generatedBy: "AI Test Agent", snippet: "it('should handle unhandled rejection', async () => { expect(retry()).rejects.toThrow() })" },
          ],
        },
      },
    },

    Tester: {
      topbar: {
        title: "AI for AD · Test Engineering Portal",
        subtitle: "GenAI Test Case Generator, Playwright Auto-Healing & Regression Suite Engine",
        platform: "AD-QA",
        shift: "Release Regression Suite | Target: Staging",
        shiftProgress: "95%",
        statusBadge: "● QA AUTOMATION ENGINE · LIVE",
      },
      summary: {
        greeting: "Good morning, Tester — Automated Test Suite execution completed.",
        subtext: "412 automated tests run · 96.8% Pass Rate · 3 Regression defects auto-logged",
        chips: [
          { id: "c1", text: "Regression Pass Rate: 96.8%", type: "info" },
          { id: "c2", text: "3 Failed Test Cases on Chrome", type: "danger" },
          { id: "c3", text: "API Edge Case Coverage: 94.5%", type: "info" },
          { id: "c4", text: "Performance SLA: 180ms avg response", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "test_suites", label: "Test Suites", badge: 8 },
        { id: "defects", label: "Auto Defects", badge: 3 },
        { id: "coverage", label: "API Coverage", badge: 94 },
      ],
      stateOfEnvironment: {
        title: "Test Environment & Suite Status",
        tag: "Staging Environment",
        metrics: [
          { id: "m1", count: 3, label: "Failures", color: "red" },
          { id: "m2", count: 12, label: "In Progress", color: "orange" },
          { id: "m3", count: 84, label: "Passed", color: "blue" },
          { id: "m4", count: 5, label: "Skipped", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "E2E Playwright Regression Suite (Web & Mobile)",
            status: "3 Failed",
            statusType: "danger",
            desc: "Selector timeout on Payment Checkout modal (`#btn-submit` missing)",
          },
          {
            id: "e2",
            title: "RestAssured API Integration Suite",
            status: "100% Passed",
            statusType: "success",
            desc: "156 endpoints verified · Average response time 145ms",
          },
          {
            id: "e3",
            title: "JMeter Load & Stress Test (10k VUsers)",
            status: "Passed",
            statusType: "watch",
            desc: "P99 latency 240ms under target 500ms · 0 error rate",
          },
        ],
      },
      whatRequiresAttention: {
        title: "Test Automation Defect Alerts",
        tag: "3 QA Action Items",
        cards: [
          {
            id: "a1",
            title: "P1 · Flaky Test Alert in Claims Submission Flow",
            severity: "Act now",
            severityType: "critical",
            desc: "Playwright test `claims-checkout.spec.ts` failed twice due to dynamic DOM id",
            progress: 90,
          },
          {
            id: "a2",
            title: "P2 · Missing Test Scenarios for Member Edge Cases",
            severity: "Review",
            severityType: "review",
            desc: "12 unmapped user story paths flagged by AI Coverage Analyzer",
            progress: 65,
          },
          {
            id: "a3",
            title: "P3 · Staging Test Data Refresh Required",
            severity: "At risk",
            severityType: "critical",
            desc: "Member eligibility test dataset expired in Staging DB Cluster B",
            progress: null,
          },
        ],
      },
      criticalRisks: {
        title: "Release Quality & Defect Blockers",
        tag: "Release 4.2 Target",
        cards: [
          {
            id: "r1",
            title: "Release Blocker · Defect #DEF-881 open in Claims Calculation",
            severity: "Critical",
            severityType: "critical",
            desc: "P1 calculation discrepancy detected during edge-case validation",
          },
          {
            id: "r2",
            title: "Test Data Exhaustion in Staging Database Cluster B",
            severity: "Elevated",
            severityType: "high",
            desc: "Synthetic claims data pool exhausted, auto-seed required",
          },
          {
            id: "r3",
            title: "Cross-Browser Layout Mismatch on iOS Safari Mobile",
            severity: "Elevated",
            severityType: "high",
            desc: "Visual regression AI detected CSS flex overflow on checkout screen",
          },
        ],
      },
      askYourCoworker: {
        title: "AI QA Automation Assistant",
        sub: "Playwright test auto-healing, synthetic data generator & defect logging agent",
        botGreeting: "Hi Tester! I executed the automated Playwright regression suite.",
        headline: "412 test cases executed. 3 failures detected in Checkout UI due to updated DOM selector names.",
        actionNeeded: "Auto-healing script ready: updates selector `#btn-submit` to `[data-testid='submit-claims']`.",
        suggestedNext: "Approve auto-healing test selectors & re-run Playwright suite.",
        chatMode: "normal",
      },
      tabData: {
        test_suites: {
          title: "Automated Test Suites Execution",
          sub: "Playwright E2E, RestAssured API and JMeter performance test run reports",
          items: [
            { id: "ts1", suite: "Playwright E2E Regression", framework: "Playwright / TS", total: 180, passed: 177, failed: 3, passRate: "98.3%", duration: "8m 12s" },
            { id: "ts2", suite: "REST Integration Test Suite", framework: "RestAssured / Java", total: 156, passed: 156, failed: 0, passRate: "100%", duration: "3m 45s" },
            { id: "ts3", suite: "Performance & Stress Test", framework: "JMeter / Distributed", total: 76, passed: 76, failed: 0, passRate: "100%", duration: "15m 00s" },
          ],
        },
        defects: {
          title: "Auto-Logged Regression Defects",
          sub: "Defects identified by AI Test Execution Agent with DOM locator repair scripts",
          items: [
            { id: "df1", code: "DEF-881", title: "Checkout Submit Button Locator Timeout", severity: "P1 Blocker", component: "Claims Checkout UI", status: "Auto-Fix Ready", action: "Apply Playwright locator patch `[data-testid='submit-claims']`" },
            { id: "df2", code: "DEF-884", title: "Claims Adjudication Math Discrepancy", severity: "P2 High", component: "Claims-Calculation-Engine", status: "Open (Assigned Dev)", action: "Investigate rounding precision logic on line 88" },
            { id: "df3", code: "DEF-889", title: "iOS Safari Flex Layout Mismatch", severity: "P3 Medium", component: "Member Mobile Web", status: "In Review", action: "Visual regression AI detected 12px overflow" },
          ],
        },
        coverage: {
          title: "API Endpoint & Business Scenario Coverage",
          sub: "Test coverage metrics and unmapped user story path analysis",
          items: [
            { id: "cov1", area: "Claims Processing Endpoints", endpointsCovered: "42/45", scenarioCoverage: "93.3%", status: "Good", gapNote: "3 edge-case error handlers missing tests" },
            { id: "cov2", area: "Provider Authorization APIs", endpointsCovered: "28/28", scenarioCoverage: "100%", status: "Optimal", gapNote: "All happy paths and failure paths verified" },
            { id: "cov3", area: "Member Eligibility Lookup", endpointsCovered: "18/20", scenarioCoverage: "90.0%", status: "Warning", gapNote: "Out-of-state provider scenarios missing synthetic data" },
          ],
        },
      },
    },
  },

  "AI for AMS": {
    "Support Engineer": {
      topbar: {
        title: "AI for AMS · Support Engineering & Incident Operations Desk",
        subtitle: "GenAI First-Response Assistant, Triage Automation & Customer Query Desk",
        platform: "AMS-SE",
        shift: "Support Operations Shift | Day · 08:00 - 16:00 ET",
        shiftProgress: "30%",
        statusBadge: "● SUPPORT BOT MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, Support Engineer — Shift queue is active.",
        subtext: "28 incoming tickets · 18 auto-resolved by Chatbot · 6 items need triage decision",
        chips: [
          { id: "c1", text: "Auto-Resolution Rate 64.2%", type: "info" },
          { id: "c3", text: "Password Reset Automation 100%", type: "info" },
          { id: "c4", text: "First Contact Resolution 4.2 min", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "agent_resolve", label: "Agent Resolve", badge: 2 },
        { id: "vulnerabilities", label: "Vulnerabilities", badge: 3 },
        { id: "insights", label: "Insights", badge: 4 },
      ],
      tabData: {
        agent_resolve: {
          title: "AI Agent Resolve & Automated Executions",
          sub: "Log of 2 batch support tickets requiring automated AI execution today",
          items: [
            { id: "ar1", num: "INC009405", subject: "Batch Job Failure — Auto-Restart Required", desc: "Nightly batch job encountered an exception and stalled. AI auto-restart and lock clearance ready.", system: "Batch Job Scheduler", resolution: "Automated Batch Job Restart & Lock Clearance", status: "Action Required", statusType: "warn", isIgnio: true, actionLabel: "Auto Restart", batchTag: "Batch Job Auto-Restart" },
            { id: "ar2", num: "RITM004120", subject: "Member Enrollment Batch Stalled — Auto-Resume Required", desc: "Overnight HR member sign-up batch feed paused due to file lock. AI auto-resume ready.", system: "HR Enrollment Batch Service", resolution: "Automated Member Enrollment Batch Resume", status: "Action Required", statusType: "warn", isIgnio: true, actionLabel: "Auto Resume", batchTag: "Enrollment Batch Resume" },
          ],
        },
        vulnerabilities: {
          title: "AMS Vulnerabilities & Security Findings",
          sub: "Security vulnerability scans, CVE patches & compliance telemetry",
          items: [
            { id: "kb1", code: "CVE-2026-104", title: "Member Portal Authentication Token Expiry Vulnerability", category: "Security & Auth", views: 1420, confidence: "Patch Ready", status: "Critical" },
            { id: "kb2", code: "CVE-2026-210", title: "Claims Gateway SQL Connection Parameter Exposure", category: "Database Security", views: 890, confidence: "Mitigated", status: "Moderate" },
            { id: "kb3", code: "CVE-2026-901", title: "EDI 837 Batch Parser Buffer Overflow Risk", category: "Pipeline Security", views: 320, confidence: "Scanning", status: "Warning" },
          ],
        },
        insights: {
          title: "AMS Insights Workspace",
          sub: "Analytics, intelligence & AI insights desk",
          items: [
            { id: "ins1", code: "INS-901", title: "High Incident Volume Spike Detected in EDI Ingestion", category: "Pattern Analysis", confidence: "96% Match", status: "High Priority", statusType: "warn", desc: "AI identified 34% rise in batch validation timeouts on Mondays between 08:00–10:00 EST." },
            { id: "ins2", code: "INS-902", title: "Password Reset Runbook FCR Optimization", category: "Automation ROI", confidence: "42% Reduction", status: "Positive Trend", statusType: "good", desc: "Chatbot password self-service has reduced L1 support ticket volume by 42% this month." },
            { id: "ins3", code: "INS-903", title: "Database Read Replica Latency Anomaly", category: "Performance Telemetry", confidence: "88% Correlation", status: "Monitor Needed", statusType: "warn", desc: "Read replica query response times peak at 1.4s during peak claims report export hours." },
            { id: "ins4", code: "INS-904", title: "API Gateway OAuth Token Renewal Efficiency", category: "Security & Gateway", confidence: "95% Coverage", status: "Optimized", statusType: "good", desc: "Redis token caching improved API gateway response times from 120ms to 8ms for 95% of requests." },
          ],
        },
      },
      stateOfEnvironment: {
        title: "Support Incident & Query Queues",
        tag: "Live Support Monitoring",
        metrics: [
          { id: "m1", count: "28", label: "Active Tickets", color: "blue" },
          { id: "m2", count: "18", label: "Auto-Resolved", color: "green" },
          { id: "m3", count: "6", label: "Needs Triage", color: "gold" },
          { id: "m4", count: "4", label: "Escalated to L2/SWE", color: "purple" },
        ],
        items: [
          { id: "e1", title: "INC-9941: Member Portal Authentication Failure", status: "Active Triage", statusType: "active", desc: "GenAI Bot identified OAuth token expiry. Suggested Auto-Reset flow to user." },
          { id: "e2", title: "INC-9938: Claims History Loading Delay", status: "In Progress", statusType: "warn", desc: "High database latency on read replica. Chatbot dispatched query cache clear request." },
          { id: "e3", title: "INC-9935: Password Reset Verification SMS Delay", status: "Auto-Resolved", statusType: "good", desc: "Twilio webhook retried successfully. Bot notified member via email." },
        ],
      },
      whatRequiresAttention: {
        title: "Triage Items Requiring Support Action",
        tag: "Action Required",
        cards: [
          { id: "w1", title: "INC-9941 · Review GenAI Auto-Response draft", desc: "Draft ready for 1-click approval before sending to customer.", type: "action", progress: 85 },
          { id: "w2", title: "INC-9920 · Priority Escalation to Software Engineering", desc: "Database deadlock requires SWE kernel patch review.", type: "warn", progress: 40 },
        ],
      },
      criticalRisks: {
        title: "SLA Watch & System Operational Risks",
        tag: "SLA Monitor",
        cards: [
          { id: "r1", title: "SLA Warning · INC-9941 (12m remaining)", severity: "P2 - High", severityType: "warn", desc: "First response time approaching 15-minute SLA limit." },
          { id: "r2", title: "EDI 837 Batch Parser Backlog", severity: "P3 - Moderate", severityType: "normal", desc: "Queue size increased by 15% over last hour." },
        ],
      },
    },

    "Software Engineer": {
      topbar: {
        title: "AI for AMS · Software Engineering & Hotfix Desk",
        subtitle: "GenAI Core Patching, DB Kernel Tuning & Complex Code Hotfix Workbench",
        platform: "AMS-SWE",
        shift: "Software Engineering Shift | Active",
        shiftProgress: "30%",
        statusBadge: "● HOTFIX AGENT MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, Software Engineer — 2 core code hotfixes pending architecture review.",
        subtext: "2 Deep Root Cause Investigations · 5 DB Query Optimizations · 1 Core Patch in Staging",
        chips: [
          { id: "c1", text: "Core Hotfix #HF-892 ready for Staging", type: "info" },
          { id: "c2", text: "DB Index Optimization +45% throughput", type: "info" },
          { id: "c3", text: "Zero Zero-day Security Vulnerabilities", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "code_hotfixes", label: "Hotfixes & Patches", badge: 4 },
        { id: "rca_investigations", label: "RCA Workbench", badge: 2 },
        { id: "architecture_reviews", label: "Architecture Reviews", badge: 3 },
        { id: "insights", label: "Insights", badge: 4 },
      ],
      tabData: {
        code_hotfixes: {
          title: "AI Core Code Hotfixes & Patch Workbench",
          sub: "Log of 4 active software patches and hotfixes under engineering review",
          items: [
            { id: "hf1", code: "HF-892", title: "Connection Pool Leak Fix in Member Portal Auth Service", category: "Hotfix Patch", confidence: "100% Tests Pass", status: "Staging Ready", statusType: "good", desc: "Optimized HikariCP connection lifecycle in auth worker threads. 100% regression test pass rate." },
            { id: "hf2", code: "HF-889", title: "Claims Adjudication Memory Leak Patch", category: "Core Patch", confidence: "RCA Verified", status: "In Review", statusType: "warn", desc: "Cleared static collection memory reference holding 50k transaction payload objects during batch runs." },
            { id: "hf3", code: "HF-874", title: "EDI 837 X12 Parser Null Check Guard", category: "Bug Fix", confidence: "Deployed", status: "Resolved", statusType: "good", desc: "Added null assertion for optional provider NPI suffix field in claim header validation logic." },
            { id: "hf4", code: "HF-865", title: "OAuth Gateway Token Refresh Deadlock Fix", category: "Security Hotfix", confidence: "Pending QA", status: "In Progress", statusType: "warn", desc: "Refactored async token exchange lock to prevent gateway HTTP 504 timeouts under peak concurrency." },
          ],
        },
        rca_investigations: {
          title: "Root Cause Analysis (RCA) Engineering Workbench",
          sub: "AI-assisted deep diagnostics and anomaly root cause investigations",
          items: [
            { id: "rca1", code: "RCA-301", title: "Claims Database Connection Timeout Investigation", category: "Deep RCA", confidence: "94% Match", status: "Root Cause Found", statusType: "good", desc: "Unreleased row locks in claims_tbl during concurrent retry spikes. Patch HF-892 deployed to staging." },
            { id: "rca2", code: "RCA-304", title: "Member Portal 504 Gateway Timeout Diagnostics", category: "Performance RCA", confidence: "88% Match", status: "In Analysis", statusType: "warn", desc: "Redis cache connection pool saturation during peak Monday morning login traffic windows." },
          ],
        },
        architecture_reviews: {
          title: "Architecture & System Design Reviews",
          sub: "Engineering design proposals, AI patch safety reviews & structural updates",
          items: [
            { id: "arch1", code: "ARCH-104", title: "GenAI Automated Code Patching Architecture Review", category: "AI Architecture", confidence: "Approved", status: "Approved", statusType: "good", desc: "Design review for automated PR creation and AST safety validation guards in CI/CD pipeline." },
            { id: "arch2", code: "ARCH-109", title: "High-Throughput Claims Ingestion Service Redesign", category: "System Design", confidence: "Under Review", status: "In Review", statusType: "warn", desc: "Transitioning claims parser worker queue from Kafka to AWS SQS with dead-letter queue fallback." },
            { id: "arch3", code: "ARCH-112", title: "Zero-Trust Auth Token Refresh Pattern", category: "Security Architecture", confidence: "Approved", status: "Approved", statusType: "good", desc: "Short-lived JWT tokens with distributed Redis token revocation list for enhanced gateway security." },
          ],
        },
        insights: {
          title: "Software Engineering Insights Workspace",
          sub: "Engineering velocity metrics, patch reliability & system optimization telemetry",
          items: [
            { id: "ins801", code: "INS-801", title: "Hotfix Lead Time Reduced by 65% with AI Assistance", category: "Engineering Velocity", confidence: "65% Faster", status: "High Impact", statusType: "good", desc: "Average hotfix deployment time dropped from 4.2 hours to 1.2 hours across all AMS services." },
            { id: "ins802", code: "INS-802", title: "Zero Memory Leaks Detected in Staging Regression Runs", category: "Quality Assurance", confidence: "100% Pass Rate", status: "Verified", statusType: "good", desc: "Heap dump analysis confirms zero memory growth over 24-hour continuous load testing." },
            { id: "ins803", code: "INS-803", title: "Database Query Index Efficiency Report", category: "DB Tuning", confidence: "78% Scan Cut", status: "Optimized", statusType: "good", desc: "Composite index addition reduced claims table full scan times by 78% during peak hours." },
            { id: "ins804", code: "INS-804", title: "Automated Regression Test Suite Coverage Spike", category: "Test Coverage", confidence: "94% Coverage", status: "High Quality", statusType: "good", desc: "Automated Playwright & Jest regression suites now cover 94% of core AMS software workflows." },
          ],
        },
      },
      stateOfEnvironment: {
        title: "Software Engineering Hotfix Pipelines",
        tag: "Live Engineering",
        metrics: [
          { id: "m1", count: "4", label: "Active Patches", color: "blue" },
          { id: "m2", count: "2", label: "Deep RCAs", color: "purple" },
          { id: "m3", count: "98.8%", label: "Patch Success Rate", color: "green" },
          { id: "m4", count: "1.2h", label: "Avg Hotfix Time", color: "gold" },
        ],
        items: [
          { id: "e1", title: "HF-892: Connection Pool Exhaustion Fix", status: "Staging Testing", statusType: "active", desc: "Increased HikariCP max pool size and optimized unclosed ResultSet leaks." },
          { id: "e2", title: "HF-889: Claims Adjudication Memory Leak", status: "RCA Completed", statusType: "good", desc: "GenAI identified static collection holding reference to 50k transaction payloads." },
        ],
      },
      whatRequiresAttention: {
        title: "Patches & Code Reviews Needing Action",
        tag: "Action Required",
        cards: [
          { id: "w1", title: "Approve PR #1042 · HikariCP Connection Pool Fix", desc: "Passed automated regression suite (142 tests passed).", type: "action", progress: 95 },
          { id: "w2", title: "Verify Memory Leak Fix under Load Test", desc: "Execute 10k concurrent claims load simulation.", type: "warn", progress: 70 },
        ],
      },
      criticalRisks: {
        title: "Engineering Security & Architecture Risks",
        tag: "High Risk",
        cards: [
          { id: "r1", title: "HikariCP Deadlock under High Concurrency", severity: "P1 - Critical", severityType: "danger", desc: "Could cause cascading service degradation during peak hours." },
        ],
      },
    },

    "L1 Support Engineer": {
      topbar: {
        title: "AI for AMS · L1 Operations & Incident Desk",
        subtitle: "GenAI First-Response Assistant, Triage Automation & Customer Query Desk",
        platform: "AMS-L1",
        shift: "L1 Operational Shift | Day · 08:00 - 16:00 ET",
        shiftProgress: "30%",
        statusBadge: "● L1 BOT MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, L1 Engineer — Shift queue is active.",
        subtext: "28 incoming tickets · 18 auto-resolved by Chatbot · 6 items need L1 triage decision",
        chips: [
          { id: "c1", text: "Auto-Resolution Rate 64.2%", type: "info" },
          { id: "c3", text: "Password Reset Automation 100%", type: "info" },
          { id: "c4", text: "First Contact Resolution 4.2 min", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "agent_resolve", label: "Agent Resolve", badge: 6 },
        { id: "vulnerabilities", label: "Vulnerabilities", badge: 3 },
        { id: "insights", label: "Insights", badge: null },
      ],
      stateOfEnvironment: {
        title: "L1 Incident & Query Queues",
        tag: "Live L1 Monitoring",
        metrics: [
          { id: "m1", count: 1, label: "Escalated", color: "red" },
          { id: "m2", count: 4, label: "Active", color: "orange" },
          { id: "m3", count: 12, label: "Pending", color: "blue" },
          { id: "m4", count: 45, label: "Resolved", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "INC009412 - User unable to log into Member Portal",
            status: "Triage Needed",
            statusType: "danger",
            desc: "AI KB Article match 98% · Password reset resolution script ready",
          },
          {
            id: "e2",
            title: "INC009418 - Batch Report Export Delay Query",
            status: "Watch",
            statusType: "warn",
            desc: "Automated status notification sent to user · Awaiting queue drain",
          },
          {
            id: "e3",
            title: "RITM004120 - VPN Access Request Approval",
            status: "Auto-Approved",
            statusType: "success",
            desc: "Automated Okta workflow executed in 12 seconds · User notified",
          },
        ],
      },
      whatRequiresAttention: {
        title: "Tickets Requiring L1 Action",
        tag: "3 L1 Tasks",
        cards: [
          {
            id: "a1",
            title: "P3 · Ticket INC009412 approaching SLA response clock",
            severity: "Act now",
            severityType: "critical",
            desc: "Member Portal Login · 12 minutes remaining before SLA breach",
            progress: 85,
          },
          {
            id: "a2",
            title: "P4 · High volume of account unlock requests (Region East)",
            severity: "Review",
            severityType: "review",
            desc: "14 user queries grouped by AI Assistant · Auto-unlock runbook suggested",
            progress: 50,
          },
          {
            id: "a3",
            title: "P3 · Customer CSAT Rating Follow-up required",
            severity: "At risk",
            severityType: "critical",
            desc: "Ticket INC009380 closed with 2/5 rating · L1 call back pending",
            progress: null,
          },
        ],
      },
      criticalRisks: {
        title: "L1 SLA & Support Risks",
        tag: "Active Queue",
        cards: [
          {
            id: "r1",
            title: "SLA Response Breach Risk in 12m on Ticket INC009412",
            severity: "Critical",
            severityType: "critical",
            desc: "First response clock expiring · Runbook ready for L1 execution",
          },
          {
            id: "r2",
            title: "Knowledge Base Article Gap for SSO Login Flow",
            severity: "Elevated",
            severityType: "high",
            desc: "18 queries failed automated resolution due to outdated KB #KB-901",
          },
          {
            id: "r3",
            title: "Telephony Queue Spillover in Call Center Hub",
            severity: "Elevated",
            severityType: "high",
            desc: "Average wait time increased to 6.5 mins for tier-1 support calls",
          },
        ],
      },
      askYourCoworker: {
        title: "L1 Conversational Support Assistant",
        sub: "First-line ticket triage, KB search & automated runbook execution agent",
        botGreeting: "Hi L1 Engineer! I am managing incoming user tickets and chat triage.",
        headline: "18 routine tickets auto-resolved today. INC009412 requires your verification before auto-closing.",
        actionNeeded: "Confirm user password reset resolution and trigger automated customer resolution message.",
        suggestedNext: "Execute 1-click password reset runbook and resolve ticket INC009412.",
        chatMode: "normal",
      },
      tabData: {
        incoming_triage: {
          title: "L1 Triage Queue & Customer Tickets",
          sub: "Incoming support tickets requiring L1 verification, runbook execution or escalation",
          items: [
            { id: "t1", num: "INC009412", subject: "User unable to log into Member Portal", user: "John Smith (Member)", priority: "P3", slaTimer: "12 mins remaining", kbMatch: "98% (#KB-104)", status: "Needs Action" },
            { id: "t2", num: "INC009418", subject: "Batch Report Export Timeout on Dashboard", user: "Maria Garcia (Internal)", priority: "P4", slaTimer: "2h 15m remaining", kbMatch: "85% (#KB-210)", status: "In Triage" },
            { id: "t3", num: "RITM004125", subject: "Software License Request for Figma", user: "David Lee (Design)", priority: "P4", slaTimer: "4h 00m remaining", kbMatch: "100% (Auto Approval)", status: "Pending Action" },
          ],
        },
        agent_resolve: {
          title: "AI Agent Resolve & Automated Executions",
          sub: "Log of 2 batch support tickets requiring automated AI execution today",
          items: [
            { id: "ar1", num: "INC009405", subject: "Batch Job Failure — Auto-Restart Required", system: "Batch Job Scheduler", resolution: "Automated Batch Job Restart & Lock Clearance", status: "Action Required", statusType: "warn", isIgnio: true, actionLabel: "Auto Restart", batchTag: "Batch Job Auto-Restart" },
            { id: "ar2", num: "RITM004120", subject: "Member Enrollment Batch Stalled — Auto-Resume Required", system: "HR Enrollment Batch Service", resolution: "Automated Member Enrollment Batch Resume", status: "Action Required", statusType: "warn", isIgnio: true, actionLabel: "Auto Resume", batchTag: "Enrollment Batch Resume" },
          ],
        },
        vulnerabilities: {
          title: "AMS Vulnerabilities & Security Findings",
          sub: "Security vulnerability scans, CVE patches & compliance telemetry",
          items: [
            { id: "kb1", code: "CVE-2026-104", title: "Member Portal Password & MFA Token Vulnerability", category: "Auth & Identity", views: 1420, confidence: "98% Patch Ready", status: "Active" },
            { id: "kb2", code: "CVE-2026-210", title: "Report Export Queue Parameter Tampering Scan", category: "BI & Analytics", views: 890, confidence: "85% Mitigated", status: "Active" },
            { id: "kb3", code: "CVE-2026-901", title: "Legacy Single Sign-On (SSO) Cipher Weakness", category: "Security", views: 320, confidence: "62% Scan In Progress", status: "Needs Update" },
          ],
        },
      },
    },

    "L2 Support Engineer": {
      topbar: {
        title: "AI for AMS · L2 Application Support & PRD Desk",
        subtitle: "GenAI Root Cause Diagnostics, Problem Engineering & Automatic PRD Generator",
        platform: "AMS-L2",
        shift: "L2 Escalation & Problem Engineering | Active",
        shiftProgress: "30%",
        statusBadge: "● L2 DIAGNOSTIC & PRD MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, L2 Engineer — 4 escalated P2/P3 incidents awaiting investigation.",
        subtext: "4 system telemetry alerts · 12 diagnostic runbooks executed · PRD Generator ready",
        chips: [
          { id: "c1", text: "P2 Resolution SLA: 2h 45m remaining", type: "danger" },
          { id: "c2", text: "RCA AI Confidence: 92%", type: "info" },
          { id: "c3", text: "PRD Generator Active", type: "info" },
          { id: "c4", text: "Recurring Incident Cluster Identified", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "root_cause", label: "Root Cause Diagnostics", badge: 4 },
        { id: "prd_generator", label: "PRD Generator Workbench", badge: 2 },
        { id: "problem_tickets", label: "Problem Tickets", badge: 8 },
      ],
      stateOfEnvironment: {
        title: "Tier-2 Service Health & Major Escalations",
        tag: "L2 Problem Management",
        metrics: [
          { id: "m1", count: 2, label: "Critical", color: "red" },
          { id: "m2", count: 4, label: "High", color: "orange" },
          { id: "m3", count: 8, label: "Medium", color: "blue" },
          { id: "m4", count: 15, label: "Low", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "INC008954 - Claims Processing Service Timeout",
            status: "Investigating",
            statusType: "danger",
            desc: "Logs parsed by AI · DB deadlock identified in `claims_tbl_lock`",
          },
          {
            id: "e2",
            title: "PRB003210 - Recurring Memory Spike on Payment Worker",
            status: "RCA Completed",
            statusType: "warn",
            desc: "AI Root Cause Analysis ready · Auto PRD generation draft available for AD team",
          },
          {
            id: "e3",
            title: "INC009012 - EDI 837 Parse Exception Rate Spike",
            status: "Diagnosed",
            statusType: "watch",
            desc: "Bad payload schema from Partner X · Workaround script ready",
          },
        ],
      },
      whatRequiresAttention: {
        title: "L2 Problem & PRD Action Items",
        tag: "3 L2 Actions",
        cards: [
          {
            id: "a1",
            title: "P2 · INC008954 Database Deadlock requires L2 script execution",
            severity: "Act now",
            severityType: "critical",
            desc: "Claims processing queue halted · Lock clearance runbook ready",
            progress: 90,
          },
          {
            id: "a2",
            title: "P3 · Generate PRD Document for Recurring Memory Leak Bug",
            severity: "Review",
            severityType: "review",
            desc: "PRB003210 requires formal PRD handoff to AD Development Team",
            progress: 60,
          },
          {
            id: "a3",
            title: "P2 · Database connection pool exhaustion on Staging-2",
            severity: "At risk",
            severityType: "critical",
            desc: "Pool size limit 100/100 reached · Connection leak suspected",
            progress: null,
          },
        ],
      },
      criticalRisks: {
        title: "L2 Service Stability Risks",
        tag: "Escalation Queue",
        cards: [
          {
            id: "r1",
            title: "SLA Risk · INC008954 SLA clock expiring in 2h 45m",
            severity: "Critical",
            severityType: "critical",
            desc: "Tier-2 resolution clock active · Senior engineer escalation pending",
          },
          {
            id: "r2",
            title: "3 Recurring Incidents mapped to single PRB003210 Problem Ticket",
            severity: "Elevated",
            severityType: "high",
            desc: "Payment worker crash recurring every 6 hours under peak load",
          },
          {
            id: "r3",
            title: "API Error Rate > 2.5% on Payment Gateway Integration",
            severity: "Elevated",
            severityType: "high",
            desc: "Third-party payment gateway HTTP 504 Gateway Timeouts",
          },
        ],
      },
      askYourCoworker: {
        title: "L2 Diagnostic & PRD Generator Assistant",
        sub: "Deep root cause analyzer, telemetry correlation & automated PRD generator",
        botGreeting: "Hello L2 Engineer! I can diagnose complex incidents or generate formal PRD documents for bug fixes.",
        headline: "4 escalations active. RCA for PRB003210 completed with 92% confidence. PRD document template auto-generated.",
        actionNeeded: "Review AI-generated PRD draft for the memory leak fix and submit to AD Development Team.",
        suggestedNext: "Click 'Generate PRD Document' or chat below to refine root-cause details.",
        chatMode: "prd_generate",
      },
      tabData: {
        root_cause: {
          title: "AI Root Cause Analysis & Diagnostic Telemetry",
          sub: "Automated log parsing, stack trace correlation and incident telemetry analysis",
          items: [
            { id: "rc1", num: "INC008954", title: "Claims Processing DB Deadlock", rcaSummary: "Unreleased row locks in `claims_tbl_lock` during concurrent batch retries", confidence: "94%", status: "Diagnosed", recommendation: "Run lock clearance script & apply connection pool patch" },
            { id: "rc2", num: "PRB003210", title: "Payment Worker Memory Growth", rcaSummary: "Heap memory leak (~45MB/hr) caused by unclosed DB cursors in Fastify webhook", confidence: "92%", status: "RCA Complete", recommendation: "Generate PRD for AD development team fix" },
            { id: "rc3", num: "INC009012", title: "EDI 837 Parse Exception Spike", rcaSummary: "Partner X payload missing mandatory segment `CLM05-1` in header", confidence: "89%", status: "Workaround Ready", recommendation: "Apply payload auto-formatter middleware" },
          ],
        },
        prd_generator: {
          title: "Automated PRD Generator Workbench",
          sub: "Generate formal Product Requirement Documents for recurring AMS problem tickets and hand off to AD",
          items: [
            { id: "prd1", prbCode: "PRB003210", title: "PRD: Fix Memory Leak in Payment Worker Microservice", status: "Draft Ready", targetTeam: "AD Claims Squad", priority: "P2", action: "Review & Sync to Jira" },
            { id: "prd2", prbCode: "PRB003185", title: "PRD: Implement DB Connection Pool Retry Backoff", status: "Handed Off", targetTeam: "AD Core Squad", priority: "P3", action: "View Jira Ticket AD-842" },
          ],
        },
        problem_tickets: {
          title: "Problem Management & Recurring Clusters",
          sub: "Grouped incident clusters mapped to root cause problem tickets",
          items: [
            { id: "pt1", code: "PRB003210", title: "Payment Worker Heap Memory Growth", incidentsCount: 4, impact: "Medium", owner: "L2 Lead", status: "PRD Drafted" },
            { id: "pt2", code: "PRB003215", title: "EDI Gateway Socket Connection Reset", incidentsCount: 6, impact: "High", owner: "L2 Network Ops", status: "Vendor Escalated" },
          ],
        },
      },
    },

    "L3 Support Engineer": {
      topbar: {
        title: "AI for AMS · L3 Deep Engineering & Hotfix Desk",
        subtitle: "GenAI Core Patching, DB Kernel Tuning & Complex Code Hotfix Workbench",
        platform: "AMS-L3",
        shift: "L3 Core Engineering & Architecture | Active",
        shiftProgress: "30%",
        statusBadge: "● L3 HOTFIX AGENT MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, L3 Engineer — 2 core code hotfixes pending architecture review.",
        subtext: "2 Deep Root Cause Investigations · 5 DB Query Optimizations · 1 Core Patch in Staging",
        chips: [
          { id: "c1", text: "Core Hotfix #HF-892 ready for Staging", type: "info" },
          { id: "c2", text: "DB Index Optimization +45% throughput", type: "info" },
          { id: "c3", text: "Zero Zero-day Security Vulnerabilities", type: "warn" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "core_hotfixes", label: "Core Hotfixes", badge: 2 },
        { id: "db_tuning", label: "DB Kernel Tuning", badge: 5 },
        { id: "patch_reviews", label: "Patch Reviews", badge: 3 },
      ],
      stateOfEnvironment: {
        title: "Enterprise Core Systems & Database Health",
        tag: "L3 Core Systems",
        metrics: [
          { id: "m1", count: 0, label: "Critical", color: "red" },
          { id: "m2", count: 1, label: "High", color: "orange" },
          { id: "m3", count: 3, label: "Medium", color: "blue" },
          { id: "m4", count: 24, label: "Healthy", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "Core Database Cluster A (PostgreSQL 16)",
            status: "Optimization Needed",
            statusType: "warn",
            desc: "P99 Query Latency 420ms · Deadlock condition patched in hotfix #HF-892",
          },
          {
            id: "e2",
            title: "Hotfix Branch `hotfix/inc-8954-db-deadlock`",
            status: "In Code Review",
            statusType: "success",
            desc: "Code diff verified by AI L3 Agent · Zero regression risks found",
          },
        ],
      },
      whatRequiresAttention: {
        title: "L3 Core Architecture Alerts",
        tag: "2 L3 Tasks",
        cards: [
          {
            id: "a1",
            title: "P1 · Hotfix #HF-892 Approval needed for Production",
            severity: "Act now",
            severityType: "critical",
            desc: "Eliminates row lock contention in Claims Database Engine",
            progress: 95,
          },
          {
            id: "a2",
            title: "P2 · Query plan regression in Claims Reporting DB",
            severity: "Review",
            severityType: "review",
            desc: "Sequential scan detected on 10M row table · Index creation script ready",
            progress: 75,
          },
        ],
      },
      criticalRisks: {
        title: "L3 Core Systems & Architecture Risks",
        tag: "Core Cluster",
        cards: [
          {
            id: "r1",
            title: "Database Lock Contention Risk during Peak Business Hours",
            severity: "Critical",
            severityType: "critical",
            desc: "High concurrent transactions between 14:00 - 16:00 ET may trigger deadlock",
          },
        ],
      },
      askYourCoworker: {
        title: "L3 Core Hotfix & Architecture Agent",
        sub: "Deep code hotfixing, kernel patch verification & database tuning assistant",
        botGreeting: "Greetings L3 Engineer. Core diagnostics and patch verification complete.",
        headline: "Hotfix #HF-892 eliminates row lock contention in PostgreSQL. Benchmarks show +45% throughput boost.",
        actionNeeded: "Execute hotfix deployment workflow to production database cluster.",
        suggestedNext: "Review execution logs & sign off on core hotfix release ticket.",
        chatMode: "normal",
      },
      tabData: {
        core_hotfixes: {
          title: "Core Code Hotfixes & Patch Reviews",
          sub: "Deep architectural hotfix branches verified by AI L3 Code Auditor",
          items: [
            { id: "hf1", code: "#HF-892", title: "PostgreSQL Row Lock Clearance Patch", branch: "hotfix/inc-8954-db-deadlock", status: "Staging Passed", throughputImpact: "+45% Speedup", targetEnv: "Production Cluster A" },
            { id: "hf2", code: "#HF-898", title: "Memory Leak Garbage Collector Tune", branch: "hotfix/prb-3210-mem-leak", status: "In Code Review", throughputImpact: "+12% Efficiency", targetEnv: "Staging Cluster B" },
          ],
        },
        db_tuning: {
          title: "Database Kernel & Query Optimization",
          sub: "P99 latency benchmarks, execution plan optimizations and index creation scripts",
          items: [
            { id: "dbt1", query: "SELECT * FROM claims_tbl WHERE status = 'PENDING'", currentLatency: "420ms", targetLatency: "15ms", optimization: "Create B-Tree Index on (status, created_at)", gain: "96% Faster" },
            { id: "dbt2", query: "UPDATE member_vault SET last_login = NOW()", currentLatency: "180ms", targetLatency: "8ms", optimization: "Partition table by region year", gain: "95% Faster" },
          ],
        },
        patch_reviews: {
          title: "Kernel & Infrastructure Security Patches",
          sub: "Low-level OS, container runtime and database engine patches",
          items: [
            { id: "prv1", patch: "PostgreSQL v16.2 Security Advisory", risk: "Low", compatibility: "100% Verified", status: "Ready for Deployment" },
            { id: "prv2", patch: "Alpine Linux Container Base Image Upgrade", risk: "Low", compatibility: "100% Verified", status: "Deployed to Staging" },
          ],
        },
      },
    },

    "L4 Support Engineer": {
      topbar: {
        title: "AI for AMS · L4 Vendor & Infrastructure Desk",
        subtitle: "GenAI Cloud Infrastructure, Vendor Coordination & Third-Party SLA Watch",
        platform: "AMS-L4",
        shift: "L4 Cloud Operations & Vendor Governance | Active",
        shiftProgress: "30%",
        statusBadge: "● L4 CLOUD & VENDOR MESH · LIVE",
      },
      summary: {
        greeting: "Good morning, L4 Engineer — Cloud Vendor & Third-Party Telemetry is nominal.",
        subtext: "3 Third-party SLAs monitored · 1 Vendor Escalation active (AWS East Region) · Zero Outages",
        chips: [
          { id: "c1", text: "AWS US-East-1 Latency +12ms", type: "warn" },
          { id: "c2", text: "Vendor SLA Compliance 99.9%", type: "info" },
          { id: "c3", text: "Cloud Infra Cost Variance -4.2%", type: "info" },
        ],
      },
      tabs: [
        { id: "overview", label: "Overview", active: true },
        { id: "vendor_slas", label: "Vendor SLAs", badge: 3 },
        { id: "cloud_infra", label: "Cloud Infra Health", badge: 32 },
        { id: "escalations", label: "Vendor Tickets", badge: 1 },
      ],
      stateOfEnvironment: {
        title: "Cloud Infrastructure & Vendor Platforms",
        tag: "L4 Enterprise Cloud",
        metrics: [
          { id: "m1", count: 0, label: "Critical", color: "red" },
          { id: "m2", count: 2, label: "Warning", color: "orange" },
          { id: "m3", count: 5, label: "Watch", color: "blue" },
          { id: "m4", count: 32, label: "Nominal", color: "gray" },
        ],
        items: [
          {
            id: "e1",
            title: "Azure East US 2 Data Factory Pipelines",
            status: "Maintenance Scheduled",
            statusType: "warn",
            desc: "Vendor maintenance window scheduled for tonight 22:00 ET",
          },
          {
            id: "e2",
            title: "Salesforce Health Cloud Integration API",
            status: "Nominal",
            statusType: "success",
            desc: "API Latency 110ms · 99.99% availability over last 30 days",
          },
        ],
      },
      whatRequiresAttention: {
        title: "Vendor Escalations & Cloud Tasks",
        tag: "Vendor Watch",
        cards: [
          {
            id: "a1",
            title: "P2 · Vendor Ticket #VND-9941 (AWS Support) update received",
            severity: "Review",
            severityType: "review",
            desc: "AWS engineers confirmed network edge route optimization applied",
            progress: 80,
          },
        ],
      },
      criticalRisks: {
        title: "Cloud Infrastructure & Vendor Risks",
        tag: "Vendor SLA",
        cards: [
          {
            id: "r1",
            title: "Upcoming Azure Maintenance Window may affect Batch ETL",
            severity: "Elevated",
            severityType: "high",
            desc: "Maintenance window from 22:00-02:00 ET requires job deferral",
          },
        ],
      },
      askYourCoworker: {
        title: "L4 Vendor & Cloud Infrastructure Assistant",
        sub: "Cloud platform monitoring, vendor ticket escalation & third-party SLA tracker",
        botGreeting: "Hello L4 Engineer. Cloud vendor telemetry & ticket syncing active.",
        headline: "AWS Support confirmed minor network degradation resolved. All cloud metrics returned to baseline.",
        actionNeeded: "Close Vendor Escalation Ticket #VND-9941.",
        suggestedNext: "Verify cloud cluster health metrics and update vendor SLA log.",
        chatMode: "normal",
      },
      tabData: {
        vendor_slas: {
          title: "Third-Party Vendor SLA & Availability Watch",
          sub: "Contractual SLA tracking, penalty thresholds and vendor availability reports",
          items: [
            { id: "vs1", vendor: "Amazon Web Services (AWS)", service: "US-East-1 Cloud Infrastructure", slaTarget: "99.99%", currentUptime: "99.95%", penaltyStatus: "Warning", status: "Route Degradation (Resolved)" },
            { id: "vs2", vendor: "Microsoft Azure", service: "East US 2 Data Factory", slaTarget: "99.90%", currentUptime: "99.98%", penaltyStatus: "Optimal", status: "Maintenance Scheduled 22:00 ET" },
            { id: "vs3", vendor: "Salesforce Health Cloud", service: "Member Health Sync API", slaTarget: "99.50%", currentUptime: "99.99%", penaltyStatus: "Optimal", status: "Nominal" },
          ],
        },
        cloud_infra: {
          title: "Enterprise Cloud Infrastructure Telemetry",
          sub: "Global cloud region status, Kubernetes cluster utilization and cost variance",
          items: [
            { id: "ci1", region: "AWS US-East-1 (Primary)", clustersCount: 14, cpuUtil: "64%", memUtil: "72%", costVariance: "-4.2%", health: "Nominal" },
            { id: "ci2", region: "Azure East US 2 (DR Backup)", clustersCount: 8, cpuUtil: "28%", memUtil: "35%", costVariance: "-1.5%", health: "Nominal" },
          ],
        },
        escalations: {
          title: "Vendor Support Ticket Escalations",
          sub: "Active support cases filed with third-party cloud vendors",
          items: [
            { id: "esc1", ticketNum: "#VND-9941", vendor: "AWS Support", severity: "P2", topic: "Network Edge Route Latency Spike", status: "Resolved (Route Optimized)", eta: "Closed" },
            { id: "esc2", ticketNum: "#VND-9948", vendor: "Azure Support", severity: "P3", topic: "Data Factory Pipeline Lock Query", status: "In Progress (Awaiting Patch)", eta: "24 Hours" },
          ],
        },
      },
    },
  },
};

// Fallback baseline dataset for generic/SRE Reliability view
export const landingMockData = roleMockData["AI for AD"]["Admin"];

// Helper function to resolve mock dataset based on Domain & Role
export const getMockDataForRole = (businessArea, role) => {
  if (!businessArea || !role) {
    return roleMockData["AI for AD"]["Admin"];
  }

  // Exact match lookup
  if (roleMockData[businessArea] && roleMockData[businessArea][role]) {
    return roleMockData[businessArea][role];
  }

  // Case-insensitive / normalized lookup fallback
  const areaKey = Object.keys(roleMockData).find(
    (key) => key.toLowerCase().trim() === businessArea.toLowerCase().trim()
  );

  if (areaKey) {
    const roleKey = Object.keys(roleMockData[areaKey]).find(
      (key) => key.toLowerCase().trim() === role.toLowerCase().trim()
    );
    if (roleKey) {
      return roleMockData[areaKey][roleKey];
    }
    // Return first role in area if role name doesn't match
    const firstRole = Object.keys(roleMockData[areaKey])[0];
    return roleMockData[areaKey][firstRole];
  }

  // Fallback to default
  return roleMockData["AI for AD"]["Admin"];
};

export const amsOverviewData = {
  topMetrics: [
    { id: "m1", count: 5, label: "Needs My Action", color: "blue", icon: "list" },
    { id: "m2", count: 5, label: "Awaiting My Approval (HITL)", color: "orange", icon: "clock" },
    { id: "m3", count: 23, label: "AI Completed Autonomously Today", color: "green", icon: "cpu" },
    { id: "m4", count: 3, label: "Critical Issues / SLA Risk", color: "red", icon: "alert-triangle" },
  ],
  needsMyAction: {
    title: "Needs My Action",
    badge: 5,
    headerColor: "#2563eb",
    items: [
      { id: "n1", tag: "RUN OPS", meta: "Due 25 min", text: "INC0045231 – Batch job failure, triage required" },
      { id: "n2", tag: "GOVERNANCE", meta: "Today", text: "Review & approve weekly status report before standup" },
      { id: "n3", tag: "RELEASE", meta: "Today", text: "Confirm go/no-go for Release 24.3 post-validation" },
      { id: "n4", tag: "ONBOARDING", meta: "1 day left", text: "Sign off access decommission – App Zephyr offboarding" },
      { id: "n5", tag: "AUDIT", meta: "2 days left", text: "Validate CMS audit evidence package before submission" },
    ],
  },
  waitingForMyApproval: {
    title: "Waiting for My Approval",
    badge: 5,
    headerColor: "#d97706",
    items: [
      { id: "w1", tag: "RUN OPS", meta: "AI-done", text: "AI drafted RCA for INC0044890 – ready for review" },
      { id: "w2", tag: "AUDIT", meta: "AI-done", text: "AI-generated state regulatory report draft awaiting sign-off" },
      { id: "w3", tag: "KNOWLEDGE", meta: "AI-done", text: "AI updated runbook \"Batch Failure Recovery\" – pending approval" },
      { id: "w4", tag: "SEASONAL", meta: "AI-done", text: "AI-prepared DR/BCP readiness checklist – needs confirmation" },
      { id: "w5", tag: "GOVERNANCE", meta: "AI-done", text: "AI-consolidated workload analysis – pending review" },
    ],
  },
  aiCompletedAutonomously: {
    title: "AI Completed Autonomously",
    badge: 23,
    headerColor: "#16a34a",
    items: [
      { id: "a1", tag: "RUN OPS", text: "Periodic health check completed – all systems nominal" },
      { id: "a2", tag: "RUN OPS", text: "CMDB sync completed – 12 records updated" },
      { id: "a3", tag: "KNOWLEDGE", text: "Mandatory training compliance tracker refreshed" },
      { id: "a4", tag: "AUDIT", text: "Access control review reminders sent to 8 users" },
      { id: "a5", tag: "RELEASE", text: "Post-deployment validation passed – Release 24.2" },
    ],
  },
  criticalIssues: {
    title: "Critical Issues & Upcoming SLA Breaches",
    cards: [
      { id: "c1", title: "P1 – INC0045231 Batch job failure", action: "SLA breach in 25 min", type: "danger" },
      { id: "c2", title: "CMS audit evidence gap identified", action: "Deadline in 2 days", type: "warn" },
      { id: "c3", title: "Service request backlog – 14 tickets aging past SLA", action: "Breach risk: High", type: "danger" },
      { id: "c4", title: "3 systems overdue for quarterly access review", action: "Compliance risk", type: "warn" },
    ],
  },
};
