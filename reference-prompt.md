# Master Architecture & Reference Prompt Blueprint

> **Purpose**: This document serves as a complete technical specification and master prompt generator. Copy and paste the prompt in **Section 7** to recreate a web application with any custom UI/theme, using this project's exact battle-tested architecture, file structure, Supabase backend integration, custom password reset flow, design tokens, and chatbot edge functions.

---

## 1. Technical Stack & Dependencies

- **Frontend Core**: React 19 (JSX) + Vite 8
- **Routing**: `react-router-dom` v7 (Data Router with `createBrowserRouter`)
- **Backend / BaaS**: Supabase (`@supabase/supabase-js` ^2.107.0)
- **Styling**: Vanilla CSS with Centralized Design Tokens (`tokens.css`, `global.css`, `app.css`)
- **Icons**: Custom SVG Icon abstraction (`Icon.jsx`)
- **Charts / Visualizations**: ApexCharts / ECharts (`react-apexcharts`, `echarts-for-react`)
- **Edge Functions**: Deno TypeScript functions hosted on Supabase (`reset-password`, `chatbot-agent`)

---

## 2. Directory & File Structure Blueprint

```
project-root/
├── .env                              # Public frontend environment variables
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── chatbot/                      # Standalone vanilla JS chatbot widget
│       ├── chatbot.js
│       └── chatbot.css
├── src/
│   ├── main.jsx                      # App entry point with RouterProvider & Contexts
│   ├── App.jsx                       # Root layout wrapper
│   ├── router.jsx                    # React Router configuration & Route Guards
│   ├── constants/
│   │   ├── admin-emails.js           # Whitelisted admin emails & helper function
│   │   └── domain-colors.js          # Dynamic color & icon palette mappings
│   ├── context/
│   │   ├── AuthContext.jsx           # Global authentication state provider
│   │   └── ThemeContext.jsx          # Dark / Light mode toggle provider
│   ├── lib/
│   │   └── supabase.js               # Supabase JS client initializer
│   ├── services/
│   │   ├── auth.service.js           # Auth operations (login, register, reset, profiles)
│   │   └── dashboard.service.js      # Data fetching services from Supabase tables
│   ├── components/
│   │   ├── Header.jsx                # Global navigation bar & theme toggle
│   │   ├── Icon.jsx                  # Centralized SVG icon component
│   │   ├── AccessGuardRoute.jsx      # Guard checking user access_status ('approved')
│   │   └── AIHubChatbotWidget.jsx    # React wrapper mounting vanilla chatbot widget
│   ├── pages/
│   │   ├── HomePage.jsx              # Public landing page
│   │   ├── LoginPage.jsx             # User login page
│   │   ├── RegisterPage.jsx          # User registration page
│   │   ├── ForgotPasswordPage.jsx    # Custom identity-based password reset page
│   │   ├── AccessPendingPage.jsx     # Landing page for pending approval users
│   │   ├── DashboardPage.jsx         # Main authenticated dashboard
│   │   ├── DomainDetailPage.jsx      # Domain category page
│   │   ├── ProjectDetailPage.jsx     # Project detail view
│   │   ├── SettingsPage.jsx          # Admin-only settings page
│   │   └── AccessRequestsPage.jsx    # Admin-only access request approval page
│   └── styles/
│       ├── tokens.css                # CSS custom properties (colors, radii, transitions)
│       ├── global.css                # Base reset & typography rules
│       └── app.css                   # App layout & component styles
└── supabase/
    ├── config.toml
    └── functions/
        ├── reset-password/index.ts   # Edge Function using Admin API to update passwords
        └── chatbot-agent/index.ts    # Edge Function handling AI chat responses
```

---

## 3. Design Tokens & Styling Architecture (`tokens.css`)

All components MUST consume CSS variables defined in `src/styles/tokens.css`. Never use raw hex codes directly in component styling.

### Core Variables Structure:
```css
:root {
  /* Spacing & Radii */
  --radius: 18px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  
  /* Typography */
  --font-display: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Brand Accents */
  --accent-blue: #009fda;
  --accent-teal: #009fad;
  --accent-green: #97d700;
  --accent-orange: #f7941d;
  --accent-purple: #7b5ea7;

  /* Theme-specific tokens (Light & Dark) */
  --bg-primary: #0b0f19;         /* Dark mode default */
  --bg-card: rgba(18, 26, 43, 0.8);
  --text-primary: #f8fafc;
  --border-subtle: rgba(255, 255, 255, 0.08);
}

[data-theme="light"] {
  --bg-primary: #f4f6f9;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --border-subtle: rgba(0, 0, 0, 0.08);
}
```

---

## 4. Authentication & Security Architecture

### A. Domain & Input Validation
- Email addresses must end with an approved domain (e.g. `@tcs.com`).
- Password requirements: At least 8 characters, 1 uppercase letter, 1 number.

### B. Access Control Status (`user_profiles` table)
- `access_status`: `'approved'` | `'pending'`
- Admins (whitelisted in `admin-emails.js`) automatically get `'approved'` access status.
- Regular users start with `'pending'` access status and are redirected to `/access-pending` by `AccessGuardRoute` until an Admin approves them.

### C. Custom Identity-Based Password Reset (No Email Required)
1. **Verification**: User provides `email` + `birth_year`.
2. **Database Check**: `auth.service.js` verifies identity against `user_profiles` table and updates `reset_verified_at` timestamp.
3. **Password Update**: Frontend invokes the `reset-password` Supabase Edge Function with `{ email, newPassword }`.
4. **Edge Function Execution**: The Edge Function verifies the timestamp ($<10$ minutes) and executes `supabase.auth.admin.updateUserById()` using `SUPABASE_SERVICE_ROLE_KEY`.

### D. Route Guards Matrix (`router.jsx`)
| Guard Component | Condition | Failure Action |
| :--- | :--- | :--- |
| `ProtectedRoute` | User is authenticated (`isAuthenticated === true`) | Redirect to `/login` |
| `AdminRoute` | User is authenticated AND `user.isAdmin === true` | Redirect to `/dashboard` |
| `AccessGuardRoute` | User is authenticated AND `user.accessStatus === 'approved'` | Redirect to `/access-pending` |
| `AuthPageRoute` | User is NOT authenticated | Redirect to `/dashboard` if already logged in |

---

## 5. Database Schema & Migration SQL

### `user_profiles` Table
```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  access_status TEXT DEFAULT 'pending' CHECK (access_status IN ('pending', 'approved', 'rejected')),
  reset_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable profile creation during signup" ON public.user_profiles FOR INSERT WITH CHECK (true);
```

### Safe Profile Upsert Pattern (`auth.service.js`)
To avoid `409 Duplicate Key` errors during database migrations or re-registrations:
```javascript
const { error: profileError } = await supabase
  .from('user_profiles')
  .upsert([{
    id: authData.user.id,
    full_name: fullName.trim(),
    email: email.toLowerCase().trim(),
    birth_year: parseInt(birthYear),
    access_status: isAdmin ? 'approved' : 'pending'
  }], { onConflict: 'email' });
```

---

## 6. Environment & Edge Function Configuration

### Frontend `.env` File
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_CHATBOT_AGENT_API_URL=https://<your-project-ref>.supabase.co/functions/v1/chatbot-agent
```

### Backend Supabase Edge Function Secrets
```bash
supabase secrets set SUPABASE_URL=https://<your-project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
supabase secrets set GEMINI_API_KEY=<your-gemini-key>
```

---

## 7. Master Prompt for AI Coding Assistant (REUSE THIS IN FUTURE)

Copy and paste the prompt below into any AI coding assistant when starting a new project:

````markdown
You are an expert full-stack developer. Build a new web application with the following specification and exact architectural foundation:

### 1. Technology & Design System
- **Framework**: Vite + React 19 + React Router v7 (`createBrowserRouter`).
- **Styling**: Vanilla CSS using CSS Design Tokens (`tokens.css`) for Light/Dark themes, glassmorphism card surfaces (`rgba(18, 26, 43, 0.8)`), smooth 0.25s transitions, and responsive grid layouts. No Tailwind.
- **BaaS**: Supabase `@supabase/supabase-js` v2.

### 2. File Structure
Organize the code into:
- `/src/lib/supabase.js`: Supabase client initialization.
- `/src/context/AuthContext.jsx` & `ThemeContext.jsx`: Global state.
- `/src/services/auth.service.js`: Authentication & user profile API calls.
- `/src/router.jsx`: React Router v7 configuration with `ProtectedRoute`, `AdminRoute`, `AccessGuardRoute`, and `AuthPageRoute`.
- `/src/constants/admin-emails.js`: Whitelisted admin emails.
- `/src/components/AIHubChatbotWidget.jsx` & `/public/chatbot/chatbot.js`: Vanilla JS chatbot widget wrapper.

### 3. Authentication & Authorization Features
- **Domain Restricted Registration**: Only allow `@tcs.com` emails (or configured domain).
- **Password Strength**: Minimum 8 characters, 1 uppercase letter, 1 number.
- **User Roles & Access Status**:
  - `access_status`: `'approved'` | `'pending'`.
  - Whitelisted emails in `admin-emails.js` automatically become Admins with `'approved'` status.
  - Unapproved users are redirected to `/access-pending` page.
  - Admins can access `/settings` and `/access-requests` pages to approve users.
- **Custom Password Reset (No Email Required)**:
  - Identity verification via `email` + `birth_year`.
  - Edge function `reset-password` updates password using Supabase Admin Service Role API.

### 4. Database Schema
- `public.user_profiles` table with `id`, `email`, `full_name`, `birth_year`, `access_status`, `reset_verified_at`.
- Registration MUST use `supabase.from('user_profiles').upsert(..., { onConflict: 'email' })` to prevent 409 duplicate key errors.

### 5. Application UI Concept
[INSERT YOUR CUSTOM NEW UI CONCEPT / APPLICATION NAME / THEME HERE]

Generate the full project implementation ensuring zero placeholders, full error handling, clean loading states, and production-ready code.
````
