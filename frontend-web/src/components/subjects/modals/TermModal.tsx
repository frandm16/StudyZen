import React, { useState } from 'react';
import { Modal, fieldClass, primaryButton, ghostButton } from '../../ui/Modal';
import { termService } from '../../../services/term-service';
import { getApiErrorMessage } from '../../../services/api';
import type { AcademicTerm } from '../../../types/academic-term';

interface TermModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (term: AcademicTerm) => void;
}

export function TermModal({ isOpen, onClose, onCreated }: TermModalProps) {
    const today = new Date().toISOString().slice(0, 10);
    const inFourMonths = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(inFourMonths);
    const [isCurrent, setIsCurrent] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Term name is required');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const created = await termService.create({
                name: name.trim(),
                startDate,
                endDate,
                isCurrent,
            });
            onCreated(created);
            setName('');
            onClose();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            onClose={onClose}
            title="Create Academic Term"
        >
            <p className="text-xs text-[var(--app-text-muted)] -mt-4 mb-4">
                Add a new academic term or semester to organize your subjects.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                        Term Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Fall 2026, Semester 1"
                        className={fieldClass}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                            Start Date
                        </label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5">
                            End Date
                        </label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="isCurrentTerm"
                        checked={isCurrent}
                        onChange={(e) => setIsCurrent(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                    />
                    <label htmlFor="isCurrentTerm" className="text-xs text-[var(--app-text)] font-medium cursor-pointer">
                        Set as active / current academic term
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                    <button type="button" onClick={onClose} className={ghostButton} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className={primaryButton} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Term'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
