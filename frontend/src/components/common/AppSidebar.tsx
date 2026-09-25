import React from "react";
import type { User } from "../../types/index.js";

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  collapsed = false,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "catalog",
      label: "Explore Courses",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "mylearning",
      label: "My Learning",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11zM8 4v16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "credentials",
      label: "Credentials",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "progress",
      label: "Progress",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "LN";
  };

  const displayName = user?.fullName || (user?.email ? user.email.split("@")[0] : "Learner");
  const displayEmail = user?.email || "learner@certify.edu";

  return (
    <aside
      className={`min-h-screen bg-[#F5F2EB] border-r border-[#E9E4DA] flex flex-col justify-between py-6 shrink-0 fixed left-0 top-0 bottom-0 z-40 select-none transition-all duration-200 ${
        collapsed ? "w-[68px] px-2 items-center" : "w-[240px] px-4"
      }`}
      style={{ width: collapsed ? "68px" : "240px" }}
      data-purpose="sidebar-navigation"
    >
      {/* Top Brand & Navigation */}
      <div className="space-y-6 w-full">
        {/* Brand Logo & Collapse Toggle */}
        <div className={`flex items-center justify-between ${collapsed ? "justify-center" : "px-3"}`} data-purpose="brand-logo">
          <div
            onClick={() => onNavigate("dashboard")}
            className="flex items-center space-x-3 cursor-pointer"
            title="Certify Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-700 flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-5 h-5 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l6 3.75-6 3.75-6-3.75 6-3.75zm-6 5.5l5 3.12v6.25L6 14V9.7zm7 9.37V12.82l5-3.12V14l-5 5.07z" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-extrabold tracking-wider text-slate-900 leading-none">CERTIFY</h1>
                <p className="text-[9px] tracking-widest text-slate-400 font-semibold mt-1">LEARN • DEMONSTRATE • EARN</p>
              </div>
            )}
          </div>

          {onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Main Navigation Menu */}
        <nav className="space-y-1 text-sm font-medium w-full" data-purpose="primary-navigation">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === "catalog" && currentView === "course-details");
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl transition-colors text-left ${
                  collapsed ? "justify-center px-2 py-2.5" : "space-x-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-[#EBE5DA] text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-[#EEE9E0]"
                }`}
              >
                <span className={isActive ? "text-slate-900" : "text-slate-500"}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Secondary Navigation Section */}
        <div className="pt-4 border-t border-[#EAE3D6] space-y-1 text-sm font-medium w-full">
          {/* AI Tutor */}
          <button
            onClick={() => onNavigate("studio")}
            title={collapsed ? "AI Tutor / Ask Certify" : undefined}
            className={`w-full flex items-center rounded-xl transition-colors group text-left ${
              collapsed ? "justify-center px-2 py-2.5" : "space-x-3 px-3 py-2.5"
            } ${
              currentView === "studio"
                ? "bg-purple-100/70 text-purple-900 font-semibold"
                : "text-slate-700 hover:text-purple-700 hover:bg-purple-50/60"
            }`}
          >
            <svg
              className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span className="font-semibold text-slate-800">AI Tutor / Ask Certify</span>}
          </button>

          {/* Profile */}
          <button
            onClick={() => onNavigate("profile")}
            title={collapsed ? "Profile" : undefined}
            className={`w-full flex items-center rounded-xl transition-colors text-left ${
              collapsed ? "justify-center px-2 py-2.5" : "space-x-3 px-3 py-2.5"
            } ${
              currentView === "profile"
                ? "bg-[#EBE5DA] text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#EEE9E0]"
            }`}
          >
            <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>Profile</span>}
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate("settings")}
            title={collapsed ? "Settings" : undefined}
            className={`w-full flex items-center rounded-xl transition-colors text-left ${
              collapsed ? "justify-center px-2 py-2.5" : "space-x-3 px-3 py-2.5"
            } ${
              currentView === "settings"
                ? "bg-[#EBE5DA] text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#EEE9E0]"
            }`}
          >
            <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Bottom Sidebar Section */}
      <div className="space-y-4 w-full" data-purpose="sidebar-footer">
        {/* Expand toggle when collapsed */}
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center text-slate-400 hover:text-slate-700 p-2 rounded-md transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Motivational banner dark card (Expanded only) */}
        {!collapsed && (
          <div className="sidebar-art-bg rounded-2xl p-4 text-white shadow-md relative">
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 C30,60 70,100 100,70 L100,100 L0,100 Z" fill="#F97316" />
              <path d="M0,90 C40,75 60,95 100,85 L100,100 L0,100 Z" fill="#E11D48" />
            </svg>
            <div className="relative z-10">
              <p className="text-[13px] font-semibold tracking-tight leading-snug text-neutral-100">
                Knowledge<br />builds brighter<br />futures.
              </p>
            </div>
          </div>
        )}

        {/* User Profile Row */}
        <div
          className={`flex items-center pt-1 ${
            collapsed ? "justify-center" : "justify-between px-1"
          }`}
          data-purpose="user-quick-profile"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div
              className="w-9 h-9 rounded-full bg-[#202128] text-white font-bold text-xs flex items-center justify-center tracking-tight shadow-inner ring-1 ring-white/20 shrink-0"
              title={displayName}
            >
              {getInitials(displayName, displayEmail)}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{displayName}</h4>
                <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{displayEmail}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
              title="Log out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
