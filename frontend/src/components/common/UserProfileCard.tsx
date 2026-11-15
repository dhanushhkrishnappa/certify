import React from "react";
import type { User } from "../../types/index.js";
import { SpotlightCard } from "./SpotlightCard.js";

export interface UserProfileCardProps {
  user: User | null;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onNavigate,
  onLogout,
  className = "",
}) => {
  const displayName = user?.fullName || (user?.email ? user.email.split("@")[0] : "Learner");

  return (
    <SpotlightCard
      theme="dark"
      spotlightColor="#ffffff"
      intensity={0.15}
      spotlightSize={180}
      softness={0.7}
      shape="circle"
      borderGlow={0.6}
      proximity={80}
      smoothing={0.3}
      grain={0.06}
      ambient={false}
      flare={true}
      data-purpose="user-spotlight-card"
      className={`w-[248px] !p-4 !rounded-[20px] shadow-[0_20px_45px_rgba(0,0,0,0.85)] font-sans antialiased ${className}`}
    >
      {/* Top Row: Avatar & Top-Right Action */}
      <div className="flex items-start justify-between mb-2.5 font-sans">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 shadow-md shrink-0 bg-neutral-900">
          <img
            src={user?.image || "/user-avatar.jpg"}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Log out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Name & Title */}
      <div className="mb-2.5 text-left font-sans">
        <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug font-sans">
          {displayName}
        </h3>
        <p className="text-[11px] text-neutral-400 mt-0.5 font-normal truncate font-sans">
          {user?.persona || (user?.role === "ADMIN" ? "Platform Administrator" : "Software Engineer & AI Scholar")}
        </p>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-1.5 mb-3 font-sans">
        {user?.emailVerified ? (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-medium text-emerald-300 border border-emerald-500/20 font-sans">
            ✓ Verified
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-medium text-amber-300 border border-amber-500/20 font-sans">
            ⏳ Unverified
          </span>
        )}
        <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-[10px] font-medium text-white/90 border border-white/[0.06] font-sans">
          AI Scholar
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-1.5 py-2 px-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3 font-sans">
        <div className="text-left font-sans">
          <div className="text-xs font-bold text-white flex items-center gap-0.5 font-sans">
            <span className="text-amber-400 text-[10px]">★</span> 4.9
          </div>
          <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Rating</div>
        </div>
        <div className="text-left font-sans">
          <div className="text-xs font-bold text-white font-sans">
            12
          </div>
          <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Credentials</div>
        </div>
        <div className="text-left font-sans">
          <div className="text-xs font-bold text-white font-sans">
            98%
          </div>
          <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Mastery</div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 font-sans">
        <button
          onClick={() => onNavigate?.("profile")}
          className="flex-1 py-1.5 px-3 rounded-full bg-neutral-800/90 hover:bg-neutral-700/90 text-white text-[11px] font-semibold tracking-wide transition-all duration-150 cursor-pointer shadow text-center font-sans"
        >
          View Profile
        </button>
        <button
          onClick={() => onNavigate?.("settings")}
          className="w-7 h-7 rounded-full bg-neutral-800/90 hover:bg-neutral-700/90 flex items-center justify-center text-white/70 hover:text-white transition-all duration-150 cursor-pointer shadow shrink-0"
          title="Settings"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </SpotlightCard>
  );
};

export default UserProfileCard;