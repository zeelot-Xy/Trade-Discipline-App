import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Radar,
  UserCircle2,
  ScrollText,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import authService from "../services/authService.js";
import TradeCadetLogo from "./TradeCadetLogo.jsx";

const navItems = [
  { to: "/checklist", label: "Checklist", icon: ListChecks },
  { to: "/history", label: "History", icon: ScrollText },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/imports", label: "Imports", icon: FileSpreadsheet },
];

const secondaryNavItems = [
  { to: "/reviews/strategies", label: "Strategy Review", icon: BarChart3 },
  { to: "/reviews/rules", label: "Rule Impact", icon: Radar },
];

const bottomNavItems = navItems.filter(
  (item) =>
    item.to !== "/reviews/weekly" &&
    item.to !== "/reviews/strategies" &&
    item.to !== "/reviews/rules" &&
    item.to !== "/imports",
);

const getInitials = (fullName = "") =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const getFirstName = (fullName = "") => fullName.trim().split(/\s+/)[0] || "";

const desktopLinkClassName = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-500 text-slate-950"
      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
  }`;

const mobileMenuLinkClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-500 text-slate-950"
      : "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
  }`;

const mobileBottomLinkClassName = ({ isActive }) =>
  `flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition ${
    isActive ? "bg-emerald-500 text-slate-950" : "text-slate-300"
  }`;

export default function Navbar() {
  const { user, hydrateAuth } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopReviewsOpen, setDesktopReviewsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initials = getInitials(user?.fullName);
  const firstName = getFirstName(user?.fullName);
  const reviewsActive = location.pathname.startsWith("/reviews/");

  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopReviewsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authService.logout();
      hydrateAuth(null);
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white transition hover:border-emerald-400/30 xl:hidden"
                aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <TradeCadetLogo showWordmark subtitle="Trading Journal" />
            </div>

            <nav className="hidden items-center gap-2 xl:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className={desktopLinkClassName}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDesktopReviewsOpen((current) => !current)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    reviewsActive || desktopReviewsOpen
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  aria-expanded={desktopReviewsOpen}
                  aria-haspopup="menu"
                >
                  <CalendarDays className="h-4 w-4" />
                  Reviews
                  <ChevronDown
                    className={`h-4 w-4 transition ${desktopReviewsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {desktopReviewsOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-3 min-w-56 rounded-3xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl">
                    <div className="space-y-2">
                      {[
                        { to: "/reviews/weekly", label: "Weekly Review", icon: CalendarDays },
                        { to: "/reviews/strategies", label: "Strategy Review", icon: BarChart3 },
                        { to: "/reviews/rules", label: "Rule Impact", icon: Radar },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={mobileMenuLinkClassName}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:text-white xl:inline-flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-xs font-bold text-slate-950">
                  {initials || "TC"}
                </span>
                <span>{firstName || user?.fullName}</span>
                {user?.planType === "PRO" ? (
                  <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Pro
                  </span>
                ) : null}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition hover:bg-red-500/15 disabled:opacity-70"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {loggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl xl:hidden">
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-slate-950">
                    {initials || "TC"}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/70">
                      Signed in as
                    </p>
                    <p className="mt-1 font-medium text-white">{user?.fullName}</p>
                  </div>
                </div>
              </div>
              <nav className="space-y-3">
                <NavLink to="/profile" className={mobileMenuLinkClassName}>
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </NavLink>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} className={mobileMenuLinkClassName}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} className={mobileMenuLinkClassName}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 backdrop-blur-2xl xl:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={mobileBottomLinkClassName}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
