import { Plus, Calendar } from 'lucide-react';
import type { AcademicTerm } from '../../types/academic-term';

interface TermFilterBarProps {
    terms: AcademicTerm[];
    selectedTerm: number | 'all';
    onSelectTerm: (termId: number | 'all') => void;
    onOpenCreateTerm: () => void;
}

export function TermFilterBar({
    terms,
    selectedTerm,
    onSelectTerm,
    onOpenCreateTerm,
}: TermFilterBarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--app-border)]">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)] pr-2 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Terms</span>
                </div>

                <button
                    type="button"
                    onClick={() => onSelectTerm('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedTerm === 'all'
                            ? 'bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/20'
                            : 'bg-[var(--app-card-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] hover:text-[var(--app-text)] hover:border-[var(--accent-color)]/40'
                    }`}
                >
                    All Terms
                </button>

                {terms.map((t) => {
                    const isSelected = selectedTerm === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onSelectTerm(t.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                                isSelected
                                    ? 'bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/20'
                                    : 'bg-[var(--app-card-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] hover:text-[var(--app-text)] hover:border-[var(--accent-color)]/40'
                            }`}
                        >
                            <span>{t.name}</span>
                            {t.isCurrent && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                                        isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    }`}
                                >
                                    Current
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onOpenCreateTerm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--app-text)] bg-[var(--app-card-bg)] border border-[var(--app-border)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all shrink-0 cursor-pointer shadow-sm"
            >
                <Plus className="h-3.5 w-3.5" />
                <span>New Term</span>
            </button>
        </div>
    );
}
