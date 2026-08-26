// Access Guard Route - Ensures users have approved access before viewing protected content

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AccessGuardRoute = ({ children }) => {
  const { user, loading, loggingOut } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  // During an explicit logout, defer to the caller's own navigate() instead of
  // racing it with a redirect to /access-pending.
  if (loggingOut) {
    return null;
  }

  // Admins bypass access control
  if (user?.isSuperAdmin) {
    return children;
  }

  // Check if user has approved access
  if (user?.accessStatus !== "approved") {
    return <Navigate to="/access-pending" replace />;
  }

  return children;
};
