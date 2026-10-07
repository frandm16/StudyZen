import { History, Clock, Star, Play, Calendar } from 'lucide-react';
import { formatMinutes, formatDateDisplay } from './helpers';
import type { Session } from '../../types/session';
import type { Topic } from '../../types/topic';
import type { Subject } from '../../types/subject';

interface SubjectSessionsTabProps {
    subject: Subject;
    sessions: Session[];
    topics: Topic[];
    onStartSession: () => void;
}

export function SubjectSessionsTab({
    sessions,
    topics,
    onStartSession,
}: SubjectSessionsTabProps) {
    const topicMap = new Map(topics.map((t) => [t.id, t]));
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h3 className="text-sm font-bold text-[var(--app-text)]">
                        Logged Sessions ({sessions.length})
                    </h3>
                    <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                        {formatMinutes(totalMinutes)} dedicated to this subject
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onStartSession}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 shadow-md shadow-[var(--accent-color)]/20 transition-all cursor-pointer"
                >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Studying</span>
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--app-border)] bg-[var(--app-card-bg)]/40 p-12 text-center">
                    <div className="p-3 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] mb-3">
                        <History className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--app-text)]">No sessions recorded yet</h3>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)] max-w-sm">
                        Use the timer to start studying topics from this subject and track your focused hours automatically.
                    </p>
                    <button
                        type="button"
                        onClick={onStartSession}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 cursor-pointer shadow-sm"
                    >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Start First Session</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {sessions.map((session) => {
                        const topic = topicMap.get(session.topicId);
                        return (
                            <div
                                key={session.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 hover:border-[var(--accent-color)]/30 transition-all"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-[var(--app-text)] truncate">
                                            {session.title || topic?.name || 'General Study'}
                                        </h4>
                                        {topic && session.title && (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] truncate">
                                                {topic.name}
                                            </span>
                                        )}
                                    </div>

                                    {session.description && (
                                        <p className="mt-1 text-xs text-[var(--app-text-muted)] line-clamp-1">
                                            {session.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--app-text-muted)]">
                                        <div className="flex items-center gap-1 font-medium">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDateDisplay(session.startedAt)}</span>
                                        </div>

                                        {session.focusRating && (
                                            <div className="flex items-center gap-1 text-amber-400">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="font-bold">{session.focusRating}/5</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                    <div className="px-3 py-1.5 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-black text-sm flex items-center gap-1.5 border border-[var(--accent-color)]/20">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{formatMinutes(session.totalMinutes)}</span>
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
