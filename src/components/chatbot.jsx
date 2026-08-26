// src/components/chatbot.jsx
// UI Component for GuideWell AI Hub Chatbot with Responsive Desktop Sidebar & Mobile History Overlay

import { useState, useEffect, useRef } from "react";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Packer,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ExternalHyperlink,
  UnderlineType
} from "docx";
import {
  useChatbot,
  PREDEFINED_PROMPTS,
  truncatePromptText,
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

// Helper to parse formatted inline markdown text into docx TextRuns/ExternalHyperlinks
function parseFormattedText(text) {
  if (!text) return [];
  const children = [];
  
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);
  
  for (const part of parts) {
    if (!part) continue;
    
    if (part.startsWith('**') && part.endsWith('**')) {
      const innerText = part.slice(2, -2);
      children.push(new TextRun({ text: innerText, bold: true, size: 22, color: "222222", font: "Calibri" }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      const innerText = part.slice(1, -1);
      children.push(new TextRun({ text: innerText, italic: true, size: 22, color: "222222", font: "Calibri" }));
    } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const closeBracketIndex = part.indexOf('](');
      const linkText = part.slice(1, closeBracketIndex);
      const url = part.slice(closeBracketIndex + 2, -1);
      children.push(new ExternalHyperlink({
        children: [
          new TextRun({
            text: linkText,
            style: "Hyperlink",
            color: "0563C1",
            underline: {
              type: UnderlineType.SINGLE,
              color: "0563C1"
            },
            size: 22,
            font: "Calibri"
          })
        ],
        link: url
      }));
    } else {
      children.push(new TextRun({ text: part, size: 22, color: "222222", font: "Calibri" }));
    }
  }
  
  return children;
}

// Helper to generate and download Word (.docx) file from PRD text
export async function downloadDocxFile(text, filename = "Product_Requirement_Document.docx") {
  // 1. Clean the markdown of download links and automation headers
  let cleanText = text
    .replace(/### 📥 Document Download[\s\S]*?(\n\n|$)/gi, "")
    .replace(/\[📥 Download PRD \(\.docx\)\]\(#download-prd\)/gi, "")
    .replace(/### 🚀 Automation Pipeline[\s\S]*?(\n\n|$)/gi, "")
    .replace(/.*https:\/\/mnnb9bbkgu\.ap-south-1\.awsapprunner\.com\/agents\/automation.*/gi, "");

  const lines = cleanText.split("\n");
  const docChildren = [];
  
  let inTable = false;
  let tableLines = [];
  
  const flushTable = () => {
    if (tableLines.length === 0) return;
    
    const rows = [];
    let isHeader = true;
    
    for (const line of tableLines) {
      if (/^[|:\-\s]+$/.test(line)) {
        continue;
      }
      
      const rawCells = line.split("|");
      if (line.trim().startsWith("|")) rawCells.shift();
      if (line.trim().endsWith("|")) rawCells.pop();
      
      const rowCells = rawCells.map(c => c.trim());
      
      const cellElements = rowCells.map(cellText => {
        const textRuns = parseFormattedText(cellText);
        if (isHeader) {
          textRuns.forEach(run => {
            if (run instanceof TextRun) {
              run.options.bold = true;
            }
          });
        }
        
        return new TableCell({
          children: [
            new Paragraph({
              children: textRuns,
              spacing: { before: 80, after: 80 }
            })
          ],
          shading: isHeader ? { fill: "F0F4F8" } : undefined,
          margins: { top: 100, bottom: 100, left: 150, right: 150 }
        });
      });
      
      rows.push(
        new TableRow({
          children: cellElements
        })
      );
      
      isHeader = false;
    }
    
    if (rows.length > 0) {
      docChildren.push(
        new Table({
          rows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" }
          }
        })
      );
      
      docChildren.push(new Paragraph({ spacing: { after: 120 } }));
    }
    
    tableLines = [];
    inTable = false;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith("|")) {
      inTable = true;
      tableLines.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }
    
    if (trimmed === "") {
      continue;
    }
    
    if (trimmed.startsWith("#")) {
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        
        let size = 22;
        let color = "222222";
        let spacingBefore = 240;
        let spacingAfter = 120;
        
        if (level === 1) {
          size = 36;
          color = "003366";
          spacingBefore = 360;
          spacingAfter = 180;
        } else if (level === 2) {
          size = 28;
          color = "004488";
          spacingBefore = 280;
          spacingAfter = 140;
        } else if (level === 3) {
          size = 24;
          color = "333333";
          spacingBefore = 200;
          spacingAfter = 100;
        }
        
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: headingText,
                bold: true,
                size: size,
                color: color,
                font: "Calibri"
              })
            ],
            spacing: { before: spacingBefore, after: spacingAfter },
            keepWithNext: true
          })
        );
        continue;
      }
    }
    
    const listMatch = trimmed.match(/^([\-\*\+])\s+(.*)$/);
    if (listMatch) {
      const listContent = listMatch[2];
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(listContent),
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 }
        })
      );
      continue;
    }
    
    docChildren.push(
      new Paragraph({
        children: parseFormattedText(trimmed),
        spacing: { before: 80, after: 80 }
      })
    );
  }
  
  if (inTable) {
    flushTable();
  }

  try {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: docChildren
        }
      ]
    });

    const docxBlob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate DOCX file:', error);
  }
}

// Simple markdown formatter helper for messages
function formatMarkdownText(text) {
  if (!text) return "";

  // Strip the document download section and automation link section from rendering in the chat bubble UI
  const cleanText = text
    .replace(/### 📥 Document Download/gi, "")
    .replace(/\[📥 Download PRD \(\.docx\)\]\(#download-prd\)/gi, "")
    .replace(/### 🚀 Automation Pipeline/gi, "")
    .replace(/.*https:\/\/mnnb9bbkgu\.ap-south-1\.awsapprunner\.com\/agents\/automation.*/gi, "");

  // If marked.js is available on window, use it
  if (typeof window !== "undefined" && window.marked && typeof window.marked.parse === "function") {
    try {
      const parsedHtml = window.marked.parse(cleanText);
      return ensureLinksOpenInNewTab(parsedHtml);
    } catch (_) {
      // fallback to basic
    }
  }

  let escaped = escapeHtml(cleanText);

  // Markdown Links [Text](URL)
  escaped = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Inline Code `text`
  escaped = escaped.replace(/`(.*?)`/g, "<code>$1</code>");

  // Line breaks
  escaped = escaped.replace(/\n/g, "<br>");

  return ensureLinksOpenInNewTab(escaped);
}

export function Chatbot({ hideFloat }) {
  const [, setMarkedReady] = useState(false);

  const {
    isOpen,
    loading,
    showPrompts,
    input,
    setInput,
    messages,
    showConfirmModal,
    messagesEndRef,
    // History & Sessions state
    filteredSessions,
    activeSessionId,
    isHistoryOpen,
    searchQuery,
    setSearchQuery,
    toggleHistory,
    createNewSession,
    selectSession,
    deleteSession,
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

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && !hideFloat && (
        <div
          className="centene-chat-float"
          data-theme="dark"
          onClick={open}
          title="Open GuideWell AI Hub Assistant"
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
        className={`centene-chat-window ${(isHistoryOpen || isDesktop) ? "has-sidebar" : ""}`}
        data-theme="dark"
        style={{ display: isOpen ? "flex" : "none" }}
      >
        {/* Full-Width Header */}
        <div className="centene-chat-header">
          <div className="centene-chat-header-left">
            <button
              className="centene-chat-btn-hamburger"
              title="Toggle History Sidebar"
              onClick={toggleHistory}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h-8z" />
              <circle cx="8.5" cy="12" r="1.5" />
              <circle cx="15.5" cy="12" r="1.5" />
            </svg>
            <div className="centene-chat-title">
              <div>GuideWell AI Hub Agent</div>
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
          {/* History Panel (Permanent Sidebar on Desktop/iPad, Overlay on Mobile) */}
          {(isHistoryOpen || isDesktop) && (
            <div className="centene-history-overlay">
              <div className="centene-history-header">
                <span>History</span>
                <button
                  className="centene-history-close-btn"
                  onClick={toggleHistory}
                  title="Close History"
                >
                  ✕
                </button>
              </div>

              <div className="centene-history-search-container">
                <svg
                  className="centene-history-search-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="centene-history-search-input"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="centene-history-list">
                {filteredSessions.length === 0 ? (
                  <div className="centene-history-empty">No chat history found</div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`centene-history-card ${session.id === activeSessionId ? "active" : ""
                        }`}
                      onClick={() => selectSession(session.id)}
                    >
                      <div className="centene-history-card-content">
                        <div className="centene-history-card-title">
                          {truncatePromptText(session.title || "New Chat", 35)}
                        </div>
                        <div className="centene-history-card-time">
                          {session.timestampFormatted}
                        </div>
                      </div>
                      <button
                        className="centene-history-card-delete"
                        title="Delete Session"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="centene-history-footer">
                <button
                  className="centene-new-chat-btn"
                  onClick={createNewSession}
                >
                  New Chat
                </button>
              </div>
            </div>
          )}

          {/* Main Chat Content Area */}
          <div className="centene-chat-main">

            {/* Messages Stream */}
            <div className="centene-chat-messages" ref={messagesEndRef}>
              {messages.map((msg, index) => {
                const isPrdMessage =
                  msg.sender === "bot" &&
                  (msg.text.includes("Product Requirement Document") ||
                    msg.text.includes("# PRD") ||
                    msg.text.includes("## 1. Executive Summary") ||
                    msg.text.includes("#download-prd"));

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
                          downloadDocxFile(msg.text, "Product_Requirement_Document.docx");
                        }
                      }}
                    />

                    {isPrdMessage && (
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div>
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 14px",
                              backgroundColor: "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() =>
                              downloadDocxFile(msg.text, "Product_Requirement_Document.docx")
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
                            📥 Download PRD (.docx)
                          </button>
                        </div>
                        <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", lineHeight: "1.5" }}>
                          Switch to the{" "}
                          <a
                            href="https://mnnb9bbkgu.ap-south-1.awsapprunner.com/agents/automation"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#38bdf8", textDecoration: "underline", fontWeight: "600" }}
                          >
                            SEL Nexus Automation Pipeline
                          </a>{" "}
                          to execute SEL Nexus.
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

            {/* Predefined Prompt Chips */}
            {showPrompts && (
              <div className="centene-predefined-prompts">
                {PREDEFINED_PROMPTS.map((promptText, idx) => (
                  <div
                    key={idx}
                    className="centene-prompt-item"
                    title={promptText}
                    onClick={() => selectPredefinedPrompt(promptText)}
                  >
                    {truncatePromptText(promptText)}
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
                  placeholder="Ask about Incidents, IT Operations & more"
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
