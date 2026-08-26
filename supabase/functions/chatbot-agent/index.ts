const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Configurable section for incident data intent keywords & topics
const INCIDENT_DATA_INTENTS = [
  "incident",
  "incidents",
  "application",
  "priority",
  "urgency",
  "SLA",
  "MTTR",
  "category",
  "assigned group",
  "Care Dashboard",
  "January 2025"
];

// Helper to call Gemini API
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const resp = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    const errDetail = data?.error?.message || `Gemini API Error: ${resp.status}`;
    throw new Error(errDetail);
  }

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."
  );
}

// Router step: Classify user prompt into "incident_data" or "normal_chat"
async function routePrompt(
  apiKey: string,
  userPrompt: string
): Promise<{ route: "incident_data" | "normal_chat" }> {
  const cleanPrompt = userPrompt.trim().toLowerCase();

  // Explicit pattern matching for Membership, TruCare comparisons, & general chat -> normal_chat
  if (
    cleanPrompt.includes("eligibility") ||
    cleanPrompt.includes("trucare classic") ||
    cleanPrompt.includes("trucare cloud versus") ||
    cleanPrompt.includes("what is react") ||
    cleanPrompt.includes("explain sql") ||
    cleanPrompt.includes("what is an api")
  ) {
    return { route: "normal_chat" };
  }

  // Explicit pattern matching for RCA requests & Incident data queries -> incident_data
  if (
    cleanPrompt.includes("rca") ||
    cleanPrompt.includes("root cause") ||
    cleanPrompt.includes("incident details") ||
    cleanPrompt.includes("top 10 incident") ||
    cleanPrompt.includes("top 5 incident") ||
    cleanPrompt.includes("breached sla") ||
    cleanPrompt.includes("highest mttr") ||
    cleanPrompt.includes("how many incidents") ||
    cleanPrompt.includes("incident number") ||
    cleanPrompt.includes("incident #") ||
    cleanPrompt.includes("incident id")
  ) {
    return { route: "incident_data" };
  }

  const routerSystemPrompt = `You are a strict Prompt Intent Router for an IT Assistant.
Classify the user prompt into ONE of two routes:

1. "incident_data":
   - Use this route ONLY IF the prompt asks to query incident dataset records, RCA reports for an incident number, ticket counts, SLA breaches, MTTR metrics, incident details for Care Dashboard/other applications, priority/urgency filters, or date range incident reports.
   - EXAMPLES FOR EXCEL INCIDENT DATA READ:
     - "Provide the top 10 incident details where the Priority is 'High' and the Application is 'Care Dashboard' for January 2025" -> route: "incident_data"
     - "Generate RCA or root cause analysis for incident number 15" -> route: "incident_data"

2. "normal_chat":
   - Use this route for member eligibility questions, TruCare system comparisons, general IT explanations, React, APIs, SQL, or general conversation that DOES NOT query incident records.
   - EXAMPLE NOT FOR EXCEL INCIDENT DATA:
     - "The member’s eligibility dates are different in TruCare Classic versus TruCare Cloud" -> route: "normal_chat"

Return ONLY valid JSON:
{
  "route": "incident_data"
}
OR
{
  "route": "normal_chat"
}`;

  try {
    const rawRes = await callGemini(apiKey, routerSystemPrompt, userPrompt);
    const jsonMatch = rawRes.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.route === "incident_data" || parsed.route === "normal_chat") {
        return { route: parsed.route };
      }
    }
  } catch (err) {
    console.warn("Router model execution error:", err);
  }

  // Fallback
  const isIncidentKeyword =
    cleanPrompt.includes("incident") ||
    cleanPrompt.includes("rca") ||
    cleanPrompt.includes("sla") ||
    cleanPrompt.includes("mttr");

  return { route: isIncidentKeyword ? "incident_data" : "normal_chat" };
}

// Extract structured query intent from prompt for Supabase PostgreSQL
async function extractIncidentQueryIntent(apiKey: string, userPrompt: string) {
  const intentSystemPrompt = `You are an expert IT Incident Query Intent Parser.
Analyze the user prompt and extract search filters & limits for querying the 'incidents' database.

Database Schema Rules:
- Field for priority is 'urgency':
  - User asks "Priority High" or "high priority" -> urgency = "1 - High"
  - User asks "Priority Medium" -> urgency = "2 - Medium"
  - User asks "Priority Low" -> urgency = "3 - Low"
- application examples: 'Care Dashboard', 'TruCare Cloud', 'Claims Gateway', 'Provider Portal', etc.
- incident ID: If user asks for "Incident ID INC2526457", "Incident #INC2526457", or "RCA for incident 15" -> id = "INC2526457" or "15" (keep as a string, preserving any characters and prefix)
- is_rca_request: true if user asks for "RCA", "Root Cause Analysis", or "root cause", otherwise false
- date range:
  - User asks "January 2025" -> date_from = "2025-01-01", date_to = "2025-02-01"
- sla_breached: "Yes" or "No"
- limits: If top 10 is asked -> limit = 10. If top 5 is asked -> limit = 5. Default limit = 50.
- sort_by: "mttr_hours", "incident_date", "reassignment_count", or null

Return ONLY valid JSON with no markdown syntax wrapping:
{
  "id": string | null,
  "is_rca_request": boolean,
  "application": string | null,
  "urgency": string | null,
  "category": string | null,
  "sla_breached": string | null,
  "date_from": string | null,
  "date_to": string | null,
  "sort_by": string | null,
  "sort_order": "desc" | "asc",
  "limit": number | null,
  "is_count_only": boolean
}`;

  try {
    const rawRes = await callGemini(apiKey, intentSystemPrompt, userPrompt);
    const jsonMatch = rawRes.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error("Failed to parse query intent:", err);
  }

  // Code fallback for extracting incident number or alphanumeric ID (e.g. INC2526457 or 15)
  const numMatch = userPrompt.match(/(?:incident|ticket|#)\s*([a-z0-9\-]+)/i);
  const extractedId = numMatch ? numMatch[1].toUpperCase() : null;
  const isRca = userPrompt.toLowerCase().includes("rca") || userPrompt.toLowerCase().includes("root cause");

  return { id: extractedId, is_rca_request: isRca, limit: 50, sort_by: "incident_date", sort_order: "desc", is_count_only: false };
}

// Execute query against Supabase incidents REST API
async function querySupabaseIncidents(queryIntent: any, supabaseUrl: string, serviceKey: string) {
  const endpoint = new URL(`${supabaseUrl}/rest/v1/incidents`);

  endpoint.searchParams.set(
    "select",
    "id,application,business_service,short_description,description,impact,urgency,assigned_group,category,subcategory,environment,channel,root_cause,resolution_code,resolution_notes,sla_breached,reassignment_count,age_days,mttr_hours,incident_date"
  );

  if (queryIntent.id) {
    endpoint.searchParams.set("id", `eq.${queryIntent.id}`);
  }

  if (queryIntent.application) {
    endpoint.searchParams.set("application", `eq.${queryIntent.application}`);
  }

  if (queryIntent.urgency) {
    let urgVal = queryIntent.urgency;
    if (urgVal.toLowerCase().includes("high")) urgVal = "1 - High";
    else if (urgVal.toLowerCase().includes("medium")) urgVal = "2 - Medium";
    else if (urgVal.toLowerCase().includes("low")) urgVal = "3 - Low";
    endpoint.searchParams.set("urgency", `eq.${urgVal}`);
  }

  if (queryIntent.category) {
    endpoint.searchParams.set("category", `ilike.*${queryIntent.category}*`);
  }

  if (queryIntent.sla_breached) {
    const slaVal = queryIntent.sla_breached.toLowerCase().includes("yes") ? "Yes" : "No";
    endpoint.searchParams.set("sla_breached", `eq.${slaVal}`);
  }

  if (queryIntent.date_from) {
    endpoint.searchParams.append("incident_date", `gte.${queryIntent.date_from}`);
  }

  if (queryIntent.date_to) {
    endpoint.searchParams.append("incident_date", `lt.${queryIntent.date_to}`);
  }

  if (queryIntent.sort_by) {
    const order = queryIntent.sort_order || "desc";
    endpoint.searchParams.set("order", `${queryIntent.sort_by}.${order}`);
  } else {
    endpoint.searchParams.set("order", "incident_date.desc");
  }

  const fetchLimit = queryIntent.limit || 50;
  endpoint.searchParams.set("limit", String(fetchLimit));

  const resp = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "count=exact",
    },
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Supabase REST query error:", resp.status, errText);
    return { data: [], totalCount: 0 };
  }

  const data = await resp.json();
  const contentRange = resp.headers.get("content-range");
  let totalCount = data.length;
  if (contentRange && contentRange.includes("/")) {
    totalCount = parseInt(contentRange.split("/")[1], 10) || data.length;
  }

  return { data, totalCount };
}

const port = Number(Deno.env.get("PORT")) || 54321;

Deno.serve({ port }, async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const apiKey =
      Deno.env.get("GEMINI_API_KEY") || Deno.env.get("OPENAI_API_KEY");

    if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY") {
      return new Response(
        JSON.stringify({
          error: "Please set your valid GEMINI_API_KEY in supabase/functions/.env",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message = body.message;

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const sessionId = body.sessionId;

    let historyText = "";
    let lastBotMessage = "";

    if (supabaseUrl && serviceKey && sessionId) {
      const endpoint = new URL(`${supabaseUrl}/rest/v1/chat_messages`);
      endpoint.searchParams.set("session_id", `eq.${sessionId}`);
      endpoint.searchParams.set("order", "timestamp.desc");
      endpoint.searchParams.set("limit", "10");

      try {
        const resp = await fetch(endpoint.toString(), {
          method: "GET",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        });
        if (resp.ok) {
          const rawMsgs = await resp.json();
          if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
            const chronoMsgs = [...rawMsgs].reverse();
            historyText = chronoMsgs
              .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
              .join("\n\n");

            const lastBotMsgObj = rawMsgs.find((msg) => msg.sender === "bot");
            if (lastBotMsgObj) {
              lastBotMessage = lastBotMsgObj.text;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }

    let userPromptWithHistory = message;
    if (historyText) {
      userPromptWithHistory = `Conversation History:\n${historyText}\n\nUser: ${message}`;
    }

    // Step 1: Prompt Router (incident_data vs normal_chat)
    const routeResult = await routePrompt(apiKey, message);
    console.log(`[Router Decision] Prompt: "${message}" -> Route: "${routeResult.route}"`);

    let replyText = "";

    if (routeResult.route === "incident_data") {
      // Incident Data Flow:
      // 1. Interpret user query & extract filters
      const queryIntent = await extractIncidentQueryIntent(apiKey, userPromptWithHistory);

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");

      let retrievedRecords: any[] = [];
      let totalCount = 0;

      if (supabaseUrl && serviceKey) {
        const queryRes = await querySupabaseIncidents(queryIntent, supabaseUrl, serviceKey);
        retrievedRecords = queryRes.data;
        totalCount = queryRes.totalCount;
      }

      if (queryIntent.is_rca_request && retrievedRecords.length > 0) {
        // RCA Report Generation Prompt
        const inc = retrievedRecords[0];
        const rcaSystemPrompt = `You are a Lead IT Operations Engineer generating an official Root Cause Analysis (RCA) report.
Based ONLY on the retrieved incident record below, generate a professional, structured RCA document.

Incident Data:
- ID: ${inc.id}
- Application: ${inc.application || 'N/A'}
- Business Service: ${inc.business_service || 'N/A'}
- Short Description: ${inc.short_description || 'N/A'}
- Full Description: ${inc.description || 'N/A'}
- Impact: ${inc.impact || 'N/A'}
- Urgency: ${inc.urgency || 'N/A'}
- Assigned Group: ${inc.assigned_group || 'N/A'}
- Category: ${inc.category || 'N/A'} / ${inc.subcategory || 'N/A'}
- Root Cause: ${inc.root_cause || 'N/A'}
- Resolution Code: ${inc.resolution_code || 'N/A'}
- Resolution Notes: ${inc.resolution_notes || 'N/A'}
- SLA Breached: ${inc.sla_breached || 'N/A'} (MTTR: ${inc.mttr_hours || 0} hours)
- Incident Date: ${inc.incident_date || 'N/A'}

Formulate your response in clean Markdown with these sections:
# Root Cause Analysis (RCA) — Incident #${inc.id}
- **Incident Summary**: Executive overview of the incident.
- **Incident Metadata**: Application, Impact, Urgency, Assigned Group, Date.
- **Root Cause & Technical Trigger**: Detailed analysis of the root cause.
- **Resolution & Fix Applied**: Resolution code & resolution notes executed.
- **SLA & Recovery Impact**: MTTR duration and SLA breach status.
- **Preventative Action Items**: Key recommendations to avoid recurrence.

At the very end of your entire response (exactly once, after all sections and content are complete), you MUST ask the user on a new line:
"Do you want to create Jira feature enhancment request ticket?"

CRITICAL CLIENT RULES:
- Do NOT mention "database", "Supabase", "table", "retrieved records", or internal query execution.`;

        replyText = await callGemini(apiKey, rcaSystemPrompt, userPromptWithHistory);
      } else {
        // General Incident Data Listing / Metrics Prompt
        const cleanMsg = message.toLowerCase();
        const isStoryOrJira = cleanMsg.includes("jira") || cleanMsg.includes("story") || cleanMsg.includes("ticket") || cleanMsg.includes("solution") || cleanMsg.includes("enhancement") || cleanMsg.includes("proposed");

        let incidentSystemPrompt = `You are an executive IT Operations Assistant.
Answer the user's prompt directly, clearly, and professionally based on the incident data provided below.

CRITICAL CLIENT-FACING RULES:
1. NEVER mention internal system terms or technical backend details such as "Supabase", "database", "retrieved records", "dataset of X records", "SQL query", "table", "limit", or "IDs present in batch".
2. NEVER title your response with internal headers like "GuideWell AI Hub Incident Analyst Report" or explain internal search mechanisms.
3. Present the information directly to the client using clean Markdown tables, key metrics, bold summaries, or bullet points.
4. If a specific incident ID or item requested is not found, state simply and clearly: "Incident #[ID] was not found in the records." Do NOT list other IDs or explain batch limits.
5. Provide a polished, professional response suitable for presentation to executives and clients.`;

        if (isStoryOrJira) {
          incidentSystemPrompt += `\n6. At the very end of your entire response (exactly once, after all sections and items are complete), you MUST ask the user on a new line:
"Would you like me to analyze this enhancement and create a detailed PRD?"`;
        }

        incidentSystemPrompt += `\n\nTotal Incident Count: ${totalCount}

Incident Records:
${JSON.stringify(retrievedRecords, null, 2)}`;

        replyText = await callGemini(apiKey, incidentSystemPrompt, userPromptWithHistory);
      }
    } else {
      // Normal Chat Flow (Membership, Eligibility, PRD creation, TruCare comparisons, General IT):
      let normalSystemPrompt = `You are a professional IT Operations Assistant.
Answer the user's prompt directly, clearly, professionally, and concisely using Markdown formatting.
Do NOT mention internal backend implementation details, database names, or prompt routing mechanisms.`;

      const cleanMsg = message.toLowerCase();
      const isJiraQuery = cleanMsg.includes("jira") || cleanMsg.includes("story") || cleanMsg.includes("ticket");

      if (isJiraQuery) {
        normalSystemPrompt += `\n\nADDITIONAL MANDATORY RULE FOR JIRA/STORY/TICKET GENERATION:
At the very end of your entire response (exactly once, after all sections and details are complete), you MUST ask the user on a new line:
"Would you like me to analyze this enhancement and create a detailed PRD?"`;
      }

      const cleanLastBot = lastBotMessage.toLowerCase();

      // Check if user is replying affirmatively to the Jira ticket offer
      const isJiraOffer = cleanLastBot.includes("do you want to create jira feature");
      const isAffirmative = [
        "yes", "yeah", "yep", "sure", "do it", "go ahead", "create prd", "generate prd", "create", "generate", "prd", "yes please", "create jira", "create ticket"
      ].some((pat) => cleanMsg.includes(pat));

      const isYesToJira = isAffirmative && isJiraOffer;

      // Check if user is replying affirmatively to the PRD offer
      const isPrdOffer = cleanLastBot.includes("would you like me to analyze this enhancement and create a detailed prd?");
      const shouldGeneratePRD =
        cleanMsg.includes("prd") ||
        cleanMsg.includes("product requirement") ||
        (isAffirmative && isPrdOffer);

      let wasJiraCreated = false;
      if (isYesToJira) {
        // 1. Prompt Gemini to output JIRA ticket details in clean JSON format
        const jiraGenPrompt = `You are a Lead Systems Analyst.
Based on the Root Cause Analysis (RCA) report and incident details described in the conversation history, generate the details for a JIRA Feature Enhancement Request Ticket.

You MUST return ONLY valid JSON with no markdown formatting or extra text:
{
  "summary": "Descriptive JIRA story title (e.g., Fix Data Mapping Issue in Care Dashboard)",
  "description": "A comprehensive JIRA story description, including: Technical context, Acceptance Criteria, and Technical Tasks needed to implement the fix."
}`;

        try {
          const rawJiraJson = await callGemini(apiKey, jiraGenPrompt, userPromptWithHistory);
          const jsonMatch = rawJiraJson.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsedJira = JSON.parse(jsonMatch[0]);

            const jiraEmail = Deno.env.get("JIRA_EMAIL") || "saigutta1994@gmail.com";
            const jiraToken = Deno.env.get("JIRA_API_TOKEN") || "";
            const jiraBaseUrl = Deno.env.get("JIRA_BASE_URL") || "https://saigutta1994.atlassian.net/";
            const jiraProjKey = Deno.env.get("JIRA_PROJECT_KEY") || "SCRUM";

            if (!jiraToken) {
              throw new Error("Jira API token is not configured. Please ensure JIRA_API_TOKEN is set in your environment variables.");
            }

            if (jiraBaseUrl) {
              const authHeader = btoa(`${jiraEmail}:${jiraToken}`);
              const cleanBaseUrl = jiraBaseUrl.endsWith("/") ? jiraBaseUrl.slice(0, -1) : jiraBaseUrl;

              const jiraResponse = await fetch(`${cleanBaseUrl}/rest/api/3/issue`, {
                method: "POST",
                headers: {
                  "Authorization": `Basic ${authHeader}`,
                  "Accept": "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  fields: {
                    project: { key: jiraProjKey },
                    summary: parsedJira.summary,
                    description: {
                      type: "doc",
                      version: 1,
                      content: [{
                        type: "paragraph",
                        content: [{ type: "text", text: parsedJira.description }]
                      }]
                    },
                    issuetype: { name: "Task" }
                  }
                })
              });

              if (jiraResponse.ok) {
                const jiraData = await jiraResponse.json();
                const ticketKey = jiraData.key;
                const ticketUrl = `${jiraBaseUrl.endsWith("/") ? jiraBaseUrl : jiraBaseUrl + "/"}browse/${ticketKey}`;
                const allTicketsUrl = `${jiraBaseUrl.endsWith("/") ? jiraBaseUrl : jiraBaseUrl + "/"}issues/?jql=project%20%3D%20"${jiraProjKey}"`;

                replyText = `### 🎫 JIRA Ticket Created Successfully!

**Ticket Details:**
* **Summary**: ${parsedJira.summary}
* **Project Key**: ${jiraProjKey}

🔗 **[View Jira Ticket ${ticketKey}](${ticketUrl})**
🔗 **[View All Tickets in Jira](${allTicketsUrl})**

Would you like me to analyze this enhancement and create a detailed PRD?`;
                wasJiraCreated = true;
              } else {
                const errText = await jiraResponse.text();
                console.error("JIRA API Error:", jiraResponse.status, errText);
                throw new Error(`JIRA API responded with ${jiraResponse.status}: ${errText}`);
              }
            } else {
              throw new Error("JIRA_BASE_URL not configured.");
            }
          } else {
            throw new Error("Gemini did not return valid JSON for JIRA ticket.");
          }
        } catch (err) {
          console.warn("Failed to create real JIRA ticket, falling back to mock presentation:", err);

          const errDetail = err instanceof Error ? err.message : String(err);
          const jiraBaseUrl = Deno.env.get("JIRA_BASE_URL") || "https://saigutta1994.atlassian.net/";
          const jiraProjKey = Deno.env.get("JIRA_PROJECT_KEY") || "SCRUM";
          const cleanBaseUrl = jiraBaseUrl.endsWith("/") ? jiraBaseUrl.slice(0, -1) : jiraBaseUrl;
          const allTicketsUrl = `${cleanBaseUrl}/issues/?jql=project%20%3D%20"${jiraProjKey}"`;

          const fallbackJiraPrompt = `You are a Lead Systems Analyst.
Based on the Root Cause Analysis (RCA) report and incident details described in the conversation history, generate a detailed JIRA Feature Enhancement Request Ticket.

Formulate your response in clean Markdown with these sections:
# JIRA Feature Enhancement Request
- **Title**: Descriptive story title.
- **Description**: Summary of the enhancement and technical context.
- **Acceptance Criteria**: Functional requirements to be tested.
- **Technical Tasks**: Engineering steps to implement the fix.

[🔗 View All Tickets in Jira](${allTicketsUrl})

ADDITIONAL MANDATORY RULE:
At the very end of your entire response (exactly once, after all content is complete), you MUST ask the user on a new line:
"Would you like me to analyze this enhancement and create a detailed PRD?"`;

          const mockReply = await callGemini(apiKey, fallbackJiraPrompt, userPromptWithHistory);
          replyText = `*(Note: Real JIRA ticket creation fell back to mock. Reason: ${errDetail})*\n\n${mockReply}`;
          wasJiraCreated = true; // prevent double callGemini at the end of normal flow
        }
      } else if (shouldGeneratePRD) {
        normalSystemPrompt = `You are a Lead Technical Product Manager.
The user is requesting a Product Requirement Document (PRD). Create a comprehensive, executive-ready document.

MANDATORY PRD STRUCTURE:
# Product Requirement Document (PRD)
## 1. Executive Summary & Problem Statement
## 2. Objectives & Scope
## 3. User Personas & Use Cases
## 4. Functional Requirements
## 5. Non-Functional Requirements (Security, Performance, SLA)
## 6. System Architecture & Technical Specifications
## 7. Success Metrics & Release Milestones

COMPULSORY DOWNLOAD & AUTOMATION PIPELINE SECTION:
At the very end of your PRD response, you MUST append a download and execution section with this exact markdown content:
---
### 📥 Document Download
[📥 Download PRD (.docx)](#download-prd)

### 🚀 Automation Pipeline
You can execute this PRD's features via the SEL Nexus Automation Pipeline at this link: https://mnnb9bbkgu.ap-south-1.awsapprunner.com/agents/automation`;
      }

      if (!wasJiraCreated) {
        replyText = await callGemini(apiKey, normalSystemPrompt, userPromptWithHistory);
      }
    }

    // Non-blocking log to chat_sessions & chat_messages in Supabase DB
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const sessionId = body.sessionId;

      if (supabaseUrl && serviceKey && sessionId) {
        fetch(`${supabaseUrl}/rest/v1/chat_sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            id: sessionId,
            title: message.substring(0, 35),
            updated_at: new Date().toISOString(),
          }),
        }).catch(() => { });

        fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            session_id: sessionId,
            sender: "bot",
            text: replyText,
          }),
        }).catch(() => { });
      }
    } catch (_logErr) {
      // Ignore logging failure
    }

    return new Response(
      JSON.stringify({
        response: replyText,
        route: routeResult.route,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Agent error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Agent failed";

    return new Response(
      JSON.stringify({ error: `Agent failed: ${errorMessage}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

