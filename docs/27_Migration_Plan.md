> ⚠️ **SUPERSEDED — historical reference only.**
> This document plans a migration into Firestore; the delivered system uses a relational database with Alembic migrations.
> It is kept for traceability and **must not be used as a build specification**.
> Current documentation: `21_Database_Design.md` §6. See `docs/README.md` for the index.

---

# Document 27: Migration Plan
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 7 - Training & Launch
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
The Migration Plan details the process of moving existing data (users, policies, organizational structures) from legacy systems (paper, Excel, network drives) into the new digital portal before Go-Live.

## 2. Data Cleansing & Preparation (تنظيف وتجهيز البيانات)
Before any data is imported, it must be audited to ensure accuracy.
*   **User Data:** The HR department must provide a clean, updated Excel sheet containing all active nursing staff (Name, Email, Job Title, Department). Old or inactive employees must be filtered out.
*   **Policy Documents:** The Quality Department must audit the existing shared drive, deleting obsolete drafts and ensuring only the latest, signed PDFs are staged for migration.

## 3. Migration Strategy (استراتيجية النقل)

### 3.1 Initial Bulk Seed (البذر الأولي للبيانات)
*   **Responsibility:** Development Team.
*   **Action:** Developers will use a backend script (Firebase Admin SDK) to bulk-import the cleansed Excel sheets.
    *   This will automatically create the `departments` and `users` collections in Firestore.
    *   Initial passwords will be set securely (e.g., a combination of ID number and a random string), requiring a forced reset on first login.

### 3.2 Document Upload Phase (مرحلة رفع الوثائق)
*   **Responsibility:** Nursing Quality Team.
*   **Action:** Rather than an automated script, the Quality Team will manually upload the **Top 50 most critical and frequently used policies** via the portal's UI during the Staging Phase.
    *   *Reasoning:* This serves a dual purpose—it populates the database and acts as hands-on training for the Quality Officers in using the new system.
    *   Remaining documents will be migrated continuously post-launch.

## 4. Verification (التحقق)
After the initial bulk seed and document uploads:
*   A random sampling of 5% of user accounts will be checked against HR records to ensure role and department assignments are correct.
*   All uploaded documents will be opened to ensure the PDFs render correctly and metadata is accurate.
