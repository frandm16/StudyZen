import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../navbar/NavbarIcons';

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="auth-page relative isolate flex min-h-full items-center justify-center overflow-x-hidden px-4 py-8 text-[var(--app-text)] sm:px-6">
            <div className="auth-glow pointer-events-none absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full" />
            <div className="relative z-10 w-full max-w-[440px]">
                <Link to="/login" className="auth-brand mx-auto mb-7 inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
                    <Logo className="h-8 w-8 text-[var(--accent-color)]" />
                    <span className="font-pt text-xl font-bold tracking-[-0.02em]">StudyZen</span>
                </Link>
                <main className="auth-panel rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 shadow-xl sm:p-9">
                    {children}
                </main>
            </div>
        </div>
    );
}
