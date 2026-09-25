# Technical Knowledge Roadmap for the Learner / Engineer

## 1. Baseline Assessment & Skill Inventory

### What You Already Know & Can Leverage Immediately
* **JavaScript / React**: You know how to build SPAs, manage React component state, handle hooks, and call REST APIs.
* **Node.js & Express**: You understand HTTP request lifecycles, middlewares, routing, and asynchronous programming in JS.
* **REST APIs & JWT**: You know how tokens work, how to protect routes, and how to structure JSON APIs.
* **MongoDB & MERN**: You understand data modeling, collections, and CRUD operations.
* **Python**: You know Python fundamentals and syntax, which will make course content authoring, data modeling, and ML evaluation scripts very natural.
* **C & Java**: Gives you a solid grasp of types, memory, algorithms, and object-oriented patterns.
* **Git & GitHub**: You have version control foundations in place.

---

## 2. Categorized Learning Roadmap

```
+----------------------------------------------------------------------------------------------------+
|                                      THE 4-STAGE LEARNING PATHWAY                                   |
+----------------------------------------------------------------------------------------------------+
| 1. ALREADY KNOW / LEVERAGE: React, Node.js, Express, REST APIs, JWT, Git, Python fundamentals     |
| 2. LEARN BEFORE DEVELOPMENT: TypeScript, PostgreSQL & SQL, Prisma, Server-Sent Events (SSE)       |
| 3. LEARN DURING DEVELOPMENT: pgvector & RAG, LLM Streaming APIs, Zod Schemas, BKT Math            |
| 4. LEARN AFTER MVP: Advanced OpenTelemetry, Docker Production Hardening, Langfuse Evals            |
+----------------------------------------------------------------------------------------------------+
```

---

## Stage 1: Learn BEFORE Starting Development (Estimated: 5–7 Days)

### A. TypeScript (Strict Mode)
* **What you need to understand**: Interfaces, Types, Generics, Enums, discriminating unions, and strict null checks.
* **Why it matters**: Writing complex educational engines (BKT, rubrics, multi-role prompts) in untyped JS leads to silent runtime crashes and invalid data in production.
* **Required depth**: Intermediate (no need for extreme type gymnastics; focus on typed request/response contracts and domain models).
* **Where it appears**: Everywhere — frontend, backend, shared schemas.
* **Practical Exercise**: Convert a 3-route Express JS app with a User model into strict TypeScript. Define a union type `type Question = McqQuestion | CodeQuestion | DefenseQuestion;` and handle them using a type-guard `switch` statement.
* **Prerequisites**: JavaScript ES6+.

### B. PostgreSQL & Relational SQL (Transitioning from MongoDB)
* **What you need to understand**: Foreign keys, `ON DELETE CASCADE`, composite unique constraints, ACID transactions, `JOIN` queries, and indexing.
* **Why it matters**: A curriculum is a strict relational graph. Storing nested chapters inside MongoDB documents causes concurrency locks and data duplication.
* **Required depth**: Practical Working Knowledge (writing standard queries and understanding relational constraints).
* **Where it appears**: In the database schema for courses, rubrics, attempts, and certificates.
* **Practical Exercise**: Spin up a local Postgres database using Docker. Create two tables: `courses` and `chapters` with a foreign key. Write an atomic transaction that inserts a course and 3 chapters simultaneously.
* **Prerequisites**: Database fundamentals.

### C. Prisma ORM (or Kysely)
* **What you need to understand**: Defining a `schema.prisma` file, running migrations (`prisma migrate dev`), generating type-safe clients, and executing queries with relations (`include`, `select`).
* **Why it matters**: Prisma translates your TypeScript types directly to PostgreSQL schemas without writing raw boilerplate SQL.
* **Required depth**: Intermediate.
* **Where it appears**: Entire backend data access layer.
* **Practical Exercise**: Model the `User -> Enrollment -> Course` relationship in Prisma and query an enrolled user with all their completed chapters in one typed call.
* **Prerequisites**: TypeScript and PostgreSQL.

### D. Server-Sent Events (SSE) in Node.js & React
* **What you need to understand**: The HTTP `text/event-stream` header, chunked transfer encoding, and consuming streams on the frontend using `fetch` + `ReadableStream` (or `@microsoft/fetch-event-source`).
* **Why it matters**: This is how AI chat tokens stream to the user in real time.
* **Required depth**: High (must understand connection lifecycles, error events, and stream termination).
* **Where it appears**: The AI Tutor chat interface.
* **Practical Exercise**: Build an Express endpoint that sends a message chunk every 100ms for 2 seconds. Connect a React component that appends chunks to a paragraph as they arrive.
* **Prerequisites**: Node.js HTTP and React `useEffect`.

---

## Stage 2: Learn DURING Development (As Features are Built)

### A. LLM SDKs, Structured Outputs & Tool Calling
* **What you need to understand**: OpenAI/Anthropic SDKs, setting `temperature=0`, streaming tokens, and enforcing JSON responses via `Zod` schemas.
* **Why it matters**: The Rubric Evaluator must return exact JSON matches; unstructured text breaks the mastery engine.
* **Required depth**: High.
* **Where it appears**: `AIOrchestrator` and `RubricEvaluator`.
* **Practical Exercise**: Call the OpenAI or Anthropic API passing a student answer and a rubric schema using `zodResponseFormat`. Assert that the returned object validates against your Zod type.

### B. Vector Embeddings & pgvector
* **What you need to understand**: Generating embeddings (`text-embedding-3-small`), storing vectors in Postgres `vector(1536)`, and running cosine similarity queries (`<=>` operator with HNSW index).
* **Why it matters**: Powers the Socratic Tutor's grounded retrieval of chapter teaching material.
* **Required depth**: Practical.
* **Where it appears**: Course knowledge ingestion and retrieval service.
* **Practical Exercise**: Embed 5 sentences about Python functions. Store them in Postgres with `pgvector`. Query the database with *"How do I return multiple items?"* and retrieve the top-2 closest snippets.

### C. Bayesian Knowledge Tracing (BKT) Math in Code
* **What you need to understand**: The 4 BKT parameters ($P(L_0), P(T), P(G), P(S)$) and Bayes' update formula.
* **Why it matters**: Powers the deterministic Mastery Engine.
* **Required depth**: Conceptual + Simple Algorithm Implementation.
* **Where it appears**: `MasteryEngine.ts`.
* **Practical Exercise**: Implement the 15-line `BayesianKnowledgeTracer` class and write unit tests simulating a student getting 3 answers right, 1 wrong, and 2 right to verify the probability curve.

---

## Stage 3: Learn AFTER MVP (Scale & Production Hardening)

* **OpenTelemetry & LLM Tracing (Langfuse)**: Deep visibility into prompt tokens, latency, and cost per student.
* **Docker Multi-Stage Builds & Linux Container Security**: Securing code execution runners with strict cgroups and network isolation.
* **Asymmetric Cryptography (Ed25519)**: Signing and verifying public credentials programmatically.
* **Full-Duplex WebSockets / WebRTC**: Preparing for real-time Voice Tutor in V2.
