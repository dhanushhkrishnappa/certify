import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { User } from "../../types/index.js";
import { UserProfileCard } from "./UserProfileCard.js";

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
}) => {
  const [isHovered, setIsHovered] = useState(false);
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

  // Top navigation dock expands on top dock hover only
  const isExpanded = isHovered;
  const isProfileOpen = isProfileHovered;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "catalog",
      label: "Explore Courses",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "mylearning",
      label: "My Learning",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11zM8 4v16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "credentials",
      label: "Credentials",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "progress",
      label: "Progress",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];


  const displayName = user?.fullName || (user?.email ? user.email.split("@")[0] : "Learner");
  const displayEmail = user?.email || "learner@certify.edu";

  return (
    <>
      {/* 1. Main Floating Navigation Card (Ends cleanly right after Settings) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-4 top-4 z-40 flex flex-col py-4 select-none font-sans antialiased rounded-[28px] border border-white/[0.08] bg-[#111111]/95 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isExpanded ? "w-[244px] px-3.5" : "w-[68px] px-2.5 items-center"
        }`}
        style={{
          width: isExpanded ? "244px" : "68px",
        }}
        data-purpose="sidebar-dock-navigation"
      >
        {/* Subtle Ambient Radial Highlight for glassy depth */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.04)_0%,transparent_50%)]"
          aria-hidden="true"
        />

        {/* Top Brand Logo */}
        <div
          onClick={() => onNavigate("dashboard")}
          className={`flex items-center cursor-pointer select-none h-10 w-full mb-3 relative z-10 transition-all duration-200 ${
            isExpanded ? "px-2 justify-start" : "justify-center"
          }`}
          data-purpose="brand-logo"
          title="Certify Home"
        >
          {isExpanded ? (
            <picture>
              <source srcSet="/certify-logo.webp" type="image/webp" />
              <img
                src="/certify-logo.png"
                alt="Certify"
                decoding="async"
                className="h-8 w-auto object-contain shrink-0 transition-transform duration-200 hover:scale-[1.02] brightness-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
              />
            </picture>
          ) : (
            <img
              src="/certify-icon.png"
              alt="Certify"
              className="w-8 h-8 object-contain shrink-0 transition-transform duration-200 hover:scale-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
            />
          )}
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1 w-full relative z-10" data-purpose="primary-navigation">
          {navItems.map((item) => {
            const isActive =
              currentView === item.id ||
              (item.id === "catalog" && currentView === "course-details");
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center rounded-xl transition-all duration-150 text-left cursor-pointer group ${
                  isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                } ${
                  isActive
                    ? "bg-white text-[#111111] font-bold shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-[#111111]"
                      : "text-neutral-400 group-hover:text-white transition-colors"
                  }
                >
                  {item.icon}
                </span>
                <span
                  className={`text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Secondary Navigation Section (Profile, Settings) */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.08] space-y-1 w-full relative z-10">

          {/* Profile */}
          <button
            onClick={() => onNavigate("profile")}
            title={!isExpanded ? "Profile" : undefined}
            className={`w-full flex items-center rounded-xl transition-all duration-150 text-left cursor-pointer group ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
            } ${
              currentView === "profile"
                ? "bg-white text-[#111111] font-bold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <svg
              className={`w-5 h-5 shrink-0 ${
                currentView === "profile"
                  ? "text-[#111111]"
                  : "text-neutral-400 group-hover:text-white"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
              }`}
            >
              Profile
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate("settings")}
            title={!isExpanded ? "Settings" : undefined}
            className={`w-full flex items-center rounded-xl transition-all duration-150 text-left cursor-pointer group ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
            } ${
              currentView === "settings"
                ? "bg-white text-[#111111] font-bold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <svg
              className={`w-5 h-5 shrink-0 ${
                currentView === "settings"
                  ? "text-[#111111]"
                  : "text-neutral-400 group-hover:text-white"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
              }`}
            >
              Settings
            </span>
          </button>
        </div>
      </aside>

      {/* 2. Separate Bottom User Avatar & React Bits SpotlightCard at 45° offset */}
      {/* Standalone Avatar Icon directly sitting on the page - ALWAYS VISIBLE */}
      <div
        onMouseEnter={handleProfileEnter}
        onMouseLeave={handleProfileLeave}
        className="fixed left-4 bottom-4 z-40 select-none w-[68px] flex justify-center"
        data-purpose="user-quick-profile-collapsed"
      >
        <div
          onClick={() => onNavigate("profile")}
          className={`w-11 h-11 rounded-full overflow-hidden transition-all duration-300 cursor-pointer shadow-lg ${
            isProfileOpen
              ? "ring-2 ring-white/80 shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-105"
              : "ring-2 ring-white/20 hover:ring-white/50 hover:scale-105 active:scale-95"
          }`}
          title={`${displayName} • ${displayEmail}`}
        >
          <img
            src={user?.image || "/user-avatar.jpg"}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* SpotlightCard Popup - starts 45 degrees right of avatar with smooth spring animation */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            key="spotlight-profile-popup"
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
              transformOrigin: "bottom left",
            }}
            onMouseEnter={handleProfileEnter}
            onMouseLeave={handleProfileLeave}
            className="fixed left-[72px] bottom-[26px] z-50 select-none"
            data-purpose="user-spotlight-profile-card"
          >
            {/* Invisible hover bridge connecting avatar area to card */}
            <div
              className="absolute -left-5 -bottom-5 w-10 h-10 pointer-events-auto"
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
    </>
  );
};
