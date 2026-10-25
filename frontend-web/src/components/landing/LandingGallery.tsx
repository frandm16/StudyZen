import { useState, type KeyboardEvent } from 'react';
import { Timer, BookOpen, Calendar, CalendarDays, CalendarRange, BarChart3, Maximize2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ImageLightbox } from './ImageLightbox';
import type { ScreenshotId } from '../../types/landing';

interface GalleryScreen {
    id: ScreenshotId;
    label: string;
    role: string;
    headline: string;
    caption: string;
    route: string;
    lightSrc: string;
    darkSrc: string;
    alt: string;
    icon: typeof Timer;
}

const SCREENS: GalleryScreen[] = [
    {
        id: 'timer',
        label: 'Focus timer',
        role: 'Session execution',
        headline: 'Flexible interval timers with concentration ratings',
        caption: 'Switch between Pomodoro intervals, open stopwatch, or countdown timers. Save finished blocks with self-evaluated focus scores and personal notes.',
        route: 'studyzen.frandm.dev/timer',
        lightSrc: '/landing/Timer-Running-LightMode.png',
        darkSrc: '/landing/Timer-Running-DarkMode.png',
        alt: 'StudyZen active focus timer running with a selected study topic and session controls',
        icon: Timer,
    },
    {
        id: 'subjects',
        label: 'Academic subjects',
        role: 'Coursework hierarchy',
        headline: 'Courses, topics, and assessment tracking',
        caption: 'Group study content by academic term, manage courses with color identifiers, break them down into modules, and record upcoming evaluations with target weights.',
        route: 'studyzen.frandm.dev/subjects',
        lightSrc: '/landing/Subjects-LightMode.png',
        darkSrc: '/landing/Subjects-DarkMode.png',
        alt: 'StudyZen subjects screen showing course progress, topic breakdown, and evaluation records',
        icon: BookOpen,
    },
    {
        id: 'planning',
        label: 'Planning calendar',
        role: 'Monthly milestones',
        headline: 'Term-wide calendar for deadlines and study blocks',
        caption: 'View upcoming assignment due dates, scheduled exam periods, and allocated study sessions across a unified monthly perspective.',
        route: 'studyzen.frandm.dev/planner',
        lightSrc: '/landing/Planning-LightMode.png',
        darkSrc: '/landing/Planning-DarkMode.png',
        alt: 'StudyZen planning calendar displaying scheduled study sessions, deadlines, and task checklists',
        icon: Calendar,
    },
    {
        id: 'daily',
        label: 'Daily timeline',
        role: 'Hourly time-blocking',
        headline: 'Day-by-day scheduling with task priorities',
        caption: 'Organize your day through an hour-by-hour timeline. Check off targeted study to-dos and adapt scheduled blocks to your actual availability.',
        route: 'studyzen.frandm.dev/day',
        lightSrc: '/landing/Daily-LightMode.png',
        darkSrc: '/landing/Daily-DarkMode.png',
        alt: 'StudyZen daily view featuring an hourly timeline and a list of daily study goals',
        icon: CalendarDays,
    },
    {
        id: 'weekly',
        label: 'Weekly grid',
        role: 'Workload balance',
        headline: 'Seven-day distribution of study sessions',
        caption: 'Distribute study hours across weekdays to ensure balanced preparation without last-minute cramming before major academic deadlines.',
        route: 'studyzen.frandm.dev/week',
        lightSrc: '/landing/Weekly-LightMode.png',
        darkSrc: '/landing/Weekly-DarkMode.png',
        alt: 'StudyZen weekly planner showing distribution of study sessions across seven days',
        icon: CalendarRange,
    },
    {
        id: 'stats',
        label: 'Study analytics',
        role: 'Progress telemetry',
        headline: 'Cumulative focus hours and subject breakdowns',
        caption: 'Review historical study logs, analyze time invested per course, and inspect weekly and monthly focus rating trends.',
        route: 'studyzen.frandm.dev/dashboard',
        lightSrc: '/landing/Stats-LightMode.png',
        darkSrc: '/landing/Stats-DarkMode.png',
        alt: 'StudyZen analytics view featuring study hours charts, subject distributions, and session history',
        icon: BarChart3,
    },
];

export function LandingGallery() {
    const { colorMode } = useTheme();
    const isDark = colorMode === 'dark';
    const [selectedId, setSelectedId] = useState<ScreenshotId>('timer');
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const activeScreen = SCREENS.find((s) => s.id === selectedId) ?? SCREENS[0];
    const currentIndex = SCREENS.findIndex((s) => s.id === selectedId);
    const currentSrc = isDark ? activeScreen.darkSrc : activeScreen.lightSrc;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        let nextIndex: number | null = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % SCREENS.length;
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + SCREENS.length) % SCREENS.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = SCREENS.length - 1;
        }

        if (nextIndex !== null) {
            event.preventDefault();
            const target = SCREENS[nextIndex];
            setSelectedId(target.id);
            document.getElementById(`gallery-tab-${target.id}`)?.focus();
        }
    };

    return (
        <section id="gallery" aria-labelledby="gallery-title" className="w-full py-16 scroll-mt-24 sm:py-24 border-t border-[var(--app-border)]">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-[var(--accent-color)] uppercase">
                            Interactive gallery
                        </p>
                        <h2
                            id="gallery-title"
                            className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--app-text)] sm:text-4xl"
                        >
                            Explore authentic views of the application
                        </h2>
                    </div>
                    <span className="text-xs font-medium text-[var(--app-text-muted)]" aria-live="polite">
                        View {currentIndex + 1} of {SCREENS.length}
                    </span>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
                    <div
                        role="tablist"
                        aria-label="Application screens"
                        onKeyDown={handleKeyDown}
                        className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
                    >
                        {SCREENS.map((screen) => {
                            const Icon = screen.icon;
                            const isSelected = screen.id === selectedId;

                            return (
                                <button
                                    key={screen.id}
                                    id={`gallery-tab-${screen.id}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    aria-controls={`gallery-panel-${screen.id}`}
                                    tabIndex={isSelected ? 0 : -1}
                                    onClick={() => setSelectedId(screen.id)}
                                    className={`group flex shrink-0 items-center justify-between rounded-xl border p-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] lg:w-full ${
                                        isSelected
                                            ? 'border-[var(--accent-color)] bg-[var(--app-card-bg)] shadow-sm'
                                            : 'border-[var(--app-border)] bg-[var(--app-bg)] hover:border-[var(--accent-color)]/50 hover:bg-[var(--app-card-bg)]/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                isSelected
                                                    ? 'bg-[var(--accent-color)] text-[var(--app-bg)]'
                                                    : 'border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p
                                                className={`text-sm font-bold ${
                                                    isSelected ? 'text-[var(--app-text)]' : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
                                                }`}
                                            >
                                                {screen.label}
                                            </p>
                                            <p className="text-xs text-[var(--app-text-muted)]">
                                                {screen.role}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        id={`gallery-panel-${activeScreen.id}`}
                        role="tabpanel"
                        aria-labelledby={`gallery-tab-${activeScreen.id}`}
                        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-5 shadow-xl transition-all sm:p-7"
                    >
                        <div className="mb-6 flex flex-col gap-2 border-b border-[var(--app-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--app-text)] sm:text-2xl">
                                    {activeScreen.headline}
                                </h3>
                                <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
                                    {activeScreen.caption}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] shadow-md">
                            <div className="flex h-9 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-card-bg)]/80 px-4">
                                <span className="font-mono text-xs text-[var(--app-text-muted)]">
                                    {activeScreen.route}
                                </span>
                            </div>

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setIsZoomOpen(true)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsZoomOpen(true)}
                                aria-label={`Click to enlarge ${activeScreen.label} screenshot`}
                                className="group relative  w-full cursor-zoom-in bg-[var(--app-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                            >
                                <img
                                    key={`${activeScreen.id}-${colorMode}`}
                                    src={currentSrc}
                                    alt={activeScreen.alt}
                                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                                    loading="lazy"
                                />
                                <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)]/90 px-2.5 py-1 text-xs font-medium text-[var(--app-text)] opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Click to enlarge
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageLightbox
                isOpen={isZoomOpen}
                onClose={() => setIsZoomOpen(false)}
                src={currentSrc}
                alt={activeScreen.alt}
                title={`${activeScreen.label}`}
            />
        </section>
    );
}
