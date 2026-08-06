# Document 21: Database Design
## Project: Nursing Executive Administration System
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 — System Design
**Version:** 2.0 · **Status:** CURRENT — generated from the implemented models

> **Revision note (v2.0):** v1.0 specified Firebase Firestore collections (NoSQL).
> The delivered system uses a **relational database via SQLAlchemy**. Tables and columns
> below are transcribed from `app/models/` and the Alembic migrations in `migrations/versions/`.

---

## 1. Overview (نظرة عامة)

A relational schema managed by **SQLAlchemy 2** with **Alembic** migrations. SQLite is used
for local development and PostgreSQL for production; models avoid backend-specific types so
the same migrations apply to both. Every schema change ships as a reviewable migration file,
and CI fails the build if the models and migrations disagree (see `25_Testing_Strategy.md`).

**Source of truth:** `app/models/*.py`. This document describes those models; if they ever
diverge, the code wins and this document must be regenerated.

## 2. Tables (الجداول)

### 2.1 `departments` — organisational units
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `name` | String(150) | NOT NULL, **unique**, indexed |
| `location` | String(150) | nullable |
| `head_name` | String(150) | nullable — display name of the department head |

### 2.2 `staff` — nursing personnel
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `name` | String(150) | NOT NULL, indexed |
| `employee_id` | String(50) | NOT NULL, **unique**, indexed — HR business key |
| `role` | String(80) | nullable — from the `Roles` vocabulary |
| `email` | String(255) | nullable |
| `phone` | String(40) | nullable |
| `is_active` | Boolean | NOT NULL, default `true` (`server_default` set so the column could be added to existing rows) |
| `hire_date` | Date | nullable |
| `department_id` | Integer | **FK → `departments.id`** `ON DELETE CASCADE`, NOT NULL, indexed |

### 2.3 `performance` — performance metric measurements
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `staff_id` | Integer | **FK → `staff.id`** `ON DELETE CASCADE`, NOT NULL, indexed |
| `metric_name` | String(120) | NOT NULL |
| `value` | Float | NOT NULL — validated 0–100 at the form layer |
| `date` | Date | NOT NULL |

### 2.4 `recognition` — awards granted to staff
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `staff_id` | Integer | **FK → `staff.id`** `ON DELETE CASCADE`, NOT NULL, indexed |
| `award_type` | String(120) | NOT NULL |
| `granted_by` | String(150) | nullable |
| `note` | Text | nullable — citation/reason |
| `timestamp` | DateTime | NOT NULL |

### 2.5 `users` — login accounts
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `email` | String(255) | NOT NULL, **unique**, indexed — the login identifier |
| `password_hash` | String(255) | NOT NULL — scrypt hash; plaintext is never stored |
| `role` | String(80) | NOT NULL — RBAC role |
| `is_active` | Boolean | NOT NULL, default `true` |
| `created_at` | DateTime | NOT NULL |
| `locale` | String(5) | nullable — preferred interface language (`ar` / `en`); NULL means "not chosen yet", so `Accept-Language` decides |
| `staff_id` | Integer | **FK → `staff.id`** `ON DELETE SET NULL`, nullable, indexed |

*A login is optionally linked to one staff profile. The application enforces **at most one
login per staff profile**; a login with no link still works (it simply has no personal
profile page).*

### 2.6 `announcements` — news, announcements, events
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `title` | String(200) | NOT NULL |
| `body` | Text | NOT NULL |
| `category` | String(40) | NOT NULL, indexed — `news` / `announcement` / `event` |
| `is_published` | Boolean | NOT NULL, default `true`, indexed |
| `pinned` | Boolean | NOT NULL, default `false` |
| `created_by` | String(150) | nullable — author display name |
| `created_at` | DateTime | NOT NULL, indexed |

### 2.7 `audit_logs` — append-only audit trail
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK |
| `timestamp` | DateTime | NOT NULL, indexed |
| `user_id` | Integer | nullable, indexed — actor |
| `user_email` | String(255) | nullable — **denormalised** so the log survives user deletion |
| `action` | String(40) | NOT NULL, indexed — `login`, `logout`, `login_failed`, `login_denied`, `create`, `update`, `delete`, `export`, `password_change` |
| `entity_type` | String(40) | nullable, indexed — `staff`, `department`, `recognition`, `performance`, `announcement`, `user`, `auth` |
| `entity_id` | Integer | nullable |
| `detail` | String(500) | nullable — truncated at 500 chars by `log_action` |

*No application code updates or deletes audit rows; the viewer is read-only.*

## 3. Relationships (العلاقات)

| Relationship | Cardinality | Mechanism |
|---|---|---|
| Department → Staff | 1 : N | `staff.department_id`, cascade delete |
| Staff → Performance | 1 : N | `performance.staff_id`, cascade delete |
| Staff → Recognition | 1 : N | `recognition.staff_id`, cascade delete |
| Staff → User | 1 : 0..1 | `users.staff_id`, `SET NULL`; uniqueness enforced in the application |

`Announcement` and `AuditLog` are intentionally standalone — announcements carry an author
*name* rather than a foreign key, and audit rows must outlive the records they reference.

## 4. Indexing Strategy (استراتيجية الفهرسة)

- Every foreign key is indexed (`staff.department_id`, `performance.staff_id`,
  `recognition.staff_id`, `users.staff_id`) to keep joins and per-parent lookups cheap.
- Business keys are unique + indexed: `departments.name`, `staff.employee_id`, `users.email`.
- `staff.name` is indexed to support the name/employee-id search on the staff list.
- Audit filters are indexed: `audit_logs.timestamp` (default ordering), `action`,
  `entity_type`, `user_id`.
- News feed ordering/filtering is indexed: `announcements.created_at`, `category`,
  `is_published`.

## 5. Normalisation (التطبيع)

The schema is in **third normal form**, with two deliberate exceptions, both documented above:
`audit_logs.user_email` (must survive actor deletion) and `announcements.created_by`
(a historical author label, not a live reference).

## 6. Migrations (الترحيل)

Alembic migrations live in `migrations/versions/` and are applied with `flask db upgrade`
(run automatically as the container entrypoint / release phase). `flask db check` verifies
that no model change is missing a migration — this runs in CI on every push.

Applied migrations, in order: foundation schema → users table → staff profile fields →
recognition `note` → announcements table → department `head_name` → audit logs table →
user `locale` preference.

## 7. Localised values vs. stored values (القيم المخزّنة مقابل المعروضة)

The interface is bilingual, but **stored values never vary with the interface language**.
Two patterns are in use:

| Pattern | Columns | How it works |
|---|---|---|
| Key + label | `users.role`, `announcements.category` | A stable ASCII key (`system_admin`, `news`) is stored; the label is translated for display only. |
| Canonical value | `recognition.award_type`, `performance.metric_name` | The **Arabic string itself** is the stored value. It is registered for translation with a gettext no-op (`app/i18n.py::N_`) and translated only when rendered. |

The second pattern is deliberate. If the English interface stored English award types, rows
would fragment by the language of whoever created them and the award-type/metric filters
would stop matching across languages. Regression tests in `tests/test_i18n.py` assert that a
record created while the interface is in English still stores the Arabic canonical value.
