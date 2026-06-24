import { HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";

export function BrandLogo({ light = false, size = "md" }) {
  const iconSize = size === "lg" ? "w-8 h-8" : "w-7 h-7";
  const textSize = size === "lg" ? "text-xl" : "text-lg";

  return (
    <Link to="/" className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl ${
          light
            ? "bg-white/15 border border-white/25"
            : "bg-brand-50 border border-brand-100"
        }`}
      >
        <HeartPulse
          className={`${iconSize} ${light ? "text-sky-300" : "text-brand-600"}`}
        />
      </div>
      <div>
        <span className={`${textSize} font-bold ${light ? "text-white" : "text-slate-800"}`}>
          Pulse Point
        </span>
        {size === "lg" && (
          <p className={`text-xs ${light ? "text-slate-300" : "text-text-muted"}`}>
            Hospital Management
          </p>
        )}
      </div>
    </Link>
  );
}
