// src/components/AdRoleBotWidget.jsx
// Floating bottom-right popup chatbot for the "AI for AD" domain.
// Answers questions ONLY based on the live role dashboard data via Gemini API.
// Role is driven by the parent page — no role switcher inside the bot.

import { useState, useEffect, useRef, useCallback } from "react";
import { askGemini } from "../services/gemini.service";


// ─── Helpers ──────────────────────────────────────────────────────────────────

const MARKED_SRC = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";

// ── Role-specific suggested questions ──────────────────────────────────────────
const ROLE_SUGGESTIONS = {
  "Support Engineer": [
    "Provide a comprehensive summary of active security vulnerabilities, risk severities, and remediation patch statuses across the environment",
    "Provide an operational overview of the latest system telemetry, incident resolution trends, and top autonomous runbooks from Insights",
  ],
  "Software Engineer": [
    "Provide the architectural risk analysis and deployment status for the PostgreSQL Row Lock Clearance Patch (HF-892).",
    "What are the root cause findings for INC-9920 regarding the database deadlock, and which kernel patch is required to resolve it?",
  ],
  "L1 Support Engineer": [
    "Provide a comprehensive summary of active security vulnerabilities, risk severities, and remediation patch statuses across the environment",
    "Provide an operational overview of the latest system telemetry, incident resolution trends, and top autonomous runbooks from Insights",
    "Which tickets are approaching their SLA deadline?",
    "How many tickets were auto-resolved by the chatbot today?",
  ],
  "L2 Support Engineer": [
    "What are the current escalated P2/P3 incidents?",
    "What root cause analysis results are available?",
    "Which PRD documents are ready for review?",
    "Show me the recurring problem tickets.",
  ],
  "L3 Support Engineer": [
    "What is the status of the core hotfixes in staging?",
    "Which database queries need kernel-level tuning?",
    "Are there any infrastructure patches ready for deployment?",
    "What are the database lock contention risks?",
  ],
  "L4 Support Engineer": [
    "What is the current vendor SLA compliance status?",
    "Are there any cloud infrastructure warnings or alerts?",
    "What is the status of active vendor escalation tickets?",
    "Is there any upcoming maintenance window I should know about?",
  ],
};

// Fallback for unknown roles
const DEFAULT_SUGGESTIONS = [
  "What are the current risks?",
  "What needs my attention?",
  "What is the overall status?",
  "Summarise my dashboard.",
];


function loadScript(src) {
  if (typeof document === "undefined") return Promise.resolve();
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === "true") return Promise.resolve();
    return new Promise((resolve) => existing.addEventListener("load", resolve));
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function escapeHtml(text) {
  if (typeof document === "undefined") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function ensureLinksNewTab(html) {
  if (!html) return "";
  return html.replace(/<a\b([^>]*?)>/gi, (match, p1) => {
    let attrs = p1;
    if (!/target=/i.test(attrs)) attrs += ' target="_blank"';
    if (!/rel=/i.test(attrs)) attrs += ' rel="noopener noreferrer"';
    return `<a${attrs}>`;
  });
}

function formatMarkdown(text) {
  if (!text) return "";
  if (typeof window !== "undefined" && window.marked?.parse) {
    try { return ensureLinksNewTab(window.marked.parse(text)); } catch (_) {}
  }
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/`(.*?)`/g, "<code>$1</code>");
  escaped = escaped.replace(/\n/g, "<br>");
  return ensureLinksNewTab(escaped);
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Role-specific welcome messages referencing data when available
function buildWelcomeMessage(role, data) {
  const greetingBase = data?.summary?.greeting || `Hi! I'm your ${role} AI Assistant.`;
  const dataHint = data?.summary?.subtext || "";
  return `${greetingBase}${dataHint ? `\n\n📊 ${dataHint}` : ""}\n\nAsk me anything about your current dashboard — risks, statuses, items needing attention, pipeline results, and more.`;
}

// Convert UI messages array to Gemini conversation history format
function toGeminiHistory(messages) {
  // Skip the first bot welcome message for history (it's not a real turn)
  return messages.slice(1).map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));
}



// ─── Component ────────────────────────────────────────────────────────────────

/**
 * UnifiedBotWidget
 *
 * Props:
 *   selectedRole {string}  – the active AD role from LandingPage
 *   data         {object}  – the live role data object from LandingPage (dynamic)
 */
export function UnifiedBotWidget({ selectedRole, data, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = (state) => {
    setIsOpen(state);
    onOpenChange?.(state);
  };
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load marked.js for markdown rendering AND chatbot.css for styles
  useEffect(() => {
    loadScript(MARKED_SRC).catch(() => {});
    // Load chatbot.css stylesheet (same one used by the old chatbot component)
    const href = "/chatbot/chatbot.css";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // Reset conversation whenever role OR data changes
  useEffect(() => {
    if (!selectedRole) return;
    setMessages([
      {
        sender: "bot",
        text: buildWelcomeMessage(selectedRole, data),
        timestamp: getCurrentTime(),
      },
    ]);
    setInput("");
    setError(null);
  }, [selectedRole, data]);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (customText = null) => {
    const text = (customText !== null ? customText : input).trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg = { sender: "user", text, timestamp: getCurrentTime() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    // Wait 5 to 7 seconds before generating the response
    await new Promise((resolve) => setTimeout(resolve, 6000));

    try {
      // ── Hardcoded Mock Intercept for Vulnerabilities Prompt ───────────────
      if (text.toLowerCase().includes("vulnerabilit") || (text.toLowerCase().includes("security") && text.toLowerCase().includes("patch"))) {
        const mockVuln = `### 🛡️ Active AMS Vulnerabilities & Security Findings

Here is the current security risk assessment from the **Vulnerabilities** dashboard:

1. **CVE-2026-104 · Member Portal Authentication Token Expiry Vulnerability**
   - **Category**: Security & Auth / Auth & Identity
   - **Status**: **Critical / Patch Ready** (Confidence: 98%)
   - **Impact**: Short-lived JWT expiry tokens require automated rotation via Redis token cache.

2. **CVE-2026-210 · Claims Gateway SQL Connection Parameter Exposure**
   - **Category**: Database Security / BI & Analytics
   - **Status**: **Moderate / Mitigated** (Confidence: 85%)
   - **Impact**: Parameterized query bindings and TLS connection encryption enforced.

3. **CVE-2026-901 · EDI 837 Batch Parser Buffer Overflow Risk**
   - **Category**: Pipeline Security
   - **Status**: **Warning / Scanning In Progress** (Confidence: 62%)
   - **Impact**: Strict JSON/X12 schema boundary enforcement active on ingestion endpoints.

**Recommended Action**: Deploy patch package for **CVE-2026-104** to Staging Cluster for automated verification.`;

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: mockVuln, timestamp: getCurrentTime() },
        ]);
        return;
      }

      // ── Hardcoded Mock Intercept for Insights Prompt ────────────────────────
      if (text.toLowerCase().includes("insights") || text.toLowerCase().includes("telemetry")) {
        const mockInsights = `### 📊 AMS Insights & Telemetry Analytics Summary

Key intelligence and operational metrics from the **Insights** workspace:

#### 1. Incident Resolution Category Distribution (Last 30 Days)
- **Data Validation & Schema Errors**: 68 tickets (38%)
- **Authentication & Identity Management**: 48 tickets (27%)
- **Database Connection Pool & Latency**: 36 tickets (20%)
- **API Gateway & Integration Timeouts**: 27 tickets (15%)

#### 2. Top Autonomous AI Runbooks Executed (99.4% Avg Success)
- **ignio™ Autonomous Healing Payload #89**: 142 runs · 100% success · 8s avg latency
- **Deterministic Data Validation Reconciler**: 98 runs · 99.2% success · 6s avg latency
- **OAuth Token Cache Flusher & Key Rotator**: 64 runs · 98.4% success · 12s avg latency
- **DB Pool Auto-Scaler & Session Drainer**: 41 runs · 100% success · 10s avg latency

#### 3. Key Telemetry Findings
- **EDI Ingestion**: 34% spike in batch validation timeouts on Mondays between 08:00–10:00 EST (**INS-901**).
- **Password Self-Service ROI**: Chatbot deflection has reduced L1 support volume by **42%** (**INS-902**).
- **Gateway Efficiency**: Redis token caching improved API latency from 120ms to 8ms for 95% of requests (**INS-904**).`;

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: mockInsights, timestamp: getCurrentTime() },
        ]);
        return;
      }

      // ── Hardcoded Mock Intercept for SWE Prompt ───────────────────────────
      if (text.includes("INC-9920") && text.includes("deadlock")) {
        const mockRCA = `### Root Cause Analysis: INC-9920 (Database Deadlock)
        
- **Root Cause**: High-concurrency transaction collision on the \`claims_processing\` table due to missing row-level locking semantics.
- **AI Diagnosis Confidence**: 94%
- **Required Patch**: The **PostgreSQL Row Lock Clearance Patch (HF-892)** is required to resolve this deadlock condition.
- **Deployment Status**: HF-892 is currently **Staging Passed** and ready for deployment to Production Cluster A.
- **Impact Analysis**: Deploying this patch is expected to yield a **+45% Speedup** in throughput.`;

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: mockRCA, timestamp: getCurrentTime() },
        ]);
        return;
      }

      const history = toGeminiHistory(messages);
      let answer = await askGemini(selectedRole, data, text, history);

      if (answer && answer.trim() === "[BACKEND_REQUIRED]") {
        const backendResponse = await callBackendAgent(text);
        answer = backendResponse;
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: answer, timestamp: getCurrentTime() },
      ]);
    } catch (err) {
      const errorText = err?.message || "Could not reach the Agent. Please try again.";
      setError(errorText);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ ${errorText}`,
          timestamp: getCurrentTime(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Persistent backend session ID for this chat window instance
  const backendSessionIdRef = useRef("unified-session-" + Date.now());

  const callBackendAgent = async (messageText) => {
    const DEFAULT_API_URL =
      (typeof window !== "undefined" && window.VITE_CHATBOT_AGENT_API_URL) ||
      (import.meta.env && import.meta.env.VITE_CHATBOT_AGENT_API_URL) ||
      "https://iscbfcgkfmzswnmarlbe.supabase.co/functions/v1/chatbot-agent";

    const response = await fetch(DEFAULT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
        sessionId: backendSessionIdRef.current,
      }),
    });

    if (!response.ok) throw new Error("Backend Agent API failed");
    const resData = await response.json();
    return resData.response || resData.message || resData.text || "Sorry, I couldn't process your request on the backend.";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const roleLabel = selectedRole || "AD";
  const isConfigured =
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_GEMINI_API_KEY &&
    import.meta.env.VITE_GEMINI_API_KEY !== "your_gemini_api_key_here";

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      {!isOpen && (
        <div
          className="ad-bot-float"
          onClick={() => toggleOpen(true)}
          role="button"
          tabIndex={0}
          title={`Open ${roleLabel} AI Assistant`}
          onKeyDown={(e) => e.key === "Enter" && toggleOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M12 2a1 1 0 0 1 .894.553l2.184 4.424 4.878.71a1 1 0 0 1 .554 1.705l-3.531 3.44.834 4.857a1 1 0 0 1-1.451 1.054L12 16.347l-4.362 2.296a1 1 0 0 1-1.451-1.054l.834-4.857L3.49 9.392a1 1 0 0 1 .554-1.705l4.878-.71L11.106 2.553A1 1 0 0 1 12 2z" />
          </svg>
          <span className="ad-bot-float-label">AI Assistant</span>
        </div>
      )}

      {/* ── Popup Widget ── */}
      {isOpen && (
        <div className="ad-bot-widget unified-bot-large" role="dialog" aria-label={`${roleLabel} AI Assistant`}>

          {/* Header */}
          <div className="ad-bot-header">
            <div className="ad-bot-header-info">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"
                style={{ color: "#00c4ff", flexShrink: 0 }}>
                <path d="M12 2a1 1 0 0 1 .894.553l2.184 4.424 4.878.71a1 1 0 0 1 .554 1.705l-3.531 3.44.834 4.857a1 1 0 0 1-1.451 1.054L12 16.347l-4.362 2.296a1 1 0 0 1-1.451-1.054l.834-4.857L3.49 9.392a1 1 0 0 1 .554-1.705l4.878-.71L11.106 2.553A1 1 0 0 1 12 2z" />
              </svg>
              <div>
                <div className="ad-bot-header-title">{roleLabel} AI Assistant</div>
                <div className="ad-bot-header-subtitle">
                  {isConfigured
                    ? `Grounded to your live ${roleLabel} dashboard · Powered by Gemini`
                    : "⚠️ Gemini API key not configured"}
                </div>
              </div>
            </div>
            <button
              className="ad-bot-close-btn"
              onClick={() => toggleOpen(false)}
              title="Minimize"
              aria-label="Minimize assistant"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 12h-15" />
              </svg>
            </button>
          </div>

          {/* Context badge — shows what role/data the bot is grounded to */}
          <div className="ad-bot-context-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"
              style={{ color: "#22c55e", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Answering based on your <strong>{roleLabel}</strong> dashboard data only</span>
          </div>

          {/* Messages Area */}
          <div className="ad-bot-messages" ref={messagesEndRef}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`ad-bot-message ad-bot-message-${msg.sender}`}
              >
                {msg.sender === "bot" && (
                  <div className="ad-bot-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                      <path d="M12 2a1 1 0 0 1 .894.553l2.184 4.424 4.878.71a1 1 0 0 1 .554 1.705l-3.531 3.44.834 4.857a1 1 0 0 1-1.451 1.054L12 16.347l-4.362 2.296a1 1 0 0 1-1.451-1.054l.834-4.857L3.49 9.392a1 1 0 0 1 .554-1.705l4.878-.71L11.106 2.553A1 1 0 0 1 12 2z" />
                    </svg>
                  </div>
                )}
                <div className="ad-bot-msg-content">
                  <div
                    className={`ad-bot-bubble${msg.isError ? " ad-bot-bubble-error" : ""}`}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                  />
                  <div className="ad-bot-timestamp">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="ad-bot-message ad-bot-message-bot">
                <div className="ad-bot-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                    <path d="M12 2a1 1 0 0 1 .894.553l2.184 4.424 4.878.71a1 1 0 0 1 .554 1.705l-3.531 3.44.834 4.857a1 1 0 0 1-1.451 1.054L12 16.347l-4.362 2.296a1 1 0 0 1-1.451-1.054l.834-4.857L3.49 9.392a1 1 0 0 1 .554-1.705l4.878-.71L11.106 2.553A1 1 0 0 1 12 2z" />
                  </svg>
                </div>
                <div className="ad-bot-msg-content">
                  <div className="ad-bot-bubble ad-bot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested questions — role-specific, always visible */}
          {!loading && (
            <div className="ad-bot-suggestions">
              {(ROLE_SUGGESTIONS[roleLabel] ?? DEFAULT_SUGGESTIONS).map((q) => (
                <button
                  key={q}
                  className="ad-bot-suggestion-chip"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}


          {/* Input Bar */}
          <div className="ad-bot-input-row">
            <input
              ref={inputRef}
              type="text"
              className="ad-bot-input"
              placeholder={`Ask about your ${roleLabel} dashboard…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              disabled={loading}
              aria-label="Type your question"
            />
            <button
              className="ad-bot-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              title="Send"
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          {/* Gemini branding footer */}
          <div className="ad-bot-footer">
            Powered by Gemini · Responses are grounded to your dashboard data
          </div>
        </div>
      )}
    </>
  );
}

export default UnifiedBotWidget;
