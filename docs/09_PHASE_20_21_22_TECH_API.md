> ⚠️ **SUPERSEDED — historical reference only.**
> This document describes the Firebase/React stack and Firestore access patterns, neither of which was built.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `20_Solution_Architecture.md` and `23_API_Design.md`. See `docs/README.md` for the index.

---

# Phase 20, 21, & 22: Architecture, Tech Stack, & API Design

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## Phase 20: System Architecture

The portal employs a **Modern Serverless / Jamstack Hybrid Architecture**.

1.  **Presentation Tier (Client):** A Single Page Application (SPA) built with React. It handles routing, state management, and UI rendering. It communicates directly with Firebase services for basic CRUD and real-time updates.
2.  **Middle Tier (BFF - Backend for Frontend):** A Node.js/Express server. This layer is crucial for:
    *   Serving the static frontend assets securely.
    *   Handling complex administrative tasks that shouldn't be executed on the client (e.g., batch user imports, PDF generation for reports).
    *   Acting as a proxy for any future integrations with external Hospital Information Systems (HIS).
3.  **Data Tier (Cloud/BaaS):** Firebase Firestore (Database), Firebase Storage (Files), and Firebase Auth (Identity).
4.  **Security Layer:** Firebase Security Rules act as a strict gatekeeper at the database level, ensuring that even if the middle tier is bypassed, data remains secure based on the user's authenticated token and RBAC role.

---

## Phase 21: Technology Stack Recommendation

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | High performance, massive ecosystem, fast developer experience. |
| **Styling** | Tailwind CSS 4 | Rapid UI development, utility-first consistency, easy Dark Mode implementation. |
| **Icons & Animations** | Lucide-React, Motion | Lightweight, professional SVG icons; smooth layout transitions. |
| **Language** | TypeScript | Type safety, fewer runtime errors, highly recommended for enterprise scale. |
| **Backend / API** | Node.js + Express | Unified JavaScript stack across frontend and backend. |
| **Database** | Firebase Firestore | Real-time synchronization (critical for schedules/alerts), highly scalable NoSQL. |
| **Authentication** | Firebase Auth | Secure, standard-compliant, supports future SAML/OIDC SSO integrations. |
| **Hosting** | Google Cloud Run (Containerized) | Auto-scaling, secure, isolated environment suitable for healthcare operations. |

---

## Phase 22: API Design (Middle Tier)

While Firebase SDK handles most client-to-database interactions directly, the Express Middle Tier exposes RESTful endpoints for specific administrative and integration tasks.

### 22.1 REST Endpoints (Examples)

*   `GET /api/health`
    *   **Purpose:** Liveness probe for Cloud Run / Kubernetes.
*   `POST /api/admin/users/batch-import`
    *   **Auth:** Requires Admin JWT.
    *   **Payload:** CSV or JSON array of user profiles.
    *   **Purpose:** Provisions multiple Firebase Auth accounts and Firestore user documents simultaneously.
*   `GET /api/reports/quality-metrics`
    *   **Auth:** Requires Manager/Admin JWT.
    *   **Purpose:** Aggregates complex data across multiple Firestore collections to return a compiled JSON payload for the UI chart rendering, reducing client-side processing load.
*   `POST /api/documents/export-pdf`
    *   **Auth:** Valid JWT.
    *   **Purpose:** Generates a PDF version of a dynamic policy page for printing or offline archival.
