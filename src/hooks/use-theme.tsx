import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  preference: ThemePreference;
  actualTheme: "light" | "dark";
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme_preference") as ThemePreference | null;
      if (stored) return stored;
      return "light";
    }
    return "light";
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">(() => {
    if (preference === "system") return getSystemTheme();
    return preference;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(actualTheme);
    localStorage.setItem("theme_preference", preference);
  }, [preference, actualTheme]);

  useEffect(() => {
    if (preference !== "system") {
      setActualTheme(preference);
      return;
    }

    const systemTheme = getSystemTheme();
    setActualTheme(systemTheme);

    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setActualTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    if (pref !== "system") {
      setActualTheme(pref);
    } else {
      setActualTheme(getSystemTheme());
    }
  };

  return (
    <ThemeContext.Provider value={{ preference, actualTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
