// Forgot Password Page Component - Two-step account recovery

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { useToast } from "../components/Toast";
import { useForceTheme } from "../context/ThemeContext";

export default function ForgotPasswordPage() {
  useForceTheme("dark");
  const [step, setStep] = useState(1); // 1: Verify identity, 2: Reset password
  const [email, setEmail] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateStep1 = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.toLowerCase().endsWith("@tcs.com")) {
      newErrors.email = "Please use your @tcs.com email address";
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(birthYear);
    if (!birthYear) {
      newErrors.birthYear = "Birth year is required";
    } else if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
      newErrors.birthYear = `Please enter a valid year between 1900 and ${currentYear}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain at least 1 uppercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);

    try {
      // Verify birth year matches email
      await authService.verifyBirthYear(email, birthYear);

      showToast("✓ Identity verified! Please set your new password.");
      setStep(2);
    } catch (error) {
      console.error("Verification error:", error);
      showToast(
        error.message || "Verification failed. Please check your details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPasswordDirect(email, newPassword);
      showToast(
        "✓ Password reset successful! You can now sign in with your new password.",
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Reset password error:", error);
      showToast(error.message || "Failed to reset password. Please try again.");
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
          <div className="login-badge">Account Recovery</div>
          <h2>Reset Your Password</h2>
          <p>
            Verify your identity using your email and birth year, then set a new
            password for your account.
          </p>
          <div className="login-feature">
            <div
              className="login-feature-icon"
              style={{
                opacity: step === 1 ? 1 : 0.4,
                color: step === 1 ? "var(--cyan)" : "var(--muted)",
              }}
            >
              1
            </div>
            <div
              className="login-feature-text"
              style={{ opacity: step === 1 ? 1 : 0.5 }}
            >
              Verify your identity
            </div>
          </div>
          <div className="login-feature">
            <div
              className="login-feature-icon"
              style={{
                opacity: step === 2 ? 1 : 0.4,
                color: step === 2 ? "var(--cyan)" : "var(--muted)",
              }}
            >
              2
            </div>
            <div
              className="login-feature-text"
              style={{ opacity: step === 2 ? 1 : 0.5 }}
            >
              Set new password
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="login-right">
            <h3>Verify Your Identity</h3>
            <p className="login-subtitle">
              Enter your email and birth year to verify your account
            </p>
            <form onSubmit={handleVerifyIdentity}>
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

              <label className="form-label">Birth Year</label>
              <input
                type="number"
                className="form-input"
                placeholder="YYYY (e.g., 1990)"
                value={birthYear}
                onChange={(e) => {
                  setBirthYear(e.target.value);
                  if (errors.birthYear) setErrors({ ...errors, birthYear: "" });
                }}
                autoComplete="bday-year"
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.birthYear && (
                <div className="form-error">{errors.birthYear}</div>
              )}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Identity"}
              </button>
            </form>
            <p className="login-helper">
              Remember your password?{" "}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="login-right">
            <h3>Set New Password</h3>
            <p className="login-subtitle">Enter your new password below</p>
            <form onSubmit={handleResetPassword}>
              <label className="form-label">New Password</label>
              <div className="password-input-wrap">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="At least 8 characters, 1 uppercase, 1 number"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword)
                      setErrors({ ...errors, newPassword: "" });
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
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
              {errors.newPassword && (
                <div className="form-error">{errors.newPassword}</div>
              )}

              <label className="form-label">Confirm New Password</label>
              <div className="password-input-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: "" });
                  }}
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

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            <p className="login-helper">
              Remember your password?{" "}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
