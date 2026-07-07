# Document 24: Security Architecture
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 - System Design
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
Security is paramount in a healthcare administration environment. This document outlines the security controls implemented to protect data integrity, ensure privacy, and comply with Saudi NCA regulations.

## 2. Authentication & Authorization (المصادقة والصلاحيات)
*   **Identity Provider:** Firebase Authentication manages user credentials. Passwords are cryptographically hashed and salted by Google's infrastructure; they are never accessible in plain text.
*   **Session Management:** Sessions are managed via short-lived JWTs. The system enforces an automatic logout after 30 minutes of inactivity.
*   **Role-Based Access Control (RBAC):** Roles are stored in the `users` collection. A user's ability to read or write data is strictly evaluated against this role.

## 3. Database Security (Firestore Rules)
The core security mechanism is **Firebase Security Rules**, which sit between the client and the database. These rules guarantee that even if a malicious user alters the frontend code, unauthorized queries will be rejected by the server.

### 3.1 Example Rules Implementation
*   **Users Collection:** A user can only read their own profile. Only Admins can read all profiles or modify roles.
*   **Documents Collection:**
    *   *Read:* Any authenticated user can read documents where `status == 'published'`.
    *   *Write/Delete:* Only users with `role == 'admin'` or `role == 'quality'` can create, update, or delete document records.
*   **Schedules Collection:**
    *   *Read:* A nurse can only read a schedule if `resource.data.department_id == request.auth.token.department_id`.
    *   *Write:* Only the Head Nurse of that specific department can upload schedules.

## 4. Data Protection (حماية البيانات)
*   **Data in Transit:** All traffic between the client browser and Firebase is encrypted using TLS 1.2 or TLS 1.3 (HTTPS).
*   **Data at Rest:** Data stored in Firebase Firestore and Cloud Storage is encrypted at rest using Google Cloud's default encryption (AES-256).

## 5. File Storage Security (أمان الملفات)
*   PDF policies and schedules uploaded to Firebase Cloud Storage are protected by Storage Security Rules, mirroring the database logic (e.g., standard users can download published PDFs, but cannot delete them).
*   File uploads will be restricted by MIME type on the client and server rules to ensure only safe formats (PDF, JPG, PNG) are accepted, preventing malicious script uploads.

## 6. Audit & Logging (التدقيق والسجلات)
To comply with hospital and NCA guidelines:
*   A dedicated `audit_logs` collection in Firestore will record critical actions.
*   When an Admin or Quality Officer publishes a policy, changes a user's role, or deletes a file, a log entry is created containing: `timestamp`, `actor_uid`, `action_type`, `target_id`, and `ip_address` (if available via Cloud Functions).
*   Audit logs are append-only. Security rules will strictly prevent any user, including admins, from modifying or deleting existing log entries.
