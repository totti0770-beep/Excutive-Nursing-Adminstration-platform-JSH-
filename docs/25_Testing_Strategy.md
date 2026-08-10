# Document 25: Testing Strategy
## Project: Nursing Executive Administration System
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 6 — Testing & QA
**Version:** 2.0 · **Status:** CURRENT — describes the implemented suite plus what remains planned

> **Revision note (v2.0):** v1.0 planned Vitest/Jest + React Testing Library against Firebase
> and was purely aspirational — no tests existed. The delivered system has an **automated
> pytest suite enforced in CI**. Sections below separate **implemented** from **still
> planned** so this document cannot be mistaken for coverage that does not exist.

---

## 1. Current State (الوضع الحالي)

| Layer | Status | Detail |
|---|---|---|
| Automated functional/integration tests | **Implemented** | 114 pytest tests, ~88% statement coverage of `app/` |
| Lint & format gate | **Implemented** | `ruff check` + `ruff format --check` |
| Migration-drift gate | **Implemented** | `flask db upgrade && flask db check` |
| Continuous integration | **Implemented** | GitHub Actions on every push and pull request |
| UAT with nursing staff | **Planned** | Not yet run |
| Penetration & load testing | **Planned** | Not yet run |
| Accessibility audit | **Planned** | Not yet run |

## 2. Implemented: Automated Test Suite (الاختبارات الآلية)

**Tooling:** pytest + pytest-cov. **Run:** `pytest --cov=app`.

**Isolation:** each test builds its own application via the factory against an **in-memory
SQLite** database (shared-connection `StaticPool` so the schema persists across requests
within a test), seeded with two departments, two staff, an award, and **one user per role**.
No test touches development data.

**Modules** (`tests/`):

| File | Covers |
|---|---|
| `test_auth.py` | Anonymous redirect, wrong/right credentials, logout, password-is-hashed, CSRF enforced (400) |
| `test_staff.py` | CRUD, search, department filter, duplicate `employee_id` rejection, RBAC |
| `test_departments.py` | CRUD, duplicate name, real roster, **delete blocked while staff assigned**, empty delete |
| `test_recognition.py` | Assign, filter by award type, delete, RBAC |
| `test_news.py` | Feed readable by any role, authoring restricted, pinned-first ordering, category filter |
| `test_users.py` | Account CRUD, one-login-per-staff, short-password and duplicate-email rejection, unlink, **no self-delete**, Admin-only |
| `test_performance.py` | Record/delete metrics, 0–100 validation, CSV export content + BOM + filter honouring, RBAC |
| `test_rbac_landing.py` | Nurse redirected to `/me`, linked profile/awards, manager dashboards, unlinked graceful state |
| `test_security.py` | Audit rows on login/failed login/create/delete, audit viewer access, **immediate deactivation**, password change, security headers, login rate limit (429) |
| `test_deploy.py` | `/healthz`, branded 403/404 pages |
| `test_i18n.py` | Locale resolution and precedence, language switching, direction (`dir`) per locale, open-redirect safety on the switch, per-account persistence, every page rendering in both locales, and **stored values staying canonical when records are created in English** |

**Testing bias:** tests assert **server-enforced authorisation**, not UI state — for each
management module a `staff_nurse` must receive 403. This is deliberate, given the prototype's
original failure mode was UI-only role checks.

## 3. Implemented: CI Gates (بوابات التكامل المستمر)

`.github/workflows/ci.yml` runs on Python 3.11 for every push and PR, and **fails the build** on:

1. `ruff check` and `ruff format --check` (lint, imports, formatting)
2. `pytest --cov=app --cov-fail-under=80` — the coverage floor
3. `flask db upgrade && flask db check` — a model change without a matching migration fails CI
4. `make i18n-check` — fails if a translatable string is missing from the catalogs, or if
   any entry is untranslated or still marked `fuzzy` (pybabel's fuzzy matching produces
   confidently wrong guesses, so they are treated as failures rather than defaults)

## 4. Planned: Remaining Test Phases (المراحل المتبقية)

### 4.1 User Acceptance Testing (UAT)
- **Owner:** Nursing supervisors, quality officers, and a sample of staff nurses.
- **Scope:** real workflows — add a staff member, grant recognition, publish an announcement,
  a nurse reading the feed and their own profile on mobile.
- **Prerequisite:** a staging environment with anonymised data (see §5).

### 4.2 Security Testing
- **Owner:** Hospital IT / Cybersecurity.
- **Scope:** authenticated penetration test against staging, focused on authorisation
  boundaries (role escalation across the module matrix), session handling, and CSRF.
- Should explicitly verify the **known gaps** listed in `24_Security_Architecture.md` §9
  (no MFA, no account lockout, in-memory rate-limit store) are accepted or scheduled.

### 4.3 Performance Testing
- **Scope:** load test the expected concurrent-user profile. Note the current deployment is
  a single gunicorn instance with server-side sessions; results should inform whether a
  shared session store and multiple workers are needed.

### 4.4 Accessibility
- **Scope:** keyboard navigation, focus order, colour contrast, and screen-reader labelling
  of the interface in **both** directions (Arabic RTL and English LTR). Not yet audited.

## 5. Test Environment (بيئة الاختبار)

A **staging environment** mirroring production (PostgreSQL + gunicorn, same container image,
`FORCE_HTTPS` enabled) with anonymised or synthetic data. Staging must never hold real staff
records during UAT. Seed data can be generated with `seed.py`.

## 6. Defect Management (إدارة العيوب)

Defects are tracked in the project tracker with these severities:

| Severity | Definition | Gate |
|---|---|---|
| **Critical** | Data exposure, privilege escalation, or inability to log in | Blocks go-live |
| **High** | Core feature broken with no workaround | Blocks go-live |
| **Medium** | Works with a workaround; UI or workflow issue | Fix if schedule permits |
| **Low** | Cosmetic, typo | Defer |

Any defect in an authorisation boundary is **Critical by default**, regardless of how hard it
is to reach, and must land with a regression test in `tests/` before the fix is accepted.
