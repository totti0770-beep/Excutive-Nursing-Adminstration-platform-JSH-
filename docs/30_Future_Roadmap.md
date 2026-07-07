# Document 30: Future Roadmap
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 8 - Maintenance & Support
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
The portal is designed to evolve. This document outlines potential future enhancements (Phase 2 and beyond) that were deemed out-of-scope for the initial MVP but provide significant long-term value.

## 2. Phase 2 Enhancements (Post-Launch)
*   **Active Directory (SSO) Integration:** Integrate the portal with the hospital's Microsoft Active Directory. This allows staff to log in using their standard hospital computer credentials (Single Sign-On), eliminating the need to remember a separate password for the portal.
*   **E-Signature & Acknowledgment Tracking:** Enhance the Document Control module to require a digital signature (or PIN confirmation) from nurses when a critical new policy is published. The Quality team can then generate compliance reports showing exactly who has or hasn't read the mandatory document.

## 3. Phase 3 Enhancements
*   **Automated Scheduling Integration:** Instead of Head Nurses uploading PDF schedules, integrate the portal via API with the hospital's core HR/Rostering system (if available). The portal would automatically sync and display personalized shifts natively in a calendar UI rather than a static PDF.
*   **Leave Request Workflow:** Allow nurses to submit Annual/Sick Leave requests directly through the portal, routing them to the Head Nurse and DON for digital approval before syncing with HR.

## 4. Phase 4 Enhancements
*   **Incident Reporting (OVR):** Build a module for nurses to quickly log non-clinical operational incidents (e.g., equipment failure, safety hazards) directly from their mobile devices, routing the ticket to the relevant department (Maintenance/Biomedical).
*   **AI Search Assistant:** Integrate a secure, localized AI chat interface (using an API like Gemini) that allows nurses to ask questions in natural language (e.g., "What is the protocol for a needle stick injury?") and receive instant answers citing the specific hospital policy document.
