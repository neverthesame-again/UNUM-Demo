import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useForceTheme } from "../context/ThemeContext";

import { BUSINESS_AREAS, getRolesForBusinessArea } from "../constants/business-areas";

export default function RegisterPage() {
  useForceTheme("dark");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [role, setRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleBusinessAreaChange = (newArea) => {
    setBusinessArea(newArea);
    const roles = getRolesForBusinessArea(newArea);
    setAvailableRoles(roles);
    setRole("");
    if (errors.businessArea) setErrors({ ...errors, businessArea: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName =
        "Please enter your full name (at least 2 characters)";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.toLowerCase().endsWith("@tcs.com")) {
      newErrors.email = "Please use your @tcs.com email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least 1 number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Birth year validation
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(birthYear);
    if (!birthYear) {
      newErrors.birthYear = "Birth year is required";
    } else if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
      newErrors.birthYear = `Please enter a valid year between 1900 and ${currentYear}`;
    }

    // Business area validation
    if (!businessArea) {
      newErrors.businessArea = "Please select a Business Area";
    }

    // Role validation
    if (!role) {
      newErrors.role = "Please select a Role";
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
        [businessArea],
        { [businessArea]: [role] }
      );
      if (result.success) {
        showToast(
          `✓ Account created successfully — Welcome as ${role} (${businessArea}), ${result.user.name}!`,
        );
        setTimeout(() => navigate("/dashboard"), 600);
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
          <div className="login-badge">GuideWell AI Platform</div>
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
          <h3>Create Account</h3>
          <p className="login-subtitle">Enter your details to get started</p>
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
            {errors.fullName && (
              <div className="form-error">{errors.fullName}</div>
            )}

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
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}

            <label className="form-label">Confirm Password</label>
            <div className="password-input-wrap">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <div className="form-error">{errors.confirmPassword}</div>
            )}

            <label className="form-label">
              Birth Year{" "}
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                (for account recovery)
              </span>
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
            {errors.birthYear && (
              <div className="form-error">{errors.birthYear}</div>
            )}

            {/* Domain Dropdown */}
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
                return (
                  <option
                    key={area.id}
                    value={area.name}
                    disabled={isComingSoon}
                    style={{
                      background: "#0f172a",
                      color: isComingSoon ? "#64748b" : "#e2e8f0"
                    }}
                  >
                    {area.name} {isComingSoon ? "(Coming Soon)" : ""}
                  </option>
                );
              })}
            </select>
            {errors.businessArea && <div className="form-error">{errors.businessArea}</div>}

            {/* Cascading Role Dropdown */}
            <label className="form-label">Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (errors.role) setErrors({ ...errors, role: "" });
              }}
              disabled={!businessArea || availableRoles.length === 0}
              required
              style={{
                backgroundColor: "var(--surface-input)",
                color: role ? "var(--text-primary)" : "var(--text-muted)",
                cursor: !businessArea || availableRoles.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              <option value="" disabled style={{ background: "#0f172a", color: "#94a3b8" }}>
                {!businessArea
                  ? "Select Business Area First"
                  : availableRoles.length === 0
                    ? "No Roles Available"
                    : "Select Role"}
              </option>
              {availableRoles.map((r) => (
                <option key={r.value} value={r.value} style={{ background: "#0f172a", color: "#e2e8f0" }}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && <div className="form-error">{errors.role}</div>}

            <button type="submit" className="login-btn" disabled={isLoading} style={{ marginTop: "12px" }}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="login-helper">
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
