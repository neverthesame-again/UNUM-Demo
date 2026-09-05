# Deletion Log: Supabase Chatbot Migration

This document records the files and features removed or modified to disconnect the Chatbot from Supabase and hardcode its behavior.

## 1. Files Completely Deleted

- **`src/services/incidents.service.js`**
  - **Reason**: This service was exclusively used to fetch incident records from the Supabase database and format them as Markdown strings for the UI. Since we are no longer querying the incidents database, this file is obsolete.

## 2. Features Removed (Code Stripped)

### **Chat History Sidebar (Sessions)**
- **Files Affected**: `src/hooks/chatbot.js`, `src/components/chatbot.jsx`
- **What was removed**:
  - The entire left sidebar overlay that showed past chat sessions.
  - The hamburger menu button that opened the sidebar.
  - All `localStorage` persistence logic for chat messages and session metadata.
  - All Supabase sync logic (`syncSessionToSupabase`, `syncMessageToSupabase`, etc.) that saved history to the cloud.
- **Result**: The chatbot is now fully stateless in the UI. Closing it clears the session in-memory.

### **Incident Data Routing & Queries**
- **File Affected**: `supabase/functions/chatbot-agent/index.ts`
- **What was removed**:
  - The Gemini prompt intent router (`routePrompt`) that decided whether to query the DB or just chat.
  - The query intent extractor (`extractIncidentQueryIntent`) that converted natural language to SQL filters.
  - The Supabase DB querying logic (`querySupabaseIncidents`).
  - The logic that fetched past conversation history from Supabase to provide context to Gemini.
- **Result**: The Edge Function now operates solely in `normal_chat` mode, answering queries based directly on the provided prompt and in-memory context (passed from the client).

### **File Attachment Widget**
- **File Affected**: `public/chatbot/chatbot.js` (Vanilla JS Widget)
- **What was removed**:
  - The attachment button (📎) and hidden file input element.
- **Result**: The vanilla widget is now text-only.

### **Specific UI Content Removals**
- **File Affected**: `src/pages/LandingPage.jsx`
- **What was removed**:
  - The specific wording "Care Dashboard, January 2025" from the AI PRD Creation card, making it a generic feature trigger.
