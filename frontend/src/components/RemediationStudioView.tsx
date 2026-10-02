import React, { useState } from "react";

interface RemediationStudioViewProps {
  courseSlug?: string;
  conceptName?: string;
  onNavigate: (view: string) => void;
  onReturnToStudio?: () => void;
  onResolved?: () => void;
}

export const RemediationStudioView: React.FC<RemediationStudioViewProps> = ({
  courseSlug: _courseSlug,
  conceptName: _conceptName,
  onNavigate,
  onReturnToStudio,
  onResolved,
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(3); // Option 3 is correct (Concurrent)
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleReturn = () => {
    if (onResolved) onResolved();
    else if (onReturnToStudio) onReturnToStudio();
    else onNavigate("assessment");
  };

  return (
    <div className="bg-[#0C0D11] text-[#FBF9F5] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[14px] leading-[20px] selection:bg-[#9d7bff] selection:text-[#FBF9F5] antialiased">
      {/* ==================== HEADER BAR ==================== */}
      <header className="sticky top-0 z-50 bg-[#0C0D11]/95 backdrop-blur border-b border-[#494553]/40 px-6 py-3">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Certify mark & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 group flex-shrink-0 cursor-pointer" onClick={() => onNavigate("dashboard")}>
              <div className="w-8 h-8 rounded-lg bg-[#171922] border border-[#494553] flex items-center justify-center text-[#cebdff]">
                <span className="material-symbols-outlined text-lg">verified</span>
              </div>
              <span className="text-[20px] font-semibold tracking-tight text-[#FBF9F5]">Certify</span>
            </div>
            <div className="h-4 w-px bg-[#494553]/60 flex-shrink-0"></div>
            <nav className="flex items-center gap-2 text-[12px] text-[#8E93A6] truncate">
              <span onClick={() => onNavigate("course-details")} className="hover:text-[#FBF9F5] transition-colors cursor-pointer truncate">
                Distributed Systems Architecture
              </span>
              <span className="text-[#494553]">/</span>
              <span onClick={() => onNavigate("studio")} className="hover:text-[#FBF9F5] transition-colors cursor-pointer truncate">
                Chapter 2: Quorum Systems
              </span>
              <span className="text-[#494553]">/</span>
              <span className="text-[#FBF9F5] font-medium truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E06A55]"></span>
                Remediation: Vector Clocks &amp; Causality
              </span>
            </nav>
          </div>

          {/* Center: Non-Punitive Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#171922] border border-[#494553]/70 shadow-sm flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E06A55] animate-pulse"></span>
            <span className="font-mono text-[11px] font-medium text-[#EDE8DF] tracking-wider uppercase">
              CONCEPT PIVOT (Non-Punitive Socratic Deep-Dive)
            </span>
          </div>

          {/* Right: Sub-actions & Avatar */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => onNavigate("studio")}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#13151A] hover:bg-[#171922] border border-[#494553] text-[#8E93A6] hover:text-[#FBF9F5] transition-all text-xs"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Return to Chapter 2 Studio</span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-[#494553]/60">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#cebdff]/20 border border-[#cebdff]/40 flex items-center justify-center font-mono text-[#cebdff] font-semibold text-xs">
                  AR
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#b3d33b] ring-2 ring-[#0C0D11]" title="Verified Session Active"></span>
              </div>
              <span className="hidden sm:inline text-xs text-[#8E93A6] font-medium">Alex Rivera</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN 3-COLUMN STUDIO ==================== */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)_330px] gap-6 items-start">
        {/* ==================== LEFT COLUMN: Diagnosis & Misconception Breakdown ==================== */}
        <aside className="space-y-5">
          {/* Misconception Card */}
          <div className="rounded-lg bg-[#13151A] border border-[#494553]/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E06A55]/10 border border-[#E06A55]/30 text-[#E06A55] font-mono text-[11px] font-semibold tracking-wider">
                <span className="material-symbols-outlined text-xs">warning</span>
                DIAGNOSED CONCEPTUAL MISCONCEPTION
              </span>
              <span className="font-mono text-xs text-[#8E93A6] font-medium">INV-02</span>
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#FBF9F5] leading-snug">Scalar vs Vector Causality Confusion</h2>
              <p className="mt-2 text-[14px] text-[#8E93A6] leading-relaxed">
                In the previous demonstration, the submission assumed Lamport Timestamps could detect concurrent conflicting writes. Lamport clocks establish a total order but cannot detect concurrency.
              </p>
            </div>
            {/* Prior Submission Code Snippet */}
            <div className="rounded bg-[#171922] border border-[#494553]/50 p-3 font-mono text-[13px] overflow-x-auto">
              <div className="flex items-center justify-between text-[#948e9f] text-[11px] mb-2 border-b border-[#494553]/40 pb-1.5">
                <span>Prior Submission: line 42</span>
                <span className="text-[#E06A55]">Assertion Failed</span>
              </div>
              <pre className="text-[#EDE8DF] leading-5"><code><span className="text-[#cebdff] font-semibold">if</span> (nodeA.timestamp &lt; nodeB.timestamp) &#123;
  <span className="text-[#FBF9F5] font-bold">return</span> PRECEDES; 
&#125; <span className="text-[#E06A55]">// False causality assertion</span></code></pre>
            </div>
          </div>

          {/* Topology Mini-Map Card */}
          <div className="rounded-lg bg-[#13151A] border border-[#494553]/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-[#8E93A6] font-semibold">Divergence Topology</h3>
              <span className="font-mono text-xs text-[#948e9f]">Network Graph</span>
            </div>
            <div className="bg-[#171922] rounded p-4 border border-[#494553]/40 space-y-4 relative overflow-hidden">
              <div className="absolute right-2 top-2 px-1.5 py-0.5 rounded bg-[#1E222D] text-[#8E93A6] font-mono text-[10px] border border-[#494553]/40">
                No Network Link
              </div>
              {/* Node A Track */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#cebdff] font-medium">Node A</span>
                  <span className="text-[#8E93A6]">Scalar L = 3</span>
                </div>
                <div className="relative h-6 flex items-center">
                  <div className="w-full h-0.5 bg-[#494553]/70"></div>
                  <div className="absolute left-1/3 w-3.5 h-3.5 rounded-full bg-[#cebdff] ring-4 ring-[#0C0D11] flex items-center justify-center text-[9px] font-mono text-[#0C0D11] font-bold">
                    E1
                  </div>
                </div>
              </div>
              {/* Causality Gap indicator */}
              <div className="flex items-center justify-center gap-2 py-0.5">
                <div className="h-px flex-1 border-t border-dashed border-[#E06A55]/40"></div>
                <span className="font-mono text-[10px] text-[#E06A55] bg-[#E06A55]/10 px-2 py-0.5 rounded border border-[#E06A55]/20">
                  E1 || E2 (Concurrently Independent)
                </span>
                <div className="h-px flex-1 border-t border-dashed border-[#E06A55]/40"></div>
              </div>
              {/* Node B Track */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#b3d33b] font-medium">Node B</span>
                  <span className="text-[#8E93A6]">Scalar L = 4</span>
                </div>
                <div className="relative h-6 flex items-center">
                  <div className="w-full h-0.5 bg-[#494553]/70"></div>
                  <div className="absolute right-1/4 w-3.5 h-3.5 rounded-full bg-[#b3d33b] ring-4 ring-[#0C0D11] flex items-center justify-center text-[9px] font-mono text-[#0C0D11] font-bold">
                    E2
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#494553]/30 text-[11px] font-mono text-[#948e9f] leading-tight">
                Scalar assumption: L(E1) &lt; L(E2) mistakenly asserts E1 preceded E2 despite disjoint partitions.
              </div>
            </div>
          </div>

          {/* Socratic Diagnostic Trace */}
          <div className="rounded-lg bg-[#13151A] border border-[#494553]/60 p-4 space-y-2.5 font-mono text-xs">
            <span className="text-xs uppercase tracking-wider text-[#8E93A6] font-semibold block font-sans">
              Bayesian Diagnostic Trace
            </span>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between py-1 border-b border-[#494553]/30">
                <span className="text-[#8E93A6]">Prior Drop P(L):</span>
                <span className="text-[#E06A55] font-medium">0.58 (-0.27)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#494553]/30">
                <span className="text-[#8E93A6]">Diagnostic Trigger:</span>
                <span className="text-[#EDE8DF]">Criterion 2 Violation</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8E93A6]">Remediation Mode:</span>
                <span className="text-[#cebdff]">Socratic Inquiry</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ==================== CENTER COLUMN: Socratic Mental Model Pivot ==================== */}
        <section className="space-y-6 max-w-[800px] mx-auto w-full">
          {/* AI Presence Beacon */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#13151A] via-[#171922] to-[#13151A] border border-[#494553]/60 relative overflow-hidden">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#cebdff]/30 animate-spin" style={{ animationDuration: "18s" }}></div>
              <div className="w-7 h-7 rounded-full bg-[#cebdff]/20 backdrop-blur border border-[#cebdff] flex items-center justify-center text-[#cebdff] shadow-lg shadow-[#cebdff]/20">
                <span className="material-symbols-outlined text-base">psychology</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#FBF9F5]">Certify Socratic Mentor</span>
                <span className="px-2 py-0.5 rounded-full bg-[#cebdff]/10 text-[#cebdff] border border-[#cebdff]/20 font-mono text-[10px]">
                  Adaptive Dialogue
                </span>
              </div>
              <p className="text-[14px] text-[#8E93A6]">
                Synthesizing vector invariants through exploratory first principles.
              </p>
            </div>
          </div>

          {/* Socratic Guidance Card */}
          <div className="rounded-xl bg-[#13151A] border border-[#494553]/60 p-6 md:p-8 space-y-4 shadow-sm">
            <div className="inline-flex items-center gap-2 text-[#cebdff] text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              FIRST PRINCIPLE RE-ORIENTATION
            </div>
            <h1 className="text-[24px] font-bold text-[#FBF9F5] leading-tight">
              Let’s approach this from a different angle.
            </h1>
            <div className="text-[16px] text-[#EDE8DF] space-y-4 leading-relaxed">
              <p>
                Consider two isolated nodes, <strong className="text-[#cebdff] font-medium">Node A</strong> and <strong className="text-[#b3d33b] font-medium">Node B</strong>. Node A executes event <span className="font-mono text-sm px-1.5 py-0.5 bg-[#171922] rounded border border-[#494553]/60">E1</span> at scalar tick 3. Simultaneously, Node B executes event <span className="font-mono text-sm px-1.5 py-0.5 bg-[#171922] rounded border border-[#494553]/60">E2</span> at scalar tick 4 without a single packet passing between them.
              </p>
              <p className="text-[#8E93A6]">
                Why does a scalar clock mislead us into thinking <span className="text-[#FBF9F5] font-medium">E1 caused E2</span>? Because scalar numbers always provide a total order (<code className="font-mono text-xs text-[#FBF9F5]">3 &lt; 4</code>), conflating <em className="text-[#FBF9F5]">arbitrary serialization</em> with <em className="text-[#FBF9F5]">physical causality</em>.
              </p>
            </div>
          </div>

          {/* Interactive Sandbox Thought Experiment */}
          <div className="rounded-xl bg-[#13151A] border border-[#494553]/60 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#494553]/40 pb-4">
              <div>
                <h3 className="text-[20px] font-semibold text-[#FBF9F5]">Vector Sandbox Experiment</h3>
                <p className="text-[14px] text-[#8E93A6]">Simulate causal tracking across independent timelines</p>
              </div>
              <div className="inline-flex rounded-lg bg-[#171922] p-1 border border-[#494553]/60 text-xs font-medium">
                <button
                  onClick={() => setActiveStep(1)}
                  className={`px-3 py-1.5 rounded transition-all ${activeStep === 1 ? "bg-[#cebdff] text-[#390094] shadow-sm font-semibold" : "text-[#8E93A6] hover:text-[#FBF9F5]"}`}
                >
                  Step 1: Local Event
                </button>
                <button
                  onClick={() => setActiveStep(2)}
                  className={`px-3 py-1.5 rounded transition-all ${activeStep === 2 ? "bg-[#cebdff] text-[#390094] shadow-sm font-semibold" : "text-[#8E93A6] hover:text-[#FBF9F5]"}`}
                >
                  Step 2: Send Msg
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className={`px-3 py-1.5 rounded transition-all ${activeStep === 3 ? "bg-[#cebdff] text-[#390094] shadow-sm font-semibold" : "text-[#8E93A6] hover:text-[#FBF9F5]"}`}
                >
                  Step 3: Merge Vector
                </button>
              </div>
            </div>

            {/* Message Exchange Diagram */}
            <div className="bg-[#171922]/80 rounded-lg border border-[#494553]/60 p-6 space-y-6">
              {/* Node A Vector Track */}
              <div className="flex items-center gap-4">
                <div className="w-20 font-mono text-xs text-[#cebdff] font-semibold flex-shrink-0">Node A:</div>
                <div className="flex-1 relative h-10 flex items-center">
                  <div className="w-full h-0.5 bg-[#494553]"></div>
                  <div className="absolute left-4 -top-1 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#948e9f] ring-2 ring-[#171922]"></span>
                    <span className="font-mono text-[10px] text-[#8E93A6] mt-1">[0, 0]</span>
                  </div>
                  <div className="absolute left-1/2 -top-2 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#cebdff]/20 border-2 border-[#cebdff] flex items-center justify-center font-mono text-xs text-[#cebdff] font-bold">
                      E1
                    </div>
                    <div className="mt-1 px-2 py-0.5 rounded bg-[#1E222D] border border-[#cebdff]/40 font-mono text-xs text-[#cebdff] font-semibold">
                      V_A = [1, 0]
                    </div>
                  </div>
                </div>
              </div>

              {/* Causality Independence Zone */}
              <div className="py-2 px-4 rounded bg-[#1E222D]/50 border border-[#494553]/30 flex items-center justify-between text-xs font-mono text-[#8E93A6]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#948e9f]">call_split</span>
                  Disjoint Memory Contexts
                </span>
                <span className="text-[#f6be41] font-mono">Neither component dominates</span>
              </div>

              {/* Node B Vector Track */}
              <div className="flex items-center gap-4">
                <div className="w-20 font-mono text-xs text-[#b3d33b] font-semibold flex-shrink-0">Node B:</div>
                <div className="flex-1 relative h-10 flex items-center">
                  <div className="w-full h-0.5 bg-[#494553]"></div>
                  <div className="absolute left-4 -top-1 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#948e9f] ring-2 ring-[#171922]"></span>
                    <span className="font-mono text-[10px] text-[#8E93A6] mt-1">[0, 0]</span>
                  </div>
                  <div className="absolute left-2/3 -top-2 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#b3d33b]/20 border-2 border-[#b3d33b] flex items-center justify-center font-mono text-xs text-[#b3d33b] font-bold">
                      E2
                    </div>
                    <div className="mt-1 px-2 py-0.5 rounded bg-[#1E222D] border border-[#b3d33b]/40 font-mono text-xs text-[#b3d33b] font-semibold">
                      V_B = [0, 1]
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expression Comparison Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[13px]">
              <div className="p-3.5 rounded bg-[#171922] border border-[#E06A55]/40">
                <div className="text-[11px] text-[#E06A55] font-semibold mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">close</span>
                  SCALAR CLOCK INFERENCE
                </div>
                <div className="text-[#FBF9F5] font-medium">L(E1) &lt; L(E2) =&gt; True</div>
                <div className="text-xs text-[#8E93A6] mt-1">False positive causality assertion</div>
              </div>
              <div className="p-3.5 rounded bg-[#171922] border border-[#b3d33b]/50">
                <div className="text-[11px] text-[#b3d33b] font-semibold mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check</span>
                  VECTOR CLOCK INFERENCE
                </div>
                <div className="text-[#FBF9F5] font-medium">V(E1) || V(E2) =&gt; Concurrent</div>
                <div className="text-xs text-[#b3d33b] mt-1">Correctly captures concurrent independence</div>
              </div>
            </div>
          </div>

          {/* Micro-Exercise Conceptual Check */}
          <div className="rounded-xl bg-[#13151A] border border-[#494553]/60 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#8E93A6] font-semibold">
                Interactive Diagnostic Probe
              </span>
              <span className="px-2 py-0.5 rounded bg-[#171922] text-[#b3d33b] font-mono text-xs border border-[#b3d33b]/30">
                Recovery Criterion
              </span>
            </div>
            <p className="text-[16px] text-[#FBF9F5] font-medium">
              If node vector clocks evaluate to <code className="font-mono text-[#cebdff] bg-[#171922] px-2 py-0.5 rounded border border-[#494553]/60">V_A = [2, 0]</code> and <code className="font-mono text-[#b3d33b] bg-[#171922] px-2 py-0.5 rounded border border-[#494553]/60">V_B = [1, 2]</code>, what is the exact causal relationship between their events?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                data-purpose="remediation-option-1"
                onClick={() => setSelectedOption(1)}
                className={`p-3.5 rounded-lg border text-left transition-colors text-sm ${
                  selectedOption === 1 ? "bg-[#b3d33b]/10 border-2 border-[#b3d33b] text-[#FBF9F5]" : "bg-[#171922] border-[#494553]/60 text-[#8E93A6] hover:border-[#948e9f]"
                }`}
              >
                <div className="font-mono text-xs text-[#948e9f] mb-1">Option 1</div>
                <span>A caused B</span>
              </button>

              <button
                type="button"
                data-purpose="remediation-option-2"
                onClick={() => setSelectedOption(2)}
                className={`p-3.5 rounded-lg border text-left transition-colors text-sm ${
                  selectedOption === 2 ? "bg-[#b3d33b]/10 border-2 border-[#b3d33b] text-[#FBF9F5]" : "bg-[#171922] border-[#494553]/60 text-[#8E93A6] hover:border-[#948e9f]"
                }`}
              >
                <div className="font-mono text-xs text-[#948e9f] mb-1">Option 2</div>
                <span>B caused A</span>
              </button>

              <button
                type="button"
                data-purpose="remediation-option-3"
                onClick={() => setSelectedOption(3)}
                className={`p-3.5 rounded-lg border-2 text-left transition-all text-sm ${
                  selectedOption === 3 ? "bg-[#b3d33b]/10 border-[#b3d33b] text-[#FBF9F5] ring-2 ring-[#b3d33b]/20" : "bg-[#171922] border-[#494553]/60 text-[#8E93A6]"
                }`}
              >
                <div className="font-mono text-xs text-[#b3d33b] font-semibold mb-1 flex items-center justify-between">
                  <span>Option 3 (Active)</span>
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                </div>
                <span className="font-medium">Concurrent (Neither dominates)</span>
              </button>
            </div>

            {/* Rationale Feedback Preview */}
            {selectedOption === 3 ? (
              <div className="rounded-lg bg-[#171922] border border-[#b3d33b]/40 p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#b3d33b] text-lg mt-0.5 flex-shrink-0">check_circle</span>
                <div className="space-y-1">
                  <span className="font-mono text-xs font-semibold text-[#b3d33b] uppercase tracking-wider block">Invariant Validated</span>
                  <p className="text-[14px] text-[#EDE8DF]">
                    <strong>Correct:</strong> Neither vector component-wise dominates the other (<code className="font-mono text-xs text-[#cebdff]">2 &gt; 1</code>, but <code className="font-mono text-xs text-[#b3d33b]">0 &lt; 2</code>), proving mutual causal independence. Vector comparisons guarantee <em>iff</em> causal consistency.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-[#171922] border border-[#E06A55]/40 p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#E06A55] text-lg mt-0.5 flex-shrink-0">error</span>
                <div className="space-y-1">
                  <span className="font-mono text-xs font-semibold text-[#E06A55] uppercase tracking-wider block">Invalid Causal Invariant</span>
                  <p className="text-[14px] text-[#EDE8DF]">
                    <strong>Misconception:</strong> For event X to cause event Y, all components of V_X must be &le; V_Y. Since V_A[0] = 2 &gt; V_B[0] = 1, Node A could not have preceded Node B.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================== RIGHT COLUMN: Mastery Restoration Ledger ==================== */}
        <aside className="space-y-5">
          {/* Calibration Recovery Card */}
          <div className="rounded-lg bg-[#13151A] border border-[#494553]/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#8E93A6] font-semibold">Mastery Ledger</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#b3d33b]/15 text-[#b3d33b] border border-[#b3d33b]/30 font-mono text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b3d33b] animate-pulse"></span>
                Recalibrating
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] text-[#8E93A6]">Bayesian Prior P(L):</span>
                <div className="font-mono text-sm font-semibold flex items-center gap-1.5">
                  <span className="text-[#8E93A6] line-through">0.58</span>
                  <span className="text-[#948e9f]">→</span>
                  <span className="text-[#b3d33b] text-base">0.85</span>
                  <span className="text-[#b3d33b] font-mono text-xs">(+0.27 Δ)</span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#171922] border border-[#494553]/50 relative overflow-hidden flex">
                <div className="h-full bg-[#494553]/80 w-[58%]"></div>
                <div className="h-full bg-[#b3d33b] w-[27%] transition-all duration-700 animate-pulse"></div>
              </div>
            </div>

            <div className="p-3 rounded bg-[#171922] border border-[#494553]/40 space-y-2">
              <div className="flex items-center gap-2 text-[#FBF9F5] font-medium text-xs">
                <span className="material-symbols-outlined text-[#b3d33b] text-sm">shield</span>
                Defensible Credential Guarantee
              </div>
              <p className="text-xs text-[#8E93A6] leading-relaxed">
                Certify never penalizes exploration or remediation. Demonstrating the concept will fully restore your mastery ledger and unlock Criterion 2 in Chapter 2.
              </p>
            </div>
          </div>

          {/* Concept Mastery Vector Breakdown */}
          <div className="rounded-lg bg-[#13151A] border border-[#494553]/60 p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-[#8E93A6] font-semibold">
              Criterion 2 Vectors
            </h3>
            <div className="space-y-3 font-mono text-[13px]">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#EDE8DF]">Lamport Total Ordering</span>
                  <span className="text-[#b3d33b] font-semibold">94% Mastered</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#171922] overflow-hidden">
                  <div className="h-full bg-[#b3d33b] w-[94%]"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#EDE8DF]">Vector Clock Invariants</span>
                  <span className="text-[#b3d33b] font-semibold">58% → 85%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#171922] overflow-hidden flex">
                  <div className="h-full bg-[#948e9f] w-[58%]"></div>
                  <div className="h-full bg-[#b3d33b] w-[27%]"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8E93A6]">Causal Domination Check</span>
                  <span className="text-[#948e9f] text-[11px]">Pending Re-evaluation</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#171922] overflow-hidden">
                  <div className="h-full bg-[#494553]/60 w-[30%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel & Primary CTA */}
          <div className="rounded-lg bg-[#13151A] border border-[#494553]/60 p-5 shadow-sm space-y-4">
            <button
              onClick={handleReturn}
              className="w-full py-3 px-4 rounded-lg bg-[#b3d33b] hover:bg-[#cef056] text-[#171e00] text-sm font-bold shadow-lg shadow-[#b3d33b]/15 transition-all duration-150 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <span>Return to Demonstration Mode</span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/20 text-[#171e00] font-medium">[⌘↵]</span>
            </button>
            <span className="block text-center text-xs text-[#8E93A6] hover:text-[#cebdff] transition-colors py-1 cursor-pointer">
              Explore Academic Reference Paper (Fidge &amp; Mattern 1988) ↗
            </span>
            <div className="pt-3 border-t border-[#494553]/40 flex items-center justify-between text-[11px] font-mono text-[#8E93A6]">
              <span className="truncate flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#cebdff]">key</span>
                Ed25519: 98a4...e210
              </span>
              <span className="text-[#b3d33b] text-[10px] font-medium uppercase tracking-wider flex-shrink-0">
                Anchored
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* Shared Footer */}
      <footer className="mt-auto bg-[#13151A] border-t border-[#494553]">
        <div className="w-full px-8 py-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-[20px] font-semibold text-[#FBF9F5]">Certify</div>
            <p className="text-[14px] text-[#8E93A6] max-w-xl">
              © 2026 Certify Protocol. All cryptographic credentials backed by verifiable database proofs. Defensible mastery engine.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[14px]">
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors" href="#">Registry</a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors" href="#">Verification Node</a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors" href="#">Audit Logs</a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors" href="#">Privacy</a>
            <a className="text-[#8E93A6] hover:text-[#FBF9F5] transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
