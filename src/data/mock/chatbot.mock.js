
// src/data/mock/chatbot.mock.js

export const WELCOME_MESSAGE = "Hi! How can I help you with AI Agent IT operations today?";

export const PREDEFINED_PROMPTS = [
  "Give me the top 11 incidents from the MyMember Benefits Portal where Priority is Moderate and created in January 2026.",
];

// Add any future hardcoded responses or logic mappings here.

export const TOP_11_INCIDENTS_TABLE = `
| Incident Number | Created | Resolved | Application | Category | Assignment Group | Short Description |
|---|---|---|---|---|---|---|
| SYNINC0000006 | 10-Jan-2026 15:18 | 17-Jan-2026 15:18 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Hospital Coverage Not Showing |
| SYNINC0000012 | 16-Jan-2026 12:36 | 21-Jan-2026 12:36 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dental Coverage Not Displayed |
| SYNINC0000018 | 22-Jan-2026 09:54 | 25-Jan-2026 09:54 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dependent Record Duplicated |
| SYNINC0000024 | 28-Jan-2026 15:12 | 29-Jan-2026 15:12 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dependent Coverage Not Showing |
| SYNINC0000246 | 10-Jan-2026 12:18 | 17-Jan-2026 12:18 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Hospital Coverage Not Showing |
| SYNINC0000252 | 16-Jan-2026 09:36 | 21-Jan-2026 09:36 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dental Coverage Not Displayed |
| SYNINC0000258 | 22-Jan-2026 15:54 | 25-Jan-2026 15:54 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dependent Record Duplicated |
| SYNINC0000264 | 28-Jan-2026 12:12 | 29-Jan-2026 12:12 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dependent Coverage Not Showing |
| SYNINC0000486 | 10-Jan-2026 09:18 | 17-Jan-2026 09:18 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Hospital Coverage Not Showing |
| SYNINC0000492 | 16-Jan-2026 15:36 | 21-Jan-2026 15:36 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dental Coverage Not Displayed |
| SYNINC0000498 | 22-Jan-2026 12:54 | 25-Jan-2026 12:54 | MyMember Benefits Portal - Production | Access | Synthetic Benefits Support | Dependent Record Duplicated |
`;

export const RCA_DATA = `### 1. Incident: SYNINC0000006 - Hospital Coverage Not Showing

**Identified Issue:**
Hospital coverage did not appear for a covered spouse in the portal because the spouse was not actually elected under the selected policy, but the UI presented the situation as "missing coverage" instead of "not enrolled."

#### Root Cause Analysis:
- **What failed:** The portal's coverage display flow surfaced an apparent "no hospital coverage" outcome for the spouse, which is misleading when the dependent is not elected under that policy. This manifests as a coverage gap on-screen rather than a clear enrollment status.
- **Why it failed:** The portal did not translate the eligibility/enrollment signal ("dependent not elected") into a user-facing enrollment explanation, so the same data condition was rendered like a defect in coverage retrieval.
- **What condition allowed the failure:** The UX/path for dependents appears to assume "coverage should exist" after selection, without a pre-check that the dependent is part of the policy election. That allows a normal plan configuration (dependent excluded) to look like a system error.
- **Why it wasn't prevented earlier:** This was resolved "by information" and categorized as a knowledge gap, indicating the product lacked preventative UI guardrails and relied on support interpretation rather than deterministic messaging in the application.

#### Enhancement Recommendations:
- Add an explicit "Not Enrolled for This Policy" state because it directly addresses the confusion created when a dependent is excluded by election; this reduces avoidable support contacts for non-defect scenarios.
- Add a pre-display enrollment validation (dependent-policy election check) so the UI never attempts to render benefits for a dependent who is not part of the election; this prevents the "missing coverage" presentation entirely.
- Instrument analytics/telemetry on "no coverage returned" outcomes segmented by reason (not elected vs inactive vs data mismatch) because this incident was only resolvable via interpretation; reason-codes enable faster triage and targeted fixes.

#### Improved Solution Steps:
1. Implement an enrollment check for the selected policy + dependent before calling/rendering hospital coverage so the system can branch into an enrollment-status view instead of a blank/absent coverage view.
2. Display "Not Enrolled for This Policy" with a clear next step (review enrollment details) so the member understands it is a plan configuration, not a portal failure.
3. Add logging for the "not elected" reason code so support and engineering can distinguish data-driven outcomes from true defects without manual investigation.

#### Additional Observations:
The 7-day gap between created and resolved suggests the UI did not provide enough context for quick self-resolution; improved messaging would shorten time-to-closure for similar cases.

**Historical Insight:**
Similar "Hospital Coverage Not Showing" synthetic incidents appear elsewhere in the dataset, indicating a recurring UX/interpretation gap when dependents are not elected under a policy.

---

### 2. Incident: SYNINC0000012 - Dental Coverage Not Displayed

**Identified Issue:**
Dental coverage did not display for a spouse because spouse and child shared the same display name, leading to ambiguous person selection and the portal using the wrong identifier (or none) for coverage retrieval.

#### Root Cause Analysis:
- **What failed:** The dependent selection and coverage lookup did not uniquely identify the spouse when another dependent shared the same display name, resulting in dental coverage not being returned/displayed for the intended person.
- **Why it failed:** The portal's selection/lookup behavior effectively treated display name as a key signal, which breaks when names collide; coverage retrieval must be keyed on a unique dependent identifier, not a non-unique label.
- **What condition allowed the failure:** The UI lacked disambiguation controls (e.g., relationship + masked dependent ID) and the backend/API contract allowed coverage to be requested without enforcing a unique dependent ID.
- **Why it wasn't prevented earlier:** This required remediation and was categorized as a data issue, implying the system did not validate uniqueness or prompt the user when multiple dependents match the same name.

#### Enhancement Recommendations:
- Render distinct person cards including relationship and masked dependent ID because it converts an ambiguous list into an unambiguous selection, directly preventing wrong-person coverage queries.
- Enforce unique dependent identifier usage for all coverage retrieval calls because it removes reliance on display names and prevents silent misrouting of requests.
- Add automated UI tests that include same-name dependents because this issue only emerges under specific data patterns; targeted tests prevent regression.

#### Improved Solution Steps:
1. Update the dependent list UI to show relationship (Spouse/Child) and masked dependent identifier so users can select the correct individual even when names match.
2. Change the coverage query to use the unique dependent ID from the selection event so the backend returns coverage for the intended person deterministically.
3. Add a validation: if multiple dependents share the same display name, force selection via the enhanced cards (no default auto-selection) to prevent accidental mismatches.

#### Additional Observations:
Because this is a synthetic case, it is ideal for a permanent regression test fixture to ensure the ambiguous-name scenario remains covered in CI.

**Historical Insight:**
Multiple "Dental Coverage Not Displayed" incidents in the dataset point to a systemic identity-matching weakness (name-based ambiguity) rather than an isolated data anomaly.

---

### 3. Incident: SYNINC0000018 - Dependent Record Duplicated

**Identified Issue:**
The portal encountered duplicate dependent records for the same relationship, causing dependent presentation/selection ambiguity and incorrect mapping of coverage when relying on non-unique attributes like name/relationship.

#### Root Cause Analysis:
- **What failed:** The portal displayed or processed duplicated dependent entries, which can lead to selecting the wrong record or failing to map coverage correctly for the intended spouse.
- **Why it failed:** Coverage mapping logic was not anchored to a single unique dependent identifier; when duplicates exist, name/relationship matching produces multiple candidates and breaks deterministic resolution.
- **What condition allowed the failure:** Upstream data quality permitted duplicate dependent entities for the same member/relationship, and the portal lacked a "verification" step to reconcile duplicates before benefit rendering.
- **Why it wasn't prevented earlier:** The incident required remediation and is tied to data quality, indicating missing automated detection (dedupe checks) and missing UI safeguards when duplicates are present.

#### Enhancement Recommendations:
- Introduce a "Verify Dependent Details" flow because it provides a controlled user experience when duplicates exist, preventing silent mis-association of benefits.
- Change internal mapping to always use unique dependent ID because it makes duplicate names/relationships survivable: duplicates can coexist while coverage retrieval remains correct for the selected record.
- Add a data-quality detector that flags duplicate dependents (same relationship) because this issue is predictable and should be caught before it affects portal rendering.

#### Improved Solution Steps:
1. Detect duplicate dependent candidates for the same relationship during dependent list building so the UI can switch into a verification/disambiguation mode.
2. Present a "Verify Dependent Details" screen to let the user confirm the intended spouse record, minimizing the risk of showing the wrong person's coverage.
3. Use the selected record's unique dependent ID for downstream coverage retrieval so coverage mapping remains correct even if duplicates persist upstream.

#### Additional Observations:
A linked problem record exists (SYNPRB00019), suggesting this is not purely incidental and warrants a durable product/data control rather than repeated remediation.

**Historical Insight:**
Similar duplicate-dependent incidents appear in the dataset, indicating a recurring pattern where portal behavior degrades when dependent identity is not uniquely resolvable.

---

### 4. Incident: SYNINC0000024 - Dependent Coverage Not Showing

**Identified Issue:**
Dependent coverage did not show because the dependent's coverage eligibility status was inactive/terminated, but the portal did not present that status clearly as an "Inactive Coverage" condition with end date and next steps.

#### Root Cause Analysis:
- **What failed:** The portal's dependent coverage view did not correctly communicate that the absence of active coverage was due to an inactive/terminated eligibility status, presenting the outcome as "coverage not showing."
- **Why it failed:** The UI did not map the eligibility status state into an explicit inactive/terminated coverage banner/state, so users were left without the key reason coverage is unavailable.
- **What condition allowed the failure:** Eligibility status handling was insufficiently surfaced in the UX; the system allowed a terminated coverage record to be treated like a missing record.
- **Why it wasn't prevented earlier:** Resolution was "by information" under eligibility status, indicating the portal lacked proactive messaging and relied on support to interpret eligibility data.

#### Enhancement Recommendations:
- Display "Inactive Coverage" with coverage end date because it transforms an apparent defect into a clear status explanation tied to the member's eligibility record.
- Provide a contextual "contact benefits administrator" link because inactive/terminated eligibility typically requires administrative action; giving the right escalation path reduces churn and repeated portal attempts.
- Add monitoring for spikes in inactive/terminated displays because it helps distinguish normal lifecycle events from upstream feed issues if terminations appear unexpectedly.

#### Improved Solution Steps:
1. On coverage retrieval, evaluate eligibility status and branch to an "Inactive Coverage" UI state when inactive/terminated so the user sees the correct reason immediately.
2. Render the coverage end date prominently to clarify timing and reduce confusion about whether the portal is wrong.
3. Add a guided next step (benefits administrator contact link) so the user has a resolution path aligned to the data condition.

#### Additional Observations:
The quick resolution (next day) reinforces that the underlying data was consistent; the gap is primarily explanatory UX rather than data retrieval failure.

**Historical Insight:**
Similar eligibility-status-driven "coverage not showing" cases in the dataset suggest the portal needs consistent status-to-UI mapping across benefit types and dependents.

---

### 5. Incident: SYNINC0000246 - Hospital Coverage Not Showing

**Identified Issue:**
Hospital coverage appeared missing for the spouse, but the dependent was not elected under the selected policy; the portal did not clearly indicate "not enrolled" for that dependent-policy combination.

#### Root Cause Analysis:
- **What failed:** The portal's hospital coverage section did not provide the correct enrollment context and instead surfaced an absence of benefits as if coverage failed to load.
- **Why it failed:** The coverage display path did not gate on dependent election status, so it proceeded into a benefits-rendering state that cannot succeed when the dependent is excluded by election.
- **What condition allowed the failure:** The UI/data contract appears to allow a dependent to be selected even when not part of the policy election without immediately signaling that mismatch.
- **Why it wasn't prevented earlier:** Being resolved "by information" indicates the portal lacked built-in guardrails (status messaging and reason codes) and depended on human interpretation.

#### Enhancement Recommendations:
- Add policy-aware dependent eligibility/election validation because it directly prevents the portal from attempting to show benefits for non-elected dependents.
- Standardize the "Not Enrolled for This Policy" message across benefits pages because repeated confusion suggests inconsistent or missing messaging paths.
- Add a self-service "Review who is enrolled" panel for the selected policy because it short-circuits confusion by showing elections alongside benefits.

#### Improved Solution Steps:
1. Validate dependent election for the chosen policy immediately after policy selection so the user is not led into a dead-end benefits view.
2. If not elected, display a dedicated status tile ("Not Enrolled for This Policy") with a direct link to enrollment details so the user can confirm configuration.
3. Log the "not elected" outcome distinctly so support can rapidly confirm cause without manual investigation.

#### Additional Observations:
This incident shares the same short description pattern as others, suggesting the portal's current UX can repeatedly misclassify valid plan configurations as defects.

**Historical Insight:**
Multiple instances of the same "Hospital Coverage Not Showing" scenario indicate a recurring product gap in dependent election awareness at display time.

---

### 6. Incident: SYNINC0000252 - Dental Coverage Not Displayed

**Identified Issue:**
Dental coverage for the spouse did not display because spouse and child had matching display names, causing the portal to mis-handle person selection and coverage retrieval.

#### Root Cause Analysis:
- **What failed:** The dependent selection experience could not reliably distinguish between two dependents sharing the same name, leading to incorrect/failed dental coverage lookup for the spouse.
- **Why it failed:** The system's selection-to-lookup linkage was not strictly based on a unique dependent identifier; when labels collide, the portal cannot deterministically map the selection to the correct dependent record.
- **What condition allowed the failure:** The UI did not surface relationship/identifier details that would allow correct selection, and the application did not enforce uniqueness constraints at the point of query.
- **Why it wasn't prevented earlier:** Remediation was needed, implying this ambiguity was not covered by existing validations or test cases until the synthetic scenario exposed it.

#### Enhancement Recommendations:
- Introduce relationship + masked dependent ID in the selector because it directly resolves the ambiguity that caused the coverage to disappear.
- Enforce dependent-ID-based retrieval because it eliminates a whole class of name-collision errors, improving reliability as dependent rosters grow.
- Add a "duplicate display name" warning state because it proactively tells the user why extra identifiers are shown and prevents confusion during selection.

#### Improved Solution Steps:
1. Modify dependent list rendering to include relationship and masked dependent ID so same-name dependents are clearly distinct.
2. Ensure the click/selection event stores the unique dependent ID and that all coverage APIs use that ID, not display name.
3. Add a guardrail: if two dependents share a name, disable any implicit default and require explicit selection, preventing accidental mismatches.

#### Additional Observations:
Same creation date as other dental-name-collision incidents indicates a repeatable test pattern; it should become a standard synthetic regression scenario.

**Historical Insight:**
Repeated dental display failures tied to identical display names highlight a systemic identity-resolution deficiency in the portal's dependent handling.

---

### 7. Incident: SYNINC0000258 - Dependent Record Duplicated

**Identified Issue:**
Duplicate dependent records existed for the spouse relationship, causing the portal to require disambiguation and making name/relationship-based coverage mapping unreliable.

#### Root Cause Analysis:
- **What failed:** The portal encountered multiple dependent records representing the same relationship, which can lead to duplicated display entries and incorrect benefit association if the wrong record is used.
- **Why it failed:** The portal's mapping logic was not inherently resilient to duplicates; without a unique dependent ID anchoring the flow, duplicates create multiple matches and break deterministic behavior.
- **What condition allowed the failure:** Upstream data allowed duplicate dependent entities and the portal did not have a built-in verification step to reconcile or force explicit selection under duplication.
- **Why it wasn't prevented earlier:** The need for remediation and a data-quality category indicates missing automated detection/alerts for duplicate dependent scenarios.

#### Enhancement Recommendations:
- Add duplicate-dependent detection at load time because it allows the UI to pivot into a controlled "Verify Dependent Details" flow instead of failing silently or mis-mapping.
- Require unique dependent ID for benefit retrieval because it ensures the selected record is the one used for coverage, even when duplicates exist.
- Create a data-quality feedback loop (flagging duplicates) because recurring duplicates should be corrected upstream rather than repeatedly handled downstream.

#### Improved Solution Steps:
1. When building the dependent list, check for duplicates by relationship and/or other available identifiers so duplicates are identified before benefits rendering.
2. Present "Verify Dependent Details" to force explicit selection/confirmation, preventing accidental coverage association to the wrong record.
3. Use the chosen unique dependent ID for all downstream coverage mapping so results remain stable even if duplicates persist.

#### Additional Observations:
This incident is linked to a problem record (SYNPRB00009), supporting that duplicate dependents are an ongoing risk area requiring systemic controls.

**Historical Insight:**
Multiple duplicate-dependent incidents in the dataset suggest that downstream UI disambiguation alone may not be sufficient; upstream de-duplication or stronger identity governance is likely needed.

---

### 8. Incident: SYNINC0000264 - Dependent Coverage Not Showing

**Identified Issue:**
The spouse's dependent coverage did not show because eligibility was inactive/terminated; the portal needed to display an explicit inactive status with end date and the appropriate next action.

#### Root Cause Analysis:
- **What failed:** The portal did not present the inactive/terminated eligibility state as the primary explanation for the missing dependent coverage, resulting in a "not showing" perception.
- **Why it failed:** Eligibility status was not rendered as a first-class UI state; the portal treated inactive coverage similarly to absent coverage, losing critical context.
- **What condition allowed the failure:** The system permitted navigation to a dependent coverage view without a clear status banner, even when the eligibility lifecycle indicates the coverage should not be active.
- **Why it wasn't prevented earlier:** Since it was resolved via information, there was no built-in user guidance to prevent confusion or to route the user to the correct administrator contact path.

#### Enhancement Recommendations:
- Implement a consistent eligibility-status-to-UI mapping component because it ensures inactive/terminated conditions always render with the same clarity, reducing repeat incidents.
- Include coverage end date in the primary UI because it answers the user's core question ("when did it end?") and reduces support dependency.
- Provide an escalation link to the benefits administrator because the corrective action is external to the portal and should be made explicit.

#### Improved Solution Steps:
1. Detect inactive/terminated eligibility during coverage load and route to an "Inactive Coverage" view so the portal communicates status instead of appearing broken.
2. Display the end date and status reason (as available) to make the eligibility lifecycle transparent.
3. Add a "Contact benefits administrator" link to provide the correct resolution path aligned to eligibility management.

#### Additional Observations:
This incident resolved quickly, reinforcing that the portal behavior is explainability/UX-driven rather than a service outage or intermittent failure.

**Historical Insight:**
The dataset contains multiple dependent-coverage display incidents where the resolution is a clearer status message, indicating a broader need for standardized status handling.

---

### 9. Incident: SYNINC0000486 - Hospital Coverage Not Showing

**Identified Issue:**
Hospital coverage did not show for the spouse because the dependent was not elected for the selected policy, and the portal did not communicate the "not enrolled" status clearly.

#### Root Cause Analysis:
- **What failed:** The hospital benefits view produced a missing-coverage outcome for a spouse who is excluded by election, which misleads users into suspecting a portal defect.
- **Why it failed:** The flow attempted to present benefit details without first confirming the dependent's election under the chosen policy; when the election is absent, there is no coverage to render.
- **What condition allowed the failure:** The UI allowed the dependent context to persist across policy selection without validating whether that dependent is included in the newly selected policy.
- **Why it wasn't prevented earlier:** The incident is a knowledge-gap/information resolution, signaling the absence of automated UX cues and reason-coded outcomes.

#### Enhancement Recommendations:
- Add a dependent-policy election compatibility check on policy changes because this incident is specifically triggered by a mismatch between selected policy and dependent election.
- Show "Not Enrolled for This Policy" as a blocking informational state because it prevents the user from interpreting an empty coverage view as a malfunction.
- Add event tracking for "policy switch + dependent not elected" because it quantifies how often this mismatch occurs and validates whether UI changes reduce occurrences.

#### Improved Solution Steps:
1. On policy selection, validate dependent election under that policy and prevent rendering of hospital benefits when not elected.
2. Render a clear "Not Enrolled for This Policy" message with a link to enrollment details to guide next steps.
3. Add structured logs/telemetry for the mismatch to support faster triage and confirm reduction after enhancements.

#### Additional Observations:
Multiple hospital-coverage synthetic incidents on the same created date suggest a repeatable, known UX gap that should be addressed via standardized messaging.

**Historical Insight:**
Recurrent "not elected" scenarios across incidents indicate the portal needs consistent enrollment-aware benefit presentation across all benefit types.

---

### 10. Incident: SYNINC0000492 - Dental Coverage Not Displayed

**Identified Issue:**
Dental coverage for the spouse was not displayed because spouse and child shared the same display name, and the portal could not uniquely resolve the correct dependent for coverage retrieval.

#### Root Cause Analysis:
- **What failed:** The dental benefits display did not return/show the spouse's coverage when two dependents shared identical display names, leading to an ambiguous selection and incorrect mapping.
- **Why it failed:** The dependent identity resolution relied on a non-unique attribute (display name) rather than consistently using a unique dependent identifier for downstream benefit calls.
- **What condition allowed the failure:** The UI lacked sufficient disambiguating metadata (relationship + masked ID), and the system did not enforce "unique ID required" semantics at the selection boundary.
- **Why it wasn't prevented earlier:** The issue required remediation, implying the existing test coverage and validations did not include same-name dependent rosters.

#### Enhancement Recommendations:
- Always display relationship and masked dependent ID on person cards because it addresses the exact ambiguity that caused the spouse selection to be unreliable.
- Require unique dependent ID for dental coverage retrieval because it makes the system robust even when data contains duplicate names.
- Add synthetic regression coverage for same-name dependents because this scenario is rare in generic test data but high-impact when it occurs.

#### Improved Solution Steps:
1. Enhance dependent cards with relationship and masked dependent ID so the user can confidently select the spouse vs child.
2. Pass the selected dependent's unique ID to the dental coverage service/query to ensure the returned coverage aligns to the chosen dependent.
3. Add a disambiguation rule: if names match, require explicit confirmation and do not auto-select, preventing silent errors.

#### Additional Observations:
The issue is fully deterministic given the data pattern (same-name dependents), making it well-suited for automated prevention rather than repeated remediation.

**Historical Insight:**
The recurrence of this pattern across multiple incidents suggests name-collision handling should be treated as a standard requirement for dependent selection components.

---

### 11. Incident: SYNINC0000498 - Dependent Record Duplicated

**Identified Issue:**
The spouse dependent record was duplicated, and the portal needed a verification/disambiguation step and unique-ID-based coverage mapping to avoid incorrect dependent selection and benefit association.

#### Root Cause Analysis:
- **What failed:** Duplicate dependent entries created ambiguity in the portal, which can cause incorrect dependent selection and break benefit mapping when multiple records represent the same relationship.
- **Why it failed:** The system was not designed to deterministically handle multiple dependent records without anchoring on a unique dependent identifier; duplicates therefore disrupt selection and coverage association logic.
- **What condition allowed the failure:** Data quality issues (duplicate dependent records) were present, and the portal lacked both upstream detection signals and downstream UX controls to safely handle the duplicates.
- **Why it wasn't prevented earlier:** Remediation indicates missing automated identification of duplicates and missing "stop-and-verify" behavior in the UI when duplicates are detected.

#### Enhancement Recommendations:
- Implement a "Verify Dependent Details" experience because it provides a safe, user-driven resolution path when duplicates exist, preventing incorrect benefit display.
- Use unique dependent ID for mapping because it ensures benefits are retrieved for the intended record, turning duplicates into a manageable condition rather than a breaking one.
- Add duplicate-dependent monitoring/alerts because repeated duplicate scenarios indicate a persistent data governance gap that should be visible and actionable.

#### Improved Solution Steps:
1. Detect duplicate dependent records during dependent list construction so the portal can explicitly handle this scenario instead of failing later in benefits rendering.
2. Prompt the user with a verification screen to select/confirm the correct dependent record, reducing the risk of mis-associated coverage.
3. Retrieve and render coverage strictly using the selected record's unique dependent ID to ensure correctness regardless of duplicates.

#### Additional Observations:
This incident is associated with a problem record (SYNPRB00024), reinforcing that duplication is a known, recurring failure mode requiring durable controls.

**Historical Insight:**
Multiple duplicate-dependent incidents across the dataset suggest a systemic weakness in either upstream dependent record management or downstream tolerance to duplicates, and both sides should be strengthened.

---

### Next Steps
**Would you like to create Jira enhancement requests for any of these incidents and assign them to the appropriate development scrum teams?**`;

export const PRD_DOCUMENT_CONTENT = `# Product Requirement Document (PRD)

## Document Details
- **Project**: MyMember Benefits Portal - Deterministic Identity & Coverage Resolution
- **Target Release**: Q1 2026
- **Associated Jira Ticket**: SCRUM-1042
- **Source Incident**: SYNINC0000012 (Related: SYNINC0000006, SYNINC0000018, SYNINC0000252)
- **Status**: Ready for Engineering Review

---

## 1. Executive Summary & Problem Statement

### 1.1 Executive Summary
During January 2026 operations, multiple moderate-priority incidents were logged for the MyMember Benefits Portal where members reported that dependent coverage (notably Dental and Hospital benefits) failed to appear on-screen. Root cause investigation of incident SYNINC0000012 revealed that when a covered dependent (e.g., spouse) shares an identical display name with another dependent (e.g., child), the selection component falls back to non-unique display name matching. Consequently, coverage retrieval queries either fail to identify the intended covered individual or query using an ambiguous identifier, causing silent coverage retrieval drops and false "missing coverage" errors for members.

### 1.2 Problem Statement
- **Name Collision Ambiguity**: The UI dependent selector treats display names as unique keys, resulting in request routing failures when multiple dependents share identical or overlapping name attributes.
- **Absence of Unique Token Enforcement**: Downstream benefit retrieval services accept name/relationship combinations without enforcing a deterministic, immutable Dependent Identity Token (dependent_id).
- **Misleading Error Presentation**: When coverage lookups encounter ambiguity or un-elected policies, the UI surfaces a generic missing coverage state rather than an actionable status or disambiguation prompt.
- **Support Burden**: Resolving these incidents currently requires manual support intervention and knowledge-based triage, creating an average resolution lag of 5 to 7 days.

---

## 2. Objectives & Scope

### 2.1 Core Objectives
- Eliminate coverage display failures caused by duplicate or matching dependent names through deterministic identity token mapping.
- Introduce an intuitive dependent disambiguation interface that guides members to confirm the exact individual when multiple dependents share common naming attributes.
- Ensure 100% deterministic coverage retrieval by refactoring backend API contracts to require verified unique dependent IDs.
- Provide clear, user-friendly status explanations when a dependent is not elected under a policy rather than displaying a blank or broken benefit card.

### 2.2 In-Scope
- Refactoring the MyMember Benefits Portal dependent selection component to render relationship labels and masked member/dependent IDs.
- Implementing client-side and server-side disambiguation confirmation when name collisions are detected.
- Updating the benefit coverage retrieval API endpoint to mandate dependent_id parameters.
- Comprehensive regression testing fixtures for same-name and duplicate dependent data models.

### 2.3 Out-of-Scope
- Overhauling upstream enterprise master patient index (EMPI) data ingestion systems.
- Modifying underlying policy underwriting or election rules.

---

## 3. User Personas & Use Cases

### 3.1 Target Personas
- **Primary Member**: Enrolled subscriber attempting to review benefits and download dental ID cards for family dependents.
- **Customer Care Specialist**: Internal tier-1/tier-2 support representative answering member calls regarding coverage visibility.
- **Benefits Operations Analyst**: Team member monitoring portal error rates, identity matching accuracy, and policy election discrepancies.

### 3.2 Key Use Cases
- **UC-01 (Disambiguated Selection)**: A member with a spouse and child sharing identical names navigates to the Dental Benefits page. The portal clearly renders person cards with relationship tags ("Spouse" vs "Child") and masked IDs ("ID ending in 4102" vs "ID ending in 8891").
- **UC-02 (Deterministic Benefit Retrieval)**: When the member selects the spouse card, the application issues a secure request keyed exclusively on the unique dependent_id, reliably returning the spouse's active dental coverage.
- **UC-03 (Non-Elected Policy Clarification)**: If a dependent is not elected under a specific coverage tier, the portal displays "Not Enrolled for this Policy" with guidance on enrollment periods, eliminating false defect perceptions.

---

## 4. Functional Requirements

### 4.1 Dependent Selection Component Enhancement
- **FR-01**: The dependent selection UI must display relationship badges (e.g., Spouse, Child, Domestic Partner) alongside every dependent name.
- **FR-02**: The dependent selection UI must display a masked unique identifier (format: ***-**-XXXX) for each dependent to guarantee visible differentiation.
- **FR-03**: If two or more dependents share identical first and last names, the system must disable auto-selection and require explicit manual selection by the member.
- **FR-04**: An inline confirmation badge ("Selected: [Relationship] - [Masked ID]") must appear immediately upon selection.

### 4.2 API Contract & Retrieval Logic
- **FR-05**: The /api/v2/benefits/coverage endpoint must strictly require a validated dependent_id in the request payload or path parameter.
- **FR-06**: The backend must reject coverage queries that rely solely on name or relationship parameters with HTTP 400 (Bad Request: Missing Unique Dependent Identifier).
- **FR-07**: The portal must validate dependent-policy election status prior to requesting plan details.

### 4.3 Error Handling & Status Presentation
- **FR-08**: If coverage retrieval returns empty due to policy non-election, the portal must display an informational card ("Dependent not elected under this dental plan") rather than an error banner or blank screen.
- **FR-09**: Detailed telemetry logs must record the reason code (NOT_ELECTED, INACTIVE_POLICY, DATA_MISMATCH) for support triage without exposing PII.

---

## 5. Non-Functional Requirements (Security, Performance, SLA)

### 5.1 Performance & Latency
- **NFR-01 (Response Latency)**: Dependent card rendering and disambiguation checks must execute within 150ms of initial page load.
- **NFR-02 (API Throughput)**: The updated coverage lookup service must maintain sub-250ms response times at peak load (500 requests/sec).

### 5.2 Security & Compliance
- **NFR-03 (HIPAA & PII Protection)**: Dependent identifiers rendered in the client interface must remain masked at all times (displaying only the last 4 digits).
- **NFR-04 (Token Authorization)**: The dependent_id submitted in API calls must be verified against the authenticated member's session token to prevent unauthorized access across accounts (BOLA prevention).

### 5.3 Reliability & Availability
- **NFR-05 (Availability SLA)**: The benefits coverage retrieval service must maintain 99.95% uptime during open enrollment and standard operational windows.
- **NFR-06 (Graceful Degradation)**: In the event of a partial service degradation, cached election summaries must be rendered with an offline indicator rather than an unhandled UI crash.

---

## 6. System Architecture & Technical Specifications

### 6.1 Architectural Workflow
1. **Client Request**: The client application requests the member's profile and associated dependent list via /api/v2/members/me/dependents.
2. **Disambiguation Check**: The client-side state manager scans the dependent array. If duplicate display names exist, the UI activates the collision disambiguation mode.
3. **User Selection**: The member chooses the desired individual from the disambiguated person cards.
4. **Coverage Lookup**: The client dispatches a GET request to /api/v2/benefits/coverage?dependent_id={unique_id}&policy_type=DENTAL.
5. **Validation & Response**: The backend validates session ownership of dependent_id, verifies policy election status, and returns the plan details payload.

### 6.2 Data Model Changes
- **Dependent Record Attributes**:
  - dependent_id (UUID, Primary Key, Non-Nullable)
  - member_id (UUID, Foreign Key)
  - first_name (String)
  - last_name (String)
  - relationship_code (Enum: SPOUSE, CHILD, DOMESTIC_PARTNER, OTHER)
  - masked_ssn (String: ***-**-XXXX)
  - election_status (Enum: ACTIVE, WAIVED, TERMINATED)

### 6.3 Integration Interfaces
- **Coverage Service Endpoint**: GET /api/v2/benefits/coverage
- **Request Headers**: Authorization: Bearer <JWT>, X-Correlation-ID: <UUID>
- **Query Parameters**: dependent_id=<UUID>, benefit_category=DENTAL
- **Response Format**: JSON containing policy number, tier, deductible status, copay schedules, and active coverage effective dates.
`;

