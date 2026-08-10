> ⚠️ **SUPERSEDED — historical reference only.**
> This document duplicates the numbered SRS and specifies the abandoned Firebase stack.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `20_Solution_Architecture.md` and `23_API_Design.md`. See `docs/README.md` for the index.

---

# Phase 3: Software Requirements Specification (SRS)

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## 1. Introduction
This document specifies the software requirements for the Nursing Administration Portal. It serves as the baseline for the subsequent Information Architecture, UI/UX design, and technical implementation phases.

## 2. Overall Description
### 2.1 Product Perspective
The portal is an independent, cloud-hosted (or on-premise containerized) web application. It interfaces with the hospital's internal users via modern web browsers and mobile devices (Responsive Design). It utilizes a backend-as-a-service (Firebase) for authentication, database (Firestore), and storage, managed via a Node.js/Express middle tier for advanced API routing and secure operations.

### 2.2 User Characteristics
*   **System Administrator:** High technical literacy. Needs full access to the CMS, User Management, and System Settings.
*   **Nursing Leadership (DON, Heads):** Moderate to high technical literacy. Needs dashboard analytics, approval workflows, and governance management tools.
*   **Nursing Staff:** Varied technical literacy. Needs fast, intuitive access to schedules, policies, news, and surveys. Mobile-first UX is critical for this group.

## 3. Functional Requirements (High-Level)

### 3.1 Content Management System (CMS)
*   **FR-CMS-01:** The system must allow administrators to create, edit, draft, archive, and publish rich-text pages.
*   **FR-CMS-02:** The system must support categorizing and tagging content (News, Announcements, Events).
*   **FR-CMS-03:** The system must include a Media Library for uploading and managing images, videos, and PDF documents.

### 3.2 Organizational Structure & Governance
*   **FR-GOV-01:** The system must support the creation of a hierarchical department tree.
*   **FR-GOV-02:** The system must allow the assignment of a "Supervisor" or "Head" to each department.
*   **FR-GOV-03:** The system must manage Committees, including fields for Purpose, Responsibilities, Chairperson, and Members list.

### 3.3 Document Library (Policies & Procedures)
*   **FR-DOC-01:** The system must provide a searchable library for Policies, Procedures, Forms, and Guidelines.
*   **FR-DOC-02:** Documents must support metadata: Valid From, Valid To, Version, Owner, and Status (Draft, Active, Archived).

### 3.4 User Management & RBAC
*   **FR-USR-01:** The system must authenticate users via secure login credentials.
*   **FR-USR-02:** The system must support custom Roles and a Permissions Matrix.
*   **FR-USR-03:** The system must allow administrators to invite users, suspend accounts, and reset passwords.

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Scalability
*   **NFR-PERF-01:** The application must load the initial dashboard in under 2.0 seconds on standard hospital networks.
*   **NFR-PERF-02:** The database architecture must efficiently handle up to 5,000 concurrent read operations during peak shift-change hours.

### 4.2 Security & Compliance
*   **NFR-SEC-01:** All data in transit must be encrypted via TLS 1.3 (HTTPS).
*   **NFR-SEC-02:** All data at rest must be encrypted (handled via Firebase Firestore default AES-256 encryption).
*   **NFR-SEC-03:** The system must maintain an immutable Audit Log of all administrative actions (CRUD operations on users, policies, and governance structures).

### 4.3 Usability & Accessibility
*   **NFR-UX-01:** The interface must fully support Arabic Right-to-Left (RTL) as the primary layout, with English Left-to-Right (LTR) support.
*   **NFR-UX-02:** The application must be fully responsive, targeting Desktop (1024px+), Tablet, and Mobile viewport sizes.
*   **NFR-UX-03:** The system must support a User-Toggled Dark/Light mode to reduce eye strain in clinical environments.

## 5. Approval Sign-off
*Pending Review by Stakeholders before proceeding to Phase 4 (Information Architecture).*
