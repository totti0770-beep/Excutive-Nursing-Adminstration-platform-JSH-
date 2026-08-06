# Documentation Index
## Nursing Executive Administration System — Jazan Specialty Hospital (JSH)

This folder holds the SDLC documentation set. It was originally written **before** the system
was built, against a React + Firebase/Firestore design. The delivered system is a
**Flask + SQLAlchemy** application, so parts of this set no longer describe reality.

**Read this page first** to know which documents are authoritative.

---

## Status legend

| Badge | Meaning |
|---|---|
| ✅ **CURRENT** | Rewritten to match the implemented system. Trust it. |
| 🟢 **VALID** | Business/UX content, unaffected by the technology change. Still applies. |
| ⚠️ **SUPERSEDED** | Describes the abandoned Firebase/React design, or duplicates a numbered doc. Kept for history; **do not build from it**. |

> **The code is the ultimate source of truth.** Where a document and the code disagree, the
> code wins and the document should be corrected.

---

## ✅ Current technical documentation

| Document | Describes |
|---|---|
| `00_PROJECT_AUDIT.md` | Current status: what is delivered, what is **not** built, technical debt, next actions |
| `20_Solution_Architecture.md` | Flask MVC architecture, stack, components, request flow, trade-offs |
| `21_Database_Design.md` | Relational schema — all 7 tables, columns, constraints, indexing, migrations |
| `22_ER_Diagram.md` | Entity-relationship model + Mermaid diagram |
| `23_API_Design.md` | Complete HTTP route map with per-route access control |
| `24_Security_Architecture.md` | Implemented security controls **and known gaps** |
| `25_Testing_Strategy.md` | The pytest suite + CI gates (implemented) vs. UAT/pentest/load (planned) |

Also relevant, outside this folder: the repository **`README.md`** (setup, CSS build,
deployment, security summary).

## 🟢 Still-valid business & UX documentation

Unaffected by the technology change — requirements, users, and content strategy did not
change when the implementation did:

`01_Project_Charter.md` · `02_Business_Analysis.md` · `03_Stakeholder_Analysis.md` ·
`04_Business_Requirements_Document.md` · `06_Functional_Requirements.md` ·
`08_Business_Rules.md` · `09_Use_Cases.md` · `10_Site_Map.md` ·
`11_Navigation_Structure.md` · `12_Content_Strategy.md` · `13_Taxonomy.md` ·
`14_Search_Strategy.md` · `15_User_Personas.md` · `16_User_Journey.md` ·
`17_Wireframes.md` · `18_Design_System.md` · `19_Screen_Specification.md` ·
`26_Training_Plan.md` · `30_Future_Roadmap.md`

*Caveat:* these describe the **full intended scope**, including modules that were not built
(document library, governance minutes, scheduling, reports). Check `00_PROJECT_AUDIT.md` §2
for what actually exists before planning from them.

## ⚠️ Superseded documents

Each carries a banner at the top pointing to its replacement.

**Stale technology assumptions** — written against Firebase/React:
`02_PHASE_3_SRS.md` · `05_Software_Requirements_Specification.md` ·
`07_Non_Functional_Requirements.md` · `27_Migration_Plan.md` · `28_Go_Live_Plan.md` ·
`29_Support_Model.md`

**`PHASE_*` bundles** — these duplicate the numbered documents above and are the older,
combined drafts:
`01_PHASE_1_2_BRD.md` · `02_PHASE_3_SRS.md` · `03_PHASE_4_5_6_IA_SITEMAP_CONTENT.md` ·
`04_PHASE_7_8_9_UX_PERSONAS_USECASES.md` · `05_PHASE_10_11_12_REQ_RBAC.md` ·
`06_PHASE_13_14_15_RULES_FLOW_WIRE.md` · `07_PHASE_16_17_UI_UX_DESIGN.md` ·
`08_PHASE_18_19_DATABASE_ERD.md` · `09_PHASE_20_21_22_TECH_API.md` ·
`10_PHASE_23_24_SEC_DEPLOY.md` · `11_PHASE_25_TO_30_LAUNCH_MAINT.md`

---

## Document → code map

| To understand… | Read | Then look at |
|---|---|---|
| Overall architecture | `20_Solution_Architecture.md` | `app/__init__.py`, `app/blueprints/` |
| Data model | `21_Database_Design.md`, `22_ER_Diagram.md` | `app/models/`, `migrations/versions/` |
| Routes & permissions | `23_API_Design.md` | `app/blueprints/*/routes.py`, `app/security.py` |
| Security controls | `24_Security_Architecture.md` | `app/security.py`, `app/audit.py`, `app/__init__.py` |
| Test coverage | `25_Testing_Strategy.md` | `tests/`, `.github/workflows/ci.yml` |
| Project status | `00_PROJECT_AUDIT.md` | — |

## Maintaining these documents

- Changing the schema? Update `21_Database_Design.md` **and** `22_ER_Diagram.md`
  (CI already fails if a model change has no migration, but it cannot detect stale prose).
- Adding or re-gating a route? Update the route map in `23_API_Design.md`.
- Changing an auth/session/header control? Update `24_Security_Architecture.md`, including
  its **known gaps** section.
- Shipping a module from the "not yet built" list? Move it in `00_PROJECT_AUDIT.md`.
