// NavBar Component

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { layoutService } from "../services/layout.service";
import accessRequestService from "../services/access-request.service";
import { useToast } from "./Toast";
import darkModeLogo from "../assets/unum-darkmodelogo.png";
import lightModeLogo from "../assets/unum-lightmodelogo.png";

export const NavBar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme, forcedTheme } = useTheme();
  const effectiveTheme = forcedTheme || theme;
  const logoSrc = effectiveTheme === "dark" ? darkModeLogo : lightModeLogo;
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const navContent = layoutService.getNavContent();
  const [activeSection, setActiveSection] = useState("home");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for navbar height
      const homeSection = document.getElementById("home-section");
      const missionSection = document.getElementById("mission-section");
      const platformSection = document.getElementById("platform-section");

      if (platformSection && scrollPosition >= platformSection.offsetTop) {
        setActiveSection("platform");
      } else if (missionSection && scrollPosition >= missionSection.offsetTop) {
        setActiveSection("about");
      } else if (homeSection) {
        setActiveSection("home");
      }
    };

    handleScroll(); // Check initial position
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    showToast("Signed out successfully");
    setShowProfileDropdown(false);
  };

  const handleManageCards = () => {
    navigate("/settings");
    setShowProfileDropdown(false);
  };

  const handleAccessRequests = () => {
    navigate("/access-requests");
    setShowProfileDropdown(false);
  };

  // Fetch pending access requests count for admin users (once per session;
  // the Access Requests page itself always fetches fresh data when opened)
  useEffect(() => {
    if (user?.isSuperAdmin) {
      accessRequestService.getPendingCount().then(setPendingCount);
    }
  }, [user?.isSuperAdmin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest(".nav-user")) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("mission-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document
        .getElementById("mission-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePlatformClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("platform-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document
        .getElementById("platform-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="nav">
      <Link to={!loading && isAuthenticated ? "/dashboard" : "/login"} className="nav-logo">
        <img
          src={logoSrc}
          alt={navContent.logoText}
          className="nav-logo-img"
        />
      </Link>

      <div className="nav-actions">
        {!forcedTheme && (
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            data-tooltip={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        )}
        {!loading &&
          (!isAuthenticated ? (
            <button className="nav-btn" onClick={() => navigate("/login")}>
              {navContent.signInText}
            </button>
          ) : (
            <div className="nav-user">
            <div
              className="nav-user-profile"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="nav-avatar">{user?.avatarInitials || "U"}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                <span className="nav-username">{user?.name || "User"}</span>
                {user?.activeRole && (
                  <span style={{ fontSize: "11px", color: "var(--nav-user-subtext)", fontWeight: "600" }}>
                    {user.activeRole} • {user.activeBusinessArea}
                  </span>
                )}
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`nav-dropdown-arrow ${showProfileDropdown ? "open" : ""}`}
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {showProfileDropdown && (
              <div className="nav-profile-dropdown">
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-name">
                    {user?.name || "User"}
                  </div>
                  <div className="nav-dropdown-email">
                    {user?.email || "user@example.com"}
                  </div>
                  {user?.activeRole && (
                    <div style={{
                      marginTop: "6px",
                      padding: "4px 8px",
                      background: "rgba(var(--cyan-rgb), 0.12)",
                      border: "1px solid rgba(var(--cyan-rgb), 0.3)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--cyan)",
                      display: "inline-block"
                    }}>
                      Role: {user.activeRole} ({user.activeBusinessArea})
                    </div>
                  )}
                </div>
                <div className="nav-dropdown-divider"></div>
                {user?.isSuperAdmin && (
                  <>
                    <div className="nav-dropdown-section">
                      <div className="nav-dropdown-label">Settings</div>
                      <button
                        className="nav-dropdown-item"
                        onClick={handleManageCards}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2 4h12M2 8h12M2 12h12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Manage Cards
                      </button>
                      <button
                        className="nav-dropdown-item"
                        onClick={handleAccessRequests}
                        style={{ position: "relative" }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-2.5 2.5-4 6-4s6 1.5 6 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Access Requests
                        {pendingCount > 0 && (
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              padding: "2px 8px",
                              background: "var(--cyan)",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "var(--navy)",
                            }}
                          >
                            {pendingCount}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="nav-dropdown-divider"></div>
                  </>
                )}
                <button className="nav-dropdown-item" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 14H3.5A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2H6M11 11l3-3-3-3M6 8h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};
