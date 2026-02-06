# Design Brief: Gemeinsamer Terminkalender

## 1. App Analysis

### What This App Does
This is a **shared calendar system** ("Gemeinsamer Terminkalender") used by a community or congregation to coordinate weekly schedules and calendar events. It manages participants (Benutzerverwaltung), assigns them to tours (Tour 1/2/3), and tracks both weekly schedules (Wochenkalender) and calendar entries (Kalendereinträge). Each event has a start and end time, assigned participants, and a tour designation.

### Who Uses This
Community coordinators or congregation leaders who need to see at a glance: who is scheduled when, which tours are covered, and what's coming up this week. They are NOT tech-savvy — they want a clear overview without clicking through menus. They think in terms of "Who's working this week?" and "Are all tours covered?"

### The ONE Thing Users Care About Most
**"What's happening this week?"** — An instant overview of upcoming events and tour assignments for the current week. They want to open the dashboard and immediately know if everything is covered and who is assigned where.

### Primary Actions (IMPORTANT!)
1. **Neuen Termin eintragen** (Add new calendar entry) → Primary Action Button — This is the most frequent action: scheduling a new event with participants and tour assignment
2. View upcoming events by tour
3. See participant workload/distribution

---

## 2. What Makes This Design Distinctive

### Visual Identity
A calm, organized dashboard that feels like a well-designed **paper planner brought to digital life**. The cool slate-blue accent on a warm off-white base creates a professional yet approachable feel — not corporate, not playful, but trustworthy. The design uses subtle left-border accents on cards (colored by tour) to create a visual filing system, like colored tabs in a physical planner.

### Layout Strategy
- **Asymmetric desktop layout**: Wide left column (65%) holds the hero "This Week" timeline and upcoming events. Narrow right column (35%) shows participant stats and quick-add. This mirrors the mental model: "What's happening?" (main) vs "Who's available?" (supporting).
- **Hero element**: A large "This Week" section showing the count of events this week as a prominent number, with a compact visual breakdown by tour beneath it. The hero takes up the top portion of the left column and uses size + whitespace to dominate.
- **Visual interest** comes from: (1) tour-colored left-border accents on event cards, (2) the oversized hero number contrasting with compact secondary stats, (3) a horizontal "tour distribution" bar that adds color without clutter.

### Unique Element
Each tour has a signature color (slate-blue for Tour 1, warm amber for Tour 2, sage green for Tour 3). Event cards have a **3px left border** in their tour's color, creating a subtle but instantly recognizable visual filing system. The tour distribution bar at the bottom of the hero section uses these same three colors in a single horizontal stacked bar — minimal but informative, like a progress indicator split three ways.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a professional warmth with slightly rounded terminals that feels approachable without being casual. It has excellent weight range (300–700) for creating strong typographic hierarchy, and its geometric clarity makes numbers highly readable at large sizes — crucial for a calendar dashboard.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(220 20% 16%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(220 20% 16%)` | `--card-foreground` |
| Borders | `hsl(220 15% 90%)` | `--border` |
| Primary action | `hsl(215 55% 42%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(215 40% 95%)` | `--accent` |
| Muted background | `hsl(220 15% 95%)` | `--muted` |
| Muted text | `hsl(220 10% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(152 45% 42%)` | (component use) |
| Error/negative | `hsl(0 65% 52%)` | `--destructive` |

**Tour Colors (used for card borders and distribution bar):**
- Tour 1: `hsl(215 55% 52%)` — Slate blue (matches primary family)
- Tour 2: `hsl(35 75% 55%)` — Warm amber
- Tour 3: `hsl(152 40% 48%)` — Sage green

### Why These Colors
The warm off-white background (`hsl(40 25% 97%)`) avoids the clinical feel of pure white while keeping things bright and readable. The slate-blue primary (`hsl(215 55% 42%)`) feels reliable and structured — fitting for a scheduling tool. The three tour colors are distinct enough for instant recognition but all sit in the same saturation range so they feel cohesive, not chaotic.

### Background Treatment
The page background is a warm off-white (`hsl(40 25% 97%)`) — not pure white, with a very subtle warm undertone that makes white cards "float" naturally. Cards use pure white (`hsl(0 0% 100%)`) which creates gentle depth without needing heavy shadows. No gradients or patterns — the warmth of the background alone creates enough visual interest.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is a focused, scroll-driven experience. The hero section takes up the first viewport fold — a large number showing this week's event count with the tour distribution bar directly beneath. Below the fold, upcoming events are listed as compact cards with tour-colored left borders. The primary action button is fixed at the bottom of the screen for constant accessibility.

### What Users See (Top to Bottom)

**Header:**
A simple top bar with the app name "Terminkalender" in 600 weight, 18px. No logo, no hamburger menu — clean and direct. Right side has a small avatar/icon placeholder (24px circle) for future user context.

**Hero Section (The FIRST thing users see):**
- Takes approximately 40% of the initial viewport
- Large centered number showing **events this week** — displayed at 56px, 700 weight, in the foreground color
- Subtitle "Termine diese Woche" in 14px, 400 weight, muted-foreground
- Below the number: a horizontal stacked bar (8px tall, full width, rounded-full) showing distribution across Tour 1/2/3 using tour colors. This immediately communicates coverage balance.
- Below the bar: three inline labels showing "Tour 1: X · Tour 2: X · Tour 3: X" in 12px, muted-foreground
- The hero sits in a white card with 16px padding and the standard border radius
- **Why this is the hero:** Users open the app asking "What's happening this week?" — this answers it in under one second

**Section 2: Nächste Termine (Upcoming Events)**
- Section heading "Nächste Termine" in 16px, 600 weight with a "Alle anzeigen" link in primary color on the right
- Compact event cards stacked vertically with 8px gaps
- Each card: white background, 3px left border in tour color, 12px padding
  - Top line: Date in 13px 600 weight (e.g., "Mo, 10. Feb · 09:00–11:00")
  - Bottom line: Participant names in 13px 400 weight, muted-foreground, with a small tour badge (pill shape, 10px text, tour background at 15% opacity with tour-colored text)
- Shows maximum 5 upcoming events
- If no events: show an empty state with a calendar icon (48px, muted) and text "Keine Termine diese Woche" in 14px muted-foreground

**Section 3: Teilnehmer (Participants Overview)**
- Section heading "Teilnehmer" in 16px, 600 weight
- Horizontal scroll row of compact participant "chips" — each showing first name + last initial, with a small number badge indicating how many events they're assigned to this month
- Chips: pill shape, muted background, 13px text, 8px horizontal padding, 4px vertical padding
- This gives a quick workload overview without taking much vertical space

**Bottom Navigation / Action:**
- Fixed bottom bar with the primary action button: full-width (with 16px margins), 48px height, primary background color, white text, "Neuen Termin eintragen" in 15px 600 weight, rounded-lg (8px). Sitting 16px above the bottom safe area.
- Subtle top border on the fixed bar (1px, border color) to separate from content

### Mobile-Specific Adaptations
- Hero number is centered and large (56px) — on desktop it's left-aligned
- Tour distribution bar is full-width instead of a fixed-width element
- Event cards use single-column stack instead of a table
- Participant section uses horizontal scroll instead of a multi-column grid

### Touch Targets
- Event cards are tappable (minimum 44px height) — tapping opens event details (or could expand inline)
- Primary action button is 48px tall, full-width
- Participant chips are at least 36px tall for comfortable tapping

### Interactive Elements
- Tapping an event card could expand it to show full participant details and tour info (accordion-style expand, not navigation)
- The primary action button opens a bottom sheet / dialog for adding a new calendar entry

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout with max-width of 1200px, centered on the page.

- **Left column (65%):** Hero section at top (this week's count + tour bar), then the upcoming events list/table below
- **Right column (35%):** Secondary KPIs (total participants, events this month) stacked at top, then participant list below
- **The eye goes:** Hero number (top-left) → Tour distribution bar → Upcoming events → Right column stats → Participant list

This mirrors the mental model: "What's happening?" dominates, "Who's involved?" supports.

### Section Layout

**Top area (full width):**
- App title "Gemeinsamer Terminkalender" in 24px, 700 weight on the left
- Primary action button "Neuen Termin eintragen" on the right — standard button (not full-width), primary color, with a "+" icon (lucide CalendarPlus) before the text

**Left column — Hero Card:**
- White card, standard border radius, 24px padding
- "Diese Woche" label in 13px, 500 weight, muted-foreground, uppercase, letter-spacing 0.05em
- The event count number: 48px, 700 weight, foreground color
- "Termine" suffix in 16px, 400 weight, muted-foreground, inline after the number
- Tour distribution stacked bar: 6px tall, full card width, rounded-full, with the three tour colors
- Below bar: three items inline — each showing a colored dot (8px circle) + "Tour 1: X" in 13px, with 16px gap between items

**Left column — Upcoming Events Table:**
- White card below the hero, 24px padding
- "Nächste Termine" heading in 18px, 600 weight
- Table with columns: Datum (date/time), Teilnehmer (participant names), Tour (colored badge)
- Table rows have subtle bottom borders (1px, border color)
- Date column: 14px, 500 weight — format "Mo, 10.02. · 09:00–11:00"
- Teilnehmer column: 14px, 400 weight — shows both participant names joined with " & "
- Tour column: pill badge with tour background at 12% opacity, tour-colored text, 12px font
- Shows up to 10 upcoming events, sorted by datum_von ascending (only future events)
- Rows have subtle hover: background transitions to accent color

**Right column — Top Stats:**
- Two stacked stat cards with 12px gap
- Each card: white background, standard border radius, 16px padding
  - **Card 1 — "Teilnehmer"**: Total number of participants (count from Benutzerverwaltung), displayed as 32px 700 weight number, with "registriert" label in 13px muted-foreground below
  - **Card 2 — "Diesen Monat"**: Count of events this calendar month, displayed as 32px 700 weight number, with "Termine" label in 13px muted-foreground below

**Right column — Participant List:**
- White card below stats, 16px padding
- "Teilnehmer" heading in 16px, 600 weight
- Simple list of participants: each row shows "Vorname Nachname" in 14px 400 weight, with "Versammlung" in 13px muted-foreground on the right
- Rows separated by subtle 1px borders
- Shows all participants, scrollable if many (max-height 400px with overflow-y auto)

### What Appears on Hover
- Event table rows: background color transitions to accent (`hsl(215 40% 95%)`) over 150ms
- Primary action button: slight brightness increase (lighten by 5%)
- Participant list rows: background color transitions to muted over 150ms

### Clickable/Interactive Areas
- Event table rows are clickable — could expand to show full details inline (optional, not required for MVP)
- Primary action button in header opens a dialog (not a bottom sheet on desktop) for adding a new calendar entry

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Diese Woche"
- **Data source:** Kalendereinträge (primary) + Wochenkalender (combined)
- **Calculation:** Count all events from both Kalendereinträge and Wochenkalender where `datum_von` falls within the current week (Monday to Sunday). Use date-fns `startOfWeek` with `{ weekStartsOn: 1 }` and `endOfWeek` to determine the range.
- **Display:** Large number (48px desktop / 56px mobile, 700 weight) with "Termine" suffix. Below it, a horizontal stacked bar showing the breakdown by tour (Tour 1 / Tour 2 / Tour 3), plus three inline counters with colored dots.
- **Context shown:** Tour distribution breakdown — instantly shows if coverage is balanced or if one tour is under-staffed.
- **Why this is the hero:** The coordinator opens this dashboard to answer "What's happening this week?" — the count and distribution answer this in under one second.

### Secondary KPIs

**Teilnehmer (Participants Count)**
- Source: Benutzerverwaltung
- Calculation: Count of all records
- Format: Whole number
- Display: 32px number in a compact card (right column on desktop, part of participants section on mobile)

**Termine Diesen Monat (Events This Month)**
- Source: Kalendereinträge + Wochenkalender
- Calculation: Count of events where `datum_von` falls within the current calendar month (use date-fns `startOfMonth` / `endOfMonth`)
- Format: Whole number
- Display: 32px number in a compact card (right column on desktop, not shown separately on mobile — implied by the weekly view)

### Chart
No traditional chart. Instead, the **tour distribution stacked bar** serves as a minimal, inline visualization. This avoids chart clutter for what is essentially a scheduling tool — users need lists and assignments, not line graphs.

- **Type:** Horizontal stacked bar (custom component, not recharts — just three colored divs with flex)
- **Title:** None (sits directly under the hero number)
- **What question it answers:** "Are tours evenly covered this week?"
- **Data source:** Kalendereinträge + Wochenkalender (this week's events, grouped by tour)
- **Mobile simplification:** Full-width, same as desktop but 8px height instead of 6px

### Lists/Tables

**Nächste Termine (Upcoming Events)**
- Purpose: See what's coming up next, with participants and tour assignments
- Source: Kalendereinträge + Wochenkalender
- Fields shown: datum_von, datum_bis (formatted as date + time range), teilnehmer_1 and/or teilnehmer_2 (resolved to names via Benutzerverwaltung lookup), tour (as colored badge)
- Mobile style: Compact cards with left border colored by tour
- Desktop style: Clean table with columns: Date/Time, Participants, Tour
- Sort: By datum_von ascending, only future events (datum_von >= today)
- Limit: 5 on mobile, 10 on desktop

**Teilnehmer (Participant List)**
- Purpose: Quick reference of all registered participants
- Source: Benutzerverwaltung
- Fields shown: vorname + nachname (full name), versammlung
- Mobile style: Horizontal scroll chips showing first name + last initial
- Desktop style: Simple list with name and versammlung
- Sort: By nachname alphabetically
- Limit: All participants (scrollable on desktop if > 10)

### Primary Action Button (REQUIRED!)

- **Label:** "Neuen Termin eintragen"
- **Action:** add_record
- **Target app:** Kalendereinträge (app_id: 6985ad70362c1183b8ef9c05)
- **What data:** The form contains:
  - `datum_von` — Date/time picker (required), format YYYY-MM-DDTHH:MM
  - `datum_bis` — Date/time picker (required), format YYYY-MM-DDTHH:MM
  - `teilnehmer_1` — Select dropdown populated from Benutzerverwaltung records (shows "Vorname Nachname"), value is the record URL via createRecordUrl()
  - `teilnehmer_2` — Select dropdown populated from Benutzerverwaltung records (shows "Vorname Nachname"), value is the record URL via createRecordUrl()
  - `tour` — Select dropdown with options: Tour 1 (tour_1), Tour 2 (tour_2), Tour 3 (tour_3)
- **Mobile position:** bottom_fixed — full-width button fixed to the bottom of the screen
- **Desktop position:** header — standard button in the top-right header area
- **Why this action:** The primary reason coordinators use this tool is to schedule new events with assigned participants and tours. Making this one-tap accessible is essential.

---

## 7. Visual Details

### Border Radius
Rounded (8px) — `--radius: 0.5rem`. Cards, buttons, and inputs all use this. Tour badges use pill (9999px). The tour distribution bar uses rounded-full.

### Shadows
Subtle — Cards use `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`. This is lighter than default shadcn shadows. The warm background makes cards "float" without needing heavy shadows.

### Spacing
Normal to spacious — 24px card padding on desktop, 16px on mobile. 16px gaps between cards. 32px gap between major sections. The hero section has extra breathing room (32px bottom margin) to emphasize its importance.

### Animations
- **Page load:** Subtle fade-in (opacity 0→1, 300ms ease) for the main content area
- **Hover effects:** Background color transitions (150ms ease) on table rows and list items
- **Tap feedback:** Standard button press feedback via shadcn Button component (scale 0.98 on active)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(40 25% 97%);
  --foreground: hsl(220 20% 16%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 20% 16%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 20% 16%);
  --primary: hsl(215 55% 42%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(220 15% 95%);
  --secondary-foreground: hsl(220 20% 20%);
  --muted: hsl(220 15% 95%);
  --muted-foreground: hsl(220 10% 50%);
  --accent: hsl(215 40% 95%);
  --accent-foreground: hsl(215 55% 30%);
  --destructive: hsl(0 65% 52%);
  --border: hsl(220 15% 90%);
  --input: hsl(220 15% 90%);
  --ring: hsl(215 55% 42%);
  --radius: 0.5rem;
  --chart-1: hsl(215 55% 52%);
  --chart-2: hsl(35 75% 55%);
  --chart-3: hsl(152 40% 48%);
  --chart-4: hsl(215 55% 42%);
  --chart-5: hsl(280 45% 55%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font "Plus Jakarta Sans" loaded from Google Fonts URL in index.html
- [ ] All CSS variables copied exactly into src/index.css :root
- [ ] Mobile layout matches Section 4 — single column, hero at top, fixed bottom action button
- [ ] Desktop layout matches Section 5 — two-column asymmetric (65/35), hero top-left
- [ ] Hero element is prominent — large number (48px/56px), tour distribution bar below
- [ ] Tour-colored left borders on event cards (3px, using tour colors)
- [ ] Tour distribution stacked bar uses three tour colors
- [ ] Primary action button opens dialog/bottom-sheet to create Kalendereinträge record
- [ ] Form fields: datum_von, datum_bis (datetime), teilnehmer_1, teilnehmer_2 (select from Benutzerverwaltung), tour (select)
- [ ] Dates formatted with date-fns de locale
- [ ] applookup fields use extractRecordId() and createRecordUrl()
- [ ] Empty states handled with icon + message
- [ ] Loading states with skeleton placeholders
- [ ] Error state with retry option
- [ ] Colors create a warm, professional mood (not clinical white)
- [ ] All data fetched from Living Apps API via livingAppsService
