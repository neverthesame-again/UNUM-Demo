/* eslint-disable react-hooks/set-state-in-effect */
// Domain & Role Dynamic Landing Page Component with Multi-Tab Mock Views

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { landingPageService } from "../services/landing-page.service";
import { BUSINESS_AREAS, getRolesForBusinessArea } from "../constants/business-areas";
import { Footer } from "../components/Footer";
import { Chatbot } from "../components/chatbot";
import { AdRoleBotWidget } from "../components/AdRoleBotWidget";
import { UnifiedBotWidget } from "../components/UnifiedBotWidget";
import { useToast } from "../components/Toast";
import { PipelineModal } from "../components/project-detail/PipelineModal";
import { Modal } from "../components/Modal";
import { Icon } from "../components/Icon";
import {
  GREENFIELD_PIPELINE_URL,
  BROWNFIELD_PIPELINE_ENDPOINT,
} from "../constants/pipeline";
import { WorkspacePanel } from "../components/WorkspacePanel";
import { domainDetailService } from "../services/domain-detail.service";
import { amsOverviewData } from "../data/mock/landing-mock";

// Controls visibility of the Chatbot floating circle based on business area and role.
// Enabled for Support Engineer & Software Engineer under AI for AMS.
const isChatbotEnabled = (businessArea, role) => {
  return (
    businessArea === "AI for AMS" &&
    (role === "Support Engineer" ||
      role === "Software Engineer" ||
      role.includes("Support") ||
      role.includes("Engineer"))
  );
};

export default function LandingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showPrdModal, setShowPrdModal] = useState(false);
  const [selectedPrdItem, setSelectedPrdItem] = useState(null);
  const [showClaimsModal, setShowClaimsModal] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);

  // Application Workspaces States for AD Developer
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(() => {
    const saved = sessionStorage.getItem("landing_selected_workspace");
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  // Selected Domain & Role states (defaulting to user session context or 'AI for AD' -> 'Product Owner')
  const [selectedArea, setSelectedArea] = useState(user?.activeBusinessArea || "AI for AD");
  const [selectedRole, setSelectedRole] = useState(() => {
    const role = user?.activeRole;
    if (role === "Admin" || role === "Tester") return "Product Owner";
    return role || "Product Owner";
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
    setDeterministicMessages([]);
    setDeterministicInputValue("");
    setDeterministicAgentTyping(false);
    setDeterministicModalOpen(true);
  };

  useEffect(() => {
    let timer;
    if (deterministicIsRunning && deterministicModalOpen) {
      const stepCount = deterministicMessages.length;
      const isFlow1 = deterministicItem?.num === "RITM004120";
      
      const addMsg = (sender, text) => {
        setDeterministicMessages((prev) => [
          ...prev,
          { id: prev.length + 1, sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
        ]);
      };

      if (stepCount === 1) {
        setDeterministicAgentTyping(true);
        timer = setTimeout(() => {
          setDeterministicAgentTyping(false);
          addMsg("agent", isFlow1 ? "I'm sorry to hear you're experiencing trouble with this. Are you trying to register for an account?" : "I understand how frustrating that can be, and I'd be happy to help. Are you trying to register for an account?");
        }, 2000);
      } else if (stepCount === 3) {
        setDeterministicAgentTyping(true);
        timer = setTimeout(() => {
          setDeterministicAgentTyping(false);
          addMsg("agent", isFlow1 ? "Thank you. Could you please provide the exact date of birth you are attempting to enter?" : "Got it. Could you please share the exact date of birth you are typing into the field?");
        }, 2000);
      } else if (stepCount === 5) {
        setDeterministicAgentTyping(true);
        timer = setTimeout(() => {
          setDeterministicAgentTyping(false);
          addMsg("agent", isFlow1 
            ? "Thank you for sharing that. Your information is perfectly correct! However, our system strictly accepts dates in the MM-DD-YYYY format using dashes instead of slashes. For example: 08-14-1992. Could you please try entering it this way so we can proceed?" 
            : "Thank you. Your information is correct, but it looks like the month and day are reversed. Our system requires the month first in the MM-DD-YYYY format (e.g. 10-25-1988). Can you please try entering it in that specific format?");
        }, 3000);
      } else if (stepCount === 7) {
        setDeterministicAgentTyping(true);
        timer = setTimeout(() => {
          setDeterministicAgentTyping(false);
          setDeterministicMessages((prev) => [
            ...prev,
            { id: prev.length + 1, sender: "system", text: "🎉 Issue is resolved successfully!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), isSuccess: true }
          ]);
          setDeterministicIsRunning(false);
          setDeterministicIsResolved(true);
          if (deterministicItem) {
            deterministicItem.status = "Resolved (Deterministic)";
            deterministicItem.statusType = "good";
            deterministicItem.resolution = "Validated & Corrected";
            deterministicItem.timeToResolve = "12 seconds";
            deterministicItem.csat = "5/5 Stars";
            deterministicItem.isResolved = true;
          }
        }, 2000);
      }
    }
    return () => clearTimeout(timer);
  }, [deterministicIsRunning, deterministicModalOpen, deterministicMessages.length, deterministicItem]);

  useEffect(() => {
    let timer;
    if (ignioIsRunning && ignioCurrentStep > 0 && ignioCurrentStep < 4) {
      timer = setTimeout(() => {
        setIgnioCurrentStep((prev) => prev + 1);
      }, 2200);
    } else if (ignioIsRunning && ignioCurrentStep === 4) {
      timer = setTimeout(() => {
        setIgnioIsRunning(false);
        setIgnioIsResolved(true);
        if (ignioItem) {
          ignioItem.status = "Resolved (ignio)";
          ignioItem.statusType = "good";
          ignioItem.resolution = ignioItem.resolution || "ignio Autonomous Healing Executed (100% Success)";
          ignioItem.timeToResolve = "8 seconds";
          ignioItem.csat = "5/5 Stars";
          ignioItem.isResolved = true;
        }
      }, 1800);
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
    let availableRoles = getRolesForBusinessArea(newArea);
    if (newArea === "AI for AMS") {
      availableRoles = availableRoles.filter((r) => r.value !== "Software Engineer");
    } else if (newArea === "AI for AD") {
      availableRoles = availableRoles.filter((r) => r.value !== "Developer");
    }
    if (availableRoles && availableRoles.length > 0) {
      setSelectedRole(availableRoles[0].value);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("landing_active_tab", tabId);
  };

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

  let currentAvailableRoles = getRolesForBusinessArea(selectedArea);
  if (user?.activeRole) {
    const matched = currentAvailableRoles.filter((r) => r.value === user.activeRole);
    currentAvailableRoles = matched.length > 0 ? matched : [{ value: user.activeRole, label: user.activeRole }];
  }
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

  const displayTabs = tabs.filter((t) => {
    if (isPOPage) {
      if (t.id === "epics" || t.id === "user_stories" || t.id === "acceptance_criteria") {
        return false;
      }
    }
    if (selectedArea === "AI for AMS" && t.id === "applications") {
      return false;
    }
    return true;
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

  return (
    <>
      <main className="re-landing-page fade-in">
        {/* Domain & Role Context Selector Bar */}
        {!selectedWorkspace && (
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
                🎯 Role Context Switcher:
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Viewing as <strong>{selectedRole}</strong> under <strong>{selectedArea}</strong>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>
                  {selectedArea === "AI for AMS" ? "L1 Classification:" : "Domain:"}
                </label>
                <select
                  value={selectedArea === "AI for AMS" ? "Acquisition" : selectedArea}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Acquisition") {
                      handleAreaChange("AI for AMS");
                    } else {
                      handleAreaChange(val);
                    }
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
                  {selectedArea === "AI for AMS" ? (
                    <option value="Acquisition" style={{ background: "var(--surface-select-option)", color: "var(--text-primary)" }}>
                      Acquisition
                    </option>
                  ) : (
                    BUSINESS_AREAS.filter((a) => a.status !== "coming_soon" && (selectedArea !== "AI for AD" || a.name !== "AI for AMS")).map((area) => (
                      <option
                        key={area.id}
                        value={area.name}
                        style={{ background: "var(--surface-select-option)", color: "var(--text-primary)" }}
                      >
                        {area.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>
                  Role:
                </label>
                <select
                  value={selectedRole}
                  disabled={!!user?.activeRole}
                  onChange={(e) => {
                    sessionStorage.removeItem("landing_active_tab");
                    sessionStorage.removeItem("landing_selected_workspace");
                    setSelectedRole(e.target.value);
                  }}
                  style={{
                    background: "var(--surface-input)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: user?.activeRole ? "default" : "pointer",
                    opacity: user?.activeRole ? 0.95 : 1,
                  }}
                >
                  {currentAvailableRoles.map((r) => (
                    <option
                      key={r.value}
                      value={r.value}
                      style={{ background: "var(--surface-select-option)", color: "var(--text-primary)" }}
                    >
                      {r.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

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
                  ? `Good morning, Product Owner — ${activeApp.name} Backlog & Sprint 42 Summary`
                  : summary.greeting}
              </div>
              <div className="re-summary-sub">
                {selectedArea === "AI for AD" && selectedRole === "Product Owner"
                  ? `${activeApp.name} active workspace · ${currentAppData?.epics?.length || 3} Epics · ${currentAppData?.user_stories?.length || 8} User Stories · ${currentAppData?.acceptance_criteria?.length || 3} Acceptance Criteria ready`
                  : summary.subtext}
              </div>
            </div>
            <div className="re-chips">
              {summary.chips.map((chip) => (
                <span
                  key={chip.id}
                  className={`re-pill ${chip.type === "warn" || chip.type === "danger" ? "warn" : ""}`}
                >
                  {chip.text}
                </span>
              ))}
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
                      <span style={{ fontSize: "10px", marginLeft: "2px" }}>▾</span>
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
        {!selectedWorkspace && isPOPage && selectedApp && currentAppData && (
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
                Clear ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab View 1: Overview Grid View */}
        {activeTab === "overview" && (
          selectedArea === "AI for AMS" ? (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>
              {/* 1. Middle 3 Columns Section */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                {/* Column 1: Observability */}
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
                      background: "#0891b2",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#ffffff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "14px" }}>
                      <Icon name="zap" size={18} />
                      Observability
                    </div>
                  </div>
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => {
                        window.open("https://ismartams.tcsapps.com/member-portal-observability/", "_blank") || (window.location.href = "https://ismartams.tcsapps.com/member-portal-observability/");
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Claims</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#ef4444",
                            background: "rgba(239, 68, 68, 0.12)",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
                          Active
                        </span>
                        <Icon name="externalLink" size={14} style={{ color: "#ef4444" }} />
                      </div>
                    </button>

                    {/* Member Enrollment & Eligibility (Yellow) */}
                    <div
                      style={{
                        background: "rgba(234, 179, 8, 0.08)",
                        border: "1px solid rgba(234, 179, 8, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Member Enrollment & Eligibility</span>
                      </div>
                    </div>

                    {/* Provider Management (Green) */}
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Provider Management</span>
                      </div>
                    </div>

                    {/* Billing & Premium Management (Purple) */}
                    <div
                      style={{
                        background: "rgba(139, 92, 246, 0.08)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Billing & Premium Management</span>
                      </div>
                    </div>

                    {/* Customer Service (Orange) */}
                    <div
                      style={{
                        background: "rgba(249, 115, 22, 0.08)",
                        border: "1px solid rgba(249, 115, 22, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Customer Service</span>
                      </div>
                    </div>

                    {/* Finance & Compliance (Cyan) */}
                    <div
                      style={{
                        background: "rgba(6, 182, 212, 0.08)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "13px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Finance & Compliance</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Column 1: Needs My Action */}
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
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "10px 12px",
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

                {/* Column 2: Waiting for My Approval */}
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
                      {amsOverviewData.waitingForMyApproval.badge}
                    </span>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    {amsOverviewData.waitingForMyApproval.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span
                            style={{
                              background: "#c2410c",
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
              </div>
            </div>
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
              {/* Active Application Status Banner */}
              {selectedApp && currentAppData && (
                <div
                  style={{
                    background: "var(--surface-input)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        background: "var(--cyan)",
                        color: "#ffffff",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="check" size={14} />
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                        Active Application: {selectedApp.name}
                      </span>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        Displaying application-specific Epics ({currentAppData.epics?.length || 0}), User Stories ({currentAppData.user_stories?.length || 0}) & Acceptance Criteria ({currentAppData.acceptance_criteria?.length || 0})
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(null);
                      handleTabClick("overview");
                    }}
                    style={{
                      background: "rgba(8, 145, 178, 0.15)",
                      border: "1px solid rgba(8, 145, 178, 0.4)",
                      color: "var(--cyan)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "700",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Clear Selection ✕
                  </button>
                </div>
              )}

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
                    {selectedRole} · {selectedArea}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                  {activeTabData.sub}
                </p>
              </div>

              {/* Items Card List Grid or Insights Analytics & Cards */}
              {activeTab === "insights" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* 2-Column Analytics Charts */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
                    {selectedRole === "Software Engineer" ? (
                      <>
                        {/* Panel 1: Software Code Quality & Test Telemetry */}
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                              📊 Software Code Quality & Test Telemetry
                            </h3>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Current Sprint</span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {[
                              { label: "Unit & Integration Test Coverage", count: "94% (Passed)", color: "#10b981", pct: 94 },
                              { label: "Static Code Analysis & Lint Pass Rate", count: "98% (Clean)", color: "#0891b2", pct: 98 },
                              { label: "CI/CD Build Pipeline Speed", count: "3.2 min avg", color: "#8b5cf6", pct: 85 },
                              { label: "Zero-Day Vulnerability Scanning", count: "0 Critical", color: "#34d399", pct: 100 },
                            ].map((cat, i) => (
                              <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                                  <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{cat.label}</span>
                                  <span style={{ color: "var(--text-muted)" }}>{cat.count}</span>
                                </div>
                                <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                                  <div style={{ width: `${cat.pct}%`, height: "100%", background: cat.color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Panel 2: Hotfix & PR Engineering Velocity */}
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                              ⚡ Hotfix & PR Engineering Velocity
                            </h3>
                            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "700" }}>65% Faster</span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[
                              { name: "PR Code Review Lead Time", execs: "1.4h avg", success: "65% Faster", time: "Approved" },
                              { name: "Hotfix Patch Merge Reliability", execs: "42 merges", success: "99.2%", time: "Passed" },
                              { name: "Automated Regression Test Suite", execs: "142 tests", success: "100% Pass", time: "Verified" },
                              { name: "Software Code Complexity Index", execs: "Low Risk", success: "Grade A", time: "Passed" },
                            ].map((rb, i) => (
                              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{rb.name}</div>
                                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{rb.execs} · {rb.time}</div>
                                </div>
                                <span style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px" }}>{rb.success}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Panel 1: Resolution Category Breakdown */}
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                              📊 Incident Resolution Category Distribution
                            </h3>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Last 30 Days</span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {[
                              { label: "Data Validation & Schema Errors", count: "68 tickets (38%)", color: "#0891b2", pct: 38 },
                              { label: "Authentication & Identity Management", count: "48 tickets (27%)", color: "#8b5cf6", pct: 27 },
                              { label: "Database Connection Pool & Latency", count: "36 tickets (20%)", color: "#10b981", pct: 20 },
                              { label: "API Gateway & Integration Timeouts", count: "27 tickets (15%)", color: "#f59e0b", pct: 15 },
                            ].map((cat, i) => (
                              <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                                  <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{cat.label}</span>
                                  <span style={{ color: "var(--text-muted)" }}>{cat.count}</span>
                                </div>
                                <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                                  <div style={{ width: `${cat.pct}%`, height: "100%", background: cat.color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Panel 2: Top Autonomous AI Runbooks Executed */}
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                              ⚡ Top Autonomous Runbooks Executed
                            </h3>
                            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: "700" }}>99.4% Avg Success</span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[
                              { name: "ignio™ Autonomous Healing Payload #89", execs: "142 runs", success: "100%", time: "8s avg" },
                              { name: "Deterministic Data Validation Reconciler", execs: "98 runs", success: "99.2%", time: "6s avg" },
                              { name: "OAuth Token Cache Flusher & Key Rotator", execs: "64 runs", success: "98.4%", time: "12s avg" },
                              { name: "DB Pool Auto-Scaler & Session Drainer", execs: "41 runs", success: "100%", time: "10s avg" },
                            ].map((rb, i) => (
                              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{rb.name}</div>
                                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{rb.execs} · {rb.time}</div>
                                </div>
                                <span style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px" }}>{rb.success}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Simple Insight Cards Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {activeTabData.items && activeTabData.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
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
                              {item.code || item.num || item.title || `Item #${idx + 1}`}
                            </span>
                            {item.status && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  background: item.statusType === "good" ? "rgba(16, 185, 129, 0.15)" : item.statusType === "warn" ? "rgba(245, 158, 11, 0.15)" : "rgba(8, 145, 178, 0.15)",
                                  color: item.statusType === "good" ? "#10b981" : item.statusType === "warn" ? "#f59e0b" : "#38bdf8",
                                }}
                              >
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
                            {item.category && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>🏷️ {item.category}</span>}
                            {item.confidence && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>🤖 {item.confidence}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (!activeTabData.items || activeTabData.items.length === 0) ? (
                <div
                  style={{
                    minHeight: "280px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px dashed var(--border)",
                    borderRadius: "16px",
                    padding: "40px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    width: "100%",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.6 }}>💡</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Insights Workspace
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    This workspace is currently blank and ready for custom insights metrics.
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === "agent_resolve" && (
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                      <button
                        type="button"
                        onClick={() => setAgentResolveFilter("all")}
                        style={{
                          background: agentResolveFilter === "all" ? "var(--text-primary)" : "transparent",
                          color: agentResolveFilter === "all" ? "var(--bg-primary)" : "var(--text-secondary)",
                          border: "1px solid var(--border)",
                          borderRadius: "20px",
                          padding: "6px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        All Items
                      </button>
                      <button
                        type="button"
                        onClick={() => setAgentResolveFilter("ignio")}
                        style={{
                          background: agentResolveFilter === "ignio" ? "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)" : "transparent",
                          color: agentResolveFilter === "ignio" ? "#fff" : "var(--text-secondary)",
                          border: "1px solid",
                          borderColor: agentResolveFilter === "ignio" ? "transparent" : "var(--border)",
                          borderRadius: "20px",
                          padding: "6px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        ignio
                      </button>
                      <button
                        type="button"
                        onClick={() => setAgentResolveFilter("deterministic")}
                        style={{
                          background: agentResolveFilter === "deterministic" ? "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)" : "transparent",
                          color: agentResolveFilter === "deterministic" ? "#fff" : "var(--text-secondary)",
                          border: "1px solid",
                          borderColor: agentResolveFilter === "deterministic" ? "transparent" : "var(--border)",
                          borderRadius: "20px",
                          padding: "6px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        Deterministic
                      </button>
                    </div>
                  )}
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
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: activeTab === "agent_resolve" ? `1px solid ${item.isIgnio ? "rgba(8,145,178,0.5)" : item.isDeterministic ? "rgba(139,92,246,0.5)" : "var(--border)"}` : "1px solid var(--border)",
                        boxShadow: activeTab === "agent_resolve" ? (item.isIgnio ? "0 4px 12px rgba(8,145,178,0.1)" : item.isDeterministic ? "0 4px 12px rgba(139,92,246,0.1)" : "none") : "none",
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
                        {/* Agent Resolve Workflow Badge */}
                        {activeTab === "agent_resolve" && (item.isIgnio || item.isDeterministic) && (
                          <div style={{ marginBottom: "12px", display: "flex", alignItems: "center" }}>
                            <span style={{
                              background: item.isIgnio ? "linear-gradient(135deg, rgba(8,145,178,0.2) 0%, rgba(37,99,235,0.2) 100%)" : "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(6,182,212,0.2) 100%)",
                              border: `1px solid ${item.isIgnio ? "rgba(8,145,178,0.5)" : "rgba(139,92,246,0.5)"}`,
                              color: item.isIgnio ? "#38bdf8" : "#c084fc",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "800",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              {item.isIgnio ? "ignio" : "Deterministic"}
                            </span>
                          </div>
                        )}

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
                            {item.code || item.num || item.build || item.name || item.title || item.subject || item.metric || item.query || item.suite || item.vendor || item.prbCode || item.patch || item.area || `Item #${idx + 1}`}
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

                          {activeTab === "agent_resolve" && item.system && (
                            <div style={{ background: "var(--surface-card)", borderLeft: "3px solid var(--blue)", padding: "10px 12px", margin: "6px 0", borderRadius: "0 8px 8px 0", border: "1px solid var(--border)", borderLeftWidth: "3px" }}>
                              <strong style={{ color: "var(--blue)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Impacted System:</strong>
                              <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>{item.system}</div>
                            </div>
                          )}


                          {/* Key-Value Tag List */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
                            {item.target && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>🎯 Target: {item.target}</span>}
                            {item.points && <span style={{ background: "rgba(0,159,218,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>⭐ {item.points} Points</span>}
                            {item.priority && <span style={{ background: "rgba(247,148,29,0.15)", color: "#f7941d", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>⚡ {item.priority}</span>}
                            {item.progress !== undefined && <span style={{ background: "rgba(151,215,0,0.15)", color: "#97d700", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>📊 {item.progress}% Complete</span>}
                            {item.valueScore && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>💎 Value: {item.valueScore}</span>}
                            {item.duration && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>⏱️ {item.duration}</span>}
                            {item.checks && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>✅ {item.checks}</span>}
                            {item.reviewScore && <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>🤖 Score: {item.reviewScore}</span>}
                            {item.passRate && <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>🎯 Pass: {item.passRate}</span>}
                            {item.slaTimer && <span style={{ background: "rgba(229,83,83,0.15)", color: "#e55353", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>⏳ SLA: {item.slaTimer}</span>}
                            {item.kbMatch && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>📚 KB Match: {item.kbMatch}</span>}
                            {item.confidence && <span style={{ background: "rgba(0,210,211,0.15)", color: "var(--cyan)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>🤖 Confidence: {item.confidence}</span>}
                            {item.tokensUsed && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>🪙 Tokens: {item.tokensUsed}</span>}
                          </div>

                          {/* Application & Ticket Tag */}
                          {(item.code || item.story || item.num) && activeTab !== "agent_resolve" && (
                            <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              {activeApp?.name ? (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                  🚀 Application: <strong>{activeApp.name}</strong>
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
                                  <Icon name="check" size={16} /> Issue Resolved Successfully via {item.isIgnio ? "ignio" : "Deterministic AI"}
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
                                  <Icon name="zap" size={14} /> {item.isIgnio ? "Auto Resolve" : "Agent Resolve"}
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
                📄 AI-Generated PRD Document · {selectedPrdItem?.prbCode || "PRB003210"}
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
                ✕
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
                Sync with AD Development Backlog →
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {/* Deprecated: <Chatbot hideFloat={!isChatbotEnabled(selectedArea, selectedRole)} /> */}

      {/* Unified Bot Widget — shown for AMS Support / Software Engineers */}
      {isChatbotEnabled(selectedArea, selectedRole) && data && (
        <UnifiedBotWidget selectedRole={selectedRole} data={data} onOpenChange={setIsBotOpen} />
      )}

      {/* AI for AD Role Bot Widget — shown when "AI for AD" domain is selected */}
      {selectedArea === "AI for AD" && data && (
        <AdRoleBotWidget selectedRole={selectedRole} data={data} onOpenChange={setIsBotOpen} />
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
                Run SEL Nexus for &quot;{selectedRole === "L3 Support Engineer" ? "L3 Deep Engineering & Hotfix" : selectedRole === "Product Owner" ? "Product Owner Backlog & AC" : selectedRole === "Developer" ? "AD Developer Workspace" : "L4 Support Platform"}&quot; — governed, autonomous
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
          title="Member Portal Observability - Claims"
          videoUrl="https://ismartams.tcsapps.com/member-portal-observability/"
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
                    ignio
                  </h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Target: <strong>{ignioItem?.num || "INC009405"}</strong> — {ignioItem?.subject || "ignio Automated Incident Remediation"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIgnioModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
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
                    title: ignioItem?.num === "INC009432"
                      ? "Connecting to ignio AIOps Engine & Fetching FHIR API Gateway Metrics"
                      : "Connecting to ignio AIOps Engine & Fetching Incident Diagnostics",
                    desc: ignioItem?.num === "INC009432"
                      ? "Establishing secure telemetry stream to Interoperability Gateway node."
                      : "Establishing secure channel to ignio core telemetry node."
                  },
                  {
                    step: 2,
                    title: ignioItem?.num === "INC009432"
                      ? "Analyzing API Traffic Logs & Identifying 429 Rate-Limit Throttling Spike"
                      : "Analyzing Logs & Executing Automated Root Cause Analysis (RCA)",
                    desc: ignioItem?.num === "INC009432"
                      ? "Correlating client request bursts with Token Bucket exhaustion & tripped circuit breaker."
                      : "Parsing application stack traces & correlated metric anomalies."
                  },
                  {
                    step: 3,
                    title: ignioItem?.num === "INC009432"
                      ? "Running ignio Rate-Limit Auto-Expansion & Circuit Breaker Reset Payload"
                      : "Running ignio Automated Remediation & Self-Healing Payload",
                    desc: ignioItem?.num === "INC009432"
                      ? "Expanding throughput ceiling by 2.5x and executing automatic circuit breaker state reset."
                      : "Applying system patch, clearing locks, and recycling target worker threads."
                  },
                  {
                    step: 4,
                    title: ignioItem?.num === "INC009432"
                      ? "Verifying FHIR Gateway Telemetry & Confirming Zero Throttling Drops"
                      : "Verifying System Health Telemetry & Signing Off Resolution",
                    desc: ignioItem?.num === "INC009432"
                      ? "Executing synthetic HL7/FHIR payload test suite; updating ITSM ticket status."
                      : "Executing synthetic health check suite and updating ITSM ticket status."
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
                        {isDone ? "✓" : isCurrent ? "⚙️" : s.step}
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
                      ignio automated remediation completed. Incident status has been updated to <strong>Resolved</strong> with 100% health confirmation.
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
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
                    Deterministic
                  </h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                    Ticket: <strong>{deterministicItem?.num || "RITM004120"}</strong> • Application Data Issue
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeterministicModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "#0b0f19",
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
                      {msg.text}
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

              {deterministicIsRunning && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38bdf8", fontSize: "12px", fontStyle: "italic", padding: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8", animation: "pulse 1s infinite" }} />
                  Deterministic agent is executing validation rules...
                </div>
              )}
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
                const isFlow1 = deterministicItem?.num === "RITM004120";
                
                if (stepCount === 0) {
                  const suggestedText = isFlow1 ? "It says my dob is incorrect but I'm entering the right one." : "The portal won't accept my birthdate. It keeps giving me a validation error.";
                  return (
                    <button
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
