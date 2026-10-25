import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Monitor, Moon, Sun, Timer, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/navbar/NavbarIcons';

type LandingThemePreference = 'system' | 'light' | 'dark';
type LandingColorMode = Exclude<LandingThemePreference, 'system'>;

const LANDING_THEME_STORAGE_KEY = 'studyzen_landing_theme';

const screenshots = [
    {
        title: 'Organize every subject',
        description: 'Track courses, topic progress, study time, and upcoming evaluations.',
        light: '/landing/Subjects-LightMode.png',
        dark: '/landing/Subjects-DarkMode.png',
        alt: 'StudyZen academic subjects screen showing course progress and evaluations',
    },
    {
        title: 'Plan your next steps',
        description: 'See deadlines, to-dos, study goals, and daily activity together.',
        light: '/landing/Planning-LightMode.png',
        dark: '/landing/Planning-DarkMode.png',
        alt: 'StudyZen planning calendar with goals, upcoming deadlines, and to-dos',
    },
];

const features = [
    {
        icon: Timer,
        number: '01',
        title: 'Focus with intention',
        description: 'Settle into a Pomodoro, stopwatch, or countdown session and keep your attention on what matters.',
    },
    {
        icon: BookOpen,
        number: '02',
        title: 'Bring your studies together',
        description: 'Organize subjects, topics, sessions, and assessments in one calm study space.',
    },
    {
        icon: CalendarDays,
        number: '03',
        title: 'Make room for progress',
        description: 'Plan your days and weeks, keep track of to-dos, and see what is coming up next.',
    },
    {
        icon: TrendingUp,
        number: '04',
        title: 'Notice your momentum',
        description: 'Review your study time, active days, focus ratings, and weekly rhythm over time.',
    },
];

function getInitialPreference(): LandingThemePreference {
    try {
        const stored = localStorage.getItem(LANDING_THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {
    }
    return 'system';
}

export function LandingPage() {
    const [themePreference, setThemePreference] = useState<LandingThemePreference>(getInitialPreference);
    const [systemMode, setSystemMode] = useState<LandingColorMode>(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

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
            localStorage.setItem(LANDING_THEME_STORAGE_KEY, themePreference);
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
    } as React.CSSProperties;

    const setPreference = (preference: LandingThemePreference) => setThemePreference(preference);

    return (
        <main style={themeStyle} className="relative min-h-full overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-color)_14%,transparent),transparent_68%)]" />
            <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
                <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] py-3">
                    <Link to="/" aria-label="StudyZen home" className="inline-flex items-center gap-2.5 rounded-lg text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
                        <Logo className="h-8 w-8 text-[var(--accent-color)]" />
                        <span className="text-base font-semibold tracking-tight">StudyZen</span>
                    </Link>
                    <nav aria-label="Main navigation" className="flex flex-wrap items-center justify-end gap-1 sm:gap-3">
                        <div role="group" aria-label="Landing page color theme" className="inline-flex items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)]/70 p-1">
                            {([
                                ['system', 'System', Monitor],
                                ['light', 'Light', Sun],
                                ['dark', 'Dark', Moon],
                            ] as const).map(([preference, label, Icon]) => (
                                <button
                                    key={preference}
                                    type="button"
                                    aria-pressed={themePreference === preference}
                                    onClick={() => setPreference(preference)}
                                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 sm:px-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] ${themePreference === preference ? 'bg-[var(--accent-color)] text-[var(--app-bg)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}`}
                                >
                                    <Icon size={14} aria-hidden="true" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                        <a href="https://github.com/frandm16/StudyZen" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 sm:px-3 text-sm font-medium text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">
                            <ArrowUpRight size={17} aria-hidden="true" />
                            <span className="hidden sm:inline">GitHub</span>
                            <span className="sr-only">GitHub repository (opens in a new tab)</span>
                        </a>
                        <Link to="/login" className="inline-flex min-h-10 items-center rounded-xl px-2 sm:px-3 text-sm font-semibold text-[var(--app-text)] transition-colors hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Sign in</Link>
                        <Link to="/register" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent-color)] px-3 sm:px-4 text-sm font-bold text-[var(--app-bg)] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Create account</Link>
                    </nav>
                </header>

                <section className="grid items-center gap-10 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:pb-24" aria-labelledby="hero-title">
                    <div className="max-w-2xl">
                        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)]/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-[var(--app-text-muted)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)]" />A calmer way to study</p>
                        <h1 id="hero-title" className="text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Make time for <span className="text-[var(--accent-color)]">deep focus.</span></h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--app-text-muted)] sm:text-lg sm:leading-8">StudyZen brings your focus sessions, study plans, and progress into one thoughtful workspace—so you can spend less time organizing and more time learning.</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link to="/timer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-6 text-sm font-bold text-[var(--app-bg)] shadow-lg shadow-[var(--accent-color)]/15 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] motion-reduce:transition-none">Get started <ArrowRight size={16} aria-hidden="true" /></Link>
                            <a href="#features" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] px-6 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-[var(--app-card-bg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">Explore features <ArrowDown size={15} aria-hidden="true" /></a>
                        </div>
                        <p className="mt-4 text-xs text-[var(--app-text-muted)]">Already have an account? <Link to="/login" className="font-semibold text-[var(--app-text)] underline decoration-[var(--app-border)] underline-offset-4 hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Sign in</Link></p>
                    </div>

                    <figure className="min-w-0">
                        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-[0_28px_90px_rgba(0,0,0,0.2)]">
                            <img src={dark ? '/landing/Timer-Running-DarkMode.png' : '/landing/Timer-Running-LightMode.png'} alt="StudyZen focus timer running with a selected study topic and session controls" className="block h-auto w-full" fetchPriority="high" />
                        </div>
                        <figcaption className="mt-3 text-center text-xs text-[var(--app-text-muted)]">A focused workspace for every study session.</figcaption>
                    </figure>
                </section>

                <section className="border-t border-[var(--app-border)] py-16 sm:py-20" aria-labelledby="workspace-title">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">One connected workspace</p>
                        <h2 id="workspace-title" className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">From your subjects to your next plan.</h2>
                        <p className="mt-4 text-sm leading-6 text-[var(--app-text-muted)]">Keep your courses organized, plan the work ahead, and make progress visible over time.</p>
                    </div>
                    <div className="mt-9 grid gap-6 lg:grid-cols-2">
                        {screenshots.map((screenshot) => (
                            <article key={screenshot.title} className="min-w-0 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)]">
                                <img src={dark ? screenshot.dark : screenshot.light} alt={screenshot.alt} className="block h-auto w-full" loading="lazy" />
                                <div className="p-5 sm:p-6">
                                    <h3 className="text-lg font-semibold tracking-tight">{screenshot.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{screenshot.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="features" className="scroll-mt-8 border-t border-[var(--app-border)] py-16 sm:py-20" aria-labelledby="features-title">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">Designed for your routine</p><h2 id="features-title" className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Everything you need to keep moving forward.</h2></div>
                        <p className="max-w-sm text-sm leading-6 text-[var(--app-text-muted)]">A focused set of tools to help you plan a session, follow through, and reflect on your progress.</p>
                    </div>
                    <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map(({ icon: Icon, number, title, description }) => (
                            <article key={number} className="border-t border-[var(--app-border)] pt-5">
                                <div className="flex items-center justify-between"><span className="text-xs font-semibold tabular-nums text-[var(--app-text-muted)]">{number}</span><Icon size={18} className="text-[var(--accent-color)]" aria-hidden="true" /></div>
                                <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mb-10 overflow-hidden rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-card-bg)] px-6 py-10 sm:mb-14 sm:px-10 sm:py-12 lg:px-14">
                    <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">Your next session starts here</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Ready to find your focus?</h2><p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">Open your study space and make a little progress today.</p></div>
                        <Link to="/timer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-6 text-sm font-bold text-[var(--app-bg)] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">Open StudyZen <ArrowUpRight size={16} aria-hidden="true" /></Link>
                    </div>
                </section>
                <footer className="flex flex-col gap-2 border-t border-[var(--app-border)] py-6 text-xs text-[var(--app-text-muted)] sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><Logo className="h-5 w-5 text-[var(--accent-color)]" />StudyZen</span><span>A little more focus, one session at a time.</span></footer>
            </div>
        </main>
    );
}
