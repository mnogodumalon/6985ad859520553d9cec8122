# Design Brief: Gemeinsamer Terminkalender

## 1. App Analysis

### What This App Does
This is a shared calendar system ("Gemeinsamer Terminkalender") for coordinating participants and tours. It manages calendar entries with start/end times, assigns participants from a user directory, and organizes them into tours (Tour 1, 2, 3). There's also a weekly calendar view. It's used by a congregation-based community (Versammlungen in Bayreuth) to coordinate shared scheduling of activities.

### Who Uses This
Community coordinators who need to see at a glance who is scheduled when, which tours are covered, and quickly add new calendar entries. They're not technical - they want a clear overview and fast entry creation.

### The ONE Thing Users Care About Most
**Upcoming schedule** - "What's coming up next? Who is assigned where?" Users open this dashboard to see the next appointments at a glance and know if all tours are covered.

### Primary Actions (IMPORTANT!)
1. **Neuer Eintrag** (New calendar entry) → Primary Action Button - users need to quickly create a new calendar entry with date, participants, and tour assignment
2. View upcoming entries by tour
3. Look up participant details

---

## 2. What Makes This Design Distinctive

### Visual Identity
A calm, organized aesthetic inspired by premium calendar apps like Fantastical. The design uses a soft sage-green accent against a warm off-white background, evoking reliability and natural order. The typography is clean but characterful, with generous whitespace that lets the schedule breathe. It feels like a well-organized planner, not a sterile spreadsheet.

### Layout Strategy
- The hero is an upcoming schedule timeline that dominates the center, showing the next entries in a visually rich way with color-coded tour badges
- Asymmetric layout on desktop: wide main column (70%) with the timeline/entries, narrow right column (30%) with participant stats and tour overview
- Visual interest through tour-colored badges (each tour gets a distinct muted color), typographic hierarchy between dates and details, and a prominent floating action button
- Secondary KPIs sit in a compact row above the main content - not cards, but inline stats with subtle separators to avoid the "grid of boxes" look

### Unique Element
Each tour gets a distinctive colored dot/badge (sage green for Tour 1, warm amber for Tour 2, soft blue for Tour 3) that appears consistently throughout - in the timeline, in stats, and in the form. This color-coding creates an instant visual language that lets users scan the schedule by color alone, similar to how calendar apps use colored event categories.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Plus Jakarta Sans has a friendly, modern geometric character that feels professional yet approachable - perfect for a community coordination tool. Its round letterforms soften the data-heavy interface while maintaining excellent readability at small sizes.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 20% 98%)` | `--background` |
| Main text | `hsl(200 15% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(200 15% 15%)` | `--card-foreground` |
| Borders | `hsl(40 15% 90%)` | `--border` |
| Primary action | `hsl(153 40% 40%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(153 30% 95%)` | `--accent` |
| Muted background | `hsl(40 15% 96%)` | `--muted` |
| Muted text | `hsl(200 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(153 50% 45%)` | (component use) |
| Error/negative | `hsl(0 70% 55%)` | `--destructive` |
| Tour 1 color | `hsl(153 35% 45%)` | (inline style) |
| Tour 2 color | `hsl(35 70% 55%)` | (inline style) |
| Tour 3 color | `hsl(210 45% 55%)` | (inline style) |

### Why These Colors
The warm off-white background (`hsl(40 20% 98%)`) prevents the clinical feel of pure white. The sage-green primary (`hsl(153 40% 40%)`) conveys growth, organization, and calm reliability - fitting for a community scheduling tool. The three tour colors are carefully chosen to be distinct yet harmonious: sage green, warm amber, and soft blue form a natural triad that's instantly scannable.

### Background Treatment
Warm off-white (`hsl(40 20% 98%)`) - a subtle cream undertone that makes the white cards pop slightly against it. No gradient or pattern - the warmth comes from the base tone itself.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The hero is the upcoming entries list, which takes up most of the viewport. Stats are compressed into a horizontal scrollable row of small badges. The layout is a single column with clear section breaks. Visual interest comes from the tour-colored timeline markers on the left edge of each entry.

### What Users See (Top to Bottom)

**Header:**
- App title "Terminkalender" in 20px/600 weight, left-aligned
- Right side: circular "+" button (primary color, 44px) for adding new entries

**Hero Section (Upcoming Entries):**
- Section label "Nächste Termine" in 13px/500 uppercase tracking-wide muted text
- A vertical timeline of the next 5-7 upcoming entries (sorted by datum_von ascending, filtered to future dates)
- Each entry is a row with:
  - Left: 4px wide vertical color bar matching the tour color (full height of the row)
  - Main content: Date formatted as "Do, 6. Feb" in 14px/600, time as "10:00 - 12:30" in 13px/400 muted
  - Below date: Participant names (both teilnehmer_1 and teilnehmer_2 resolved from Benutzerverwaltung, showing "Vorname Nachname") in 14px/400
  - Right: Tour badge ("Tour 1") as a small pill with the tour's color as background at 10% opacity and tour color text, 12px/500
- Each entry has 16px vertical padding and a subtle bottom border (last item no border)
- This section takes approximately 55% of the first viewport
- Why hero: Users open the app to see what's coming up next - this answers that immediately

**Section 2: Schnellübersicht (Quick Stats)**
- Three inline stats in a row, separated by thin vertical lines (not cards!):
  - "Einträge diese Woche" - count of entries this week, 22px/700 number with 12px/400 label below
  - "Aktive Teilnehmer" - count of unique participants across all entries, 22px/700 number with 12px/400 label below
  - "Touren heute" - count of distinct tours for today, 22px/700 number with 12px/400 label below
- Compact: 48px total height, centered text, muted-foreground for labels

**Section 3: Tour-Verteilung (Tour Distribution)**
- Card with title "Touren" in 15px/600
- Three horizontal bars showing the count of entries per tour
- Each bar: tour-colored background at 15% opacity, filled portion in solid tour color
- Label "Tour 1" on left, count "12" on right, both 13px/500
- Below bars: total entries count in 12px/400 muted

**Section 4: Teilnehmer (Participants)**
- Card with title "Teilnehmer" in 15px/600
- Scrollable list of all participants from Benutzerverwaltung
- Each row: Name (14px/500), Versammlung as small muted text (12px/400), Pionier badge if true (small green pill "Pionier")
- Max 6 visible, scroll for more

**Bottom Navigation / Action:**
- No fixed bottom nav
- The "+" button in the header is always accessible via scroll-to-top

### Mobile-Specific Adaptations
- Stats row uses horizontal layout with dividers instead of cards
- Tour distribution uses horizontal bars instead of any chart
- Participant list is a simple scrollable list, not a table
- All touch targets minimum 44px

### Touch Targets
- "+" button: 44px circular, primary color
- Each upcoming entry row: full-width tappable (opens detail if needed)
- Participant rows: 48px minimum height

### Interactive Elements
- Tapping an upcoming entry could show a detail sheet with full information, but not required for MVP
- "+" button opens the new entry dialog

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout with a max-width of 1200px, centered:
- Left column: 65% width - header + stats row + upcoming entries timeline
- Right column: 35% width - tour distribution + participant list

The eye goes: (1) header with action button → (2) stats row → (3) upcoming entries (hero) → (4) tour overview on right → (5) participants on right.

### Section Layout

**Top area (full width):**
- Left: App title "Gemeinsamer Terminkalender" in 26px/700
- Right: Primary action button "Neuer Eintrag" with CalendarPlus icon, standard button size, primary color

**Below header - Stats Row (left column only):**
- Three inline stats in a horizontal row with subtle vertical separators (not cards)
- Same data as mobile but slightly larger: 28px/700 numbers, 13px/400 labels
- Light muted background strip (`hsl(40 15% 96%)`) with 12px rounded corners, 20px padding

**Left Column - Main Content:**
- "Nächste Termine" section title in 16px/600, uppercase tracking-wide muted
- Timeline of upcoming entries (next 10 entries), each as:
  - Card-like rows with 4px left border in tour color
  - Date: "Donnerstag, 6. Februar 2026" in 15px/600
  - Time: "10:00 - 12:30 Uhr" in 14px/400 muted
  - Participants: Both names shown inline with User icon, 14px/400
  - Tour badge on the right: pill-shaped, colored
  - Hover: subtle shadow elevation, slight scale (1.01)
- Entries have 12px gap between them

**Right Column - Sidebar:**
- **Tour-Verteilung card:**
  - Title "Touren-Übersicht" in 16px/600
  - Three tour rows, each showing:
    - Tour color dot (8px), tour name, entry count
    - Horizontal progress bar (tour color)
  - Footer: total entries count

- **Teilnehmer card (below tours):**
  - Title "Teilnehmer" in 16px/600 with count badge
  - List of participants: name, Versammlung, Pionier badge
  - Sorted alphabetically by Nachname
  - ScrollArea if more than 8 entries

- **Wochenkalender card (below participants):**
  - Title "Wochenplan" in 16px/600
  - Shows current week's Wochenkalender entries
  - Compact list with date, tour, and participant

### What Appears on Hover
- Timeline entries: subtle shadow lift (`shadow-md`) and slight background lightening
- Participant rows: background shifts to accent color
- Tour bars: show percentage tooltip
- Action button: slight scale up (1.02) and shadow increase

### Clickable/Interactive Areas
- "Neuer Eintrag" button opens a Dialog for creating a new calendar entry
- Timeline entries are visually interactive (hover state) but no drill-down needed for MVP

---

## 6. Components

### Hero KPI
The hero is NOT a single number - it's the **upcoming entries timeline** itself.

- **Title:** Nächste Termine
- **Data source:** Kalendereinträge (joined with Benutzerverwaltung for participant names)
- **Calculation:** Filter entries where datum_von >= today, sort by datum_von ascending, take first 7 (mobile) or 10 (desktop)
- **Display:** Vertical timeline with tour-colored left border, date/time, participant names, tour badge
- **Context shown:** Each entry shows full context: when, who, which tour
- **Why this is the hero:** Users open this dashboard to answer "What's coming up?" - the timeline answers this directly and completely

### Secondary KPIs

**Einträge diese Woche**
- Source: Kalendereinträge
- Calculation: Count entries where datum_von falls within current week (Monday to Sunday)
- Format: number
- Display: Inline stat (not card), 22px/700 mobile, 28px/700 desktop

**Aktive Teilnehmer**
- Source: Benutzerverwaltung
- Calculation: Total count of all users in Benutzerverwaltung
- Format: number
- Display: Inline stat

**Touren heute**
- Source: Kalendereinträge
- Calculation: Count distinct tour values for entries where datum_von is today
- Format: number
- Display: Inline stat

### Chart: Tour Distribution (Horizontal Bars)
- **Type:** Horizontal bar (NOT recharts - simple CSS bars for cleanliness)
- **Title:** Touren-Übersicht
- **What question it answers:** "How are entries distributed across tours?"
- **Data source:** Kalendereinträge
- **Calculation:** Count entries per tour value (tour_1, tour_2, tour_3)
- **Display:** Three horizontal bars with tour colors, count labels
- **Mobile simplification:** Same layout, slightly narrower bars

### Lists/Tables

**Teilnehmer (Participants)**
- Purpose: Quick reference for who's in the system
- Source: Benutzerverwaltung
- Fields shown: Vorname + Nachname (combined), Versammlung (as subtitle), Pionier (as badge if true)
- Mobile style: Simple list with name and details
- Desktop style: List inside a card with ScrollArea
- Sort: Alphabetically by Nachname
- Limit: All (scrollable)

**Wochenplan (Weekly Calendar - Desktop only sidebar)**
- Purpose: See current week's schedule from Wochenkalender app
- Source: Wochenkalender (joined with Benutzerverwaltung for participant name)
- Fields shown: datum_von (date + time), tour badge, teilnehmer_2 name
- Desktop style: Compact list in sidebar card
- Sort: By datum_von ascending
- Limit: Current week entries

### Primary Action Button (REQUIRED!)

- **Label:** "Neuer Eintrag" (with CalendarPlus icon from lucide)
- **Action:** add_record
- **Target app:** Kalendereinträge
- **What data:** The form contains:
  - Datum von (date input + time input) → combined as `YYYY-MM-DDTHH:MM`
  - Datum bis (date input + time input) → combined as `YYYY-MM-DDTHH:MM`
  - Teilnehmer 1 (Select dropdown populated from Benutzerverwaltung records, showing "Vorname Nachname", value is record_id → converted to applookup URL via createRecordUrl)
  - Teilnehmer 2 (Same as above)
  - Tour (Select dropdown with options: Tour 1, Tour 2, Tour 3 from lookup_data)
- **Mobile position:** header (circular "+" icon button, 44px)
- **Desktop position:** header (full button with text + icon)
- **Why this action:** Creating new calendar entries is the primary workflow - coordinators constantly add upcoming appointments

---

## 7. Visual Details

### Border Radius
- Cards: rounded (12px) - `--radius: 0.75rem`
- Buttons: rounded (8px)
- Badges/Pills: pill (16px)
- Tour color bars on timeline: 4px left border with 8px border-radius on the card

### Shadows
- Cards at rest: subtle (`0 1px 3px hsl(200 15% 15% / 0.04), 0 1px 2px hsl(200 15% 15% / 0.06)`)
- Cards on hover: elevated (`0 4px 12px hsl(200 15% 15% / 0.08), 0 2px 4px hsl(200 15% 15% / 0.04)`)
- Floating action button (mobile): `0 4px 16px hsl(153 40% 40% / 0.3)`

### Spacing
- Spacious - generous whitespace between sections (32px), comfortable padding inside cards (20px), 12px gaps between timeline entries
- Section titles have 24px margin-top, 12px margin-bottom

### Animations
- **Page load:** Subtle fade-in (opacity 0→1 over 300ms) with slight upward translate (8px)
- **Hover effects:** Timeline entries lift with shadow transition (200ms ease), buttons scale slightly (1.02, 150ms)
- **Tap feedback:** Active state with slight scale down (0.98) on buttons

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.75rem;
  --background: hsl(40 20% 98%);
  --foreground: hsl(200 15% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(200 15% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(200 15% 15%);
  --primary: hsl(153 40% 40%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 15% 96%);
  --secondary-foreground: hsl(200 15% 15%);
  --muted: hsl(40 15% 96%);
  --muted-foreground: hsl(200 10% 45%);
  --accent: hsl(153 30% 95%);
  --accent-foreground: hsl(200 15% 15%);
  --destructive: hsl(0 70% 55%);
  --border: hsl(40 15% 90%);
  --input: hsl(40 15% 90%);
  --ring: hsl(153 40% 40%);
  --chart-1: hsl(153 35% 45%);
  --chart-2: hsl(35 70% 55%);
  --chart-3: hsl(210 45% 55%);
  --chart-4: hsl(153 40% 40%);
  --chart-5: hsl(35 60% 50%);
  --sidebar: hsl(40 15% 96%);
  --sidebar-foreground: hsl(200 15% 15%);
  --sidebar-primary: hsl(153 40% 40%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(153 30% 95%);
  --sidebar-accent-foreground: hsl(200 15% 15%);
  --sidebar-border: hsl(40 15% 90%);
  --sidebar-ring: hsl(153 40% 40%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans, weights 300-700)
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (single column, stats row, timeline hero)
- [ ] Desktop layout matches Section 5 (two-column asymmetric, 65/35 split)
- [ ] Hero element (upcoming entries timeline) is prominent as described
- [ ] Tour colors (sage green, warm amber, soft blue) applied consistently
- [ ] Primary action "Neuer Eintrag" works with Dialog form
- [ ] All three data sources used (Kalendereinträge, Benutzerverwaltung, Wochenkalender)
- [ ] Loading, empty, and error states handled
- [ ] Dates formatted with date-fns using de locale
- [ ] applookup fields resolved using extractRecordId
- [ ] Select components never use value=""
