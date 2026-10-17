import { LockKeyhole, Sparkles } from 'lucide-react';

export function AiPlannerPlaceholder() {
    return <section aria-label="Future AI weekly planner" aria-disabled="true" className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--app-border)] bg-[var(--app-card-bg)] p-5 opacity-75 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[var(--accent-color)]/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-[var(--app-text-muted)]"><LockKeyhole size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">AI weekly planner</h2><span className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--app-text-muted)]">Coming in a future update</span><Sparkles size={14} className="text-[var(--app-text-muted)]" aria-hidden="true" /></div><p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--app-text-muted)]">In the future, you’ll be able to tell AI what you want to work on and have it organize your week. This feature is not available yet.</p></div></div>
    </section>;
}
