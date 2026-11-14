import { ArrowRight, Eye, Server, Code2, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getAppUrl } from '../../lib/domain';

const HIGHLIGHTS = [
    { icon: Server, label: 'Self-host with Docker Compose' },
    { icon: Code2, label: 'Open source, MIT licensed' },
    { icon: Palette, label: '8 themes, light and dark' },
];

export function LandingHero() {
    const { colorMode } = useTheme();
    const isDark = colorMode === 'dark';

    const mockupSrc = isDark ? '/landing/hero-mockup-dark.webp' : '/landing/hero-mockup-light.webp';
    const mockupAlt =
        'StudyZen on a laptop and a phone: the weekly study calendar, the focus timer and the study stats dashboard';

    return (
        <section aria-labelledby="hero-title" className="w-full pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
            <div className="mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--app-text-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)]" aria-hidden="true" />
                    <span>Open source and self-hosted study workspace</span>
                </div>

                <h1
                    id="hero-title"
                    className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--app-text)] sm:text-5xl lg:text-6xl"
                >
                    Plan, focus and track your studying.
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--app-text-muted)] sm:text-lg sm:leading-8">
                    A Pomodoro timer, a unified calendar, course tracking and focus stats in one place. Run it on your own
                    server with Docker and keep your study data yours.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                    <a
                        href={getAppUrl('/timer')}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-6 text-sm font-semibold text-[var(--app-bg)] shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] motion-reduce:transform-none sm:w-auto"
                    >
                        Open app
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>

                    <a
                        href="#gallery"
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-5 text-sm font-medium text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] sm:w-auto"
                    >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Explore the views
                    </a>
                </div>

                <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-xs text-[var(--app-text-muted)] sm:flex-row sm:gap-6">
                    {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                        <li key={label} className="inline-flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[var(--accent-color)]" aria-hidden="true" />
                            <span>{label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative mx-auto mt-8 max-w-5xl sm:mt-12">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-[5%] inset-y-[8%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent-color)_26%,transparent),transparent)]"
                />
                <img
                    key={colorMode}
                    src={mockupSrc}
                    alt={mockupAlt}
                    width={1800}
                    height={1343}
                    className="relative h-auto w-full select-none"
                    fetchPriority="high"
                    decoding="async"
                />
            </div>
        </section>
    );
}