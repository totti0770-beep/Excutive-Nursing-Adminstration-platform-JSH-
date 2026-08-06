# Document 20: Solution Architecture
## Project: Nursing Executive Administration System
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 — System Design
**Version:** 2.0 · **Status:** CURRENT — reflects the implemented system

> **Revision note (v2.0):** v1.0 described a React SPA on Firebase/Firestore (BaaS).
> That architecture was **not** built. The delivered system is a server-rendered
> **Flask + SQLAlchemy** application on a relational database. This document has been
> rewritten to describe what actually ships. The React/Firebase prototype is retained
> under `legacy/` for reference only and is not deployed.

---

## 1. Overview (نظرة عامة)

The portal is a **server-rendered web application**. HTML is generated on the server by
Jinja2 templates and delivered to the browser; there is no client-side SPA framework and no
client-side data layer. All business logic, data access, and access control execute on the
server, which is the central reason this architecture was chosen over the original BaaS design
(see §6).

## 2. Architecture Pattern (نمط البنية)

**Classic three-tier MVC**, using the Flask *application factory* pattern:

| Tier | Implementation |
|---|---|
| Presentation | Jinja2 templates (`app/templates/`), Tailwind CSS, bilingual RTL/LTR |
| Application | Flask blueprints — one per functional module (`app/blueprints/`) |
| Data | SQLAlchemy ORM models (`app/models/`) over a relational database |

The factory (`app/__init__.py::create_app`) builds an app from a config class, initialises
extensions, registers blueprints, error handlers, context processors, and CLI commands. This
allows dev / production / testing instances to be created independently — the test suite
builds a fully isolated app against an in-memory database.

## 3. Technology Stack (التقنيات المستخدمة)

### 3.1 Application
- **Language/Framework:** Python 3.11, Flask 3
- **ORM:** SQLAlchemy 2 via Flask-SQLAlchemy; schema migrations via Flask-Migrate (Alembic)
- **Auth:** Flask-Login (server-side sessions); passwords hashed with Werkzeug (**scrypt**)
- **Forms/CSRF:** Flask-WTF (WTForms) with app-wide `CSRFProtect`
- **Security:** Flask-Talisman (security headers/CSP), Flask-Limiter (rate limiting)
- **Localisation:** Flask-Babel — Arabic (RTL, default) and English (LTR)
- **Config:** environment variables via python-dotenv; no secrets in source

### 3.2 Presentation
- **Templating:** Jinja2, with shared macros in `app/templates/partials/_macros.html`
- **CSS:** Tailwind CSS, **compiled at build time** and committed
  (`app/static/css/tailwind.css`) — no runtime CDN
- **Fonts:** Tajawal, **self-hosted** from `app/static/fonts/`
- **Direction:** the layout mirrors automatically. Templates use CSS *logical* properties
  (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`, `text-start`) rather than physical ones, and
  `base.html` sets `lang`/`dir` from the active locale — so there is no per-page or
  per-direction branching.
- **JS:** a single progressive-enhancement file (`app/static/js/app.js`). No inline
  JavaScript or inline styles anywhere, which is what makes the strict CSP viable.

### 3.3 Data
- **Development:** SQLite (zero setup) via `DATABASE_URL`
- **Production:** PostgreSQL (models are written to be Postgres-compatible);
  `pool_pre_ping` is enabled to survive idle connection drops behind a pooler

### 3.4 Runtime
- **WSGI server:** gunicorn (`wsgi:app`, config in `gunicorn.conf.py`)
- **Container:** `Dockerfile` (python:3.11-slim, non-root user); `Procfile` for
  buildpack platforms, with `flask db upgrade` as the release phase
- **Health:** `GET /healthz` (unauthenticated) pings the database for load balancers
- **Logs:** application + gunicorn access/error logs to stdout/stderr

## 4. Component Map (خريطة المكونات)

| Blueprint | Prefix | Responsibility |
|---|---|---|
| `main` | `/` | Executive dashboard (live KPIs), personal landing `/me`, `/healthz` |
| `auth` | `/` | Login, logout, self-service password change |
| `staff` | `/staff` | Nursing staff database — search, filter, CRUD, CSV export |
| `departments` | `/departments` | Departments, staff rosters, CRUD |
| `recognition` | `/recognition` | Awards — assign, filter, top recipients, CSV export |
| `performance` | `/performance` | Performance metrics, per-metric averages, CSV export |
| `news` | `/news` | Announcements/news feed and notification centre |
| `users` | `/users` | Login-account management and staff linking |
| `audit` | `/audit` | Read-only audit-trail viewer |

Cross-cutting modules: `app/security.py` (roles + `role_required`), `app/audit.py`
(`log_action`), `app/exports.py` (CSV), `app/errors.py` (RTL error pages),
`app/extensions.py` (shared extension instances), `app/commands.py` (`flask create-admin`).

## 5. Request Flow (مسار الطلب)

1. Browser issues an HTTP request to gunicorn.
2. Flask-Login resolves the session cookie to a `User` via the `user_loader`, which
   **rejects deactivated accounts** so a disabled user is logged out on their next request.
3. Route decorators enforce access: `@login_required`, then `@role_required(...)`.
4. The view queries via SQLAlchemy, applies business rules, and — for state changes —
   writes an `AuditLog` row in the same transaction.
5. Jinja2 renders HTML in the active locale and direction; Talisman attaches security
   headers to the response.

## 6. Why this replaced the original BaaS design (مبرر التغيير)

The v1.0 architecture put security in client-evaluated database rules with no server tier.
In the delivered prototype that assumption failed in practice: the Firestore rules shipped as
`allow read, write: if true`, and role checks existed only in the UI. Moving to a server tier
makes authorisation **non-bypassable** — a browser cannot reach the database directly, every
query passes through server-side role checks, and every mutation is audited. It also brings
referential integrity (foreign keys), reviewable schema migrations, and a testable
application layer.

## 7. Constraints & Trade-offs (القيود والمفاضلات)

- **No offline/real-time push.** Server-rendered pages mean no live document sync;
  acceptable for an administrative portal, and it removes the client data layer entirely.
- **Stateful sessions.** Horizontal scaling requires sticky sessions or a shared session
  store; single-instance deployment is sufficient for the expected user base.
- **In-memory rate-limit storage.** Fine for one process; a multi-worker or multi-instance
  deployment should point Flask-Limiter at Redis.
- **Intranet-safe by design.** No external CDN, font, or script dependency at runtime, so
  the UI renders fully on an isolated hospital network.

## 8. Related Documents

`21_Database_Design.md` · `22_ER_Diagram.md` · `23_API_Design.md` ·
`24_Security_Architecture.md` · `25_Testing_Strategy.md`
