// Access Pending Page - Displayed when user access is pending or declined

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AccessPendingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isPending = user?.accessStatus === "pending";
  const isDeclined = user?.accessStatus === "declined";

  return (
    <div className="login-page">
      <div className="orb orb-1" style={{ opacity: 0.1 }} />
      <div className="orb orb-2" style={{ opacity: 0.1 }} />

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-bd)",
            borderRadius: "var(--radius-lg)",
            padding: "60px 40px",
          }}
        >
          {isPending && (
            <>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 24px",
                  background: "rgba(var(--blue2-rgb), 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                }}
              >
                ⏳
              </div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "var(--white)",
                  marginBottom: "16px",
                }}
              >
                Access Request Pending
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--muted)",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                }}
              >
                Your account has been created successfully! An administrator
                will review your access request shortly. You'll receive access
                to the platform once your request is approved.
              </p>
              <div
                style={{
                  background: "rgba(var(--blue2-rgb), 0.05)",
                  border: "1px solid rgba(var(--blue2-rgb), 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  marginBottom: "32px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--cyan)",
                    margin: 0,
                  }}
                >
                  <strong>Account Details:</strong>
                  <br />
                  {user?.name} ({user?.email})
                </p>
              </div>
            </>
          )}

          {isDeclined && (
            <>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 24px",
                  background: "rgba(255, 68, 68, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                }}
              >
                ⚠️
              </div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "var(--white)",
                  marginBottom: "16px",
                }}
              >
                Access Request Declined
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--muted)",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                }}
              >
                Your access request has been declined by an administrator.
                Please contact your system administrator for more information.
              </p>
              <div
                style={{
                  background: "rgba(255, 68, 68, 0.05)",
                  border: "1px solid rgba(255, 68, 68, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  marginBottom: "32px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "#ff6b6b",
                    margin: 0,
                  }}
                >
                  <strong>Account Details:</strong>
                  <br />
                  {user?.name} ({user?.email})
                </p>
              </div>
            </>
          )}

          <button
            onClick={handleLogout}
            className="login-btn"
            style={{
              width: "100%",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            Sign Out
          </button>

          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginTop: "24px",
            }}
          >
            Need help? Contact your administrator at{" "}
            <a
              href="mailto:admin@tcs.com"
              style={{ color: "var(--cyan)", textDecoration: "none" }}
            >
              admin@tcs.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
