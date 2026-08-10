> ⚠️ **SUPERSEDED — historical reference only.**
> This document describes Firestore Security Rules and Firebase hosting; security is now enforced server-side.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `24_Security_Architecture.md`. See `docs/README.md` for the index.

---

# Phase 23 & 24: Security & Deployment Architecture

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## Phase 23: Security Architecture

The system must comply with national healthcare cybersecurity guidelines (e.g., NCA - National Cybersecurity Authority guidelines in Saudi Arabia).

### 23.1 Authentication & Identity
*   **Identity Provider:** Firebase Authentication manages identity.
*   **Session Management:** JWT (JSON Web Tokens) are used. Tokens expire automatically and require refresh.
*   **MFA (Multi-Factor Authentication):** Recommended to be enforced for all users with `Admin` or `Portal Manager` roles.

### 23.2 Authorization (Firestore Security Rules)
*   **Principle of Least Privilege:** By default, all read/write operations are denied.
*   Rules are explicitly written to check the `request.auth.uid` against the requested document's ownership or the user's role document.
*   *Example:* Only users with the `manage_policies` permission flag can write to the `documents` collection.

### 23.3 Data Protection
*   **In Transit:** All traffic is forced over HTTPS (TLS 1.2+). The Cloud Run ingress will reject non-secure HTTP requests.
*   **At Rest:** Firestore encrypts all data at rest by default using Google-managed encryption keys.
*   **Data Sanitization:** The Express backend and React frontend must sanitize all text inputs to prevent XSS (Cross-Site Scripting) or NoSQL injection.

### 23.4 Application Security (OWASP Top 10)
*   **CORS:** Cross-Origin Resource Sharing is strictly configured on the Express server to only allow requests from the authenticated frontend domain.
*   **Rate Limiting:** Implemented on the Express API routes to prevent Brute Force or DDoS attacks.

---

## Phase 24: Deployment Architecture

### 24.1 Containerization Strategy
*   The entire application (Vite compiled static assets + Express Node.js server) is bundled into a single Docker container using `esbuild` for the backend and `vite build` for the frontend.
*   This ensures the application is environment-agnostic and can run on Google Cloud Run, AWS Fargate, or an on-premise Kubernetes cluster.

### 24.2 CI/CD Pipeline
1.  **Source Control:** GitHub/GitLab repository.
2.  **Continuous Integration (CI):** On `git push` to `main`, an automated pipeline runs:
    *   Linting (`npm run lint`)
    *   Unit Tests (if implemented)
    *   Docker Image Build
3.  **Continuous Deployment (CD):** The successful Docker image is pushed to a Container Registry and automatically deployed to Google Cloud Run (or the hospital's designated production environment).

### 24.3 Environment Segregation
*   **DEV:** Local developer environments using Firebase Emulators.
*   **STAGING:** A mirror of production for UAT (User Acceptance Testing) by hospital stakeholders. Uses a separate Firebase Project.
*   **PRODUCTION:** The live environment containing real staff data. Strict access controls applied.
