# Document 24: Security Architecture
## Project: Nursing Executive Administration System
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 — System Design
**Version:** 2.0 · **Status:** CURRENT — describes implemented controls

> **Revision note (v2.0):** v1.0 described Firebase Auth plus Firestore Security Rules as the
> enforcement point. Neither is used. Authorisation is now enforced **server-side in the
> application tier**, which also closes the two critical findings from the prototype audit:
> Firestore rules had shipped as `allow read, write: if true`, and a hardcoded admin
> credential was compiled into the client bundle. Both are gone — the browser can no longer
> reach the database at all, and there are no credentials in source.

---

## 1. Threat Model Summary (نموذج التهديدات)

Internal hospital portal holding staff/administrative data (not patient clinical records).
Primary risks: unauthorised access to staff data, privilege escalation, credential
brute-forcing, and unattributed administrative changes. Controls below map to those risks.

## 2. Authentication (المصادقة)

- **Mechanism:** Flask-Login with server-side sessions; the cookie carries only a signed
  session identifier, never role or identity claims the client could tamper with.
- **Password storage:** Werkzeug **scrypt** hashes (salted). Plaintext is never stored,
  logged, or recoverable. Verified by test: the stored hash never equals the password.
- **No hardcoded credentials.** The first administrator is created out-of-band via
  `flask create-admin`, which reads the password from an option, environment variable, or
  interactive prompt, applies the password policy below, and rejects unusable email domains.
- **Password policy** (`app/security.py::validate_password_strength`) — a single
  implementation shared by the self-service change form, admin user management, and the
  CLI, so the rule cannot drift between them: minimum 8 characters, at least three of
  {lowercase, uppercase, digit, symbol}, and must not contain the account's email
  local-part. *Not* implemented: rotation and reuse history (see §9).
- **Self-service password change** (`/account/password`) requires the current password and
  a confirmed new password meeting that policy.
- **Brute-force resistance, two independent layers:**
  - *Per IP* — `POST /login` is rate-limited to **10 requests per minute** (Flask-Limiter);
    exceeding it returns **429**. Storage is configurable via `RATELIMIT_STORAGE_URI`; a
    multi-worker deployment must point it at a shared backend (e.g. Redis) or the limit is
    per worker.
  - *Per account* — after `LOGIN_MAX_FAILED_ATTEMPTS` (default 10) consecutive failures the
    account is locked for `LOGIN_LOCKOUT_MINUTES` (default 15). This is what stops an
    attacker distributed across many IPs from getting unlimited attempts on one account.
    A successful sign-in resets the counter.
- **Lockout trade-off, stated rather than hidden:** per-account lockout is itself a
  denial-of-service vector — anyone who knows a colleague's address can lock them out by
  guessing. It is mitigated by a modest threshold, a short window, and **automatic expiry**,
  so no one waits on an administrator. `POST /users/<id>/unlock` (System Admin) exists as an
  escape hatch, not the normal path, and is audited.
- **User enumeration:** a wrong password, an unknown email, **and a locked account** all
  return the *same* generic Arabic error. Saying "this account is locked" would confirm the
  address exists, which is precisely what the generic message prevents.

## 3. Authorisation (الصلاحيات)

Roles (`app/security.py`): `system_admin`, `nursing_director`, `department_head`,
`staff_nurse`.

- Enforcement is the `@role_required(...)` decorator evaluated **on the server for every
  request** — unauthenticated → 401 (redirect to login), wrong role → 403.
- Role is read from the database record of the logged-in user, never from the request.
- Navigation is also role-aware, but that is **cosmetic only**; hiding a link is never the
  control. Tests assert that a `staff_nurse` receives 403 on every management route.
- Tiering: management modules require Manage roles; news authoring is narrower
  (Director+); user management and the audit viewer are **System Admin only**.
- **Least privilege for non-managers:** a staff nurse is redirected to a read-only personal
  page rather than being handed a 403 at the application entry point.

## 4. Session Security (أمان الجلسة)

| Control | Setting |
|---|---|
| Cookie flags | `HttpOnly`, `SameSite=Lax`, `Secure` (production) |
| Idle timeout | 8-hour sliding session (`PERMANENT_SESSION_LIFETIME`) |
| Immediate revocation | The Flask-Login `user_loader` rejects `is_active = false`, so deactivating an account logs it out on the **next request** — not at next login |

## 5. Request Integrity (سلامة الطلبات)

- **CSRF:** app-wide `CSRFProtect`; every state-changing POST requires a valid token.
  A token-less POST is rejected with **400** (covered by test).
- **All mutations are POST.** No state changes via GET, so they cannot be triggered by a
  link, image, or prefetch.
- **Open-redirect protection:** the post-login `next` parameter is accepted only if it is a
  same-host relative path (`app/security.py::is_safe_redirect_target`). The language switch
  returns the visitor to their previous page through the same guard.
- **The language switch is a POST**, not a link. It writes the choice to the signed-in
  user's profile, so it is treated as a state change: CSRF applies, and the language cannot
  be flipped by a third-party link, image, or prefetch.

## 6. Security Headers & Content Policy (ترويسات الأمان)

Applied by Flask-Talisman on every response:

- **`Content-Security-Policy: default-src 'self'`** — a strict policy, made possible because
  the application ships **no inline JavaScript and no inline styles**. Interactive behaviour
  lives in `app/static/js/app.js` and is driven by `data-` attributes.
- `X-Frame-Options: SAMEORIGIN` (clickjacking), `X-Content-Type-Options: nosniff`.
- **HSTS** and HTTPS redirect when `FORCE_HTTPS=1` is set in production.

*Side benefit:* because no external CDN, font, or script is loaded at runtime, the portal
renders fully on an isolated hospital intranet and leaks no request metadata to third parties.

## 7. Data Protection (حماية البيانات)

- **In transit:** TLS terminated at the reverse proxy / platform; `FORCE_HTTPS` plus HSTS
  and `Secure` cookies prevent downgrade.
- **At rest:** provided by the database platform (PostgreSQL volume encryption in
  production); the application stores no plaintext credentials.
- **Injection:** all queries go through SQLAlchemy with bound parameters; no string-built
  SQL. Jinja2 auto-escaping is on and no user content is rendered with `|safe`.
- **Secrets:** supplied via environment variables (`SECRET_KEY`, `DATABASE_URL`); the
  production config **refuses to start** if `SECRET_KEY` is left at its placeholder value.

## 8. Audit & Accountability (التدقيق والمساءلة)

Supports CBAHI/JCI-style accountability requirements.

- Every **create, update, delete**, plus **login, logout, failed login, denied (inactive)
  login, password change, and CSV export**, writes an `audit_logs` row inside the same
  transaction as the change — so an action and its audit record commit or roll back together.
- Captured: timestamp, actor id, actor email (denormalised to survive user deletion),
  action, entity type, entity id, and a detail string.
- **Append-only in practice:** no application code updates or deletes audit rows, and the
  `/audit` viewer is read-only and restricted to System Admin.

## 9. Known Gaps / Roadmap (الثغرات المعروفة)

Stated explicitly so they are not mistaken for implemented controls:

1. **MFA is not implemented** (the brief called for "MFA-ready"; the schema and auth flow
   can accommodate it, but no second factor exists today).
2. **No AD/SSO integration** — accounts are local.
3. **No password rotation or reuse history.** Complexity is enforced (§2), but expiry and
   "cannot reuse your last N passwords" would need a password-history table and are not
   built.
4. **Rate-limit storage defaults to in-process.** The URI is now configurable, but a
   multi-worker production deployment must actually set `RATELIMIT_STORAGE_URI` to a shared
   backend — the default does not become global on its own.
5. **Backup/disaster recovery is a platform responsibility** and is not yet documented as a
   tested runbook.
