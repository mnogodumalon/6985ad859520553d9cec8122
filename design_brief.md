# Design Brief: Gemeinsamer Terminkalender

## 1. App Analysis

### What This App Does
This is a shared calendar system ("Gemeinsamer Terminkalender") for organizing field service tours. It manages participants (Benutzerverwaltung), weekly schedules (Wochenkalender), and calendar entries (Kalendereintraege). Participants are assigned to tours (Tour 1, 2, or 3) with specific dates/times, and they belong to different congregations (Versammlungen) in the Bayreuth area. The system pairs participants together for shared activities.

### Who Uses This
A coordinator or organizer who manages the scheduling of field service activities. They need to quickly see who is scheduled when, which tours are covered, and add new calendar entries. They are NOT tech-savvy - they want a clear, visual overview of their calendar data without complexity.

### The ONE Thing Users Care About Most
**Upcoming scheduled entries** - "What's happening this week and who is assigned?" The user opens this dashboard to get an immediate overview of upcoming tours, see which participants are paired together, and spot any gaps in the schedule.

### Primary Actions (IMPORTANT!)
1. **Neuen Eintrag erstellen** (Create new calendar entry) - This is the #1 action. The coordinator frequently adds new tour assignments pairing two participants on a specific date and tour.
2. View upcoming schedule at a glance
3. See participant activity and tour distribution

---

## 2. What Makes This Design Distinctive

### Visual Identity
A warm, approachable calendar dashboard that feels like a well-organized planner rather than a cold data table. The soft slate-blue accent on a warm ivory background creates a trustworthy, calm atmosphere - fitting for a community scheduling tool. The design avoids the clinical feel of typical calendar apps and instead feels personal and organized, like a beautifully kept notebook.

### Layout Strategy
- **Asymmetric layout on desktop**: A dominant left column (65%) holds the hero weekly timeline and upcoming entries list, while a narrower right column (35%) shows participant stats and tour distribution. This creates natural reading flow from the important schedule data to supporting context.
- **Hero element**: The "Diese Woche" (This Week) section dominates the top with a large counter showing how many entries are scheduled this week, using oversized typography (56px number) against a subtle colored background panel.
- **Visual interest**: Created through size variation between the hero counter and compact stat badges, through the timeline-style list of upcoming entries (not a table), and through a colorful but subtle tour distribution bar chart.
- **Secondary elements** use compact card treatments with muted backgrounds, never competing with the hero.

### Unique Element
The upcoming entries list uses a **timeline-style layout** with a thin vertical connector line on the left side, date badges that break the line, and participant pairs shown as paired avatar initials. This creates a visual rhythm that feels like a real planner/agenda, not a generic data list. Each entry shows the tour as a small colored pill badge (Tour 1 = slate blue, Tour 2 = warm amber, Tour 3 = sage green).

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has a friendly, geometric character with slightly rounded terminals that feels approachable and modern without being childish. Perfect for a community-facing tool where readability and warmth matter. Its weight range (300-800) allows strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(220 20% 18%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(220 20% 18%)` | `--card-foreground` |
| Borders | `hsl(220 15% 90%)` | `--border` |
| Primary action | `hsl(215 55% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(215 40% 95%)` | `--accent` |
| Muted background | `hsl(220 15% 95%)` | `--muted` |
| Muted text | `hsl(220 10% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(152 45% 42%)` | (component use) |
| Error/negative | `hsl(0 65% 52%)` | `--destructive` |

**Tour Colors (used in badges and chart):**
- Tour 1: `hsl(215 55% 45%)` (slate blue - same as primary)
- Tour 2: `hsl(35 75% 55%)` (warm amber)
- Tour 3: `hsl(152 35% 48%)` (sage green)

### Why These Colors
The warm ivory background (`hsl(40 25% 97%)`) avoids the cold sterility of pure white and creates a welcoming atmosphere. The slate blue primary (`hsl(215 55% 45%)`) is professional yet approachable - not the generic bright blue of default UI kits. It carries authority for the primary action button while feeling calm. The muted palette keeps everything peaceful, which suits a community scheduling context.

### Background Treatment
Subtle warm ivory background (`hsl(40 25% 97%)`) across the entire page. Cards are pure white with very subtle shadows, creating a gentle layered effect. No gradients on the page background - the warmth comes from the off-white tone itself.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Single column, content-first. The hero stat takes the full width at the top and uses large typography to create immediate visual impact. Below it, content flows naturally in a vertical timeline. The primary action button is fixed at the bottom for thumb accessibility. Visual interest comes from the oversized hero number contrasting with compact list items below.

### What Users See (Top to Bottom)

**Header:**
Sticky top bar with the app title "Terminkalender" in 600 weight, 18px. On the right, a small filter icon button to filter by tour (dropdown). Background: white with subtle bottom border. Height: 56px.

**Hero Section (The FIRST thing users see):**
A full-width panel with the warm accent background (`hsl(215 40% 95%)`), 24px padding. Contains:
- Label: "Diese Woche" in 13px, 500 weight, muted text color, uppercase tracking-wide
- Number: Count of calendar entries for the current week, displayed in **56px, 800 weight**, primary color (`hsl(215 55% 45%)`)
- Subtext: "Eintraege geplant" in 14px, 400 weight, muted text
- Below the number: A row of 3 small pill badges showing per-tour counts (e.g., "Tour 1: 4" "Tour 2: 3" "Tour 3: 2"), each in its tour color

This hero answers the immediate question: "How busy is this week?"

**Section 2: Naechste Termine (Upcoming Entries)**
A timeline-style list showing the next 10 upcoming calendar entries (sorted by datum_von ascending, only future dates). Each entry is a card-like row:
- Left: Thin vertical line (2px, border color) connecting entries, interrupted by a date badge
- Date badge: Small rounded rectangle with the day (e.g., "Mo 12.02.") in 12px, 600 weight
- Time: "14:00 - 16:00" in 13px, muted text
- Participants: Two names shown as "Max M. & Anna S." in 14px, 500 weight
- Tour badge: Small pill with tour name and tour color background at 15% opacity, tour color text
- If no participants linked, show "Nicht zugewiesen" in muted italic

Entries are grouped by date with the date badge appearing once per day.

**Section 3: Teilnehmer-Uebersicht (Participant Overview)**
A compact horizontal scrollable row of participant cards (not full cards - just compact chips). Each chip shows:
- Initials circle (32px, accent background, primary text)
- First name + last initial (e.g., "Max M.") in 13px
- Small number below: count of their upcoming entries

Maximum 20 participants shown. This gives a quick glance at who is active.

**Section 4: Tour-Verteilung (Tour Distribution)**
A simple horizontal stacked bar showing the distribution of entries across Tour 1, 2, 3 for the current month. Each segment uses the respective tour color. Below the bar, three labels with counts. Uses recharts BarChart with horizontal layout, single bar, stacked.

**Bottom Navigation / Action:**
Fixed bottom button: "Neuer Eintrag" (New Entry), full-width minus 16px margins, 52px height, primary color background, white text, 600 weight, 16px text, rounded-xl (16px radius). Has a small "+" icon (lucide Plus) on the left of the text.

### Mobile-Specific Adaptations
- Hero section is more compact (no side padding wasted)
- Participant overview uses horizontal scroll instead of grid
- Timeline entries are slightly more compact (less vertical padding)
- Tour distribution chart is simplified to a single stacked bar instead of grouped bars

### Touch Targets
- All interactive list items: minimum 48px height
- Bottom action button: 52px height
- Filter button in header: 44x44px tap area
- Participant chips: 44px height

### Interactive Elements
- Tapping a calendar entry in the timeline could show a detail sheet (bottom drawer) with full participant info, but this is optional enhancement
- Tour filter in header filters all sections by selected tour

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout within a max-width container (1200px, centered):
- **Left column (63%)**: Hero stats + Upcoming entries timeline
- **Right column (37%)**: Tour distribution chart + Participant list

The eye flows: Hero number (top-left) -> Tour pills -> Timeline list -> Tour chart (right) -> Participants (right bottom).

A top header bar spans full width with the title and primary action button.

### Section Layout

**Top Header (full width):**
- Left: "Terminkalender" title in 24px, 700 weight
- Right: Primary action button "Neuer Eintrag" with Plus icon, primary color, pill-shaped (rounded-full), 14px text, 600 weight, padding 12px 24px. Next to it: a tour filter Select dropdown.

**Left Column - Top: Hero Section**
A card with accent background (`hsl(215 40% 95%)`), 32px padding, rounded-xl. Contains:
- "Diese Woche" label: 13px, 500 weight, uppercase, tracking-wide, muted text
- Count number: **64px, 800 weight**, primary color
- "Eintraege geplant" subtext: 15px, 400 weight, muted text
- Three tour pill badges in a row below, same as mobile but slightly larger (14px text)

**Left Column - Below Hero: Naechste Termine**
Card with white background, subtle shadow. Header: "Naechste Termine" in 16px, 600 weight, with a "Alle anzeigen" muted link on the right.

Timeline list identical to mobile but with more horizontal space:
- Date badge on the left
- Time, participant names, and tour badge on the right in a single row
- On hover: row background changes to accent color at 50% opacity for subtle highlight
- Shows 10 upcoming entries

**Right Column - Top: Tour-Verteilung**
Card with white background. Title: "Tour-Verteilung" in 16px, 600 weight. Subtitle: "Dieser Monat" in 13px, muted.

A vertical bar chart (recharts BarChart) with 3 bars (one per tour), each in its tour color. Y-axis: count. X-axis: Tour 1, Tour 2, Tour 3. Height: 200px. Clean, minimal grid lines. On hover over a bar: tooltip shows exact count.

**Right Column - Below Chart: Aktive Teilnehmer**
Card with white background. Title: "Aktive Teilnehmer" in 16px, 600 weight.

A compact list of participants (not chips like mobile, but small rows):
- Each row: Initials circle (36px) + Full name + upcoming entry count as a small muted badge on the right
- Sorted by entry count descending (most active first)
- Show up to 15 participants
- On hover: row gets subtle accent background

### What Appears on Hover
- Timeline entries: subtle accent background highlight
- Participant rows: subtle accent background
- Tour chart bars: tooltip with count
- Primary action button: slight darkening of primary color

### Clickable/Interactive Areas
- Tour filter dropdown filters all displayed data by tour
- "Alle anzeigen" link on upcoming entries section (scrolls or expands to show more)

---

## 6. Components

### Hero KPI
- **Title:** "Diese Woche"
- **Data source:** Kalendereintraege app - filter entries where `datum_von` falls within the current week (Monday to Sunday)
- **Calculation:** Count of entries for this week
- **Display:** Oversized number (56px mobile / 64px desktop), 800 weight, primary color. Surrounded by accent background panel with generous padding.
- **Context shown:** Three tour pill badges below the number showing per-tour breakdown (e.g., "Tour 1: 4")
- **Why this is the hero:** The coordinator's first question is always "How many activities do we have this week?" This immediately answers it with a glanceable number.

### Secondary KPIs
These are shown as the tour breakdown pills within the hero section, NOT as separate cards:

**Tour 1 Count**
- Source: Kalendereintraege (filtered to current week + tour === "tour_1")
- Calculation: Count
- Format: "Tour 1: {count}"
- Display: Small pill badge, Tour 1 color background at 15% opacity, Tour 1 color text

**Tour 2 Count**
- Source: Kalendereintraege (filtered to current week + tour === "tour_2")
- Calculation: Count
- Format: "Tour 2: {count}"
- Display: Small pill badge, Tour 2 color background at 15% opacity, Tour 2 color text

**Tour 3 Count**
- Source: Kalendereintraege (filtered to current week + tour === "tour_3")
- Calculation: Count
- Format: "Tour 3: {count}"
- Display: Small pill badge, Tour 3 color background at 15% opacity, Tour 3 color text

### Chart: Tour-Verteilung
- **Type:** Vertical bar chart (BarChart from recharts) - bar chart because we're comparing discrete categories (3 tours), and vertical bars are the most intuitive comparison format
- **Title:** "Tour-Verteilung"
- **What question it answers:** "Are tours evenly distributed this month, or is one overloaded?"
- **Data source:** Kalendereintraege, filtered to current month
- **X-axis:** Tour name (Tour 1, Tour 2, Tour 3)
- **Y-axis:** Number of entries (integer)
- **Bar colors:** Each bar uses its respective tour color
- **Mobile simplification:** Replaced with a single horizontal stacked bar (more compact), with labels below showing counts per tour

### Lists: Naechste Termine (Upcoming Entries Timeline)

**Purpose:** Show what's coming up so the coordinator can verify the schedule
**Source:** Kalendereintraege app, with participant names resolved from Benutzerverwaltung via applookup
**Fields shown:**
- `datum_von` and `datum_bis` formatted as date + time range (e.g., "Mo 12.02. | 14:00 - 16:00")
- `teilnehmer_1` and `teilnehmer_2` resolved to names from Benutzerverwaltung (display as "Vorname N.")
- `tour` displayed as colored pill badge with tour name
**Date formatting:** Use `date-fns` with German locale. Day format: "EE dd.MM." (e.g., "Mo 12.02."). Time format: "HH:mm" (e.g., "14:00")
**Mobile style:** Timeline with vertical connector line
**Desktop style:** Same timeline inside a card
**Sort:** By `datum_von` ascending (nearest first)
**Filter:** Only future entries (datum_von >= today)
**Limit:** 10 entries
**Grouping:** Group entries by date - show date badge once, then all entries for that date below

### Lists: Aktive Teilnehmer (Active Participants)

**Purpose:** Quick overview of who is active and how often they're scheduled
**Source:** Benutzerverwaltung (all users), cross-referenced with Kalendereintraege to count upcoming entries per participant
**Fields shown:**
- Initials (first letter of vorname + first letter of nachname)
- Full name (vorname + nachname)
- Count of upcoming entries where they appear as teilnehmer_1 or teilnehmer_2
**Mobile style:** Horizontal scrollable chips with initials + first name + count
**Desktop style:** Vertical list rows with initials circle + full name + count badge
**Sort:** By upcoming entry count descending
**Limit:** Mobile: 20 chips, Desktop: 15 rows

### Primary Action Button (REQUIRED!)

- **Label:** "Neuer Eintrag" (with Plus icon from lucide-react)
- **Action:** add_record
- **Target app:** Kalendereintraege
- **What data:** The form should contain:
  - `datum_von`: Date+time picker (required) - label "Von"
  - `datum_bis`: Date+time picker (required) - label "Bis"
  - `teilnehmer_1`: Select dropdown populated from Benutzerverwaltung records (show "Vorname Nachname") - label "Teilnehmer 1"
  - `teilnehmer_2`: Select dropdown populated from Benutzerverwaltung records (show "Vorname Nachname") - label "Teilnehmer 2"
  - `tour`: Select dropdown with options Tour 1, Tour 2, Tour 3 - label "Tour"
- **Form implementation:** Opens as a Dialog (modal) on desktop, full-screen Sheet on mobile
- **On submit:** Call `LivingAppsService.createKalendereintraegeEntry()` with the form data. For teilnehmer fields, use `createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, selectedRecordId)` to create the applookup URL. For datum fields, format as `YYYY-MM-DDTHH:MM` (NO seconds!). For tour, use the key value (e.g., "tour_1").
- **After submit:** Show success toast (sonner), close the dialog, and refetch all data
- **Mobile position:** Fixed bottom button, full width with 16px side margins
- **Desktop position:** In the header bar, right-aligned
- **Why this action:** The coordinator's primary job is creating new schedule entries. Making this one-tap accessible from the dashboard saves them from navigating to a separate form. This is the #1 most frequent action.

---

## 7. Visual Details

### Border Radius
Rounded: `0.75rem` (12px) for cards, `1rem` (16px) for the hero panel, `9999px` for pill badges and the primary action button on desktop. Set `--radius: 0.75rem`.

### Shadows
Subtle: Cards use `0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)`. The hero section has no shadow (uses colored background instead). The fixed bottom button on mobile has `0 -4px 12px rgba(0, 0, 0, 0.08)` for separation from content.

### Spacing
Spacious: 24px gap between major sections, 16px padding inside cards on mobile, 24px on desktop. 32px padding for the hero section. The generous spacing creates breathing room and a calm, organized feel.

### Animations
- **Page load:** Subtle fade-in and slide-up for cards (200ms, staggered by 50ms per card). Use CSS `@keyframes` with `animation-fill-mode: both`.
- **Hover effects:** Smooth background color transition on list items and buttons (150ms ease).
- **Tap feedback:** Scale to 0.98 on press for buttons (100ms).
- **Number counter:** The hero number fades in (no counter animation - keep it simple).

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.75rem;
  --background: hsl(40 25% 97%);
  --foreground: hsl(220 20% 18%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 20% 18%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 20% 18%);
  --primary: hsl(215 55% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(220 15% 95%);
  --secondary-foreground: hsl(220 20% 18%);
  --muted: hsl(220 15% 95%);
  --muted-foreground: hsl(220 10% 50%);
  --accent: hsl(215 40% 95%);
  --accent-foreground: hsl(215 55% 45%);
  --destructive: hsl(0 65% 52%);
  --border: hsl(220 15% 90%);
  --input: hsl(220 15% 90%);
  --ring: hsl(215 55% 45%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded: Plus Jakarta Sans (300-800 weights) from Google Fonts
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (single column, fixed bottom button, timeline list)
- [ ] Desktop layout matches Section 5 (two-column asymmetric, header with action button)
- [ ] Hero element uses 56px/64px oversized number with accent background
- [ ] Tour colors are consistent (blue, amber, green) across all components
- [ ] Timeline list has vertical connector line and date grouping
- [ ] Participant data is resolved from Benutzerverwaltung via extractRecordId()
- [ ] Primary action opens a form dialog/sheet to create Kalendereintraege
- [ ] Form uses correct date format YYYY-MM-DDTHH:MM (no seconds)
- [ ] All loading, empty, and error states are handled
- [ ] Tour filter works across all sections
- [ ] The design feels warm and approachable, not clinical
