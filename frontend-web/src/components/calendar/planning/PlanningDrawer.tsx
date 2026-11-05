import { useState } from 'react';
import {
    AlertCircle,
    CalendarCheck,
    CheckSquare,
    Target,
    X,
} from 'lucide-react';
import { DayNotesSection } from './DayNotesSection';
import { DayTodosSection } from './DayTodosSection';
import { DeadlinesSection } from './DeadlinesSection';
import { GoalsSection } from './GoalsSection';
import type { Deadline } from '../../../types/deadline';
import type { Assessment } from '../../../types/assessment';
import type { Subject } from '../../../types/subject';
import type { Session } from '../../../types/session';

type PlanningTab = 'plan' | 'deadlines' | 'goals';

interface PlanningDrawerProps {
    open: boolean;
    onClose: () => void;
    selectedDate: Date;
    deadlines: Deadline[];
    assessments: Assessment[];
    subjects: Subject[];
    sessions: Session[];
    weekStartsOn: number;
    onDeadlinesChange: () => void;
}

export function PlanningDrawer({
    open,
    onClose,
    selectedDate,
    deadlines,
    assessments,
    subjects,
    sessions,
    weekStartsOn,
    onDeadlinesChange,
}: PlanningDrawerProps) {
    const [activeTab, setActiveTab] = useState<PlanningTab>('plan');

    if (!open) return null;

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    const pendingDeadlinesCount =
        deadlines.filter((d) => !d.isCompleted).length +
        assessments.filter((a) => !a.completed).length;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                aria-label="Planning desk"
                className="fixed inset-y-0 right-0 z-40 flex h-full w-80 max-w-[90vw] flex-col border-l border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] shadow-2xl transition-transform lg:static lg:z-auto lg:w-80 lg:shadow-none xl:w-96"
            >
                <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
                    <div className="flex items-center gap-2">
                        <CalendarCheck size={18} className="text-[var(--accent-color)]" />
                        <div>
                            <h2 className="text-sm font-bold tracking-tight">Planning Desk</h2>
                            <p className="text-[11px] font-medium text-[var(--app-text-muted)]">
                                {formattedDate}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close planning desk"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-card-hover)] hover:text-[var(--app-text)]"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex border-b border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 py-1.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('plan')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                            activeTab === 'plan'
                                ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        <CheckSquare size={13} />
                        <span>Daily Plan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('deadlines')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                            activeTab === 'deadlines'
                                ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        <AlertCircle size={13} />
                        <span>Deadlines</span>
                        {pendingDeadlinesCount > 0 && (
                            <span className="rounded-full bg-[var(--accent-color)]/20 px-1.5 py-0.2 text-[10px] font-bold text-[var(--accent-color)]">
                                {pendingDeadlinesCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('goals')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                            activeTab === 'goals'
                                ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs'
                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                    >
                        <Target size={13} />
                        <span>Goals</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                    {activeTab === 'plan' && (
                        <>
                            <DayNotesSection selectedDate={selectedDate} />
                            <DayTodosSection selectedDate={selectedDate} />
                        </>
                    )}

                    {activeTab === 'deadlines' && (
                        <DeadlinesSection
                            deadlines={deadlines}
                            assessments={assessments}
                            subjects={subjects}
                            selectedDate={selectedDate}
                            onDeadlinesChange={onDeadlinesChange}
                        />
                    )}

                    {activeTab === 'goals' && (
                        <GoalsSection
                            subjects={subjects}
                            sessions={sessions}
                            weekStartsOn={weekStartsOn}
                        />
                    )}
                </div>
            </aside>
        </>
    );
}
