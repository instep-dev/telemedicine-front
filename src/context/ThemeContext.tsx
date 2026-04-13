"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyThemeToTargets = (theme: Theme) => {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(".dashboard-theme"));
  const apply = (el: HTMLElement) => {
    if (theme === "dark") {
      el.classList.add("dark");
    } else {
      el.classList.remove("dark");
    }
  };

  if (targets.length) {
    targets.forEach(apply);
    return;
  }

  apply(document.documentElement);
};

const FIXED_THEME: Theme = "dark";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    applyThemeToTargets(FIXED_THEME);
    try {
      localStorage.setItem("theme", FIXED_THEME);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = () => {
    // Intentionally no-op: dashboard uses a single fixed theme.
  };

  return (
    <ThemeContext.Provider value={{ theme: FIXED_THEME, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
