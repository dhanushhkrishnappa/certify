# Product Scope & Boundary Specification

## 1. Product Thesis & Vision
The current online education ecosystem is broken by an incentive misalignment: **it rewards passive consumption ("watch until done") rather than demonstrated understanding.** Platforms issue certificates based on video watch percentages or memorized multiple-choice questions (MCQs) that can be easily bypassed or shared.

**Certify** reverses this model:
> **"A learner should receive a certificate because they demonstrated meaningful learning — not merely because they completed a video playlist."**

Certify is fundamentally a **learning product first** and a **certification product second**. The AI is not an antagonistic proctor or a cold exam bot; it is a **Socratic Interactive Tutor & Mentor** that conducts a continuous dialogue, adapts pedagogical approaches to learner responses, diagnoses misconceptions, remediates weak concepts, and accumulates structured evidence of mastery across every chapter.

```
+----------------------------------------------------------------------------------------------------+
|                                     THE CORE VALUE SHIFT                                           |
+----------------------------------------------------------------------------------------------------+
|  TRADITIONAL MODEL:  Provider -> Video Playlist -> Learner Plays -> Attendance Tracked -> Cert     |
|  CERTIFY MODEL:      Provider -> Curated Course -> AI Interactive Tutor -> Demonstrated Mastery    |
|                                                     (Diagnostic -> Dialogue -> Checks -> Defense)  |
|                                                                    |                               |
|                                                     Evidence Accumulation Engine                   |
|                                                                    |                               |
|                                                     Tiered Credential (Easy / Medium / Hard)       |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. In-Scope vs. Deferred (Strict Boundaries)

To ensure production-grade execution without premature feature bloat, strict architectural boundaries are defined:

### In-Scope (MVP & V1 Core)
1. **Platform-Owned Curated Course Catalog**: High-quality, curated courses structured into modules, chapters, learning objectives, atomic concepts, and evaluation rubrics.
2. **Interactive Socratic AI Tutor**: Real-time conversational teaching via text chat, delivering conceptual explanations, analogies, code snippets, and follow-up probes.
3. **Adaptive Baseline Diagnostic**: Non-punitive pre-assessment establishing prior knowledge and selecting an initial difficulty tier.
4. **Continuous Chapter-Level Learning & Assessment**: Micro-checks during learning, closing with formal chapter assessments (explain, reason, apply, debug).
5. **Adaptive Tiering System**: Three credential tiers (**Foundation / Easy**, **Proficient / Medium**, **Advanced / Hard**) determined by multidimensional evidence rather than message count.
6. **Mastery & Evidence Engine**: Longitudinal tracking of concept-level competency using Bayesian Knowledge Tracing (BKT) and rubric-based evidence aggregation.
7. **Final Demonstrative Assessment**: Knowledge checkpoint + practical application task + AI Viva (conversational defense probing architectural trade-offs).
8. **Deterministic Certification Authority**: Cryptographically verified, multi-signal credential issuance separated completely from LLM decision authority.
9. **Public Credential Verification Portal**: High-trust public verification URL with granular evidence summaries (without leaking private conversational logs).
10. **Structured Course Authoring & Admin Layer**: Administrative tooling to curate courses, define rubrics, author question banks, and inspect learner cohort analytics.

### Deferred (Post-V1 & Future Phases)
* **Bring Your Own Learning / External Course Ingestion**: Uploading external video URLs, PDFs, or arbitrary syllabus files.
* **Open-Ended Skill Verification**: "Test any skill I already claim to know" without taking our curated course.
* **Talent / Recruitment Marketplace**: Employer candidate search, candidate ranking, recruiter dashboards, and job matching.
* **Skill Passport / Cross-Platform Credential Portability**: Unified global identity/resume sync.
* **Real-Time Voice Tutor**: Full-duplex speech-to-speech interaction (Architecture will be voice-ready, but implementation is deferred to V1.1/V2).
* **Automated Web-Camera / Proctoring Surveillance**: Intrusive eye-tracking, screen locking, or biometric surveillance (Anti-cheating is achieved by pedagogical design, not spyware).
* **Blockchain-Based Decentralized Ledgers**: Unnecessary complexity and gas fees for V1; replaced by standard cryptographic signatures and public verification URLs.

---

## 3. Target Audience & Initial Wedge
* **Primary Initial Wedge: College Students & Academic Programs**: High-friction environment where traditional online course certificates carry zero credibility with faculty and hiring managers.
* **Secondary Audience: Serious Upskilling Professionals & Career Switchers**: Self-directed learners who want genuine mastery and a defensible credential to prove competency in technical interviews.
* **Institutional Partners**: Academic departments and enterprise training programs seeking high-engagement interactive learning layers.

---

## 4. Product Success Metrics
1. **Evidence Density**: Average number of validated mastery evidence records generated per chapter (target: >= 4 atomic rubric verifications per concept).
2. **Remediation Efficacy**: Percentage of learners failing an initial concept check who achieve mastery after AI remediation (target: > 70%).
3. **Defense Depth**: Ratio of successful conceptual justifications during the final Viva/defense phase.
4. **Verification Trust Rate**: Frequency of public verification page hits from external referrers (e.g., LinkedIn, resumes).
5. **Completion with Integrity**: Learners who complete courses show consistent performance across chapters without sudden unexplained performance spikes.
