import React, { useState } from "react";

interface DiagnosticViewProps {
  courseSlug: string;
  onComplete: () => void;
  onCancel?: () => void;
  onNavigate: (view: string) => void;
}

interface ProbeItem {
  id: number;
  code: string;
  conceptTitle: string;
  scenario: string;
  topology?: {
    label: string;
    status: string;
    details: string;
    nodes: string;
  };
  options: {
    key: string;
    text: string;
    isHonest?: boolean;
  }[];
}

const PROBES: ProbeItem[] = [
  {
    id: 1,
    code: "DIAG-PROBE-01-MEM",
    conceptTitle: "CONCEPT: CPYTHON MEMORY ALLOCATION & MUTABILITY",
    scenario: "In CPython 3.12+, consider an application evaluating identity comparisons (a is b) on small integer objects. What memory invariant guarantees deterministic behavior for integer objects within [-5, 256]?",
    topology: {
      label: "ALLOCATION STATE",
      status: "SINGLETON POOL ACTIVE",
      details: "Small Integer Cache: [-5 ... 256]",
      nodes: "Memory Invariant: id(a) == id(b) for cached literals",
    },
    options: [
      { key: "A", text: "Small integers are pre-allocated singletons on runtime initialization; references share identical memory addresses." },
      { key: "B", text: "All integers are allocated fresh heap memory regardless of numerical value." },
      { key: "C", text: "Garbage collection automatically reclaims small integer objects on each iteration tick." },
      { key: "D", text: "I haven't analyzed CPython memory mutability yet (honest calibration).", isHonest: true },
    ],
  },
  {
    id: 2,
    code: "DIAG-PROBE-02-RAFT",
    conceptTitle: "CONCEPT: RAFT CONSENSUS & LEADER ELECTION",
    scenario: "Consider a 5-node Raft cluster. Network partition separates Nodes A and B from Nodes C, D, and E. Node A enters candidate state and increments its term from 3 to 4. What happens when Node A requests votes from Node B?",
    topology: {
      label: "TOPOLOGY STATE",
      status: "PARTITION ACTIVE",
      details: "Cluster Partition: [Node A, Node B] ⚡ [Node C, Node D, Node E]",
      nodes: "Candidate: Node A • Term: 3 → 4 • Quorum Requirement: 3 / 5",
    },
    options: [
      { key: "A", text: "Node B grants the vote, but Node A cannot achieve quorum because it can only receive 2 of 5 required votes." },
      { key: "B", text: "Node B immediately rejects the vote because Node A is isolated from the cluster majority." },
      { key: "C", text: "Node A transitions to Leader immediately within its partition and commits local log entries." },
      { key: "D", text: "I haven't worked with Raft consensus leader election yet (honest calibration).", isHonest: true },
    ],
  },
  {
    id: 3,
    code: "DIAG-PROBE-03-CONC",
    conceptTitle: "CONCEPT: ASYNCIO COROUTINE PIPELINES & EVENT LOOP ATOMICITY",
    scenario: "In an asyncio coroutine pipeline handling concurrent I/O operations, what invariant prevents race conditions when multiple coroutines access a shared mutable dictionary without explicit threading locks?",
    topology: {
      label: "RUNTIME STATE",
      status: "SINGLE-THREAD EVENT LOOP",
      details: "Coroutines: Task-1, Task-2 concurrent dispatch",
      nodes: "Atomicity Boundary: Interleaving only occurs at explicit await points",
    },
    options: [
      { key: "A", text: "Cooperative multitasking guarantees that synchronous operations between await points execute atomically on the single thread." },
      { key: "B", text: "The GIL automatically manages atomic write serialization across independent OS processes." },
      { key: "C", text: "Dictionaries in Python throw ConcurrentModificationException on simultaneous lookups." },
      { key: "D", text: "I haven't worked with asyncio concurrency invariants yet (honest calibration).", isHonest: true },
    ],
  },
  {
    id: 4,
    code: "DIAG-PROBE-04-QUORUM",
    conceptTitle: "CONCEPT: STATE MACHINE REPLICATION & QUORUM INTERSECTION",
    scenario: "In a quorum-replicated distributed datastore with N=5 nodes, read quorum R=3, and write quorum W=3, what mathematical invariant guarantees that any successful read contains the latest committed write?",
    topology: {
      label: "QUORUM OVERLAP",
      status: "STRICT INVARIANT: R + W > N",
      details: "Parameters: N = 5, R = 3, W = 3",
      nodes: "Intersection: |R ∩ W| ≥ 1 by Pigeonhole Principle",
    },
    options: [
      { key: "A", text: "By the Pigeonhole Principle, R + W = 6 > 5 guarantees at least one node in the read quorum intersects with the latest write quorum." },
      { key: "B", text: "Hardware clocks are synchronized via GPS atomic receivers across all cluster nodes." },
      { key: "C", text: "Every read operation performs a full 5-node cluster broadcast before returning." },
      { key: "D", text: "I haven't analyzed distributed quorum intersection theorems yet (honest calibration).", isHonest: true },
    ],
  },
];

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  courseSlug: _courseSlug,
  onComplete,
  onCancel,
  onNavigate,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("A");
  const [justification, setJustification] = useState("");
  const [probeIndex, setProbeIndex] = useState(1);

  const currentProbe = PROBES[probeIndex - 1] || PROBES[0];

  const handleContinue = () => {
    if (probeIndex >= 4) {
      onComplete();
    } else {
      setProbeIndex((prev) => prev + 1);
      setSelectedOption("A");
      setJustification("");
    }
  };

  const handleSkip = () => {
    if (onCancel) onCancel();
    else onNavigate("studio");
  };

  return (
    <div className="bg-[#0C0D11] text-[#FBF9F5] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[16px] leading-[24px] antialiased selection:bg-[#9d7bff] selection:text-[#FBF9F5]">
      {/* Top Navigation Bar */}
      <header className="bg-[#0C0D11] sticky top-0 z-50 w-full border-b border-[#494553]">
        <div className="flex justify-between items-center w-full px-8 py-3 max-w-7xl mx-auto">
          {/* Left: Brand & Context Breadcrumb */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#171922] border border-[#494553] flex items-center justify-center text-[#cebdff]">
                <span className="material-symbols-outlined text-[16px]">deployed_code</span>
              </div>
              <span className="text-[20px] font-semibold tracking-tight text-[#FBF9F5]">Certify</span>
            </div>
            <div className="h-4 w-[1px] bg-[#494553]"></div>
            <nav className="flex items-center space-x-2 text-[14px] text-[#8E93A6]">
              <span onClick={() => onNavigate("course-details")} className="hover:text-[#FBF9F5] transition-colors cursor-pointer">
                Distributed Systems Architecture
              </span>
              <span className="text-[#948e9f]">/</span>
              <span className="text-[#FBF9F5] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#cef056] animate-pulse"></span>
                Diagnostic Pre-Assessment
              </span>
            </nav>
          </div>

          {/* Center: Calibration Progress Meter */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-[12px] uppercase text-[#8E93A6]">Probe {probeIndex} of 4</span>
              <div className="flex items-center space-x-1.5">
                {/* Segment 1 */}
                <div className={`w-7 h-1.5 rounded-full ${probeIndex >= 1 ? "bg-[#cef056]" : "bg-[#2b2931] border border-[#494553]"}`}></div>
                {/* Segment 2 */}
                <div className={`w-7 h-1.5 rounded-full ${probeIndex >= 2 ? "bg-[#cef056] shadow-[0_0_8px_rgba(206,240,86,0.6)]" : "bg-[#2b2931] border border-[#494553]"}`}></div>
                {/* Segment 3 */}
                <div className={`w-7 h-1.5 rounded-full ${probeIndex >= 3 ? "bg-[#cef056] shadow-[0_0_8px_rgba(206,240,86,0.6)]" : "bg-[#2b2931] border border-[#494553]"}`}></div>
                {/* Segment 4 */}
                <div className={`w-7 h-1.5 rounded-full ${probeIndex >= 4 ? "bg-[#cef056] shadow-[0_0_8px_rgba(206,240,86,0.6)]" : "bg-[#2b2931] border border-[#494553]"}`}></div>
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#cebdff] opacity-80 tracking-wide">
              Calibrating Prior Mastery P(L₀)
            </span>
          </div>

          {/* Right: Subtitle Actions & Profile */}
          <div className="flex items-center space-x-5">
            <button
              onClick={handleSkip}
              className="text-[14px] text-[#8E93A6] hover:text-[#FBF9F5] transition-colors underline-offset-4 hover:underline"
            >
              Start from Foundations (Skip Diagnostic)
            </button>
            <div className="h-4 w-[1px] bg-[#494553]"></div>
            <div className="flex items-center space-x-2 bg-[#13151A] border border-[#494553] py-1 px-2.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-[#1E222D] border border-[#cebdff]/30 flex items-center justify-center text-[#cebdff] font-mono text-[11px] font-semibold">
                AR
              </div>
              <span className="text-[12px] text-[#FBF9F5] pr-1">Alex Rivera</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-[820px] mx-auto px-6 py-12 flex flex-col justify-between">
        <div className="w-full flex flex-col space-y-8">
          {/* Header Block */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9d7bff]/10 border border-[#9d7bff]/30 shadow-[0_0_20px_-5px_rgba(157,123,255,0.18)]">
              <span className="w-2 h-2 rounded-full bg-[#9d7bff]"></span>
              <span className="font-mono text-[13px] text-[#cebdff] font-medium tracking-wide">
                INITIAL KNOWLEDGE MAPPING
              </span>
            </div>
            <h1 className="text-[32px] leading-[40px] font-semibold text-[#FBF9F5] tracking-tight">
              Let’s map your existing knowledge foundation.
            </h1>
            <p className="text-[16px] text-[#8E93A6] leading-relaxed max-w-2xl">
              This is a non-punitive baseline probe to calibrate your personalized learning curve. Your responses determine where Socratic dialogues begin.
            </p>
          </div>

          {/* Active Probe Card */}
          <div className="bg-[#13151A] border border-[#494553]/60 rounded-xl p-8 space-y-7 backdrop-blur-sm relative">
            {/* Concept Tag Header */}
            <div className="flex items-center justify-between border-b border-[#494553]/40 pb-4">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#cebdff] text-base">hub</span>
                <span className="font-mono text-[13px] text-[#FBF9F5] font-medium tracking-wider">
                  {currentProbe.conceptTitle}
                </span>
              </div>
              <span className="font-mono text-[12px] text-[#8E93A6]">{currentProbe.code}</span>
            </div>

            {/* Scenario Description */}
            <div className="space-y-4">
              <p className="text-[16px] text-[#EDE8DF] leading-relaxed">
                {currentProbe.scenario}
              </p>

              {/* Topology Monospace Snippet Box */}
              {currentProbe.topology && (
                <div className="bg-[#0f0d15] border border-[#494553]/50 rounded-lg p-4 font-mono text-[13px] space-y-2">
                  <div className="flex items-center justify-between text-[#8E93A6] text-[11px] pb-1 border-b border-[#494553]/30">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">lan</span>
                      {currentProbe.topology.label}
                    </span>
                    <span className="text-[#ffdea3] font-medium">{currentProbe.topology.status}</span>
                  </div>
                  <div className="text-[#cebdff] pt-1 flex items-center space-x-2">
                    <span className="text-[#8E93A6]">{currentProbe.topology.details}</span>
                  </div>
                  <div className="text-[#8E93A6] text-[12px] flex items-center gap-4 pt-0.5">
                    <span>{currentProbe.topology.nodes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Response Options */}
            <div className="space-y-3" role="radiogroup">
              {currentProbe.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                return (
                  <label
                    key={opt.key}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`group relative flex items-start p-4 rounded-lg bg-[#171922] border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "border-[#cef056]/50 shadow-[0_0_0_1.5px_#cef056,inset_0_0_12px_rgba(206,240,86,0.05)]"
                        : "border-[#494553]/60 hover:border-[#948e9f]"
                    }`}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mt-0.5 mr-3.5 flex-shrink-0 bg-[#0C0D11] ${
                      isSelected ? "border-[#cef056]" : "border-[#948e9f]"
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#cef056]"></div>}
                    </div>
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-[13px] font-medium ${isSelected ? "text-[#cef056]" : "text-[#8E93A6]"}`}>
                          OPTION {opt.key}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-[#cef056] bg-[#cef056]/10 px-1.5 py-0.2 rounded border border-[#cef056]/30">
                            SELECTED
                          </span>
                        )}
                        {opt.isHonest && (
                          <span className="text-[10px] text-[#cebdff] bg-[#9d7bff]/10 px-2 py-0.5 rounded border border-[#9d7bff]/20">
                            HONEST CALIBRATION
                          </span>
                        )}
                      </div>
                      <p className={`text-[14px] leading-normal ${isSelected ? "text-[#FBF9F5]" : "text-[#EDE8DF]"}`}>
                        {opt.text}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Optional Justification Input Field */}
            <div className="pt-2 border-t border-[#494553]/30 space-y-2">
              <label className="flex items-center justify-between text-[12px] text-[#8E93A6]" htmlFor="probe-justification">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#cebdff] text-sm">neurology</span>
                  Briefly explain your reasoning (optional Socratic calibration probe)
                </span>
                <span className="font-mono text-[11px] text-[#8E93A6]">OPTIONAL</span>
              </label>
              <div className="relative">
                <input
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full bg-[#0f0d15] border border-[#494553] rounded-lg px-4 py-3 font-mono text-[13px] text-[#FBF9F5] placeholder:text-[#948e9f] focus:outline-none focus:border-[#9d7bff] focus:ring-1 focus:ring-[#9d7bff] transition-colors"
                  id="probe-justification"
                  placeholder="e.g., Node B hasn't voted in term 4 and log is up to date, but majority is ⌊5/2⌋ + 1 = 3..."
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calibration Footer / Status Deck */}
        <div className="pt-8 pb-4 space-y-4">
          <div className="bg-[#13151A] border border-[#494553] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Bayesian Realtime Indicator */}
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-[#cef056]"></span>
                <span className="w-3 h-3 rounded-full bg-[#cef056] animate-ping absolute opacity-75"></span>
              </div>
              <div>
                <div className="text-[11px] uppercase text-[#8E93A6]">
                  Current Prior Mastery Baseline
                </div>
                <div className="text-[14px] font-semibold text-[#FBF9F5] flex items-center gap-1.5">
                  <span>Intermediate</span>
                  <span className="text-[#8E93A6] font-normal">• Practitioner Track Recommendation</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setProbeIndex((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2.5 rounded-lg border border-[#494553] hover:bg-[#171922] text-[14px] text-[#8E93A6] hover:text-[#FBF9F5] transition-all"
              >
                Previous
              </button>
              <button
                onClick={handleContinue}
                className="px-5 py-2.5 rounded-lg bg-[#cef056] hover:bg-[#b3d33b] text-[#0C0D11] text-[14px] font-semibold flex items-center space-x-2 transition-all duration-200 active:scale-[0.98] shadow-[0_0_15px_rgba(206,240,86,0.2)]"
              >
                <span>Submit &amp; Continue Calibration</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/15 font-mono">↵</span>
              </button>
            </div>
          </div>

          {/* Bayesian Micro Footnote */}
          <div className="flex items-center justify-center space-x-2 text-center">
            <span className="material-symbols-outlined text-[#cebdff] text-xs">lock</span>
            <span className="font-mono text-[12px] text-[#8E93A6]">
              Certify Bayesian Knowledge Tracing will continuously update your mastery as you engage with Chapter 1.
            </span>
          </div>
        </div>
      </main>

      {/* Docked Protocol Verification Footer */}
      <footer className="bg-[#13151A] border-t border-[#494553] w-full mt-auto">
        <div className="w-full px-8 py-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#8E93A6] text-[14px]">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-[#cebdff] text-base">verified_user</span>
            <span className="font-mono text-xs">
              © 2026 Certify Protocol. All cryptographic credentials backed by verifiable database proofs. Defensible mastery engine.
            </span>
          </div>
          <div className="flex items-center space-x-6 text-[14px]">
            <a className="hover:text-[#FBF9F5] transition-colors" href="#">Registry</a>
            <a className="hover:text-[#FBF9F5] transition-colors" href="#">Verification Node</a>
            <a className="hover:text-[#FBF9F5] transition-colors" href="#">Audit Logs</a>
            <a className="hover:text-[#FBF9F5] transition-colors" href="#">Privacy</a>
            <a className="hover:text-[#FBF9F5] transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
