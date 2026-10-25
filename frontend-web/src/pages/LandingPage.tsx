import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Moon, Sun, Timer, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/navbar/NavbarIcons';

type LandingColorMode = 'light' | 'dark';
type LandingThemePreference = LandingColorMode | 'system';
type ScreenshotId = 'timer' | 'subjects' | 'planning';

const LANDING_THEME_STORAGE_KEY = 'studyzen_landing_theme';

const screenshots: { id: ScreenshotId; label: string; title: string; description: string; light: string; dark: string; alt: string; icon: typeof Timer }[] = [
    {
        id: 'timer',
        label: 'Focus timer',
        title: 'Make space for focused work.',
        description: 'Start a Pomodoro, stopwatch, or countdown session and keep your current study task close at hand.',
        light: '/landing/Timer-Running-LightMode.png',
        dark: '/landing/Timer-Running-DarkMode.png',
        alt: 'StudyZen focus timer running with a selected study topic and session controls',
        icon: Timer,
    },
    {
        id: 'subjects',
        label: 'Subjects',
        title: 'Keep every course moving.',
        description: 'Bring topics, study time, and upcoming assessments together for each subject.',
        light: '/landing/Subjects-LightMode.png',
        dark: '/landing/Subjects-DarkMode.png',
        alt: 'StudyZen academic subjects screen showing courses, topic progress, and evaluations',
        icon: BookOpen,
    },
    {
        id: 'planning',
        label: 'Planning',
        title: 'See the work ahead.',
        description: 'Use your calendar to keep deadlines, to-dos, goals, and study sessions in view.',
        light: '/landing/Planning-LightMode.png',
        dark: '/landing/Planning-DarkMode.png',
        alt: 'StudyZen planning calendar with study goals, upcoming deadlines, and to-dos',
        icon: CalendarDays,
    },
];

const workflow = [
    { number: '01', title: 'Organize', description: 'Keep subjects, topics, and assessments in one place.', icon: BookOpen },
    { number: '02', title: 'Plan', description: 'Turn upcoming work into a schedule you can follow.', icon: CalendarDays },
    { number: '03', title: 'Focus', description: 'Start a session and give one task your attention.', icon: Timer },
    { number: '04', title: 'Reflect', description: 'Review your study history and the progress you have made.', icon: TrendingUp },
];

function getInitialPreference(): LandingThemePreference {
    try {
        const stored = localStorage.getItem(LANDING_THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
    }
    return 'system';
}

function getSystemMode(): LandingColorMode {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
}

export function LandingPage() {
    const [themePreference, setThemePreference] = useState<LandingThemePreference>(getInitialPreference);
    const [systemMode, setSystemMode] = useState<LandingColorMode>(getSystemMode);
    const [selectedScreenshot, setSelectedScreenshot] = useState<ScreenshotId>('subjects');

    useEffect(() => {
        if (!window.matchMedia) return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const updateSystemMode = () => setSystemMode(media.matches ? 'dark' : 'light');
        updateSystemMode();
        media.addEventListener('change', updateSystemMode);
        return () => media.removeEventListener('change', updateSystemMode);
    }, []);

    useEffect(() => {
        try {
            if (themePreference === 'system') localStorage.removeItem(LANDING_THEME_STORAGE_KEY);
            else localStorage.setItem(LANDING_THEME_STORAGE_KEY, themePreference);
        } catch {
        }
    }, [themePreference]);

    const colorMode: LandingColorMode = themePreference === 'system' ? systemMode : themePreference;
    const dark = colorMode === 'dark';
    const themeStyle = {
        '--app-bg': dark ? '#0b0f17' : '#eef2f6',
        '--app-card-bg': dark ? '#111827' : '#ffffff',
        '--app-card-hover': dark ? '#182238' : '#f8fafc',
        '--app-text': dark ? '#f8fafc' : '#0f172a',
        '--app-text-muted': dark ? '#94a3b8' : '#64748b',
        '--app-border': dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.09)',
        '--accent-color': dark ? '#38bdf8' : '#2563eb',
    } as CSSProperties;
    const activeScreenshot = screenshots.find((screenshot) => screenshot.id === selectedScreenshot) ?? screenshots[0];

    const handleGalleryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const currentIndex = screenshots.findIndex((screenshot) => screenshot.id === selectedScreenshot);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % screenshots.length;
        else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
        else return;
        event.preventDefault();
        setSelectedScreenshot(screenshots[nextIndex].id);
        document.getElementById(`landing-tab-${screenshots[nextIndex].id}`)?.focus();
    };

    const toggleColorMode = () => {
        if (themePreference === 'system') {
            setThemePreference(systemMode === 'dark' ? 'light' : 'dark');
            return;
        }
        setThemePreference(themePreference === 'dark' ? 'light' : 'dark');
    };

    return (
        <main style={themeStyle} className="min-h-full select-text bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
            <header className="border-b border-[var(--app-border)]">
                <div className="mx-auto flex min-h-[76px] w-full max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
                    <Link to="/" aria-label="StudyZen home" className="inline-flex shrink-0 items-center gap-2.5 rounded-lg text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
                        <Logo className="h-8 w-8 text-[var(--accent-color)]" />
                        <span className="text-base font-semibold tracking-tight">StudyZen</span>
                    </Link>
                    <nav aria-label="Main navigation" className="ml-auto flex items-center justify-end gap-1 sm:gap-4">
                        <button
                            type="button"
                            onClick={toggleColorMode}
                            aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
                            aria-pressed={dark}
                            title={`Switch to ${dark ? 'light' : 'dark'} mode`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text-muted)] transition-colors hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                        >
                            {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
                        </button>
                        <a href="https://github.com/frandm16/StudyZen" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 sm:px-3 text-sm font-medium text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">
                            <ArrowUpRight size={17} aria-hidden="true" />
                            <span className="hidden sm:inline">GitHub</span>
                            <span className="sr-only">GitHub repository (opens in a new tab)</span>
                        </a>
                        <Link to="/login" className="inline-flex min-h-10 items-center rounded-xl px-2 sm:px-3 text-sm font-semibold text-[var(--app-text)] transition-colors hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Sign in</Link>
                        <Link to="/register" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent-color)] px-3 sm:px-4 text-sm font-bold text-[var(--app-bg)] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Create account</Link>
                    </nav>
                </div>
            </header>

            <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
                <section className="grid items-center gap-10 pb-12 pt-14 sm:pb-16 sm:pt-20 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:pb-20 lg:pt-24" aria-labelledby="hero-title">
                    <div className="max-w-xl">
                        <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-text-muted)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)]" />A study workspace built around your routine</p>
                        <h1 id="hero-title" className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]">Make your next study hour count.</h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-[var(--app-text-muted)] sm:text-lg sm:leading-8">Plan what needs doing, focus on one session at a time, and keep track of the progress you make along the way.</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link to="/timer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-6 text-sm font-bold text-[var(--app-bg)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] motion-reduce:transition-none">Start studying <ArrowRight size={16} aria-hidden="true" /></Link>
                            <a href="#product" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] px-5 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-card-bg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">Explore the workspace <ArrowDown size={15} aria-hidden="true" /></a>
                        </div>
                        <p className="mt-5 text-xs text-[var(--app-text-muted)]">Free to get started <span className="mx-1.5 opacity-50">·</span> Sign in to keep your study history</p>
                    </div>

                    <section id="product" className="min-w-0 scroll-mt-8" aria-labelledby="gallery-title">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">Inside StudyZen</p>
                                <h2 id="gallery-title" className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{activeScreenshot.title}</h2>
                            </div>
                            <span className="hidden shrink-0 text-xs text-[var(--app-text-muted)] sm:block">{String(screenshots.findIndex((item) => item.id === selectedScreenshot) + 1).padStart(2, '0')} / {String(screenshots.length).padStart(2, '0')}</span>
                        </div>
                        <div className="overflow-hidden rounded-[1.4rem] border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                            <img key={`${selectedScreenshot}-${colorMode}`} src={dark ? activeScreenshot.dark : activeScreenshot.light} alt={activeScreenshot.alt} className="block h-auto w-full" fetchPriority="high" />
                        </div>
                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">{activeScreenshot.description}</p>
                            <div role="tablist" aria-label="Choose a StudyZen screen" onKeyDown={handleGalleryKeyDown} className="-mx-1 flex max-w-full shrink-0 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                                {screenshots.map((screenshot) => {
                                    const Icon = screenshot.icon;
                                    const selected = screenshot.id === selectedScreenshot;
                                    return (
                                        <button
                                            key={screenshot.id}
                                            id={`landing-tab-${screenshot.id}`}
                                            type="button"
                                            role="tab"
                                            aria-selected={selected}
                                            aria-controls="landing-screenshot-panel"
                                            tabIndex={selected ? 0 : -1}
                                            onClick={() => setSelectedScreenshot(screenshot.id)}
                                            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] ${selected ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-[var(--app-bg)]' : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-card-bg)] hover:text-[var(--app-text)]'}`}
                                        >
                                            <Icon size={14} aria-hidden="true" />{screenshot.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div id="landing-screenshot-panel" role="tabpanel" aria-labelledby={`landing-tab-${selectedScreenshot}`} className="sr-only">{activeScreenshot.alt}</div>
                    </section>
                </section>

                <section className="border-t border-[var(--app-border)] py-16 sm:py-20" aria-labelledby="workflow-title">
                    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                        <div className="max-w-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">A simple rhythm</p>
                            <h2 id="workflow-title" className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Less time switching tools. More time learning.</h2>
                            <p className="mt-4 text-sm leading-6 text-[var(--app-text-muted)]">StudyZen brings the practical parts of a study routine into one place, from planning the week to looking back at what you completed.</p>
                        </div>
                        <div className="grid gap-x-8 sm:grid-cols-2">
                            {workflow.map(({ number, title, description, icon: Icon }) => (
                                <article key={number} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-[var(--app-border)] py-5">
                                    <span className="pt-0.5 text-xs font-semibold tabular-nums text-[var(--app-text-muted)]">{number}</span>
                                    <div>
                                        <div className="flex items-center gap-2"><Icon size={16} className="text-[var(--accent-color)]" aria-hidden="true" /><h3 className="text-sm font-semibold">{title}</h3></div>
                                        <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mb-10 overflow-hidden rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--app-card-bg)] px-6 py-9 sm:mb-14 sm:px-10 sm:py-11 lg:px-14">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">Start where you are</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Build a study routine that works for you.</h2><p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">Open the timer and take the next step in your work.</p></div>
                        <Link to="/timer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-6 text-sm font-bold text-[var(--app-bg)] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">Open StudyZen <ArrowUpRight size={16} aria-hidden="true" /></Link>
                    </div>
                </section>
                <footer className="flex flex-col gap-2 border-t border-[var(--app-border)] py-6 text-xs text-[var(--app-text-muted)] sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><Logo className="h-5 w-5 text-[var(--accent-color)]" />StudyZen</span><span>Plan with care. Focus on what matters.</span></footer>
            </div>
        </main>
    );
}
