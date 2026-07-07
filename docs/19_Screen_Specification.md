# Document 19: Screen Specification
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 4 - UX/UI
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
This document details the precise functionality, data elements, and interactions for the primary screens of the application.

## 2. Screen: Main Dashboard (Dashboard.tsx)
*   **Path:** `/dashboard`
*   **Access:** All authenticated users.
*   **Components:**
    *   **Header:** Shows User Avatar, Name, Role, Notification Bell, and Global Search.
    *   **Urgent Banner:** Renders only if an active announcement has `priority = 'high'`.
    *   **Metrics Row (Admin/DON only):** 3-4 cards showing total users, active policies, and system compliance percentage.
    *   **Quick Links Grid:** 4 buttons routing to `/schedule`, `/policies`, `/forms`, and `/education`.
    *   **News Feed:** A list component fetching the latest 5 active news items from the CMS collection.
    *   **Recognition Card:** Displays the current "Top Nurse of the Month".

## 3. Screen: Document Library (DocumentLibrary.tsx)
*   **Path:** `/documents`
*   **Access:** All authenticated users (Read-only for standard, Read/Write for Quality/Admin).
*   **Components:**
    *   **Search & Filter Bar:** Input field for text search, dropdowns for Category (APP, CPP, etc.) and Department.
    *   **List View:** A responsive table/list displaying documents.
        *   Data points: Title, ID (e.g., CPP-001), Effective Date, Status Badge.
    *   **Action Menu (Three dots):** Options to View (PDF), Download, and (for Admins) Edit Metadata, Archive, or Replace File.
    *   **Upload Modal (Admin only):** Form containing File input, Title, Category select, Department select, Effective Date picker, and Expiry Date picker.

## 4. Screen: Department Detail (Department.tsx)
*   **Path:** `/departments/:departmentId`
*   **Access:** All authenticated users.
*   **Components:**
    *   **Hero Section:** Department Name, Head Nurse Name, and contact extension.
    *   **Tabs:**
        *   **Schedule Tab:** Displays the current month's PDF roster inline (using a PDF viewer component) with a download button.
        *   **Staff Tab:** A list of users whose `department_id` matches the current department.
        *   **KPIs Tab:** Simple charts (e.g., Recharts) showing data if available.

## 5. Screen: Admin CMS (NewsManager.tsx)
*   **Path:** `/admin/news`
*   **Access:** Admins and Portal Managers only.
*   **Components:**
    *   **List View:** Table of all drafted and published news articles.
    *   **Editor Form:**
        *   Title Input.
        *   Rich Text Editor (WYSIWYG) for content.
        *   Image Uploader for the cover photo.
        *   Priority Checkbox (Mark as Urgent Alert).
        *   Target Audience Select (All Hospital or Specific Department).
        *   Publish / Save as Draft buttons.
