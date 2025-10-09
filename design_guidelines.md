# Design Guidelines: Audit & Lead Management Platform

## Design Approach

**Selected Approach**: Design System + Modern Enterprise Reference
- **Primary Inspiration**: Linear (clean enterprise UI) + Carbon Design System (data-heavy enterprise applications)
- **Justification**: This is a utility-focused, information-dense enterprise platform where efficiency, data clarity, and professional trustworthiness are paramount. The combination provides modern aesthetics with proven enterprise patterns.

**Key Design Principles**:
1. **Data Clarity First**: Information hierarchy and readability trump visual flair
2. **Efficient Workflows**: Minimal clicks, clear actions, predictable patterns
3. **Professional Trust**: Clean, corporate aesthetic suitable for compliance/audit context
4. **Field-Ready**: Touch-friendly, works excellently on tablets for on-site auditors

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 220 90% 56% (Professional blue for CTAs, active states)
- Background: 0 0% 100% (Pure white)
- Surface: 220 14% 96% (Light gray for cards/sections)
- Border: 220 13% 91% (Subtle borders)
- Text Primary: 222 47% 11% (Near black)
- Text Secondary: 215 16% 47% (Medium gray)
- Success: 142 71% 45% (Green for completed/approved)
- Warning: 38 92% 50% (Amber for pending/review)
- Error: 0 84% 60% (Red for non-compliance/rejected)
- Info: 199 89% 48% (Cyan for notifications)

**Dark Mode**:
- Primary: 220 90% 56% (Same blue, works in dark)
- Background: 222 47% 11% (Deep navy-black)
- Surface: 217 33% 17% (Elevated dark gray)
- Border: 215 25% 27% (Subtle dark borders)
- Text Primary: 210 40% 98% (Off white)
- Text Secondary: 215 20% 65% (Light gray)
- Success/Warning/Error/Info: Slightly desaturated versions of light mode

### B. Typography

**Font Families**:
- Primary: 'Inter' (body text, UI elements) - Professional, highly readable
- Headings: 'Inter' (600-700 weight for hierarchy)
- Monospace: 'JetBrains Mono' (data fields, IDs, codes)

**Scale**:
- Page Titles: text-3xl font-semibold (30px)
- Section Headings: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body: text-base (16px)
- Small/Meta: text-sm (14px)
- Captions: text-xs (12px)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-12
- Card gaps: gap-4 to gap-6
- Form fields: space-y-4

**Grid System**:
- Dashboard: 12-column grid with gap-6
- Forms: Single column max-w-4xl for readability
- Data tables: Full width with horizontal scroll on mobile
- Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for features/stats

### D. Component Library

**Navigation**:
- Top navbar: Fixed, h-16, with logo, search, user menu, notifications
- Sidebar: 64px collapsed (icons only), 256px expanded, sticky positioning
- Breadcrumbs: text-sm with chevron separators for deep navigation

**Forms & Inputs**:
- Input fields: h-10, rounded-lg, border-2, focus ring-2 ring-primary
- Labels: text-sm font-medium, mb-1.5
- Dropdowns: Custom styled with Heroicons chevron-down
- Checkboxes/Radio: Larger touch targets (h-5 w-5) for mobile
- File upload: Drag-and-drop zone with preview thumbnails
- Validation: Inline error messages in error color below field

**Data Display**:
- Tables: Striped rows, sticky header, sortable columns with icons
- Status badges: px-2.5 py-1 rounded-full text-xs font-medium
- Cards: rounded-xl border shadow-sm, p-6, with hover lift effect
- Lists: Divided list items with avatar/icon, title, meta text

**Dashboards**:
- Stat cards: Large number display with trend indicator, sparkline charts
- Charts: Use Chart.js with brand colors, clean axes, tooltips
- Filters: Horizontal filter bar with date pickers, dropdowns, search
- KPI layout: 4-column grid on desktop, stack on mobile

**Actions**:
- Primary button: bg-primary text-white px-4 py-2 rounded-lg font-medium
- Secondary: border-2 border-primary text-primary (same dimensions)
- Ghost: text-primary hover:bg-surface
- Icon buttons: h-9 w-9 rounded-lg for toolbars
- Floating Action Button: Bottom-right fixed position for quick audit creation (mobile)

**Overlays**:
- Modals: max-w-2xl, rounded-2xl, backdrop blur, slide-up animation
- Drawers: Slide from right, w-96, for detail views/filters
- Tooltips: Dark bg, white text, text-xs, arrow pointer
- Toast notifications: Top-right stack, auto-dismiss, with icon

### E. Animations

**Minimal & Purposeful**:
- Page transitions: 150ms fade-in
- Hover states: 100ms ease-in-out for buttons/cards
- Loading states: Subtle skeleton screens (no spinners unless necessary)
- Success feedback: 300ms checkmark animation on form submit
- **No decorative animations** - focus on functional feedback only

---

## Page-Specific Designs

### Dashboard (Home)
- **Layout**: KPI cards row at top (4 metrics: Total Audits, Pending, Completed, Leads Generated)
- **Charts**: 2-column grid below (Audit Status Pie Chart | Lead Conversion Funnel)
- **Recent Activity**: Full-width table with last 10 audits/leads, quick actions
- **No hero section needed** - jump straight to data

### Audit Form (Multi-Step)
- **Progress Indicator**: Top horizontal stepper (Planning → Execution → Observation → BI → Follow-up)
- **Form Layout**: Single column, generous spacing, section dividers
- **Dynamic Checklist**: Accordion-style questions, expand to answer, visual completion indicator
- **Geo-location**: Auto-fetch with map preview thumbnail
- **Photo Upload**: Grid of thumbnails with delete option, max 10 images

### Lead Management
- **Kanban View**: Columns for Open | In Progress | Converted | Rejected with drag-drop cards
- **Table View Toggle**: For detailed list with filters (Type, Priority, Date Range, Assigned To)
- **Quick Create**: Modal form for fast lead entry from any page
- **Detail Panel**: Right drawer with full lead info, activity timeline, linked audits

### Master Data Config
- **Two-column Layout**: Left navigation tabs (Users, Roles, Customers, etc.) | Right content area
- **CRUD Tables**: Inline edit, bulk actions, export CSV
- **Import Templates**: Download template button, upload with validation feedback

### Reports
- **Filter Sidebar**: Left panel with date range, audit type, industry filters
- **Report Preview**: Center area with chart/table, export to PDF/Excel buttons
- **Report Library**: Grid of report cards with icons, descriptions, last run date

### Channel Partner Dashboard
- **Limited Navigation**: Only Assigned Audits, My Leads, Profile
- **Simplified KPIs**: Focus on personal metrics, not company-wide
- **Assignment Notifications**: Prominent badge count on sidebar items

---

## Images

**Dashboard**: No hero image needed - this is a data-first page. Use icon illustrations for empty states only.

**Login/Onboarding**: 
- Full-height split screen: Left 40% = login form on white, Right 60% = abstract illustration of audit/checklist workflow with brand colors (professional, not literal)
- Image style: Geometric, clean vectors, no photographs

**Empty States**: 
- Illustrations for "No audits yet", "No leads found" - Simple line art with primary color accent
- 200x200px centered with helpful CTA below

**No hero sections on internal pages** - this is an enterprise tool focused on efficiency, not marketing.

---

## Accessibility & Responsiveness

- **WCAG AA compliance**: 4.5:1 contrast minimum, focus indicators on all interactive elements
- **Keyboard navigation**: Tab order logical, Escape closes modals, Enter submits forms
- **Mobile breakpoints**: 
  - sm: 640px (stack forms, hide sidebar)
  - md: 768px (2-column layouts)
  - lg: 1024px (3-column, show sidebar)
  - xl: 1280px (optimal dashboard)
- **Touch targets**: Minimum 44x44px for all interactive elements on mobile
- **Form considerations**: Number inputs with step increment buttons, date pickers mobile-optimized

---

## Brand Consistency

**Overall Aesthetic**: Clean, professional, data-centric enterprise platform inspired by Linear's polish and Carbon's enterprise robustness. Every pixel serves the user's audit workflow - zero decorative fluff.