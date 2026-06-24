import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

export function AuthLayout({ children, title, subtitle, role }) {
  const isDoctor = role === "doctor";
  const { isDark } = useTheme();

  const accent = isDoctor
    ? {
        glowA: isDark ? "bg-indigo-600/25" : "bg-indigo-200/70",
        glowB: isDark ? "bg-violet-700/20" : "bg-violet-100/80",
        badge: isDark
          ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-200"
          : "bg-indigo-50 border-indigo-200 text-indigo-700",
        ring: isDark ? "ring-indigo-500/20" : "ring-indigo-100",
      }
    : {
        glowA: isDark ? "bg-cyan-600/25" : "bg-cyan-200/70",
        glowB: isDark ? "bg-sky-700/20" : "bg-sky-100/80",
        badge: isDark
          ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-200"
          : "bg-cyan-50 border-cyan-200 text-cyan-700",
        ring: isDark ? "ring-cyan-500/20" : "ring-cyan-100",
      };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden ${
        isDark ? "bg-slate-950 text-white" : "bg-gradient-to-br from-slate-50 via-white to-brand-50 text-slate-900"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[120px] ${accent.glowA}`} />
        <div className={`absolute -bottom-24 -right-16 w-80 h-80 rounded-full blur-[130px] ${accent.glowB}`} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-sm transition ${
              isDark ? "text-slate-400 hover:text-white" : "text-text-muted hover:text-brand-700"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className={`rounded-3xl p-8 shadow-2xl ring-1 ${accent.ring} ${
          isDark ? "bg-slate-900/90 border border-slate-800 backdrop-blur-xl" : "card"
        }`}>
          <div className="flex justify-center mb-5">
            <BrandLogo light={isDark} />
          </div>

          <div className="flex justify-center mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${accent.badge}`}>
              {isDoctor ? "Doctor Portal" : "Patient Portal"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center text-heading mb-1">{title}</h1>
          <p className="text-center text-text-muted text-sm mb-6">{subtitle}</p>

          {children}

          <p className="text-center text-sm text-text-muted mt-6">
            {isDoctor ? "Not a doctor?" : "Not a patient?"}{" "}
            <Link
              to={`/login/${isDoctor ? "patient" : "doctor"}`}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Switch to {isDoctor ? "patient" : "doctor"} login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
