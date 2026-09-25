import React, { useState } from "react";
import type { User } from "../../types/index.js";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  user: User | null;
  onSearch?: (query: string) => void;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  hideGreeting?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  user,
  onSearch,
  breadcrumbs,
  hideGreeting = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = user?.fullName || (user?.email ? user.email.split("@")[0] : "Learner");

  const getInitials = (name?: string, email?: string) => {
    if (name && name !== "Learner") {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "LN";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 select-none" data-purpose="top-navigation-bar">
      {/* Greeting / Breadcrumb / Title */}
      {!hideGreeting && (
        <div>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>/</span>}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="font-semibold text-slate-700">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : null}

          {title ? (
            <h1 className="text-3xl lg:text-[34px] font-serif font-semibold text-[#181d27] tracking-tight">
              {title}
            </h1>
          ) : (
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Good morning, {displayName} <span className="text-xl">👋</span>
            </h1>
          )}
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {subtitle || "Keep learning. Real understanding creates real opportunities."}
          </p>
        </div>
      )}

      {/* Universal Search Bar */}
      <div className={`flex-1 ${hideGreeting ? "max-w-xl" : "max-w-md mx-2"}`}>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-[#EEE9DF] border-0 rounded-full text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DF0] focus:bg-white transition-all shadow-inner"
            placeholder={title ? "Search courses, concepts or skills..." : "Search courses, concepts or ask anything..."}
            type="text"
          />
        </div>
      </div>

      {/* Header Right: Academic Motto, Notification Bell, User Avatar */}
      <div className="flex items-center space-x-4 shrink-0">
        <div className="text-right hidden xl:block">
          <p className="text-[11px] italic font-serif text-slate-600 leading-snug">
            “A certified you,<br />a more capable tomorrow.”
          </p>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadNotifications > 0) setUnreadNotifications(0);
            }}
            aria-label="Notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 bg-[#EFE9DF] rounded-full hover:bg-[#E5DFD4] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center ring-2 ring-[#F8F7F4]">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Simple notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] text-slate-400">All caught up</span>
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100/60">
                  <p className="font-semibold text-purple-900 text-[11px]">Chapter 3 In Progress</p>
                  <p className="text-[10px] text-slate-600">Continue with Functions & Modular Code.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-800 text-[11px]">Streak: 12 Days Active</p>
                  <p className="text-[10px] text-slate-500">Keep up the daily practice rhythm!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small User Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[#1F2026] text-white font-bold text-xs flex items-center justify-center ring-1 ring-slate-400 shadow-xs shrink-0"
          title={displayName}
        >
          {getInitials(displayName, user?.email)}
        </div>
      </div>
    </header>
  );
};
