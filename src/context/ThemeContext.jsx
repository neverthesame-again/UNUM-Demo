// Theme Context - Light/Dark theme toggle backed by localStorage + data-theme attribute

import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "theme";
const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// No-op to preserve backward compatibility without overriding user's chosen theme
export const useForceTheme = () => {
  // Theme is persistent across all pages based on user preference
};

const getInitialTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const effectiveTheme = theme;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, setForcedTheme: () => {}, forcedTheme: null }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
