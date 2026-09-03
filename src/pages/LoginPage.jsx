import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { supabase } from '../lib/supabase';
import { BUSINESS_AREAS, getRolesForBusinessArea } from "../constants/business-areas";
import { isSuperAdminEmail } from "../constants/admin-emails";
import { validateTCSEmail, authService } from "../services/auth.service";

const content = {
  form: {
    title: "UNUM AI Platform",
    subtitle: "Sign in using your tcs credentials",
    emailLabel: "Email Address",
    emailPlaceholder: "your.name@tcs.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••••••",
    submitText: "Sign In to Platform",
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  
  const [allowedDomains, setAllowedDomains] = useState([]);
  const [allowedRoles, setAllowedRoles] = useState([]);
  const [allAreaRoles, setAllAreaRoles] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleEmailBlur = async () => {
    if (!email || !email.includes("@")) return;
    const profile = await authService.getUserProfileByEmail(email);
    const superAdmin = isSuperAdminEmail(email);
    setIsSuperAdmin(superAdmin);
    
    if (superAdmin) {
      const allDomains = BUSINESS_AREAS.filter(a => a.status !== "coming_soon").map(a => a.name);
      setAllowedDomains(allDomains);
      if (allDomains.length > 0 && !businessArea) {
        handleBusinessAreaChange(allDomains[0], true);
      }
    } else if (profile) {
      const userDomains = (profile.domains && profile.domains.length > 0)
        ? profile.domains
        : (profile.business_area ? [profile.business_area] : []);
      const userRoles = (profile.roles && profile.roles.length > 0)
        ? profile.roles
        : (profile.role ? [profile.role] : []);
        
      setAllowedDomains(userDomains);
      setAllowedRoles(userRoles);
      
      if (userDomains.length === 1 && businessArea !== userDomains[0]) {
        handleBusinessAreaChange(userDomains[0], false, userRoles);
      }
    } else {
      setAllowedDomains([]);
      setAllowedRoles([]);
    }
  };

  const handleBusinessAreaChange = (newArea, isSA = isSuperAdmin, roles = allowedRoles) => {
    setBusinessArea(newArea);
    const rolesForArea = getRolesForBusinessArea(newArea);
    setAllAreaRoles(rolesForArea);
    
    const validRolesForArea = rolesForArea.filter(r => isSA || roles.includes(r.value));
    
    if (validRolesForArea.length > 0) {
      if (!validRolesForArea.find(r => r.value === role)) {
        setRole(validRolesForArea[0].value);
      }
    } else {
      setRole("");
    }
  };
  
  useEffect(() => {
    if (businessArea) {
      handleBusinessAreaChange(businessArea);
    }
  }, [allowedRoles, isSuperAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAccessError("");

    if (!validateTCSEmail(email)) {
      showToast("Please use a valid email address");
      return;
    }

    if (!businessArea) {
      showToast("Please select a Domain");
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
        const { user } = result;
        
        // (Pending users are now allowed to sign in so they can see the AccessPendingPage)
        
        if (!user.isSuperAdmin) {
          if (!user.domains || !user.domains.includes(businessArea)) {
            await supabase.auth.signOut();
            setAccessError(`You are not authorized to access ${businessArea}`);
            setIsLoading(false);
            return;
          }
          if (!user.roles || !user.roles.includes(role)) {
            await supabase.auth.signOut();
            setAccessError(`You are not authorized to access the ${role} role`);
            setIsLoading(false);
            return;
          }
        }
        
        showToast(
          `✓ Signed in successfully — Welcome as ${role} (${businessArea}), ${user.name}`,
        );
        setTimeout(() => navigate("/dashboard"), 600);
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.message || "";
      if (msg.toLowerCase().includes("invalid login credentials") || msg.toLowerCase().includes("user not found")) {
        setAccessError("Invalid email or password");
      } else {
        setAccessError(msg || "Invalid email or password. Please try again.");
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
          <div className="login-badge">UNUM AI Platform</div>
          <h2>Welcome to the Future of Enterprise AI</h2>
          <p>
            Sign in to access personalized AI workspaces and co-pilots tailored for your domain and role across UNUM Enterprise AI.
          </p>
          <div className="login-feature">
            <div className="login-feature-icon">💻</div>
            <div className="login-feature-text">AI for AD: Workspaces for Product Owner, Developer featuring code synthesis, BDD stories.</div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🛠️</div>
            <div className="login-feature-text">
              AI for AMS: Specialized desks for Support Engineer & Software Engineer — powering ticket triage, RCA diagnostics, PRD generator & SLA watch.
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <div className="login-feature-text">AI for Infra: Intelligence for Infra Engineer, SRE Lead & NOC Lead.</div>
          </div>
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
              onBlur={handleEmailBlur}
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <option value="" disabled style={{ background: "var(--surface-card)", color: "var(--text-muted)" }}>
                Select Domain
              </option>
              {BUSINESS_AREAS.map((area) => {
                 const isComingSoon = area.status === "coming_soon";
                 const isAreaAllowed = isSuperAdmin || allowedDomains.includes(area.name);
                 const isDisabled = isComingSoon || (!isAreaAllowed && email.includes('@'));
                 return (
                   <option
                     key={area.id}
                     value={area.name}
                     disabled={isDisabled}
                     style={{
                       background: "var(--surface-card)",
                       color: isDisabled ? "var(--text-muted)" : "var(--text-primary)"
                     }}
                   >
                     {area.name} {isComingSoon ? "(Coming Soon)" : (email.includes('@') && !isAreaAllowed) ? "(Unauthorized)" : ""}
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
              <option value="" disabled style={{ background: "var(--surface-card)", color: "var(--text-muted)" }}>
                {!businessArea
                  ? "Select Business Area First"
                  : allAreaRoles.length === 0
                    ? "No Roles Available"
                    : "Select Role"}
              </option>
              {allAreaRoles.map((r) => {
                const isAllowed = isSuperAdmin || allowedRoles.includes(r.value);
                return (
                  <option
                    key={r.value}
                    value={r.value}
                    disabled={!isAllowed && email.includes('@')}
                    style={{
                      background: "var(--surface-card)",
                      color: (isAllowed || !email.includes('@')) ? "var(--text-primary)" : "var(--text-muted)"
                    }}
                  >
                    {r.label} {(!isAllowed && email.includes('@')) ? "(Unauthorized)" : ""}
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
              {isLoading ? (
                <><span className="spinner" style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: '8px'}} /> Checking access...</>
              ) : content.form.submitText}
            </button>
            
            {accessError && (
              <div style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "13px",
                fontWeight: "600",
                textAlign: "center",
              }}>
                ⛔ {accessError}
              </div>
            )}
          </form>
          <p className="login-helper" style={{ marginTop: "24px" }}>
            Don't have an account?{" "}
            <Link to="/register" className="login-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
