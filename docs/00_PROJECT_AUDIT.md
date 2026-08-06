# Document 00: Project Audit & Status
## Project: Nursing Executive Administration System
**Client:** Jazan Specialty Hospital (JSH)
**Version:** 2.0 · **Status:** CURRENT

> **Revision note (v2.0):** v1.0 audited the React/Firebase prototype and reported
> **25% complete, readiness 3/10**. That assessment is obsolete — it described a codebase
> that has since been replaced. The findings that drove the replacement are preserved in
> §5 for traceability.

---

## 1. Current State (الوضع الحالي)

The system is a working **Flask + SQLAlchemy** application with a server-rendered RTL Arabic
interface. It is feature-complete for the modules listed below, is covered by an automated
test suite enforced in CI, and is packaged for deployment.

### 1.1 Delivered and working (end-to-end, tested)
| Module | Capability |
|---|---|
| Authentication | Login/logout, scrypt-hashed passwords, sessions, self-service password change |
| Dashboard | Live KPI counts from the database (staff, departments, awards, average performance) |
| Staff Database | Search, filter (department/role/status), pagination, full CRUD, CSV export |
| Departments | CRUD, per-department staff counts, real rosters, delete guarded while staff assigned |
| Recognition | Grant/delete awards, filter by type/department, top recipients, CSV export |
| Performance | Record/delete metrics, per-metric averages, CSV export — wires the dashboard KPI |
| News & Notifications | Feed for all roles, category filter, pinned-first, notification bell; authoring restricted |
| User Management | Account CRUD, role assignment, staff linking (one login per profile), no self-delete |
| Audit Trail | Append-only log of all mutations + auth events, with an admin-only viewer |

### 1.2 Non-functional posture
- **Security:** server-enforced RBAC, app-wide CSRF, login rate limiting, immediate
  deactivation, strict CSP + security headers, 8-hour idle session timeout, no credentials
  in source. Detail and **known gaps** in `24_Security_Architecture.md`.
- **Quality:** 67 automated tests at ~85% coverage; CI gates on lint, coverage floor, and
  migration drift.
- **Deployment:** gunicorn + Docker + Procfile, `/healthz`, structured logging, branded RTL
  error pages, documented PostgreSQL path.
- **Intranet-safe:** Tailwind and the Tajawal font are self-hosted; no runtime CDN.

## 2. Not Yet Built (غير منجز)

Stated plainly so nothing here is mistaken for delivered scope:

| Gap | Note |
|---|---|
| **English (LTR) interface** | The brief asked for Arabic RTL **and** English LTR. Only Arabic ships; no i18n layer (e.g. Flask-Babel) yet. |
| **MFA** | Brief asked for "MFA-ready"; no second factor implemented. |
| **AD / SSO integration** | Accounts are local only. |
| **Document/policy library with file upload** | No file storage; the prototype's "upload" never stored files either. |
| **Committee/governance minutes module** | Not built. |
| **Scheduling / rostering** | Not built (the prototype's version generated random shifts). |
| **Reports & settings modules** | Sidebar placeholders only. |
| **Soft delete / archive** | Deletes are hard deletes (guarded, and audited). |
| **Accessibility audit** | Not performed. |
| **UAT, penetration test, load test** | Not performed — see `25_Testing_Strategy.md` §4. |
| **Backup / DR runbook** | Platform-dependent; not documented or rehearsed. |

## 3. Technical Debt (الدين التقني)

1. **Documentation set is oversized and partly historical.** 42 documents plus an index, with
   two overlapping series (numbered `01–30` and `PHASE_*` bundles); 16 are superseded.
   Those now carry a banner, but consolidating them would reduce maintenance.
   See `docs/README.md`.
2. **Rate-limit storage is in-memory** — not shared across workers/instances.
3. **Sessions are server-side and local** — horizontal scaling needs sticky sessions or a
   shared store.
4. **No JSON API** — future HR/HIS integration needs a separate token-authenticated surface,
   not the session-authenticated HTML routes.
5. **`legacy/` retains the full React prototype** — intentional, for reference, but it is
   dead code that should eventually be dropped once nothing is being ported from it.

## 4. Recommended Next Actions (الإجراءات الموصى بها)

1. **Pilot deployment** on PostgreSQL + staging with anonymised data; create the first admin
   via `flask create-admin`.
2. **Run UAT** with nursing supervisors and a sample of staff nurses.
3. **Commission the security review** against the known-gaps list before handling real data.
4. **Decide on English/LTR i18n** — it is stated scope and is the largest functional gap.
5. **Close the MFA and account-lockout gaps** if the security review requires them for
   production sign-off.

## 5. Historical: findings that triggered the rebuild (للتوثيق)

The original prototype audit found the portal was not safe to deploy with real data:

- **Firestore rules shipped as `allow read, write: if true`** — the database was readable and
  writable by anyone with the client config, which is bundled into the browser.
- **A hardcoded administrator credential** was compiled into the client bundle, granting
  System Admin without any server check.
- **RBAC was cosmetic** — role checks hid buttons but did not gate data access.
- **Most screens rendered hardcoded mock data**, silently falling back to it on error, so the
  UI looked complete while displaying fabricated numbers.
- No automated tests, no CI, no audit trail.

Every one of these is addressed in the delivered system: authorisation is server-enforced and
non-bypassable, there are no credentials in source, all screens read live data, and every
mutation is audited.
