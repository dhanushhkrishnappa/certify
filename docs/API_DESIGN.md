# API Design & REST / SSE Endpoint Specification

## 1. API Architecture Principles
* **Versioned Base Path**: All endpoints live under `/api/v1`.
* **Stateless Token Authentication**: Standard `Authorization: Bearer <JWT>` header with short-lived access tokens (15 minutes) and secure `HttpOnly` refresh token cookies (7 days).
* **Streaming Protocol**: Real-time conversational tutor interactions utilize standard HTTP POST paired with Server-Sent Events (`text/event-stream`).
* **Strict Type Safety**: All request bodies and responses are validated at runtime via `Zod` schemas.

---

## 2. Core Endpoint Specifications

### Authentication & User Identity
* `POST /api/v1/auth/register`: Create user account (`email`, `password`, `fullName`).
* `POST /api/v1/auth/login`: Authenticate and receive access token + refresh cookie.
* `POST /api/v1/auth/refresh`: Refresh access token.
* `GET /api/v1/auth/me`: Current user profile and enrolled courses.

### Course Catalog & Discovery
* `GET /api/v1/courses`: Paginated course catalog list (title, summary, module count, tier offerings).
* `GET /api/v1/courses/:slug`: Detailed syllabus, prerequisites, learning objectives, and certification requirements.
* `POST /api/v1/courses/:slug/enroll`: Enroll user in active course version; returns `enrollmentId`.

### Interactive Learning Sessions & SSE Stream
* `GET /api/v1/courses/:slug/session`: Rehydrate or initialize active learning session (returns working memory, current chapter, concept states).
* `POST /api/v1/sessions/:sessionId/messages`:
  * **Content-Type**: `application/json`
  * **Payload**: `{ "content": "Can you explain how yield works?", "clientMessageId": "uuid" }`
  * **Response**: `text/event-stream`
  * **Event Types**:
    * `event: token` $\rightarrow$ `{"chunk": "When you call "}`
    * `event: concept_probe` $\rightarrow$ `{"conceptId": "uuid", "probeQuestion": "..."}`
    * `event: state_update` $\rightarrow$ `{"pMastery": 0.82, "tier": "MEDIUM"}`
    * `event: done` $\rightarrow$ `{"messageId": "uuid", "tokensUsed": 142}`

### Assessment & Evaluation
* `POST /api/v1/assessments/diagnostic/start`: Initiate non-punitive baseline assessment.
* `POST /api/v1/assessments/diagnostic/submit`: Submit diagnostic answers; returns recommended starting tier.
* `GET /api/v1/assessments/chapters/:chapterId`: Retrieve chapter assessment questions (when chapter dialogue is completed).
* `POST /api/v1/assessments/chapters/:chapterId/submit`: Submit open responses for rubric scoring.
* `POST /api/v1/assessments/final/practical/submit`: Submit code implementation for practical capstone task.
* `POST /api/v1/assessments/final/viva/turn`: Interactive conversational defense turn (AI probes design choices).

### Mastery & Progress Tracking
* `GET /api/v1/mastery/courses/:courseId`: Retrieve learner's live Competency Vector, BKT scores, active misconceptions, and tier trajectory.

### Certification & Public Verification
* `POST /api/v1/certificates/issue`: Trigger deterministic certification evaluation; issues credential if requirements are met.
* `GET /api/v1/certificates/:credentialId/verify`: **Public Endpoint** (No auth required, CORS `*`). Returns public credential verification claims and evidence summary.
* `GET /api/v1/certificates/:credentialId/pdf`: Generates/streams authenticated PDF certificate.

### Course Authoring & Administration (Role: `INSTRUCTOR`, `ADMIN`)
* `POST /api/v1/admin/courses`: Create new course draft.
* `PUT /api/v1/admin/courses/:id/curriculum`: Update modules, chapters, concepts, and rubrics.
* `POST /api/v1/admin/courses/:id/publish`: Run rubric validation checks and publish a new immutable course version.
* `GET /api/v1/admin/analytics/cohorts/:courseId`: Drop-off funnels, difficult concepts, and average remediation loops.
