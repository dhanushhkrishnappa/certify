import React from "react";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  BarChart3,
  ShieldAlert,
  ClipboardCheck,
  Code2,
} from "lucide-react";
import type {
  ChapterProgressionNode,
  ModuleProgressionNode,
  SectionProgressionNode,
} from "../../types/index.js";

interface SectionStepperProps {
  activeModule: ModuleProgressionNode | null;
  activeChapter: ChapterProgressionNode | null;
  activeSection: SectionProgressionNode | null;
  driftBanner: { classification: string; targetModuleTitle?: string | null } | null;
  isAdvancing: boolean;
  onAdvanceSection: () => void;
  onOpenCheckpoint: () => void;
  onOpenPractical: () => void;
  onOpenSkillsDrawer: () => void;
  onAdvanceChapter: () => void;
}

export const SectionStepper: React.FC<SectionStepperProps> = ({
  activeModule,
  activeChapter,
  activeSection,
  driftBanner,
  isAdvancing,
  onAdvanceSection,
  onOpenCheckpoint,
  onOpenPractical,
  onOpenSkillsDrawer,
  onAdvanceChapter,
}) => {
  if (!activeChapter || !activeModule) return null;

  const allCriteria = activeChapter.concepts.flatMap((c) => c.criteria);
  const isCheckpointSection = activeSection?.sectionType === "CHAPTER_CHECKPOINT";
  const isPracticalSection = activeSection?.sectionType === "MODULE_PRACTICAL";
  const isChapterDone = activeChapter.status === "COMPLETED";

  return (
    <div className="border-b border-white/[0.08] bg-[#0c0c10]/95 backdrop-blur px-4 py-3 space-y-2.5">
      {/* Row 1: Breadcrumb + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] text-zinc-500 font-medium truncate">
            {activeModule.title}
          </div>
          <div className="text-sm font-semibold text-zinc-100 truncate">
            Lesson {activeChapter.sequenceOrder}: {activeChapter.title.replace(/^\*\*\s*/, "")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSkillsDrawer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-200 cursor-pointer transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
            Skills &amp; Rubrics
          </button>

          {isChapterDone ? (
            <button
              type="button"
              onClick={onAdvanceChapter}
              disabled={isAdvancing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              Next Lesson
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : isCheckpointSection ? (
            <button
              type="button"
              onClick={onOpenCheckpoint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Take Checkpoint
            </button>
          ) : isPracticalSection ? (
            <button
              type="button"
              onClick={onOpenPractical}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-white px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              Open Practical Task
            </button>
          ) : activeSection ? (
            <button
              type="button"
              onClick={onAdvanceSection}
              disabled={!activeSection.readyToAdvance || isAdvancing}
              title={
                activeSection.readyToAdvance
                  ? "Advance to next section"
                  : `Complete at least ${activeSection.minTurns} guided response(s) in this section first`
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeSection.readyToAdvance
                  ? "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer"
                  : "bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08]"
              }`}
            >
              {isAdvancing ? "Advancing..." : "Next Section"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Row 2: Ordered Section Stepper Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {activeChapter.sections.map((sec) => {
          const isCurrent = sec.id === activeSection?.id;
          const isDone = sec.status === "COMPLETED";
          const isLocked = sec.status === "LOCKED";

          return (
            <div
              key={sec.id}
              onClick={() => {
                if (sec.sectionType === "CHAPTER_CHECKPOINT" && !isLocked) onOpenCheckpoint();
                if (sec.sectionType === "MODULE_PRACTICAL" && !isLocked) onOpenPractical();
              }}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                isCurrent
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                  : isDone
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : isLocked
                  ? "border-white/[0.05] bg-white/[0.02] text-zinc-600"
                  : "border-white/[0.1] bg-white/[0.04] text-zinc-300 cursor-pointer"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : isLocked ? (
                <Lock className="w-2.5 h-2.5 text-zinc-600" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
              <span>{sec.title}</span>
            </div>
          );
        })}
      </div>

      {/* Row 3: Active Objective & Live Rubric Criteria Pills */}
      {activeSection && (
        <div className="flex flex-col gap-1.5 pt-0.5">
          <p className="text-[11px] text-zinc-400 leading-snug">
            <span className="text-zinc-200 font-medium">Objective:</span> {activeSection.objective}
          </p>
          {allCriteria.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allCriteria.map((cr) => {
                const isMet = cr.status === "DEMONSTRATED" || cr.status === "MASTERED";
                const isMisconception = cr.misconceptionCount > 0 && !isMet;
                const isPartial = cr.status === "PARTIAL";

                return (
                  <span
                    key={cr.id}
                    title={`${cr.cognitiveLevel} · Weight ${cr.weight} · Mastery ${Math.round(cr.pCriterion * 100)}%`}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] border ${
                      isMet
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : isMisconception
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                        : isPartial
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-400"
                    }`}
                  >
                    <span className="font-mono text-[9px] opacity-75">{cr.cognitiveLevel}</span>
                    <span className="truncate max-w-[260px]">{cr.statement}</span>
                    {isMet && <span>✓</span>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Drift Redirect Guardrail Banner */}
      {driftBanner && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            {driftBanner.classification === "SKIP_ATTEMPT"
              ? "Structured Progression Active: Complete the active section and checkpoint to unlock subsequent chapters."
              : driftBanner.targetModuleTitle
              ? `Scope Guardrail: "${driftBanner.targetModuleTitle}" unlocks after prerequisite modules are completed. Staying focused on ${activeModule.title}.`
              : `Scope Guardrail: Staying focused on ${activeSection?.title || activeChapter.title}.`}
          </span>
        </div>
      )}
    </div>
  );
};
