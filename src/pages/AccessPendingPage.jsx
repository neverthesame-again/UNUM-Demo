import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForceTheme } from "../context/ThemeContext";

export default function AccessPendingPage() {
  useForceTheme("dark");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.accessStatus !== "pending")) {
      navigate("/");
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return (
    <div className="login-page">
      <div className="orb orb-1" style={{ opacity: 0.1 }} />
      <div className="orb orb-2" style={{ opacity: 0.1 }} />
      
      <div className="login-split">
        <div className="login-left">
          <div className="login-badge">GuideWell AI Platform</div>
          <h2>Access Request Pending</h2>
          <p>
            Your account is currently under review by an administrator. This process ensures the security and proper authorization of all platform users.
          </p>
          <div className="login-feature">
            <div className="login-feature-icon">🛡️</div>
            <div className="login-feature-text">Secure Access Control & Verification</div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">⏳</div>
            <div className="login-feature-text">Typical Review Time: 1-2 Business Days</div>
          </div>
        </div>
        <div className="login-right">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "rgba(0, 240, 255, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}>Approval Pending</h3>
            
            <p style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              marginBottom: "32px"
            }}>
              Your account for <strong>{user?.email}</strong> is awaiting administrator approval. 
              We'll notify you once your access has been granted.
            </p>

            <button 
              className="login-btn"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                marginTop: "16px"
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
