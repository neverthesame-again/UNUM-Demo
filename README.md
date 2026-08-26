# Engineer Assist Platform (`engineer-assist`)

> Enterprise AI Portal, Domain Capability Catalog, Project Workspace & AIOps Telemetry Platform

[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.107.0-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#license)

---

## ⚡ Quick Start: Running on Localhost (`http://localhost:5173`)

### 💻 Option A: If you already have the repository files locally

```bash
# 1. Open Terminal / Command Prompt / PowerShell in project root directory
cd path/to/engineer-assist

# 2. Install all required dependencies
npm install

# 3. Start local development server
npm run dev
```

---

### 🌐 Option B: Cloning fresh from GitHub

```bash
# 1. Clone the repository using the updated GitHub URL
git clone https://github.com/saigutta1994/engineer-assist.git

# 2. Enter the project directory
cd engineer-assist

# 3. Install dependencies
npm install

# 4. Configure environment variables (create .env file in root directory)
# Add your Supabase credentials to .env:
# VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
# VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# 5. Start the local development server
npm run dev
```

> 📌 **Local Application URL**: Open **[http://localhost:5173](http://localhost:5173)** in your web browser.

---

## 🔐 Sign-In & User Access Control (Super Admin, Admin, Normal Users)

The platform enforces domain-based email authentication (`@tcs.com`) with multi-tiered Role-Based Access Control (RBAC):

```
                                  +---------------------------------------+
                                  |         User Sign-In / Register       |
                                  |            (@tcs.com Email)           |
                                  +---------------------------------------+
                                                      |
                                                      v
                                        Is Super Admin Email?
                                      /                       \
                                YES /                           \ NO
                                  v                               v
                    +---------------------------+   +---------------------------+
                    |        Super Admin        |   |   Normal User / Admin     |
                    | access_status: 'approved' |   | access_status: 'pending'  |
                    +---------------------------+   +---------------------------+
                                  |                               |
                                  v                               v
                    Full Platform Control           Routed to /access-pending
                    & Access Request Approvals      (Awaits Admin Review)
```

### 1. 🛡️ Super Admin
- **Designated Emails**: Pre-configured email addresses (e.g., `ram.varikuti@tcs.com`, `saikiran.gutta@tcs.com`, `surabhi.pavankumar@tcs.com`, `lavanya.tetakali@tcs.com`, `vishnu.kosuru@tcs.com`, `test3@tcs.com`).
- **Access Flow**:
  - Automatically receives `access_status = 'approved'` and `isSuperAdmin = true` upon sign-up or log-in.
  - Bypasses the pending approval queue.
- **Privileges**:
  - Full platform management rights across all business areas.
  - Access to the `/access-requests` portal to review, approve, or decline user registration requests.
  - Full CRUD administrative rights in `/settings` to manage domains, workspaces, projects, skills, tools, and video cards.

### 2. ⚙️ Admin (Domain Level)
- **Role Assignment**: Domain-level administrators assigned to specific Business Areas (e.g., *AI for AD*, *SWE*, *IT Ops*, *MOD*, *BI*).
- **Access Flow**: Selected during registration or specified at login for active business area contexts.
- **Privileges**:
  - Administrative management over their active business area workspace assets and configurations.
  - Full access to domain capabilities, project phases, and operational tools within their authorized scope.

### 3. 👤 Normal Users (Developers / Team Members)
- **Registration**: Any user signing up with an authorized `@tcs.com` email address.
- **Access Flow**:
  - Initial registration assigns `access_status = 'pending'`.
  - Non-approved users attempting to log in are intercepted by route guards (`AccessGuardRoute`) and redirected to the `/access-pending` page.
  - Once reviewed and approved by a Super Admin via the `/access-requests` portal, the user's status updates to `approved`.
- **Privileges**:
  - View and interact with domain catalogs, project workspaces, L3 agentic automation pipelines, and AIOps telemetry dashboards.

---

## ⏳ Pending Feature: Dynamic Role-Based Landing Page

> [!NOTE]
> **Status: Pending Implementation**

The upcoming **New Landing Page** will feature a dynamic role-aware presentation layer:

1. **Unified Design System**: All user roles (Super Admin, Admin, Normal User) will share the **same visual design, layout structure, and aesthetic components**.
2. **Role-Differentiated Data**: The content, dashboard summaries, metric cards, and quick actions displayed will automatically adapt based on the logged-in user's role context:
   - **Super Admin View**: Governance metrics, pending user approval queues, and system-wide telemetry summaries.
   - **Admin View**: Business area project progress, domain capability highlights, and team metrics.
   - **Normal User View**: Assigned projects, workspace shortcuts, and domain tool recommendations.
3. **Immutable Structure**: Core **Project** and **Workspace** organizational structures remain unchanged regardless of role perspective.

---

## 🎨 Design System & CSS Architecture

The application uses a custom, tokenized **Vanilla CSS Design System** (no Tailwind dependency) engineered for flexibility, visual richness, and effortless theme switching.

```
src/styles/
├── tokens.css     # CSS Custom Properties (Design tokens & theme definitions)
├── global.css     # CSS reset, base typography & core element defaults
└── app.css        # Layout components, card grids, modals, forms & responsive rules
```

### 1. Design Tokens (`src/styles/tokens.css`)
All styling relies on CSS Custom Properties (`var(--token)`). Components reference tokens rather than hardcoded hex values, enabling clean dark/light theme switching.

#### **Core Tokens Overview**:
- **Border Radius**: `--radius: 18px`, `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 20px`, `--radius-xl: 24px`
- **Typography**: `--font-display: 'Inter', sans-serif`, `--font-body: 'Inter', sans-serif`
- **Transitions**: `--transition-fast: 0.2s ease`, `--transition-base: 0.25s ease`, `--transition-slow: 0.45s ease`
- **Brand Accents**:
  - Accent Blue: `#009fda`
  - Accent Teal: `#009fad`
  - Accent Green: `#97d700`
  - Accent Orange: `#f7941d`
  - Accent Red: `#c62828`
  - Accent Purple: `#7b5ea7`

---

### 2. Dual-Theme Architecture

Themes are dynamically toggled via the `data-theme` attribute on the root `<html>` element (`data-theme="dark|light"`), managed by `ThemeContext.jsx`.

#### **Dark Theme (Default: `[data-theme='dark']`)**:
- **Page Surface**: Deep Navy palette (`#050d1f`, `#091428`, `#0d1e3a`)
- **Accent Elements**: Vibrant cyan (`#00c4ff`) and bright teal accents
- **Card Surfaces**: Glassmorphism translucent overlays (`rgba(255, 255, 255, 0.04)`) with subtle light borders (`rgba(255, 255, 255, 0.09)`)
- **Text Contrast**: Crisp white primary text (`#ffffff`) with slate secondary typography (`#94a3b8`)

#### **Light Theme (`[data-theme='light']`)**:
- **Page Surface**: Custom multi-stop teal gradient background:
  ```css
  background: 
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(0, 159, 173, 0.20) 0%, transparent 55%),
    linear-gradient(145deg, #dcf2f5 0%, #e6f6f8 30%, #d8eff2 60%, #e0f4f7 100%);
  ```
- **Card Surfaces**: Pure white card backgrounds (`#ffffff`) with soft cyan borders (`rgba(0, 159, 173, 0.22)`) and light card shadows (`0 1px 4px rgba(0, 100, 110, 0.08)`)
- **Text Contrast**: Deep teal primary typography (`#005058`) with slate teal secondary text (`#497a82`)

---

### 3. Responsive Breakpoints
- **Mobile (`xs`)**: `576px`
- **Tablet (`sm`)**: `768px`
- **Desktop (`md`)**: `992px`
- **Large Screen (`lg`)**: `1200px`

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Core** | [React 19.2.6](https://react.dev/) + [Vite 8.2.1](https://vitejs.dev/) |
| **Routing** | [React Router DOM 7.16.0](https://reactrouter.com/) |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Supabase Auth + Edge Functions) |
| **Data Visualization** | ApexCharts, ECharts (`echarts-for-react`), Chart.js |
| **Styling** | Vanilla CSS with Design Tokens (`tokens.css`) |

---

## 📁 Project Folder Structure

```
engineer-assist/
├── .env                          # Local environment variables (Supabase keys)
├── README.md                     # Project documentation (This file)
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & npm scripts
├── vite.config.js                # Vite build and proxy settings
├── public/                       # Static public assets & icons
└── src/                          # Application source code
    ├── App.jsx                   # Main layout frame & providers wrapper
    ├── main.jsx                  # React application bootstrapper
    ├── router.jsx                # Route definitions & access guards
    ├── components/               # UI components & form controls
    │   ├── AccessGuardRoute.jsx   # Access approval guard wrapper
    │   ├── DomainCard.jsx         # Dashboard domain card component
    │   ├── NavBar.jsx             # Navigation bar with theme toggle
    │   └── forms/                 # Admin forms for domains, workspaces, projects
    ├── constants/                # Project constants
    │   ├── admin-emails.js        # Super Admin email registry
    │   ├── business-areas.js      # Business areas & role mappings
    │   └── domain-colors.js       # Color tokens & theme mappings
    ├── context/                  # Context providers
    │   ├── AuthContext.jsx        # User state & authentication context
    │   └── ThemeContext.jsx       # Light/Dark theme switcher context
    ├── pages/                    # Page components
    │   ├── AccessPendingPage.jsx  # Pending approval waiting screen
    │   ├── AccessRequestsPage.jsx # Admin access request approval portal
    │   ├── DashboardPage.jsx      # Primary domain dashboard
    │   ├── DomainDetailPage.jsx   # Workspace & capability catalog
    │   ├── ProjectDetailPage.jsx  # Project execution & L3 pipeline launcher
    │   ├── SettingsPage.jsx       # Admin settings portal
    │   └── TCSDashboardPage.jsx   # AIOps governance telemetry dashboard
    ├── services/                 # API service layer
    │   ├── auth.service.js        # Supabase authentication service
    │   ├── dashboard.service.js   # Domain & workspace data service
    │   └── access-request.service.js # User access approval service
    └── styles/                   # Design system & CSS styles
        ├── app.css               # Component & layout styles
        ├── global.css            # CSS reset & base elements
        └── tokens.css            # CSS variables & design tokens
```

---

## 📜 Available NPM Scripts

- `npm run dev`: Launch local development server on `http://localhost:5173`.
- `npm run build`: Build production assets into the `dist/` directory.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint to verify code quality.

---

## 📄 License

Proprietary - Enterprise Internal Use Only.
