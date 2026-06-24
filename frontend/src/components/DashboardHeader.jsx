import { AlertTriangle, Loader2, LogOut } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardHeader({
  user,
  portalLabel,
  onLogout,
  onEmergency,
  emergencyLoading = false,
}) {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo />
          <span className="hidden sm:inline text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            {portalLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onEmergency && (
            <button
              type="button"
              onClick={onEmergency}
              disabled={emergencyLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-semibold hover:bg-red-700 transition disabled:opacity-70"
            >
              {emergencyLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Emergency</span>
            </button>
          )}
          <ThemeToggle />
          <span className="text-sm text-text-muted hidden md:block max-w-[120px] truncate">
            {user.name}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-danger transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
