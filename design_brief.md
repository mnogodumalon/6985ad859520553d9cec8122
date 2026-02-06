# Design Brief: Gemeinsamer Terminkalender

## 1. App Analysis

### What This App Does
This is a **shared calendar system** ("Gemeinsamer Terminkalender") used to coordinate schedules among group members. It manages three types of data: users/participants (Benutzerverwaltung), weekly schedules (Wochenkalender), and individual calendar entries (Kalendereintraege). Both calendar types support assigning participants from the user pool and categorizing entries into one of three "Tours" (Tour 1, Tour 2, Tour 3). The tours likely represent different routes, shifts, or service areas that participants are assigned to.

### Who Uses This
Community or congregation members ("Versammlung" field suggests a religious congregation) who coordinate shared service schedules. They need to quickly see who is assigned where and when, and add new calendar entries for upcoming service periods. These are non-technical users who think in terms of "When is my next assignment?" and "Who is on Tour 2 this week?"

### The ONE Thing Users Care About Most
**Upcoming assignments** - Users want to see at a glance what's happening this week and next: which tours are scheduled, who is assigned, and when. The timeline of upcoming events is the heartbeat of this app.

### Primary Actions (IMPORTANT!)
1. **Neuen Termin eintragen** (Add new calendar entry) - Primary Action Button. This is the most frequent action: scheduling a new assignment with date, participants, and tour.
2. View upcoming schedule by tour
3. See participant assignments

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design uses a **warm, muted sage-green palette** with cream undertones that evokes the calm professionalism of a well-organized community planner. Instead of aggressive corporate blues or sterile grays, the sage accent color feels approachable and grounded - appropriate for a congregation's scheduling tool. The typography uses generous weight contrast to create a clear reading rhythm: heavy numbers for dates and counts, light labels for context.

### Layout Strategy
The layout is **asymmetric on desktop** with a dominant left column showing the upcoming week's timeline (the hero) and a narrower right column for quick stats and participant overview. This mirrors how users naturally think: "What's happening?" (left, big) then "Who's involved?" (right, supporting). On mobile, the timeline becomes a vertically stacked card stream with large, thumb-friendly date headers. Visual interest comes from **varying card heights** - timeline entries with two participants are taller than single-participant ones - and from the **tour color coding** (each tour gets a subtle left-border accent) creating a visual rhythm through the list.

### Unique Element
Each calendar entry card has a **colored left border strip** (4px wide) that corresponds to the tour assignment: sage-green for Tour 1, warm amber for Tour 2, soft slate-blue for Tour 3. This creates an immediately scannable visual pattern - users can identify tour distribution at a glance without reading any text. On desktop, the upcoming week section uses a **timeline-style layout** with date grouping headers that create natural visual breaks.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has a warm, geometric quality that feels professional yet approachable. Its distinctive letter shapes (especially the lowercase 'a' and 'g') give it personality without sacrificing readability. The wide weight range (300-800) enables strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(80 20% 97%)` | `--background` |
| Main text | `hsl(160 10% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(160 10% 15%)` | `--card-foreground` |
| Borders | `hsl(80 10% 88%)` | `--border` |
| Primary action (sage green) | `hsl(155 35% 38%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(155 25% 93%)` | `--accent` |
| Muted background | `hsl(80 10% 94%)` | `--muted` |
| Muted text | `hsl(160 5% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(155 40% 42%)` | (component use) |
| Error/negative | `hsl(0 65% 50%)` | `--destructive` |
| Tour 1 color | `hsl(155 35% 38%)` | (inline style) |
| Tour 2 color | `hsl(35 70% 50%)` | (inline style) |
| Tour 3 color | `hsl(215 40% 55%)` | (inline style) |

### Why These Colors
The sage-green primary creates a calm, nature-inspired feeling that suits a community scheduling tool. The warm cream background (`hsl(80 20% 97%)`) avoids the clinical feeling of pure white while maintaining excellent readability. The tour colors are chosen to be clearly distinguishable from each other (green/amber/blue) while all feeling harmonious within the sage-toned palette.

### Background Treatment
The page background is a subtle warm off-white with a slight greenish-cream undertone (`hsl(80 20% 97%)`). Cards sit on pure white to create gentle depth separation. No gradients or patterns - the tour-colored left borders on cards provide enough visual texture.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is a focused **vertical stream** designed for one-handed use. The hero section dominates the first viewport with a large "this week" summary. Below, calendar entries are stacked as full-width cards with generous spacing. The layout creates hierarchy through **size variation**: the hero area uses 48px numbers while entry cards use 16px text, creating an obvious visual distinction.

### What Users See (Top to Bottom)

**Header:**
A compact header with the app title "Terminkalender" on the left (700 weight, 20px) and a circular "+" button on the right (44px touch target, primary color background, white plus icon). Clean, minimal - no unnecessary decoration.

**Hero Section (The FIRST thing users see):**
A full-width summary area taking approximately 35% of the first viewport. Contains:
- **"Diese Woche"** label in muted text (14px, 500 weight, uppercase tracking)
- **Large count number** showing total appointments this week (48px, 800 weight, foreground color)
- **"Termine"** subtitle beneath the number (16px, 400 weight, muted)
- Below the count, a **horizontal row of 3 small tour badges** showing how many entries per tour this week. Each badge has the tour's left-border color as background tint, showing "Tour 1: 3" style text (13px, 600 weight). These badges use `gap-3` horizontal spacing and are horizontally scrollable if needed.

This hero answers the user's first question: "How busy is this week?"

**Section 2: Kommende Termine (Upcoming Entries)**
The main content area. A section header reads "Kommende Termine" (16px, 700 weight) with a small "Alle anzeigen" text link on the right.

Calendar entries are grouped by date. Each date group has:
- A **date header** showing the weekday and date (e.g., "Montag, 10. Feb.") in 14px, 600 weight, muted-foreground color, with a subtle bottom border
- Below it, entry cards for that date

Each **entry card** is a full-width card with:
- A **4px left border** in the tour's color (Tour 1 = sage green, Tour 2 = amber, Tour 3 = slate blue)
- **Time range** at top: "09:00 - 11:30" (14px, 600 weight, foreground)
- **Tour badge** next to time: small rounded pill badge with tour name, using tour color as subtle background tint (12px, 500 weight)
- **Participants** below: one line per participant showing "Vorname Nachname" (14px, 400 weight). If a participant is null/missing, show "Nicht zugewiesen" in muted text
- Card padding: 12px vertical, 16px horizontal (plus 4px left border)
- Card spacing between entries: 8px

Show up to 10 upcoming entries (from today forward, sorted by datum_von ascending). Both Wochenkalender and Kalendereintraege entries are merged into one unified list.

**Section 3: Teilnehmer (Participants)**
A collapsible section (starts collapsed on mobile to save space). Header shows "Teilnehmer" with a count badge and a chevron-down icon. When expanded, shows a simple list of all users: "Vorname Nachname" per line with "Versammlung" as muted subtitle (13px). Each list item has 10px vertical padding and a subtle bottom border.

**Bottom Navigation / Action:**
No fixed bottom bar. The "+" button in the header serves as the primary action. When tapped, it opens a full-screen dialog (sheet from bottom) for creating a new calendar entry.

### Mobile-Specific Adaptations
- Hero section is more compact than desktop (no chart, just the count + tour badges)
- Entry cards are simplified: no hover states, just the essential info
- Participant section is collapsible to prioritize the schedule view
- The add-entry dialog slides up as a bottom sheet taking ~90% of screen height

### Touch Targets
- All tappable areas minimum 44px height
- The "+" button is 44x44px with generous hit area
- Tour badges in hero are at least 36px tall for comfortable tapping
- Entry cards have 12px vertical padding making them easy to tap for detail view

### Interactive Elements
- Tapping an entry card opens a detail dialog showing full information (both participants with contact info, tour, full date/time range)
- Tour badges in hero section can be tapped to filter the list below to only that tour

---

## 5. Desktop Layout

### Overall Structure
A **two-column asymmetric layout** with max-width of 1200px, centered. Left column takes 65% width, right column 35%, with 24px gap between them.

The eye goes: (1) Hero stats at top-left, (2) Timeline of upcoming entries below hero, (3) Right sidebar with participant list and tour overview.

Visual interest comes from the asymmetric split, the varying heights of entry cards, and the tour-colored left borders creating a colorful left edge pattern down the timeline.

### Section Layout

**Top Area (Full Width):**
A compact header bar with:
- "Terminkalender" title (24px, 700 weight) on the left
- "Neuen Termin eintragen" primary action button on the right (standard Button component, primary variant, with Plus icon before text)

**Left Column (65%):**

*Hero Stats Row:*
Three stat items displayed inline horizontally (not in cards - just text). Separated by subtle vertical dividers (1px, border color, 32px height).
- **Diese Woche:** Large number (40px, 800 weight) + "Termine" label below (13px, muted)
- **Naechste Woche:** Large number (40px, 800 weight) + "Termine" label below (13px, muted)
- **Aktive Teilnehmer:** Large number (40px, 800 weight) + "Personen" label below (13px, muted)

Spacing: 32px padding below, then a subtle border-bottom separator.

*Upcoming Entries Timeline:*
Section header "Kommende Termine" (18px, 700 weight) with optional tour filter pills on the right (small rounded buttons: "Alle", "Tour 1", "Tour 2", "Tour 3" - the active one uses primary color, others are outline/ghost).

Entries grouped by date, same structure as mobile but with **enhanced layout for wider space**:
- Date header spans full width with muted background strip (2px height below text)
- Each entry card shows information in a **horizontal row layout**:
  - Left: 4px colored border
  - Time column (120px fixed width): "09:00 - 11:30" stacked or on one line
  - Tour column (80px): tour badge pill
  - Participants column (flex-grow): "Teilnehmer 1: Name" and "Teilnehmer 2: Name" on one line separated by a centered dot, or stacked if both are long
  - This row layout is more space-efficient than the mobile card layout

Show up to 20 upcoming entries on desktop.

**Right Column (35%):**

*Tour Overview Card:*
A card titled "Tour-Uebersicht" showing a simple bar chart (recharts horizontal BarChart) with 3 bars - one per tour - showing how many entries each tour has this week. Bars use the tour colors. Chart height: 160px. Below the chart, a legend row with colored dots and tour names.

*Teilnehmer Card:*
A card titled "Teilnehmer" with a count badge (e.g., "12"). Lists all participants as compact rows: "Vorname Nachname" with "Versammlung" as muted text on the right. Each row has a subtle bottom border. Max height 400px with overflow-y scroll. Each row shows a small avatar circle (32px, initials-based, muted background) on the left.

### What Appears on Hover
- Entry cards: subtle shadow elevation (`shadow-sm` to `shadow-md` transition) and slightly lighter background
- Participant rows: background shifts to accent color (`bg-accent`)
- Tour filter pills: underline effect on inactive pills

### Clickable/Interactive Areas
- Entry cards: clicking opens a detail dialog with full info + edit/delete options
- Tour filter pills: filter the entries list
- Participant rows: clicking shows a popover with contact details (email, phone) and their upcoming assignments

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Diese Woche"
- **Data source:** Wochenkalender + Kalendereintraege (both apps, merged)
- **Calculation:** Count all entries where `datum_von` falls within the current week (Monday to Sunday)
- **Display:** Large number (48px mobile / 40px desktop, 800 weight) with "Termine" label below
- **Context shown:** Tour distribution badges showing count per tour for this week
- **Why this is the hero:** Users open this app to answer "What's happening this week?" - the count plus tour breakdown gives them an instant overview

### Secondary KPIs

**Naechste Woche**
- Source: Wochenkalender + Kalendereintraege
- Calculation: Count entries where `datum_von` falls within next week
- Format: number
- Display: Desktop only - inline stat next to hero (40px number)

**Aktive Teilnehmer**
- Source: Benutzerverwaltung
- Calculation: Total count of all users
- Format: number
- Display: Desktop only - inline stat (40px number)

### Chart
- **Type:** Horizontal BarChart - because it compares 3 discrete categories (tours) and horizontal bars are easier to label
- **Title:** "Tour-Uebersicht"
- **What question it answers:** "How are this week's entries distributed across tours?" - helps identify if one tour is overloaded
- **Data source:** Wochenkalender + Kalendereintraege (this week's entries)
- **X-axis:** Count of entries (number)
- **Y-axis:** Tour name (Tour 1, Tour 2, Tour 3)
- **Bar colors:** Tour 1 = `hsl(155 35% 38%)`, Tour 2 = `hsl(35 70% 50%)`, Tour 3 = `hsl(215 40% 55%)`
- **Mobile simplification:** On mobile, this chart is replaced by the 3 inline tour badges in the hero section (simpler, takes less space)
- **Desktop:** Shown in right sidebar card, 160px height

### Lists/Tables

**Kommende Termine (Upcoming Entries)**
- Purpose: The core view - shows users what's coming up so they can plan
- Source: Wochenkalender + Kalendereintraege (merged, sorted by datum_von ascending)
- Fields shown: datum_von (formatted as time), datum_bis (formatted as time), tour (as colored badge), teilnehmer_1 name (Kalendereintraege), teilnehmer_2 name (both apps) - resolved via extractRecordId + lookup in Benutzerverwaltung data
- Mobile style: stacked cards with colored left border, grouped by date
- Desktop style: compact horizontal row cards with colored left border, grouped by date
- Sort: by datum_von ascending, only entries from today onwards
- Limit: 10 on mobile, 20 on desktop

**Teilnehmer (Participants)**
- Purpose: Quick reference for who's in the system
- Source: Benutzerverwaltung
- Fields shown: vorname, nachname, versammlung
- Mobile style: collapsible simple list
- Desktop style: card in right sidebar with scrollable list, avatar initials
- Sort: by nachname ascending
- Limit: all (scrollable)

### Primary Action Button (REQUIRED!)

- **Label:** "Neuen Termin eintragen" (desktop full text) / "+" icon only (mobile)
- **Action:** add_record - opens a dialog/sheet with a form to create a new Kalendereintraege entry
- **Target app:** Kalendereintraege (the more detailed calendar with two participant fields)
- **What data:** The form contains:
  - `datum_von`: date + time picker (type="datetime-local", step to minutes)
  - `datum_bis`: date + time picker
  - `teilnehmer_1`: Select dropdown populated from Benutzerverwaltung (show "Vorname Nachname")
  - `teilnehmer_2`: Select dropdown populated from Benutzerverwaltung (show "Vorname Nachname")
  - `tour`: Select dropdown with options Tour 1, Tour 2, Tour 3
  - Submit button: "Termin speichern" (primary variant)
  - Note: `teilnehmer_1` and `teilnehmer_2` values must be saved as full applookup URLs using `createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, selectedId)`
  - Note: date values must be formatted as `YYYY-MM-DDTHH:MM` (no seconds!)
- **Mobile position:** header (top-right "+" circle button, opens bottom sheet)
- **Desktop position:** header (top-right full button with text)
- **Why this action:** Creating new calendar entries is the primary workflow - coordinators frequently add new assignments as schedules change

---

## 7. Visual Details

### Border Radius
Rounded (8px) - `--radius: 0.5rem`. Cards use `rounded-lg` (8px). Badges and pills use `rounded-full`. Input fields use `rounded-md` (6px).

### Shadows
Subtle - Cards have `shadow-sm` at rest. On hover (desktop), cards elevate to `shadow-md`. The add-entry dialog has `shadow-xl`. No other shadows. The subtlety keeps the design clean.

### Spacing
Spacious - generous whitespace creates breathing room. Section gaps: 24px. Card internal padding: 16px (mobile) / 20px (desktop). Gap between entry cards: 8px. Gap between date groups: 20px. Page horizontal padding: 16px (mobile) / 0 (desktop, container handles it).

### Animations
- **Page load:** Stagger fade-in for entry cards (each card fades in 50ms after the previous, using CSS `animation-delay`). Hero stats fade in first (200ms), then entries (staggered from 300ms).
- **Hover effects:** Cards smoothly elevate shadow (`transition-shadow duration-200`). Participant rows smoothly change background (`transition-colors duration-150`).
- **Tap feedback:** Buttons use `active:scale-[0.98]` for subtle press feedback. Cards use `active:bg-muted/50` for tap acknowledgment on mobile.

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.5rem;
  --background: hsl(80 20% 97%);
  --foreground: hsl(160 10% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(160 10% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(160 10% 15%);
  --primary: hsl(155 35% 38%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(80 10% 94%);
  --secondary-foreground: hsl(160 10% 15%);
  --muted: hsl(80 10% 94%);
  --muted-foreground: hsl(160 5% 45%);
  --accent: hsl(155 25% 93%);
  --accent-foreground: hsl(160 10% 15%);
  --destructive: hsl(0 65% 50%);
  --border: hsl(80 10% 88%);
  --input: hsl(80 10% 88%);
  --ring: hsl(155 35% 38%);
  --chart-1: hsl(155 35% 38%);
  --chart-2: hsl(35 70% 50%);
  --chart-3: hsl(215 40% 55%);
  --chart-4: hsl(155 25% 60%);
  --chart-5: hsl(80 15% 60%);
  --sidebar-background: hsl(0 0% 100%);
  --sidebar-foreground: hsl(160 10% 15%);
  --sidebar-primary: hsl(155 35% 38%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(155 25% 93%);
  --sidebar-accent-foreground: hsl(160 10% 15%);
  --sidebar-border: hsl(80 10% 88%);
  --sidebar-ring: hsl(155 35% 38%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- [ ] Font-family set to `'Plus Jakarta Sans', sans-serif` on body/html
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (vertical stream, hero count, stacked cards)
- [ ] Desktop layout matches Section 5 (two-column asymmetric, inline stats, timeline)
- [ ] Hero element is prominent as described (large count number with tour badges)
- [ ] Tour colors applied correctly (green/amber/blue left borders)
- [ ] Primary action works (add new Kalendereintraege via dialog)
- [ ] Both Wochenkalender and Kalendereintraege data merged in timeline
- [ ] Participant names resolved from Benutzerverwaltung via extractRecordId
- [ ] Date formatting uses German locale (dd.MM.yyyy, weekday names)
- [ ] Colors create the calm, sage-green mood described in Section 2
- [ ] All three data sources (apps) are fetched and used
