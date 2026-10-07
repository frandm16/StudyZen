import { useState } from 'react';
import { Plus, Award, Calendar, CheckCircle2, Circle, Edit3, Trash2, AlertCircle } from 'lucide-react';
import {calculateGradeSummary, formatDateDisplay, formatGrade, getDaysRemaining} from './helpers';
import { GradeWheel } from './GradeWheel';
import type { Assessment } from '../../types/assessment';
import type { Subject } from '../../types/subject';

interface SubjectEvaluationsTabProps {
    subject: Subject;
    evaluations: Assessment[];
    onOpenCreateEvaluation: () => void;
    onEditEvaluation: (evaluation: Assessment) => void;
    onDeleteEvaluation: (evaluationId: number) => void;
    onToggleComplete: (evaluation: Assessment) => void;
}

export function SubjectEvaluationsTab({
    evaluations,
    onOpenCreateEvaluation,
    onEditEvaluation,
    onDeleteEvaluation,
    onToggleComplete,
}: SubjectEvaluationsTabProps) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

    const gradeSummary = calculateGradeSummary(evaluations, 50);

    const filteredEvaluations = evaluations.filter((e) => {
        if (filter === 'pending') return !e.completed;
        if (filter === 'graded') return e.grade !== null && e.grade !== undefined;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--app-border)]">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-color)] flex items-center gap-1.5">
                            <Award className="h-4 w-4" />
                            <span>Grade & Weight Calculator</span>
                        </span>
                        <h3 className="text-xl font-bold text-[var(--app-text)] mt-1">
                            Coursework Performance
                        </h3>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider block">
                                Current Weighted Grade
                            </span>
                            <span className="text-2xl font-black text-[var(--app-text)]">
                                {gradeSummary.weightedAverage !== null
                                    ? `${formatGrade(gradeSummary.weightedAverage)}%`
                                    : 'No grades yet'}
                            </span>
                        </div>

                        <div className="h-10 w-px bg-[var(--app-border)]" />

                        <div className="text-right">
                            <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider block">
                                Pass Status (50%)
                            </span>
                            {gradeSummary.isPassGuaranteed ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Pass Secured</span>
                                </span>
                            ) : gradeSummary.isPassingAtRisk ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>At Risk</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                    <span>On Track</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-[var(--app-text-muted)] font-semibold">
                                Evaluated Weight Progress:
                            </span>
                            <span className="font-bold text-[var(--app-text)]">
                                {formatGrade(gradeSummary.evaluatedWeight)}% of 100%
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--app-border)] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[var(--accent-color)] transition-all duration-500"
                                style={{ width: `${Math.min(100, gradeSummary.evaluatedWeight)}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[var(--app-text-muted)] mt-1.5">
                            {formatGrade(gradeSummary.remainingWeight)}% weight remaining to be evaluated
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-[var(--app-text-muted)] font-semibold">
                                Needed on Remaining Weight:
                            </span>
                            <span className="font-bold text-[var(--app-text)]">
                                {gradeSummary.neededRemainingAverage !== null
                                    ? `${formatGrade(gradeSummary.neededRemainingAverage)}% avg`
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--app-border)] overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    gradeSummary.isPassGuaranteed
                                        ? 'bg-emerald-500'
                                        : gradeSummary.isPassingAtRisk
                                        ? 'bg-red-500'
                                        : 'bg-amber-500'
                                }`}
                                style={{
                                    width: `${Math.min(
                                        100,
                                        gradeSummary.neededRemainingAverage ?? 0
                                    )}%`,
                                }}
                            />
                        </div>
                        <p className="text-[11px] text-[var(--app-text-muted)] mt-1.5">
                            {gradeSummary.isPassGuaranteed
                                ? 'Target passed! Future grades will improve your final score.'
                                : gradeSummary.neededRemainingAverage !== null
                                ? `Score an average of ${formatGrade(gradeSummary.neededRemainingAverage)}% on remaining tests to pass.`
                                : 'All weights completed.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-[var(--app-card-bg)] p-1 rounded-xl border border-[var(--app-border)]">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filter === 'all'
                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        All ({evaluations.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filter === 'pending'
                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        Pending ({evaluations.filter((e) => !e.completed).length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('graded')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filter === 'graded'
                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        Graded ({evaluations.filter((e) => e.grade !== null && e.grade !== undefined).length})
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onOpenCreateEvaluation}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 shadow-md shadow-[var(--accent-color)]/20 transition-all cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Evaluation</span>
                </button>
            </div>

            {filteredEvaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--app-border)] bg-[var(--app-card-bg)]/40 p-12 text-center">
                    <div className="p-3 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] mb-3">
                        <Award className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--app-text)]">No evaluations found</h3>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)] max-w-sm">
                        {filter !== 'all'
                            ? 'No evaluations match this status filter.'
                            : 'Track your exams, quizzes, essays, and assignments with weights and grades.'}
                    </p>
                    {filter === 'all' && (
                        <button
                            type="button"
                            onClick={onOpenCreateEvaluation}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 cursor-pointer shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add First Evaluation</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredEvaluations.map((evaluation) => {
                        const daysInfo = evaluation.dueAt ? getDaysRemaining(evaluation.dueAt) : null;
                        const isGraded = evaluation.grade !== null && evaluation.grade !== undefined;
                        const gradePercent = isGraded && evaluation.maxGrade > 0
                            ? (Number(evaluation.grade) / Number(evaluation.maxGrade)) * 100
                            : null;

                        return (
                            <div
                                key={evaluation.id}
                                className={`group flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                                    evaluation.completed
                                        ? 'border-[var(--app-border)] bg-[var(--app-card-bg)]/70 opacity-80'
                                        : 'border-[var(--app-border)] bg-[var(--app-card-bg)] hover:border-[var(--accent-color)]/40 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <button
                                        type="button"
                                        onClick={() => onToggleComplete(evaluation)}
                                        className="mt-1 text-[var(--app-text-muted)] hover:text-[var(--accent-color)] transition-colors cursor-pointer shrink-0"
                                        title={evaluation.completed ? 'Mark as pending' : 'Mark as completed'}
                                    >
                                        {evaluation.completed ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <Circle className="h-4 w-4" />
                                        )}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20">
                                                {evaluation.type || 'Evaluation'}
                                            </span>

                                            {evaluation.weightPercent > 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    {evaluation.weightPercent}% weight
                                                </span>
                                            )}

                                            {daysInfo && !evaluation.completed && (
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                                        daysInfo.isToday
                                                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                                            : daysInfo.isPast
                                                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}
                                                >
                                                    {daysInfo.label}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className={`text-base font-bold text-[var(--app-text)] mt-1 ${
                                            evaluation.completed ? 'line-through opacity-70' : ''
                                        }`}>
                                            {evaluation.title}
                                        </h4>

                                        {evaluation.description && (
                                            <p className="mt-1 text-xs text-[var(--app-text-muted)] line-clamp-1 leading-relaxed">
                                                {evaluation.description}
                                            </p>
                                        )}

                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] font-medium">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{formatDateDisplay(evaluation.dueAt) || 'No date set'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-[var(--app-border)]/60 pt-3 md:pt-0 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            {isGraded ? (
                                                <>
                                                    <span className="block text-xs font-bold text-emerald-400">
                                                        {evaluation.grade}/{evaluation.maxGrade}
                                                    </span>
                                                    <span className="block text-[10px] font-semibold text-[var(--app-text-muted)]">
                                                        Score
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="block text-xs font-semibold text-[var(--app-text-muted)]">
                                                        Max {evaluation.maxGrade}
                                                    </span>
                                                    <span className="block text-[10px] text-[var(--app-text-muted)]">
                                                        Ungraded
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <GradeWheel score={gradePercent} size={48} strokeWidth={5} showLabel={false} />
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => onEditEvaluation(evaluation)}
                                            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-white/5 transition-colors"
                                            title="Edit evaluation"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteEvaluation(evaluation.id)}
                                            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete evaluation"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
