import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Monitor, Maximize2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ImageLightbox } from './ImageLightbox';

export function LandingHero() {
    const { colorMode } = useTheme();
    const isDark = colorMode === 'dark';
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const imgSrc = isDark ? '/landing/Timer-Running-DarkMode.png' : '/landing/Timer-Running-LightMode.png';
    const imgAlt = 'StudyZen focus timer in action with active Pomodoro session and topic tracking';

    return (
        <section aria-labelledby="hero-title" className="w-full pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
            <div className="mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--app-text-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)]" aria-hidden="true" />
                    <span>Structured study workspace for academic focus</span>
                </div>

                <h1
                    id="hero-title"
                    className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--app-text)] sm:text-5xl lg:text-6xl"
                >
                    A calm workspace engineered for focused study.
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--app-text-muted)] sm:text-lg sm:leading-8">
                    StudyZen brings coursework organization, multi-mode Pomodoro sessions, and time-blocked planning into a single thoughtful interface designed to eliminate routine clutter.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                    <Link
                        to="/timer"
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-6 text-sm font-semibold text-[var(--app-bg)] shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] motion-reduce:transform-none sm:w-auto"
                    >
                        Get started
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <a
                        href="#gallery"
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-5 text-sm font-medium text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] sm:w-auto"
                    >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Explore application views
                    </a>
                </div>
            </div>

            <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
                <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-2xl">
                    <div className="flex h-10 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-bg)]/60 px-4">
                        <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="font-mono text-[11px]">studyzen.frandm.dev/timer</span>
                        </div>
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsZoomOpen(true)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsZoomOpen(true)}
                        aria-label="Click to enlarge focus timer screenshot"
                        className="group relative aspect-video w-full cursor-zoom-in overflow-hidden bg-[var(--app-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                    >
                        <img
                            src={imgSrc}
                            alt={imgAlt}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                            fetchPriority="high"
                        />
                        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-card-bg)]/90 px-2.5 py-1 text-xs font-medium text-[var(--app-text)] opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Click to enlarge
                        </div>
                    </div>
                </div>
            </div>

            <ImageLightbox
                isOpen={isZoomOpen}
                onClose={() => setIsZoomOpen(false)}
                src={imgSrc}
                alt={imgAlt}
                title="Focus timer"
            />
        </section>
    );
}
