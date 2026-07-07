# Phase 4, 5, & 6: Information Architecture, Site Map, & Content Strategy

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## Phase 4: Information Architecture (IA)

### 4.1 Principles
*   **User-Centric:** Organized around the daily needs of nursing staff (Schedules, Policies, News) vs. administrative functions.
*   **Flat Hierarchy:** Minimal clicks to reach essential clinical guidelines and forms to save time during shifts.
*   **Scalability:** Structure designed to easily add new departments or committees without breaking the navigation paradigm.

### 4.2 Core Modules
1.  **Public/Dashboard:** Personalized landing page aggregating schedules, alerts, and quick links.
2.  **Organization & Governance:** Static and dynamic pages detailing the structure, councils, and leadership.
3.  **Knowledge Base:** Policies, Procedures, Guidelines, and Forms (document repository).
4.  **Professional Development:** Training schedules, CME credits tracking, and educational resources.
5.  **Quality & Engagement:** Patient safety metrics, recognition programs, surveys, and events.
6.  **Administration (CMS/Backend):** Secured area for managing all portal content and users.

---

## Phase 5: Site Map

### 5.1 Primary Navigation (Frontend)
*   **Home (Dashboard)**
    *   My Schedule Widget
    *   Announcements/News Feed
    *   Quick Links (Forms, Policies)
*   **About Us**
    *   Vision, Mission & Strategic Objectives
    *   Organizational Structure (Interactive Tree)
*   **Departments & Units**
    *   [Dynamic List of Departments] (e.g., ER, ICU, Maternity)
*   **Governance**
    *   Councils (Executive, Quality, Education, Practice)
    *   Committees
*   **Library**
    *   Policies & Procedures
    *   Forms & Guidelines
*   **Development & Quality**
    *   Training & Education
    *   Quality & Patient Safety Dashboards
*   **Community**
    *   News & Events
    *   Achievements & Awards
    *   Employee Directory / Contact Us

### 5.2 Secondary Navigation (Admin Panel)
*   **Dashboard (Analytics overview)**
*   **Content Management** (Pages, News, Events, Media Library)
*   **Organization Management** (Departments, Committees, Users, Roles)
*   **Document Control** (Policies, Forms, Versioning)
*   **System Settings** (Navigation, SEO, Audit Logs)

---

## Phase 6: Content Strategy

### 6.1 Content Types & Ownership
| Content Type | Owner | Update Frequency | Workflow Required |
| :--- | :--- | :--- | :--- |
| **Policies & Procedures** | Quality/Governance Council | Annually or on revision | Draft -> Review -> Approve -> Publish |
| **News & Announcements** | Administration/DON | Daily/Weekly | Draft -> Publish |
| **Schedules** | Department Heads | Monthly | Upload/Sync -> Publish |
| **Training Events** | Education Council | Monthly | Draft -> Approve -> Publish |
| **Department Info** | Department Heads | Bi-annually | Draft -> Review -> Publish |

### 6.2 Taxonomy & Metadata
All content must be tagged using a standardized taxonomy to power the global search engine:
*   **Categories:** Clinical, Administrative, Educational, Quality, HR.
*   **Tags:** specific keywords (e.g., "Infection Control", "ICU", "Onboarding").
*   **Metadata:** Author, Publish Date, Expiry Date, Target Audience (Role/Department).

### 6.3 Archiving Strategy
*   News and Announcements older than 6 months are automatically archived but remain searchable.
*   Superseded Policies are moved to a secure "Archive" state (read-only for auditors, hidden from general search) with a watermark indicating they are obsolete.
