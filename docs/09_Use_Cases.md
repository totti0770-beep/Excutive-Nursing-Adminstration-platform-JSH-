# Document 09: Use Cases
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 2 - Requirements Engineering
**Version:** 1.0

---

## 1. Dashboard & Home (لوحة القيادة)
### UC-01: View Dashboard Statistics
*   **Actor:** DON, Admin
*   **Description:** The actor logs in and views high-level statistics (total nurses, training metrics, satisfaction scores) on the main dashboard.
*   **Pre-condition:** User is logged in with appropriate role.

### UC-02: View Urgent Alerts
*   **Actor:** All Users
*   **Description:** The actor logs in and immediately sees a dismissible red banner at the top of the screen containing an urgent hospital-wide announcement.

## 2. Document Control (إدارة الوثائق)
### UC-03: Search for a Policy
*   **Actor:** Standard Nurse
*   **Description:** The actor uses the global search bar to type "Infection Control". The system displays the most recent, approved policy PDF for viewing.
*   **Post-condition:** Actor successfully views the policy without editing rights.

### UC-04: Upload and Publish a New Policy
*   **Actor:** Quality Officer
*   **Description:** The actor navigates to the Document Control section, uploads a PDF, fills in metadata (Title, Department, Expiry Date), and clicks "Publish".
*   **Post-condition:** The document is immediately available in the search index for all authorized staff.

## 3. Operations & Scheduling (العمليات والجدولة)
### UC-05: Upload Department Schedule
*   **Actor:** Department Head
*   **Description:** The actor navigates to their department page, clicks "Upload Schedule", selects the PDF for the upcoming month, and submits it.
*   **Post-condition:** The schedule is visible to all nurses assigned to that specific department.

### UC-06: View Monthly Schedule
*   **Actor:** Standard Nurse
*   **Description:** The actor accesses the portal via their mobile device, clicks on "My Schedule", and views the uploaded PDF roster for their department.

## 4. Governance & Committees (الحوكمة)
### UC-07: Access Committee Minutes
*   **Actor:** Committee Member (e.g., ADON)
*   **Description:** The actor navigates to the Governance section, selects "Nursing Executive Council", and downloads the meeting minutes from the previous month.
*   **Pre-condition:** Actor must be explicitly listed as a member of that committee in the system.

## 5. Corporate Communication (التواصل)
### UC-08: Publish Hospital News
*   **Actor:** Portal Manager / DON
*   **Description:** The actor navigates to the CMS, creates a new post with a title, image, and text content, selects "All Departments" as the target, and clicks "Publish".
*   **Post-condition:** The news article appears on the homepage feed for all active users.
