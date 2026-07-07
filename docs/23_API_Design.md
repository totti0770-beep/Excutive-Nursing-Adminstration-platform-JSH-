# Document 23: API Design
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 - System Design
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
Because this project utilizes Firebase as a Backend-as-a-Service (BaaS), we do not build traditional RESTful API endpoints (like `GET /api/users`). Instead, the React frontend uses the **Firebase Client SDK** to interact directly with Firestore and Storage via RPC (Remote Procedure Call) over WebSockets. 

However, we must define the **Data Access Patterns** (equivalent to API design) to ensure efficient querying and strict security.

## 2. Authentication Flow (مسار المصادقة)
*   **Method:** `signInWithEmailAndPassword(auth, email, password)`
*   **Payload:** `{ email, password }`
*   **Response:** JWT (JSON Web Token) securely stored in memory/IndexedDB by the SDK.
*   **Context:** The JWT is automatically attached to all subsequent database queries.

## 3. Data Access Patterns (Firestore Queries)

### 3.1 Users & Auth
*   **Get Current User Profile:**
    *   `doc(db, 'users', currentUser.uid)`
    *   *Usage:* Fetches the role and department upon login to set up the UI context.

### 3.2 News & Announcements
*   **Fetch Active News Feed:**
    *   `collection(db, 'news')`
    *   `where('status', '==', 'published')`
    *   `orderBy('published_at', 'desc')`
    *   `limit(10)`
    *   *Usage:* Renders the homepage feed.

*   **Fetch Urgent Alerts:**
    *   `collection(db, 'news')`
    *   `where('status', '==', 'published')`
    *   `where('priority', '==', 'high')`
    *   *Usage:* Renders the red banner at the top of the app.

### 3.3 Document Library (Policies)
*   **Search Active Policies:**
    *   `collection(db, 'documents')`
    *   `where('status', '==', 'published')`
    *   *Note:* Firestore lacks native full-text search. For global search (FR-071), the frontend will either perform client-side filtering on a cached subset of active documents, or integrate with a 3rd party search service (like Algolia) if the document count exceeds thousands.

### 3.4 Schedules
*   **Fetch Department Schedule:**
    *   `collection(db, 'schedules')`
    *   `where('department_id', '==', user.department_id)`
    *   `where('month', '==', currentMonth)`
    *   *Usage:* Displays the roster to the nurse on their schedule tab.

## 4. Cloud Functions (Server-side Logic)
While most logic is handled client-side, Firebase Cloud Functions (Node.js) may be required for operations that cannot be trusted to the client:
*   **`deleteUserAccount` (Callable Function):** Standard clients cannot delete auth accounts. An admin calls this function; the backend verifies the caller is an Admin, then deletes the user from Firebase Auth and updates the Firestore document to `is_active: false`.
*   **`archiveExpiredDocuments` (Scheduled Cron Job):** Runs daily at 00:00. Queries all documents where `expiry_date < now()` and updates their status to `archived`.
