# Document 17: Wireframes
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 4 - UX/UI
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
This document provides a textual description of the wireframe layouts. Actual visual wireframes (low-fidelity and high-fidelity) will be developed in Figma based on these structural guidelines.

## 2. Layout Principles (مبادئ التخطيط)
*   **Mobile-First:** Core workflows (viewing schedules, searching policies, reading news) must be optimized for mobile screens using a bottom navigation bar.
*   **Desktop-Optimized Admin:** Administrative workflows (uploading documents, managing users) will assume a desktop layout with a sidebar.
*   **RTL First:** All wireframes assume an Arabic Right-To-Left layout.

## 3. Wireframe: Login Screen (Mobile & Desktop)
*   **Background:** Clean, softly blurred hospital imagery or a subtle geometric pattern.
*   **Center Card:** Glassmorphism effect (semi-transparent, blurred background).
*   **Content:**
    *   Hospital Logo (Top).
    *   "Nursing Administration Portal" title.
    *   Email Input Field.
    *   Password Input Field.
    *   "Remember Me" Checkbox.
    *   Primary Login Button (Navy Blue).
    *   "Forgot Password?" Link.

## 4. Wireframe: Main Dashboard (Mobile)
*   **Top Header:** Hospital Logo (Right), User Avatar (Left), Global Search Bar (Center).
*   **Urgent Banner (Conditional):** Red/Yellow banner directly below the header for critical alerts.
*   **Welcome Section:** "Welcome back, [Name]" + Current Date.
*   **Quick Actions Grid (2x2 or 3x3):**
    *   Icon: My Schedule
    *   Icon: Policies
    *   Icon: Forms
    *   Icon: Training
*   **News Feed:** Vertical scrolling list of cards for hospital announcements.
*   **Bottom Navigation Bar:**
    *   Home (Active)
    *   Departments
    *   Search
    *   Notifications

## 5. Wireframe: Document Control Library (Desktop)
*   **Left Sidebar:** Navigation links (Dashboard, Content Manager, Document Library, User Management).
*   **Top Header:** Breadcrumbs (Home > Document Library), Global Search, Profile.
*   **Main Content Area:**
    *   **Top Row:** "Upload New Document" Button (Primary).
    *   **Filters Bar:** Dropdowns for Category, Department, Status (Active/Archived).
    *   **Data Table:**
        *   Columns: Title, Category, Department, Effective Date, Expiry Date, Status, Actions (View, Edit, Archive).
        *   Pagination controls at the bottom.

## 6. Wireframe: Department Page (Desktop & Mobile)
*   **Header Image:** Soft, professional banner image representing the department.
*   **Department Title:** e.g., "Emergency Room (ER)".
*   **Tabs Navigation:**
    *   Overview (Head Nurse info, structure).
    *   Schedule (Embedded PDF viewer or download link).
    *   Staff List (Directory of nurses in the ward).
    *   KPIs (Simple charts showing departmental metrics).
