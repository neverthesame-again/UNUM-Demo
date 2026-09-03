import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

import { BUSINESS_AREAS, getRolesForBusinessArea } from "../constants/business-areas";

// Fixed order for roles
const ALL_ROLES = [
  { value: "Product Owner", label: "Product Owner", domain: "AI for AD" },
  { value: "Developer", label: "Developer", domain: "AI for AD" },
  { value: "Support Engineer", label: "Support Engineer", domain: "AI for AMS" },
  { value: "Software Engineer", label: "Software Engineer", domain: "AI for AMS" },
  { value: "Infra Engineer", label: "Infra Engineer", domain: "AI for Infra" },
  { value: "SRE / NOC Lead", label: "SRE / NOC Lead", domain: "AI for Infra" },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const domainRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (domainRef.current && !domainRef.current.contains(event.target)) {
        setIsDomainOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDomain = (domainName) => {
    const removing = selectedDomains.includes(domainName);
    const newDomains = removing
      ? selectedDomains.filter(d => d !== domainName)
      : [...selectedDomains, domainName];
      
    if (removing) {
      const domainRoles = getRolesForBusinessArea(domainName).map(r => r.value);
      setSelectedRoles(prev => prev.filter(r => !domainRoles.includes(r)));
    }
    
    setSelectedDomains(newDomains);
    if (errors.domains) setErrors({ ...errors, domains: "" });
  };

  const toggleRole = (roleValue) => {
    setSelectedRoles(prev => 
      prev.includes(roleValue)
        ? prev.filter(r => r !== roleValue)
        : [...prev, roleValue]
    );
    if (errors.roles) setErrors({ ...errors, roles: "" });
  };

  const isRoleEnabled = (roleDomain) => selectedDomains.includes(roleDomain);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name (at least 2 characters)";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.toLowerCase().endsWith("@tcs.com")) {
      newErrors.email = "Please use your @tcs.com email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least 1 number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(birthYear);
    if (!birthYear) {
      newErrors.birthYear = "Birth year is required";
    } else if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
      newErrors.birthYear = `Please enter a valid year between 1900 and ${currentYear}`;
    }

    if (selectedDomains.length === 0) {
      newErrors.domains = "Please select at least one Domain";
    }

    if (selectedRoles.length === 0) {
      newErrors.roles = "Please select at least one Role";
    } else {
      for (const domain of selectedDomains) {
        const domainRoles = getRolesForBusinessArea(domain).map(r => r.value);
        const hasRoleForDomain = selectedRoles.some(r => domainRoles.includes(r));
        if (!hasRoleForDomain) {
          newErrors.roles = `Please select a Role for ${domain}`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        email,
        password,
        fullName,
        birthYear,
        selectedDomains,
        selectedRoles
      );
      if (result.success) {
        await logout(); // Ensure they are logged out so they go to login screen
        showToast(
          `✓ Account created successfully! Please wait for admin approval to log in.`,
        );
        setTimeout(() => navigate("/login"), 600);
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast(error.message || "Registration failed. Please try again.");
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
          <h2>Create Your Account</h2>
          <p>
            Get started with role-based enterprise AI designed for innovation. Select your domain and role to unlock dedicated AI agents and project workspaces
          </p>
          <div className="login-feature">
            <div className="login-feature-icon">💻</div>
            <div className="login-feature-text">AI for AD: Workspaces for Product Owner & Developer</div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🛠️</div>
            <div className="login-feature-text">
              AI for AMS: Incident & problem desks for Support Engineer & Software Engineer
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <div className="login-feature-text">AI for Infra: Intelligence for Infra Engineer, SRE Lead & NOC Lead</div>
          </div>
        </div>
        <div className="login-right">
          <h3>UNUM AI Platform</h3>
          <p className="login-subtitle">Create your account</p>

          <form onSubmit={handleSubmit}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: "" });
              }}
              autoComplete="name"
            />
            {errors.fullName && <div className="form-error">{errors.fullName}</div>}

            <label className="form-label">TCS Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your.name@tcs.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              autoComplete="email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}

            <label className="form-label">Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="At least 8 characters, 1 uppercase, 1 number"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                autoComplete="new-password"
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
            {errors.password && <div className="form-error">{errors.password}</div>}

            <label className="form-label">Confirm Password</label>
            <div className="password-input-wrap">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}

            <label className="form-label">
              Birth Year <span style={{ color: "var(--muted)", fontSize: "11px" }}>(for account recovery)</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="YYYY (e.g., 1990)"
              autoComplete="bday-year"
              value={birthYear}
              onChange={(e) => {
                setBirthYear(e.target.value);
                if (errors.birthYear) setErrors({ ...errors, birthYear: "" });
              }}
              min="1900"
              max={new Date().getFullYear()}
            />
            {errors.birthYear && <div className="form-error">{errors.birthYear}</div>}

            <div style={{ position: 'relative', marginBottom: '20px' }} ref={domainRef}>
              <label className="form-label">Domain</label>
              <div 
                className="form-input"
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setIsDomainOpen(!isDomainOpen)}
              >
                <span style={{ 
                  color: selectedDomains.length ? "var(--text-primary)" : "var(--text-muted)",
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 20px)', display: 'block'
                }}>
                  {selectedDomains.length > 0 ? selectedDomains.join(", ") : "Select Domain..."}
                </span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </div>
              {isDomainOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--surface-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '8px', zIndex: 10, marginTop: '4px',
                  boxShadow: 'var(--shadow-dropdown)'
                }}>
                  {BUSINESS_AREAS.filter(a => a.status !== 'coming_soon').map(area => (
                    <label key={area.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={selectedDomains.includes(area.name)}
                        onChange={() => toggleDomain(area.name)}
                        style={{ marginRight: '10px', accentColor: 'var(--cyan)' }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>{area.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.domains && <div className="form-error" style={{marginTop: '4px'}}>{errors.domains}</div>}
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }} ref={roleRef}>
              <label className="form-label">Role</label>
              <div 
                className="form-input"
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setIsRoleOpen(!isRoleOpen)}
              >
                <span style={{ 
                  color: selectedRoles.length ? "var(--text-primary)" : "var(--text-muted)",
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 20px)', display: 'block'
                }}>
                  {selectedRoles.length > 0 ? selectedRoles.join(", ") : "Select Role..."}
                </span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </div>
              {isRoleOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--surface-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '8px', zIndex: 10, marginTop: '4px',
                  boxShadow: 'var(--shadow-dropdown)', maxHeight: '200px', overflowY: 'auto'
                }}>
                  {ALL_ROLES.map(r => {
                    const enabled = isRoleEnabled(r.domain);
                    return (
                      <label key={r.value} style={{ 
                        display: 'flex', alignItems: 'center', padding: '8px', 
                        cursor: enabled ? 'pointer' : 'not-allowed',
                        opacity: enabled ? 1 : 0.4 
                      }}>
                        <input 
                          type="checkbox"
                          checked={selectedRoles.includes(r.value)}
                          onChange={() => { if(enabled) toggleRole(r.value); }}
                          disabled={!enabled}
                          style={{ marginRight: '10px', accentColor: 'var(--cyan)', cursor: enabled ? 'pointer' : 'not-allowed' }}
                        />
                        <span style={{ color: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {r.label} <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>({r.domain})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.roles && <div className="form-error" style={{marginTop: '4px'}}>{errors.roles}</div>}
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="login-helper" style={{ marginTop: "24px" }}>
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
