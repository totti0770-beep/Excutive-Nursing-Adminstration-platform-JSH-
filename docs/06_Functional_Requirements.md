# Document 06: Functional Requirements
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 2 - Requirements Engineering
**Version:** 1.0

---

## 1. Authentication & Authorization (المصادقة والصلاحيات)
*   **FR-001:** The system shall allow users to log in using their email address and password.
*   **FR-002:** The system shall enforce a password complexity policy (minimum 8 characters, numbers, symbols, uppercase).
*   **FR-003:** The system shall lock a user's account after 5 consecutive failed login attempts.
*   **FR-004:** The system shall support Role-Based Access Control (RBAC) with at least the following default roles: System Admin, Director of Nursing (DON), Quality Officer, Education Officer, Department Head, and Standard User (Nurse).
*   **FR-005:** The system shall allow System Admins to create, edit, and deactivate user accounts.
*   **FR-006:** The system shall automatically terminate user sessions after 30 minutes of inactivity.

## 2. Dashboard & Home Page (لوحة القيادة)
*   **FR-010:** The system shall display a personalized dashboard based on the user's role and department.
*   **FR-011:** The dashboard shall display high-level hospital nursing statistics (e.g., total nurses, satisfaction score) for users with executive roles (DON, Admins).
*   **FR-012:** The dashboard shall display a "Quick Links" section for frequently accessed forms and policies.
*   **FR-013:** The dashboard shall feature an "Urgent Alerts" banner for critical hospital-wide announcements.

## 3. Communication & News (التواصل والأخبار)
*   **FR-020:** The system shall provide a Content Management System (CMS) to create, edit, publish, and archive news articles.
*   **FR-021:** The CMS shall include a WYSIWYG editor supporting rich text, images, and embedded links.
*   **FR-022:** The system shall allow publishers to target news posts to specific departments or the entire hospital.
*   **FR-023:** The system shall display published news articles in a chronological feed on the home page.
*   **FR-024:** The system shall allow users to "like" or "acknowledge" reading critical announcements.

## 4. Document Control Center (مركز إدارة الوثائق)
*   **FR-030:** The system shall allow authorized users (Quality Officers) to upload PDF documents representing policies, procedures, and forms.
*   **FR-031:** The system shall enforce a metadata tagging system for uploaded documents (e.g., Title, Category, Department, Effective Date, Expiration Date).
*   **FR-032:** The system shall automatically hide documents from standard users once their "Expiration Date" is reached.
*   **FR-033:** The system shall maintain a version history for all documents, keeping older versions archived and accessible only to Quality Officers/Admins.
*   **FR-034:** The system shall display a "New/Updated Policy" badge on recently published documents for 7 days.

## 5. Governance & Committees (الحوكمة واللجان)
*   **FR-040:** The system shall allow admins to create dedicated pages for specific councils (e.g., Nursing Executive Council, Quality Council).
*   **FR-041:** The system shall display the list of active members and their roles for each committee.
*   **FR-042:** The system shall allow committee secretaries to upload and publish meeting agendas and minutes securely.
*   **FR-043:** The system shall restrict access to committee minutes to authorized members only, unless explicitly marked as public.

## 6. Scheduling (الجدولة)
*   **FR-050:** The system shall allow Department Heads to upload monthly roster files (PDF/Image) for their respective departments.
*   **FR-051:** The system shall allow standard nurses to view their department's current and upcoming monthly schedules.
*   **FR-052:** The system shall retain a historical archive of past schedules for at least 12 months.

## 7. Recognition & Training (التقدير والتدريب)
*   **FR-060:** The system shall display a "Top Nurses" and "Top Head Nurses" leaderboard on the main dashboard.
*   **FR-061:** The system shall allow Department Heads to submit recognition nominations with a justification text.
*   **FR-062:** The system shall provide a calendar view for upcoming training sessions and CME events published by the Education Department.

## 8. Global Search (البحث الشامل)
*   **FR-070:** The system shall provide a global search bar accessible from the top navigation menu on all pages.
*   **FR-071:** The search function shall query document titles, news headlines, and department names simultaneously.
*   **FR-072:** The search results shall clearly indicate the type of match (e.g., Policy, News, User).
