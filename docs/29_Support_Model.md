> ⚠️ **SUPERSEDED — historical reference only.**
> This document assumes Firebase operational tooling.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `20_Solution_Architecture.md` §3.4 and the repository `README.md`. See `docs/README.md` for the index.

---

# Document 29: Support Model
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 8 - Maintenance & Support
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
A clear support escalation matrix ensures that issues are resolved efficiently without overwhelming the development team or leaving nurses frustrated.

## 2. Escalation Matrix (مصفوفة التصعيد)

### 2.1 Tier 1: Basic Support (الدعم الأساسي)
*   **Responsibility:** Hospital Internal IT Helpdesk.
*   **Scope:** Password resets, account lockouts, basic connectivity issues (e.g., "The website won't load on hospital Wi-Fi"), browser compatibility questions.
*   **Tools:** Access to Firebase Auth console to trigger password reset emails manually if needed.

### 2.2 Tier 2: Application / Workflow Support (دعم التطبيق)
*   **Responsibility:** Portal Manager / Nursing Quality Officers.
*   **Scope:** User permission issues (e.g., "I'm a Head Nurse but only have Standard Nurse access"), missing documents, errors in publishing news, questions on how to upload schedules.
*   **Tools:** Portal Admin Dashboard (User Management, Document Control).

### 2.3 Tier 3: Technical & Vendor Support (الدعم التقني)
*   **Responsibility:** External Software Development Agency / Lead Developers.
*   **Scope:** System crashes, 500 Server Errors, UI bugs, database anomalies, feature requests, security vulnerabilities.
*   **Tools:** Source code access, Firebase Cloud Console, server logs.

## 3. Maintenance Schedule (جدول الصيانة)
*   **Routine Updates:** Non-critical dependencies (e.g., React libraries) will be updated quarterly to ensure system stability.
*   **Security Patches:** Critical vulnerabilities (identified via `npm audit` or Firebase security alerts) will be patched and deployed within 48 hours of notification.
*   **Scheduled Downtime:** Any updates requiring system downtime must be scheduled between 2:00 AM and 4:00 AM AST, with a 48-hour prior notice posted as an Urgent Alert on the portal dashboard.
