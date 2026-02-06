import { useState, useEffect, useMemo } from 'react';
import type { Kalendereintraege, Benutzerverwaltung, Wochenkalender } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO, isToday, isThisWeek, isBefore, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarPlus, User, AlertCircle, Plus } from 'lucide-react';

// --- Tour color constants ---
const TOUR_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  tour_1: { bg: 'hsl(153 35% 45% / 0.1)', text: 'hsl(153 35% 45%)', bar: 'hsl(153 35% 45%)' },
  tour_2: { bg: 'hsl(35 70% 55% / 0.1)', text: 'hsl(35 70% 55%)', bar: 'hsl(35 70% 55%)' },
  tour_3: { bg: 'hsl(210 45% 55% / 0.1)', text: 'hsl(210 45% 55%)', bar: 'hsl(210 45% 55%)' },
};

const TOUR_LABELS: Record<string, string> = {
  tour_1: 'Tour 1',
  tour_2: 'Tour 2',
  tour_3: 'Tour 3',
};

// --- Helper: get participant name ---
function getParticipantName(
  recordUrl: string | undefined,
  userMap: Map<string, Benutzerverwaltung>
): string | null {
  if (!recordUrl) return null;
  const id = extractRecordId(recordUrl);
  if (!id) return null;
  const user = userMap.get(id);
  if (!user) return null;
  const first = user.fields.vorname || '';
  const last = user.fields.nachname || '';
  return `${first} ${last}`.trim() || null;
}

// --- Helper: format time range ---
function formatTimeRange(von?: string, bis?: string): string {
  if (!von) return '';
  const start = von.includes('T') ? von.split('T')[1] : '';
  const end = bis?.includes('T') ? bis.split('T')[1] : '';
  if (start && end) return `${start} – ${end} Uhr`;
  if (start) return `${start} Uhr`;
  return '';
}

// --- Loading State ---
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-6 animate-in fade-in duration-300" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex gap-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Error State ---
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{error.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// --- Empty State ---
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="text-center space-y-4">
        <CalendarPlus className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-semibold">Noch keine Termine</h2>
        <p className="text-muted-foreground">Erstellen Sie den ersten Kalendereintrag.</p>
        <Button onClick={onAdd}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          Neuer Eintrag
        </Button>
      </div>
    </div>
  );
}

// --- Add Entry Dialog ---
function AddEntryDialog({
  open,
  onOpenChange,
  users,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Benutzerverwaltung[];
  onSuccess: () => void;
}) {
  const [datumVonDate, setDatumVonDate] = useState('');
  const [datumVonTime, setDatumVonTime] = useState('10:00');
  const [datumBisDate, setDatumBisDate] = useState('');
  const [datumBisTime, setDatumBisTime] = useState('12:00');
  const [teilnehmer1, setTeilnehmer1] = useState('');
  const [teilnehmer2, setTeilnehmer2] = useState('');
  const [tour, setTour] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!datumVonDate || !datumBisDate || !tour) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const fields: Kalendereintraege['fields'] = {
        datum_von: `${datumVonDate}T${datumVonTime}`,
        datum_bis: `${datumBisDate}T${datumBisTime}`,
        tour: tour as Kalendereintraege['fields']['tour'],
      };

      if (teilnehmer1 && teilnehmer1 !== 'none') {
        fields.teilnehmer_1 = createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer1);
      }
      if (teilnehmer2 && teilnehmer2 !== 'none') {
        fields.teilnehmer_2 = createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer2);
      }

      await LivingAppsService.createKalendereintraegeEntry(fields);
      onOpenChange(false);
      setDatumVonDate('');
      setDatumBisDate('');
      setDatumVonTime('10:00');
      setDatumBisTime('12:00');
      setTeilnehmer1('');
      setTeilnehmer2('');
      setTour('');
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle>Neuer Kalendereintrag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="datum-von-date">Datum von</Label>
              <Input
                id="datum-von-date"
                type="date"
                value={datumVonDate}
                onChange={(e) => {
                  setDatumVonDate(e.target.value);
                  if (!datumBisDate) setDatumBisDate(e.target.value);
                }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="datum-von-time">Uhrzeit von</Label>
              <Input
                id="datum-von-time"
                type="time"
                value={datumVonTime}
                onChange={(e) => setDatumVonTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="datum-bis-date">Datum bis</Label>
              <Input
                id="datum-bis-date"
                type="date"
                value={datumBisDate}
                onChange={(e) => setDatumBisDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="datum-bis-time">Uhrzeit bis</Label>
              <Input
                id="datum-bis-time"
                type="time"
                value={datumBisTime}
                onChange={(e) => setDatumBisTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Teilnehmer 1</Label>
            <Select value={teilnehmer1 || 'none'} onValueChange={(v) => setTeilnehmer1(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Teilnehmer</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.record_id} value={u.record_id}>
                    {u.fields.vorname} {u.fields.nachname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Teilnehmer 2</Label>
            <Select value={teilnehmer2 || 'none'} onValueChange={(v) => setTeilnehmer2(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Teilnehmer</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.record_id} value={u.record_id}>
                    {u.fields.vorname} {u.fields.nachname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tour</Label>
            <Select value={tour || 'none'} onValueChange={(v) => setTour(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tour wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Tour</SelectItem>
                <SelectItem value="tour_1">Tour 1</SelectItem>
                <SelectItem value="tour_2">Tour 2</SelectItem>
                <SelectItem value="tour_3">Tour 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting || !datumVonDate || !datumBisDate || !tour}>
              {submitting ? 'Wird gespeichert...' : 'Eintrag erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Tour Badge ---
function TourBadge({ tour }: { tour?: string }) {
  if (!tour || !TOUR_COLORS[tour]) return null;
  const colors = TOUR_COLORS[tour];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {TOUR_LABELS[tour] || tour}
    </span>
  );
}

// --- Timeline Entry ---
function TimelineEntry({
  entry,
  userMap,
}: {
  entry: Kalendereintraege;
  userMap: Map<string, Benutzerverwaltung>;
}) {
  const tourColor = entry.fields.tour ? TOUR_COLORS[entry.fields.tour]?.bar || 'hsl(200 10% 80%)' : 'hsl(200 10% 80%)';
  const participant1 = getParticipantName(entry.fields.teilnehmer_1, userMap);
  const participant2 = getParticipantName(entry.fields.teilnehmer_2, userMap);
  const dateStr = entry.fields.datum_von
    ? format(parseISO(entry.fields.datum_von), 'EEEE, d. MMMM yyyy', { locale: de })
    : '';
  const shortDateStr = entry.fields.datum_von
    ? format(parseISO(entry.fields.datum_von), 'EEE, d. MMM', { locale: de })
    : '';
  const timeRange = formatTimeRange(entry.fields.datum_von, entry.fields.datum_bis);

  return (
    <div
      className="group relative bg-card rounded-xl transition-all duration-200 hover:shadow-[0_4px_12px_hsl(200_15%_15%/0.08),0_2px_4px_hsl(200_15%_15%/0.04)] hover:scale-[1.01]"
      style={{
        borderLeft: `4px solid ${tourColor}`,
        boxShadow: '0 1px 3px hsl(200 15% 15% / 0.04), 0 1px 2px hsl(200 15% 15% / 0.06)',
      }}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Desktop: full date, Mobile: short date */}
          <p className="font-semibold text-[15px] hidden md:block">{dateStr}</p>
          <p className="font-semibold text-[14px] md:hidden">{shortDateStr}</p>
          {timeRange && (
            <p className="text-[13px] text-muted-foreground mt-0.5">{timeRange}</p>
          )}
          {(participant1 || participant2) && (
            <div className="flex items-center gap-1.5 mt-2 text-[14px] text-foreground">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                {[participant1, participant2].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        <TourBadge tour={entry.fields.tour} />
      </div>
    </div>
  );
}

// --- Stats Row ---
function StatsRow({
  entriesThisWeek,
  activeParticipants,
  toursToday,
}: {
  entriesThisWeek: number;
  activeParticipants: number;
  toursToday: number;
}) {
  return (
    <div className="flex items-center justify-between bg-muted rounded-xl px-5 py-3 md:py-4">
      <div className="flex-1 text-center">
        <p className="text-[22px] md:text-[28px] font-bold leading-none">{entriesThisWeek}</p>
        <p className="text-[12px] md:text-[13px] text-muted-foreground mt-1">Einträge diese Woche</p>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex-1 text-center">
        <p className="text-[22px] md:text-[28px] font-bold leading-none">{activeParticipants}</p>
        <p className="text-[12px] md:text-[13px] text-muted-foreground mt-1">Aktive Teilnehmer</p>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex-1 text-center">
        <p className="text-[22px] md:text-[28px] font-bold leading-none">{toursToday}</p>
        <p className="text-[12px] md:text-[13px] text-muted-foreground mt-1">Touren heute</p>
      </div>
    </div>
  );
}

// --- Tour Distribution ---
function TourDistribution({ entries }: { entries: Kalendereintraege[] }) {
  const tourCounts = useMemo(() => {
    const counts: Record<string, number> = { tour_1: 0, tour_2: 0, tour_3: 0 };
    entries.forEach((e) => {
      if (e.fields.tour && counts[e.fields.tour] !== undefined) {
        counts[e.fields.tour]++;
      }
    });
    return counts;
  }, [entries]);

  const maxCount = Math.max(...Object.values(tourCounts), 1);
  const total = Object.values(tourCounts).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[16px] font-semibold">Touren-Übersicht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(['tour_1', 'tour_2', 'tour_3'] as const).map((tourKey) => {
          const colors = TOUR_COLORS[tourKey];
          const count = tourCounts[tourKey];
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={tourKey} className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px] font-medium">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colors.bar }}
                  />
                  <span>{TOUR_LABELS[tourKey]}</span>
                </div>
                <span>{count}</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.bg }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: colors.bar }}
                />
              </div>
            </div>
          );
        })}
        <p className="text-[12px] text-muted-foreground pt-1">
          {total} Einträge gesamt
        </p>
      </CardContent>
    </Card>
  );
}

// --- Participants List ---
function ParticipantsList({ users }: { users: Benutzerverwaltung[] }) {
  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      const nameA = (a.fields.nachname || '').toLowerCase();
      const nameB = (b.fields.nachname || '').toLowerCase();
      return nameA.localeCompare(nameB, 'de');
    });
  }, [users]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[16px] font-semibold">Teilnehmer</CardTitle>
          <Badge variant="secondary" className="text-xs">{users.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="px-6 pb-4 space-y-1">
            {sorted.map((user) => (
              <div
                key={user.record_id}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium truncate">
                    {user.fields.vorname} {user.fields.nachname}
                  </p>
                  {user.fields.versammlung && (
                    <p className="text-[12px] text-muted-foreground">
                      {
                        ({
                          bayreuth_sued: 'Bayreuth-Süd',
                          bayreuth_englisch: 'Bayreuth-Englisch',
                          bayreuth_russisch: 'Bayreuth-Russisch',
                          bayreuth_west: 'Bayreuth-West',
                          bayreuth_ost: 'Bayreuth-Ost',
                        } as Record<string, string>)[user.fields.versammlung] || user.fields.versammlung
                      }
                    </p>
                  )}
                </div>
                {user.fields.pionier && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ml-2"
                    style={{
                      backgroundColor: 'hsl(153 35% 45% / 0.1)',
                      color: 'hsl(153 35% 45%)',
                    }}
                  >
                    Pionier
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// --- Wochenplan Sidebar Card ---
function WochenplanCard({
  wochenEntries,
  userMap,
}: {
  wochenEntries: Wochenkalender[];
  userMap: Map<string, Benutzerverwaltung>;
}) {
  const thisWeekEntries = useMemo(() => {
    return wochenEntries
      .filter((e) => {
        if (!e.fields.datum_von) return false;
        try {
          return isThisWeek(parseISO(e.fields.datum_von), { weekStartsOn: 1, locale: de });
        } catch {
          return false;
        }
      })
      .sort((a, b) => (a.fields.datum_von || '').localeCompare(b.fields.datum_von || ''));
  }, [wochenEntries]);

  if (thisWeekEntries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[16px] font-semibold">Wochenplan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-muted-foreground">Keine Einträge diese Woche.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[16px] font-semibold">Wochenplan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {thisWeekEntries.map((entry) => {
          const participant = getParticipantName(entry.fields.teilnehmer_2, userMap);
          const dateStr = entry.fields.datum_von
            ? format(parseISO(entry.fields.datum_von), 'EEE, d. MMM', { locale: de })
            : '';
          const timeStr = entry.fields.datum_von?.includes('T')
            ? entry.fields.datum_von.split('T')[1]
            : '';
          return (
            <div
              key={entry.record_id}
              className="flex items-center justify-between py-2 px-2 rounded-lg text-[13px]"
            >
              <div className="min-w-0">
                <p className="font-medium">{dateStr} {timeStr && `· ${timeStr}`}</p>
                {participant && (
                  <p className="text-muted-foreground truncate">{participant}</p>
                )}
              </div>
              <TourBadge tour={entry.fields.tour} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// === MAIN DASHBOARD ===
export default function Dashboard() {
  const isMobile = useIsMobile();
  const [kalender, setKalender] = useState<Kalendereintraege[]>([]);
  const [users, setUsers] = useState<Benutzerverwaltung[]>([]);
  const [wochenkalender, setWochenkalender] = useState<Wochenkalender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [k, u, w] = await Promise.all([
        LivingAppsService.getKalendereintraege(),
        LivingAppsService.getBenutzerverwaltung(),
        LivingAppsService.getWochenkalender(),
      ]);
      setKalender(k);
      setUsers(u);
      setWochenkalender(w);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Daten konnten nicht geladen werden'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // User lookup map
  const userMap = useMemo(() => {
    const map = new Map<string, Benutzerverwaltung>();
    users.forEach((u) => map.set(u.record_id, u));
    return map;
  }, [users]);

  // Upcoming entries (datum_von >= today, sorted ascending)
  const upcomingEntries = useMemo(() => {
    const today = startOfDay(new Date());
    return kalender
      .filter((e) => {
        if (!e.fields.datum_von) return false;
        try {
          const d = parseISO(e.fields.datum_von);
          return !isBefore(d, today);
        } catch {
          return false;
        }
      })
      .sort((a, b) => (a.fields.datum_von || '').localeCompare(b.fields.datum_von || ''));
  }, [kalender]);

  // KPIs
  const entriesThisWeek = useMemo(() => {
    return kalender.filter((e) => {
      if (!e.fields.datum_von) return false;
      try {
        return isThisWeek(parseISO(e.fields.datum_von), { weekStartsOn: 1, locale: de });
      } catch {
        return false;
      }
    }).length;
  }, [kalender]);

  const toursToday = useMemo(() => {
    const tours = new Set<string>();
    kalender.forEach((e) => {
      if (!e.fields.datum_von || !e.fields.tour) return;
      try {
        if (isToday(parseISO(e.fields.datum_von))) {
          tours.add(e.fields.tour);
        }
      } catch {
        // skip invalid dates
      }
    });
    return tours.size;
  }, [kalender]);

  // States
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const maxItems = isMobile ? 7 : 10;
  const displayedEntries = upcomingEntries.slice(0, maxItems);

  return (
    <div
      className="min-h-screen bg-background animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-[20px] md:text-[26px] font-bold tracking-tight">
            {isMobile ? 'Terminkalender' : 'Gemeinsamer Terminkalender'}
          </h1>
          {isMobile ? (
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
              style={{ boxShadow: '0 4px 16px hsl(153 40% 40% / 0.3)' }}
              aria-label="Neuer Eintrag"
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : (
            <Button
              onClick={() => setDialogOpen(true)}
              className="transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Neuer Eintrag
            </Button>
          )}
        </div>

        {/* Desktop: Two columns / Mobile: Single column */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left Column (Main) */}
          <div className="flex-1 md:w-[65%] space-y-6">
            {/* Stats Row */}
            <StatsRow
              entriesThisWeek={entriesThisWeek}
              activeParticipants={users.length}
              toursToday={toursToday}
            />

            {/* Upcoming Entries (Hero) */}
            <div>
              <h2 className="text-[13px] md:text-[16px] font-medium uppercase tracking-wider text-muted-foreground mb-3 md:mb-4">
                Nächste Termine
              </h2>
              {displayedEntries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarPlus className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-[14px]">Keine anstehenden Termine</p>
                  <p className="text-[12px] mt-1">Erstellen Sie einen neuen Eintrag, um zu beginnen.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedEntries.map((entry) => (
                    <TimelineEntry
                      key={entry.record_id}
                      entry={entry}
                      userMap={userMap}
                    />
                  ))}
                  {upcomingEntries.length > maxItems && (
                    <p className="text-[12px] text-muted-foreground text-center pt-2">
                      + {upcomingEntries.length - maxItems} weitere Termine
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: Tour Distribution */}
            {isMobile && (
              <TourDistribution entries={kalender} />
            )}

            {/* Mobile: Participants */}
            {isMobile && (
              <ParticipantsList users={users} />
            )}
          </div>

          {/* Right Column (Sidebar - Desktop only) */}
          {!isMobile && (
            <div className="md:w-[35%] space-y-6">
              <TourDistribution entries={kalender} />
              <ParticipantsList users={users} />
              <WochenplanCard wochenEntries={wochenkalender} userMap={userMap} />
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Dialog */}
      <AddEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        users={users}
        onSuccess={fetchData}
      />
    </div>
  );
}
