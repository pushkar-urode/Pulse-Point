import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-border bg-surface text-text-muted hover:text-brand-700 hover:border-brand-200 transition ${className}`}
    >
      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}
