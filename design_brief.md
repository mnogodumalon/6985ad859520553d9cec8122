# Design Brief: Gemeinsamer Terminkalender

## 1. App Analysis

### What This App Does
This is a shared calendar system ("Gemeinsamer Terminkalender") for coordinating tour schedules among team members. It manages users (Benutzerverwaltung), calendar entries (Kalendereintraege) that assign pairs of participants to tours on specific dates/times, and a weekly calendar view (Wochenkalender) for recurring weekly scheduling. The core workflow revolves around scheduling who goes on which tour (Tour 1, 2, or 3) and when.

### Who Uses This
Team coordinators or administrators who need to schedule and oversee tour assignments for their group members. They manage which members of their "Versammlung" (assembly/congregation) are assigned to which tours and dates. They need to see the schedule at a glance, know who's working when, and quickly create new assignments.

### The ONE Thing Users Care About Most
**The upcoming schedule** - specifically, which tours are happening soon, who's assigned, and whether any slots need filling. The user opens this dashboard to answer: "What's coming up next, and is everyone assigned?"

### Primary Actions (IMPORTANT!)
1. **Neuen Termin erstellen** (Create new calendar entry) - This is the #1 action. Users constantly need to assign participants to tours on specific dates.
2. View upcoming entries by tour
3. Check participant assignment coverage

---

## 2. What Makes This Design Distinctive

### Visual Identity
A calm, structured layout inspired by professional scheduling tools like Calendly or Notion calendars. The design uses a cool slate-blue base with a distinctive teal accent that signals "organization and clarity." The warm off-white background with subtle blue undertones creates a professional yet approachable atmosphere - this feels like a well-organized team workspace, not a sterile corporate tool.

### Layout Strategy
The layout uses an **asymmetric approach** with a dominant hero element. The hero is a "Nachste Termine" (Upcoming Appointments) timeline that takes visual priority because it answers the #1 question: "What's next?" Below it, three tour columns show assignment distribution, creating a natural visual grouping that mirrors how users think about their data (by tour). The asymmetry comes from the hero section being visually larger and more prominent than the supporting statistics and tour breakdown below.

### Unique Element
The **tour indicator badges** use a distinctive pill shape with a colored left border that matches each tour's color (teal for Tour 1, amber for Tour 2, slate-violet for Tour 3). This color-coding carries through the entire dashboard - from the overview chart to individual calendar entries - creating a visual language that makes tour identification instant without reading text.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has a geometric, modern quality with slightly rounded terminals that feels organized yet friendly - perfect for a scheduling tool used by non-technical people. Its wide weight range (300-800) enables strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 25% 97%)` | `--background` |
| Main text | `hsl(215 25% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 15%)` | `--card-foreground` |
| Borders | `hsl(214 20% 90%)` | `--border` |
| Primary action (teal) | `hsl(173 58% 39%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(173 40% 93%)` | `--accent` |
| Muted background | `hsl(210 20% 95%)` | `--muted` |
| Muted text | `hsl(215 15% 47%)` | `--muted-foreground` |
| Success/positive | `hsl(160 60% 40%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

**Tour Colors (used in badges and charts):**
- Tour 1: `hsl(173 58% 39%)` (teal - matches primary)
- Tour 2: `hsl(38 92% 50%)` (warm amber)
- Tour 3: `hsl(255 40% 55%)` (slate-violet)

### Why These Colors
The cool slate-blue background (`hsl(210 25% 97%)`) with white cards creates depth without harshness. The teal primary (`hsl(173 58% 39%)`) is distinctive without being loud - it signals "action" clearly while feeling calm and organized. The three tour colors are designed to be instantly distinguishable from each other even for colorblind users (teal=cool, amber=warm, violet=neutral), and each has enough saturation to work as a small badge accent.

### Background Treatment
The page background is a subtle cool-tinted off-white (`hsl(210 25% 97%)`), creating gentle contrast with the pure white cards. This is intentionally not pure white - the slight blue tint creates a calm, professional atmosphere that reduces eye strain during extended scheduling sessions.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile prioritizes vertical scanning with a clear hero at top. The hero section (upcoming appointments) dominates the first viewport, answering the primary question immediately. Tour breakdown and stats follow as compact, horizontally scrollable sections. Visual interest comes from the hero's generous sizing and the tour-colored accents in the list items.

### What Users See (Top to Bottom)

**Header:**
- App title "Terminkalender" in 600 weight, 20px on the left
- A teal "+" circular FAB-style button on the right (primary action: new entry)
- Below the title: a subtle muted text showing the current date formatted as "Montag, 6. Februar 2026"

**Hero Section (The FIRST thing users see):**
- Section heading "Nachste Termine" in 600 weight, 16px, muted-foreground
- A vertical list of the next 5 upcoming calendar entries (Kalendereintraege), each as a compact row:
  - Left: colored 4px border-left matching the tour color
  - Left side: Date (dd.MM) in 700 weight 14px, time (HH:MM) in 300 weight 12px below it
  - Center: Participant names "Vorname Nachname & Vorname Nachname" in 500 weight 14px
  - Right: Tour badge pill (e.g., "Tour 1") with tour-colored background at 10% opacity and tour-colored text, 12px 500 weight
- Each row has a subtle bottom border separator
- Takes about 55% of the viewport height
- Why hero: Users open the app to see "what's coming up" - this answers that instantly

**Section 2: Tour-Ubersicht (Tour Overview)**
- Section heading "Tour-Ubersicht" in 600 weight, 16px
- Three compact horizontal cards in a row (scrollable if needed), each showing:
  - Tour name (e.g., "Tour 1") with tour-colored top border (3px)
  - Count of entries this month below in 800 weight, 28px
  - Label "Termine" in 300 weight, 12px, muted
- Each card is ~100px wide, equal spacing

**Section 3: Teilnehmer (Participants)**
- Section heading "Teilnehmer" in 600 weight, 16px
- Compact list of all users from Benutzerverwaltung
- Each row: Full name (Vorname Nachname) in 500 weight, Versammlung as muted badge on right
- Shows count of assigned entries next to each name as a small number badge

**Bottom Navigation / Action:**
- Fixed bottom: No permanent nav bar. The "+" FAB in the header is sufficient for mobile.
- When tapped, the "+" opens a full-screen dialog/sheet for creating a new Kalendereintrag.

### Mobile-Specific Adaptations
- Tour Overview cards arranged horizontally in a scrollable row instead of grid
- Upcoming entries show abbreviated dates (dd.MM instead of full date)
- Participant list collapses Versammlung into a small badge
- Chart is hidden on mobile (replaced by the compact Tour Overview cards which convey the same information more efficiently)

### Touch Targets
- All list items minimum 48px height for comfortable tapping
- FAB button 48x48px minimum
- Tour overview cards have generous 12px padding

### Interactive Elements
- Tapping an upcoming entry opens a detail sheet showing full datetime range, both participants' full details, and the tour assignment
- Tapping a participant in the Teilnehmer list filters the upcoming list to show only their entries

---

## 5. Desktop Layout

### Overall Structure
Two-column layout with a 2:1 ratio (roughly 65% / 35%). The left column contains the hero (upcoming entries as a richer table-like list) and the tour distribution bar chart below it. The right column contains the tour overview stats cards (stacked vertically), the participant list, and the primary action button. The eye flows: top-left hero (upcoming entries) -> right column stats -> bottom-left chart -> right column participant list.

### Section Layout

**Top Bar (full width):**
- Left: "Gemeinsamer Terminkalender" in 700 weight, 24px
- Right: Current date in muted-foreground, 14px, and the primary action button "Neuer Termin" (teal, with a Plus icon) as a standard button

**Left Column (65%):**

*Upcoming Entries (Hero)*
- Card with heading "Nachste Termine" in 600 weight, 16px
- Table-like rows for the next 8 upcoming entries:
  - Column 1: Date formatted as "Mo, 06.02." in 600 weight, and time "14:00 - 16:30" in 400 weight below
  - Column 2: Tour badge (pill with tour color)
  - Column 3: Teilnehmer 1 name
  - Column 4: Teilnehmer 2 name (or "—" if unassigned, in muted color)
- Rows have hover:bg-muted transition for interactivity
- This card takes priority with more vertical space

*Tour Distribution Chart*
- Card with heading "Termine pro Tour" in 600 weight, 16px
- Horizontal bar chart (recharts BarChart) showing count of entries per tour
- Three bars, each in their tour color
- X-axis: Tour names, Y-axis: count
- Height: 220px
- Clean, minimal - no grid lines, just the bars and labels

**Right Column (35%):**

*Tour Overview Stats (3 stacked cards)*
- Three small cards, one per tour, stacked vertically with 12px gap
- Each card has:
  - Left border 4px in tour color
  - Tour name in 600 weight, 14px
  - Large count number in 800 weight, 32px
  - "Termine diesen Monat" in 300 weight, 12px, muted

*Participant List*
- Card with heading "Teilnehmer" in 600 weight, 16px
- List of users with:
  - Name (Vorname Nachname) in 500 weight
  - Versammlung as muted text
  - Small circular badge showing their assignment count
- Scrollable if more than 6 participants

### What Appears on Hover
- Upcoming entry rows: subtle background change to muted, cursor pointer
- Tour stat cards: gentle shadow elevation (shadow-sm -> shadow-md)
- Participant rows: subtle background highlight

### Clickable/Interactive Areas
- Clicking an upcoming entry row opens a Dialog with the full entry details (all fields, edit/delete options)
- Clicking a participant name filters the upcoming entries list to show only entries where that person is teilnehmer_1 or teilnehmer_2

---

## 6. Components

### Hero KPI
- **Title:** Nachste Termine
- **Data source:** Kalendereintraege app, joined with Benutzerverwaltung for participant names
- **Calculation:** Filter entries where datum_von >= today, sort by datum_von ascending, take first 5 (mobile) or 8 (desktop)
- **Display:** List of upcoming entries with date/time, participant names resolved via applookup, and tour badge
- **Context shown:** Tour color-coding provides instant visual grouping; unassigned slots (null teilnehmer) are highlighted
- **Why this is the hero:** The primary use case is answering "what's coming up and who's assigned" - this directly answers both questions in one glance

### Secondary KPIs

**Termine pro Tour (Entries per Tour)**
- Source: Kalendereintraege
- Calculation: Count entries grouped by `tour` field for current month
- Format: number
- Display: Three stacked cards on desktop, horizontal scroll cards on mobile, each with tour-colored left border

**Teilnehmer-Ubersicht (Participant Overview)**
- Source: Benutzerverwaltung joined with Kalendereintraege
- Calculation: List all users, count how many entries each appears in (as teilnehmer_1 or teilnehmer_2)
- Format: Name + count badge
- Display: Scrollable list within a card

### Chart
- **Type:** Bar chart - because we're comparing discrete categories (3 tours), bar charts are the clearest way to show relative distribution
- **Title:** Termine pro Tour
- **What question it answers:** "Are tours evenly distributed, or is one tour overloaded?" This helps coordinators balance the schedule.
- **Data source:** Kalendereintraege
- **X-axis:** Tour name (Tour 1, Tour 2, Tour 3)
- **Y-axis:** Count of entries
- **Colors:** Each bar uses its tour color (teal, amber, violet)
- **Mobile simplification:** Chart is replaced by the three compact tour stat cards which show the same counts more space-efficiently

### Lists/Tables

**Nachste Termine (Upcoming Entries)**
- Purpose: The core view - shows what's coming up with full assignment details
- Source: Kalendereintraege joined with Benutzerverwaltung (for participant names via applookup)
- Fields shown: datum_von (date + time), datum_bis (end time), tour, teilnehmer_1 name, teilnehmer_2 name
- Mobile style: Compact list with colored left border, abbreviated dates
- Desktop style: Table-like rows with columns for date, tour badge, participant 1, participant 2
- Sort: By datum_von ascending (soonest first)
- Limit: 5 on mobile, 8 on desktop

**Teilnehmer (Participants)**
- Purpose: Quick reference for who's available and how busy they are
- Source: Benutzerverwaltung
- Fields shown: vorname, nachname, versammlung, assignment count
- Mobile style: Simple list with name and badge
- Desktop style: List in card with hover state
- Sort: By nachname alphabetically
- Limit: All (scrollable)

### Primary Action Button (REQUIRED!)

- **Label:** "Neuer Termin" (desktop), "+" icon (mobile FAB)
- **Action:** add_record
- **Target app:** Kalendereintraege
- **What data:** The form contains:
  - `datum_von`: Date + time picker (date/datetimeminute format: YYYY-MM-DDTHH:MM)
  - `datum_bis`: Date + time picker (date/datetimeminute format: YYYY-MM-DDTHH:MM)
  - `teilnehmer_1`: Select dropdown populated from Benutzerverwaltung records (stores applookup URL)
  - `teilnehmer_2`: Select dropdown populated from Benutzerverwaltung records (stores applookup URL)
  - `tour`: Select dropdown with options Tour 1, Tour 2, Tour 3 (lookup keys: tour_1, tour_2, tour_3)
- **Mobile position:** header (circular "+" button in top-right)
- **Desktop position:** header (right-aligned "Neuer Termin" button with Plus icon)
- **Why this action:** Creating new calendar entries is the most frequent action - coordinators are constantly scheduling new tour assignments as dates approach

---

## 7. Visual Details

### Border Radius
Rounded (8px / `--radius: 0.5rem`) - friendly but not childish, appropriate for a professional scheduling tool

### Shadows
Subtle - cards use `shadow-sm` by default. On hover, cards elevate to `shadow-md` with a smooth transition. This creates a gentle sense of depth without being dramatic.

### Spacing
Spacious - generous padding inside cards (24px), 16px gap between cards. The spacious feel reinforces the "organized, not cluttered" personality. Content within cards uses 12px vertical spacing between items.

### Animations
- **Page load:** Subtle fade-in (opacity 0 -> 1 over 300ms) for the entire dashboard
- **Hover effects:** Cards: `transition-shadow duration-200`, rows: `transition-colors duration-150`
- **Tap feedback:** Active state scales down slightly (scale-[0.98]) on buttons for tactile feedback

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.5rem;
  --background: hsl(210 25% 97%);
  --foreground: hsl(215 25% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 15%);
  --primary: hsl(173 58% 39%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 20% 95%);
  --secondary-foreground: hsl(215 25% 15%);
  --muted: hsl(210 20% 95%);
  --muted-foreground: hsl(215 15% 47%);
  --accent: hsl(173 40% 93%);
  --accent-foreground: hsl(215 25% 15%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(214 20% 90%);
  --input: hsl(214 20% 90%);
  --ring: hsl(173 58% 39%);
  --chart-1: hsl(173 58% 39%);
  --chart-2: hsl(38 92% 50%);
  --chart-3: hsl(255 40% 55%);
  --chart-4: hsl(173 40% 50%);
  --chart-5: hsl(38 70% 60%);
  --sidebar: hsl(210 25% 97%);
  --sidebar-foreground: hsl(215 25% 15%);
  --sidebar-primary: hsl(173 58% 39%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(173 40% 93%);
  --sidebar-accent-foreground: hsl(215 25% 15%);
  --sidebar-border: hsl(214 20% 90%);
  --sidebar-ring: hsl(173 58% 39%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font "Plus Jakarta Sans" loaded from URL above
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (vertical flow, hero upcoming entries, horizontal tour cards, FAB)
- [ ] Desktop layout matches Section 5 (2:1 two-column, hero left, stats right, chart bottom-left)
- [ ] Hero element (Upcoming Entries) is prominent as described
- [ ] Tour color-coding consistent throughout (teal=Tour 1, amber=Tour 2, violet=Tour 3)
- [ ] Primary action opens dialog with all required form fields
- [ ] applookup fields resolved correctly for participant names
- [ ] Dates formatted correctly (dd.MM.yyyy for display, YYYY-MM-DDTHH:MM for API)
- [ ] Colors create the calm, organized mood described in Section 2
