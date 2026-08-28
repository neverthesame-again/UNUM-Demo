// src/hooks/chatbot.js
// Professional AI Chatbot Logic with Clean Session History & Supabase DB Sync

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_API_URL =
  (typeof window !== "undefined" && window.VITE_CHATBOT_AGENT_API_URL) ||
  (import.meta.env && import.meta.env.VITE_CHATBOT_AGENT_API_URL) ||
  "https://iscbfcgkfmzswnmarlbe.supabase.co/functions/v1/chatbot-agent";

export const PREDEFINED_PROMPTS = [
  "Provide the top 10 incident details where the Priority is 'High' and the Application is 'Care Dashboard' for January 2025",
];

const PROMPT_CHAR_LIMIT = 44;
const STORAGE_SESSIONS_KEY = "guidewell_chatbot_sessions";
const STORAGE_MESSAGES_PREFIX = "guidewell_chatbot_msgs_";

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

export function generateSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ensureValidUuid(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (id && uuidRegex.test(id)) return id;
  return generateSessionId();
}

function loadInitialSessions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((s) => s.title && s.title !== "New Chat")
          .map((s) => ({
            ...s,
            id: ensureValidUuid(s.id),
          }));
      }
    }
  } catch (err) {
    console.error("Failed to load sessions from storage:", err);
  }
  return [];
}

function loadSessionMessages(sessionId) {
  if (typeof window === "undefined" || !sessionId) return null;
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES_PREFIX + sessionId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to load session messages:", err);
  }
  return null;
}

function saveSessionMessages(sessionId, messages) {
  if (typeof window === "undefined" || !sessionId) return;
  try {
    localStorage.setItem(STORAGE_MESSAGES_PREFIX + sessionId, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save session messages:", err);
  }
}

function saveSessions(sessions) {
  if (typeof window === "undefined") return;
  try {
    const validSessions = sessions.filter((s) => s.title && s.title !== "New Chat");
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(validSessions));
  } catch (err) {
    console.error("Failed to save sessions:", err);
  }
}

// Helper to sync sessions to Supabase DB table chat_sessions
const syncSessionToSupabase = async (session) => {
  if (!supabase || !session?.id || session.title === "New Chat") return;
  const validId = ensureValidUuid(session.id);
  try {
    const { error } = await supabase.from("chat_sessions").upsert({
      id: validId,
      title: session.title,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("❌ Supabase chat_sessions Error:", error.message, error);
    } else {
      console.log("✅ Supabase chat_sessions Saved:", validId, session.title);
    }
  } catch (err) {
    console.error("❌ Supabase chat_sessions Exception:", err);
  }
};

// Helper to sync single message to Supabase DB table chat_messages
const syncMessageToSupabase = async (sessionId, msg, sessionTitle = "New Chat") => {
  if (!supabase || !sessionId || !msg) return;
  const validId = ensureValidUuid(sessionId);
  try {
    if (sessionTitle && sessionTitle !== "New Chat") {
      await supabase.from("chat_sessions").upsert({
        id: validId,
        title: sessionTitle,
        updated_at: new Date().toISOString(),
      });
    }

    const { error } = await supabase.from("chat_messages").insert({
      session_id: validId,
      sender: msg.sender,
      text: msg.text,
    });
    if (error) {
      console.error("❌ Supabase chat_messages Error:", error.message, error);
    } else {
      console.log("✅ Supabase chat_messages Saved:", validId, msg.sender);
    }
  } catch (err) {
    console.error("❌ Supabase chat_messages Exception:", err);
  }
};

// Helper to delete session from Supabase DB
const syncDeleteSessionFromSupabase = async (sessionId) => {
  if (!supabase || !sessionId) return;
  const validId = ensureValidUuid(sessionId);
  try {
    const { error } = await supabase.from("chat_sessions").delete().eq("id", validId);
    if (error) {
      console.error("❌ Supabase Delete Session Error:", error.message);
    } else {
      console.log("✅ Supabase Session Deleted:", validId);
    }
  } catch (err) {
    console.error("❌ Supabase Delete Session Exception:", err);
  }
};

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [input, setInput] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // History & Sessions State
  const [sessions, setSessions] = useState(loadInitialSessions);
  const [activeSessionId, setActiveSessionId] = useState(generateSessionId);

  const [isHistoryOpen, setIsHistoryOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [searchQuery, setSearchQuery] = useState("");

  const getWelcomeMessage = () => ({
    sender: "bot",
    text: "Hi! How can I help you with GuideWell AI Hub IT operations or incident data today?",
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

  // Fetch past conversation sessions from Supabase DB on mount
  useEffect(() => {
    const fetchSupabaseHistory = async () => {
      if (!supabase) return;
      try {
        const { data: dbSessions, error: sessionErr } = await supabase
          .from("chat_sessions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!sessionErr && dbSessions && dbSessions.length > 0) {
          const validDbSessions = dbSessions
            .filter((s) => s.title && s.title !== "New Chat")
            .map((s) => ({
              id: s.id,
              title: s.title,
              timestampFormatted: getFormattedDate(new Date(s.created_at)),
              createdAt: new Date(s.created_at).getTime(),
            }));

          if (validDbSessions.length > 0) {
            setSessions(validDbSessions);
          }
        }
      } catch (err) {
        console.warn("Could not fetch sessions from Supabase:", err);
      }
    };

    fetchSupabaseHistory();
  }, []);

  // Sync messages to localStorage whenever they change
  useEffect(() => {
    if (activeSessionId && messages.length > 1) {
      saveSessionMessages(activeSessionId, messages);
    }
  }, [messages, activeSessionId]);

  // Sync sessions list to localStorage whenever it changes
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Toggle History Overlay / Sidebar
  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((prev) => !prev);
  }, []);

  // Create New Chat Session
  const createNewSession = useCallback(() => {
    const freshId = generateSessionId();
    setActiveSessionId(freshId);
    setMessages([getWelcomeMessage()]);
    setShowPrompts(true);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsHistoryOpen(false);
    }
  }, []);

  // Select an existing Chat Session & fetch its messages
  const selectSession = useCallback(
    async (sessionId) => {
      const validId = ensureValidUuid(sessionId);
      if (validId === activeSessionId) {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setIsHistoryOpen(false);
        }
        return;
      }

      setActiveSessionId(validId);
      setShowPrompts(false);

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsHistoryOpen(false);
      }

      // Check local storage first
      const savedMsgs = loadSessionMessages(validId);
      if (savedMsgs && savedMsgs.length > 0) {
        setMessages(savedMsgs);
        return;
      }

      // Fallback: Fetch from Supabase database table chat_messages
      if (supabase) {
        try {
          const { data: dbMsgs, error } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("session_id", validId)
            .order("timestamp", { ascending: true });

          if (!error && dbMsgs && dbMsgs.length > 0) {
            const formattedMsgs = dbMsgs.map((m) => ({
              sender: m.sender,
              text: m.text,
              timestamp: getFormattedDate(new Date(m.timestamp)),
            }));
            setMessages(formattedMsgs);
            saveSessionMessages(validId, formattedMsgs);
            return;
          }
        } catch (err) {
          console.warn("Could not fetch messages from Supabase:", err);
        }
      }

      setMessages([getWelcomeMessage()]);
    },
    [activeSessionId]
  );

  // Delete a Chat Session
  const deleteSession = useCallback(
    (sessionId, e) => {
      if (e) e.stopPropagation();
      const validId = ensureValidUuid(sessionId);

      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== validId);
        if (validId === activeSessionId) {
          createNewSession();
        }
        return updated;
      });

      try {
        localStorage.removeItem(STORAGE_MESSAGES_PREFIX + validId);
      } catch (_) {}

      syncDeleteSessionFromSupabase(validId);
    },
    [activeSessionId, createNewSession]
  );

  // Open chatbot window
  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  // Close chatbot window
  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsHistoryOpen(false);
    }
  }, []);

  // Minimize chatbot window
  const minimize = useCallback(() => {
    setIsMinimized(true);
    setIsOpen(false);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsHistoryOpen(false);
    }
  }, []);

  // API Call to Supabase chatbot-agent Edge Function
  const callAgentApi = async (messageText) => {
    return fetch(DEFAULT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
        sessionId: activeSessionId,
      }),
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

    // Create session in History on first user message if not exists
    let currentTitle = "New Chat";
    const existingSession = sessions.find((s) => s.id === activeSessionId);
    if (!existingSession) {
      currentTitle = truncatePromptText(textToSend, 35);
      const newSessionObj = {
        id: activeSessionId,
        title: currentTitle,
        timestampFormatted: getFormattedDate(),
        createdAt: Date.now(),
      };
      setSessions((prev) => [newSessionObj, ...prev]);
      syncSessionToSupabase(newSessionObj);
    } else {
      currentTitle = existingSession.title;
    }

    // Add user message
    const userMsg = {
      sender: "user",
      text: textToSend,
      timestamp: getCurrentTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    syncMessageToSupabase(activeSessionId, userMsg, currentTitle);
    setLoading(true);

    // Wait 5 to 7 seconds before generating the response
    await new Promise((resolve) => setTimeout(resolve, 6000));

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
      syncMessageToSupabase(activeSessionId, botMsg, currentTitle);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMsgObj = {
        sender: "bot",
        text: `Sorry, I encountered an error: ${error.message || "Could not reach the AI agent"}. Please try again.`,
        timestamp: getCurrentTimestamp(),
      };
      setMessages((prev) => [...prev, errorMsgObj]);
      syncMessageToSupabase(activeSessionId, errorMsgObj, currentTitle);
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
    createNewSession();
    setShowConfirmModal(false);
    close();
  };

  // Filtered sessions list for History sidebar
  const filteredSessions = sessions.filter((s) => {
    if (!s.title || s.title === "New Chat") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.timestampFormatted && s.timestampFormatted.toLowerCase().includes(q))
    );
  });

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
    // History & Session properties
    sessions,
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
    close,
    minimize,
    sendMessage,
    selectPredefinedPrompt,
    showConfirmation,
    confirmClose,
    cancelClose,
  };
}

