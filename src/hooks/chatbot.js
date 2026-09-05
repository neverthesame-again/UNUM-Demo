
// src/hooks/chatbot.js
// Professional AI Chatbot Logic (Stateless / Hardcoded version)

import { useState, useEffect, useCallback, useRef } from "react";
import { WELCOME_MESSAGE, PREDEFINED_PROMPTS, TOP_11_INCIDENTS_TABLE, RCA_DATA, PRD_DOCUMENT_CONTENT } from "../data/mock/chatbot.mock.js";

export { PREDEFINED_PROMPTS, PRD_DOCUMENT_CONTENT };

export function getCurrentTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getFormattedDate(dateObj = new Date()) {
  const d = String(dateObj.getDate()).padStart(2, "0");
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const y = dateObj.getFullYear();
  const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${d}/${m}/${y}, ${timeStr}`;
}

export function truncatePromptText(fullText, limit = PROMPT_CHAR_LIMIT) {
  if (!fullText) return "";
  if (fullText.length > limit) {
    return fullText.substring(0, limit) + "...";
  }
  return fullText;
}

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [input, setInput] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getWelcomeMessage = () => ({
    sender: "bot",
    text: WELCOME_MESSAGE,
    timestamp: getCurrentTimestamp(),
  });

  const [messages, setMessages] = useState([getWelcomeMessage()]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Open chatbot window
  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  // Close chatbot window
  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  // Minimize chatbot window
  const minimize = useCallback(() => {
    setIsMinimized(true);
    setIsOpen(false);
  }, []);

  // API Call to chatbot agent logic (MOCKED LOCALLY)
  const callAgentApi = async (messageText) => {
    const cleanMsg = messageText.trim().toLowerCase();

    // Check conversation milestone history to know exactly what step we are on
    const hasPrd = messages.some((m) => m.sender === "bot" && m.text.includes("PRD generated"));
    const hasJira = messages.some((m) => m.sender === "bot" && (m.text.includes("Jira Ticket ID:") || m.text.includes("ENH-")));
    const hasRca = messages.some((m) => m.sender === "bot" && m.text.includes("Identified Issue:"));
    const hasTable = messages.some((m) => m.sender === "bot" && (m.text.includes("| Incident Number |") || m.text.includes("generate an RCA")));

    const isAffirmative = ["yes", "yeah", "yep", "yup", "sure", "do it", "please", "ok", "okay", "proceed", "generate", "create", "go ahead"].some(p => cleanMsg.includes(p));

    let replyText = "";

    // STEP 4: PRD Creation Request (Jira was created, user confirming PRD)
    if (hasJira) {
      if (isAffirmative || cleanMsg.includes("prd") || cleanMsg.includes("doc")) {
        replyText = "PRD generated, please download:";
      } else {
        replyText = "I understand. Would you like me to analyze this enhancement and create the PRD document?";
      }
    }
    // STEP 3: Jira Creation Request (RCA was shown, user confirming Jira ticket)
    else if (hasRca) {
      if (isAffirmative || cleanMsg.includes("jira") || cleanMsg.includes("ticket") || cleanMsg.includes("syninc") || cleanMsg.includes("enhancement")) {
        const randomId = crypto.randomUUID().split("-")[0].toUpperCase();
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        replyText = `Jira Ticket ID: ${randomId}\nJira Ticket Number: ENH-${randomNum}\n\nThe Ticket has been created successfully. Would you like me to analyze this enhancement and create a detailed PRD?`;
      } else {
        replyText = "I understand. Would you like me to create a Jira enhancement ticket for incident SYNINC0000012?";
      }
    }
    // STEP 2: RCA Request (Table was shown, user confirming RCA)
    else if (hasTable) {
      if (isAffirmative || cleanMsg.includes("rca") || cleanMsg.includes("analysis") || cleanMsg.includes("root cause")) {
        replyText = RCA_DATA;
      } else {
        replyText = "I understand. Would you like me to generate the Root Cause Analysis (RCA) for all 11 incidents?";
      }
    }
    // STEP 1: Table Request (Start of flow)
    else {
      if (
        cleanMsg.includes("incident") ||
        cleanMsg.includes("11") ||
        cleanMsg.includes("top") ||
        cleanMsg.includes("january") ||
        cleanMsg.includes("moderate") ||
        cleanMsg.includes("give me") ||
        cleanMsg.includes("portal") ||
        isAffirmative
      ) {
        replyText = `${TOP_11_INCIDENTS_TABLE}\n\nWould you like me to generate an RCA (Root Cause Analysis) for all 11 incidents?`;
      } else {
        replyText = "I understand. Would you like me to retrieve the top 11 incidents from the MyMember Benefits Portal for January 2026?";
      }
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ response: replyText })
    });
  };

  // Send message
  const sendMessage = async (customText = null) => {
    const textToSend = (customText !== null ? customText : input).trim();
    if (!textToSend || loading) return;

    if (customText === null) {
      setInput("");
    }

    setShowPrompts(false);

    // Add user message
    const userMsg = {
      sender: "user",
      text: textToSend,
      timestamp: getCurrentTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Wait 15-18 seconds before generating the response (simulating AI agent analysis)
    await new Promise((resolve) => setTimeout(resolve, 15000 + Math.floor(Math.random() * 3000)));

    try {
      const response = await callAgentApi(textToSend);

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (_) {
          // ignore
        }
        const errorMsg =
          errorData?.error || `Server responded with status ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const botResponseText =
        data.response ||
        data.message ||
        data.text ||
        "Sorry, I couldn't process your request.";

      const botMsg = {
        sender: "bot",
        text: botResponseText,
        timestamp: getCurrentTimestamp(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMsgObj = {
        sender: "bot",
        text: `Sorry, I encountered an error: ${error.message || "Could not reach the AI agent"}. Please try again.`,
        timestamp: getCurrentTimestamp(),
      };
      setMessages((prev) => [...prev, errorMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  // Predefined prompt click
  const selectPredefinedPrompt = (promptText) => {
    setShowPrompts(false);
    sendMessage(promptText);
  };

  // Confirmation modal triggers
  const showConfirmation = () => setShowConfirmModal(true);
  const cancelClose = () => setShowConfirmModal(false);

  const confirmClose = () => {
    setMessages([getWelcomeMessage()]);
    setShowPrompts(true);
    setShowConfirmModal(false);
    close();
  };

  return {
    isOpen,
    isMinimized,
    loading,
    showPrompts,
    input,
    setInput,
    messages,
    showConfirmModal,
    messagesEndRef,
    // Actions
    open,
    close,
    minimize,
    sendMessage,
    selectPredefinedPrompt,
    showConfirmation,
    confirmClose,
    cancelClose,
  };
}
