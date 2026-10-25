import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Timer, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/navbar/NavbarIcons';

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

export function LandingPage() {
    return (
        <main className="relative min-h-full overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent-color)_14%,transparent),transparent_68%)]" />
            <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
                <header className="flex min-h-[76px] items-center justify-between border-b border-[var(--app-border)]">
                    <Link to="/" aria-label="StudyZen home" className="inline-flex items-center gap-2.5 rounded-lg text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
                        <Logo className="h-8 w-8 text-[var(--accent-color)]" />
                        <span className="text-base font-semibold tracking-tight">StudyZen</span>
                    </Link>
                    <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
                        <a href="https://github.com/frandm16/StudyZen" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">
                            <ArrowUpRight size={17} aria-hidden="true" />
                            <span className="hidden sm:inline">GitHub</span>
                            <span className="sr-only">GitHub repository (opens in a new tab)</span>
                        </a>
                        <Link to="/login" className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-[var(--app-text)] transition-colors hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Sign in</Link>
                        <Link to="/register" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent-color)] px-4 text-sm font-bold text-[var(--app-bg)] transition-colors hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Create account</Link>
                    </nav>
                </header>

                <section className="grid items-center gap-12 pb-20 pt-16 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-24" aria-labelledby="hero-title">
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

                    <div className="relative mx-auto w-full max-w-[520px]" aria-label="Illustrative preview of the StudyZen study dashboard">
                        <div className="absolute -inset-6 rounded-[2.5rem] bg-[var(--accent-color)]/10 blur-3xl" />
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-[0_28px_90px_rgba(0,0,0,0.2)]">
                            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-2.5"><Logo className="h-6 w-6 text-[var(--accent-color)]" /><span className="text-sm font-semibold">StudyZen</span></div>
                                <span className="rounded-full border border-[var(--app-border)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">Illustrative preview</span>
                            </div>
                            <div className="p-5 sm:p-7">
                                <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--app-text-muted)]">Your focus session</p><h2 className="mt-1 text-lg font-semibold">One thing at a time.</h2></div><span className="rounded-xl bg-[var(--accent-color)]/10 p-2.5 text-[var(--accent-color)]"><Timer size={18} /></span></div>
                                <div className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-5 text-center sm:p-7">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-text-muted)]">Focus</p>
                                    <p className="mt-2 font-mono text-5xl font-medium tracking-[-0.06em] text-[var(--app-text)] sm:text-6xl">25:00</p>
                                    <div className="mx-auto mt-5 h-1.5 max-w-[220px] overflow-hidden rounded-full bg-[var(--app-card-bg)]"><div className="h-full w-[38%] rounded-full bg-[var(--accent-color)]" /></div>
                                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-color)] px-4 py-2 text-xs font-bold text-[var(--app-bg)]"><span className="h-1.5 w-1.5 rounded-full bg-current" />Ready when you are</div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-[var(--app-border)] p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">This week</p><p className="mt-1.5 text-lg font-semibold">Study steadily</p><p className="mt-1 text-[10px] text-[var(--app-text-muted)]">Build a rhythm that lasts</p></div>
                                    <div className="rounded-xl border border-[var(--app-border)] p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">Your plan</p><p className="mt-1.5 text-lg font-semibold">Stay on track</p><p className="mt-1 text-[10px] text-[var(--app-text-muted)]">One step at a time</p></div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-center text-[10px] text-[var(--app-text-muted)]">A small preview of the tools that make up your study space.</p>
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
