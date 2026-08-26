// scripts/generate_incidents.js
// Generates 500 realistic incident records into supabase/migrations/02_incidents.sql

import fs from "fs";
import path from "path";

const applications = [
  "Care Dashboard",
  "Care Dashboard",
  "Care Dashboard", // Higher frequency for Care Dashboard test cases
  "TruCare Cloud",
  "Provider Portal",
  "Claims Gateway",
  "Member Portal",
  "Pharmacy Engine",
  "Identity Manager",
];

const businessServices = [
  "Patient Care Management",
  "Clinical Operations",
  "Claims Processing",
  "Provider Network",
  "Member Eligibility",
  "Pharmacy Dispensing",
];

const urgencies = ["1 - High", "2 - Medium", "3 - Low"];
const impacts = ["1 - High", "2 - Medium", "3 - Low"];
const assignedGroups = [
  "L3 Care Dashboard Ops",
  "L2 Platform Engineering",
  "L1 Support",
  "L3 Cloud Infrastructure",
  "L3 Database Admins",
  "L4 Core Architecture",
];

const categories = [
  { cat: "Software", sub: ["Application Crash", "API Timeout", "UI Glitch", "Memory Leak"] },
  { cat: "Database", sub: ["Connection Pool Exhausted", "Deadlock", "Replication Lag"] },
  { cat: "Network", sub: ["VPN Gateway Timeout", "DNS Resolution Failure", "Firewall Block"] },
  { cat: "Hardware", sub: ["Disk Space Full", "CPU Throttling"] },
  { cat: "Security", sub: ["Token Expiry Error", "Authentication Failure"] },
];

const channels = ["Monitoring Alert", "User Portal Ticket", "Phone Call", "Email Alert"];
const slaBreachedOptions = ["Yes", "No", "No", "No"]; // ~25% SLA breach rate
const resolutionCodes = [
  "Solved - Service Restart",
  "Solved - Code Patch",
  "Solved - Config Change",
  "Solved - Database Indexing",
  "Solved - Infrastructure Scale",
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Generate realistic date between start and end
function getRandomDate(startDate, endDate) {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const date = new Date(startMs + Math.random() * (endMs - startMs));
  return date.toISOString().split("T")[0];
}

const records = [];

// Ensure specific test records exist
// 1. High MTTR top incidents
// 2. High priority Care Dashboard incidents in Jan 2025
for (let i = 1; i <= 500; i++) {
  let app = getRandomItem(applications);
  let urgency = getRandomItem(urgencies);
  let slaBreached = getRandomItem(slaBreachedOptions);
  let categoryObj = getRandomItem(categories);
  let category = categoryObj.cat;
  let subcategory = getRandomItem(categoryObj.sub);

  let dateStr;
  if (i <= 180) {
    // 180 incidents in January 2025 (2025-01-01 to 2025-01-31)
    const day = String(getRandomInt(1, 31)).padStart(2, "0");
    dateStr = `2025-01-${day}`;
  } else if (i <= 350) {
    // 2024 dates
    dateStr = getRandomDate(new Date("2024-06-01"), new Date("2024-12-31"));
  } else {
    // Feb 2025 dates
    dateStr = getRandomDate(new Date("2025-02-01"), new Date("2025-02-28"));
  }

  // Force some specific high MTTR records
  let mttr = getRandomFloat(0.5, 48.0);
  if (i === 1) {
    app = "Care Dashboard";
    urgency = "1 - High";
    dateStr = "2025-01-12";
    mttr = 120.5;
    slaBreached = "Yes";
  } else if (i === 2) {
    app = "Care Dashboard";
    urgency = "1 - High";
    dateStr = "2025-01-15";
    mttr = 98.2;
    slaBreached = "Yes";
  } else if (i === 3) {
    app = "TruCare Cloud";
    urgency = "1 - High";
    dateStr = "2025-01-18";
    mttr = 94.0;
    slaBreached = "Yes";
  } else if (i === 4) {
    app = "Care Dashboard";
    urgency = "1 - High";
    dateStr = "2025-01-20";
    mttr = 88.7;
    slaBreached = "Yes";
  } else if (i === 5) {
    app = "Claims Gateway";
    urgency = "1 - High";
    dateStr = "2025-01-22";
    mttr = 85.1;
    slaBreached = "Yes";
  }

  const shortDesc = `${category} - ${subcategory} on ${app}`;
  const desc = `Automated telemetry incident reported for ${app} impacting ${category}. Root cause identified as ${subcategory.toLowerCase()}.`;
  const rootCause = `${subcategory} issue in ${app} microservice.`;
  const resNotes = `Resolved by ${getRandomItem(assignedGroups)} via standard runbook procedures.`;

  records.push({
    application: app,
    business_service: getRandomItem(businessServices),
    short_description: shortDesc,
    description: desc,
    impact: getRandomItem(impacts),
    urgency: urgency,
    assigned_group: getRandomItem(assignedGroups),
    category: category,
    subcategory: subcategory,
    environment: "Production",
    channel: getRandomItem(channels),
    root_cause: rootCause,
    resolution_code: getRandomItem(resolutionCodes),
    resolution_notes: resNotes,
    sla_breached: slaBreached,
    reassignment_count: getRandomInt(0, 5),
    age_days: getRandomFloat(1, 14),
    mttr_hours: mttr,
    incident_date: dateStr,
  });
}

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sqlContent = `-- Incidents Table Migration & 500 Incident Seed Records

CREATE TABLE IF NOT EXISTS public.incidents (
    id bigint generated by default as identity primary key,
    application text,
    business_service text,
    short_description text,
    description text,
    impact text,
    urgency text,
    assigned_group text,
    category text,
    subcategory text,
    environment text,
    channel text,
    root_cause text,
    resolution_code text,
    resolution_notes text,
    sla_breached text,
    reassignment_count integer,
    age_days numeric,
    mttr_hours numeric,
    incident_date date,
    created_at timestamptz default now()
);

-- Indexing for common query filters
CREATE INDEX IF NOT EXISTS idx_incidents_application ON public.incidents(application);
CREATE INDEX IF NOT EXISTS idx_incidents_urgency ON public.incidents(urgency);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON public.incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_sla_breached ON public.incidents(sla_breached);

-- Clear existing data before seeding
TRUNCATE TABLE public.incidents RESTART IDENTITY;

INSERT INTO public.incidents (
    application, business_service, short_description, description, impact,
    urgency, assigned_group, category, subcategory, environment,
    channel, root_cause, resolution_code, resolution_notes, sla_breached,
    reassignment_count, age_days, mttr_hours, incident_date
) VALUES\n`;

const valueRows = records.map((r) => {
  return `(${escapeSql(r.application)}, ${escapeSql(r.business_service)}, ${escapeSql(r.short_description)}, ${escapeSql(r.description)}, ${escapeSql(r.impact)}, ` +
    `${escapeSql(r.urgency)}, ${escapeSql(r.assigned_group)}, ${escapeSql(r.category)}, ${escapeSql(r.subcategory)}, ${escapeSql(r.environment)}, ` +
    `${escapeSql(r.channel)}, ${escapeSql(r.root_cause)}, ${escapeSql(r.resolution_code)}, ${escapeSql(r.resolution_notes)}, ${escapeSql(r.sla_breached)}, ` +
    `${r.reassignment_count}, ${r.age_days}, ${r.mttr_hours}, ${escapeSql(r.incident_date)})`;
});

sqlContent += valueRows.join(",\n") + ";\n";

const outputPath = path.resolve("supabase/migrations/02_incidents.sql");
fs.writeFileSync(outputPath, sqlContent, "utf-8");

console.log(`Successfully generated 500 incidents in ${outputPath}`);
