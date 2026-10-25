import { Timer, BookOpen, Calendar, BarChart3, Palette, Database } from 'lucide-react';

export function LandingFeatures() {
    return (
        <section aria-labelledby="features-title" className="w-full py-16 sm:py-24 border-t border-[var(--app-border)]">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold tracking-wider text-[var(--accent-color)] uppercase">
                        Product architecture
                    </p>
                    <h2
                        id="features-title"
                        className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--app-text)] sm:text-4xl"
                    >
                        Built for deliberate study routines
                    </h2>
                    <p className="mt-3 text-base text-[var(--app-text-muted)]">
                        Every tool in StudyZen answers a practical requirement of independent academic study: planning what to do, doing it without distraction, and keeping a truthful record of effort.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 transition-all hover:border-[var(--accent-color)]/60 md:col-span-2">
                        <div>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                                <Timer className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-[var(--app-text)]">
                                Multi-mode interval timer with focus evaluations
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--app-text-muted)]">
                                Execute Pomodoro cycles with custom work and break durations, run open stopwatch sessions, or set a direct countdown. Each completed block invites an honest self-evaluation of your focus level alongside session notes, linking productivity telemetry directly to the studied topic.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Custom audio chimes</span>
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Focus rating scale</span>
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Topic association</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 transition-all hover:border-[var(--accent-color)]/60">
                        <div>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                                <BookOpen className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-[var(--app-text)]">
                                Academic course hierarchy
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
                                Structure coursework across terms, courses, and topic lists. Track upcoming assessments, weight percentages, and recorded grades.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Grading criteria</span>
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Topic breakdown</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 transition-all hover:border-[var(--accent-color)]/60">
                        <div>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                                <Calendar className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-[var(--app-text)]">
                                Multi-scale planning calendars
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
                                Reconcile high-level monthly deadlines with hour-by-hour daily timelines and weekly workload distributions to avoid exam-week rushes.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Hourly time-blocking</span>
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">7-day balance</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 transition-all hover:border-[var(--accent-color)]/60">
                        <div>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-[var(--app-text)]">
                                Study history & analytics
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
                                Inspect total hours logged per subject, review session records with notes, and identify focus rating trends across past study days.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Subject distribution</span>
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Session history</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 transition-all hover:border-[var(--accent-color)]/60">
                        <div>
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                                <Palette className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-[var(--app-text)]">
                                Custom theme engine
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
                                Switch between 8 curated color presets with full light and dark mode support, updating CSS tokens across the entire application in real time.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">8 presets</span>
                            <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Dark & Light</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 transition-all hover:border-[var(--accent-color)]/60 md:col-span-2 lg:col-span-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                                    <Database className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[var(--app-text)]">
                                        Full-stack architecture & self-hosting
                                    </h3>
                                    <p className="text-xs text-[var(--app-text-muted)]">
                                        Engineered with modern standards across the entire stack.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--app-text-muted)]">
                                <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">React 19</span>
                                <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">TypeScript</span>
                                <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Tailwind CSS 4</span>
                                <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">Spring Boot 3</span>
                                <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1">PostgreSQL 16</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
