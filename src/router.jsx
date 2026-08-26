// Router Configuration

import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AccessPendingPage from "./pages/AccessPendingPage";
import LandingPage from "./pages/LandingPage";
import DomainDetailPage from "./pages/DomainDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import AccessRequestsPage from "./pages/AccessRequestsPage";
import { AccessGuardRoute } from "./components/AccessGuardRoute";
import { useAuth } from "./context/AuthContext";

import TCSDashboardPage from "./pages/TCSDashboardPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, loggingOut } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // During an explicit logout, defer to the caller's own navigate() instead of
    // racing it with a redirect to /login.
    return loggingOut ? null : <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component - Only for admin users
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading, loggingOut } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return loggingOut ? null : <Navigate to="/login" replace />;
  }

  if (!user?.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Home Route Component - redirects based on auth status
const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, redirect to login page
  return <Navigate to="/login" replace />;
};

// Auth pages redirect to dashboard if already logged in
const AuthPageRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: "login",
        element: (
          <AuthPageRoute>
            <LoginPage />
          </AuthPageRoute>
        ),
      },
      {
        path: "register",
        element: (
          <AuthPageRoute>
            <RegisterPage />
          </AuthPageRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <AuthPageRoute>
            <ForgotPasswordPage />
          </AuthPageRoute>
        ),
      },
      {
        path: "access-pending",
        element: (
          <ProtectedRoute>
            <AccessPendingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <AccessGuardRoute>
              <LandingPage />
            </AccessGuardRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "domains/:slug",
        element: (
          <ProtectedRoute>
            <AccessGuardRoute>
              <DomainDetailPage />
            </AccessGuardRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "projects/:projectId",
        element: (
          <ProtectedRoute>
            <AccessGuardRoute>
              <ProjectDetailPage />
            </AccessGuardRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        ),
      },
      {
        path: "tcs-dashboard",
        element: (
          <ProtectedRoute>
            <AccessGuardRoute>
              <TCSDashboardPage />
            </AccessGuardRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics-dashboard",
        element: (
          <ProtectedRoute>
            <AccessGuardRoute>
              <TCSDashboardPage />
            </AccessGuardRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "access-requests",
        element: (
          <AdminRoute>
            <AccessRequestsPage />
          </AdminRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
