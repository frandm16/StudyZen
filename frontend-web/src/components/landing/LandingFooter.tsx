import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '../navbar/NavbarIcons';

export function LandingFooter() {
    return (
        <footer className="w-full border-t border-[var(--app-border)] py-8 transition-colors duration-200">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-[var(--app-text-muted)] sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        aria-label="StudyZen home"
                        className="inline-flex items-center gap-2 rounded-md text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                    >
                        <Logo className="h-5 w-5 text-[var(--accent-color)]" />
                        <span className="font-bold tracking-tight">StudyZen</span>
                    </Link>
                    <span>·</span>
                    <span>Structured study workspace</span>
                </div>

                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/frandm16/StudyZen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 transition-colors hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                    >
                        <span>GitHub repository</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
