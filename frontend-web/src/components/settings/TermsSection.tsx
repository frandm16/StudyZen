import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Check, X, Calendar } from 'lucide-react';
import { termService } from '../../services/term-service';
import { getApiErrorMessage } from '../../services/api';
import type { AcademicTerm } from '../../types/academic-term';

interface TermFormState {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

const emptyForm = (): TermFormState => {
    const today = new Date().toISOString().slice(0, 10);
    const inFourMonths = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { name: '', startDate: today, endDate: inFourMonths, isCurrent: false };
};

const fieldCls =
    'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] ' +
    'placeholder:text-[var(--app-text-muted)] focus:border-[var(--accent-color)] focus:outline-none transition-colors';

interface TermRowProps {
    term: AcademicTerm;
    editingId: number | null;
    formState: TermFormState;
    saving: boolean;
    onStartEdit: (t: AcademicTerm) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onSetCurrent: (id: number) => void;
    onDelete: (id: number) => void;
    onFormChange: (patch: Partial<TermFormState>) => void;
}

function TermRow({
    term,
    editingId,
    formState,
    saving,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onSetCurrent,
    onDelete,
    onFormChange,
}: TermRowProps) {
    const isEditing = editingId === term.id;

    if (isEditing) {
        return (
            <div className="rounded-2xl border border-[var(--accent-color)]/40 bg-[var(--app-bg)] p-4 space-y-3">
                <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => onFormChange({ name: e.target.value })}
                    placeholder="Term name"
                    className={fieldCls}
                    autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={formState.startDate}
                            onChange={(e) => onFormChange({ startDate: e.target.value })}
                            className={fieldCls}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={formState.endDate}
                            onChange={(e) => onFormChange({ endDate: e.target.value })}
                            className={fieldCls}
                        />
                    </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={formState.isCurrent}
                        onChange={(e) => onFormChange({ isCurrent: e.target.checked })}
                        className="h-4 w-4 rounded border-[var(--app-border)] accent-[var(--accent-color)]"
                    />
                    <span className="text-xs text-[var(--app-text)]">Set as default term</span>
                </label>
                <div className="flex justify-end gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        disabled={saving}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSaveEdit}
                        disabled={saving || !formState.name.trim()}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent-color)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                    >
                        <Check className="w-3.5 h-3.5" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] hover:border-[var(--accent-color)]/30 transition-all group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--app-text)] truncate">{term.name}</span>
                    {term.isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            Default
                        </span>
                    )}
                    {term.isArchived && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-neutral-500/15 text-[var(--app-text-muted)] border border-[var(--app-border)]">
                            Archived
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {term.startDate} → {term.endDate}
                </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!term.isCurrent && (
                    <button
                        type="button"
                        title="Set as current term"
                        onClick={() => onSetCurrent(term.id)}
                        className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                    >
                        <Star className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    type="button"
                    title="Edit term"
                    onClick={() => onStartEdit(term)}
                    className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-colors"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    title="Delete term"
                    onClick={() => onDelete(term.id)}
                    className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export function TermsSection() {
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [formState, setFormState] = useState<TermFormState>(emptyForm());
    const [saving, setSaving] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState<TermFormState>(emptyForm());
    const [creating, setCreating] = useState(false);

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const showMsg = (msg: string, isError = false) => {
        if (isError) {
            setError(msg);
            setSuccess(null);
        } else {
            setSuccess(msg);
            setError(null);
        }
        setTimeout(() => { setError(null); setSuccess(null); }, 3500);
    };

    useEffect(() => {
        termService.getAll()
            .then(setTerms)
            .catch((e) => setError(getApiErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    const handleStartEdit = (t: AcademicTerm) => {
        setEditingId(t.id);
        setFormState({ name: t.name, startDate: t.startDate, endDate: t.endDate, isCurrent: t.isCurrent });
        setShowCreate(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormState(emptyForm());
    };

    const handleSaveEdit = async () => {
        if (!editingId || !formState.name.trim()) return;
        setSaving(true);
        try {
            const updated = await termService.update(editingId, formState);
            setTerms((prev) => prev.map((t) => {
                if (t.id === editingId) return updated;
                if (formState.isCurrent) return { ...t, isCurrent: false };
                return t;
            }));
            setEditingId(null);
            showMsg('Term updated successfully');
        } catch (e) {
            showMsg(getApiErrorMessage(e), true);
        } finally {
            setSaving(false);
        }
    };

    const handleSetCurrent = async (id: number) => {
        try {
            const updated = await termService.setCurrent(id);
            setTerms((prev) => prev.map((t) =>
                t.id === id ? updated : { ...t, isCurrent: false }
            ));
            showMsg('Active term updated');
        } catch (e) {
            showMsg(getApiErrorMessage(e), true);
        }
    };

    const handleDelete = async (id: number) => {
        if (deleteConfirmId !== id) {
            setDeleteConfirmId(id);
            return;
        }
        try {
            await termService.delete(id);
            setTerms((prev) => prev.filter((t) => t.id !== id));
            setDeleteConfirmId(null);
            showMsg('Term deleted');
        } catch (e) {
            showMsg(getApiErrorMessage(e), true);
        }
    };

    const handleCreate = async () => {
        if (!createForm.name.trim()) return;
        setCreating(true);
        try {
            const created = await termService.create(createForm);
            setTerms((prev) => {
                const base = createForm.isCurrent
                    ? prev.map((t) => ({ ...t, isCurrent: false }))
                    : prev;
                return [...base, created];
            });
            setShowCreate(false);
            setCreateForm(emptyForm());
            showMsg('Term created successfully');
        } catch (e) {
            showMsg(getApiErrorMessage(e), true);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {error && (
                <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                    <X className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
                    <Check className="w-4 h-4 shrink-0" />
                    {success}
                </div>
            )}

            <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[var(--app-text)] text-sm uppercase tracking-wider text-[var(--app-text-muted)]">
                        Academic Terms
                    </h3>
                    <button
                        type="button"
                        onClick={() => { setShowCreate(true); setEditingId(null); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent-color)] text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Term
                    </button>
                </div>

                {showCreate && (
                    <div className="rounded-2xl border border-[var(--accent-color)]/40 bg-[var(--app-bg)] p-4 space-y-3">
                        <p className="text-xs font-semibold text-[var(--accent-color)] uppercase tracking-wider">New Term</p>
                        <input
                            type="text"
                            value={createForm.name}
                            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Fall 2026, Semester 1"
                            className={fieldCls}
                            autoFocus
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={createForm.startDate}
                                    onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
                                    className={fieldCls}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={createForm.endDate}
                                    onChange={(e) => setCreateForm((p) => ({ ...p, endDate: e.target.value }))}
                                    className={fieldCls}
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={createForm.isCurrent}
                                onChange={(e) => setCreateForm((p) => ({ ...p, isCurrent: e.target.checked }))}
                                className="h-4 w-4 rounded border-[var(--app-border)] accent-[var(--accent-color)]"
                            />
                            <span className="text-xs text-[var(--app-text)]">Set as default term</span>
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => { setShowCreate(false); setCreateForm(emptyForm()); }}
                                className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={creating || !createForm.name.trim()}
                                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent-color)] text-white hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                            >
                                <Check className="w-3.5 h-3.5" />
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="py-8 text-center text-xs text-[var(--app-text-muted)]">Loading terms...</div>
                ) : terms.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[var(--app-text-muted)]">
                        No academic terms yet. Create one to get started.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {terms.map((term) => (
                            <div key={term.id}>
                                {deleteConfirmId === term.id && editingId !== term.id ? (
                                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                                        <p className="flex-1 text-xs text-red-400 font-medium">
                                            Delete <span className="font-bold">{term.name}</span>? This cannot be undone.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(term.id)}
                                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : (
                                    <TermRow
                                        term={term}
                                        editingId={editingId}
                                        formState={formState}
                                        saving={saving}
                                        onStartEdit={handleStartEdit}
                                        onCancelEdit={handleCancelEdit}
                                        onSaveEdit={handleSaveEdit}
                                        onSetCurrent={handleSetCurrent}
                                        onDelete={handleDelete}
                                        onFormChange={(patch) => setFormState((p) => ({ ...p, ...patch }))}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}