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
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-bold font-serif text-2xl flex items-center justify-center shadow-md shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{learnerName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                Active Candidate
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{learnerEmail}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
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
              className="flex-1 md:flex-none px-4 py-2.5 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              View Earned Credentials
            </button>
          )}
          {onNavigateCatalog && (
            <button
              onClick={onNavigateCatalog}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Explore Tracks
            </button>
          )}
        </div>
      </div>

      {/* Academic Highlights & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
            Certified Tracks
          </span>
          <div className="text-2xl font-bold text-slate-900">2</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Python, Web Dev
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
            Mean Assessment Score
          </span>
          <div className="text-2xl font-bold text-[#5B4DF0]">92.8%</div>
          <span className="text-xs text-slate-500 mt-1 block">Across 14 tests</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
            Learning Streak
          </span>
          <div className="text-2xl font-bold text-amber-600">12 Days</div>
          <span className="text-xs text-slate-500 mt-1 block">Continuous activity</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
            Oral Viva Defenses
          </span>
          <div className="text-2xl font-bold text-emerald-600">100% Cleared</div>
          <span className="text-xs text-slate-500 mt-1 block">Zero remediation flags</span>
        </div>
      </div>

      {/* Verified Skills Ledger Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Verified Competency Ledger</h3>
        <p className="text-xs text-slate-500">
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
              className="px-3 py-1.5 rounded-lg bg-[#F8F7F4] text-slate-800 text-xs font-medium border border-slate-200"
            >
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
