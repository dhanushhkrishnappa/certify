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
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Socratic AI Mentor Configuration</h3>
        <p className="text-xs text-slate-500">
          Tailor how the academic mentor probes your understanding in the AI Learning Studio and oral defense chambers.
        </p>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
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
                className={`p-3.5 rounded-xl border text-left transition ${
                  socraticRigor === option.id
                    ? "border-[#5B4DF0] bg-indigo-50/50 ring-2 ring-indigo-100"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{option.label}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Real-Time Streaming</div>
            <div className="text-[11px] text-slate-500">
              Stream AI mentor explanations token-by-token over Server-Sent Events (SSE).
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStreamAiResponses(!streamAiResponses)}
            className={`w-11 h-6 rounded-full transition-colors p-1 ${
              streamAiResponses ? "bg-[#5B4DF0]" : "bg-slate-200"
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Code Sandbox Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Editor Theme</div>
            <div className="text-[11px] text-slate-500">
              Select Monaco / IDE theme for Python sandbox challenges.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCodeEditorTheme("dark")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                codeEditorTheme === "dark"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              VS Dark
            </button>
            <button
              onClick={() => setCodeEditorTheme("light")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                codeEditorTheme === "light"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Light
            </button>
          </div>
        </div>
      </div>

      {/* Account & Session Management */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Account & Authentication</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Current Session User</span>
            <span className="font-semibold text-slate-900">{user?.fullName || user?.name || "Dhanush K"}</span>

          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Authenticated Email</span>
            <span className="font-semibold text-slate-900">{user?.email || "learner@certify.edu"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Backend API Endpoint</span>
            <span className="font-mono text-slate-700">http://localhost:5000/api/v1</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#5B4DF0] hover:bg-[#4C3DE0] text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Save Changes
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-800 transition"
            >
              Sign Out of Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
