# Document 14: Search Strategy
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 3 - Information Architecture
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
This document defines how the search engine within the portal will index data, rank results, and assist users in finding critical information quickly.

## 2. Search Scope (نطاق البحث)
The Global Search bar will index the following entities:
*   Document Titles and Metadata (Category, Department Tags).
*   News Article Titles and content excerpts.
*   Department Names.
*   User Profiles (Name, Role) for staff directory purposes.

## 3. Search Mechanics (آلية البحث)
*   **Fuzzy Matching:** The search should tolerate minor typos (e.g., searching for "Infecton" should return "Infection Control").
*   **Auto-suggest:** As the user types (after 3 characters), the system should display a dropdown of immediate likely matches.
*   **Synonyms:** The system should map common acronyms to their full terms (e.g., searching "CPR" also searches "Cardiopulmonary Resuscitation").

## 4. Search Results Ranking (ترتيب النتائج)
Results will be prioritized based on the following weights:
1.  **Exact Title Match:** Highest priority.
2.  **Document Category (Policies):** Policies rank higher than old news articles.
3.  **Recency:** Recently updated or published documents rank higher than older ones.
4.  **Role Relevance:** If possible, results tagged with the user's specific department should be boosted slightly.

## 5. Search Filters & Facets (عوامل التصفية)
On the main search results page, users can filter results by:
*   Type (Policy, Form, News, Department).
*   Category (APP, CPP, CPG).
*   Department (Target audience of the document).
*   Date Range.
