import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../navbar/NavbarIcons';

interface AuthLayoutProps {
    mode: 'login' | 'register' | 'recovery';
    children: ReactNode;
}

export function AuthLayout({ mode, children }: AuthLayoutProps) {
    const heading = mode === 'login' ? 'Your study space, ready when you are.' : mode === 'register' ? 'A good place to get started.' : 'Your study space is within reach.';

    return (
        <div className="auth-page relative isolate flex min-h-full items-center justify-center overflow-x-hidden px-4 py-8 text-[var(--app-text)] sm:px-6 sm:py-10">
            <div className="auth-glow auth-glow-one pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full" />
            <div className="auth-glow auth-glow-two pointer-events-none absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full" />
            <div className="relative z-10 w-full max-w-[1080px]">
                <header className="mb-6 flex items-center justify-between sm:mb-8">
                    <Link to="/login" className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
                        <Logo className="h-8 w-8 text-[var(--accent-color)]" />
                        <span className="text-base font-semibold tracking-tight">StudyZen</span>
                    </Link>
                </header>
                <main className="auth-frame grid overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:grid-cols-[1fr_0.9fr]">
                    <section className="auth-side relative flex min-h-[270px] flex-col justify-between overflow-hidden px-6 py-6 sm:min-h-[330px] sm:px-8 sm:py-8 lg:min-h-[610px] lg:p-10 xl:p-12" aria-label="StudyZen">
                        <div className="auth-grid absolute inset-0" />
                        <div className="auth-side-light auth-side-light-one absolute rounded-full" />
                        <div className="auth-side-light auth-side-light-two absolute rounded-full" />
                        <div className="relative z-10 max-w-[370px]">
                            <h1 className="auth-side-heading text-xl font-semibold leading-tight tracking-[-0.04em] sm:text-2xl lg:text-[2.5rem] lg:leading-[1.12] lg:tracking-[-0.045em]">{heading}</h1>
                            <p className="mt-2 hidden max-w-[310px] text-sm leading-6 text-[var(--app-text-muted)] sm:block sm:mt-3 lg:mt-4">Plan your work, keep track of your sessions, and make steady progress.</p>
                        </div>
                        <div className="auth-study-art relative mx-auto flex h-[150px] w-full max-w-[430px] items-center justify-center sm:h-[190px] lg:h-[290px]" aria-hidden="true">
                            <div className="auth-art-glow absolute rounded-full" />
                            <div className="auth-paper-sheet auth-paper-back absolute rounded-2xl border border-[var(--app-border)]" />
                            <div className="auth-paper-sheet auth-paper-front relative rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 sm:p-5 lg:p-6 shadow-xl">
                                <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
                                    <span className="text-xs font-semibold text-[var(--app-text)]">Study plan</span>
                                    <span className="text-[10px] text-[var(--app-text-muted)]">TODAY</span>
                                </div>
                                <div className="mt-5 flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-color)]" />
                                        <span className="h-10 w-px sm:h-[52px] lg:h-[74px] bg-[var(--app-border)]" />
                                        <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--accent-color)] bg-[var(--app-card-bg)]" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-3">
                                        <div>
                                            <p className="text-xs font-medium">Review notes</p>
                                            <p className="mt-1 text-[10px] text-[var(--app-text-muted)]">9:00 · 25 min</p>
                                        </div>
                                        <div className="mt-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-[var(--app-text-muted)]">FOCUS SESSION</span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)]" />
                                            </div>
                                            <p className="mt-2 text-lg font-medium tabular-nums tracking-tight">24:38</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="auth-art-dot auth-art-dot-one absolute rounded-full" />
                            <div className="auth-art-dot auth-art-dot-two absolute rounded-full" />
                        </div>
                    </section>
                    <section className="auth-form-side flex items-center justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-14">
                        <div className="auth-form-enter w-full max-w-[390px]">{children}</div>
                    </section>
                </main>
            </div>
        </div>
    );
}
