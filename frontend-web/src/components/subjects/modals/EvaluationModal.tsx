import React, { useEffect, useState, useMemo } from 'react';
import { Percent, AlertCircle } from 'lucide-react';
import { Modal, fieldClass, primaryButton, ghostButton } from '../../ui/Modal';
import { GradeWheel } from '../GradeWheel';
import { ASSESSMENT_TYPE_PRESETS, formatGrade } from '../helpers';
import type { Assessment, CreateAssessmentDTO, UpdateAssessmentDTO } from '../../../types/assessment';

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEvaluation: Assessment | null;
    subjectId: number;
    existingEvaluations?: Assessment[];
    onSave: (data: CreateAssessmentDTO | UpdateAssessmentDTO) => Promise<void>;
}

export function EvaluationModal({
    isOpen,
    onClose,
    editingEvaluation,
    subjectId,
    existingEvaluations = [],
    onSave,
}: EvaluationModalProps) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const [title, setTitle] = useState('');
    const [type, setType] = useState('Exam');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(today);
    const [weightPercent, setWeightPercent] = useState<number>(15);
    const [maxGrade, setMaxGrade] = useState<number>(100);
    const [grade, setGrade] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const otherWeight = useMemo(() => {
        return existingEvaluations
            .filter((e) => !editingEvaluation || e.id !== editingEvaluation.id)
            .reduce((sum, e) => sum + (e.weightPercent || 0), 0);
    }, [existingEvaluations, editingEvaluation]);

    const maxAvailableWeight = useMemo(() => {
        return Math.max(0, 100 - otherWeight);
    }, [otherWeight]);

    useEffect(() => {
        if (editingEvaluation) {
            setTitle(editingEvaluation.title);
            setType(editingEvaluation.type || 'Exam');
            setDescription(editingEvaluation.description || '');
            setDueDate(editingEvaluation.dueAt ? editingEvaluation.dueAt.slice(0, 10) : today);
            setWeightPercent(editingEvaluation.weightPercent ?? 0);
            setMaxGrade(editingEvaluation.maxGrade ?? 100);
            setGrade(editingEvaluation.grade !== null && editingEvaluation.grade !== undefined ? String(editingEvaluation.grade) : '');
        } else {
            setTitle('');
            setType('Exam');
            setDescription('');
            setDueDate(today);
            const defaultWeight = Math.min(15, maxAvailableWeight);
            setWeightPercent(defaultWeight);
            setMaxGrade(100);
            setGrade('');
        }
        setError(null);
    }, [editingEvaluation, isOpen, today, maxAvailableWeight]);

    const parsedGrade = grade.trim() !== '' ? Number(grade) : null;
    const isGraded = parsedGrade !== null && !isNaN(parsedGrade);
    const gradePercent = isGraded && maxGrade > 0 ? (parsedGrade / maxGrade) * 100 : null;
    const totalWeightAfter = otherWeight + (Number(weightPercent) || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Evaluation title is required');
            return;
        }
        if (!type.trim()) {
            setError('Evaluation type is required');
            return;
        }

        const numericWeight = Number(weightPercent) || 0;
        if (numericWeight < 0) {
            setError('Weight percentage cannot be negative');
            return;
        }

        if (otherWeight + numericWeight > 100) {
            setError(`Total weight cannot exceed 100%. Currently used: ${otherWeight}%. Max available: ${maxAvailableWeight}%.`);
            return;
        }

        if (maxGrade <= 0) {
            setError('Max grade must be greater than 0');
            return;
        }

        if (parsedGrade !== null && (parsedGrade < 0 || parsedGrade > maxGrade)) {
            setError(`Grade received must be between 0 and ${maxGrade}`);
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const dueAt = dueDate ? `${dueDate}T23:59:59` : null;

            await onSave({
                subjectId,
                title: title.trim(),
                type: type.trim(),
                description: description.trim() || undefined,
                dueAt,
                weightPercent: numericWeight,
                maxGrade: Number(maxGrade),
                grade: parsedGrade,
            });
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to save evaluation');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            size="lg"
            onClose={onClose}
            title={editingEvaluation ? 'Edit Evaluation' : 'New Evaluation'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-[var(--app-text-muted)] flex items-center gap-1.5">
                            <Percent className="h-3.5 w-3.5 text-[var(--accent-color)]" />
                            <span>Course Assessment Weight Budget</span>
                        </span>
                        <span className="font-bold text-[var(--app-text)]">
                            {totalWeightAfter}% / 100%
                        </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-[var(--app-border)] overflow-hidden flex">
                        <div
                            className="h-full bg-[var(--accent-color)]/50 transition-all duration-300"
                            style={{ width: `${Math.min(100, otherWeight)}%` }}
                            title={`Other evaluations: ${otherWeight}%`}
                        />
                        <div
                            className={`h-full transition-all duration-300 ${
                                totalWeightAfter > 100 ? 'bg-red-500' : 'bg-[var(--accent-color)]'
                            }`}
                            style={{ width: `${Math.min(100 - Math.min(100, otherWeight), Number(weightPercent) || 0)}%` }}
                            title={`This evaluation: ${weightPercent}%`}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--app-text-muted)]">
                        <span>Used by other tests: <strong className="text-[var(--app-text)]">{otherWeight}%</strong></span>
                        <span>Available for this: <strong className="text-emerald-400">{maxAvailableWeight}%</strong></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Midterm Exam, Problem Set 3, Final Project"
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                            Due / Exam Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={fieldClass}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                            Evaluation Type (Custom Text)
                        </label>
                        <span className="text-[11px] text-[var(--app-text-muted)]">
                            Type any custom name or pick a preset
                        </span>
                    </div>
                    <input
                        type="text"
                        required
                        list="evaluation-type-suggestions"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="e.g. Exam, Quiz, Presentation, Oral Defense..."
                        className={fieldClass}
                    />
                    <datalist id="evaluation-type-suggestions">
                        {ASSESSMENT_TYPE_PRESETS.map((p) => (
                            <option key={p} value={p} />
                        ))}
                    </datalist>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {ASSESSMENT_TYPE_PRESETS.map((preset) => {
                            const active = type.trim().toLowerCase() === preset.toLowerCase();
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setType(preset)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                                        active
                                            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20 text-[var(--accent-color)] shadow-sm'
                                            : 'border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-border-hover,#555)]'
                                    }`}
                                >
                                    {preset}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/30 p-4">
                    <span className="block text-xs font-bold text-[var(--app-text)] uppercase tracking-wider mb-3">
                        Grading & Ponderation
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                                    Weight (%)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setWeightPercent(maxAvailableWeight)}
                                    className="text-[10px] font-bold text-[var(--accent-color)] hover:underline"
                                    title="Assign all remaining weight"
                                >
                                    Use max ({maxAvailableWeight}%)
                                </button>
                            </div>
                            <input
                                type="number"
                                min="0"
                                max={maxAvailableWeight}
                                step="any"
                                value={weightPercent}
                                onChange={(e) => setWeightPercent(parseFloat(e.target.value) || 0)}
                                placeholder="e.g. 20"
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                                Max Grade
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={maxGrade}
                                onChange={(e) => setMaxGrade(parseFloat(e.target.value) || 100)}
                                placeholder="e.g. 100 or 10"
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                                Grade Received
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={maxGrade}
                                step="any"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="Optional"
                                className={fieldClass}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--app-card-bg)] border border-[var(--app-border)]/60 p-3">
                        <div className="flex items-center gap-3">
                            <GradeWheel score={gradePercent} size={44} strokeWidth={4} showLabel={false} />
                            <div>
                                <span className="block text-xs font-bold text-[var(--app-text)]">
                                    {isGraded ? `${parsedGrade} / ${maxGrade}` : 'Ungraded'}
                                </span>
                                <span className="block text-[11px] text-[var(--app-text-muted)]">
                                    {isGraded
                                        ? `${formatGrade(gradePercent)}% score · Contributes ${formatGrade((gradePercent! * weightPercent) / 100)}% to course`
                                        : 'Grade not set yet'}
                                </span>
                            </div>
                        </div>

                        {weightPercent > 0 && (
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                                    Weight in Course
                                </span>
                                <span className="text-sm font-black text-purple-400">
                                    {weightPercent}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Instructions / Description (Optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Topics covered, room number, allowed cheat sheet, submission link..."
                        className={fieldClass}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                    <button type="button" onClick={onClose} className={ghostButton} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className={primaryButton} disabled={submitting}>
                        {submitting ? 'Saving...' : editingEvaluation ? 'Update Evaluation' : 'Create Evaluation'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
