// Auth Context - Global Authentication State with Supabase

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { authService } from "../services/auth.service";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // True only during an explicit, user-initiated logout — lets route guards defer to the
  // caller's own post-logout navigation instead of racing it with their own redirect to /login.
  const [loggingOut, setLoggingOut] = useState(false);
  const activeUserIdRef = useRef(null); // tracks current user ID to prevent duplicate fetches

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on subscription — covers the initial check.
    // No separate getCurrentUser() call needed here.

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        activeUserIdRef.current = null;
        setUser(null);
        setLoading(false);
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user) {
          // Skip re-fetch if it's the same user (handles repeated SIGNED_IN on token refresh)
          if (activeUserIdRef.current === session.user.id) {
            setLoading(false);
            return;
          }
          activeUserIdRef.current = session.user.id;
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          activeUserIdRef.current = null;
          setUser(null);
        }
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password, businessArea, role) => {
    const result = await authService.login(email, password, businessArea, role);
    if (result.success) {
      activeUserIdRef.current = result.user.id; // prevent duplicate fetch when SIGNED_IN fires
      setUser(result.user);
      setLoggingOut(false);
    }
    return result;
  };

  const register = async (email, password, fullName, birthYear, businessAreas, requestedRoles) => {
    const result = await authService.register(
      email,
      password,
      fullName,
      birthYear,
      businessAreas,
      requestedRoles
    );
    if (result.success) {
      activeUserIdRef.current = result.user.id; // prevent duplicate fetch when SIGNED_IN fires
      setUser(result.user);
      setLoggingOut(false);
    }
    return result;
  };

  const logout = async () => {
    // Set before awaiting so any ProtectedRoute still mounted on the current page sees
    // this flag (not just isAuthenticated flipping false) in the same state flush, and
    // defers to the caller's own navigate() instead of redirecting to /login itself.
    setLoggingOut(true);
    activeUserIdRef.current = null;
    await authService.logout(); // fires SIGNED_OUT which calls setUser(null) via onAuthStateChange
  };

  const refreshUser = async () => {
    // Force re-fetch regardless of activeUserIdRef (intentional refresh)
    activeUserIdRef.current = null;
    const currentUser = await authService.getCurrentUser();
    if (currentUser) activeUserIdRef.current = currentUser.id;
    setUser(currentUser);
    return currentUser;
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    loading,
    loggingOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
