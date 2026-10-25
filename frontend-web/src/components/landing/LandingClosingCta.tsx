import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export function LandingClosingCta() {
    return (
        <section aria-labelledby="closing-cta-heading" className="w-full py-12 sm:py-16">
            <div className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-6 py-12 text-center shadow-lg sm:px-12 sm:py-16">
                    <h2
                        id="closing-cta-heading"
                        className="text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl lg:text-4xl"
                    >
                        Ready to organize your study sessions?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--app-text-muted)] sm:text-base">
                        Open the focus timer or inspect the open-source codebase on GitHub.
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
                            href="https://github.com/frandm16/StudyZen"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-5 text-sm font-medium text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] sm:w-auto"
                        >
                            View on GitHub
                            <ArrowUpRight className="h-4 w-4 text-[var(--app-text-muted)]" aria-hidden="true" />
                            <span className="sr-only">GitHub repository (opens in a new tab)</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
