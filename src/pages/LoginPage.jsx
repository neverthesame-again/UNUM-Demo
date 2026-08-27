// Login Page Component

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useForceTheme } from "../context/ThemeContext";

// Page content
const content = {
  introBadge: "One GuideWell Knowledge HUB",
  title: "Welcome to the Future of Enterprise AI",
  subtitle:
    "Sign in to access personalized AI workspaces and co-pilots tailored for your domain and role across GuideWell Enterprise AI.",
  features: [
    {
      icon: "💻",
      text: "AI for AD: Workspaces for Product Owner, Developer featuring code synthesis, BDD stories.",
    },
    {
      icon: "🛠️",
      text: "AI for AMS: Specialized desks for Support Engineer & Software Engineer — powering ticket triage, RCA diagnostics, PRD generator & SLA watch.",
    },
    {
      icon: "📊",
      text: "AI for Infra: Intelligence for Infra Engineer, SRE Lead & NOC Lead.",
    },
  ],
  form: {
    title: "GuideWell Knowledge\u00a0Hub",
    subtitle: "Sign in using your tcs credentials",
    emailLabel: "Email Address",
    emailPlaceholder: "your.name@tcs.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••••••",
    submitText: "Sign In to Platform",
  },
};

import { BUSINESS_AREAS, getRolesForBusinessArea } from "../constants/business-areas";
import { isSuperAdminEmail } from "../constants/admin-emails";
import { validateTCSEmail } from "../services/auth.service";

export default function LoginPage() {
  useForceTheme("dark");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [role, setRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const [allAreaRoles, setAllAreaRoles] = useState([]);
  const [allowedRoleValues, setAllowedRoleValues] = useState([]);
  const [allowedBusinessAreas, setAllowedBusinessAreas] = useState(["Acquisition", "AI for AD", "AI for AMS"]);

  // Check business area and role permissions when email changes
  useEffect(() => {
    if (!email || !email.includes("@")) {
      setAllowedBusinessAreas(["Acquisition", "AI for AD", "AI for AMS", "AI for Infra"]);
      return;
    }

    const trimmedEmail = email.toLowerCase().trim();
    const isSuperAdmin = isSuperAdminEmail(trimmedEmail);
    const userPermissionsMap = JSON.parse(localStorage.getItem("user_permissions_map") || "{}");
    const userPerms = userPermissionsMap[trimmedEmail];

    if (!isSuperAdmin && userPerms && userPerms.businessAreas && userPerms.businessAreas.length > 0) {
      setAllowedBusinessAreas(userPerms.businessAreas);
      // Auto-select single allowed business area
      if (userPerms.businessAreas.length === 1 && businessArea !== userPerms.businessAreas[0]) {
        handleBusinessAreaChange(userPerms.businessAreas[0]);
      }
    } else {
      setAllowedBusinessAreas(["Acquisition", "AI for AD", "AI for AMS", "AI for Infra"]);
    }
  }, [email]);

  const handleBusinessAreaChange = (newArea) => {
    setBusinessArea(newArea);
    const rolesForArea = getRolesForBusinessArea(newArea); // returns [{ value, label }]
    setAllAreaRoles(rolesForArea);

    // Check user permissions map or Super Admin status
    const trimmedEmail = email ? email.toLowerCase().trim() : "";
    const userPermissionsMap = JSON.parse(localStorage.getItem('user_permissions_map') || '{}');
    const userPerms = trimmedEmail ? userPermissionsMap[trimmedEmail] : null;
    const isSuperAdmin = !trimmedEmail || isSuperAdminEmail(trimmedEmail) || !userPerms;

    let allowedValues = rolesForArea.map(r => r.value);
    if (!isSuperAdmin && userPerms && userPerms.requestedRoles && userPerms.requestedRoles[newArea]) {
      const userReqRoles = userPerms.requestedRoles[newArea];
      if (userReqRoles.includes("Admin")) {
        // Domain Admin: Unlocks ALL roles within this domain!
        allowedValues = rolesForArea.map(r => r.value);
      } else if (userReqRoles.length > 0) {
        allowedValues = rolesForArea.map(r => r.value).filter((val) => userReqRoles.includes(val));
      }
    }

    setAllowedRoleValues(allowedValues);

    // Default selection
    if (allowedValues.length > 0) {
      if (allowedValues.includes("Admin") && (isSuperAdmin || !role)) {
        setRole("Admin");
      } else if (!allowedValues.includes(role)) {
        setRole(allowedValues[0]);
      }
    } else {
      setRole("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email domain
    if (!validateTCSEmail(email)) {
      showToast("Please use a valid email address");
      return;
    }

    if (!businessArea) {
      showToast("Please select a Business Area");
      return;
    }

    if (!role) {
      showToast("Please select a Role");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, businessArea, role);
      if (result.success) {
        showToast(
          `✓ Signed in successfully — Welcome as ${role} (${businessArea}), ${result.user.name}`,
        );
        setTimeout(() => navigate("/dashboard"), 600);
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.message || "";
      if (msg.toLowerCase().includes("invalid login credentials") || msg.toLowerCase().includes("user not found")) {
        showToast("Account not found or invalid password. Please click 'Create Account' to register.");
      } else {
        showToast(msg || "Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="orb orb-1" style={{ opacity: 0.1 }} />
      <div className="orb orb-2" style={{ opacity: 0.1 }} />
      <div className="login-split">
        <div className="login-left">
          <div className="login-badge">{content.introBadge}</div>
          <h2>{content.title}</h2>
          <p>{content.subtitle}</p>
          {content.features.map((feature, idx) => (
            <div key={idx} className="login-feature">
              <div className="login-feature-icon">{feature.icon}</div>
              <div className="login-feature-text">{feature.text}</div>
            </div>
          ))}
        </div>
        <div className="login-right">
          <h3>{content.form.title}</h3>
          <p className="login-subtitle">{content.form.subtitle}</p>
          <form onSubmit={handleSubmit}>
            <label className="form-label">{content.form.emailLabel}</label>
            <input
              type="email"
              className="form-input"
              placeholder={content.form.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label className="form-label">{content.form.passwordLabel}</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder={content.form.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <label className="form-label">Domain</label>
            <select
              className="form-input"
              value={businessArea}
              onChange={(e) => handleBusinessAreaChange(e.target.value)}
              required
              style={{
                backgroundColor: "var(--surface-input)",
                color: businessArea ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <option value="" disabled style={{ background: "#0f172a", color: "#94a3b8" }}>
                Select Domain
              </option>
              {BUSINESS_AREAS.map((area) => {
                const isComingSoon = area.status === "coming_soon";
                const isAreaAllowed = allowedBusinessAreas.includes(area.name);
                const isDisabled = isComingSoon || !isAreaAllowed;
                return (
                  <option
                    key={area.id}
                    value={area.name}
                    disabled={isDisabled}
                    style={{
                      background: "#0f172a",
                      color: isDisabled ? "#64748b" : "#e2e8f0"
                    }}
                  >
                    {area.name} {isComingSoon ? "(Coming Soon)" : !isAreaAllowed ? "(Unauthorized)" : ""}
                  </option>
                );
              })}
            </select>

            <label className="form-label">Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!businessArea || allAreaRoles.length === 0}
              required
              style={{
                backgroundColor: "var(--surface-input)",
                color: role ? "var(--text-primary)" : "var(--text-muted)",
                cursor: !businessArea || allAreaRoles.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              <option value="" disabled style={{ background: "#0f172a", color: "#94a3b8" }}>
                {!businessArea
                  ? "Select Business Area First"
                  : allAreaRoles.length === 0
                    ? "No Roles Available"
                    : "Select Role"}
              </option>
              {allAreaRoles.map((r) => {
                const isAllowed = allowedRoleValues.includes(r.value);
                return (
                  <option
                    key={r.value}
                    value={r.value}
                    disabled={!isAllowed}
                    style={{
                      background: "#0f172a",
                      color: isAllowed ? "#e2e8f0" : "#64748b"
                    }}
                  >
                    {r.label} {!isAllowed ? "(Unauthorized)" : ""}
                  </option>
                );
              })}
            </select>

            <div className="forgot-password">
              <Link to="/forgot-password" className="login-link">
                Forgot Password?
              </Link>
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : content.form.submitText}
            </button>
          </form>
          <p className="login-helper" style={{ marginTop: "20px" }}>
            Don't have an account?{" "}
            <Link to="/register" className="login-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
