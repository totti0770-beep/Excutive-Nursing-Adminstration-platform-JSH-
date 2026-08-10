> ⚠️ **SUPERSEDED — historical reference only.**
> This document duplicates the numbered business-rules/workflow/wireframe documents.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `08_Business_Rules.md`, `17_Wireframes.md`. See `docs/README.md` for the index.

---

# Phase 13, 14, & 15: Business Rules, Workflow Design, & Wireframe Specs

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## Phase 13: Business Rules

*   **BRule-01 (Policy Expiration):** A Policy document cannot be published without a "Valid To" date. If the current date exceeds the "Valid To" date, the system must flag the document as "Review Required" and notify the Quality Council.
*   **BRule-02 (Recognition Limits):** A Department Head may only nominate a maximum of 3 nurses per month for the "Star Nurse" award to ensure fairness across the hospital.
*   **BRule-03 (Account Deactivation):** If an employee's HR status changes to "Terminated", their portal account must immediately be suspended (preventing login), but their historical data (awards, audit logs) must be retained.
*   **BRule-04 (Content Visibility):** Draft content must NEVER be visible to users without the "Create/Update" permission for that content module.

---

## Phase 14: Workflow Design

### 14.1 Policy Publication Workflow
1.  **Draft Stage:** A member of the Quality Committee drafts a new policy in the CMS. Status: `DRAFT`.
2.  **Review Stage:** The drafter submits the policy for review. Status changes to `PENDING_REVIEW`. A notification is sent to the Portal Manager / DON.
3.  **Approval/Rejection:**
    *   *If Rejected:* Status reverts to `DRAFT` with comments.
    *   *If Approved:* Status changes to `PUBLISHED`. The document becomes searchable and visible to all permitted users.
4.  **Archival:** When a new version is published, the old version status automatically changes to `ARCHIVED`.

### 14.2 Award Nomination Workflow
1.  **Nomination:** Department Head fills out the nomination form.
2.  **Committee Review:** The Recognition Committee reviews all monthly nominations in a dedicated dashboard view.
3.  **Voting/Selection:** Committee selects the winner(s).
4.  **Announcement:** Winner status is updated, automatically triggering a News Post generation template.

---

## Phase 15: Wireframe Specifications

### 15.1 Global Layout Structure
*   **Mobile:** Off-canvas hamburger menu (left/right depending on RTL/LTR), sticky top header with Search and Notifications, single-column scrollable content area.
*   **Desktop:** Persistent Sidebar navigation, top utility bar (Breadcrumbs, Search, User Profile, Theme Toggle), main content stage with a max-width wrapper (e.g., `max-w-7xl`) to maintain readability on ultra-wide monitors.

### 15.2 Dashboard (Home) Wireframe Spec
*   **Section 1 (Hero):** Welcome message + current date + Quick Stats (e.g., active nurses, current occupancy if integrated).
*   **Section 2 (Alerts/Banners):** Carousel or stacked list of high-priority announcements.
*   **Section 3 (Widgets Grid):**
    *   *Widget A:* My Schedule (Mini calendar view).
    *   *Widget B:* Recognition Leaderboard (Top 3).
    *   *Widget C:* Quick Links to frequently accessed forms.

### 15.3 Department Detail Page Wireframe Spec
*   **Header:** Department Name, Supervisor Name, Contact Extension.
*   **Body Tabs:**
    *   *Tab 1 (Overview):* Description, Bed Capacity, Scope of Services.
    *   *Tab 2 (Staff):* Data table of assigned nurses.
    *   *Tab 3 (Schedule):* Departmental monthly roster.
    *   *Tab 4 (Metrics):* Embedded charts showing departmental quality indicators.
