import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Benutzerverwaltung, Wochenkalender, Kalendereintraege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, isAfter, isBefore, isEqual, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, ChevronDown, ChevronUp, Mail, Phone, AlertCircle, RefreshCw, Calendar, Users, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Tour color mapping ---
const TOUR_COLORS: Record<string, string> = {
  tour_1: 'hsl(155 35% 38%)',
  tour_2: 'hsl(35 70% 50%)',
  tour_3: 'hsl(215 40% 55%)',
};

const TOUR_BG_COLORS: Record<string, string> = {
  tour_1: 'hsl(155 35% 92%)',
  tour_2: 'hsl(35 70% 92%)',
  tour_3: 'hsl(215 40% 92%)',
};

const TOUR_LABELS: Record<string, string> = {
  tour_1: 'Tour 1',
  tour_2: 'Tour 2',
  tour_3: 'Tour 3',
};

// --- Unified calendar entry type ---
interface UnifiedEntry {
  record_id: string;
  datum_von?: string;
  datum_bis?: string;
  tour?: string;
  teilnehmer_1_id: string | null;
  teilnehmer_2_id: string | null;
  source: 'wochenkalender' | 'kalendereintraege';
}

// --- Helper: get week boundaries ---
function getCurrentWeekRange() {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return { start, end };
}

function getNextWeekRange() {
  const now = new Date();
  const start = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  const end = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  return { start, end };
}

function isInRange(dateStr: string | undefined, rangeStart: Date, rangeEnd: Date): boolean {
  if (!dateStr) return false;
  const d = parseISO(dateStr);
  return (isAfter(d, rangeStart) || isEqual(d, rangeStart)) && (isBefore(d, rangeEnd) || isEqual(d, rangeEnd));
}

// --- Helper: format time from datetime string ---
function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return '--:--';
  try {
    return format(parseISO(dateStr), 'HH:mm');
  } catch {
    return '--:--';
  }
}

function formatDateHeader(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, dd. MMM.', { locale: de });
  } catch {
    return dateStr;
  }
}

// --- Helper: get participant name ---
function getParticipantName(id: string | null, usersMap: Map<string, Benutzerverwaltung>): string {
  if (!id) return 'Nicht zugewiesen';
  const user = usersMap.get(id);
  if (!user) return 'Unbekannt';
  return `${user.fields.vorname || ''} ${user.fields.nachname || ''}`.trim() || 'Unbekannt';
}

// --- Helper: initials for avatar ---
function getInitials(user: Benutzerverwaltung): string {
  const first = user.fields.vorname?.[0] || '';
  const last = user.fields.nachname?.[0] || '';
  return (first + last).toUpperCase() || '?';
}

// ==========================================
// LOADING STATE
// ==========================================
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex gap-8 mb-8">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-16 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ERROR STATE
// ==========================================
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{error.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">Noch keine Termine</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Es sind noch keine Termine eingetragen. Erstellen Sie den ersten Termin, um loszulegen.
      </p>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Ersten Termin eintragen
      </Button>
    </div>
  );
}

// ==========================================
// ADD ENTRY DIALOG
// ==========================================
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
      // Format dates: YYYY-MM-DDTHH:MM (no seconds!)
      const vonFormatted = datumVon.substring(0, 16); // ensure no seconds
      const bisFormatted = datumBis.substring(0, 16);

      const fields: Kalendereintraege['fields'] = {
        datum_von: vonFormatted,
        datum_bis: bisFormatted,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              onChange={(e) => setDatumVon(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="datum_bis">Datum bis</Label>
            <Input
              id="datum_bis"
              type="datetime-local"
              value={datumBis}
              onChange={(e) => setDatumBis(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Teilnehmer 1</Label>
            <Select value={teilnehmer1 || 'none'} onValueChange={(v) => setTeilnehmer1(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Auswahl</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.record_id} value={u.record_id}>
                    {u.fields.vorname} {u.fields.nachname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Teilnehmer 2</Label>
            <Select value={teilnehmer2 || 'none'} onValueChange={(v) => setTeilnehmer2(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Auswahl</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.record_id} value={u.record_id}>
                    {u.fields.vorname} {u.fields.nachname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tour</Label>
            <Select value={tour || 'none'} onValueChange={(v) => setTour(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tour auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Auswahl</SelectItem>
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
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting || !datumVon || !datumBis || !tour}>
              {submitting ? 'Speichern...' : 'Termin speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// ENTRY DETAIL DIALOG
// ==========================================
function EntryDetailDialog({
  entry,
  usersMap,
  open,
  onOpenChange,
}: {
  entry: UnifiedEntry | null;
  usersMap: Map<string, Benutzerverwaltung>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;

  const teilnehmer1 = entry.teilnehmer_1_id ? usersMap.get(entry.teilnehmer_1_id) : null;
  const teilnehmer2 = entry.teilnehmer_2_id ? usersMap.get(entry.teilnehmer_2_id) : null;

  function renderParticipant(label: string, user: Benutzerverwaltung | null | undefined) {
    if (!user) {
      return (
        <div className="py-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-sm text-muted-foreground italic">Nicht zugewiesen</p>
        </div>
      );
    }
    return (
      <div className="py-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-medium">{user.fields.vorname} {user.fields.nachname}</p>
        {user.fields.versammlung && (
          <p className="text-sm text-muted-foreground">{user.fields.versammlung}</p>
        )}
        <div className="flex gap-4 mt-1">
          {user.fields.email && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {user.fields.email}
            </span>
          )}
          {user.fields.handynummer && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> {user.fields.handynummer}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Termindetails
            {entry.tour && (
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: TOUR_BG_COLORS[entry.tour],
                  color: TOUR_COLORS[entry.tour],
                }}
              >
                {TOUR_LABELS[entry.tour] || entry.tour}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {entry.datum_von ? format(parseISO(entry.datum_von), 'EEEE, dd. MMMM yyyy', { locale: de }) : 'Kein Datum'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground pl-6">
            {formatTime(entry.datum_von)} - {formatTime(entry.datum_bis)}
          </div>
          <Separator />
          {entry.source === 'kalendereintraege' && renderParticipant('Teilnehmer 1', teilnehmer1)}
          {renderParticipant(entry.source === 'kalendereintraege' ? 'Teilnehmer 2' : 'Teilnehmer', teilnehmer2)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// ENTRY CARD
// ==========================================
function EntryCard({
  entry,
  usersMap,
  onClick,
}: {
  entry: UnifiedEntry;
  usersMap: Map<string, Benutzerverwaltung>;
  onClick: () => void;
}) {
  const tourColor = entry.tour ? TOUR_COLORS[entry.tour] : 'hsl(0 0% 80%)';
  const tourBg = entry.tour ? TOUR_BG_COLORS[entry.tour] : 'hsl(0 0% 95%)';

  return (
    <div
      className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer active:bg-muted/50 overflow-hidden"
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-1 shrink-0 rounded-l-lg" style={{ backgroundColor: tourColor }} />
        <div className="flex-1 p-3 md:p-4">
          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">
                {formatTime(entry.datum_von)} - {formatTime(entry.datum_bis)}
              </span>
              {entry.tour && (
                <Badge
                  variant="secondary"
                  className="text-xs font-medium"
                  style={{ backgroundColor: tourBg, color: tourColor }}
                >
                  {TOUR_LABELS[entry.tour] || entry.tour}
                </Badge>
              )}
            </div>
            <div className="space-y-0.5">
              {entry.source === 'kalendereintraege' && (
                <p className="text-sm" style={{ color: entry.teilnehmer_1_id ? undefined : 'var(--muted-foreground)' }}>
                  {getParticipantName(entry.teilnehmer_1_id, usersMap)}
                </p>
              )}
              <p className="text-sm" style={{ color: entry.teilnehmer_2_id ? undefined : 'var(--muted-foreground)' }}>
                {getParticipantName(entry.teilnehmer_2_id, usersMap)}
              </p>
            </div>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <span className="text-sm font-semibold w-[120px] shrink-0">
              {formatTime(entry.datum_von)} - {formatTime(entry.datum_bis)}
            </span>
            <div className="w-[80px] shrink-0">
              {entry.tour && (
                <Badge
                  variant="secondary"
                  className="text-xs font-medium"
                  style={{ backgroundColor: tourBg, color: tourColor }}
                >
                  {TOUR_LABELS[entry.tour] || entry.tour}
                </Badge>
              )}
            </div>
            <div className="flex-1 text-sm">
              {entry.source === 'kalendereintraege' ? (
                <span>
                  <span style={{ color: entry.teilnehmer_1_id ? undefined : 'var(--muted-foreground)' }}>
                    {getParticipantName(entry.teilnehmer_1_id, usersMap)}
                  </span>
                  <span className="mx-2 text-muted-foreground">&middot;</span>
                  <span style={{ color: entry.teilnehmer_2_id ? undefined : 'var(--muted-foreground)' }}>
                    {getParticipantName(entry.teilnehmer_2_id, usersMap)}
                  </span>
                </span>
              ) : (
                <span style={{ color: entry.teilnehmer_2_id ? undefined : 'var(--muted-foreground)' }}>
                  {getParticipantName(entry.teilnehmer_2_id, usersMap)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PARTICIPANT ROW (Desktop sidebar)
// ==========================================
function ParticipantRow({ user }: { user: Benutzerverwaltung }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-accent transition-colors duration-150 cursor-pointer border-b border-border last:border-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
            {getInitials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.fields.vorname} {user.fields.nachname}
            </p>
          </div>
          {user.fields.versammlung && (
            <span className="text-xs text-muted-foreground shrink-0">{user.fields.versammlung}</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <p className="font-medium mb-1">{user.fields.vorname} {user.fields.nachname}</p>
        {user.fields.versammlung && (
          <p className="text-sm text-muted-foreground mb-2">{user.fields.versammlung}</p>
        )}
        {user.fields.email && (
          <p className="text-sm flex items-center gap-1.5 mb-1">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {user.fields.email}
          </p>
        )}
        {user.fields.handynummer && (
          <p className="text-sm flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {user.fields.handynummer}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ==========================================
// MAIN DASHBOARD
// ==========================================
export default function Dashboard() {
  const [users, setUsers] = useState<Benutzerverwaltung[]>([]);
  const [wochenkalender, setWochenkalender] = useState<Wochenkalender[]>([]);
  const [kalendereintraege, setKalendereintraege] = useState<Kalendereintraege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<UnifiedEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tourFilter, setTourFilter] = useState<string | null>(null);
  const [participantsExpanded, setParticipantsExpanded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [u, w, k] = await Promise.all([
        LivingAppsService.getBenutzerverwaltung(),
        LivingAppsService.getWochenkalender(),
        LivingAppsService.getKalendereintraege(),
      ]);
      setUsers(u);
      setWochenkalender(w);
      setKalendereintraege(k);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build user lookup map
  const usersMap = useMemo(() => {
    const map = new Map<string, Benutzerverwaltung>();
    users.forEach((u) => map.set(u.record_id, u));
    return map;
  }, [users]);

  // Merge all entries into unified list
  const allEntries = useMemo<UnifiedEntry[]>(() => {
    const fromWochen: UnifiedEntry[] = wochenkalender.map((w) => ({
      record_id: w.record_id,
      datum_von: w.fields.datum_von,
      datum_bis: w.fields.datum_bis,
      tour: w.fields.tour,
      teilnehmer_1_id: null,
      teilnehmer_2_id: extractRecordId(w.fields.teilnehmer_2),
      source: 'wochenkalender',
    }));

    const fromKalender: UnifiedEntry[] = kalendereintraege.map((k) => ({
      record_id: k.record_id,
      datum_von: k.fields.datum_von,
      datum_bis: k.fields.datum_bis,
      tour: k.fields.tour,
      teilnehmer_1_id: extractRecordId(k.fields.teilnehmer_1),
      teilnehmer_2_id: extractRecordId(k.fields.teilnehmer_2),
      source: 'kalendereintraege',
    }));

    return [...fromWochen, ...fromKalender].sort((a, b) => {
      const aDate = a.datum_von || '';
      const bDate = b.datum_von || '';
      return aDate.localeCompare(bDate);
    });
  }, [wochenkalender, kalendereintraege]);

  // Upcoming entries (from today forward)
  const upcomingEntries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allEntries.filter((e) => {
      if (!e.datum_von) return false;
      const d = parseISO(e.datum_von);
      return isAfter(d, today) || isSameDay(d, today);
    });
  }, [allEntries]);

  // Filtered entries by tour
  const filteredEntries = useMemo(() => {
    if (!tourFilter) return upcomingEntries;
    return upcomingEntries.filter((e) => e.tour === tourFilter);
  }, [upcomingEntries, tourFilter]);

  // This week stats
  const thisWeekRange = useMemo(() => getCurrentWeekRange(), []);
  const nextWeekRange = useMemo(() => getNextWeekRange(), []);

  const thisWeekEntries = useMemo(
    () => allEntries.filter((e) => isInRange(e.datum_von, thisWeekRange.start, thisWeekRange.end)),
    [allEntries, thisWeekRange]
  );

  const nextWeekEntries = useMemo(
    () => allEntries.filter((e) => isInRange(e.datum_von, nextWeekRange.start, nextWeekRange.end)),
    [allEntries, nextWeekRange]
  );

  // Tour counts for this week
  const tourCountsThisWeek = useMemo(() => {
    const counts: Record<string, number> = { tour_1: 0, tour_2: 0, tour_3: 0 };
    thisWeekEntries.forEach((e) => {
      if (e.tour && counts[e.tour] !== undefined) {
        counts[e.tour]++;
      }
    });
    return counts;
  }, [thisWeekEntries]);

  // Chart data for tour overview
  const tourChartData = useMemo(() => {
    return [
      { name: 'Tour 1', value: tourCountsThisWeek.tour_1, fill: TOUR_COLORS.tour_1 },
      { name: 'Tour 2', value: tourCountsThisWeek.tour_2, fill: TOUR_COLORS.tour_2 },
      { name: 'Tour 3', value: tourCountsThisWeek.tour_3, fill: TOUR_COLORS.tour_3 },
    ];
  }, [tourCountsThisWeek]);

  // Group entries by date for display
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, UnifiedEntry[]>();
    filteredEntries.forEach((entry) => {
      const dateKey = entry.datum_von?.split('T')[0] || 'unknown';
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(entry);
    });
    return groups;
  }, [filteredEntries]);

  // Sorted users
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => (a.fields.nachname || '').localeCompare(b.fields.nachname || '')),
    [users]
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const displayLimit = isMobile ? 10 : 20;
  let displayCount = 0;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold md:text-2xl">Terminkalender</h1>
          {/* Mobile: circle + button */}
          <Button
            size="icon"
            className="md:hidden h-11 w-11 rounded-full"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          {/* Desktop: full button */}
          <Button className="hidden md:flex" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuen Termin eintragen
          </Button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        {/* MOBILE HERO */}
        <div className="md:hidden mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Diese Woche
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-extrabold">{thisWeekEntries.length}</span>
            <span className="text-base text-muted-foreground">Termine</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(['tour_1', 'tour_2', 'tour_3'] as const).map((tourKey) => (
              <button
                key={tourKey}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shrink-0 transition-colors duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: tourFilter === tourKey ? TOUR_COLORS[tourKey] : TOUR_BG_COLORS[tourKey],
                  color: tourFilter === tourKey ? 'white' : TOUR_COLORS[tourKey],
                }}
                onClick={() => setTourFilter(tourFilter === tourKey ? null : tourKey)}
              >
                {TOUR_LABELS[tourKey]}: {tourCountsThisWeek[tourKey]}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP TWO-COLUMN LAYOUT */}
        <div className="md:flex md:gap-6">
          {/* LEFT COLUMN (65%) */}
          <div className="md:w-[65%]">
            {/* Desktop hero stats */}
            <div className="hidden md:flex md:items-center md:gap-8 md:pb-6 md:mb-6 md:border-b md:border-border">
              <div>
                <span className="text-4xl font-extrabold">{thisWeekEntries.length}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Diese Woche</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <span className="text-4xl font-extrabold">{nextWeekEntries.length}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Nächste Woche</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <span className="text-4xl font-extrabold">{users.length}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Teilnehmer</p>
              </div>
            </div>

            {/* Section header with tour filter pills (desktop) */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Kommende Termine</h2>
              <div className="hidden md:flex md:items-center md:gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    !tourFilter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:underline'
                  }`}
                  onClick={() => setTourFilter(null)}
                >
                  Alle
                </button>
                {(['tour_1', 'tour_2', 'tour_3'] as const).map((tourKey) => (
                  <button
                    key={tourKey}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: tourFilter === tourKey ? TOUR_COLORS[tourKey] : 'transparent',
                      color: tourFilter === tourKey ? 'white' : TOUR_COLORS[tourKey],
                    }}
                    onClick={() => setTourFilter(tourFilter === tourKey ? null : tourKey)}
                  >
                    {TOUR_LABELS[tourKey]}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries list */}
            {filteredEntries.length === 0 ? (
              <EmptyState onAdd={() => setAddDialogOpen(true)} />
            ) : (
              <div className="space-y-5">
                {Array.from(groupedEntries.entries()).map(([dateKey, entries]) => {
                  if (displayCount >= displayLimit) return null;

                  return (
                    <div key={dateKey}>
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-muted-foreground border-b border-border pb-1">
                          {dateKey !== 'unknown' ? formatDateHeader(dateKey) : 'Ohne Datum'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {entries.map((entry) => {
                          if (displayCount >= displayLimit) return null;
                          displayCount++;
                          return (
                            <div
                              key={entry.record_id}
                              style={{ animationDelay: `${displayCount * 50 + 300}ms` }}
                              className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                            >
                              <EntryCard
                                entry={entry}
                                usersMap={usersMap}
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setDetailOpen(true);
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (35%) - Desktop only */}
          <div className="hidden md:block md:w-[35%] space-y-6">
            {/* Tour Overview Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Tour-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tourChartData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(160 5% 45%)" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(160 5% 45%)"
                        width={52}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0 0% 100%)',
                          border: '1px solid hsl(80 10% 88%)',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value: number) => [`${value} Termine`, 'Anzahl']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {tourChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  {tourChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Participants Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Teilnehmer
                  <Badge variant="secondary" className="text-xs font-medium">
                    {users.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {sortedUsers.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Keine Teilnehmer</p>
                  </div>
                ) : (
                  <div>
                    {sortedUsers.map((user) => (
                      <ParticipantRow key={user.record_id} user={user} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MOBILE: Participants Section (collapsible) */}
        <div className="md:hidden mt-8">
          <button
            className="flex items-center justify-between w-full py-3 border-b border-border"
            onClick={() => setParticipantsExpanded(!participantsExpanded)}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Teilnehmer</h2>
              <Badge variant="secondary" className="text-xs">{users.length}</Badge>
            </div>
            {participantsExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {participantsExpanded && (
            <div className="mt-2">
              {sortedUsers.map((user) => (
                <div key={user.record_id} className="py-2.5 border-b border-border last:border-0">
                  <p className="text-sm font-medium">
                    {user.fields.vorname} {user.fields.nachname}
                  </p>
                  {user.fields.versammlung && (
                    <p className="text-xs text-muted-foreground">{user.fields.versammlung}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <AddEntryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        users={sortedUsers}
        onSuccess={fetchData}
      />
      <EntryDetailDialog
        entry={selectedEntry}
        usersMap={usersMap}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
