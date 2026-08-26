// ChatPanel Component - Interactive chatbot interface

import { useState, useRef, useEffect } from "react";

export const ChatPanel = ({ domain }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    // Initialize with greeting
    setMessages([{ type: "ai", text: domain.greeting }]);
  }, [domain.greeting]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(
      () => {
        const response = getResponse(userMessage, domain);
        setIsTyping(false);
        setMessages((prev) => [...prev, { type: "ai", text: response }]);
      },
      900 + Math.random() * 700,
    );
  };

  const handleChipClick = (chipText) => {
    setInput(chipText);
    setTimeout(() => handleSend(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="prototype-box">
      <div className="prototype-label">Live AI Assistant — Try It</div>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.type === "user" ? "user" : ""}`}
          >
            <div className={`chat-avatar ${msg.type === "ai" ? "ai" : "user"}`}>
              {msg.type === "ai" ? "AI" : "Y"}
            </div>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message">
            <div className="chat-avatar ai">AI</div>
            <div className="chat-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chips">
        {domain.chips.map((chip, idx) => (
          <button
            key={idx}
            className="chip"
            onClick={() => handleChipClick(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder=""
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

// Helper function to get AI response
function getResponse(message, domain) {
  const lower = message.toLowerCase();
  const { responses } = domain;

  // Check for keyword matches
  for (const [key, value] of Object.entries(responses)) {
    if (key !== "default") {
      const keywords = key.split(/[_\s]/);
      if (keywords.some((word) => lower.includes(word))) {
        return value;
      }
    }
  }

  return responses.default;
}
