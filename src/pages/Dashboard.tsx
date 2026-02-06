import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kalendereintraege, Benutzerverwaltung, Wochenkalender } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarPlus, AlertCircle, Calendar, Users } from 'lucide-react';

// Tour colors
const TOUR_COLORS: Record<string, string> = {
  tour_1: 'hsl(215 55% 52%)',
  tour_2: 'hsl(35 75% 55%)',
  tour_3: 'hsl(152 40% 48%)',
};

const TOUR_LABELS: Record<string, string> = {
  tour_1: 'Tour 1',
  tour_2: 'Tour 2',
  tour_3: 'Tour 3',
};

type AllEvent = {
  record_id: string;
  datum_von?: string;
  datum_bis?: string;
  tour?: string;
  teilnehmer_ids: string[];
  source: 'kalendereintraege' | 'wochenkalender';
};

function normalizeEvents(
  kalender: Kalendereintraege[],
  wochen: Wochenkalender[]
): AllEvent[] {
  const events: AllEvent[] = [];

  kalender.forEach((k) => {
    const ids: string[] = [];
    const id1 = extractRecordId(k.fields.teilnehmer_1);
    if (id1) ids.push(id1);
    const id2 = extractRecordId(k.fields.teilnehmer_2);
    if (id2) ids.push(id2);

    events.push({
      record_id: k.record_id,
      datum_von: k.fields.datum_von,
      datum_bis: k.fields.datum_bis,
      tour: k.fields.tour,
      teilnehmer_ids: ids,
      source: 'kalendereintraege',
    });
  });

  wochen.forEach((w) => {
    const ids: string[] = [];
    const id2 = extractRecordId(w.fields.teilnehmer_2);
    if (id2) ids.push(id2);

    events.push({
      record_id: w.record_id,
      datum_von: w.fields.datum_von,
      datum_bis: w.fields.datum_bis,
      tour: w.fields.tour,
      teilnehmer_ids: ids,
      source: 'wochenkalender',
    });
  });

  return events;
}

function getParticipantName(
  id: string,
  userMap: Map<string, Benutzerverwaltung>
): string {
  const user = userMap.get(id);
  if (!user) return 'Unbekannt';
  const first = user.fields.vorname || '';
  const last = user.fields.nachname || '';
  return `${first} ${last}`.trim() || 'Unbekannt';
}

function formatEventDate(datumVon?: string, datumBis?: string): string {
  if (!datumVon) return 'Kein Datum';
  try {
    const start = parseISO(datumVon);
    const dayStr = format(start, 'EEE, dd. MMM', { locale: de });
    const startTime = format(start, 'HH:mm');
    if (datumBis) {
      const end = parseISO(datumBis);
      const endTime = format(end, 'HH:mm');
      return `${dayStr} \u00b7 ${startTime}\u2013${endTime}`;
    }
    return `${dayStr} \u00b7 ${startTime}`;
  } catch {
    return datumVon;
  }
}

function TourBadge({ tour }: { tour?: string }) {
  if (!tour || !TOUR_LABELS[tour]) return null;
  const color = TOUR_COLORS[tour] || 'hsl(220 10% 50%)';
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        color: color,
      }}
    >
      {TOUR_LABELS[tour]}
    </span>
  );
}

function TourDistributionBar({ tourCounts }: { tourCounts: Record<string, number> }) {
  const total = Object.values(tourCounts).reduce((s, c) => s + c, 0);
  if (total === 0) return null;

  return (
    <div className="w-full h-1.5 md:h-1.5 rounded-full overflow-hidden flex bg-muted">
      {(['tour_1', 'tour_2', 'tour_3'] as const).map((tour) => {
        const count = tourCounts[tour] || 0;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={tour}
            style={{
              width: `${pct}%`,
              backgroundColor: TOUR_COLORS[tour],
            }}
          />
        );
      })}
    </div>
  );
}

// --- Loading State ---
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.54fr] gap-6">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Error State ---
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
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
function EmptyEvents({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">Keine Termine diese Woche</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onAdd}>
        Termin eintragen
      </Button>
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
  const [datumVon, setDatumVon] = useState('');
  const [datumBis, setDatumBis] = useState('');
  const [teilnehmer1, setTeilnehmer1] = useState('');
  const [teilnehmer2, setTeilnehmer2] = useState('');
  const [tour, setTour] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setDatumVon('');
    setDatumBis('');
    setTeilnehmer1('');
    setTeilnehmer2('');
    setTour('');
    setSubmitError(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!datumVon || !datumBis || !tour) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const fields: Kalendereintraege['fields'] = {
        datum_von: datumVon,
        datum_bis: datumBis,
        tour: tour as Kalendereintraege['fields']['tour'],
      };

      if (teilnehmer1 && teilnehmer1 !== 'none') {
        fields.teilnehmer_1 = createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer1);
      }
      if (teilnehmer2 && teilnehmer2 !== 'none') {
        fields.teilnehmer_2 = createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer2);
      }

      await LivingAppsService.createKalendereintraegeEntry(fields);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Termin eintragen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="datum_von">Datum von</Label>
            <Input
              id="datum_von"
              type="datetime-local"
              value={datumVon}
              onChange={(e) => {
                const val = e.target.value;
                // Ensure no seconds: take only YYYY-MM-DDTHH:MM
                setDatumVon(val.slice(0, 16));
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="datum_bis">Datum bis</Label>
            <Input
              id="datum_bis"
              type="datetime-local"
              value={datumBis}
              onChange={(e) => {
                const val = e.target.value;
                setDatumBis(val.slice(0, 16));
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Teilnehmer 1</Label>
            <Select value={teilnehmer1 || 'none'} onValueChange={(v) => setTeilnehmer1(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Teilnehmer</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.record_id} value={u.record_id}>
                    {`${u.fields.vorname || ''} ${u.fields.nachname || ''}`.trim() || 'Unbekannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Teilnehmer 2</Label>
            <Select value={teilnehmer2 || 'none'} onValueChange={(v) => setTeilnehmer2(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Teilnehmer</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.record_id} value={u.record_id}>
                    {`${u.fields.vorname || ''} ${u.fields.nachname || ''}`.trim() || 'Unbekannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
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
            <p className="text-sm text-destructive">{submitError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting || !datumVon || !datumBis || !tour}>
              {submitting ? 'Speichern...' : 'Termin erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Dashboard ---
export default function Dashboard() {
  const isMobile = useIsMobile();
  const [kalender, setKalender] = useState<Kalendereintraege[]>([]);
  const [wochen, setWochen] = useState<Wochenkalender[]>([]);
  const [users, setUsers] = useState<Benutzerverwaltung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [k, w, u] = await Promise.all([
        LivingAppsService.getKalendereintraege(),
        LivingAppsService.getWochenkalender(),
        LivingAppsService.getBenutzerverwaltung(),
      ]);
      setKalender(k);
      setWochen(w);
      setUsers(u);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // User lookup map
  const userMap = useMemo(() => {
    const map = new Map<string, Benutzerverwaltung>();
    users.forEach((u) => map.set(u.record_id, u));
    return map;
  }, [users]);

  // All events normalized
  const allEvents = useMemo(() => normalizeEvents(kalender, wochen), [kalender, wochen]);

  // This week's events
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const thisWeekEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (!e.datum_von) return false;
      try {
        const d = parseISO(e.datum_von);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    });
  }, [allEvents, weekStart, weekEnd]);

  // This month's events
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (!e.datum_von) return false;
      try {
        const d = parseISO(e.datum_von);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });
  }, [allEvents, monthStart, monthEnd]);

  // Tour counts for this week
  const tourCounts = useMemo(() => {
    const counts: Record<string, number> = { tour_1: 0, tour_2: 0, tour_3: 0 };
    thisWeekEvents.forEach((e) => {
      if (e.tour && counts[e.tour] !== undefined) {
        counts[e.tour]++;
      }
    });
    return counts;
  }, [thisWeekEvents]);

  // Upcoming events (future, sorted by date)
  const upcomingEvents = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return allEvents
      .filter((e) => {
        if (!e.datum_von) return false;
        try {
          const d = parseISO(e.datum_von);
          return isAfter(d, todayStart) || format(d, 'yyyy-MM-dd') === format(todayStart, 'yyyy-MM-dd');
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const da = a.datum_von || '';
        const db = b.datum_von || '';
        return da.localeCompare(db);
      });
  }, [allEvents]);

  // Sorted users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const na = a.fields.nachname || '';
      const nb = b.fields.nachname || '';
      return na.localeCompare(nb, 'de');
    });
  }, [users]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const eventLimit = isMobile ? 5 : 10;
  const displayEvents = upcomingEvents.slice(0, eventLimit);

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground">
            {isMobile ? 'Terminkalender' : 'Gemeinsamer Terminkalender'}
          </h1>
          {!isMobile && (
            <Button onClick={() => setDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Neuen Termin eintragen
            </Button>
          )}
        </div>

        {/* Main layout */}
        {isMobile ? (
          <MobileLayout
            thisWeekCount={thisWeekEvents.length}
            tourCounts={tourCounts}
            displayEvents={displayEvents}
            userMap={userMap}
            sortedUsers={sortedUsers}
            onAddClick={() => setDialogOpen(true)}
          />
        ) : (
          <DesktopLayout
            thisWeekCount={thisWeekEvents.length}
            tourCounts={tourCounts}
            displayEvents={displayEvents}
            userMap={userMap}
            sortedUsers={sortedUsers}
            totalUsers={users.length}
            thisMonthCount={thisMonthEvents.length}
          />
        )}

        {/* Mobile fixed bottom action */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
            <Button className="w-full h-12 text-[15px] font-semibold" onClick={() => setDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Neuen Termin eintragen
            </Button>
          </div>
        )}
      </div>

      {/* Add Entry Dialog */}
      <AddEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        users={sortedUsers}
        onSuccess={fetchData}
      />
    </div>
  );
}

// --- Mobile Layout ---
function MobileLayout({
  thisWeekCount,
  tourCounts,
  displayEvents,
  userMap,
  sortedUsers,
  onAddClick,
}: {
  thisWeekCount: number;
  tourCounts: Record<string, number>;
  displayEvents: AllEvent[];
  userMap: Map<string, Benutzerverwaltung>;
  sortedUsers: Benutzerverwaltung[];
  onAddClick: () => void;
}) {
  return (
    <div className="space-y-6 pb-24">
      {/* Hero */}
      <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <CardContent className="p-4 text-center">
          <p className="text-sm font-normal text-muted-foreground mb-1">Termine diese Woche</p>
          <p className="text-[56px] font-bold leading-none text-foreground mb-4">{thisWeekCount}</p>
          <TourDistributionBar tourCounts={tourCounts} />
          <div className="flex items-center justify-center gap-4 mt-3">
            {(['tour_1', 'tour_2', 'tour_3'] as const).map((tour) => (
              <span key={tour} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: TOUR_COLORS[tour] }}
                />
                {TOUR_LABELS[tour]}: {tourCounts[tour] || 0}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Nächste Termine</h2>
        </div>
        {displayEvents.length === 0 ? (
          <EmptyEvents onAdd={onAddClick} />
        ) : (
          <div className="space-y-2">
            {displayEvents.map((event) => (
              <MobileEventCard
                key={`${event.source}-${event.record_id}`}
                event={event}
                userMap={userMap}
              />
            ))}
          </div>
        )}
      </section>

      {/* Participants */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Teilnehmer</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {sortedUsers.map((u) => {
            const first = u.fields.vorname || '';
            const lastInitial = u.fields.nachname ? u.fields.nachname.charAt(0) + '.' : '';
            return (
              <span
                key={u.record_id}
                className="flex-shrink-0 inline-flex items-center rounded-full bg-muted px-3 py-1 text-[13px] text-foreground"
              >
                {first} {lastInitial}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MobileEventCard({
  event,
  userMap,
}: {
  event: AllEvent;
  userMap: Map<string, Benutzerverwaltung>;
}) {
  const tourColor = event.tour ? TOUR_COLORS[event.tour] : 'hsl(220 15% 90%)';
  const names = event.teilnehmer_ids
    .map((id) => getParticipantName(id, userMap))
    .join(' & ');

  return (
    <Card
      className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden"
      style={{ borderLeft: `3px solid ${tourColor}` }}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              {formatEventDate(event.datum_von, event.datum_bis)}
            </p>
            {names && (
              <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{names}</p>
            )}
          </div>
          <TourBadge tour={event.tour} />
        </div>
      </CardContent>
    </Card>
  );
}

// --- Desktop Layout ---
function DesktopLayout({
  thisWeekCount,
  tourCounts,
  displayEvents,
  userMap,
  sortedUsers,
  totalUsers,
  thisMonthCount,
}: {
  thisWeekCount: number;
  tourCounts: Record<string, number>;
  displayEvents: AllEvent[];
  userMap: Map<string, Benutzerverwaltung>;
  sortedUsers: Benutzerverwaltung[];
  totalUsers: number;
  thisMonthCount: number;
}) {
  return (
    <div className="grid grid-cols-[1fr_0.54fr] gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Hero Card */}
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Diese Woche
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold text-foreground leading-none">{thisWeekCount}</span>
              <span className="text-base font-normal text-muted-foreground">Termine</span>
            </div>
            <TourDistributionBar tourCounts={tourCounts} />
            <div className="flex items-center gap-4 mt-3">
              {(['tour_1', 'tour_2', 'tour_3'] as const).map((tour) => (
                <span key={tour} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: TOUR_COLORS[tour] }}
                  />
                  {TOUR_LABELS[tour]}: {tourCounts[tour] || 0}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Table */}
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Nächste Termine</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {displayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine kommenden Termine</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                        Datum
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                        Teilnehmer
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                        Tour
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayEvents.map((event) => {
                      const names = event.teilnehmer_ids
                        .map((id) => getParticipantName(id, userMap))
                        .join(' & ');
                      return (
                        <tr
                          key={`${event.source}-${event.record_id}`}
                          className="border-b border-border last:border-0 transition-colors duration-150 hover:bg-accent"
                        >
                          <td className="py-3 pr-4 text-sm font-medium text-foreground whitespace-nowrap">
                            {formatEventDate(event.datum_von, event.datum_bis)}
                          </td>
                          <td className="py-3 pr-4 text-sm text-foreground">
                            {names || <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="py-3">
                            <TourBadge tour={event.tour} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Stat: Teilnehmer */}
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2">
                <Users className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-[32px] font-bold leading-none text-foreground">{totalUsers}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">registriert</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat: This Month */}
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2">
                <Calendar className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-[32px] font-bold leading-none text-foreground">{thisMonthCount}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Termine diesen Monat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participant List */}
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Teilnehmer</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {sortedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine Teilnehmer registriert</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto -mx-1 px-1">
                {sortedUsers.map((u, i) => (
                  <div
                    key={u.record_id}
                    className={`flex items-center justify-between py-2.5 transition-colors duration-150 hover:bg-muted rounded px-2 -mx-2 ${
                      i < sortedUsers.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className="text-sm text-foreground">
                      {u.fields.vorname || ''} {u.fields.nachname || ''}
                    </span>
                    {u.fields.versammlung && (
                      <span className="text-[13px] text-muted-foreground ml-2 truncate max-w-[140px]">
                        {u.fields.versammlung}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
