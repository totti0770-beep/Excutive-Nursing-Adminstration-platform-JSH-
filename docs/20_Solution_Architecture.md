# Document 20: Solution Architecture
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 5 - System Design
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
The Nursing Administration Portal is designed as a modern, cloud-native, Single Page Application (SPA). It leverages a serverless backend architecture to ensure high availability, scalability, and ease of maintenance, aligning with the hospital's digital transformation goals.

## 2. Architecture Pattern (نمط البنية)
The system follows a **Client-Server Serverless Architecture**:
*   **Client (Frontend):** A React-based SPA that handles all UI rendering, routing, and user interactions directly in the browser.
*   **Backend (BaaS):** Firebase acts as the Backend-as-a-Service, handling authentication, database operations, and file storage without the need to provision or manage dedicated backend servers.

## 3. Technology Stack (التقنيات المستخدمة)

### 3.1 Frontend (واجهة المستخدم)
*   **Core Framework:** React 18+ (with TypeScript for type safety).
*   **Build Tool:** Vite (for fast, optimized bundling).
*   **Styling:** Tailwind CSS (utility-first styling, ensuring consistency and rapid development).
*   **UI Components:** Radix UI primitives or Headless UI, styled with Tailwind (following the iOS/Apple Health aesthetic).
*   **State Management:** React Context API (for global state like Auth and Theme) and React Query / SWR (for data fetching and caching).
*   **Icons:** Lucide React.
*   **Animation:** Framer Motion (for smooth page transitions and micro-interactions).

### 3.2 Backend Services (خدمات الواجهة الخلفية - Firebase)
*   **Database:** Firebase Firestore (NoSQL document database) for storing user profiles, news articles, document metadata, and logs.
*   **Authentication:** Firebase Auth (Email/Password, with potential future integration for SAML/Active Directory).
*   **Storage:** Firebase Cloud Storage for storing binary files (PDF policies, schedule images, user avatars).
*   **Hosting:** The React application static assets will be served via a secure, CDN-backed hosting environment (e.g., Google Cloud Run, Firebase Hosting).

## 4. System Components & Interactions (مكونات النظام والتفاعلات)
1.  **User Browser/Mobile:** Accesses the portal via URL. Downloads the React application bundle.
2.  **Firebase Auth:** The React app communicates directly with Firebase Auth to authenticate the user and retrieve a secure JSON Web Token (JWT).
3.  **Firestore Database:** The React app queries Firestore directly using the Firebase Client SDK. Data access is strictly controlled via Firestore Security Rules, ensuring users can only read/write data permitted by their role.
4.  **Cloud Storage:** When a Quality Officer uploads a policy, the PDF goes directly to Cloud Storage. The resulting URL and metadata (title, expiry) are then saved as a document in Firestore.

## 5. Security Architecture Integration (تكامل البنية الأمنية)
*   **No Direct Server Access:** Because there is no traditional Node.js/PHP backend server handling data requests, the attack surface is significantly reduced.
*   **Rule-Based Access:** All security logic resides in Firebase Security Rules (evaluated at the database level), meaning even if the frontend client is compromised or bypassed, unauthorized data access is blocked by the database itself.
