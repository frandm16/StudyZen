import { Link } from 'react-router-dom';
import { Sun, Moon, ArrowUpRight } from 'lucide-react';
import { Logo } from '../navbar/NavbarIcons';
import { useTheme } from '../../context/ThemeContext';

export function LandingHeader() {
    const { colorMode, toggleColorMode } = useTheme();
    const isDark = colorMode === 'dark';
    const nextMode = isDark ? 'light' : 'dark';

    return (
        <header className="sticky top-0 z-30 w-full border-b border-[var(--app-border)] bg-[var(--app-bg)]/85 backdrop-blur-md transition-colors duration-200">
            <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    aria-label="StudyZen home"
                    className="inline-flex items-center gap-3 rounded-lg text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]"
                >
                    <Logo className="h-8 w-8 text-[var(--accent-color)]" />
                    <span className="text-lg font-bold tracking-tight">StudyZen</span>
                </Link>

                <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={toggleColorMode}
                        aria-label={`Switch to ${nextMode} mode`}
                        title={`Switch to ${nextMode} mode`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Moon className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>

                    <a
                        href="https://github.com/frandm16/StudyZen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 text-sm font-medium text-[var(--app-text)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                    >
                        <span className="hidden sm:inline">GitHub</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" aria-hidden="true" />
                        <span className="sr-only">GitHub repository (opens in a new tab)</span>
                    </a>

                    <Link
                        to="/timer"
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent-color)] px-4 text-sm font-semibold text-[var(--app-bg)] shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                    >
                        Get started
                    </Link>
                </nav>
            </div>
        </header>
    );
}
