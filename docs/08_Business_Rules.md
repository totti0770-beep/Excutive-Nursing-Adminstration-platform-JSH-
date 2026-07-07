# Document 08: Business Rules
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 2 - Requirements Engineering
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
This document outlines the Business Rules (BR) that dictate the operational logic and constraints of the Nursing Administration Portal. These rules must be enforced by the system's logic and architecture, independent of the user interface.

## 2. Document Control Rules (قواعد إدارة الوثائق)
*   **BR-001 (Policy Approval):** Only users with the 'Quality Officer', 'DON', or 'System Admin' roles have the authority to change a document's status from 'Draft' to 'Published'.
*   **BR-002 (Document Expiration):** Clinical policies must have a strict expiration date set no longer than 24 months from the date of publication. Once expired, the document status automatically changes to 'Archived' and is hidden from standard users.
*   **BR-003 (Version Integrity):** When a new version of a policy is published, the system must immediately and irreversibly route all existing links to the new version, ensuring no user can accidentally view an outdated active link.

## 3. Scheduling Rules (قواعد الجدولة)
*   **BR-010 (Schedule Submission Deadline):** Department Heads are required to upload the upcoming month's schedule no later than the 25th day of the current month. The system should highlight late submissions.
*   **BR-011 (Schedule Visibility):** Standard Nurses can only view the schedules associated with their currently assigned department, unless granted cross-departmental access by an Admin.

## 4. Recognition Rules (قواعد التقدير)
*   **BR-020 (Nomination Frequency):** A specific nurse can only win the "Top Nurse of the Month" award once within a rolling 6-month period to ensure fair distribution of recognition.
*   **BR-021 (Approval hierarchy):** Nominations submitted by Department Heads for "Top Nurse" must be approved by the DON or ADON before being published to the main dashboard.

## 5. Account & Security Rules (قواعد الحسابات والأمان)
*   **BR-030 (Account Deactivation):** Any user account that has not logged in for 90 consecutive days must automatically have its status changed to 'Suspended', requiring IT intervention to unlock.
*   **BR-031 (Role Hierarchy):** A user with the 'System Admin' role cannot be deleted or have their role downgraded by another Admin, unless there is a designated 'Super Admin' role.
*   **BR-032 (Concurrent Sessions):** A user account cannot have more than two active concurrent sessions (e.g., one on desktop, one on mobile) to prevent credential sharing.
