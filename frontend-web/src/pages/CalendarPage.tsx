import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { CalendarSidebar } from '../components/calendar/CalendarSidebar';
import { PlanningDrawer } from '../components/calendar/planning/PlanningDrawer';
import { CreateScheduledSessionDialog } from '../components/planner/CreateScheduledSessionDialog';
import { MonthCalendar, moveMonth } from '../components/planner/MonthCalendar';
import { WeeklyTimeGrid } from '../components/planner/WeeklyTimeGrid';
import { SessionModal } from '../components/subjects/modals/SessionModal';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import {
    addDays,
    dateKey,
    localDateFromTimestamp,
} from '../lib/planner-dates';
import {
    WEEK_GRID_MINUTES,
    WEEK_GRID_START_HOUR,
    weekGridDates,
    type GridSelection,
} from '../lib/week-grid';
import { getApiErrorMessage } from '../services/api';
import { assessmentService } from '../services/assessment-service';
import { deadlineService } from '../services/deadline-service';
import { scheduledSessionService } from '../services/scheduled-session-service';
import { sessionService } from '../services/session-service';
import { settingsService } from '../services/settings-service';
import { subjectService } from '../services/subject-service';
import { topicService } from '../services/topic-service';
import type { Assessment } from '../types/assessment';
import type {
    CalendarEventChip,
    CalendarLayer,
    CalendarView,
} from '../types/calendar';
import type { Deadline } from '../types/deadline';
import type { ScheduledSession } from '../types/scheduled-session';
import type { Session, UpdateSessionDTO } from '../types/session';
import type { Subject } from '../types/subject';
import type { Topic } from '../types/topic';

const STORAGE_KEY_SUBJECTS = 'studyzen_calendar_visible_subjects';
const STORAGE_KEY_LAYERS = 'studyzen_calendar_visible_layers';
const STORAGE_KEY_PLANNING = 'studyzen_calendar_planning_drawer_open';

const DEFAULT_LAYERS: CalendarLayer[] = [
    'scheduled',
    'completed',
    'deadlines',
    'exams',
];

const localTimestamp = (value: Date) => {
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${dateKey(value)}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
};

export function CalendarPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const notify = useToast();

    const viewParam = searchParams.get('view') as CalendarView | null;
    const dateParam = searchParams.get('date');

    const view: CalendarView = useMemo(() => {
        if (viewParam === 'day' || viewParam === 'month' || viewParam === 'week') {
            return viewParam;
        }
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            return 'day';
        }
        return 'week';
    }, [viewParam]);

    const currentDate: Date = useMemo(() => {
        if (!dateParam) return new Date();
        const parsed = new Date(`${dateParam}T12:00:00`);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }, [dateParam]);

    const setDate = useCallback(
        (newDate: Date) => {
            const nextKey = dateKey(newDate);
            setSearchParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    p.set('date', nextKey);
                    return p;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const setView = useCallback(
        (nextView: CalendarView) => {
            setSearchParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    p.set('view', nextView);
                    return p;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [planningDrawerOpen, setPlanningDrawerOpen] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_PLANNING);
            if (saved !== null) return JSON.parse(saved) as boolean;
        } catch {
            return window.innerWidth >= 1280;
        }
        return window.innerWidth >= 1280;
    });

    const togglePlanningDrawer = () => {
        setPlanningDrawerOpen((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY_PLANNING, JSON.stringify(next));
            } catch {
            }
            return next;
        });
    };

    const [visibleSubjectIds, setVisibleSubjectIds] = useState<Set<number>>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_SUBJECTS);
            if (saved) return new Set(JSON.parse(saved) as number[]);
        } catch {
        }
        return new Set();
    });
    const hasInitializedSubjects = useRef(false);

    const [includeGeneralSubject, setIncludeGeneralSubject] = useState(true);

    const [visibleLayers, setVisibleLayers] = useState<Set<CalendarLayer>>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_LAYERS);
            if (saved) return new Set(JSON.parse(saved) as CalendarLayer[]);
        } catch {
        }
        return new Set(DEFAULT_LAYERS);
    });

    const persistSubjectIds = (set: Set<number>) => {
        setVisibleSubjectIds(set);
        try {
            localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(Array.from(set)));
        } catch {
        }
    };

    const persistLayers = (set: Set<CalendarLayer>) => {
        setVisibleLayers(set);
        try {
            localStorage.setItem(STORAGE_KEY_LAYERS, JSON.stringify(Array.from(set)));
        } catch {
        }
    };

    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selection, setSelection] = useState<GridSelection | null>(null);
    const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null);
    const [editingStudySession, setEditingStudySession] = useState<Session | null>(null);

    const requestId = useRef(0);

    const weekDates = useMemo(
        () => weekGridDates(currentDate, weekStartsOn),
        [currentDate, weekStartsOn]
    );

    const activeGridDates = useMemo(() => {
        if (view === 'day') {
            return [currentDate];
        }
        return weekDates;
    }, [view, currentDate, weekDates]);

    const fetchRange = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month + 2, 0);
        return {
            start: `${dateKey(start)} 00:00:00`,
            end: `${dateKey(end)} 23:59:59`,
        };
    }, [currentDate]);

    const loadData = useCallback(async () => {
        const currentReq = ++requestId.current;
        const isCurrent = () => currentReq === requestId.current;

        setLoading(true);
        try {
            const [
                schedItems,
                subjectItems,
                topicItems,
                settings,
                studyItems,
                deadlineItems,
                assessmentItems,
            ] = await Promise.all([
                scheduledSessionService.getAll(fetchRange.start, fetchRange.end),
                subjectService.getAll(),
                topicService.getAll(),
                settingsService.getSettings(),
                sessionService.getAll({
                    start: fetchRange.start.replace(' ', 'T'),
                    end: fetchRange.end.replace(' ', 'T'),
                    size: 1000,
                }),
                deadlineService.getAll(
                    fetchRange.start.replace(' ', 'T'),
                    fetchRange.end
                ),
                assessmentService.getAll(),
            ]);

            if (!isCurrent()) return;

            setScheduled(schedItems);
            setSubjects(subjectItems);
            setTopics(topicItems);
            setSessions(studyItems);
            setDeadlines(deadlineItems);
            setAssessments(assessmentItems);

            const nextWeekStartsOn = Number.isInteger(settings.weekStartsOn)
                ? (settings.weekStartsOn as number)
                : 1;
            setWeekStartsOn(nextWeekStartsOn);

            if (!hasInitializedSubjects.current) {
                hasInitializedSubjects.current = true;
                const saved = localStorage.getItem(STORAGE_KEY_SUBJECTS);
                if (!saved) {
                    const allIds = new Set(subjectItems.map((s) => s.id));
                    setVisibleSubjectIds(allIds);
                    localStorage.setItem(
                        STORAGE_KEY_SUBJECTS,
                        JSON.stringify(Array.from(allIds))
                    );
                }
            }
        } catch (err) {
            if (isCurrent()) {
                notify({
                    title: 'Could not load calendar data',
                    description: getApiErrorMessage(err),
                    tone: 'error',
                });
            }
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [fetchRange.start, fetchRange.end, notify]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const subjectById = useMemo(
        () => new Map(subjects.map((s) => [s.id, s])),
        [subjects]
    );

    const topicById = useMemo(
        () => new Map(topics.map((t) => [t.id, t])),
        [topics]
    );

    const isSubjectVisible = useCallback(
        (subjectId?: number | null) => {
            if (subjectId === undefined || subjectId === null) {
                return includeGeneralSubject;
            }
            return visibleSubjectIds.has(subjectId);
        },
        [visibleSubjectIds, includeGeneralSubject]
    );

    const filteredScheduled = useMemo(() => {
        if (!visibleLayers.has('scheduled')) return [];
        return scheduled.filter((s) => {
            const topic = topicById.get(s.topicId);
            return isSubjectVisible(topic?.subjectId);
        });
    }, [scheduled, visibleLayers, topicById, isSubjectVisible]);

    const filteredSessions = useMemo(() => {
        if (!visibleLayers.has('completed')) return [];
        return sessions.filter((s) => {
            const topic = topicById.get(s.topicId);
            return isSubjectVisible(topic?.subjectId);
        });
    }, [sessions, visibleLayers, topicById, isSubjectVisible]);

    const filteredDeadlines = useMemo(() => {
        if (!visibleLayers.has('deadlines')) return [];
        return deadlines.filter((d) => isSubjectVisible(d.subjectId));
    }, [deadlines, visibleLayers, isSubjectVisible]);

    const filteredAssessments = useMemo(() => {
        if (!visibleLayers.has('exams')) return [];
        return assessments.filter((a) => isSubjectVisible(a.subjectId));
    }, [assessments, visibleLayers, isSubjectVisible]);

    const monthEventChips = useMemo<CalendarEventChip[]>(() => {
        const chips: CalendarEventChip[] = [];

        for (const s of filteredScheduled) {
            const startD = localDateFromTimestamp(s.startedAt);
            if (!startD) continue;
            const key = dateKey(startD);
            const timeLabel = `${String(startD.getHours()).padStart(2, '0')}:${String(
                startD.getMinutes()
            ).padStart(2, '0')}`;
            const topic = topicById.get(s.topicId);
            const subj = topic?.subjectId ? subjectById.get(topic.subjectId) : undefined;
            chips.push({
                id: `sched-${s.id}`,
                originalId: s.id,
                kind: 'scheduled',
                title: s.title || topic?.name || subj?.name || 'Study Block',
                dateKey: key,
                timeLabel,
                color: subj?.color || 'var(--accent-color)',
                subjectColor: subj?.color || 'var(--accent-color)',
                completed: false,
                subjectId: topic?.subjectId,
                subjectName: subj?.name,
                rawItem: s,
            });
        }

        for (const sess of filteredSessions) {
            const startD = localDateFromTimestamp(sess.startedAt);
            if (!startD) continue;
            const key = dateKey(startD);
            const timeLabel = `${String(startD.getHours()).padStart(2, '0')}:${String(
                startD.getMinutes()
            ).padStart(2, '0')}`;
            const topic = topicById.get(sess.topicId);
            const subj = topic?.subjectId ? subjectById.get(topic.subjectId) : undefined;
            chips.push({
                id: `session-${sess.id}`,
                originalId: sess.id,
                kind: 'completed',
                title: sess.title || topic?.name || subj?.name || 'Completed Session',
                dateKey: key,
                timeLabel,
                color: subj?.color || 'var(--accent-color)',
                subjectColor: subj?.color || 'var(--accent-color)',
                completed: true,
                subjectId: topic?.subjectId,
                subjectName: subj?.name,
                rawItem: sess,
            });
        }

        for (const d of filteredDeadlines) {
            const dueD = localDateFromTimestamp(d.dueAt);
            if (!dueD) continue;
            const key = dateKey(dueD);
            const timeLabel = !d.allDay
                ? `${String(dueD.getHours()).padStart(2, '0')}:${String(dueD.getMinutes()).padStart(2, '0')}`
                : undefined;
            const subj = d.subjectId ? subjectById.get(d.subjectId) : undefined;
            const isExam = d.type === 'exam';
            chips.push({
                id: `deadline-${d.id}`,
                originalId: d.id,
                kind: isExam ? 'assessment' : 'deadline',
                title: d.title,
                dateKey: key,
                timeLabel,
                color: subj?.color || 'var(--accent-color)',
                subjectColor: subj?.color || 'var(--accent-color)',
                completed: d.isCompleted,
                subjectId: d.subjectId,
                subjectName: subj?.name,
                rawItem: d,
            });
        }

        for (const a of filteredAssessments) {
            if (!a.dueAt) continue;
            const dueD = localDateFromTimestamp(a.dueAt);
            if (!dueD) continue;
            const key = dateKey(dueD);
            const timeLabel = !a.allDay
                ? `${String(dueD.getHours()).padStart(2, '0')}:${String(dueD.getMinutes()).padStart(2, '0')}`
                : undefined;
            const subj = a.subjectId ? subjectById.get(a.subjectId) : undefined;
            chips.push({
                id: `assessment-${a.id}`,
                originalId: a.id,
                kind: 'assessment',
                title: a.title,
                dateKey: key,
                timeLabel,
                color: subj?.color || 'var(--accent-color)',
                subjectColor: subj?.color || 'var(--accent-color)',
                completed: a.completed,
                subjectId: a.subjectId,
                subjectName: subj?.name,
                rawItem: a,
            });
        }

        return chips;
    }, [filteredScheduled, filteredSessions, filteredDeadlines, filteredAssessments, subjectById, topicById]);

    const handleToday = () => setDate(new Date());

    const handlePrev = useCallback(() => {
        if (view === 'day') {
            setDate(addDays(currentDate, -1));
        } else if (view === 'week') {
            setDate(addDays(currentDate, -7));
        } else {
            setDate(moveMonth(currentDate, -1));
        }
    }, [view, currentDate, setDate]);

    const handleNext = useCallback(() => {
        if (view === 'day') {
            setDate(addDays(currentDate, 1));
        } else if (view === 'week') {
            setDate(addDays(currentDate, 7));
        } else {
            setDate(moveMonth(currentDate, 1));
        }
    }, [view, currentDate, setDate]);

    const calendarMainRef = useRef<HTMLDivElement>(null);

    useSwipeGesture(calendarMainRef, {
        onSwipeLeft: handleNext,
        onSwipeRight: handlePrev,
    });

    const handleToggleSubject = (id: number) => {
        const next = new Set(visibleSubjectIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persistSubjectIds(next);
    };

    const handleSelectAllSubjects = () => {
        persistSubjectIds(new Set(subjects.map((s) => s.id)));
    };

    const handleDeselectAllSubjects = () => {
        persistSubjectIds(new Set());
    };

    const handleToggleLayer = (layer: CalendarLayer) => {
        const next = new Set(visibleLayers);
        if (next.has(layer)) next.delete(layer);
        else next.add(layer);
        persistLayers(next);
    };

    const handleMoveSession = async (
        session: ScheduledSession,
        date: Date,
        startMinutes: number
    ) => {
        const duration = session.endedAt
            ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
            : 60 * 60 * 1000;
        const durationMinutes = Math.max(15, Math.round(duration / 60000));
        const boundedStart = Math.max(
            0,
            Math.min(startMinutes, WEEK_GRID_MINUTES - durationMinutes)
        );
        const start = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            WEEK_GRID_START_HOUR,
            0
        );
        start.setMinutes(start.getMinutes() + boundedStart);
        const end = new Date(start.getTime() + duration);

        try {
            await scheduledSessionService.patch(session.id, {
                startedAt: localTimestamp(start),
                endedAt: localTimestamp(end),
            });
            notify({ title: 'Study session rescheduled', tone: 'success' });
            void loadData();
        } catch (err) {
            notify({
                title: 'Could not reschedule session',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
        }
    };

    const handleSaveStudySession = async (data: UpdateSessionDTO) => {
        if (!editingStudySession) return;
        try {
            const updated = await sessionService.update(editingStudySession.id, data);
            setSessions((curr) =>
                curr.map((item) => (item.id === updated.id ? updated : item))
            );
            setEditingStudySession(null);
            notify({ title: 'Study session updated', tone: 'success' });
        } catch (err) {
            notify({
                title: 'Could not update session',
                description: getApiErrorMessage(err),
                tone: 'error',
            });
            throw err;
        }
    };

    const handleSavedScheduledSession = () => {
        setSelection(null);
        setEditingSession(null);
        notify({
            title: editingSession ? 'Study session updated' : 'Study session created',
            tone: 'success',
        });
        void loadData();
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
            <CalendarHeader
                date={currentDate}
                view={view}
                weekStartsOn={weekStartsOn}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                planningDrawerOpen={planningDrawerOpen}
                onTogglePlanningDrawer={togglePlanningDrawer}
                onToday={handleToday}
                onPrev={handlePrev}
                onNext={handleNext}
                onViewChange={setView}
                onCreateEvent={() =>
                    setSelection({
                        date: currentDate,
                        startMinutes: 540,
                        endMinutes: 600,
                    })
                }
            />

            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                <CalendarSidebar
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                    selectedDate={currentDate}
                    view={view}
                    onSelectDate={setDate}
                    weekStartsOn={weekStartsOn}
                    subjects={subjects}
                    visibleSubjectIds={visibleSubjectIds}
                    onToggleSubject={handleToggleSubject}
                    onSelectAllSubjects={handleSelectAllSubjects}
                    onDeselectAllSubjects={handleDeselectAllSubjects}
                    includeGeneralSubject={includeGeneralSubject}
                    onToggleGeneralSubject={() => setIncludeGeneralSubject((prev) => !prev)}
                    visibleLayers={visibleLayers}
                    onToggleLayer={handleToggleLayer}
                    onCreateEvent={() =>
                        setSelection({
                            date: currentDate,
                            startMinutes: 540,
                            endMinutes: 600,
                        })
                    }
                />

                <main ref={calendarMainRef} className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4 touch-pan-y">
                    {loading && scheduled.length === 0 && sessions.length === 0 ? (
                        <div className="space-y-4" role="status" aria-label="Loading calendar">
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 7 }, (_, i) => (
                                    <Skeleton key={i} className="h-10 sm:h-12" rounded="lg" />
                                ))}
                            </div>
                            <div className="h-96 w-full rounded-2xl border border-[var(--app-border)] p-4">
                                <Skeleton className="h-full w-full" rounded="lg" />
                            </div>
                        </div>
                    ) : view === 'month' ? (
                        <MonthCalendar
                            month={currentDate}
                            selectedDate={currentDate}
                            weekStartsOn={weekStartsOn}
                            eventChips={monthEventChips}
                            onSelect={setDate}
                            onSelectEvent={(chip) => {
                                if (chip.kind === 'scheduled') {
                                    setEditingSession(chip.rawItem as ScheduledSession);
                                } else if (chip.kind === 'completed') {
                                    setEditingStudySession(chip.rawItem as Session);
                                }
                            }}
                            onCreateEventOnDate={(d) => {
                                setDate(d);
                                setSelection({
                                    date: d,
                                    startMinutes: 540,
                                    endMinutes: 600,
                                });
                            }}
                        />
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col">
                            <WeeklyTimeGrid
                                dates={activeGridDates}
                                scheduled={filteredScheduled}
                                sessions={filteredSessions}
                                deadlines={filteredDeadlines}
                                assessments={filteredAssessments}
                                subjects={subjects}
                                topics={topics}
                                onCreate={setSelection}
                                onEdit={setEditingSession}
                                onEditStudySession={setEditingStudySession}
                                onMove={handleMoveSession}
                            />
                        </div>
                    )}
                </main>

                <button
                    type="button"
                    onClick={() =>
                        setSelection({
                            date: currentDate,
                            startMinutes: 540,
                            endMinutes: 600,
                        })
                    }
                    aria-label="Create new event"
                    className="fixed right-4 bottom-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-color)] text-white shadow-xl shadow-black/30 active:scale-95 transition-transform lg:hidden"
                >
                    <Plus size={22} strokeWidth={2.5} />
                </button>

                <PlanningDrawer
                    open={planningDrawerOpen}
                    onClose={() => setPlanningDrawerOpen(false)}
                    selectedDate={currentDate}
                    deadlines={deadlines}
                    assessments={assessments}
                    subjects={subjects}
                    sessions={sessions}
                    weekStartsOn={weekStartsOn}
                    onDeadlinesChange={loadData}
                />
            </div>

            {(selection || editingSession) && (
                <CreateScheduledSessionDialog
                    selection={
                        selection ?? {
                            date: currentDate,
                            startMinutes: 540,
                            endMinutes: 600,
                        }
                    }
                    session={editingSession ?? undefined}
                    subjects={subjects}
                    topics={topics}
                    onClose={() => {
                        setSelection(null);
                        setEditingSession(null);
                    }}
                    onCreated={handleSavedScheduledSession}
                    onSubjectCreated={(s) =>
                        setSubjects((curr) =>
                            curr.some((x) => x.id === s.id) ? curr : [...curr, s]
                        )
                    }
                    onTopicCreated={(t) =>
                        setTopics((curr) =>
                            curr.some((x) => x.id === t.id) ? curr : [...curr, t]
                        )
                    }
                />
            )}

            {editingStudySession && (
                <SessionModal
                    session={editingStudySession}
                    subjects={subjects}
                    topics={topics}
                    onClose={() => setEditingStudySession(null)}
                    onSave={handleSaveStudySession}
                />
            )}

        </div>
    );
}
