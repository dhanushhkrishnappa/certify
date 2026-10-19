import React from "react";
import type { User } from "../types/index.js";

interface ProfileViewProps {
  user?: User | null;
  onNavigateCredentials?: () => void;
  onNavigateCatalog?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onNavigateCredentials,
  onNavigateCatalog,
}) => {
  const learnerName = user?.fullName || user?.name || "Dhanush K";
  const learnerEmail = user?.email || "learner@certify.edu";
  const initials = learnerName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DK";


  return (
    <div className="space-y-6 pb-12">
      {/* Main Profile Identity Card */}
      <div className="bg-[#111111] rounded-2xl p-6 md:p-8 border border-white/[0.08] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/[0.08] text-white font-bold font-serif text-2xl flex items-center justify-center shadow-md shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{learnerName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-xs font-semibold">
                Active Candidate
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-0.5">{learnerEmail}</p>
            <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2 font-mono">
              <span>ID: USR-2026-DK-89</span>
              <span>•</span>
              <span>Joined: August 2026</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {onNavigateCredentials && (
            <button
              onClick={onNavigateCredentials}
              className="flex-1 md:flex-none px-4 py-2.5 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
            >
              View Earned Credentials
            </button>
          )}
          {onNavigateCatalog && (
            <button
              onClick={onNavigateCatalog}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Explore Tracks
            </button>
          )}
        </div>
      </div>

      {/* Academic Highlights & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#111111] border border-white/[0.08] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
            Certified Tracks
          </span>
          <div className="text-2xl font-bold text-white">2</div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 block">
            Python, Web Dev
          </span>
        </div>

        <div className="p-5 rounded-xl bg-[#111111] border border-white/[0.08] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
            Mean Assessment Score
          </span>
          <div className="text-2xl font-bold text-indigo-400">92.8%</div>
          <span className="text-xs text-neutral-400 mt-1 block">Across 14 tests</span>
        </div>

        <div className="p-5 rounded-xl bg-[#111111] border border-white/[0.08] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
            Learning Streak
          </span>
          <div className="text-2xl font-bold text-amber-400">12 Days</div>
          <span className="text-xs text-neutral-400 mt-1 block">Continuous activity</span>
        </div>

        <div className="p-5 rounded-xl bg-[#111111] border border-white/[0.08] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
            Oral Viva Defenses
          </span>
          <div className="text-2xl font-bold text-emerald-400">100% Cleared</div>
          <span className="text-xs text-neutral-400 mt-1 block">Full rubric criteria met</span>
        </div>
      </div>

      {/* Verified Skills Ledger Summary */}
      <div className="bg-[#111111] rounded-2xl p-6 border border-white/[0.08] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white">Verified Competency Ledger</h3>
        <p className="text-xs text-neutral-400">
          Skills verified through deterministic code assertion test suites and AI oral defense:
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Python Programming (Intermediate)",
            "Memory Mutability & Pointer Invariants",
            "Recursion & Stack Frames",
            "Linear & Associative Data Structures",
            "Deterministic Pytest Suites",
            "Modern Async JavaScript / DOM",
            "Component Lifecycle & State Re-rendering",
            "REST API Design & Invariants",
          ].map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-purple-200 text-xs font-medium border border-purple-500/20"
            >
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
