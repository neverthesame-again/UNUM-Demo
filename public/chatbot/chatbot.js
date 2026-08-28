/**
 * Horizon Chatbot
 * Vanilla JavaScript implementation for horizon_landing.html
 * No React dependencies - fully self-contained
 *
 * Usage:
 *   HorizonChatbot.init()        - Initialize on page load
 *   HorizonChatbot.open()        - Open chatbot window
 *   HorizonChatbot.sendMessage() - Send user message
 */

const HorizonChatbot = {
  // ==================== CONFIGURATION ====================
  config: {
    title: "GuideWell AI Hub Agent",
    promptCharLimit: 44,
    apiUrl:
      (typeof window !== "undefined" && window.VITE_CHATBOT_AGENT_API_URL) ||
      "https://iscbfcgkfmzswnmarlbe.supabase.co/functions/v1/chatbot-agent",
    agents: [
      {
        id: "default",
        name: "GuideWell Chatbot Agent",
      },
    ],
  },

  // ==================== STATE MANAGEMENT ====================
  state: {
    isOpen: false,
    isMinimized: true,
    messages: [],
    activeAgentId: null, // id of the agent that handled the most recent turn
    agentStates: {}, // per-agent { sessionId, threadId, shouldClearSession, pendingInterrupt, platformStateParams }
    loading: false,
    showPrompts: true, // whether the predefined prompt chips are visible
    activeDocument: null, // active uploaded file { name, type, contentText, base64Data }
    elements: {},
  },

  // ==================== INITIALIZATION ====================
  init() {
    console.log("🤖 Horizon Chatbot initializing...");

    // Generate unique session ID
    this.resetConversationState();

    // Add welcome message
    this.state.messages.push({
      sender: "bot",
      text: "Hi! How can I help you with GuideWell AI Hub IT operations today?",
      timestamp: this.getCurrentTimestamp(),
    });

    // Create DOM elements
    this.createFloatButton();
    this.createChatWindow();

    console.log("✅ Horizon Chatbot ready");
  },

  // ==================== DOM CREATION ====================
  createFloatButton() {
    const button = document.createElement("div");
    button.className = "centene-chat-float";
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h-8z"/>
        <circle cx="8.5" cy="12" r="1.5"/>
        <circle cx="15.5" cy="12" r="1.5"/>
        <path d="M12 17.5c-2.33 0-4.32-1.45-5.12-3.5h1.67c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2h1.67c-.8 2.05-2.79 3.5-5.12 3.5z"/>
      </svg>
    `;
    button.onclick = () => this.open();
    document.body.appendChild(button);
    this.state.elements.floatButton = button;
  },

  createChatWindow() {
    const container = document.createElement("div");
    container.className = "centene-chat-window";
    container.style.display = "none";

    container.innerHTML = `
      <div class="centene-chat-header">
        <div class="centene-chat-header-left">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h-8z"/>
            <circle cx="8.5" cy="12" r="1.5"/>
            <circle cx="15.5" cy="12" r="1.5"/>
          </svg>
          <div class="centene-chat-title">
            <div>${this.config.title}</div>
            <div class="centene-chat-subtitle">IT Operations Assistant</div>
          </div>
        </div>
        <div class="centene-chat-header-right">
          <button class="centene-chat-btn-minimize" title="Minimize">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 12h-15"/>
            </svg>
          </button>
          <button class="centene-chat-btn-close" title="Close Session">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="centene-chat-messages"></div>
      
      <div class="centene-predefined-prompts">
        <div class="centene-prompt-item" data-prompt="Provide the top 10 incident details where the Priority is 'High' and the Application is 'Care Dashboard' for January 2025">
          Provide the top 10 incident details where the Priority is 'High' and the Application is 'Care Dashboard' for January 2025
        </div>
      </div>

      <div class="centene-file-preview-bar" style="display: none;"></div>
      
      <div class="centene-chat-input-container">
        <div class="centene-chat-input-wrapper">
          <input type="file" class="centene-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display: none;" />
          <button class="centene-chat-btn-attach" type="button" title="Attach Excel, CSV or PDF">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip">
              <path d="M13.234 20.252 21 12.3a5 5 0 0 0-7.071-7.071L4.858 14.3a3 3 0 0 0 4.243 4.243l7.071-7.071a1 1 0 0 0-1.414-1.414l-6.364 6.364"/>
            </svg>
          </button>
          <input 
            type="text" 
            class="centene-chat-input" 
            placeholder="Ask about incidents, health, SLAs or analyze files..."
            autocomplete="off"
          />
        </div>
        <button class="centene-chat-btn-send" title="Send message">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      
      <!-- Confirmation Modal -->
      <div class="centene-confirm-modal" style="display: none;">
        <div class="centene-confirm-overlay"></div>
        <div class="centene-confirm-dialog" style="text-align: center !important;">
          <h3 class="centene-confirm-title" style="text-align: center !important;">End Chat Session?</h3>
          <p class="centene-confirm-message" style="text-align: center !important;">Are you sure you want to end this chat?</p>
          <div class="centene-confirm-buttons" style="display: flex !important; justify-content: center !important;">
            <button class="centene-confirm-btn centene-confirm-yes" style="text-align: center !important;">Yes, End Chat</button>
            <button class="centene-confirm-btn centene-confirm-no" style="text-align: center !important;">No, Continue</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.state.elements.window = container;
    this.state.elements.messagesArea = container.querySelector(
      ".centene-chat-messages",
    );
    this.state.elements.input = container.querySelector(".centene-chat-input");
    this.state.elements.fileInput = container.querySelector(".centene-file-input");
    this.state.elements.attachBtn = container.querySelector(".centene-chat-btn-attach");
    this.state.elements.filePreviewBar = container.querySelector(".centene-file-preview-bar");
    this.state.elements.confirmModal = container.querySelector(
      ".centene-confirm-modal",
    );
    this.state.elements.predefinedPrompts = container.querySelector(
      ".centene-predefined-prompts",
    );

    // Attach event listeners
    this.attachEventListeners();

    // Truncate predefined prompts based on config
    this.truncatePredefinedPrompts();

    // Render initial messages
    this.renderMessages();
  },

  truncatePredefinedPrompts() {
    const promptItems = this.state.elements.window.querySelectorAll(
      ".centene-prompt-item",
    );
    const charLimit = this.config.promptCharLimit;

    promptItems.forEach((item) => {
      const fullText = item.getAttribute("data-prompt");
      const displayText =
        fullText.length > charLimit
          ? fullText.substring(0, charLimit) + "..."
          : fullText;

      item.textContent = displayText;
      item.setAttribute("title", fullText);
    });
  },

  attachEventListeners() {
    const { window: win, input, fileInput, attachBtn, confirmModal } = this.state.elements;

    // Minimize button
    win.querySelector(".centene-chat-btn-minimize").onclick = () =>
      this.minimize();

    // Close button - show confirmation
    win.querySelector(".centene-chat-btn-close").onclick = () =>
      this.showConfirmation();

    // Confirmation modal buttons
    confirmModal.querySelector(".centene-confirm-yes").onclick = () =>
      this.confirmClose();
    confirmModal.querySelector(".centene-confirm-no").onclick = () =>
      this.cancelClose();
    confirmModal.querySelector(".centene-confirm-overlay").onclick = () =>
      this.cancelClose();

    // Attach File button
    if (attachBtn && fileInput) {
      attachBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          this.handleFileUpload(file);
        }
        fileInput.value = ""; // Reset input
      };
    }

    // Send button
    win.querySelector(".centene-chat-btn-send").onclick = () =>
      this.handleSend();

    // Enter key to send
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Predefined prompts click handlers
    const promptItems = win.querySelectorAll(".centene-prompt-item");
    promptItems.forEach((item) => {
      item.onclick = () => {
        const promptText = item.getAttribute("data-prompt");
        if (promptText) {
          this.hidePredefinedPrompts();
          this.sendMessage(promptText);
        }
      };
    });
  },

  // ==================== FILE PARSING & ATTACHMENT ====================
  loadXLSXLibrary() {
    if (window.XLSX) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Excel parser library"));
      document.head.appendChild(script);
    });
  },

  async handleFileUpload(file) {
    if (!file) return;

    const fileName = file.name;
    const fileExt = fileName.split(".").pop().toLowerCase();
    let contentText = "";
    let base64Data = "";

    this.showTypingIndicator();

    try {
      if (["xlsx", "xls", "csv"].includes(fileExt)) {
        await this.loadXLSXLibrary();
        const buffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(buffer, { type: "array" });
        const sheets = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const csv = window.XLSX.utils.sheet_to_csv(sheet);
          if (csv && csv.trim()) {
            sheets.push(`--- SHEET: ${sheetName} ---\n${csv}`);
          }
        });
        contentText = sheets.join("\n\n");
      } else if (fileExt === "pdf") {
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        contentText = await file.text();
      }

      this.hideTypingIndicator();

      this.state.activeDocument = {
        name: fileName,
        type: file.type || (fileExt === "pdf" ? "application/pdf" : "text/csv"),
        contentText,
        base64Data,
      };

      this.renderFilePreviewPill();
      this.hidePredefinedPrompts();

      // Bot automatically prompts the user what they want to do with the file
      this.addMessage(
        "bot",
        `📄 **File Loaded**: \`${fileName}\`\n\nI have received your file! What would you like me to analyze from this document? (e.g. *Summarize key data*, *Extract tables*, *Calculate totals*, *Identify anomalies*, or ask any specific question).`
      );
    } catch (err) {
      this.hideTypingIndicator();
      console.error("File upload error:", err);
      this.addMessage(
        "bot",
        `⚠️ Could not parse **${fileName}**: ${err.message || "Unknown error"}`
      );
    }
  },

  renderFilePreviewPill() {
    const previewBar = this.state.elements.filePreviewBar;
    if (!previewBar) return;

    if (!this.state.activeDocument) {
      previewBar.style.display = "none";
      previewBar.innerHTML = "";
      return;
    }

    const doc = this.state.activeDocument;
    previewBar.style.display = "flex";
    previewBar.innerHTML = `
      <div class="centene-file-pill">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
          <path d="M14 2v4a1 1 0 0 0 1 1h4"/>
          <path d="M10 9H8"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
        </svg>
        <span>Active File: <strong>${doc.name}</strong></span>
        <button class="centene-file-pill-remove" title="Remove attached file">✕</button>
      </div>
    `;

    const removeBtn = previewBar.querySelector(".centene-file-pill-remove");
    if (removeBtn) {
      removeBtn.onclick = () => this.clearActiveDocument();
    }
  },

  clearActiveDocument() {
    if (this.state.activeDocument) {
      const fileName = this.state.activeDocument.name;
      this.state.activeDocument = null;
      this.renderFilePreviewPill();
      this.addMessage("bot", `ℹ️ Removed **${fileName}**. Switched back to Normal IT Operations Chat mode.`);
    }
  },

  hidePredefinedPrompts() {
    this.state.showPrompts = false;
    if (this.state.elements.predefinedPrompts) {
      this.state.elements.predefinedPrompts.style.display = "none";
    }
  },

  showPredefinedPrompts() {
    this.state.showPrompts = true;
    if (this.state.elements.predefinedPrompts) {
      this.state.elements.predefinedPrompts.style.display = "flex";
    }
  },

  showConfirmation() {
    this.state.elements.confirmModal.style.display = "flex";
  },

  confirmClose() {
    // Clear chat history, active file, and reset to welcome message
    this.clearActiveDocument();
    this.state.messages = [];
    this.state.messages.push({
      sender: "bot",
      text: "Hi! How can I help you with GuideWell AI Hub IT operations today?",
      timestamp: this.getCurrentTimestamp(),
    });

    // Generate new conversation state for fresh conversation
    this.resetConversationState();

    // Re-render messages (will show only welcome message)
    this.renderMessages();

    // Bring back the predefined prompts for the next session
    this.showPredefinedPrompts();

    // Close modal and chatbot
    this.state.elements.confirmModal.style.display = "none";
    this.close();
  },

  cancelClose() {
    this.state.elements.confirmModal.style.display = "none";
  },

  // ==================== UI ACTIONS ====================
  open() {
    this.state.isOpen = true;
    this.state.isMinimized = false;
    this.state.elements.window.style.display = "flex";
    this.state.elements.floatButton.style.display = "none";
    this.state.elements.input.focus();
    this.scrollToBottom();
  },

  close() {
    this.state.isOpen = false;
    this.state.isMinimized = false;
    this.state.elements.window.style.display = "none";
    this.state.elements.floatButton.style.display = "flex";
  },

  minimize() {
    this.state.isMinimized = true;
    this.state.isOpen = false;
    this.state.elements.window.style.display = "none";
    this.state.elements.floatButton.style.display = "flex";
  },

  // ==================== MESSAGE HANDLING ====================
  async handleSend() {
    const text = this.state.elements.input.value.trim();
    if (!text || this.state.loading) return;

    this.state.elements.input.value = ""; // Clear input immediately
    await this.sendMessage(text);
  },

  async sendMessage(text) {
    // Add user message
    this.addMessage("user", text);
    this.state.loading = true;
    this.showTypingIndicator();

    try {
      // Call Supabase chatbot-agent Edge Function API
      const response = await this.callAgentApi(text);

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (_) {
          // ignore parsing error
        }
        const errorMsg =
          errorData?.error || `Server responded with status ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const botResponse =
        data.response ||
        data.message ||
        data.text ||
        "Sorry, I couldn't process your request.";

      this.hideTypingIndicator();
      this.addMessage("bot", botResponse);
    } catch (error) {
      console.error("Chatbot error:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "bot",
        `Sorry, I encountered an error: ${error.message || "Could not reach the AI agent"}. Please try again.`
      );
    } finally {
      this.state.loading = false;
    }
  },

  // Calls the Supabase chatbot-agent Edge Function API
  callAgentApi(message) {
    const apiUrl =
      this.config.apiUrl ||
      (typeof window !== "undefined" && window.VITE_CHATBOT_AGENT_API_URL) ||
      "https://iscbfcgkfmzswnmarlbe.supabase.co/functions/v1/chatbot-agent";

    let fullMessage = message;
    if (this.state.activeDocument && this.state.activeDocument.contentText) {
      fullMessage = `[ATTACHED DOCUMENT: ${this.state.activeDocument.name}]\n--- DOCUMENT CONTENT START ---\n${this.state.activeDocument.contentText}\n--- DOCUMENT CONTENT END ---\n\nUser Request: ${message}`;
    }

    return fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: fullMessage,
        sessionId: this.state.agentStates.default?.sessionId || null,
        fileData: this.state.activeDocument || null,
      }),
    });
  },


  generateSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "session_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
  },

  resetConversationState() {
    const newSessionId = this.generateSessionId();
    this.state.agentStates.default = {
      sessionId: newSessionId,
      threadId: null,
      shouldClearSession: false,
      pendingInterrupt: null,
      platformStateParams: null,
    };
    this.state.activeAgentId = "default";
  },

  // ==================== DOM RENDERING ====================
  addMessage(sender, text) {
    const messageObj = {
      sender,
      text,
      timestamp: this.getCurrentTimestamp(),
    };

    this.state.messages.push(messageObj);
    this.renderMessages();
  },

  renderMessages() {
    const { messagesArea } = this.state.elements;
    if (!messagesArea) return;

    messagesArea.innerHTML = "";

    this.state.messages.forEach((msg) => {
      const msgElement = document.createElement("div");
      msgElement.className = `centene-message centene-message-${msg.sender}`;

      let formattedText = msg.text;

      // Simple markdown formatting if marked library is available
      if (typeof window.marked !== "undefined" && typeof window.marked.parse === "function") {
        try {
          formattedText = window.marked.parse(msg.text);
        } catch (_) {
          formattedText = this.escapeHtml(msg.text);
        }
      } else {
        formattedText = this.formatBasicMarkdown(msg.text);
      }

      msgElement.innerHTML = `
        <div class="centene-message-bubble centene-message-content">${formattedText}</div>
        <div class="centene-message-time">${msg.timestamp}</div>
      `;

      messagesArea.appendChild(msgElement);
    });

    this.scrollToBottom();
  },

  formatBasicMarkdown(text) {
    let escaped = this.escapeHtml(text);

    // Bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Code `text`
    escaped = escaped.replace(/`(.*?)`/g, "<code>$1</code>");

    // Line breaks
    escaped = escaped.replace(/\n/g, "<br>");

    return escaped;
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  showTypingIndicator() {
    const { messagesArea } = this.state.elements;
    if (!messagesArea) return;

    // Remove existing indicator if present
    this.hideTypingIndicator();

    const indicator = document.createElement("div");
    indicator.className = "centene-typing-indicator";
    indicator.id = "centene-typing-indicator";
    indicator.innerHTML = `
      <div class="centene-typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    messagesArea.appendChild(indicator);
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    const existing = document.getElementById("centene-typing-indicator");
    if (existing) {
      existing.remove();
    }
  },

  scrollToBottom() {
    const { messagesArea } = this.state.elements;
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  },

  getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  },
};

// Auto-initialize when DOM is ready
if (typeof window !== "undefined") {
  window.HorizonChatbot = HorizonChatbot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => HorizonChatbot.init());
  } else {
    HorizonChatbot.init();
  }
}

