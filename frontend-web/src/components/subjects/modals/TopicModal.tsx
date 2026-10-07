import React, { useEffect, useState } from 'react';
import { Modal, fieldClass, primaryButton, ghostButton } from '../../ui/Modal';
import { TOPIC_STATUS_CONFIG } from '../helpers';
import type { Topic, CreateTopicDTO, TopicStatus } from '../../../types/topic';

interface TopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingTopic: Topic | null;
    subjectId: number;
    onSave: (data: CreateTopicDTO) => Promise<void>;
}

const STATUS_KEYS: TopicStatus[] = ['not_started', 'in_progress', 'reviewing', 'completed', 'mastered', 'skipped'];

export function TopicModal({ isOpen, onClose, editingTopic, subjectId, onSave }: TopicModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TopicStatus>('not_started');
    const [confidence, setConfidence] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingTopic) {
            setName(editingTopic.name);
            setDescription(editingTopic.description || '');
            setStatus(editingTopic.status || 'not_started');
            setConfidence(editingTopic.confidence !== undefined && editingTopic.confidence !== null ? editingTopic.confidence : 0);
        } else {
            setName('');
            setDescription('');
            setStatus('not_started');
            setConfidence(0);
        }
        setError(null);
    }, [editingTopic, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Topic name is required');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onSave({
                name: name.trim(),
                subjectId,
                description: description.trim() || undefined,
                status,
                confidence,
            });
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to save topic');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            onClose={onClose}
            title={editingTopic ? 'Edit Topic' : 'New Topic'}
        >
            <p className="text-xs text-[var(--app-text-muted)] -mt-4 mb-4">
                {editingTopic ? 'Update syllabus topic details and progress.' : 'Add a new topic or unit to the subject syllabus.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Topic Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Eigenvalues, Normalization, Chapter 4"
                        className={fieldClass}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TopicStatus)}
                            className={fieldClass}
                        >
                            {STATUS_KEYS.map((k) => (
                                <option key={k} value={k}>
                                    {TOPIC_STATUS_CONFIG[k].label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                            Confidence Level ({confidence}/5)
                        </label>
                        <div className="flex items-center gap-1.5 pt-1">
                            {[0, 1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setConfidence(lvl)}
                                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                        confidence === lvl
                                            ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white shadow-sm'
                                            : 'border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:border-[var(--app-text-muted)]'
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Notes / Key Concepts (Optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Summary of formulas, key readings, definitions..."
                        className={fieldClass}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                    <button type="button" onClick={onClose} className={ghostButton} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className={primaryButton} disabled={submitting}>
                        {submitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
