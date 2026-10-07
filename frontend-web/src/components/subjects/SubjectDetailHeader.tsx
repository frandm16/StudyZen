import { ArrowLeft, Star, Edit3, Trash2, Calendar, BookOpen, Award, History } from 'lucide-react';
import type { Subject } from '../../types/subject';
import type { AcademicTerm } from '../../types/academic-term';

interface SubjectDetailHeaderProps {
    subject: Subject;
    term?: AcademicTerm;
    activeTab: 'topics' | 'evaluations' | 'sessions';
    topicsCount: number;
    evaluationsCount: number;
    sessionsCount: number;
    onBack: () => void;
    onTabChange: (tab: 'topics' | 'evaluations' | 'sessions') => void;
    onToggleFavorite: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function SubjectDetailHeader({
    subject,
    term,
    activeTab,
    topicsCount,
    evaluationsCount,
    sessionsCount,
    onBack,
    onTabChange,
    onToggleFavorite,
    onEdit,
    onDelete,
}: SubjectDetailHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Subjects</span>
                </button>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onToggleFavorite}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-xs font-semibold text-[var(--app-text-muted)] hover:text-amber-400 hover:border-amber-400/40 transition-colors"
                    >
                        <Star className={`h-3.5 w-3.5 ${subject.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span>{subject.isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[var(--accent-color)]/40 transition-colors"
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-xs font-semibold text-[var(--app-text-muted)] hover:text-red-400 hover:border-red-500/40 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 shadow-sm relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{ backgroundColor: subject.color || 'var(--accent-color)' }}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-3">
                            <span
                                className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: subject.color || 'var(--accent-color)' }}
                            />
                            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)]">
                                {subject.name}
                            </h1>
                        </div>

                        {term && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[var(--app-text-muted)]">
                                <Calendar className="h-3.5 w-3.5 text-[var(--accent-color)]" />
                                <span>{term.name}</span>
                                {term.isCurrent && (
                                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                                        Current Semester
                                    </span>
                                )}
                            </div>
                        )}

                        {subject.notes && (
                            <p className="mt-3 text-xs text-[var(--app-text-muted)] leading-relaxed max-w-2xl bg-[var(--app-bg)]/60 p-3 rounded-xl border border-[var(--app-border)]/60">
                                {subject.notes}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-[var(--app-border)] pt-4 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => onTabChange('topics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'topics'
                                ? 'bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/20'
                                : 'bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        <BookOpen className="h-4 w-4" />
                        <span>Syllabus Topics</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'topics' ? 'bg-white/20 text-white' : 'bg-[var(--app-card-bg)] text-[var(--app-text-muted)]'
                        }`}>
                            {topicsCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onTabChange('evaluations')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'evaluations'
                                ? 'bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/20'
                                : 'bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        <Award className="h-4 w-4" />
                        <span>Evaluations & Grades</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'evaluations' ? 'bg-white/20 text-white' : 'bg-[var(--app-card-bg)] text-[var(--app-text-muted)]'
                        }`}>
                            {evaluationsCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onTabChange('sessions')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'sessions'
                                ? 'bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/20'
                                : 'bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        <History className="h-4 w-4" />
                        <span>Study History</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'sessions' ? 'bg-white/20 text-white' : 'bg-[var(--app-card-bg)] text-[var(--app-text-muted)]'
                        }`}>
                            {sessionsCount}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
