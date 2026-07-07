# Document 16: User Journey
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 4 - UX/UI
**Version:** 1.0

---

## 1. Overview (نظرة عامة)
This document maps out standard user journeys to illustrate how different personas will interact with the system in real-world scenarios.

## 2. Journey 1: Beginning of a Night Shift
**Persona:** Fatima (Staff Nurse, ER)
**Scenario:** Fatima is starting her night shift and wants to check for any updates and confirm her schedule for the rest of the week.
1.  **Trigger:** Fatima arrives at the hospital, connects to Wi-Fi, and opens the Portal on her smartphone.
2.  **Action 1 (Login):** She logs in via FaceID/Biometrics (if supported) or saved credentials. The UI is automatically in Dark Mode based on her device settings.
3.  **Action 2 (Alerts):** She sees a red urgent banner: "Code Red drill tomorrow at 10 AM." She taps "Acknowledge".
4.  **Action 3 (Schedule):** She taps the "My Schedule" icon on the bottom navigation bar. The PDF of the ER schedule opens instantly.
5.  **Outcome:** Fatima is informed and ready for her shift within 45 seconds of opening the app.

## 3. Journey 2: Clinical Policy Lookup During an Emergency
**Persona:** Fatima (Staff Nurse, ER)
**Scenario:** Fatima needs to double-check the exact pediatric dosage protocol for a specific medication.
1.  **Trigger:** A clinical question arises. She needs the answer immediately.
2.  **Action 1 (Search):** She taps the Global Search bar at the top of the app.
3.  **Action 2 (Query):** She types "Pediatric Dosage". Auto-suggest shows the exact CPP (Clinical Policy & Procedure) document.
4.  **Action 3 (View):** She taps the result. The approved PDF policy opens on her screen.
5.  **Outcome:** Patient safety is ensured because Fatima accessed the single source of truth in seconds, rather than searching for a physical binder.

## 4. Journey 3: Publishing a New Policy
**Persona:** Dr. Sarah (Quality Officer)
**Scenario:** An updated Infection Control policy has been signed and needs to replace the old one.
1.  **Trigger:** Dr. Sarah receives the finalized, signed policy.
2.  **Action 1 (Login):** She logs in via her desktop computer and accesses the "Document Control" panel.
3.  **Action 2 (Upload):** She uploads the new PDF, titles it "Infection Control V2", selects the category "CPP", and sets the expiry date for 2 years from today.
4.  **Action 3 (Archive):** The system automatically archives "Infection Control V1" and routes all old links to V2.
5.  **Action 4 (Publish):** She clicks publish. A notification is sent to the relevant departments.
6.  **Outcome:** The hospital is instantly compliant with the new standard, and old copies are digitally removed from circulation.
