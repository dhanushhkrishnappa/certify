import React, { useState } from "react";
import { Lock, CheckCircle2, Circle, ChevronDown, ChevronRight, AlertTriangle, Code2 } from "lucide-react";
import type { ProgressionTree, ChapterProgressionNode, ModuleProgressionNode } from "../../types/index.js";

interface CurriculumRailProps {
  progression: ProgressionTree | null;
  activeChapterId: string | null;
  onSelectChapter: (chapter: ChapterProgressionNode, mod: ModuleProgressionNode) => void;
  lockedNotice?: string | null;
}

export const CurriculumRail: React.FC<CurriculumRailProps> = ({
  progression,
  activeChapterId,
  onSelectChapter,
  lockedNotice,
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  if (!progression) {
    return (
      <aside className="w-72 shrink-0 border-r border-white/[0.08] bg-[#0b0b0e] p-4 hidden lg:flex flex-col gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Structured Curriculum
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-400 leading-relaxed">
          Sign in and enroll to unlock backend-tracked progression across all 10 modules, checkpoints, and skill rubrics.
        </div>
      </aside>
    );
  }

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  return (
    <aside className="w-72 xl:w-80 shrink-0 border-r border-white/[0.08] bg-[#0b0b0e] hidden lg:flex flex-col h-screen sticky top-0">
      {/* Summary Header */}
      <div className="p-4 border-b border-white/[0.07]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Curriculum Path
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            {progression.summary.percentComplete}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${Math.max(progression.summary.percentComplete, 2)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            {progression.summary.modulesCompleted}/{progression.summary.modulesTotal} Modules
          </span>
          <span>
            {progression.summary.chaptersCompleted}/{progression.summary.chaptersTotal} Lessons
          </span>
        </div>
      </div>

      {lockedNotice && (
        <div className="mx-3 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200 flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* Module & Chapter Lock Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {progression.modules.map((mod) => {
          const isModLocked = mod.status === "LOCKED";
          const isModCompleted = mod.status === "COMPLETED";
          const hasActiveChapter = mod.chapters.some((c) => c.id === activeChapterId);
          const isExpanded = expandedModules[mod.id] ?? (hasActiveChapter || mod.status === "UNLOCKED" || mod.status === "IN_PROGRESS");

          return (
            <div
              key={mod.id}
              className={`rounded-xl border transition-colors ${
                isModLocked
                  ? "border-white/[0.04] bg-white/[0.01] opacity-60"
                  : hasActiveChapter
                  ? "border-white/[0.14] bg-white/[0.03]"
                  : "border-white/[0.07] bg-white/[0.02]"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full px-3 py-2.5 flex items-center gap-2 text-left cursor-pointer"
              >
                {isModCompleted ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : isModLocked ? (
                  <Lock className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                ) : (
                  <Circle className="w-3.5 h-3.5 shrink-0 text-violet-400 fill-violet-400/20" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-100 truncate">
                    {mod.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span>
                      {mod.chaptersCompleted}/{mod.totalChapters} lessons
                    </span>
                    {mod.practicalPassed && (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Code2 className="w-2.5 h-2.5" /> Practical ✓
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-2 pb-2 space-y-1 border-t border-white/[0.05] pt-1.5">
                  {mod.chapters.map((ch) => {
                    const isChLocked = ch.status === "LOCKED" || isModLocked;
                    const isActive = ch.id === activeChapterId;
                    const isChDone = ch.status === "COMPLETED";
                    const isRemediating = ch.status === "REMEDIATING";

                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => onSelectChapter(ch, mod)}
                        className={`w-full px-2.5 py-2 rounded-lg text-left flex items-start gap-2 transition-all ${
                          isActive
                            ? "bg-white/[0.09] text-white border border-white/[0.15]"
                            : isChLocked
                            ? "text-zinc-500 cursor-not-allowed hover:bg-white/[0.02]"
                            : "text-zinc-300 hover:bg-white/[0.05] cursor-pointer"
                        }`}
                      >
                        {isChDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        ) : isChLocked ? (
                          <Lock className="w-3 h-3 shrink-0 text-zinc-600 mt-0.5" />
                        ) : isRemediating ? (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                        ) : (
                          <Circle
                            className={`w-3 h-3 shrink-0 mt-0.5 ${
                              isActive ? "text-white fill-white" : "text-violet-400"
                            }`}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium leading-snug line-clamp-2">
                            {ch.sequenceOrder}. {ch.title.replace(/^\*\*\s*/, "")}
                          </div>
                          {!isChLocked && (
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              {isChDone
                                ? `Completed${ch.checkpointScore != null ? ` · ${Math.round(ch.checkpointScore * 100)}%` : ""}`
                                : isRemediating
                                ? "Needs Remediation"
                                : `Section ${ch.currentSectionOrder}/${ch.sections.length}`}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
