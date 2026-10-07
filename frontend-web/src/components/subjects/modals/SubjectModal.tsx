import React, { useEffect, useState } from 'react';
import { Modal, fieldClass, primaryButton, ghostButton } from '../../ui/Modal';
import { PALETTE } from '../helpers';
import type { Subject, CreateSubjectDTO } from '../../../types/subject';
import type { AcademicTerm } from '../../../types/academic-term';

interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingSubject: Subject | null;
    terms: AcademicTerm[];
    onSave: (data: CreateSubjectDTO) => Promise<void>;
}

export function SubjectModal({ isOpen, onClose, editingSubject, terms, onSave }: SubjectModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(PALETTE[0]);
    const [termId, setTermId] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingSubject) {
            setName(editingSubject.name);
            setColor(editingSubject.color || PALETTE[0]);
            setTermId(editingSubject.termId ?? '');
            setNotes(editingSubject.notes || '');
        } else {
            setName('');
            setColor(PALETTE[0]);
            const currentTerm = terms.find((t) => t.isCurrent);
            setTermId(currentTerm ? currentTerm.id : (terms[0]?.id ?? ''));
            setNotes('');
        }
        setError(null);
    }, [editingSubject, terms, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Subject name is required');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onSave({
                name: name.trim(),
                color,
                termId: termId === '' ? undefined : Number(termId),
                notes: notes.trim() || undefined,
            });
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to save subject');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            onClose={onClose}
            title={editingSubject ? 'Edit Subject' : 'New Subject'}
        >
            <p className="text-xs text-[var(--app-text-muted)] -mt-4 mb-4">
                {editingSubject ? 'Update subject information and settings.' : 'Create a new course or subject to organize topics and evaluations.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Subject Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Linear Algebra, Operating Systems"
                        className={fieldClass}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Academic Term
                    </label>
                    <select
                        value={termId}
                        onChange={(e) => setTermId(e.target.value ? Number(e.target.value) : '')}
                        className={fieldClass}
                    >
                        <option value="">No term assigned</option>
                        {terms.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} {t.isCurrent ? '(Current)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-2">
                        Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                        {PALETTE.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                style={{ backgroundColor: c }}
                                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 focus:outline-none ${
                                    color === c
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--app-card-bg)] scale-110 shadow-lg'
                                        : 'opacity-70 hover:opacity-100'
                                }`}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Notes & Details (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Professor name, office hours, links to syllabus or resources..."
                        className={fieldClass}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                    <button type="button" onClick={onClose} className={ghostButton} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className={primaryButton} disabled={submitting}>
                        {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
