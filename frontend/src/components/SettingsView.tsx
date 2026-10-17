import React, { useState } from "react";
import type { User } from "../types/index.js";

interface SettingsViewProps {
  user?: User | null;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const [socraticRigor, setSocraticRigor] = useState<"standard" | "rigorous" | "adversarial">("rigorous");
  const [codeEditorTheme, setCodeEditorTheme] = useState<"dark" | "light">("dark");
  const [streamAiResponses, setStreamAiResponses] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          Preferences saved successfully.
        </div>
      )}

      {/* Socratic AI Mentor Tuning */}
      <div className="bg-[#111111] rounded-2xl p-6 border border-white/[0.08] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white">Socratic AI Mentor Configuration</h3>
        <p className="text-xs text-neutral-400">
          Tailor how the academic mentor probes your understanding in the AI Learning Studio and oral defense chambers.
        </p>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
            Pedagogical Rigor Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "standard",
                label: "Standard",
                desc: "Balanced hints with step-by-step guidance",
              },
              {
                id: "rigorous",
                label: "Rigorous (Recommended)",
                desc: "Demands code invariants and counterexample analysis",
              },
              {
                id: "adversarial",
                label: "Adversarial Defense",
                desc: "Relentless edge-case testing & Big-O complexity challenge",
              },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSocraticRigor(option.id as any)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  socraticRigor === option.id
                    ? "border-[#5B4DF0] bg-white/[0.06] ring-2 ring-indigo-500/30"
                    : "border-white/[0.08] hover:border-white/20 bg-white/[0.03]"
                }`}
              >
                <div className="text-xs font-bold text-white">{option.label}</div>
                <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Real-Time Streaming</div>
            <div className="text-[11px] text-neutral-400">
              Stream AI mentor explanations token-by-token over Server-Sent Events (SSE).
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStreamAiResponses(!streamAiResponses)}
            className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
              streamAiResponses ? "bg-[#5B4DF0]" : "bg-neutral-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                streamAiResponses ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Code Editor & Execution Sandbox Preferences */}
      <div className="bg-[#111111] rounded-2xl p-6 border border-white/[0.08] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white">Code Sandbox Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Editor Theme</div>
            <div className="text-[11px] text-neutral-400">
              Select Monaco / IDE theme for Python sandbox challenges.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCodeEditorTheme("dark")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                codeEditorTheme === "dark"
                  ? "bg-white text-[#111111]"
                  : "bg-white/[0.06] text-neutral-300 border border-white/[0.08]"
              }`}
            >
              VS Dark
            </button>
            <button
              onClick={() => setCodeEditorTheme("light")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                codeEditorTheme === "light"
                  ? "bg-white text-[#111111]"
                  : "bg-white/[0.06] text-neutral-300 border border-white/[0.08]"
              }`}
            >
              Light
            </button>
          </div>
        </div>
      </div>

      {/* Account & Session Management */}
      <div className="bg-[#111111] rounded-2xl p-6 border border-white/[0.08] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white">Account & Authentication</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.08]">
            <span className="text-neutral-400">Current Session User</span>
            <span className="font-semibold text-white">{user?.fullName || user?.name || "Dhanush K"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.08]">
            <span className="text-neutral-400">Authenticated Email</span>
            <span className="font-semibold text-white">{user?.email || "learner@certify.edu"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.08]">
            <span className="text-neutral-400">Backend API Endpoint</span>
            <span className="font-mono text-neutral-300">http://localhost:5000/api/v1</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
          >
            Save Changes
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer"
            >
              Sign Out of Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
