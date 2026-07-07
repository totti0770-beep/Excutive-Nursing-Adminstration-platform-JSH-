# Document 18: Design System
## Project: Nursing Administration Portal
**Client:** Jazan Specialty Hospital (JSH)
**Phase:** 4 - UX/UI
**Version:** 1.0

---

## 1. Overview & Identity (نظرة عامة والهوية)
The Design System ensures visual consistency across the portal. The visual language must feel trustworthy, clinical, intelligent, and executive-grade. It is heavily inspired by Apple Health, Stripe, and modern iOS aesthetics, tailored for a premium Saudi healthcare identity.

## 2. Color Palette (لوحة الألوان)
*   **Primary Colors:**
    *   **Deep Navy (`#0A192F`):** Used for primary text, sidebars, and critical executive UI elements. Conveys authority and trust.
    *   **Clinical Blue (`#007AFF` or similar iOS blue):** Used for primary actions, active states, and links.
    *   **Soft Gray (`#F5F5F7`):** Background color for light mode, providing a clean Apple-like canvas.
    *   **Pure White (`#FFFFFF`):** Used for cards and primary content containers in light mode.
*   **Accent Colors:**
    *   **Medical Green/Emerald (`#34C759`):** Success states, published status, positive KPIs.
    *   **Alert Red (`#FF3B30`):** Critical alerts, expired documents, destructive actions.
    *   **Warning Yellow (`#FFCC00`):** Pending approvals, draft statuses.

## 3. Typography (الخطوط)
*   **Primary Font (Arabic):** `Tajawal` or `IBM Plex Sans Arabic`. These fonts provide a modern, highly legible, and premium geometric aesthetic suitable for digital interfaces.
*   **Primary Font (English/Numbers):** `Inter` or `San Francisco (SF Pro)`.
*   **Hierarchy:**
    *   **Headings (H1, H2):** Bold (700), tight letter-spacing, Deep Navy.
    *   **Body Text:** Regular (400) or Medium (500), dark gray (not pure black) for readability.
    *   **Micro-copy (Dates, Tags):** Light (300) or Regular (400), smaller size, muted gray.

## 4. UI Components & Style (المكونات والأسلوب)
*   **Shapes:** Generous rounded corners on all cards, buttons, and modals (e.g., `border-radius: 12px` or `16px`).
*   **Shadows:** Soft, diffused drop shadows to create depth. Avoid harsh, dark shadows.
*   **Glassmorphism:** Use blurred, semi-transparent backgrounds for sticky headers, bottom navigation bars, and modals to create a modern iOS feel.
*   **Spacing:** Prioritize white space. Interfaces must feel uncluttered and breathable. Use consistent padding (e.g., 16px, 24px, 32px).
*   **Borders:** Use very subtle, light gray borders to separate content areas rather than heavy lines.

## 5. Theming (السمات)
*   **Light Mode:** Default. Soft gray backgrounds, white cards, dark text.
*   **Dark Mode:** Supported and optimized. Deep charcoal backgrounds (`#1C1C1E`), slightly lighter gray cards (`#2C2C2E`), and white text. Accent colors must be adjusted for accessibility (WCAG AA contrast).

## 6. Iconography (الأيقونات)
*   **Style:** Minimalist, line-based icons (e.g., Lucide Icons or Heroicons).
*   **Consistency:** Stroke width must be consistent (typically 1.5px or 2px) across all icons.
*   Avoid overly colorful or illustrative icons; keep them functional and clinical.
