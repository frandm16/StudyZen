import React from 'react';
import { Star, Clock, CheckCircle2, ChevronRight, Edit3, Trash2, Calendar } from 'lucide-react';
import { formatMinutes } from './helpers';
import { GradeWheel } from './GradeWheel';
import type { Subject } from '../../types/subject';
import type { AcademicTerm } from '../../types/academic-term';

interface SubjectCardProps {
    subject: Subject;
    term?: AcademicTerm;
    stats: {
        minutes: number;
        completedTopics: number;
        totalTopics: number;
        upcomingEvaluations: number;
    };
    gradeOn100?: number | null;
    onSelect: (subjectId: number) => void;
    onToggleFavorite: (subjectId: number, e: React.MouseEvent) => void;
    onEdit: (subject: Subject, e: React.MouseEvent) => void;
    onDelete: (subjectId: number, e: React.MouseEvent) => void;
}

export function SubjectCard({
    subject,
    term,
    stats,
    gradeOn100,
    onSelect,
    onToggleFavorite,
    onEdit,
    onDelete,
}: SubjectCardProps) {
    const progressPercent = stats.totalTopics > 0
        ? Math.round((stats.completedTopics / stats.totalTopics) * 100)
        : 0;

    return (
        <div
            onClick={() => onSelect(subject.id)}
            className="group relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 sm:p-5 transition-all hover:border-[var(--accent-color)]/60 hover:shadow-lg hover:shadow-[var(--accent-color)]/5 cursor-pointer overflow-hidden"
        >
            <div
                className="absolute top-0 bottom-0 left-0 w-1.5 transition-opacity"
                style={{ backgroundColor: subject.color || 'var(--accent-color)' }}
            />

            <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-2">
                    <h3 className="truncate text-base sm:text-lg font-bold text-[var(--app-text)] group-hover:text-[var(--accent-color)] transition-colors">
                        {subject.name}
                    </h3>
                    {subject.isFavorite && (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[var(--app-text-muted)]">
                    {term && (
                        <div className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3" />
                            <span>{term.name}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatMinutes(stats.minutes)} studied</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>{stats.completedTopics}/{stats.totalTopics} topics ({progressPercent}%)</span>
                    </div>

                    {stats.upcomingEvaluations > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            {stats.upcomingEvaluations} pending
                        </span>
                    )}
                </div>

                {subject.notes && (
                    <p className="mt-2 line-clamp-1 text-xs text-[var(--app-text-muted)] leading-relaxed">
                        {subject.notes}
                    </p>
                )}

                <div className="mt-3 h-1.5 w-full max-w-md rounded-full bg-[var(--app-border)] overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: subject.color || 'var(--accent-color)',
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-5 pl-2 md:pl-0 border-t md:border-t-0 border-[var(--app-border)]/60 pt-3 md:pt-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                            Grade
                        </span>
                        <span className="text-xs font-semibold text-[var(--app-text-muted)]">
                            {gradeOn100 !== null && gradeOn100 !== undefined ? 'Current' : 'No grades'}
                        </span>
                    </div>
                    <GradeWheel score={gradeOn100} size={50} strokeWidth={5} showLabel={false} />
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={(e) => onToggleFavorite(subject.id, e)}
                        className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-amber-400 hover:bg-white/5 transition-colors"
                        aria-label="Toggle favorite"
                    >
                        <Star className={`h-4 w-4 ${subject.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => onEdit(subject, e)}
                        className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-white/5 transition-colors"
                        aria-label="Edit subject"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => onDelete(subject.id, e)}
                        className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label="Delete subject"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="hidden sm:flex items-center pl-1 text-[var(--accent-color)] group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
