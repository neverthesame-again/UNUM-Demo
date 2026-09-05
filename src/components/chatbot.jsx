// src/components/chatbot.jsx
// UI Component for UNUM AI Hub Chatbot with Responsive Desktop Sidebar & Mobile History Overlay

import { useState, useEffect, useRef } from "react";
import {
  useChatbot,
  truncatePromptText,
  PREDEFINED_PROMPTS,
} from "../hooks/chatbot.js";

const MARKED_SRC = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";

function loadStylesheet(href) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src) {
  if (typeof document === "undefined") return Promise.resolve();
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === "true") return Promise.resolve();
    return new Promise((resolve) => {
      existing.addEventListener("load", resolve);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
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

// Ensure all <a> tags open in a new tab with proper security attributes
function ensureLinksOpenInNewTab(html) {
  if (!html) return "";
  return html.replace(/<a\b([^>]*?)>/gi, (match, p1) => {
    let attrs = p1;
    if (!/target=/i.test(attrs)) {
      attrs += ' target="_blank"';
    }
    if (!/rel=/i.test(attrs)) {
      attrs += ' rel="noopener noreferrer"';
    }
    return `<a${attrs}>`;
  });
}

// Helper to directly download the PRD file placed in the PRD folder
export function downloadPrdFile() {
  const link = document.createElement("a");
  link.href = "/PRD/Product_Requirement_Document.docx";
  link.setAttribute("download", "Product_Requirement_Document.docx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to parse markdown when marked library is not available
function parseMarkdownFallback(text) {
  const lines = text.split("\n");
  const output = [];
  let inTable = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Table row detection
    if (line.startsWith("|") && line.endsWith("|")) {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue;
      }
      const rawCells = line.split("|").slice(1, -1);
      const cells = rawCells.map((c) => c.trim());

      if (!inTable) {
        inTable = true;
        output.push("<div style='overflow-x:auto;'><table><thead><tr>");
        cells.forEach((c) => output.push(`<th>${escapeHtml(c)}</th>`));
        output.push("</tr></thead><tbody>");
      } else {
        output.push("<tr>");
        cells.forEach((c) => output.push(`<td>${escapeHtml(c)}</td>`));
        output.push("</tr>");
      }
      continue;
    } else if (inTable) {
      output.push("</tbody></table></div>");
      inTable = false;
    }

    // List item detection
    if (/^[-*]\s+(.*)$/.test(line)) {
      const match = line.match(/^[-*]\s+(.*)$/);
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${escapeHtml(match[1])}</li>`);
      continue;
    } else if (inList) {
      output.push("</ul>");
      inList = false;
    }

    // Headings
    if (line.startsWith("#### ")) {
      output.push(`<h4>${escapeHtml(line.replace(/^####\s+/, ""))}</h4>`);
      continue;
    }
    if (line.startsWith("### ")) {
      output.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      output.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      output.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }

    // Horizontal rule
    if (line === "---" || line === "***" || line.startsWith("-------")) {
      output.push("<hr>");
      continue;
    }

    // Empty line
    if (!line) {
      continue;
    }

    // Regular paragraph
    output.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (inTable) {
    output.push("</tbody></table></div>");
  }
  if (inList) {
    output.push("</ul>");
  }

  let result = output.join("");

  // Bold **text**
  result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Inline Code `text`
  result = result.replace(/`(.*?)`/g, "<code>$1</code>");

  // Markdown Links [Text](URL)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return result;
}

// Simple markdown formatter helper for messages
function formatMarkdownText(text) {
  if (!text) return "";

  // Strip the document download section and automation link section from rendering in the chat bubble UI
  const cleanText = text
    .replace(/###\s*.*Document Download/gi, "")
    .replace(/\[.*Download PRD \(\.docx\)\]\(#download-prd\)/gi, "")
    .replace(/###\s*.*Automation Pipeline/gi, "")
    .replace(/.*https:\/\/mnnb9bbkgu\.ap-south-1\.awsapprunner\.com\/agents\/automation.*/gi, "");

  // If marked.js is available on window, use it
  if (typeof window !== "undefined" && window.marked && typeof window.marked.parse === "function") {
    try {
      if (typeof window.marked.setOptions === "function") {
        window.marked.setOptions({ gfm: true, breaks: true });
      }
      const parsedHtml = window.marked.parse(cleanText);
      return ensureLinksOpenInNewTab(parsedHtml);
    } catch (_) {
      // fallback to basic
    }
  }

  return ensureLinksOpenInNewTab(parseMarkdownFallback(cleanText));
}

export function Chatbot({ hideFloat, autoPrompt, defaultOpen = false }) {
  const [, setMarkedReady] = useState(false);

  const {
    isOpen,
    loading,
    input,
    setInput,
    messages,
    showConfirmModal,
    messagesEndRef,
    showPrompts,
    // Actions
    open,
    minimize,
    sendMessage,
    selectPredefinedPrompt,
    showConfirmation,
    confirmClose,
    cancelClose,
  } = useChatbot();

  // Load chatbot.css styling and marked library on mount
  useEffect(() => {
    loadStylesheet("/chatbot/chatbot.css");
    loadScript(MARKED_SRC)
      .then(() => setMarkedReady(true))
      .catch(() => { });
  }, []);

  // Auto-open and fire prompt when defaultOpen / autoPrompt is provided
  useEffect(() => {
    if (defaultOpen) {
      open();
    }
  }, [defaultOpen]);




  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && !hideFloat && (
        <div
          className="centene-chat-float"
          data-theme="dark"
          onClick={open}
          title="Open UNUM AI Hub Assistant"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h-8z" />
            <circle cx="8.5" cy="12" r="1.5" />
            <circle cx="15.5" cy="12" r="1.5" />
            <path d="M12 17.5c-2.33 0-4.32-1.45-5.12-3.5h1.67c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2h1.67c-.8 2.05-2.79 3.5-5.12 3.5z" />
          </svg>
        </div>
      )}

      {/* Main Chatbot Window */}
      <div
        className="centene-chat-window"
        data-theme="dark"
        style={{ display: isOpen ? "flex" : "none" }}
      >
        {/* Full-Width Header */}
        <div className="centene-chat-header">
          <div className="centene-chat-header-left">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h-8z" />
              <circle cx="8.5" cy="12" r="1.5" />
              <circle cx="15.5" cy="12" r="1.5" />
            </svg>
            <div className="centene-chat-title">
              <div>UNUM AI Hub Agent</div>
              <div className="centene-chat-subtitle">IT Operations Assistant</div>
            </div>
          </div>

          <div className="centene-chat-header-right">
            <button
              className="centene-chat-btn-minimize"
              title="Minimize"
              onClick={minimize}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="20"
                height="20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19.5 12h-15"
                />
              </svg>
            </button>
            <button
              className="centene-chat-btn-close"
              title="Close Session"
              onClick={showConfirmation}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="20"
                height="20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Body Container holding Sidebar + Main Content */}
        <div className="centene-chat-body">
          {/* Main Chat Content Area */}
          <div className="centene-chat-main">

            {/* Messages Stream */}
            <div className="centene-chat-messages" ref={messagesEndRef}>
              {messages.map((msg, index) => {
                const isPrdMessage =
                  msg.sender === "bot" &&
                  (msg.text.toLowerCase().includes("prd generated") ||
                    msg.text.includes("Product Requirement Document") ||
                    msg.text.includes("# PRD"));

                return (
                  <div
                    key={index}
                    className={`centene-message centene-message-${msg.sender}`}
                  >
                    <div
                      className="centene-message-bubble centene-message-content"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdownText(msg.text),
                      }}
                      onClick={(e) => {
                        const target = e.target.closest("a");
                        if (
                          target &&
                          (target.getAttribute("href") === "#download-prd" ||
                            target.innerText.includes("Download PRD"))
                        ) {
                          e.preventDefault();
                          downloadPrdFile();
                        }
                      }}
                    />

                    {isPrdMessage && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div>
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "9px 16px",
                              backgroundColor: "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() =>
                              downloadPrdFile()
                            }
                            title="Download PRD as Word Document (.docx)"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download PRD (.docx)
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="centene-message-time">{msg.timestamp}</div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {loading && (
                <div className="centene-typing-indicator" id="centene-typing-indicator">
                  <div className="centene-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>

            {/* Predefined Prompts */}
            {showPrompts && messages.length === 1 && (
              <div className="centene-predefined-prompts">
                {PREDEFINED_PROMPTS.map((prompt, i) => (
                  <div
                    key={i}
                    className="centene-prompt-item"
                    onClick={() => selectPredefinedPrompt(prompt)}
                  >
                    <span className="centene-prompt-text">
                      {prompt}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="centene-chat-input-container">
              <div className="centene-chat-input-wrapper">
                <input
                  type="text"
                  className="centene-chat-input"
                  placeholder="Ask about incidents and more"
                  autoComplete="off"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <button
                className="centene-chat-btn-send"
                title="Send message"
                onClick={() => sendMessage()}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
              <div className="centene-confirm-modal" style={{ display: "flex" }}>
                <div
                  className="centene-confirm-overlay"
                  onClick={cancelClose}
                />
                <div
                  className="centene-confirm-dialog"
                  style={{ textAlign: "center" }}
                >
                  <h3
                    className="centene-confirm-title"
                    style={{ textAlign: "center" }}
                  >
                    End Chat Session?
                  </h3>
                  <p
                    className="centene-confirm-message"
                    style={{ textAlign: "center" }}
                  >
                    Are you sure you want to end this chat?
                  </p>
                  <div
                    className="centene-confirm-buttons"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <button
                      className="centene-confirm-btn centene-confirm-yes"
                      style={{ textAlign: "center" }}
                      onClick={confirmClose}
                    >
                      Yes, End Chat
                    </button>
                    <button
                      className="centene-confirm-btn centene-confirm-no"
                      style={{ textAlign: "center" }}
                      onClick={cancelClose}
                    >
                      No, Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
