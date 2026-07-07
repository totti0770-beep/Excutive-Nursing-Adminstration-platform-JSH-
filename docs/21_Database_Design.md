# Document 21: Database Design
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 - System Design
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
The portal utilizes Firebase Firestore, a NoSQL, document-oriented database. Data is stored in Collections, which contain Documents. This design prioritizes read performance and flexibility, which is ideal for a content-heavy portal.

## 2. Collections and Document Structures (المجموعات وهيكلة البيانات)

### 2.1 Collection: `users`
Stores user profile information and RBAC roles.
*   **Document ID:** `uid` (matches Firebase Auth UID)
*   **Fields:**
    *   `name` (String)
    *   `email` (String)
    *   `role_id` (String) - e.g., 'admin', 'don', 'quality', 'head_nurse', 'nurse'
    *   `department_id` (String) - Reference to the department they belong to.
    *   `is_active` (Boolean) - For soft-deleting/suspending accounts.
    *   `created_at` (Timestamp)
    *   `last_login` (Timestamp)

### 2.2 Collection: `departments`
Stores the organizational structure.
*   **Document ID:** Auto-generated
*   **Fields:**
    *   `name_en` (String) - e.g., "Emergency Room"
    *   `name_ar` (String) - e.g., "قسم الطوارئ"
    *   `head_nurse_uid` (String) - Reference to a user document.
    *   `type` (String) - e.g., 'clinical', 'administrative'

### 2.3 Collection: `documents`
Stores metadata for policies, procedures, and forms.
*   **Document ID:** Auto-generated (or specific format like 'CPP-001')
*   **Fields:**
    *   `title` (String)
    *   `category` (String) - e.g., 'CPP', 'APP', 'Form'
    *   `department_tags` (Array of Strings)
    *   `file_url` (String) - URL pointing to Firebase Storage.
    *   `effective_date` (Timestamp)
    *   `expiry_date` (Timestamp)
    *   `status` (String) - 'draft', 'published', 'archived'
    *   `uploaded_by` (String) - User UID
    *   `version` (Number)

### 2.4 Collection: `news`
Stores hospital announcements and news.
*   **Document ID:** Auto-generated
*   **Fields:**
    *   `title` (String)
    *   `content` (String) - HTML or Markdown string.
    *   `cover_image_url` (String)
    *   `priority` (String) - 'normal', 'high' (triggers urgent banner)
    *   `target_departments` (Array of Strings) - Empty means hospital-wide.
    *   `author_uid` (String)
    *   `published_at` (Timestamp)
    *   `status` (String) - 'draft', 'published'

### 2.5 Collection: `schedules`
Stores metadata for uploaded monthly rosters.
*   **Document ID:** Auto-generated
*   **Fields:**
    *   `department_id` (String)
    *   `month` (String) - e.g., '2026-08'
    *   `file_url` (String)
    *   `uploaded_by` (String)
    *   `uploaded_at` (Timestamp)

## 3. Data Relationships (العلاقات بين البيانات)
In a NoSQL database, relationships are handled via references (storing the ID of a document from another collection).
*   A `user` belongs to one `department` (`department_id`).
*   A `department` is managed by one `user` (`head_nurse_uid`).
*   A `document` can apply to many `departments` (`department_tags` array).
*   A `news` item is authored by one `user` (`author_uid`).
