# CLAUDE.md

Internal administration portal for the Nursing Administration at Jazan Specialty Hospital.
**Flask + SQLAlchemy**, server-rendered Jinja2, bilingual **Arabic (RTL, default) / English (LTR)**.

`legacy/` holds a retired React/Firebase prototype. **Never edit it** — it is not deployed,
is excluded from ruff, and exists only for reference.

## Commands

```bash
source venv/bin/activate

pytest                          # full suite
pytest --cov=app                # CI floor is 80%
ruff check app tests run.py seed.py scripts
ruff format app tests run.py seed.py scripts

make i18n-update                # after ANY user-facing string change
make i18n-compile               # rebuild the .mo the app reads
make i18n-check                 # CI gate: no missing / untranslated / fuzzy entries

npm run build:css               # after adding Tailwind classes (output is committed)

flask db migrate -m "..." && flask db upgrade
flask db check                  # CI fails on model/migration drift
flask create-admin --email admin@jazanhospital.com
```

The dev SQLite file lives in **`instance/`**, not the repo root — `rm nursing.sqlite3` at the
root silently does nothing.

## Architecture

App-factory in `app/__init__.py`. Nine blueprints under `app/blueprints/`: `main`, `auth`,
`staff`, `departments`, `recognition`, `performance`, `news`, `users`, `audit`. Models in
`app/models/`. Cross-cutting: `security.py` (roles, `role_required`,
`is_safe_redirect_target`), `audit.py` (`log_action`), `exports.py`, `errors.py`, `i18n.py`.

## Conventions that are easy to get wrong

**Localisation**

- **Arabic is the source language.** The message ids *are* the Arabic strings, so a missing
  translation falls back to correct Arabic. Only `app/translations/en/` exists.
- Use `_l()` (lazy) in forms and config — evaluated at import time — and `_()` in routes,
  evaluated per request.
- **Always go through `make i18n-*`.** `lazy_gettext` is aliased to `_l`, which is *not* a
  default pybabel keyword: a bare `pybabel extract` silently drops every form label,
  validator message, and error-page string.
- **Never accept pybabel's fuzzy matches.** Its matcher produced 57 confidently wrong guesses
  here — `حذف` (Delete) came out as "Save". CI treats `fuzzy` as a failure; translate by hand.
- **Stored values must not follow the interface language.** `recognition.award_type` and
  `performance.metric_name` store canonical Arabic *verbatim*. Wrap those constants in `N_`
  (`app/i18n.py`) and translate only on display. Translating them in place makes the English
  UI store English, fragmenting rows by the author's language and breaking the filters.
  See `docs/21_Database_Design.md` §7; regression tests in `tests/test_i18n.py`.
- **CSV export headers stay untranslated** — an export is data interchange, and a header that
  changed with the exporter's UI language would break downstream consumers.

**Templates & CSS**

- Use **logical** properties (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`, `text-start`), never
  physical (`pl-`, `mr-`, `left-`, `text-right`), or the LTR layout mirrors wrong.
- **Strict CSP (`default-src 'self'`) — no inline JS or CSS anywhere.** Interactive behaviour
  lives in `app/static/js/app.js`, driven by `data-` attributes.
- `tailwind.css` is committed and purged: rebuild it after adding classes or they won't style.
- A `{% block %}` declared inside an `{% include %}`d partial **can never be overridden** by
  the page. That is why `page_title` is declared in `base.html` and passed into the header.

**Security & data**

- **Every mutation is a CSRF-protected POST.** No state change via GET — including the
  language switch, which writes to the user's profile.
- **RBAC is server-side.** Hiding a nav link is cosmetic. Gate with `@role_required` and
  assert in tests that a `staff_nurse` receives 403.
- **Every mutation calls `log_action`** in the same transaction as the change itself.
- **Don't bind `_` as a throwaway** (`query, _ = ...`) in a module that imports gettext as
  `_` — it shadows the import.

## Testing gotcha

The shared `app` fixture in `tests/conftest.py` holds **one application context for the whole
test**. Flask-Babel caches the resolved locale on that context and Flask-Login caches the user
in `g`, so within a single test a language switch appears not to work and a second login
returns the *first* user.

`tests/test_i18n.py` defines its own fixture that pushes a context only for setup and
teardown — use that pattern for anything locale- or identity-sensitive, and `POST /logout`
between logins.

## Documentation

`docs/README.md` is the index and marks each document CURRENT / VALID / SUPERSEDED. Keep it in
sync: schema change → `21_Database_Design.md` + `22_ER_Diagram.md`; route change →
`23_API_Design.md`; auth or header change → `24_Security_Architecture.md`.
