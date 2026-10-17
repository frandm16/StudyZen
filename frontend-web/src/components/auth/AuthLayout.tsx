import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../navbar/NavbarIcons';

interface AuthLayoutProps {
    mode: 'login' | 'register';
    children: ReactNode;
}

const content = {
    login: {
        eyebrow: 'YOUR SPACE IS WAITING',
        title: <>Make room<br />for <span>deep focus.</span></>,
        description: 'A quieter way to make progress, one intentional session at a time.',
        footnote: 'Your next focused hour starts here.',
    },
    register: {
        eyebrow: 'A FRESH PAGE',
        title: <>Small steps.<br /><span>Bright ideas.</span></>,
        description: 'Build a rhythm that makes learning feel lighter and progress feel real.',
        footnote: 'A little progress, every day.',
    },
};

export function AuthLayout({ mode, children }: AuthLayoutProps) {
    const message = content[mode];

    return (
        <div className="auth-page relative isolate flex min-h-full items-center justify-center overflow-hidden px-4 py-7 text-[var(--app-text)] sm:px-8 sm:py-10">
            <div className="auth-glow auth-glow-one pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full" />
            <div className="auth-glow auth-glow-two pointer-events-none absolute -bottom-64 -right-40 h-[42rem] w-[42rem] rounded-full" />
            <div className="auth-grain pointer-events-none absolute inset-0" />

            <div className="relative z-10 w-full max-w-[1160px]">
                <header className="auth-enter mb-6 flex items-center justify-between sm:mb-8">
                    <Link to="/login" className="group inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--accent-color)] text-[var(--app-bg)] shadow-[0_8px_28px_var(--accent-ring)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transition-none">
                            <Logo className="h-8 w-8" />
                        </span>
                        <span className="text-[15px] font-semibold tracking-[-0.03em]">StudyZen</span>
                    </Link>
                    <span className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--app-text-muted)] sm:inline-flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_12px_var(--accent-color)]" />
                        Your calm corner to focus
                    </span>
                </header>

                <main className="grid overflow-hidden rounded-[30px] border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-[0_32px_100px_rgba(0,0,0,0.22)] lg:min-h-[680px] lg:grid-cols-[1.03fr_0.97fr]">
                    <section className="auth-story relative hidden min-h-[660px] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14" aria-label="StudyZen introduction">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_18%,var(--accent-ring),transparent_45%),linear-gradient(145deg,color-mix(in_srgb,var(--accent-color)_9%,var(--app-card-bg)),var(--app-card-bg)_62%)]" />
                        <div className="auth-grid absolute inset-0 opacity-40" />
                        <div className="relative z-10 max-w-[390px] pt-1">
                            <p className="auth-enter auth-delay-1 mb-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.24em] text-[var(--accent-color)]">
                                <span className="h-px w-7 bg-[var(--accent-color)]" />{message.eyebrow}
                            </p>
                            <h1 className="auth-enter auth-delay-2 font-pt text-[clamp(3rem,5vw,4.7rem)] leading-[0.99] tracking-[-0.055em]">
                                {message.title}
                            </h1>
                            <p className="auth-enter auth-delay-3 mt-6 max-w-[320px] text-[15px] leading-7 text-[var(--app-text-muted)]">{message.description}</p>
                        </div>

                        <div className="auth-art relative mx-auto my-3 h-[300px] w-full max-w-[460px]" aria-hidden="true">
                            <div className="auth-orbit auth-orbit-one" />
                            <div className="auth-orbit auth-orbit-two" />
                            <div className="auth-orbit auth-orbit-three" />
                            <div className="auth-star auth-star-one">✳</div>
                            <div className="auth-star auth-star-two">✦</div>
                            <div className="auth-spark auth-spark-one" />
                            <div className="auth-spark auth-spark-two" />
                            <div className="auth-book-shadow" />
                            <div className="auth-book">
                                <div className="auth-book-page auth-book-left">
                                    <span className="auth-page-mark">01 / FOCUS</span>
                                    <span className="auth-page-title">A study<br />in progress</span>
                                    <span className="auth-page-line auth-line-long" />
                                    <span className="auth-page-line auth-line-mid" />
                                    <span className="auth-page-line auth-line-short" />
                                    <span className="auth-page-stamp">SZN</span>
                                </div>
                                <div className="auth-book-page auth-book-right">
                                    <span className="auth-page-mark">TODAY'S NOTE</span>
                                    <span className="auth-note-mark">✳</span>
                                    <span className="auth-page-line auth-line-long" />
                                    <span className="auth-page-line auth-line-mid" />
                                    <span className="auth-page-line auth-line-short" />
                                    <span className="auth-note-chip"><i /> {mode === 'login' ? 'Back in flow' : 'Begin anywhere'}</span>
                                </div>
                                <span className="auth-book-spine" />
                            </div>
                            <div className="auth-floating-card auth-card-top"><span>02:14</span><i>✦</i><small>in the zone</small></div>
                            <div className="auth-floating-card auth-card-bottom"><i /><span>One page at a time</span></div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between border-t border-[var(--app-border)] pt-5 text-xs text-[var(--app-text-muted)]">
                            <span>{message.footnote}</span>
                            <span className="font-plex italic tracking-wide">Study gently.</span>
                        </div>
                    </section>

                    <section className="auth-form-side flex items-center justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
                        <div className="auth-form-enter w-full max-w-[390px]">{children}</div>
                    </section>
                </main>
                <footer className="mt-5 flex items-center justify-between px-1 text-[10px] font-medium tracking-wide text-[var(--app-text-muted)]/80 sm:mt-6">
                    <span>© 2025 StudyZen</span>
                    <span className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[var(--accent-color)]" /> Made for meaningful momentum</span>
                </footer>
            </div>
        </div>
    );
}
