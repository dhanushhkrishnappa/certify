# CERTIFY — Master Documentation Index

Welcome to the official documentation suite for **CERTIFY**, an AI-first interactive engineering qualification and verifiable credentialing platform.

This directory is structured for **investors, enterprise partners, university stakeholders, and engineering architects** evaluating the platform.

---

## Document Catalog

| # | Document | Summary | Primary Audience |
| :-: | :--- | :--- | :--- |
| **01** | **[Business Proposal & Executive Pitch](./01_BUSINESS_PROPOSAL_AND_PITCH.md)** | The credential crisis, CERTIFY's defensible mastery protocol, target personas, competitive moat, and B2B/B2C monetization model. | Investors, Partners, Enterprise Buyers |
| **02** | **[System Architecture & Engineering Design](./02_SYSTEM_ARCHITECTURE_AND_DESIGN.md)** | High-level topology, strict AI vs. Deterministic math trust boundary, 4-level progression state machine, and real-time SSE lifecycle. | CTOs, System Architects, Technical Due Diligence |
| **03** | **[Technology Stack & Infrastructure](./03_TECH_STACK_AND_INFRASTRUCTURE.md)** | Complete breakdown of Frontend, Edge Backend, Database, Multi-Provider AI Gateway, Cryptography, Storage, and Transactional Email stacks. | Engineering Leads, DevOps, Technical Evaluators |
| **04** | **[Database Architecture & Schema Reference](./04_DATABASE_ARCHITECTURE_AND_SCHEMA.md)** | Comprehensive reference for all 37 PostgreSQL tables across 10 domains, entity relationships, `pgvector` HNSW + `tsvector` GIN indexes, and SQL files. | Database Architects, Backend Engineers |
| **05** | **[AI Pedagogy, Scoped RAG & BKT Mastery Engine](./05_AI_PEDAGOGY_RAG_AND_BKT_ENGINE.md)** | Stateful Socratic Pedagogical Director, 169-chunk 4-tier section-fenced RAG, Topic Drift firewall, Hybrid Rubric Evaluator, and BKT equations. | AI/ML Engineers, Learning Scientists |
| **06** | **[API Contract & Security Specification](./06_API_AND_SECURITY_SPECIFICATION.md)** | Complete REST & Server-Sent Events (SSE) endpoint specification, Better Auth + CSPRNG OTP flow, Durable Object rate limiting, and Ed25519 ledger. | Security Auditors, Full-Stack Engineers |
| **07** | **[Project Status: Completed vs. Future Roadmap](./07_PROJECT_STATUS_AND_ROADMAP.md)** | Transparent inventory of everything built and verified in v3.0.0 (`python-fundamentals`) vs. upcoming multi-track, container sandbox, and B2B milestones. | Investors, Product Managers, Engineering Team |

---

## Core Architectural Thesis in Three Rules

1. **Demonstrated Mastery Over Passive Consumption:** Learners cannot earn a credential by clicking through videos or guessing multiple-choice answers. Every concept requires conversational explanation, code trace analysis, checkpoint verification, and practical execution.
2. **Hard Trust Boundary Between LLM and Grading Math:** The Large Language Model never decides a learner's mastery probability or credential eligibility. The LLM acts strictly as a Socratic interlocutor and structured rubric evidence extractor; deterministic TypeScript engines (Bayesian Knowledge Tracing and the 5-component Composite Evaluator) compute all mastery scores and progression locks.
3. **Cryptographically Verifiable Credentials:** Every issued certificate is signed with an **RFC 8032 Ed25519** private key over a canonical JSON evidence summary (`bktMasteryScore`, `chapterAssessmentScore`, `practicalTaskScore`, `dialogueRigorScore`, `vivaDefenseScore`) and can be independently verified via the public key registry.
