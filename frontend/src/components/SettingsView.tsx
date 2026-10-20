import React, { useState } from "react";
import type { User } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";
import { SquishSwitch } from "./common/SquishSwitch.js";

interface SettingsViewProps {
  user?: User | null;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const { isLight, toggleTheme } = useTheme();
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

      {/* Appearance & Workspace Theme Toggle Card */}
      <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all duration-300 ${
        isLight
          ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
          : "bg-[#111111] border-white/[0.08] text-white"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>
              Appearance & Theme
            </h3>
            <p className={`text-xs mt-1 transition-colors duration-300 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Toggle between Flagship Dark (#15062B) and Editorial Light (#C5B8D6) workspace canvas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold select-none transition-colors duration-300 ${
              isLight ? "text-purple-950 font-bold" : "text-neutral-300"
            }`}>
              {isLight ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </span>
            <SquishSwitch
              checked={isLight}
              onChange={toggleTheme}
              trackColor="#25143D"
              trackOnColor="#7C3AED"
              thumbColor="#C4B5FD"
              thumbOnColor="#FFFFFF"
              width={64}
              height={32}
              radius={16}
              speed={55}
              stretch={36}
              hoverScale={1.04}
              colorDuration={320}
              ariaLabel="Toggle between light and dark modes"
            />
          </div>
        </div>
      </div>

      {/* Socratic AI Mentor Tuning */}
      <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all duration-300 ${
        isLight
          ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
          : "bg-[#111111] border-white/[0.08] text-white"
      }`}>
        <h3 className={`text-base font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>
          Socratic AI Mentor Configuration
        </h3>
        <p className={`text-xs transition-colors duration-300 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
          Tailor how the academic mentor probes your understanding in the AI Learning Studio and oral defense chambers.
        </p>

        <div className="space-y-3 pt-2">
          <label className={`block text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
            isLight ? "text-slate-700" : "text-neutral-300"
          }`}>
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
                <div className={`text-xs font-bold transition-colors duration-300 ${
                  socraticRigor === option.id 
                    ? (isLight ? "text-purple-700 font-bold" : "text-white")
                    : (isLight ? "text-slate-800" : "text-white")
                }`}>{option.label}</div>
                <div className={`text-[11px] mt-1 leading-snug transition-colors duration-300 ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}>{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`pt-3 border-t flex items-center justify-between transition-colors duration-300 ${
          isLight ? "border-purple-100" : "border-white/[0.08]"
        }`}>
          <div>
            <div className={`text-xs font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>Real-Time Streaming</div>
            <div className={`text-[11px] transition-colors duration-300 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Stream AI mentor explanations token-by-token over Server-Sent Events (SSE).
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStreamAiResponses(!streamAiResponses)}
            className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
              streamAiResponses ? "bg-[#5B4DF0]" : (isLight ? "bg-slate-300" : "bg-neutral-800")
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
      <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all duration-300 ${
        isLight
          ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
          : "bg-[#111111] border-white/[0.08] text-white"
      }`}>
        <h3 className={`text-base font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>Code Sandbox Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-xs font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>Editor Theme</div>
            <div className={`text-[11px] transition-colors duration-300 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              Select Monaco / IDE theme for Python sandbox challenges.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCodeEditorTheme("dark")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                codeEditorTheme === "dark"
                  ? (isLight ? "bg-purple-900 text-white" : "bg-white text-[#111111]")
                  : (isLight ? "bg-purple-50 text-slate-700 border border-purple-200" : "bg-white/[0.06] text-neutral-300 border border-white/[0.08]")
              }`}
            >
              VS Dark
            </button>
            <button
              onClick={() => setCodeEditorTheme("light")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                codeEditorTheme === "light"
                  ? (isLight ? "bg-purple-900 text-white" : "bg-white text-[#111111]")
                  : (isLight ? "bg-purple-50 text-slate-700 border border-purple-200" : "bg-white/[0.06] text-neutral-300 border border-white/[0.08]")
              }`}
            >
              Light
            </button>
          </div>
        </div>
      </div>

      {/* Account & Session Management */}
      <div className={`rounded-2xl p-6 border shadow-sm space-y-4 transition-all duration-300 ${
        isLight
          ? "bg-white border-purple-900/10 text-slate-900 shadow-[0_8px_30px_rgba(76,29,149,0.06)]"
          : "bg-[#111111] border-white/[0.08] text-white"
      }`}>
        <h3 className={`text-base font-bold transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>Account & Authentication</h3>
        <div className="space-y-2 text-xs">
          <div className={`flex items-center justify-between py-2 border-b transition-colors duration-300 ${
            isLight ? "border-purple-100" : "border-white/[0.08]"
          }`}>
            <span className={isLight ? "text-slate-500" : "text-neutral-400"}>Current Session User</span>
            <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{user?.fullName || user?.name || "Dhanush K"}</span>
          </div>
          <div className={`flex items-center justify-between py-2 border-b transition-colors duration-300 ${
            isLight ? "border-purple-100" : "border-white/[0.08]"
          }`}>
            <span className={isLight ? "text-slate-500" : "text-neutral-400"}>Authenticated Email</span>
            <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{user?.email || "learner@certify.edu"}</span>
          </div>
          <div className={`flex items-center justify-between py-2 border-b transition-colors duration-300 ${
            isLight ? "border-purple-100" : "border-white/[0.08]"
          }`}>
            <span className={isLight ? "text-slate-500" : "text-neutral-400"}>Backend API Endpoint</span>
            <span className={`font-mono ${isLight ? "text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200" : "text-neutral-300"}`}>http://localhost:5000/api/v1</span>
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
              className="px-4 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition cursor-pointer"
            >
              Sign Out of Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
