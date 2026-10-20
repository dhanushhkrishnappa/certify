import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { User } from "../../types/index.js";
import { UserProfileCard } from "./UserProfileCard.js";
import { useTheme } from "../../context/ThemeContext.js";
import { SquishSwitch } from "./SquishSwitch.js";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  user: User | null;
  onSearch?: (query: string) => void;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  hideGreeting?: boolean;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  showThemeToggle?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  user,
  onSearch,
  breadcrumbs,
  hideGreeting = false,
  onNavigate,
  onLogout,
  showThemeToggle = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const profileCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleProfileEnter = () => {
    if (profileCloseTimeoutRef.current) {
      clearTimeout(profileCloseTimeoutRef.current);
      profileCloseTimeoutRef.current = null;
    }
    setIsProfileHovered(true);
  };

  const handleProfileLeave = () => {
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsProfileHovered(false);
    }, 240);
  };

  const { isLight, toggleTheme } = useTheme();
  const displayName = user?.fullName || (user?.email ? user.email.split("@")[0] : "Learner");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 select-none transition-colors duration-300" data-purpose="top-navigation-bar">
      {/* Greeting / Breadcrumb / Title */}
      {!hideGreeting && (
        <div>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className={`flex items-center space-x-2 text-xs mb-1 transition-colors duration-300 ${isLight ? "text-purple-900/70" : "text-purple-200/60"}`}>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>/</span>}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className={`hover:opacity-100 transition-opacity cursor-pointer ${isLight ? "text-purple-950 font-medium" : "hover:text-white"}`}
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={`font-semibold ${isLight ? "text-purple-950" : "text-purple-100"}`}>{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : null}

          {title ? (
            <h1 className={`text-3xl lg:text-[34px] font-serif font-semibold tracking-tight transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>
              {title}
            </h1>
          ) : (
            <h1 className={`text-2xl font-extrabold tracking-tight flex items-center gap-2 transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>
              Good morning, {displayName} <span className="text-xl">👋</span>
            </h1>
          )}
          <p className={`text-xs font-medium mt-0.5 transition-colors duration-300 ${isLight ? "text-purple-950/80" : "text-purple-200/70"}`}>
            {subtitle || "Keep learning. Real understanding creates real opportunities."}
          </p>
        </div>
      )}

      {/* Universal Search Bar */}
      <div className={`flex-1 ${hideGreeting ? "max-w-xl" : "max-w-md mx-2"}`}>
        <div className="relative">
          <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none transition-colors duration-300 ${isLight ? "text-purple-900/60" : "text-purple-200/60"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            className={`w-full pl-9 pr-4 py-2 rounded-full text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-inner ${
              isLight
                ? "bg-white/80 border border-purple-900/15 text-slate-900 placeholder-purple-900/40 focus:bg-white focus:ring-purple-500/40 focus:text-slate-900"
                : "bg-white/10 border border-white/15 text-white placeholder-purple-200/50 focus:ring-white/40 focus:bg-white focus:text-slate-900"
            }`}
            placeholder={title ? "Search courses, concepts or skills..." : "Search courses, concepts or ask anything..."}
            type="text"
          />
        </div>
      </div>

      {/* Header Right: Academic Motto, Theme Switcher, Notification Bell, User Avatar */}
      <div className="flex items-center space-x-3.5 shrink-0">
        <div className="text-right hidden xl:block">
          <p className={`text-[11px] italic font-serif leading-snug transition-colors duration-300 ${isLight ? "text-purple-950/80 font-medium" : "text-purple-200/70"}`}>
            “A certified you,<br />a more capable tomorrow.”
          </p>
        </div>

        {/* Theme SquishSwitch Toggle - Only shown when showThemeToggle is true */}
        {showThemeToggle && (
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-300 ${
              isLight
                ? "bg-white/80 border-purple-900/15 shadow-xs text-slate-800"
                : "bg-white/10 border-white/15 text-white/90"
            }`}
            title={`Currently in ${isLight ? "Light Mode (#C5B8D6)" : "Dark Mode (#15062B)"}. Click to toggle.`}
          >
            <span className="text-xs select-none" aria-hidden="true">
              {isLight ? "☀️" : "🌙"}
            </span>
            <SquishSwitch
              checked={isLight}
              onChange={toggleTheme}
              trackColor="#25143D"
              trackOnColor="#7C3AED"
              thumbColor="#C4B5FD"
              thumbOnColor="#FFFFFF"
              width={52}
              height={26}
              radius={13}
              speed={55}
              stretch={32}
              hoverScale={1.05}
              colorDuration={300}
              ariaLabel="Toggle between light and dark modes"
            />
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadNotifications > 0) setUnreadNotifications(0);
            }}
            aria-label="Notifications"
            className={`relative p-2 rounded-full border transition-colors duration-300 ${
              isLight
                ? "bg-white/80 hover:bg-white text-slate-800 border-purple-900/15 shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white border-white/15"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadNotifications > 0 && (
              <span className={`absolute top-0 right-0 w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center ring-2 ${
                isLight ? "ring-[#C5B8D6]" : "ring-[#15062B]"
              }`}>
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Simple notification dropdown */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border p-3 z-50 animate-fade-in transition-all duration-300 ${
              isLight
                ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_12px_36px_rgba(76,29,149,0.12)]"
                : "bg-[#111111] border-white/[0.08] text-white shadow-2xl"
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-purple-100" : "border-white/[0.08]"}`}>
                <span className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Notifications</span>
                <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>All caught up</span>
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${
                  isLight ? "bg-purple-50/70 border-purple-100 text-slate-800" : "bg-white/[0.04] border-white/[0.06]"
                }`}>
                  <p className={`font-semibold text-[11px] ${isLight ? "text-purple-700 font-bold" : "text-purple-300"}`}>Chapter 3 In Progress</p>
                  <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-neutral-300"}`}>Continue with Functions & Modular Code.</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isLight ? "bg-purple-50/50 border-purple-100 text-slate-800" : "bg-white/[0.02] border-white/[0.06]"
                }`}>
                  <p className={`font-semibold text-[11px] ${isLight ? "text-slate-900 font-bold" : "text-white"}`}>Streak: 12 Days Active</p>
                  <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Keep up the daily practice rhythm!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Hover Card */}
        <div
          className="relative"
          onMouseEnter={handleProfileEnter}
          onMouseLeave={handleProfileLeave}
        >
          <div
            onClick={() => onNavigate?.("profile")}
            className={`w-9 h-9 rounded-full overflow-hidden transition-all duration-300 cursor-pointer shadow-md shrink-0 ${
              isProfileHovered
                ? "ring-2 ring-white/80 shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-105"
                : "ring-2 ring-white/20 hover:ring-white/50 hover:scale-105 active:scale-95"
            }`}
            title={`${displayName} • ${user?.email || "learner@certify.edu"}`}
          >
            <img
              src="/user-avatar.jpg"
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>

          <AnimatePresence>
            {isProfileHovered && (
              <motion.div
                key="header-spotlight-profile-popup"
                initial={{
                  opacity: 0,
                  scale: 0.15,
                  borderRadius: 28,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  borderRadius: 20,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.15,
                  borderRadius: 28,
                  transition: {
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                transition={{
                  type: "spring",
                  damping: 24,
                  stiffness: 260,
                  mass: 0.8,
                }}
                style={{
                  transformOrigin: "top right",
                }}
                className="absolute right-0 top-full mt-2.5 z-50 select-none"
                data-purpose="header-user-spotlight-profile-card"
              >
                {/* Invisible hover bridge connecting trigger to popup */}
                <div
                  className="absolute -top-3 -right-2 -left-2 h-4 pointer-events-auto"
                  aria-hidden="true"
                />
                <UserProfileCard
                  user={user}
                  onNavigate={onNavigate}
                  onLogout={onLogout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
