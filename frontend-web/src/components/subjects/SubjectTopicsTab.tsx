import { useState } from 'react';
import { Plus, Play, Edit3, Trash2, BookOpen, Search } from 'lucide-react';
import { TOPIC_STATUS_CONFIG } from './helpers';
import type { Topic, TopicStatus } from '../../types/topic';
import type { Subject } from '../../types/subject';

interface SubjectTopicsTabProps {
    subject: Subject;
    topics: Topic[];
    onOpenCreateTopic: () => void;
    onEditTopic: (topic: Topic) => void;
    onDeleteTopic: (topicId: number) => void;
    onUpdateStatus: (topicId: number, status: TopicStatus) => void;
    onStudyTopic: (topic: Topic) => void;
}

export function SubjectTopicsTab({
    topics,
    onOpenCreateTopic,
    onEditTopic,
    onDeleteTopic,
    onUpdateStatus,
    onStudyTopic,
}: SubjectTopicsTabProps) {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredTopics = topics.filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (query.trim()) {
            const q = query.toLowerCase();
            return t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
        }
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--app-text-muted)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search syllabus topics..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-xs text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                    >
                        <option value="all">All Statuses</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="completed">Completed</option>
                        <option value="mastered">Mastered</option>
                        <option value="skipped">Skipped</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={onOpenCreateTopic}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 shadow-md shadow-[var(--accent-color)]/20 transition-all cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Topic</span>
                </button>
            </div>

            {filteredTopics.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--app-border)] bg-[var(--app-card-bg)]/40 p-12 text-center">
                    <div className="p-3 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] mb-3">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--app-text)]">No topics found</h3>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)] max-w-sm">
                        {query || statusFilter !== 'all'
                            ? 'No topics match your search criteria. Try resetting filters.'
                            : 'Start breaking down your syllabus into topics, units or chapters.'}
                    </p>
                    {!query && statusFilter === 'all' && (
                        <button
                            type="button"
                            onClick={onOpenCreateTopic}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 cursor-pointer shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add First Topic</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {filteredTopics.map((topic) => {
                        const statusConfig = TOPIC_STATUS_CONFIG[topic.status] || TOPIC_STATUS_CONFIG.not_started;
                        return (
                            <div
                                key={topic.id}
                                className="group flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4.5 hover:border-[var(--accent-color)]/40 hover:shadow-lg transition-all"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-[var(--app-text)] group-hover:text-[var(--accent-color)] transition-colors">
                                                {topic.name}
                                            </h4>
                                            {topic.description && (
                                                <p className="mt-1 text-xs text-[var(--app-text-muted)] line-clamp-2 leading-relaxed">
                                                    {topic.description}
                                                </p>
                                            )}
                                        </div>

                                        <select
                                            value={topic.status}
                                            onChange={(e) => onUpdateStatus(topic.id, e.target.value as TopicStatus)}
                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer shrink-0 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                        >
                                            <option value="not_started">Not Started</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="reviewing">Reviewing</option>
                                            <option value="completed">Completed</option>
                                            <option value="mastered">Mastered</option>
                                            <option value="skipped">Skipped</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-[var(--app-border)]/60">
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)]">
                                        <span className="font-semibold text-[11px]">
                                            Confidence: {topic.confidence ?? 0}/5
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                <span
                                                    key={lvl}
                                                    className={`h-1.5 w-2.5 rounded-sm ${
                                                        (topic.confidence ?? 0) >= lvl
                                                            ? 'bg-[var(--accent-color)]'
                                                            : 'bg-[var(--app-border)]'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onStudyTopic(topic)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 shadow-sm transition-all cursor-pointer"
                                            title="Start a focus session on this topic"
                                        >
                                            <Play className="h-3 w-3 fill-current" />
                                            <span>Study</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEditTopic(topic)}
                                            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-white/5 transition-colors"
                                            title="Edit topic"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteTopic(topic.id)}
                                            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete topic"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
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
