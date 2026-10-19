import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal, fieldClass, primaryButton, ghostButton } from '../../ui/Modal';
import { getApiErrorMessage } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import type { Session, UpdateSessionDTO } from '../../../types/session';
import type { Subject } from '../../../types/subject';
import type { Topic } from '../../../types/topic';

interface SessionModalProps {
    session: Session;
    subjects: Subject[];
    topics: Topic[];
    onClose: () => void;
    onSave: (data: UpdateSessionDTO) => Promise<void>;
}

export function SessionModal({ session, subjects, topics, onClose, onSave }: SessionModalProps) {
    const notify = useToast();
    const initialTopic = topics.find((topic) => topic.id === session.topicId);
    const [title, setTitle] = useState(session.title);
    const [subjectId, setSubjectId] = useState(initialTopic?.subjectId ? String(initialTopic.subjectId) : '');
    const [topicId, setTopicId] = useState(String(session.topicId));
    const [rating, setRating] = useState(session.focusRating ?? 0);
    const [submitting, setSubmitting] = useState(false);
    const availableTopics = useMemo(
        () => topics.filter((topic) => String(topic.subjectId) === subjectId),
        [topics, subjectId],
    );

    useEffect(() => {
        if (!availableTopics.some((topic) => String(topic.id) === topicId)) {
            setTopicId(availableTopics[0] ? String(availableTopics[0].id) : '');
        }
    }, [availableTopics, topicId]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {
            notify({ title: 'Session title is required', tone: 'warning', persist: false });
            return;
        }
        if (!topicId) {
            notify({ title: 'Choose a topic for this session', tone: 'warning', persist: false });
            return;
        }
        setSubmitting(true);
        try {
            await onSave({
                title: title.trim(),
                topicId: Number(topicId),
                focusRating: rating,
            });
            onClose();
        } catch (error) {
            notify({ title: 'Could not update session', description: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal title="Edit Session" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="session-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                        Title
                    </label>
                    <input id="session-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} className={fieldClass} />
                </div>
                <div>
                    <label htmlFor="session-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                        Subject
                    </label>
                    <select id="session-subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className={fieldClass}>
                        <option value="" disabled>Select a subject</option>
                        {subjects.filter((subject) => !subject.isArchived).map((subject) => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="session-topic" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                        Topic
                    </label>
                    <select id="session-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)} disabled={!availableTopics.length} className={fieldClass}>
                        <option value="" disabled>Select a topic</option>
                        {availableTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                    </select>
                </div>
                <fieldset>
                    <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                        Focus rating ({rating}/5)
                    </legend>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={rating === value}
                                aria-label={value === 0 ? 'No rating' : `${value} out of 5`}
                                onClick={() => setRating(value)}
                                className={`min-h-10 flex-1 rounded-lg border text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] ${rating === value ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white' : 'border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:border-[var(--accent-color)]'}`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </fieldset>
                <div className="flex justify-end gap-2 border-t border-[var(--app-border)] pt-3">
                    <button type="button" onClick={onClose} className={ghostButton} disabled={submitting}>Cancel</button>
                    <button type="submit" className={primaryButton} disabled={submitting || !topicId}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </Modal>
    );
}
