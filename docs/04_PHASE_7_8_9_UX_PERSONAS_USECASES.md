> ⚠️ **SUPERSEDED — historical reference only.**
> This document duplicates the numbered personas/journey/use-case documents.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `15_User_Personas.md`, `16_User_Journey.md`, `09_Use_Cases.md`. See `docs/README.md` for the index.

---

# Phase 7, 8, & 9: User Personas, Journey Maps, & Use Cases

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## Phase 7: User Personas

### 7.1 Persona 1: Sarah (The Frontline Nurse)
*   **Role:** Registered Nurse (ICU)
*   **Tech Literacy:** High on mobile, moderate on desktop.
*   **Goals:** Check her monthly shift schedule quickly, access the latest infection control policy during a shift, participate in employee satisfaction surveys.
*   **Pain Points:** Currently relies on WhatsApp groups for schedules and physical binders for policies which are often outdated.

### 7.2 Persona 2: Mr. Ali (The Department Head)
*   **Role:** Head Nurse (Emergency Dept)
*   **Tech Literacy:** Moderate.
*   **Goals:** Manage departmental staff lists, nominate nurses for awards, view department-specific quality metrics, upload the monthly roster.
*   **Pain Points:** Paper-based recognition forms get lost; tracking quality metrics requires accessing multiple different hospital systems.

### 7.3 Persona 3: Ms. Fatima (The System Administrator / Quality Officer)
*   **Role:** Quality & Accreditation Consultant / Portal Admin
*   **Tech Literacy:** High.
*   **Goals:** Upload and manage version control for policies (CBAHI compliance), manage portal roles and permissions, publish hospital-wide nursing announcements.
*   **Pain Points:** Ensuring all staff have read the *current* version of a policy; managing fragmented communication channels.

---

## Phase 8: User Journey Maps

### 8.1 Journey: Sarah finding a Clinical Policy
1.  **Trigger:** Sarah needs to verify the central line dressing change procedure.
2.  **Action:** Opens the portal on her mobile phone (Dark mode auto-enabled).
3.  **Interaction:** Taps the universal "Search" icon in the header. Types "Central Line".
4.  **Result:** Global search returns the active Policy document.
5.  **Satisfaction:** High. The document is clearly marked "Active - v2.1" and is formatted for mobile reading or PDF download.

### 8.2 Journey: Admin publishing a News Announcement
1.  **Trigger:** DON wants to announce the "Nurse of the Month".
2.  **Action:** Admin logs into the Admin Panel on desktop.
3.  **Interaction:** Navigates to Content > News > "Create New". Fills in title, WYSIWYG body, attaches an image from the Media Library.
4.  **Workflow:** Sets status to "Published" and targets the "All Staff" audience.
5.  **Result:** Announcement appears on the main dashboard; a notification badge increments for all users.

---

## Phase 9: Use Cases

### 9.1 Core Use Case Diagram Contexts
*   **UC-01: View Dashboard:** User logs in, system fetches personalized schedule, unread notifications, and latest news.
*   **UC-02: Manage Governance:** Admin creates a new "Research Committee", assigns a Chairperson from the User Directory, and uploads the Terms of Reference document.
*   **UC-03: Nominate for Award:** Head Nurse accesses the Recognition module, selects a nurse from their department, writes a justification, and submits to the Executive Council for approval.
*   **UC-04: Audit Document Compliance:** Quality Officer generates a report showing which policies are nearing their "Valid To" expiration date.
*   **UC-05: Update Organizational Structure:** Admin edits the interactive org chart to add a new "Tele-Nursing Unit" under the Outpatient Department.
