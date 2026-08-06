> ⚠️ **SUPERSEDED — historical reference only.**
> This document assumes a Firebase deployment; the delivered system deploys via gunicorn/Docker.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: the repository `README.md` (Production deployment) and `25_Testing_Strategy.md`. See `docs/README.md` for the index.

---

# Document 28: Go-Live Plan
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 7 - Training & Launch
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
This document outlines the steps for transitioning the portal from the staging environment to full production use across the hospital.

## 2. Launch Strategy (استراتيجية الإطلاق)

### 2.1 Soft Launch / Pilot (الإطلاق التجريبي)
*   **Target:** A specific, tech-receptive department (e.g., ICU or ER).
*   **Duration:** 2 Weeks.
*   **Objective:** Monitor system performance in a live setting, identify unexpected UX bottlenecks, and allow the Super Users to practice their support roles before hospital-wide rollout.

### 2.2 Hard Launch (الإطلاق الشامل)
*   **Target:** All nursing staff hospital-wide.
*   **Communication:**
    *   An official memo from the DON announcing the portal as the *mandatory* channel for schedules and policies.
    *   Email blasts with links to the login page and video tutorials.
    *   Physical posters placed in all ward breakrooms with QR codes linking to the portal.

## 3. Go-Live Checklist (قائمة التحقق قبل الإطلاق)
*   [ ] UAT sign-off received from DON and Quality Head.
*   [ ] Security and Penetration Testing passed (NCA compliance verified).
*   [ ] Initial User database populated (100% of active staff).
*   [ ] Top 50 Critical Policies uploaded and verified.
*   [ ] Super Users trained and deployed to their wards.
*   [ ] Helpdesk team briefed on the escalation matrix.
*   [ ] Production Firebase environment provisioned and DNS records updated (e.g., `nursing.jsh.med.sa`).

## 4. Post-Launch Command Center (غرفة العمليات)
*   For the first 48 hours post-launch, a virtual "Command Center" will be established.
*   Representatives from IT, the Development Team, and Nursing Quality will remain on standby to immediately address login failures, missing permissions, or server anomalies.
