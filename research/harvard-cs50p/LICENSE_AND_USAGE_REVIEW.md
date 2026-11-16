# License and Usage Review: Harvard CS50P vs. CERTIFY Commercial Curriculum

**Reviewed Resource:** CS50's Introduction to Programming with Python (CS50P)  
**Official License URL:** [https://cs50.harvard.edu/python/license/](https://cs50.harvard.edu/python/license/)  
**License Identified:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (**CC BY-NC-SA 4.0**)  
**Review Date:** 2026-11-16  
**Reviewer:** CERTIFY Curriculum Architecture & Knowledge Engineering Team

---

## 1. Summary of CC BY-NC-SA 4.0 License Terms

Under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license documented at [https://cs50.harvard.edu/python/license/](https://cs50.harvard.edu/python/license/):

1. **Attribution (BY):** Must give appropriate credit, provide a link to the license, and indicate if changes were made, without suggesting licensor endorsement.
2. **NonCommercial (NC):** *"You may not use the material for commercial purposes."*
3. **ShareAlike (SA):** Any remix, transformation, or derivative work built upon the material must be distributed under the same CC BY-NC-SA 4.0 license.

---

## 2. Impact on CERTIFY (Commercial Platform)

CERTIFY is a commercial AI-powered learning and certification platform. Therefore, **CC BY-NC-SA 4.0 is incompatible with CERTIFY's commercial product content and production RAG corpus.**

Specifically, note that `CERTIFY_COMPLETE_SUMMARY.md` in the existing repository previously described a planned RAG pipeline ingesting Harvard CS50P lecture notes, transcripts, and code samples. **That planned ingestion must NOT be executed** without a separate commercial licensing agreement from Harvard University.

---

## 3. Permitted Research Use vs. Prohibited Commercial Ingestion

| Category | Permitted for Curriculum Research? | Permitted in CERTIFY Production / RAG? | Rationale |
| :--- | :--- | :--- | :--- |
| **High-level syllabus & topic list** (e.g., Week 0–9 sequence, Python concepts) | **Yes** | **Yes (as independent outline)** | Ideas, facts, and topic sequences are not copyrightable expression. |
| **Pedagogical observations** (e.g., "functions taught early", "side effects vs return values") | **Yes** | **Yes (original prose)** | Pedagogical patterns can inform original instructional design. |
| **Official URLs & metadata** in internal `research/` docs | **Yes** | **Internal reference only** | Cataloguing public URLs for research provenance is permitted. |
| **Lecture transcripts & subtitles** | **Read-only reference** | **NO — Strictly Excluded** | Copyrighted expression under CC BY-NC-SA 4.0. |
| **Lecture slides & official notes** | **Read-only reference** | **NO — Strictly Excluded** | Copyrighted expression under CC BY-NC-SA 4.0. |
| **CS50P source code examples** | **Read-only reference** | **NO — Strictly Excluded** | Copyrighted code under CC BY-NC-SA 4.0. |
| **CS50P problem statements (`psets`)** | **Read-only reference** | **NO — Strictly Excluded** | Copyrighted assignments under CC BY-NC-SA 4.0. |
| **CS50 / Harvard branding, graphics, logos** | **NO** | **NO — Strictly Excluded** | Trademark & copyright; never imply Harvard endorsement. |
| **Close paraphrases of CS50P lessons** | **NO** | **NO — Strictly Excluded** | Derivative work subject to NC and SA terms. |

---

## 4. Clean-Room Authoring Protocol Followed for CERTIFY

To guarantee commercial safety and originality:
1. All CERTIFY lessons, analogies, code examples (`.py`), exercises, common-mistake guides, and assessments are **authored from scratch**.
2. All `research/harvard-cs50p/` files remain **outside** the production RAG ingestion directory (`courses/python-fundamentals/`).
3. No Harvard or CS50 trademarks, logos, or endorsement claims appear anywhere in student-facing content.

---

## 5. Items Flagged for Human / Legal Review

- **Repository Documentation Update:** `CERTIFY_COMPLETE_SUMMARY.md` in the main repository references ingesting CS50P notes and transcripts into `course_embeddings`. Human stakeholders should update that internal architecture doc to point to CERTIFY's independently authored `courses/python-fundamentals/` corpus instead.
- **Commercial License Inquiry (Optional):** If CERTIFY ever wishes to redistribute or embed actual CS50P videos, notes, or problem sets in a commercial tier, legal counsel must obtain explicit written commercial permission from Harvard University / CS50 (`malan@harvard.edu`).
