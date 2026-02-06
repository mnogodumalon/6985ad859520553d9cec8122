import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kalendereintraege, Benutzerverwaltung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isAfter, isBefore, isEqual } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Calendar, AlertCircle, Users, RefreshCw } from 'lucide-react';

// --- TOUR CONFIG ---
const TOUR_CONFIG: Record<string, { label: string; color: string; bgLight: string }> = {
  tour_1: { label: 'Tour 1', color: 'hsl(215 55% 45%)', bgLight: 'hsl(215 55% 45% / 0.15)' },
  tour_2: { label: 'Tour 2', color: 'hsl(35 75% 55%)', bgLight: 'hsl(35 75% 55% / 0.15)' },
  tour_3: { label: 'Tour 3', color: 'hsl(152 35% 48%)', bgLight: 'hsl(152 35% 48% / 0.15)' },
};

// --- HELPER: Get participant display name ---
function getParticipantName(
  participantUrl: string | undefined,
  userMap: Map<string, Benutzerverwaltung>
): string {
  if (!participantUrl) return '';
  const id = extractRecordId(participantUrl);
  if (!id) return '';
  const user = userMap.get(id);
  if (!user) return '';
  const vorname = user.fields.vorname || '';
  const nachname = user.fields.nachname || '';
  if (!vorname && !nachname) return '';
  return `${vorname} ${nachname.charAt(0)}.`;
}

function getParticipantFullName(
  participantUrl: string | undefined,
  userMap: Map<string, Benutzerverwaltung>
): string {
  if (!participantUrl) return '';
  const id = extractRecordId(participantUrl);
  if (!id) return '';
  const user = userMap.get(id);
  if (!user) return '';
  return `${user.fields.vorname || ''} ${user.fields.nachname || ''}`.trim();
}

function getInitials(user: Benutzerverwaltung): string {
  const v = user.fields.vorname?.charAt(0) || '';
  const n = user.fields.nachname?.charAt(0) || '';
  return (v + n).toUpperCase();
}

// --- HELPER: Date range checks ---
function isInWeek(dateStr: string | undefined, now: Date): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return (isAfter(date, weekStart) || isEqual(date, weekStart)) &&
           (isBefore(date, weekEnd) || isEqual(date, weekEnd));
  } catch {
    return false;
  }
}

function isInMonth(dateStr: string | undefined, now: Date): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return (isAfter(date, monthStart) || isEqual(date, monthStart)) &&
           (isBefore(date, monthEnd) || isEqual(date, monthEnd));
  } catch {
    return false;
  }
}

function isFutureOrToday(dateStr: string | undefined, now: Date): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return isAfter(date, todayStart) || isEqual(date, todayStart);
  } catch {
    return false;
  }
}

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const [entries, setEntries] = useState<Kalendereintraege[]>([]);
  const [users, setUsers] = useState<Benutzerverwaltung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tourFilter, setTourFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const isMobile = useIsMobile();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [e, u] = await Promise.all([
        LivingAppsService.getKalendereintraege(),
        LivingAppsService.getBenutzerverwaltung(),
      ]);
      setEntries(e);
      setUsers(u);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Daten konnten nicht geladen werden'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userMap = useMemo(() => {
    const map = new Map<string, Benutzerverwaltung>();
    users.forEach(u => map.set(u.record_id, u));
    return map;
  }, [users]);

  const now = useMemo(() => new Date(), []);

  // Filter entries by tour
  const filteredEntries = useMemo(() => {
    if (tourFilter === 'all') return entries;
    return entries.filter(e => e.fields.tour === tourFilter);
  }, [entries, tourFilter]);

  // This week's entries
  const weekEntries = useMemo(() => {
    return filteredEntries.filter(e => isInWeek(e.fields.datum_von, now));
  }, [filteredEntries, now]);

  // Per-tour breakdown for this week
  const tourBreakdown = useMemo(() => {
    const weekAll = entries.filter(e => isInWeek(e.fields.datum_von, now));
    return {
      tour_1: weekAll.filter(e => e.fields.tour === 'tour_1').length,
      tour_2: weekAll.filter(e => e.fields.tour === 'tour_2').length,
      tour_3: weekAll.filter(e => e.fields.tour === 'tour_3').length,
    };
  }, [entries, now]);

  // Upcoming entries (future or today, sorted ascending, limited to 10)
  const upcomingEntries = useMemo(() => {
    return filteredEntries
      .filter(e => isFutureOrToday(e.fields.datum_von, now))
      .sort((a, b) => (a.fields.datum_von || '').localeCompare(b.fields.datum_von || ''))
      .slice(0, 10);
  }, [filteredEntries, now]);

  // Group upcoming by date
  const groupedUpcoming = useMemo(() => {
    const groups: { date: string; entries: Kalendereintraege[] }[] = [];
    let currentDate = '';
    upcomingEntries.forEach(entry => {
      const dateStr = entry.fields.datum_von?.split('T')[0] || '';
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, entries: [entry] });
      } else {
        groups[groups.length - 1].entries.push(entry);
      }
    });
    return groups;
  }, [upcomingEntries]);

  // Tour distribution for current month
  const tourDistribution = useMemo(() => {
    const monthEntries = filteredEntries.filter(e => isInMonth(e.fields.datum_von, now));
    return [
      { name: 'Tour 1', count: monthEntries.filter(e => e.fields.tour === 'tour_1').length, key: 'tour_1' },
      { name: 'Tour 2', count: monthEntries.filter(e => e.fields.tour === 'tour_2').length, key: 'tour_2' },
      { name: 'Tour 3', count: monthEntries.filter(e => e.fields.tour === 'tour_3').length, key: 'tour_3' },
    ];
  }, [filteredEntries, now]);

  // Active participants with upcoming entry count
  const activeParticipants = useMemo(() => {
    const futureEntries = entries.filter(e => isFutureOrToday(e.fields.datum_von, now));
    const countMap = new Map<string, number>();

    futureEntries.forEach(entry => {
      const id1 = extractRecordId(entry.fields.teilnehmer_1);
      const id2 = extractRecordId(entry.fields.teilnehmer_2);
      if (id1) countMap.set(id1, (countMap.get(id1) || 0) + 1);
      if (id2) countMap.set(id2, (countMap.get(id2) || 0) + 1);
    });

    return users
      .map(u => ({
        user: u,
        count: countMap.get(u.record_id) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [users, entries, now]);

  const handleFormSuccess = useCallback(() => {
    setFormOpen(false);
    toast.success('Eintrag erstellt', { description: 'Der neue Kalendereintrag wurde gespeichert.' });
    fetchData();
  }, [fetchData]);

  // --- LOADING STATE ---
  if (loading) {
    return <LoadingState />;
  }

  // --- ERROR STATE ---
  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  const formElement = (
    <NewEntryForm
      users={users}
      onSuccess={handleFormSuccess}
      onCancel={() => setFormOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-bold text-foreground">Terminkalender</h1>
          <div className="flex items-center gap-3">
            <Select value={tourFilter} onValueChange={setTourFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue placeholder="Alle Touren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Touren</SelectItem>
                <SelectItem value="tour_1">Tour 1</SelectItem>
                <SelectItem value="tour_2">Tour 2</SelectItem>
                <SelectItem value="tour_3">Tour 3</SelectItem>
              </SelectContent>
            </Select>
            {!isMobile && (
              <Button
                onClick={() => setFormOpen(true)}
                className="rounded-full px-5 h-9 text-sm font-semibold"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Neuer Eintrag
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        {isMobile ? (
          <MobileLayout
            weekCount={weekEntries.length}
            tourBreakdown={tourBreakdown}
            groupedUpcoming={groupedUpcoming}
            tourDistribution={tourDistribution}
            activeParticipants={activeParticipants}
            userMap={userMap}
          />
        ) : (
          <DesktopLayout
            weekCount={weekEntries.length}
            tourBreakdown={tourBreakdown}
            groupedUpcoming={groupedUpcoming}
            tourDistribution={tourDistribution}
            activeParticipants={activeParticipants}
            userMap={userMap}
          />
        )}
      </main>

      {/* MOBILE: Fixed bottom button */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50" style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.08)' }}>
          <Button
            onClick={() => setFormOpen(true)}
            className="w-full h-[52px] rounded-xl text-base font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neuer Eintrag
          </Button>
        </div>
      )}

      {/* FORM: Dialog on desktop, Sheet on mobile */}
      {isMobile ? (
        <Sheet open={formOpen} onOpenChange={setFormOpen}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Neuer Eintrag</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto">{formElement}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neuer Eintrag</DialogTitle>
            </DialogHeader>
            {formElement}
          </DialogContent>
        </Dialog>
      )}

      {/* Bottom spacer for mobile fixed button */}
      {isMobile && <div className="h-24" />}
    </div>
  );
}

// ===========================
// MOBILE LAYOUT
// ===========================
interface LayoutProps {
  weekCount: number;
  tourBreakdown: { tour_1: number; tour_2: number; tour_3: number };
  groupedUpcoming: { date: string; entries: Kalendereintraege[] }[];
  tourDistribution: { name: string; count: number; key: string }[];
  activeParticipants: { user: Benutzerverwaltung; count: number }[];
  userMap: Map<string, Benutzerverwaltung>;
}

function MobileLayout({
  weekCount,
  tourBreakdown,
  groupedUpcoming,
  tourDistribution,
  activeParticipants,
  userMap,
}: LayoutProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Section */}
      <HeroSection weekCount={weekCount} tourBreakdown={tourBreakdown} />

      {/* Upcoming Entries Timeline */}
      <UpcomingTimeline groupedUpcoming={groupedUpcoming} userMap={userMap} />

      {/* Participant Chips (horizontal scroll) */}
      <section>
        <h2 className="text-base font-semibold mb-3">Teilnehmer</h2>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {activeParticipants.slice(0, 20).map(({ user, count }) => (
              <div
                key={user.record_id}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">
                  {getInitials(user)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.fields.vorname || ''} {(user.fields.nachname || '').charAt(0)}.
                  </div>
                  <div className="text-xs text-muted-foreground">{count} Termine</div>
                </div>
              </div>
            ))}
            {activeParticipants.length === 0 && (
              <div className="text-sm text-muted-foreground py-4">Keine Teilnehmer vorhanden</div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Tour Distribution - Stacked Bar for mobile */}
      <TourDistributionMobile tourDistribution={tourDistribution} />
    </div>
  );
}

// ===========================
// DESKTOP LAYOUT
// ===========================
function DesktopLayout({
  weekCount,
  tourBreakdown,
  groupedUpcoming,
  tourDistribution,
  activeParticipants,
  userMap,
}: LayoutProps) {
  return (
    <div className="grid grid-cols-[1fr_0.58fr] gap-6 animate-in fade-in duration-300">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        <HeroSection weekCount={weekCount} tourBreakdown={tourBreakdown} />
        <UpcomingTimeline groupedUpcoming={groupedUpcoming} userMap={userMap} />
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        <TourDistributionDesktop tourDistribution={tourDistribution} />
        <ParticipantList activeParticipants={activeParticipants} />
      </div>
    </div>
  );
}

// ===========================
// HERO SECTION
// ===========================
function HeroSection({
  weekCount,
  tourBreakdown,
}: {
  weekCount: number;
  tourBreakdown: { tour_1: number; tour_2: number; tour_3: number };
}) {
  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{ backgroundColor: 'hsl(215 40% 95%)' }}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
        Diese Woche
      </p>
      <p className="text-[56px] md:text-[64px] font-extrabold leading-none text-primary">
        {weekCount}
      </p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {weekCount === 1 ? 'Eintrag geplant' : 'Eintraege geplant'}
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(TOUR_CONFIG).map(([key, config]) => (
          <span
            key={key}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: config.bgLight,
              color: config.color,
            }}
          >
            {config.label}: {tourBreakdown[key as keyof typeof tourBreakdown]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===========================
// UPCOMING TIMELINE
// ===========================
function UpcomingTimeline({
  groupedUpcoming,
  userMap,
}: {
  groupedUpcoming: { date: string; entries: Kalendereintraege[] }[];
  userMap: Map<string, Benutzerverwaltung>;
}) {
  if (groupedUpcoming.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Keine kommenden Termine</p>
          <p className="text-xs text-muted-foreground mt-1">
            Erstelle einen neuen Eintrag, um loszulegen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Naechste Termine</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-border"
            aria-hidden
          />

          <div className="space-y-0">
            {groupedUpcoming.map((group) => {
              let formattedDate = group.date;
              try {
                formattedDate = format(parseISO(group.date), 'EE dd.MM.', { locale: de });
              } catch {
                // keep raw
              }

              return (
                <div key={group.date}>
                  {/* Date Badge */}
                  <div className="relative flex items-center mb-2 mt-4 first:mt-0">
                    <div className="relative z-10 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {formattedDate}
                    </div>
                  </div>

                  {/* Entries for this date */}
                  {group.entries.map((entry) => {
                    const timeFrom = entry.fields.datum_von
                      ? format(parseISO(entry.fields.datum_von), 'HH:mm')
                      : '--:--';
                    const timeTo = entry.fields.datum_bis
                      ? format(parseISO(entry.fields.datum_bis), 'HH:mm')
                      : '--:--';
                    const p1 = getParticipantName(entry.fields.teilnehmer_1, userMap);
                    const p2 = getParticipantName(entry.fields.teilnehmer_2, userMap);
                    const participants = [p1, p2].filter(Boolean).join(' & ');
                    const tourKey = entry.fields.tour;
                    const tourConfig = tourKey ? TOUR_CONFIG[tourKey] : null;

                    return (
                      <div
                        key={entry.record_id}
                        className="relative pl-9 py-2.5 hover:bg-accent/50 rounded-lg transition-colors -ml-1 pr-2"
                      >
                        {/* Dot on the line */}
                        <div
                          className="absolute left-[11px] top-[18px] w-[10px] h-[10px] rounded-full bg-card border-2 border-border z-10"
                          aria-hidden
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">
                              {timeFrom} - {timeTo}
                            </p>
                            <p className="text-sm font-medium text-foreground truncate">
                              {participants || (
                                <span className="italic text-muted-foreground">Nicht zugewiesen</span>
                              )}
                            </p>
                          </div>
                          {tourConfig && (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 w-fit"
                              style={{
                                backgroundColor: tourConfig.bgLight,
                                color: tourConfig.color,
                              }}
                            >
                              {tourConfig.label}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================
// TOUR DISTRIBUTION - MOBILE (Stacked Bar)
// ===========================
function TourDistributionMobile({
  tourDistribution,
}: {
  tourDistribution: { name: string; count: number; key: string }[];
}) {
  const total = tourDistribution.reduce((sum, t) => sum + t.count, 0);

  return (
    <section>
      <h2 className="text-base font-semibold mb-3">Tour-Verteilung</h2>
      <p className="text-xs text-muted-foreground mb-2">Dieser Monat</p>
      {total === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          Keine Eintraege in diesem Monat
        </div>
      ) : (
        <>
          <div className="flex w-full h-6 rounded-full overflow-hidden">
            {tourDistribution.map((t) => {
              if (t.count === 0) return null;
              const config = TOUR_CONFIG[t.key];
              const pct = (t.count / total) * 100;
              return (
                <div
                  key={t.key}
                  style={{ width: `${pct}%`, backgroundColor: config?.color }}
                  className="transition-all duration-300"
                  title={`${t.name}: ${t.count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {tourDistribution.map((t) => {
              const config = TOUR_CONFIG[t.key];
              return (
                <div key={t.key} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: config?.color }}
                  />
                  <span className="text-muted-foreground">
                    {t.name}: <span className="font-semibold text-foreground">{t.count}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

// ===========================
// TOUR DISTRIBUTION - DESKTOP (Bar Chart)
// ===========================
function TourDistributionDesktop({
  tourDistribution,
}: {
  tourDistribution: { name: string; count: number; key: string }[];
}) {
  const total = tourDistribution.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tour-Verteilung</CardTitle>
        <p className="text-xs text-muted-foreground">Dieser Monat</p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Keine Eintraege in diesem Monat
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tourDistribution} barCategoryGap="25%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'hsl(220 10% 50%)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(220 10% 50%)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(220 15% 90%)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [value, 'Eintraege']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {tourDistribution.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={TOUR_CONFIG[entry.key]?.color || 'hsl(220 15% 70%)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================
// PARTICIPANT LIST - DESKTOP
// ===========================
function ParticipantList({
  activeParticipants,
}: {
  activeParticipants: { user: Benutzerverwaltung; count: number }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Aktive Teilnehmer</CardTitle>
      </CardHeader>
      <CardContent>
        {activeParticipants.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
            Keine Teilnehmer vorhanden
          </div>
        ) : (
          <div className="space-y-1">
            {activeParticipants.slice(0, 15).map(({ user, count }) => (
              <div
                key={user.record_id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground shrink-0">
                  {getInitials(user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.fields.vorname || ''} {user.fields.nachname || ''}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================
// NEW ENTRY FORM
// ===========================
function NewEntryForm({
  users,
  onSuccess,
  onCancel,
}: {
  users: Benutzerverwaltung[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [datumVon, setDatumVon] = useState('');
  const [zeitVon, setZeitVon] = useState('09:00');
  const [datumBis, setDatumBis] = useState('');
  const [zeitBis, setZeitBis] = useState('11:00');
  const [teilnehmer1, setTeilnehmer1] = useState('');
  const [teilnehmer2, setTeilnehmer2] = useState('');
  const [tour, setTour] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) =>
        `${a.fields.vorname} ${a.fields.nachname}`.localeCompare(
          `${b.fields.vorname} ${b.fields.nachname}`
        )
      ),
    [users]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!datumVon || !zeitVon) {
      toast.error('Bitte Datum und Uhrzeit angeben');
      return;
    }

    setSubmitting(true);
    try {
      const fields: Kalendereintraege['fields'] = {
        datum_von: `${datumVon}T${zeitVon}`,
        datum_bis: datumBis && zeitBis ? `${datumBis}T${zeitBis}` : undefined,
        teilnehmer_1: teilnehmer1
          ? createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer1)
          : undefined,
        teilnehmer_2: teilnehmer2
          ? createRecordUrl(APP_IDS.BENUTZERVERWALTUNG, teilnehmer2)
          : undefined,
        tour: tour as Kalendereintraege['fields']['tour'],
      };

      await LivingAppsService.createKalendereintraegeEntry(fields);
      onSuccess();
    } catch (err) {
      toast.error('Fehler beim Erstellen', {
        description: err instanceof Error ? err.message : 'Bitte versuche es erneut.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datum Von */}
      <div className="space-y-1.5">
        <Label htmlFor="datum_von" className="text-sm font-medium">
          Von
        </Label>
        <div className="flex gap-2">
          <Input
            id="datum_von"
            type="date"
            value={datumVon}
            onChange={(e) => {
              setDatumVon(e.target.value);
              if (!datumBis) setDatumBis(e.target.value);
            }}
            required
            className="flex-1"
          />
          <Input
            type="time"
            value={zeitVon}
            onChange={(e) => setZeitVon(e.target.value)}
            required
            className="w-[110px]"
          />
        </div>
      </div>

      {/* Datum Bis */}
      <div className="space-y-1.5">
        <Label htmlFor="datum_bis" className="text-sm font-medium">
          Bis
        </Label>
        <div className="flex gap-2">
          <Input
            id="datum_bis"
            type="date"
            value={datumBis}
            onChange={(e) => setDatumBis(e.target.value)}
            className="flex-1"
          />
          <Input
            type="time"
            value={zeitBis}
            onChange={(e) => setZeitBis(e.target.value)}
            className="w-[110px]"
          />
        </div>
      </div>

      {/* Teilnehmer 1 */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Teilnehmer 1</Label>
        <Select value={teilnehmer1 || 'none'} onValueChange={(v) => setTeilnehmer1(v === 'none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Teilnehmer waehlen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Kein Teilnehmer --</SelectItem>
            {sortedUsers.map((u) => (
              <SelectItem key={u.record_id} value={u.record_id}>
                {u.fields.vorname || ''} {u.fields.nachname || ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teilnehmer 2 */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Teilnehmer 2</Label>
        <Select value={teilnehmer2 || 'none'} onValueChange={(v) => setTeilnehmer2(v === 'none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Teilnehmer waehlen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Kein Teilnehmer --</SelectItem>
            {sortedUsers.map((u) => (
              <SelectItem key={u.record_id} value={u.record_id}>
                {u.fields.vorname || ''} {u.fields.nachname || ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tour */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Tour</Label>
        <Select value={tour || 'none'} onValueChange={(v) => setTour(v === 'none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Tour waehlen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Keine Tour --</SelectItem>
            <SelectItem value="tour_1">Tour 1</SelectItem>
            <SelectItem value="tour_2">Tour 2</SelectItem>
            <SelectItem value="tour_3">Tour 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Wird gespeichert...' : 'Eintrag erstellen'}
        </Button>
      </div>
    </form>
  );
}

// ===========================
// LOADING STATE
// ===========================
function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </main>
    </div>
  );
}

// ===========================
// ERROR STATE
// ===========================
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm mb-3">{error.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
