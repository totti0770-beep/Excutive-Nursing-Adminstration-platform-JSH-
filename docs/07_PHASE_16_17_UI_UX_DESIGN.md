# Phase 16 & 17: UI Design System & UX Guidelines

## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital

---

## Phase 16: UI Design System

The application utilizes a highly polished, professional "Vibrant Palette" aesthetic tailored for enterprise healthcare. It relies on Tailwind CSS for utility-first styling.

### 16.1 Color Palette
*   **Backgrounds:** 
    *   Light Mode: `#F8FAFC` (Primary), `#FFFFFF` (Secondary/Cards).
    *   Dark Mode: `#0b0e1a` (Primary), `#161d3a` (Secondary/Cards).
*   **Typography:** 
    *   Light Mode: `#0F172A` (Headings), `#64748B` (Body).
    *   Dark Mode: `#f0f2f8` (Headings), `#a8b2d9` (Body).
*   **Brand Accents:**
    *   Primary Gold/Indigo (Vibrant Theme): `#4F46E5` (Indigo-600) transitioning to `#818CF8` (Light) for interactions.
    *   Secondary Accent (Teal/Medical): `#06B6D4` (Cyan-500) for success/health metrics.
*   **Gradients:** Use subtle gradients (e.g., `linear-gradient(135deg, ...)`) for primary buttons and hero elements to convey a premium feel.

### 16.2 Typography
*   **Font Family:** `Tajawal` (Google Fonts) - chosen for its excellent modern Arabic legibility and clean geometric English letterforms.
*   **Hierarchy:**
    *   H1/Page Titles: 22px-28px, Extra Bold (`font-extrabold`), tight tracking.
    *   H2/Section Titles: 17px-20px, Bold.
    *   Body Text: 14px-15px, Medium/Regular, leading relaxed (`line-height: 1.6`).
    *   Micro-copy / Labels: 12px-13px, Uppercase tracking wide for English, standard for Arabic.

### 16.3 UI Components
*   **Cards:** Clean white/dark backgrounds, subtle borders (`border-gold/5`), smooth hover translation (`hover:-translate-y-1`), and soft, large shadows (`shadow-xl` / `shadow-2xl` on hover).
*   **Buttons:** Fully rounded (`rounded-full`), clear interactive states (hover brightness, active scale down). Primary buttons use brand gradients; secondary buttons use transparent backgrounds with borders.
*   **Icons:** Lucide-React icon set (stroke-based, minimalist, 24px default).

---

## Phase 17: UX Guidelines

### 17.1 Accessibility & Readability
*   **Contrast:** All text must meet WCAG AA standards against its background (especially in Dark Mode).
*   **Touch Targets:** Minimum 44x44px for all interactive elements (buttons, links, table rows) on mobile devices.
*   **Focus States:** Clear visible focus rings (`focus:ring-2 focus:ring-gold`) for keyboard navigation.

### 17.2 Interaction Patterns
*   **Feedback:** Every user action (save, delete, submit) must trigger a Toast notification (success/error).
*   **Loading States:** Use skeleton loaders for data grids and charts rather than full-page blocking spinners where possible.
*   **Destructive Actions:** Deleting a policy or user must require a confirmation modal ("Are you sure?").

### 17.3 Localization Logic (RTL/LTR)
*   The application operates strictly in RTL for Arabic. 
*   CSS logical properties (`margin-inline-start`, `padding-inline-end`) or Tailwind's RTL support (`ltr:ml-2 rtl:mr-2`) must be used instead of hardcoded `left`/`right` margins to ensure the layout flips perfectly if an English version is activated.
