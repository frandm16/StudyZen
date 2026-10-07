import { BookOpen, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { formatMinutes } from './helpers';

interface SubjectStatsBannerProps {
    totalSubjects: number;
    completedTopics: number;
    totalTopics: number;
    totalMinutes: number;
    upcomingEvaluations: number;
}

export function SubjectStatsBanner({
    totalSubjects,
    completedTopics,
    totalTopics,
    totalMinutes,
    upcomingEvaluations,
}: SubjectStatsBannerProps) {
    const topicsPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                        Active Courses
                    </span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <BookOpen className="h-4 w-4" />
                    </div>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--app-text)]">{totalSubjects}</p>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-1">Enrolled & Active</p>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                        Topic Progress
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[var(--app-text)]">{topicsPercent}%</span>
                    <span className="text-xs text-[var(--app-text-muted)] font-medium">
                        ({completedTopics}/{totalTopics} topics)
                    </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--app-border)] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${topicsPercent}%` }}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                        Total Time Studied
                    </span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--app-text)]">{formatMinutes(totalMinutes)}</p>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-1">Logged study sessions</p>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                        Upcoming Evaluations
                    </span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                        <CalendarDays className="h-4 w-4" />
                    </div>
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--app-text)]">{upcomingEvaluations}</p>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-1">Pending exams & assignments</p>
            </div>
        </div>
    );
}
