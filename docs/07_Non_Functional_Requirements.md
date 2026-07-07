# Document 07: Non-Functional Requirements
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 2 - Requirements Engineering
**Version:** 1.0

---

## 1. Performance (الأداء)
*   **NFR-001 (Load Time):** The system's web pages and dashboard must load within 2 seconds under normal network conditions on the hospital's intranet.
*   **NFR-002 (Search Speed):** Global search queries must return results within 1.5 seconds.
*   **NFR-003 (Document Retrieval):** PDF documents under 5MB must begin rendering within 3 seconds of the user clicking the view link.

## 2. Security (الأمان)
*   **NFR-010 (Data Encryption):** All data in transit must be encrypted using TLS 1.2 or higher (HTTPS).
*   **NFR-011 (Authentication):** Passwords must be hashed using a strong, industry-standard algorithm (e.g., bcrypt) and never stored in plain text.
*   **NFR-012 (Compliance):** The system architecture and data storage practices must comply with the Saudi National Cybersecurity Authority (NCA) guidelines and MOH privacy regulations.
*   **NFR-013 (Audit Logging):** The system must log all critical administrative actions (e.g., policy uploads, user deletions, role changes) with a timestamp, user ID, and action description.

## 3. Scalability (قابلية التوسع)
*   **NFR-020 (User Base):** The system architecture must support scaling from an initial 1,000 users up to 5,000 concurrent users without significant performance degradation.
*   **NFR-021 (Storage):** The cloud storage solution (Firebase Storage) must easily accommodate increasing volumes of PDF policies and media without requiring manual server upgrades.

## 4. Availability (التوافرية)
*   **NFR-030 (Uptime):** The system must guarantee a 99.9% uptime (approximately 8.7 hours of allowed downtime per year), excluding scheduled maintenance windows.
*   **NFR-031 (Maintenance):** Scheduled maintenance must occur during low-traffic hours (e.g., 2:00 AM - 4:00 AM) and users must be notified at least 48 hours in advance.

## 5. Accessibility (إمكانية الوصول)
*   **NFR-040 (Contrast & Readability):** The UI must meet WCAG 2.1 Level AA standards for color contrast, ensuring readability for staff with visual impairments.
*   **NFR-041 (Theme Support):** The system must support both Light and Dark themes to reduce eye strain, especially for nurses working night shifts.
*   **NFR-042 (Responsive Design):** The application must provide a seamless, native-app-like experience on mobile devices (smartphones and tablets), adjusting touch targets to a minimum of 44x44 CSS pixels.

## 6. Backup & Recovery (النسخ الاحتياطي والاسترداد)
*   **NFR-050 (Data Backup):** The database and document storage must be backed up daily to a secure, geographically redundant location.
*   **NFR-051 (RTO/RPO):** The system must target a Recovery Time Objective (RTO) of 4 hours and a Recovery Point Objective (RPO) of 24 hours in the event of a catastrophic failure.

## 7. Localization (التعريب)
*   **NFR-060 (RTL Support):** The primary user interface must be fully optimized for Right-To-Left (RTL) reading direction, providing a flawless Arabic language experience.
*   **NFR-061 (Fonts):** The system must utilize modern, highly legible Arabic typography (e.g., Tajawal, IBM Plex Sans Arabic) that aligns with a premium healthcare aesthetic.

## 8. Compatibility (التوافقية)
*   **NFR-070 (Browsers):** The web application must be fully functional on the latest two major versions of Google Chrome, Safari, Microsoft Edge, and Mozilla Firefox.
*   **NFR-071 (Mobile OS):** The UI must render correctly on both iOS (Safari) and Android (Chrome) devices.
*   **NFR-072 (Resolution):** The system must gracefully degrade and remain functional on screen widths as narrow as 320px (mobile) and scale up effectively to 1920px (large desktop monitors).
