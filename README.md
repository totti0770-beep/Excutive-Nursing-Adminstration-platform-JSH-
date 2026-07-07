# نظام إدارة التمريض التنفيذي — مستشفى جازان التخصصي
# Nursing Executive Administration System — Jazan Specialty Hospital

An internal administrative & governance web portal for the Nursing Administration,
built as a modular Flask application with a right-to-left (RTL) Arabic UI.

> **Status:** Foundation increment. Project structure, configuration, database
> models, and the RTL dashboard shell are in place. Feature modules
> (authentication, staff database, recognition, notifications) are built
> incrementally in subsequent increments.

## Tech stack

- **Backend:** Python + Flask (app-factory + blueprints, MVC structure)
- **ORM / DB:** SQLAlchemy via Flask-SQLAlchemy; migrations via Flask-Migrate (Alembic)
  - Dev: SQLite (zero setup) · Prod: PostgreSQL (models are Postgres-compatible)
- **UI:** Server-rendered Jinja2 templates + Tailwind CSS, RTL Arabic (Tajawal font)
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

# 5. Run
flask run                         # http://localhost:5000
```

## Roadmap (next increments, each gated on review)

1. Authentication & login (Flask-Login, hashed passwords, sessions)
2. Nursing Staff Database (search & filter)
3. Recognition / Awards module
4. Notification center & news feed
5. Reports, full RBAC enforcement, Tailwind build step, tests + CI
