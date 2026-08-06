# نظام إدارة التمريض التنفيذي — مستشفى جازان التخصصي
# Nursing Executive Administration System — Jazan Specialty Hospital

An internal administrative & governance web portal for the Nursing Administration,
built as a modular Flask application. The interface is **bilingual**: Arabic
right-to-left (the default) and English left-to-right.

## Tech stack

- **Backend:** Python + Flask (app-factory + blueprints, MVC structure)
- **ORM / DB:** SQLAlchemy via Flask-SQLAlchemy; migrations via Flask-Migrate (Alembic)
  - Dev: SQLite (zero setup) · Prod: PostgreSQL (models are Postgres-compatible)
- **UI:** Server-rendered Jinja2 templates + Tailwind CSS (locally built, no CDN),
  with a **self-hosted Tajawal font** — fully self-contained for intranet use
- **Localisation:** Flask-Babel — Arabic (RTL, default) and English (LTR); the layout
  mirrors automatically via CSS logical properties
- **Config:** environment variables via `.env` (python-dotenv); no secrets in code

## Data model

| Model | Fields | Relationships |
|-------|--------|---------------|
| `Department` | id, name (unique), location | 1‑to‑many → Staff |
| `Staff` | id, name, employee_id (unique), role, department_id | belongs to Department; 1‑to‑many → Performance, Recognition |
| `Performance` | id, staff_id, metric_name, value, date | belongs to Staff |
| `Recognition` | id, staff_id, award_type, granted_by, timestamp | belongs to Staff |

## Project structure

```
run.py                    # entrypoint (create_app)
requirements.txt
.env.example / .flaskenv
app/
  __init__.py             # application factory
  config.py               # env-driven config classes
  extensions.py           # db, migrate instances
  security.py             # RBAC roles + role_required placeholder
  models/                 # Department, Staff, Performance, Recognition
  blueprints/main/        # dashboard route
  templates/              # base.html (RTL), partials, main/dashboard.html
  static/css/app.css
seed.py                   # sample data so KPI cards populate
legacy/                   # archived React/Firebase prototype (reference only)
docs/                     # SDLC/business documentation
```

## Setup & run

```bash
# 1. Create a virtualenv and install dependencies
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env              # then set a real SECRET_KEY

# 3. Initialise the database (creates the migrations/ folder the first time)
flask db init
flask db migrate -m "foundation schema"
flask db upgrade

# 4. (optional) Seed sample data
python seed.py

# 5. Create an admin login (hashed password; no hardcoded credentials)
#    Reads --email/--password, or ADMIN_EMAIL/ADMIN_PASSWORD, or prompts.
flask create-admin --email admin@jazanhospital.com
#    Note: reserved domains (e.g. *.local) are rejected.

# 6. Run
flask run                         # http://localhost:5000  (redirects to /login)
```

### Front-end CSS build (Tailwind)

The stylesheet at `app/static/css/tailwind.css` is committed and served directly, so the app
runs without Node. Only rebuild it if you change templates/classes:

```bash
npm install            # one-time (installs Tailwind + self-hosted Tajawal font files)
npm run build:css      # regenerate app/static/css/tailwind.css
# npm run watch:css    # rebuild on change during development
```

The Tajawal font is self-hosted from `app/static/fonts/` (no Google Fonts / external CDN),
so the UI renders fully styled on an isolated hospital intranet.

### Translations (i18n)

The interface ships in **Arabic (default, RTL)** and **English (LTR)**. Arabic is the source
language: the message ids in the code *are* the Arabic strings, so a missing translation
falls back to correct Arabic and the Arabic UI cannot regress. Only English needs a catalog
(`app/translations/en/`).

The compiled catalog (`messages.mo`) is committed alongside the built CSS, so the app runs
without a translation toolchain. Use the Makefile targets when you change a string:

```bash
make i18n-update     # re-extract from source and merge into the catalogs
#                      then fill in the new msgstr entries in
#                      app/translations/en/LC_MESSAGES/messages.po
make i18n-compile    # rebuild the .mo files the app reads
make i18n-check      # CI gate: fails if a catalog is out of date
make i18n-add LANG=fr   # start a new language
```

> Always go through the Makefile. The code aliases `lazy_gettext` to `_l`, which is **not**
> a default pybabel keyword — a bare `pybabel extract` silently drops every form label,
> validation message, and error-page string.

**How the language is chosen**, first match wins: an explicit choice (the header switcher,
stored in the session) → the signed-in user's saved preference (`users.locale`) → the
browser's `Accept-Language` → Arabic. Switching is a CSRF-protected `POST /lang/<locale>`,
not a link, because it writes to the user's profile.

When adding UI, use logical CSS properties (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`,
`text-start`/`text-end`) rather than physical ones (`pl-`, `mr-`, `left-`, `text-right`)
so the layout mirrors correctly in both directions.

## Production deployment

The app is served by **gunicorn** (`wsgi:app`) and ships a `Dockerfile`, `Procfile`,
and `gunicorn.conf.py`. Set at minimum `SECRET_KEY`, `DATABASE_URL`, and `FLASK_ENV=production`
(add `FORCE_HTTPS=1` behind TLS).

**PostgreSQL** (recommended for pilot/production — the models are Postgres-compatible):

```bash
export DATABASE_URL="postgresql+psycopg2://user:pass@host:5432/nursing"
flask db upgrade          # apply migrations
flask create-admin        # create the first System Admin
```

Connections use `pool_pre_ping` to survive idle drops behind a connection pooler.

**Run with gunicorn** (migrations run first):

```bash
flask db upgrade && gunicorn -c gunicorn.conf.py wsgi:app   # serves on :8000
```

**Docker:**

```bash
docker build -t jsh-nursing .
docker run -p 8000:8000 \
  -e SECRET_KEY=... -e DATABASE_URL=postgresql+psycopg2://... \
  -e FORCE_HTTPS=1 jsh-nursing
```

The container entrypoint runs `flask db upgrade` before starting gunicorn (also wired as the
`release` phase in the `Procfile` for buildpack platforms).

- **Health check:** `GET /healthz` (no auth) returns `{"status":"ok"}` and pings the DB — point
  your load balancer / orchestrator at it.
- **Logs** go to stdout/stderr (app + gunicorn access/error) for container log collection.
- **Error pages:** branded RTL 403/404/500.

## Tests, lint & CI

The suite runs against an isolated in-memory SQLite database (no dev data touched):

```bash
pytest --cov=app                    # tests (auth, staff, recognition, news, departments, users, RBAC)
ruff check app tests run.py seed.py # lint (pyflakes, pycodestyle, isort, pyupgrade, bugbear)
ruff format app tests run.py seed.py# auto-format
```

Every push and pull request runs the same gates via GitHub Actions
(`.github/workflows/ci.yml`) on Python 3.11:
- **ruff** lint + format check
- **pytest** with an **80% coverage floor** (`--cov-fail-under=80`)
- **migration-drift check** (`flask db upgrade && flask db check`) so a model change
  without a matching migration fails CI

## Authentication & security

- **Login:** Flask-Login sessions; passwords hashed with Werkzeug (scrypt).
  Unauthenticated requests to protected pages redirect to `/login`.
- **RBAC:** `app/security.py` defines roles and a `role_required` decorator that
  is enforced against the logged-in user. Management sections (dashboard, staff,
  departments, recognition) require a manager role (System Admin / Nursing
  Director / Department Head); staff nurses get a read-only personal landing page.
- **CSRF:** all POST forms are protected app-wide via Flask-WTF `CSRFProtect`.
- **No hardcoded credentials** (unlike the archived prototype); the first admin
  is created via `flask create-admin`. Users can change their own password at
  `/account/password`.
- **Audit trail:** every create/update/delete plus login/logout and failed
  logins are written to an append-only `audit_logs` table (`app/audit.py`),
  browsable by a System Admin at `/audit` (for CBAHI/JCI-style accountability).
- **Account control:** deactivating a user takes effect on their next request
  (enforced in the Flask-Login `user_loader`), not just at next login.
- **Rate limiting:** `/login` is throttled via Flask-Limiter to blunt
  brute-force attempts.
- **Security headers:** Flask-Talisman sets a strict `Content-Security-Policy`
  (`default-src 'self'` — the app ships no inline JS/CSS), `X-Frame-Options`,
  `X-Content-Type-Options`, and HSTS (over HTTPS). Set `FORCE_HTTPS=1` in
  production to force TLS.
- Session cookies are `HttpOnly` + `SameSite=Lax` (and `Secure` in production),
  with an 8-hour sliding idle timeout.

## Delivered modules

1. ~~Authentication & login (Flask-Login, hashed passwords, sessions, CSRF)~~ ✅
2. ~~Nursing Staff Database (search & filter, CRUD)~~ ✅
3. ~~Recognition / Awards module~~ ✅
4. ~~Notification center & news feed~~ ✅
5. ~~Departments management (CRUD, staff rosters)~~ ✅
6. ~~Self-hosted Tailwind + Arabic font (no CDN)~~ ✅
7. ~~Staff-nurse landing page + per-page RBAC~~ ✅
8. ~~Automated tests (pytest) + CI (GitHub Actions)~~ ✅

### Possible next steps

- Performance/metrics module, reports & exports, system settings
- Link every `User` to a `Staff` profile in the admin UI (self-service directory)
- Move to PostgreSQL for the pilot; add a production WSGI server (gunicorn) config
