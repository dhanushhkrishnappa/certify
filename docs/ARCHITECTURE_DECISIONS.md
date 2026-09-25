# Architecture Decision Records (ADRs)

## ADR-001: Modular Monolith over Microservices
* **Status**: Accepted
* **Context**: The product consists of multiple distinct domains (Course Catalog, AI Tutor, Assessment, Mastery, Certification). Microservices introduce operational tax (distributed tracing, network latency, multiple CI/CD pipelines, eventual consistency bugs) that slows early validation.
* **Decision**: Implement a **Modular Monolith** in TypeScript / Node.js with strictly enforced domain boundaries, in-process typed contracts, and clean folder structures (`src/modules/*`).
* **Consequences**: Fast development velocity, single deployable artifact, trivial local testing, and simple zero-downtime deployments. Any module can be extracted into an independent microservice later if traffic warrants.

---

## ADR-002: PostgreSQL 16 with pgvector over Dedicated Vector Database
* **Status**: Accepted
* **Context**: RAG requires vector similarity search for course content chunks. Dedicated vector DBs (Pinecone, Qdrant, Weaviate) introduce an external stateful service, cross-network latency, and dual-write synchronization complexity.
* **Decision**: Use **PostgreSQL 16 with the `pgvector` extension** using HNSW indexes.
* **Consequences**: Course metadata and vector embeddings reside in the same ACID-compliant database. Content updates and re-embeddings occur in a single database transaction. Sub-25ms vector search for catalog sizes up to 1,000,000 chunks.

---

## ADR-003: Server-Sent Events (SSE) over WebSockets for V1 Streaming
* **Status**: Accepted
* **Context**: The AI Tutor requires real-time token streaming to the browser. WebSockets require stateful persistent socket management, complex reconnect logic, and special handling behind proxies and serverless load balancers.
* **Decision**: Adopt standard **HTTP POST for student messages combined with Server-Sent Events (`text/event-stream`)** for tutor token streaming.
* **Consequences**: Works over standard HTTP/2, native browser automatic reconnection via `EventSource`/`fetch`, zero firewall issues, and completely stateless load balancing. WebSockets remain reserved for full-duplex voice streams in V2.

---

## ADR-004: Dual-Model Tiering (Frontier vs. Fast Evaluator)
* **Status**: Accepted
* **Context**: Using frontier models (Claude 3.5 Sonnet / GPT-4o) for both conversational tutoring and repetitive rubric scoring results in excessive latency and high operational cost (~$4/course).
* **Decision**: Decompose AI tasks:
  * **Frontier Model (Claude 3.5 Sonnet)**: Socratic dialogue, analogy generation, and Viva oral defense.
  * **Fast Structured Model (Claude 3.5 Haiku / GPT-4o-mini)**: Atomic rubric evaluation and diagnostic intake with strict JSON schema enforcement.
* **Consequences**: Drops total AI cost per certified student from ~$4.00 down to **~$0.60**, while cutting rubric evaluation latency by 60%.

---

## ADR-005: Strict Separation of AI Authority from Certification Authority
* **Status**: Accepted
* **Context**: LLMs are probabilistic, susceptible to prompt injection, and suffer from stochastic variance. Allowing an LLM to decide *"Student passed"* renders credentials indefensible and untrustworthy.
* **Decision**: The LLM is strictly limited to extracting atomic observations against human-authored rubrics. All progression gating, mastery probability calculations, and certificate issuance decisions are executed by **100% deterministic TypeScript/PostgreSQL code**.
* **Consequences**: Verifiable, explainable, and legally defensible credentialing. Immune to prompt injections attempting to force certification.

---

## ADR-006: Bayesian Knowledge Tracing (BKT) for Mastery Modeling
* **Status**: Accepted
* **Context**: Measuring learning by message count or arbitrary quiz percentages rewards superficial engagement or lucky guesses.
* **Decision**: Implement an adapted **Bayesian Knowledge Tracing (BKT)** state machine that updates the posterior probability of mastery $P(L_t)$ per atomic concept based on evidence validity, guess probability $P(G)$, and slip probability $P(S)$.
* **Consequences**: Clear, statistically grounded thresholding for credential tiers (Foundation $\ge 0.70$, Proficient $\ge 0.85$, Advanced $\ge 0.92$).

---

## ADR-007: Cryptographic Ed25519 Signatures over Blockchain
* **Status**: Accepted
* **Context**: Providing tamper-proof verification without unnecessary complexity or gas fees.
* **Decision**: Sign certificate payloads using **Ed25519 asymmetric key pairs** and host a public verification endpoint.
* **Consequences**: Fast, zero-cost, instant verification for employers or institutions without third-party blockchain dependencies.

---

## ADR-008: Pedagogical Defense (AI Viva) over Spyware Proctoring
* **Status**: Accepted
* **Context**: Traditional online proctoring uses invasive webcams, eye tracking, and keystroke logging that generate false positives and fail to prevent AI-assisted cheating.
* **Decision**: Implement **Anti-Gaming by Pedagogical Design**: parametric question variants, conceptual explanations in own words, and a conversational **AI Viva** that probes design trade-offs.
* **Consequences**: Respects learner privacy, eliminates invasive proctoring software, and guarantees that anyone earning a certificate can defend and explain their solution.

---

## ADR-009: Modality-Independent Core with Deferred Voice
* **Status**: Accepted
* **Context**: Voice interaction is desirable but full-duplex speech-to-speech adds immense latency, cost, and synchronization complexity for a V1 release.
* **Decision**: Design the core orchestration pipeline around normalized conversational intents, and defer real-time voice streaming to V1.1/V2.
* **Consequences**: Protects MVP delivery timeline while ensuring zero architectural rewrites when voice is introduced.
