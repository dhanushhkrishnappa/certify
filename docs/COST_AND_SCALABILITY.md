# Cost & Scalability Modeling Specification

## 1. Unit Economics Per Certified Learner

Understanding unit economics is vital before deploying AI products into production.

### Course Baseline Assumption (e.g., Python Fundamentals)
* **Structure**: 8 Chapters, 24 atomic concepts, 1 Practical Capstone, 1 AI Viva.
* **Volume per Learner**:
  * 80 Conversational Tutor Turns (~10 turns per chapter)
  * 32 Chapter Check Rubric Evaluations (4 questions $\times$ 8 chapters)
  * 1 Diagnostic Intake (4 questions)
  * 1 AI Viva Oral Defense (3 multi-turn probes)
  * Total LLM interactions per course completion: **~118 calls**.

### Token Budget & Cost Breakdown (Using Anthropic Claude 3.5 Sonnet + Haiku)

| Interaction Type | Engine / Model | Input Tokens / Call | Output Tokens / Call | Calls | Total Cost / Learner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Interactive Socratic Tutoring** | Claude 3.5 Sonnet (with Prompt Caching) | 1,200 (900 cached) | 250 | 80 | **$0.48** |
| **Rubric Evaluations** | Claude 3.5 Haiku | 800 | 120 | 32 | **$0.05** |
| **Baseline Diagnostic** | Claude 3.5 Haiku | 600 | 100 | 4 | **$0.01** |
| **AI Viva Oral Defense** | Claude 3.5 Sonnet | 1,800 (1,200 cached) | 300 | 3 | **$0.06** |
| **Vector Embeddings (RAG)** | text-embedding-3-small | 250 | 0 | 80 | **$0.001** |
| **Total AI COGS per Certified Learner** | | | | | **~$0.60** |

> **Key Finding**: With prompt caching and dual-model routing (Sonnet for Socratic teaching, Haiku for rubric evaluation), the direct AI cost to guide a learner from registration to a verified certificate is **under $1.00 USD**.

---

## 2. Infrastructure & Operating Costs at Scale

```
+----------------------------------------------------------------------------------------------------+
|                                    COST PROJECTIONS BY TIER                                        |
+----------------------------------------------------------------------------------------------------+
| EXPENSE ITEM               100 USERS (Pilot)  1,000 USERS        10,000 USERS      100,000 USERS   |
+----------------------------------------------------------------------------------------------------+
| AI Model API Costs         $60                $600               $6,000            $60,000         |
| PostgreSQL + pgvector      $25 (Managed)      $75 (4GB RAM)      $300 (16GB RAM)   $1,800 (HA/Rep) |
| Redis (Memory & PubSub)    $15                $45                $150              $600            |
| Compute / Application Nodes $20 (Container)    $60 (2 Nodes)      $350 (Auto-scale) $2,200 (Cluster)|
| Object Storage (Cloudflare) $0 (Free Tier)    $5                 $25               $150            |
| Observability (Langfuse/Log)$0                $49                $250              $1,200          |
+----------------------------------------------------------------------------------------------------+
| TOTAL MONTHLY ESTIMATE     ~$120 / month      ~$834 / month      ~$7,075 / month   ~$65,950 / month|
| AVERAGE COST / ACTIVE USER ~$1.20             ~$0.83             ~$0.71            ~$0.66          |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Cost-Control Engineering Strategies
1. **Prompt Caching**: System prompts and static course context chunks remain unchanged across turns. Utilizing Anthropic/OpenAI prompt caching slashes input token costs by **80% to 90%**.
2. **Model Tiering**: Never use frontier models (Sonnet/GPT-4o) for boolean rubric verification; fast models (Haiku/GPT-4o-mini) achieve equal or superior rubric adherence at **10x lower cost**.
3. **Sliding Memory Window**: Strict context assembly ensures prompts never grow beyond 2,500 tokens regardless of conversation length.
4. **Rate Limits & Abuse Thresholds**: Hard caps of 40 messages/hour per student prevent rogue loop scripts from draining API credits.
