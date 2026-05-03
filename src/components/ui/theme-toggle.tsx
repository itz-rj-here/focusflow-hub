import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { actualTheme, setPreference } = useTheme();

  const toggle = () => {
    setPreference(actualTheme === "light" ? "dark" : "light");
  };

  return (
    <button onClick={toggle} className={className} aria-label="Toggle theme">
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            actualTheme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            actualTheme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
}
