import { useState, useEffect, useMemo } from 'react';
import type { Benutzerverwaltung, Kalendereintraege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Calendar, Users, AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Constants ---
const TOUR_COLORS: Record<string, string> = {
  tour_1: 'hsl(173 58% 39%)',
  tour_2: 'hsl(38 92% 50%)',
  tour_3: 'hsl(255 40% 55%)',
};

const TOUR_BG_COLORS: Record<string, string> = {
  tour_1: 'hsl(173 58% 39% / 0.1)',
  tour_2: 'hsl(38 92% 50% / 0.1)',
  tour_3: 'hsl(255 40% 55% / 0.1)',
};

const TOUR_LABELS: Record<string, string> = {
  tour_1: 'Tour 1',
  tour_2: 'Tour 2',
  tour_3: 'Tour 3',
};

// --- Helper: resolve participant name ---
function getParticipantName(
  url: string | undefined,
  userMap: Map<string, Benutzerverwaltung>
): string | null {
  if (!url) return null;
  const id = extractRecordId(url);
  if (!id) return null;
  const user = userMap.get(id);
  if (!user) return null;
  return [user.fields.vorname, user.fields.nachname].filter(Boolean).join(' ');
}

// --- Loading skeleton ---
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 md:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Error state ---
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

// --- Empty state ---
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-semibold">Noch keine Termine</h2>
        <p className="text-muted-foreground max-w-sm">
          Erstellen Sie Ihren ersten Termin, um den Kalender zu starten.
        </p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Termin
        </Button>
      </div>
    </div>
  );
}

// --- Tour Badge ---
function TourBadge({ tour }: { tour: string | undefined }) {
  if (!tour || !TOUR_LABELS[tour]) return null;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: TOUR_BG_COLORS[tour],
        color: TOUR_COLORS[tour],
      }}
    >
      {TOUR_LABELS[tour]}
    </span>
  );
}

// --- New Entry Form ---
function NewEntryForm({
  users,
  onSuccess,
  onClose,
}: {
  users: Benutzerverwaltung[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [datumVon, setDatumVon] = useState('');
  const [zeitVon, setZeitVon] = useState('09:00');
  const [datumBis, setDatumBis] = useState('');
  const [zeitBis, setZeitBis] = useState('17:00');
  const [teilnehmer1, setTeilnehmer1] = useState('');
  const [teilnehmer2, setTeilnehmer2] = useState('');
  const [tour, setTour] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!datumVon || !zeitVon || !tour) {
      setError('Bitte Datum, Zeit und Tour ausfullen.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const fields: Record<string, string | null> = {
        datum_von: `${datumVon}T${zeitVon}`,
        datum_bis: datumBis && zeitBis ? `${datumBis}T${zeitBis}` : `${datumVon}T${zeitBis}`,
        tour,
        teilnehmer_1: teilnehmer1
          ? createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer1)
          : null,
        teilnehmer_2: teilnehmer2
          ? createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer2)
          : null,
      };
      await LivingAppsService.createKalendereintraegeEntry(
        fields as unknown as Kalendereintraege['fields']
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datum_von">Datum von</Label>
          <Input
            id="datum_von"
            type="date"
            value={datumVon}
            onChange={(e) => {
              setDatumVon(e.target.value);
              if (!datumBis) setDatumBis(e.target.value);
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zeit_von">Uhrzeit von</Label>
          <Input
            id="zeit_von"
            type="time"
            value={zeitVon}
            onChange={(e) => setZeitVon(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datum_bis">Datum bis</Label>
          <Input
            id="datum_bis"
            type="date"
            value={datumBis}
            onChange={(e) => setDatumBis(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zeit_bis">Uhrzeit bis</Label>
          <Input
            id="zeit_bis"
            type="time"
            value={zeitBis}
            onChange={(e) => setZeitBis(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tour</Label>
        <Select value={tour} onValueChange={setTour} required>
          <SelectTrigger>
            <SelectValue placeholder="Tour wahlen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tour_1">Tour 1</SelectItem>
            <SelectItem value="tour_2">Tour 2</SelectItem>
            <SelectItem value="tour_3">Tour 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Teilnehmer 1</Label>
        <Select
          value={teilnehmer1 || 'none'}
          onValueChange={(v) => setTeilnehmer1(v === 'none' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Teilnehmer wahlen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Kein Teilnehmer --</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.record_id} value={u.record_id}>
                {[u.fields.vorname, u.fields.nachname].filter(Boolean).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Teilnehmer 2</Label>
        <Select
          value={teilnehmer2 || 'none'}
          onValueChange={(v) => setTeilnehmer2(v === 'none' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Teilnehmer wahlen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Kein Teilnehmer --</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.record_id} value={u.record_id}>
                {[u.fields.vorname, u.fields.nachname].filter(Boolean).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Wird erstellt...' : 'Termin erstellen'}
        </Button>
      </div>
    </form>
  );
}

// --- Entry Detail Dialog ---
function EntryDetailDialog({
  entry,
  userMap,
  open,
  onOpenChange,
}: {
  entry: Kalendereintraege;
  userMap: Map<string, Benutzerverwaltung>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const teilnehmer1Name = getParticipantName(entry.fields.teilnehmer_1, userMap);
  const teilnehmer2Name = getParticipantName(entry.fields.teilnehmer_2, userMap);

  const dateVon = entry.fields.datum_von
    ? format(parseISO(entry.fields.datum_von), 'EEEE, dd. MMMM yyyy, HH:mm', { locale: de })
    : '—';
  const dateBis = entry.fields.datum_bis
    ? format(parseISO(entry.fields.datum_bis), 'EEEE, dd. MMMM yyyy, HH:mm', { locale: de })
    : '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            Termindetails
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tour</p>
            <TourBadge tour={entry.fields.tour} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Von</p>
            <p className="font-medium">{dateVon} Uhr</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bis</p>
            <p className="font-medium">{dateBis} Uhr</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Teilnehmer 1</p>
            <p className="font-medium">{teilnehmer1Name || '— Nicht zugewiesen'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Teilnehmer 2</p>
            <p className="font-medium">{teilnehmer2Name || '— Nicht zugewiesen'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Dashboard ---
export default function Dashboard() {
  const [users, setUsers] = useState<Benutzerverwaltung[]>([]);
  const [entries, setEntries] = useState<Kalendereintraege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Kalendereintraege | null>(null);
  const [filterUser, setFilterUser] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [u, e] = await Promise.all([
        LivingAppsService.getBenutzerverwaltung(),
        LivingAppsService.getKalendereintraege(),
      ]);
      setUsers(u);
      setEntries(e);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Build user lookup map
  const userMap = useMemo(() => {
    const map = new Map<string, Benutzerverwaltung>();
    users.forEach((u) => map.set(u.record_id, u));
    return map;
  }, [users]);

  // Upcoming entries (sorted by datum_von, future only)
  const upcomingEntries = useMemo(() => {
    const now = new Date();
    return entries
      .filter((e) => {
        if (!e.fields.datum_von) return false;
        try {
          return isAfter(parseISO(e.fields.datum_von), now);
        } catch {
          return false;
        }
      })
      .filter((e) => {
        if (!filterUser) return true;
        const id1 = extractRecordId(e.fields.teilnehmer_1);
        const id2 = extractRecordId(e.fields.teilnehmer_2);
        return id1 === filterUser || id2 === filterUser;
      })
      .sort((a, b) => {
        const da = a.fields.datum_von || '';
        const db = b.fields.datum_von || '';
        return da.localeCompare(db);
      });
  }, [entries, filterUser]);

  // Tour counts for current month
  const tourCounts = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const counts: Record<string, number> = { tour_1: 0, tour_2: 0, tour_3: 0 };

    entries.forEach((e) => {
      if (!e.fields.datum_von || !e.fields.tour) return;
      try {
        const d = parseISO(e.fields.datum_von);
        if (isAfter(d, monthStart) && !isAfter(d, monthEnd)) {
          counts[e.fields.tour] = (counts[e.fields.tour] || 0) + 1;
        }
      } catch {
        // skip invalid dates
      }
    });
    return counts;
  }, [entries]);

  // Chart data
  const chartData = useMemo(() => {
    return [
      { name: 'Tour 1', count: tourCounts.tour_1, fill: TOUR_COLORS.tour_1 },
      { name: 'Tour 2', count: tourCounts.tour_2, fill: TOUR_COLORS.tour_2 },
      { name: 'Tour 3', count: tourCounts.tour_3, fill: TOUR_COLORS.tour_3 },
    ];
  }, [tourCounts]);

  // Participant assignment counts
  const participantCounts = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      const id1 = extractRecordId(e.fields.teilnehmer_1);
      const id2 = extractRecordId(e.fields.teilnehmer_2);
      if (id1) counts.set(id1, (counts.get(id1) || 0) + 1);
      if (id2) counts.set(id2, (counts.get(id2) || 0) + 1);
    });
    return counts;
  }, [entries]);

  // Sorted users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const na = a.fields.nachname || '';
      const nb = b.fields.nachname || '';
      return na.localeCompare(nb);
    });
  }, [users]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const today = format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de });

  function handleCreateSuccess() {
    fetchData();
  }

  // Mobile: limit to 5, Desktop: limit to 8
  const mobileEntries = upcomingEntries.slice(0, 5);
  const desktopEntries = upcomingEntries.slice(0, 8);

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Entry detail dialog */}
      {selectedEntry && (
        <EntryDetailDialog
          entry={selectedEntry}
          userMap={userMap}
          open={!!selectedEntry}
          onOpenChange={(open) => {
            if (!open) setSelectedEntry(null);
          }}
        />
      )}

      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Terminkalender</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full h-10 w-10 shadow-sm">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Neuer Termin</DialogTitle>
                </DialogHeader>
                <NewEntryForm
                  users={users}
                  onSuccess={handleCreateSuccess}
                  onClose={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Filter indicator */}
          {filterUser && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Filter: {getParticipantName(
                  createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, filterUser),
                  userMap
                ) || 'Teilnehmer'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setFilterUser(null)}
              >
                Zurucksetzen
              </Button>
            </div>
          )}

          {/* Hero: Upcoming Entries */}
          <section>
            <h2 className="text-base font-semibold text-muted-foreground mb-3">
              Nachste Termine
            </h2>
            {mobileEntries.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {filterUser
                      ? 'Keine anstehenden Termine fur diesen Teilnehmer.'
                      : 'Keine anstehenden Termine.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {mobileEntries.map((entry, idx) => {
                    const name1 = getParticipantName(entry.fields.teilnehmer_1, userMap);
                    const name2 = getParticipantName(entry.fields.teilnehmer_2, userMap);
                    const dateStr = entry.fields.datum_von
                      ? format(parseISO(entry.fields.datum_von), 'dd.MM', { locale: de })
                      : '—';
                    const timeStr = entry.fields.datum_von
                      ? format(parseISO(entry.fields.datum_von), 'HH:mm', { locale: de })
                      : '';
                    const participants = [name1, name2].filter(Boolean).join(' & ');

                    return (
                      <div
                        key={entry.record_id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer active:scale-[0.98] transition-all"
                        style={{
                          borderLeft: `4px solid ${TOUR_COLORS[entry.fields.tour || ''] || 'hsl(214 20% 90%)'}`,
                        }}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="min-w-[40px]">
                          <div className="text-sm font-bold leading-tight">{dateStr}</div>
                          <div className="text-xs font-light text-muted-foreground">{timeStr}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {participants || 'Nicht zugewiesen'}
                          </p>
                        </div>
                        <TourBadge tour={entry.fields.tour} />
                        {idx < mobileEntries.length - 1 && (
                          <div className="absolute bottom-0 left-4 right-4 border-b border-border" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </section>

          {/* Tour Overview - horizontal cards */}
          <section>
            <h2 className="text-base font-semibold text-muted-foreground mb-3">
              Tour-Ubersicht
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {(['tour_1', 'tour_2', 'tour_3'] as const).map((tourKey) => (
                <Card
                  key={tourKey}
                  className="min-w-[110px] flex-shrink-0 pt-0 overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div
                    className="h-[3px]"
                    style={{ backgroundColor: TOUR_COLORS[tourKey] }}
                  />
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {TOUR_LABELS[tourKey]}
                    </p>
                    <p className="text-2xl font-extrabold mt-1">{tourCounts[tourKey]}</p>
                    <p className="text-xs font-light text-muted-foreground">Termine</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Participants */}
          <section>
            <h2 className="text-base font-semibold text-muted-foreground mb-3">Teilnehmer</h2>
            <Card>
              <CardContent className="p-0">
                {sortedUsers.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Keine Teilnehmer vorhanden.</p>
                  </div>
                ) : (
                  sortedUsers.map((user) => {
                    const fullName = [user.fields.vorname, user.fields.nachname]
                      .filter(Boolean)
                      .join(' ');
                    const count = participantCounts.get(user.record_id) || 0;
                    const isActive = filterUser === user.record_id;

                    return (
                      <div
                        key={user.record_id}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                          isActive ? 'bg-accent' : 'hover:bg-muted'
                        }`}
                        onClick={() =>
                          setFilterUser(isActive ? null : user.record_id)
                        }
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate">{fullName}</span>
                          {user.fields.versammlung && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              {user.fields.versammlung}
                            </Badge>
                          )}
                        </div>
                        <span className="flex items-center justify-center h-6 min-w-[24px] rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* === DESKTOP LAYOUT === */}
      <div className="hidden md:block">
        {/* Top Bar */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Gemeinsamer Terminkalender
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{today}</span>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer Termin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Neuer Termin</DialogTitle>
                  </DialogHeader>
                  <NewEntryForm
                    users={users}
                    onSuccess={handleCreateSuccess}
                    onClose={() => setDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* Filter indicator */}
          {filterUser && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">
                Filter: {getParticipantName(
                  createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, filterUser),
                  userMap
                ) || 'Teilnehmer'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilterUser(null)}
              >
                Zurucksetzen
              </Button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column (2/3) */}
            <div className="col-span-2 space-y-6">
              {/* Hero: Upcoming Entries */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-muted-foreground">
                    Nachste Termine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {desktopEntries.length === 0 ? (
                    <div className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        {filterUser
                          ? 'Keine anstehenden Termine fur diesen Teilnehmer.'
                          : 'Keine anstehenden Termine.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {desktopEntries.map((entry) => {
                        const name1 = getParticipantName(entry.fields.teilnehmer_1, userMap);
                        const name2 = getParticipantName(entry.fields.teilnehmer_2, userMap);

                        let dateLabel = '—';
                        let timeLabel = '';
                        if (entry.fields.datum_von) {
                          const parsed = parseISO(entry.fields.datum_von);
                          dateLabel = format(parsed, 'EE, dd.MM.', { locale: de });
                          timeLabel = format(parsed, 'HH:mm', { locale: de });
                          if (entry.fields.datum_bis) {
                            timeLabel += ' – ' + format(parseISO(entry.fields.datum_bis), 'HH:mm', { locale: de });
                          }
                        }

                        return (
                          <div
                            key={entry.record_id}
                            className="grid grid-cols-[140px_100px_1fr_1fr] items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <div>
                              <div className="text-sm font-semibold">{dateLabel}</div>
                              <div className="text-xs text-muted-foreground font-normal">
                                {timeLabel}
                              </div>
                            </div>
                            <div>
                              <TourBadge tour={entry.fields.tour} />
                            </div>
                            <div className="text-sm font-medium truncate">
                              {name1 || (
                                <span className="text-muted-foreground">— Nicht zugewiesen</span>
                              )}
                            </div>
                            <div className="text-sm font-medium truncate">
                              {name2 || (
                                <span className="text-muted-foreground">— Nicht zugewiesen</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tour Distribution Chart */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-muted-foreground">
                    Termine pro Tour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barSize={48}>
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 13, fill: 'hsl(215 15% 47%)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'hsl(215 15% 47%)' }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(0 0% 100%)',
                            border: '1px solid hsl(214 20% 90%)',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                          formatter={(value: number) => [`${value} Termine`, 'Anzahl']}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              {/* Tour Stats Cards */}
              <div className="space-y-3">
                {(['tour_1', 'tour_2', 'tour_3'] as const).map((tourKey) => (
                  <Card
                    key={tourKey}
                    className="shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex">
                      <div
                        className="w-1 shrink-0"
                        style={{ backgroundColor: TOUR_COLORS[tourKey] }}
                      />
                      <CardContent className="py-4 px-5 flex-1">
                        <p className="text-sm font-semibold">{TOUR_LABELS[tourKey]}</p>
                        <p className="text-3xl font-extrabold mt-1">{tourCounts[tourKey]}</p>
                        <p className="text-xs font-light text-muted-foreground">
                          Termine diesen Monat
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Participant List */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-muted-foreground">
                    Teilnehmer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedUsers.length === 0 ? (
                    <div className="py-8 text-center">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Keine Teilnehmer vorhanden.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto -mx-1 px-1 space-y-0">
                      {sortedUsers.map((user) => {
                        const fullName = [user.fields.vorname, user.fields.nachname]
                          .filter(Boolean)
                          .join(' ');
                        const count = participantCounts.get(user.record_id) || 0;
                        const isActive = filterUser === user.record_id;

                        return (
                          <div
                            key={user.record_id}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                              isActive ? 'bg-accent' : 'hover:bg-muted'
                            }`}
                            onClick={() =>
                              setFilterUser(isActive ? null : user.record_id)
                            }
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{fullName}</p>
                              {user.fields.versammlung && (
                                <p className="text-xs text-muted-foreground">
                                  {user.fields.versammlung}
                                </p>
                              )}
                            </div>
                            <span className="flex items-center justify-center h-6 min-w-[24px] rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0 ml-2">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
