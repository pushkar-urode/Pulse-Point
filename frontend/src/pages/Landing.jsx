import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  UserRound,
  ArrowRight,
  Shield,
  Building2,
  Calendar,
} from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

function Landing() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen overflow-hidden relative ${isDark ? "bg-slate-950 text-white" : "page-bg text-slate-900"}`}>
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className={`absolute top-10 left-10 w-80 h-80 rounded-full blur-[130px] ${isDark ? "bg-cyan-600/30" : "bg-brand-200/60"}`} />
        <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-[150px] ${isDark ? "bg-indigo-700/30" : "bg-accent-light/80"}`} />
      </div>

      <div className="relative">
        <div className="max-w-6xl mx-auto px-6 py-10 min-h-[85vh] flex flex-col">
          <header className="animate-fade-up flex items-center justify-between">
            <BrandLogo light={isDark} size="lg" />
            <ThemeToggle />
          </header>

          <main className="flex-1 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-12">
            <div className="flex-1 text-center lg:text-left animate-fade-up">
              <p className="text-cyan-400 font-medium mb-4 tracking-wide uppercase text-sm">
                Smart Hospital Management
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Healthcare at your
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  fingertips
                </span>
              </h1>

              <p className={`text-lg max-w-xl mx-auto lg:mx-0 mb-8 ${isDark ? "text-slate-400" : "text-text-muted"}`}>
                Book appointments with specialists, find real hospitals near
                you on the map, check bed availability, and manage care — all
                in one place.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                {[
                  { icon: Calendar, label: "Book Appointments" },
                  { icon: Building2, label: "Real Hospitals" },
                  { icon: Shield, label: "Secure Access" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center lg:items-start gap-2 p-4 rounded-xl backdrop-blur-md ${
                      isDark
                        ? "bg-slate-900/70 border border-slate-800"
                        : "card"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-brand-600"}`} />
                    <span className={`text-sm ${isDark ? "text-slate-300" : "text-text-muted"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-md animate-fade-up-delay">
              <div className={`p-8 rounded-3xl backdrop-blur-xl shadow-2xl ${
                isDark ? "bg-slate-900/90 border border-slate-800" : "card"
              }`}>
                <h2 className="text-2xl font-bold text-center mb-2">
                  Get Started
                </h2>

                <p className={`text-center text-sm mb-8 ${isDark ? "text-slate-400" : "text-text-muted"}`}>
                  Choose how you want to continue
                </p>

                <div className="space-y-5">
                  <div
                    className={`p-5 rounded-2xl border ${
                      isDark
                        ? "bg-gradient-to-br from-cyan-900/70 to-slate-900 border-cyan-700/40"
                        : "bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isDark ? "bg-cyan-500/20" : "bg-cyan-100"
                        }`}
                      >
                        <UserRound
                          className={`w-5 h-5 ${isDark ? "text-cyan-300" : "text-cyan-600"}`}
                        />
                      </div>

                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          Patient
                        </h3>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-text-muted"}`}>
                          Book doctors, beds & find hospitals
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate("/login/patient")}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition"
                      >
                        Login
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate("/register/patient")}
                        className={`py-2.5 px-4 rounded-xl border transition ${
                          isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "border-cyan-200 text-cyan-700 bg-white hover:bg-cyan-50"
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>

                  <div
                    className={`p-5 rounded-2xl border ${
                      isDark
                        ? "bg-gradient-to-br from-indigo-900/70 to-slate-900 border-indigo-700/40"
                        : "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                        }`}
                      >
                        <Stethoscope
                          className={`w-5 h-5 ${isDark ? "text-indigo-300" : "text-indigo-600"}`}
                        />
                      </div>

                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          Doctor
                        </h3>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-text-muted"}`}>
                          Manage appointments, beds & inventory
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate("/login/doctor")}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-400 transition"
                      >
                        Login
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate("/register/doctor")}
                        className={`py-2.5 px-4 rounded-xl border transition ${
                          isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Landing;
