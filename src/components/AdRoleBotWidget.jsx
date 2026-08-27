// src/components/AdRoleBotWidget.jsx
// Floating bottom-right popup chatbot for the "AI for AD" domain.
// Answers questions ONLY based on the live role dashboard data via Gemini API.
// Role is driven by the parent page — no role switcher inside the bot.

import { useState, useEffect, useRef, useCallback } from "react";
import { askGemini } from "../services/gemini.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MARKED_SRC = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";

// ── Role-specific suggested questions ──────────────────────────────────────────
// Each role gets questions scoped to what's actually on their dashboard.
const ROLE_SUGGESTIONS = {
  Admin: [
    "What is the status of all CI/CD pipelines?",
    "Are there any security vulnerabilities or CVEs to review?",
    "Which agentic automations are currently active?",
    "What access approvals are pending my review?",
  ],
  "Product Owner": [
    "Generate an executive sprint readiness report for Sprint 42 with risk-ranked epics and recommended PO actions",
    "Identify all user stories with incomplete acceptance criteria and draft AI-suggested Given-When-Then definitions for PO review",
  ],
  Developer: [
    "Generate a root cause summary for all failing unit tests in the current build and suggest targeted hotfix strategies",
    "Analyze the latest SonarQube static code analysis results and prioritize security vulnerabilities for remediation",
  ],
  Tester: [
    "What is the current regression test pass rate?",
    "Which defects have been auto-logged by the AI?",
    "Are there any flaky tests that need fixing?",
    "What are the API coverage gaps?",
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
 * AdRoleBotWidget
 *
 * Props:
 *   selectedRole {string}  – the active AD role from LandingPage
 *   data         {object}  – the live role data object from LandingPage (dynamic)
 */
export function AdRoleBotWidget({ selectedRole, data, onOpenChange }) {
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

      // Build Gemini history from all messages except the last user message
      const history = toGeminiHistory(messages);

      const answer = await askGemini(selectedRole, data, text, history);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: answer, timestamp: getCurrentTime() },
      ]);
    } catch (err) {
      const errorText = err?.message || "Could not reach Gemini. Please try again.";
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

          {/* Suggested questions — role-specific, shown only at start */}
          {messages.length === 1 && !loading && (
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

export default AdRoleBotWidget;
