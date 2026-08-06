# Document 23: Route & Interface Design
## Project: Nursing Executive Administration System
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 — System Design
**Version:** 2.0 · **Status:** CURRENT — transcribed from the application URL map

> **Revision note (v2.0):** v1.0 stated that "we do not build traditional API endpoints"
> because the React client talked to Firestore directly via the Firebase SDK. That is no
> longer true. The delivered system is server-rendered and exposes **HTTP routes**; the
> browser never touches the database. The table below is the complete route map.

---

## 1. Interface Style (نمط الواجهة)

Routes are **HTML-returning, form-driven endpoints**, not a JSON REST API:

- `GET` returns a rendered Jinja2 page.
- `POST` accepts an `application/x-www-form-urlencoded` submission, applies the change, and
  issues a **redirect** (POST/Redirect/GET) so a refresh cannot double-submit.
- Two exceptions return non-HTML: `GET /healthz` returns JSON, and the three
  `*/export.csv` routes return `text/csv`.
- **Every `POST` requires a valid CSRF token** (app-wide `CSRFProtect`); a missing or stale
  token is rejected with **400**.

There is currently **no public/JSON API** for third-party integration. If HR or HIS
integration is required later, it should be added as a separate, token-authenticated
blueprint rather than by opening these session-authenticated routes.

## 2. Access Control Legend (مفتاح الصلاحيات)

| Tag | Roles permitted |
|---|---|
| **Public** | No authentication |
| **Any** | Any authenticated user |
| **Manage** | `system_admin`, `nursing_director`, `department_head` |
| **Director+** | `system_admin`, `nursing_director` |
| **Admin** | `system_admin` only |

Enforcement is server-side via `@login_required` and `@role_required(...)`
(`app/security.py`): unauthenticated → **401** → redirected to the login page;
authenticated but wrong role → **403** (branded RTL page).

## 3. Route Map (خريطة المسارات)

### 3.1 System & Session
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/healthz` | Public | Liveness/readiness probe; pings the DB, returns `{"status":"ok"}` |
| GET, POST | `/login` | Public | Login form. **POST rate-limited to 10/min per IP** |
| POST | `/logout` | Any | Ends the session |
| GET, POST | `/account/password` | Any | Self-service password change (verifies current password, min 8 chars) |
| POST | `/lang/<locale>` | Public | Switch interface language (`ar` / `en`); unknown locale → 404. **POST, not GET**, because it writes the choice to the signed-in user's profile — so CSRF applies and the language cannot be flipped by a link, image, or prefetch. Returns to the originating page via the same open-redirect guard as post-login `next`. Open to anonymous visitors so the login page can be switched. |

### 3.2 Landing
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Any | Executive dashboard (live KPI counts). Roles outside **Manage** are redirected to `/me` rather than receiving a 403 |
| GET | `/me` | Any | Personal landing: linked staff profile, own awards, latest news |

### 3.3 Staff (`/staff`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/staff/` | Manage | List. Query params: `q` (name or employee ID), `department_id`, `role`, `status`, `page` |
| GET, POST | `/staff/new` | Manage | Create (unique `employee_id` enforced) |
| GET, POST | `/staff/<id>/edit` | Manage | Update (uniqueness re-checked, self excluded) |
| POST | `/staff/<id>/delete` | Manage | Delete |
| GET | `/staff/export.csv` | Manage | CSV of the **current filter selection** |

### 3.4 Departments (`/departments`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/departments/` | Manage | List with per-department staff counts (single `GROUP BY`); `q`, `page` |
| GET | `/departments/<id>` | Manage | Detail + staff roster |
| GET, POST | `/departments/new` | Manage | Create (unique name) |
| GET, POST | `/departments/<id>/edit` | Manage | Update |
| POST | `/departments/<id>/delete` | Manage | Delete — **blocked while staff are assigned** |

### 3.5 Recognition (`/recognition`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/recognition/` | Manage | Awards list + top recipients; `award_type`, `department_id`, `page` |
| GET, POST | `/recognition/new` | Manage | Grant an award |
| POST | `/recognition/<id>/delete` | Manage | Delete |
| GET | `/recognition/export.csv` | Manage | CSV of the current filter selection |

### 3.6 Performance (`/performance`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/performance/` | Manage | Metrics list + per-metric averages; `metric`, `department_id`, `page` |
| GET, POST | `/performance/new` | Manage | Record a metric (value validated 0–100) |
| POST | `/performance/<id>/delete` | Manage | Delete |
| GET | `/performance/export.csv` | Manage | CSV of the current filter selection |

### 3.7 News & Announcements (`/news`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/news/` | **Any** | Feed — published items, pinned first; `category`, `page` |
| GET | `/news/<id>` | **Any** | Detail (unpublished visible only to Director+) |
| GET, POST | `/news/new` | **Director+** | Create |
| GET, POST | `/news/<id>/edit` | **Director+** | Update |
| POST | `/news/<id>/delete` | **Director+** | Delete |

*The feed is deliberately the one module every role can read; authoring is narrower than
the other modules (no `department_head`).*

### 3.8 Administration
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/users/` | **Admin** | Login accounts; `q` (email), `role`, `page` |
| GET, POST | `/users/new` | **Admin** | Create account (unique email, min 8-char password, optional staff link) |
| GET, POST | `/users/<id>/edit` | **Admin** | Update role/link/active; blank password keeps the current one |
| POST | `/users/<id>/delete` | **Admin** | Delete — **cannot delete your own account** |
| GET | `/audit/` | **Admin** | Read-only audit trail; `action`, `entity_type`, `page` |

## 4. Conventions (الاتفاقيات)

- **Pagination:** `?page=N`; page size is per-module (10 staff/departments/recognition,
  15 performance, 8 news, 25 audit). Filters are preserved across page links.
- **Filtering:** blank/absent query params mean "no filter". Export routes reuse the exact
  same query builder as their list view, so an export always matches what is on screen.
- **Validation:** WTForms validators server-side; failures re-render the form with inline
  Arabic messages and **HTTP 200** (no redirect), so nothing is lost.
- **Uniqueness conflicts** (duplicate `employee_id`, department name, user email) are
  reported as field errors, not exceptions.
- **Errors:** 403 / 404 / 500 render branded RTL pages; 500 rolls back the session.
- **Audit:** every create / update / delete, plus login, logout, failed login, password
  change, and CSV export, writes an `AuditLog` row in the same transaction.
