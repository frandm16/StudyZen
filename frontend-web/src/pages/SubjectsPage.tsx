import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Plus,
    Star,
    Trash2,
    Edit3,
    ArrowLeft,
    CheckCircle2,
    Play,
    GraduationCap,
    Search,
    AlertCircle,
    FolderKanban,
    BarChart2,
} from 'lucide-react';
import { useTimerContext } from '../context/TimerContext';
import { getApiErrorMessage } from '../services/api';
import { subjectService } from '../services/subject-service';
import { topicService } from '../services/topic-service';
import { assessmentService } from '../services/assessment-service';
import { sessionService } from '../services/session-service';
import { termService } from '../services/term-service';
import type { Subject, CreateSubjectDTO } from '../types/subject';
import type { Topic, CreateTopicDTO, TopicStatus } from '../types/topic';
import type { Assessment, AssessmentType, CreateAssessmentDTO } from '../types/assessment';
import type { Session } from '../types/session';
import type { AcademicTerm } from '../types/academic-term';
import { Modal, fieldClass, primaryButton, ghostButton } from '../components/ui/Modal';

const PALETTE = [
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#10b981',
    '#06b6d4',
    '#64748b',
];

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
    { value: 'exam', label: 'Exam' },
    { value: 'midterm', label: 'Midterm' },
    { value: 'final_exam', label: 'Final Exam' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'project', label: 'Project' },
    { value: 'lab', label: 'Lab' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'other', label: 'Other' },
];

function formatMinutes(mins: number): string {
    if (!mins || mins <= 0) return '0m';
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hours === 0) return `${rem}m`;
    if (rem === 0) return `${hours}h`;
    return `${hours}h ${rem}m`;
}

function formatDateDisplay(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });
    } catch {
        return dateStr;
    }
}

function getDaysRemaining(dateStr: string): { label: string; isPast: boolean; isToday: boolean } {
    try {
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDay = new Date(target);
        targetDay.setHours(0, 0, 0, 0);

        const diffTime = targetDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { label: 'Today', isPast: false, isToday: true };
        if (diffDays === 1) return { label: 'Tomorrow', isPast: false, isToday: false };
        if (diffDays > 1) return { label: `In ${diffDays} days`, isPast: false, isToday: false };
        return { label: `${Math.abs(diffDays)}d ago`, isPast: true, isToday: false };
    } catch {
        return { label: '', isPast: false, isToday: false };
    }
}

export function SubjectsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const timer = useTimerContext();

    const selectedSubjectId = useMemo(() => {
        const idParam = searchParams.get('id');
        return idParam ? Number(idParam) : null;
    }, [searchParams]);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [terms, setTerms] = useState<AcademicTerm[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTermFilter, setSelectedTermFilter] = useState<number | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'topics' | 'assessments' | 'sessions'>('topics');

    const [subjectModalOpen, setSubjectModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectName, setSubjectName] = useState('');
    const [subjectColor, setSubjectColor] = useState(PALETTE[0]);
    const [subjectTermId, setSubjectTermId] = useState<number | ''>('');
    const [subjectNotes, setSubjectNotes] = useState('');

    const [topicModalOpen, setTopicModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [topicName, setTopicName] = useState('');
    const [topicDescription, setTopicDescription] = useState('');
    const [topicStatus, setTopicStatus] = useState<TopicStatus>('not_started');
    const [topicConfidence, setTopicConfidence] = useState<number>(3);

    const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [assessmentDescription, setAssessmentDescription] = useState('');
    const [assessmentType, setAssessmentType] = useState<AssessmentType>('exam');
    const [assessmentDueDate, setAssessmentDueDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [assessmentMaxGrade, setAssessmentMaxGrade] = useState<number>(100);
    const [assessmentWeightPercent, setAssessmentWeightPercent] = useState<number>(0);
    const [assessmentGrade, setAssessmentGrade] = useState<string>('');

    const [modalSubmitting, setModalSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [loadedSubjects, loadedTopics, loadedAssessments, loadedSessions, loadedTerms] = await Promise.all([
                subjectService.getAll(),
                topicService.getAll(),
                assessmentService.getAll(),
                sessionService.getAll(),
                termService.getAll(),
            ]);
            setSubjects(loadedSubjects);
            setTopics(loadedTopics);
            setAssessments(loadedAssessments);
            setSessions(loadedSessions);
            setTerms(loadedTerms);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const activeTerms = useMemo(() => terms.filter((t) => !t.isArchived), [terms]);

    const selectedSubject = useMemo(() => {
        if (!selectedSubjectId) return null;
        return subjects.find((s) => s.id === selectedSubjectId) ?? null;
    }, [subjects, selectedSubjectId]);

    const filteredSubjects = useMemo(() => {
        return subjects.filter((subject) => {
            if (subject.isArchived) return false;
            if (selectedTermFilter !== 'all' && subject.termId !== selectedTermFilter) {
                return false;
            }
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                return (
                    subject.name.toLowerCase().includes(q) ||
                    (subject.notes && subject.notes.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [subjects, selectedTermFilter, searchTerm]);

    const subjectStatsMap = useMemo(() => {
        const stats: Record<number, { minutes: number; sessionCount: number; completedTopics: number; totalTopics: number; upcomingExams: number }> = {};
        for (const s of subjects) {
            const subTopics = topics.filter((t) => t.subjectId === s.id);
            const topicIds = new Set(subTopics.map((t) => t.id));
            const subSessions = sessions.filter((sess) => topicIds.has(sess.topicId));
            const totalMinutes = subSessions.reduce((acc, curr) => acc + (curr.totalMinutes || 0), 0);
            const completedCount = subTopics.filter((t) => t.status === 'completed').length;
            const subAssessments = assessments.filter((a) => a.subjectId === s.id && !a.completed);
            const examsCount = subAssessments.filter((a) => a.type === 'exam' || a.type === 'midterm' || a.type === 'final_exam').length;

            stats[s.id] = {
                minutes: totalMinutes,
                sessionCount: subSessions.length,
                completedTopics: completedCount,
                totalTopics: subTopics.length,
                upcomingExams: examsCount,
            };
        }
        return stats;
    }, [subjects, topics, sessions, assessments]);

    const totalStats = useMemo(() => {
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
        const totalExams = assessments.filter((a) => !a.completed && (a.type === 'exam' || a.type === 'midterm' || a.type === 'final_exam')).length;
        const totalCompletedTopics = topics.filter((t) => t.status === 'completed').length;
        return {
            totalSubjects: subjects.filter((s) => !s.isArchived).length,
            totalTopics: topics.length,
            completedTopics: totalCompletedTopics,
            totalMinutes,
            totalExams,
        };
    }, [subjects, topics, sessions, assessments]);

    const subjectTopics = useMemo(() => {
        if (!selectedSubject) return [];
        return topics.filter((t) => t.subjectId === selectedSubject.id);
    }, [topics, selectedSubject]);

    const subjectAssessments = useMemo(() => {
        if (!selectedSubject) return [];
        return assessments
            .filter((a) => a.subjectId === selectedSubject.id)
            .sort((a, b) => {
                if (!a.dueAt && !b.dueAt) return 0;
                if (!a.dueAt) return 1;
                if (!b.dueAt) return -1;
                return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
            });
    }, [assessments, selectedSubject]);

    const subjectSessions = useMemo(() => {
        if (!selectedSubject) return [];
        const topicIds = new Set(subjectTopics.map((t) => t.id));
        return sessions
            .filter((s) => topicIds.has(s.topicId))
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }, [sessions, subjectTopics, selectedSubject]);

    const openSubjectDetail = (sub: Subject) => {
        setSearchParams({ id: String(sub.id) });
    };

    const backToMaster = () => {
        setSearchParams({});
    };

    const handleStartStudy = (sub: Subject, topic?: Topic) => {
        timer.setSelectedTagId(sub.id);
        if (topic) {
            timer.setSelectedTaskId(topic.id);
        } else {
            const firstTopic = topics.find((t) => t.subjectId === sub.id);
            if (firstTopic) timer.setSelectedTaskId(firstTopic.id);
        }
        navigate('/timer');
    };

    const handleToggleFavoriteSubject = async (sub: Subject, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const updated = await subjectService.toggleFavorite(sub.id);
            setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const openCreateSubjectModal = () => {
        setEditingSubject(null);
        setSubjectName('');
        setSubjectColor(PALETTE[0]);
        const currentTerm = terms.find((t) => t.isCurrent && !t.isArchived);
        setSubjectTermId(currentTerm?.id ?? '');
        setSubjectNotes('');
        setSubjectModalOpen(true);
    };

    const openEditSubjectModal = (sub: Subject, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingSubject(sub);
        setSubjectName(sub.name);
        setSubjectColor(sub.color || PALETTE[0]);
        setSubjectTermId(sub.termId ?? '');
        setSubjectNotes(sub.notes ?? '');
        setSubjectModalOpen(true);
    };

    const handleDeleteSubject = async (sub: Subject, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete "${sub.name}" and all its related content?`)) {
            return;
        }
        try {
            await subjectService.delete(sub.id);
            setSubjects((prev) => prev.filter((s) => s.id !== sub.id));
            if (selectedSubjectId === sub.id) {
                backToMaster();
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleSubmitSubject = async (e: FormEvent) => {
        e.preventDefault();
        if (!subjectName.trim() || modalSubmitting) return;

        setModalSubmitting(true);
        setError(null);
        try {
            const payload: CreateSubjectDTO = {
                name: subjectName.trim(),
                color: subjectColor,
                termId: subjectTermId !== '' ? Number(subjectTermId) : undefined,
                notes: subjectNotes.trim() || undefined,
            };

            if (editingSubject) {
                const updated = await subjectService.update(editingSubject.id, payload);
                setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            } else {
                const created = await subjectService.create(payload);
                setSubjects((prev) => [...prev, created]);
                openSubjectDetail(created);
            }
            setSubjectModalOpen(false);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setModalSubmitting(false);
        }
    };

    const openCreateTopicModal = () => {
        setEditingTopic(null);
        setTopicName('');
        setTopicDescription('');
        setTopicStatus('not_started');
        setTopicConfidence(3);
        setTopicModalOpen(true);
    };

    const openEditTopicModal = (topic: Topic) => {
        setEditingTopic(topic);
        setTopicName(topic.name);
        setTopicDescription(topic.description ?? '');
        setTopicStatus(topic.status);
        setTopicConfidence(topic.confidence ?? 3);
        setTopicModalOpen(true);
    };

    const handleDeleteTopic = async (topic: Topic) => {
        if (!window.confirm(`Delete topic "${topic.name}"?`)) return;
        try {
            await topicService.delete(topic.id);
            setTopics((prev) => prev.filter((t) => t.id !== topic.id));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleUpdateTopicStatus = async (topic: Topic, newStatus: TopicStatus) => {
        try {
            const updated = await topicService.patch(topic.id, { status: newStatus });
            setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleSubmitTopic = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedSubject || !topicName.trim() || modalSubmitting) return;

        setModalSubmitting(true);
        setError(null);
        try {
            const payload: CreateTopicDTO = {
                name: topicName.trim(),
                subjectId: selectedSubject.id,
                description: topicDescription.trim() || undefined,
                status: topicStatus,
                confidence: topicConfidence,
            };

            if (editingTopic) {
                const updated = await topicService.update(editingTopic.id, payload);
                setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            } else {
                const created = await topicService.create(payload);
                setTopics((prev) => [...prev, created]);
            }
            setTopicModalOpen(false);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setModalSubmitting(false);
        }
    };

    const openCreateAssessmentModal = () => {
        setEditingAssessment(null);
        setAssessmentTitle('');
        setAssessmentDescription('');
        setAssessmentType('exam');
        setAssessmentDueDate(new Date().toISOString().slice(0, 10));
        setAssessmentMaxGrade(100);
        setAssessmentWeightPercent(0);
        setAssessmentGrade('');
        setAssessmentModalOpen(true);
    };

    const openEditAssessmentModal = (a: Assessment) => {
        setEditingAssessment(a);
        setAssessmentTitle(a.title);
        setAssessmentDescription(a.description ?? '');
        setAssessmentType(a.type);
        setAssessmentDueDate(a.dueAt ? a.dueAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
        setAssessmentMaxGrade(a.maxGrade);
        setAssessmentWeightPercent(a.weightPercent);
        setAssessmentGrade(a.grade != null ? String(a.grade) : '');
        setAssessmentModalOpen(true);
    };

    const handleToggleAssessment = async (a: Assessment) => {
        try {
            const updated = await assessmentService.toggleComplete(a);
            setAssessments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleDeleteAssessment = async (a: Assessment) => {
        if (!window.confirm(`Delete assessment "${a.title}"?`)) return;
        try {
            await assessmentService.delete(a.id);
            setAssessments((prev) => prev.filter((item) => item.id !== a.id));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleSubmitAssessment = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedSubject || !assessmentTitle.trim() || modalSubmitting) return;

        setModalSubmitting(true);
        setError(null);
        try {
            const dueAtString = assessmentDueDate
                ? new Date(`${assessmentDueDate}T23:59:59`).toISOString()
                : null;
            const payload: CreateAssessmentDTO = {
                title: assessmentTitle.trim(),
                description: assessmentDescription.trim() || undefined,
                type: assessmentType,
                dueAt: dueAtString,
                maxGrade: assessmentMaxGrade,
                weightPercent: assessmentWeightPercent,
                grade: assessmentGrade !== '' ? Number(assessmentGrade) : null,
                subjectId: selectedSubject.id,
            };

            if (editingAssessment) {
                const updated = await assessmentService.update(editingAssessment.id, payload);
                setAssessments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            } else {
                const created = await assessmentService.create(payload);
                setAssessments((prev) => [...prev, created]);
            }
            setAssessmentModalOpen(false);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setModalSubmitting(false);
        }
    };

    if (loading && subjects.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent-color)] border-t-transparent" />
                    <p className="text-sm font-medium text-[var(--app-text-muted)]">Loading subjects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {error && (
                <div
                    role="alert"
                    className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-500 shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="cursor-pointer font-bold underline underline-offset-2 hover:no-underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {!selectedSubject ? (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">
                                Subjects
                            </h1>
                            <p className="mt-1 text-xs text-[var(--app-text-muted)] sm:text-sm">
                                Organize courses, track exam milestones, topics, and study hours.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateSubjectModal}
                            className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-color)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Subject</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                        <div className="flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                Total Subjects
                            </span>
                            <span className="mt-1 text-2xl font-bold text-[var(--app-text)]">
                                {totalStats.totalSubjects}
                            </span>
                        </div>
                        <div className="flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                Total Topics
                            </span>
                            <span className="mt-1 text-2xl font-bold text-[var(--app-text)]">
                                {totalStats.totalTopics}
                            </span>
                            <span className="mt-0.5 text-[11px] text-[var(--app-text-muted)]">
                                {totalStats.completedTopics} completed
                            </span>
                        </div>
                        <div className="flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                Study Time
                            </span>
                            <span className="mt-1 text-2xl font-bold text-[var(--app-text)]">
                                {formatMinutes(totalStats.totalMinutes)}
                            </span>
                        </div>
                        <div className="flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                Upcoming Exams
                            </span>
                            <span className="mt-1 text-2xl font-bold text-amber-500">
                                {totalStats.totalExams}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-3 shadow-sm">
                        <div className="relative flex flex-1 min-w-[220px] items-center">
                            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--app-text-muted)]" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search subjects..."
                                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-2 pl-9 pr-3 text-xs text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-colors focus:border-[var(--accent-color)] focus:outline-none sm:text-sm"
                            />
                        </div>

                        {activeTerms.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[var(--app-text-muted)]">Term:</span>
                                <select
                                    value={selectedTermFilter}
                                    onChange={(e) =>
                                        setSelectedTermFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                                    }
                                    className="cursor-pointer rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] transition-colors focus:border-[var(--accent-color)] focus:outline-none"
                                >
                                    <option value="all">All Terms</option>
                                    {activeTerms.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} {t.isCurrent ? '★' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {filteredSubjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--app-border)] p-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-color)]/10 text-3xl">
                                📚
                            </div>
                            <h3 className="text-base font-bold text-[var(--app-text)]">No subjects found</h3>
                            <p className="max-w-sm text-xs text-[var(--app-text-muted)]">
                                {searchTerm
                                    ? `No subjects match "${searchTerm}". Try a different filter.`
                                    : 'Start organizing your semester by adding your first subject.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    type="button"
                                    onClick={openCreateSubjectModal}
                                    className="mt-2 flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-color)] px-5 py-2.5 text-xs font-semibold text-white shadow hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Subject</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredSubjects.map((sub) => {
                                const stats = subjectStatsMap[sub.id] || {
                                    minutes: 0,
                                    sessionCount: 0,
                                    completedTopics: 0,
                                    totalTopics: 0,
                                    upcomingExams: 0,
                                };
                                const term = terms.find((t) => t.id === sub.termId);
                                const progressPct =
                                    stats.totalTopics > 0
                                        ? Math.round((stats.completedTopics / stats.totalTopics) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={sub.id}
                                        onClick={() => openSubjectDetail(sub)}
                                        className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent-color)]/60 hover:shadow-lg"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span
                                                        className="h-4 w-4 shrink-0 rounded-full shadow-sm"
                                                        style={{ backgroundColor: sub.color || '#3b82f6' }}
                                                    />
                                                    <h3 className="truncate text-base font-bold text-[var(--app-text)] group-hover:text-[var(--accent-color)] transition-colors">
                                                        {sub.name}
                                                    </h3>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleToggleFavoriteSubject(sub, e)}
                                                    className="cursor-pointer text-neutral-400 hover:text-amber-400 transition-colors"
                                                    title={sub.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                >
                                                    <Star
                                                        className={`h-4 w-4 ${
                                                            sub.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            {term && (
                                                <span className="mt-2 inline-flex items-center rounded-md bg-neutral-500/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--app-text-muted)]">
                                                    {term.name} {term.isCurrent ? '★' : ''}
                                                </span>
                                            )}

                                            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[var(--app-bg)] p-3 text-xs">
                                                <div>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                                        Topics
                                                    </span>
                                                    <p className="mt-0.5 font-bold text-[var(--app-text)]">
                                                        {stats.totalTopics}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                                        Studied
                                                    </span>
                                                    <p className="mt-0.5 font-bold text-[var(--app-text)]">
                                                        {formatMinutes(stats.minutes)}
                                                    </p>
                                                </div>
                                            </div>

                                            {stats.totalTopics > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-[11px] font-medium text-[var(--app-text-muted)] mb-1">
                                                        <span>Progress</span>
                                                        <span>{progressPct}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-neutral-500/15 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${progressPct}%`,
                                                                backgroundColor: sub.color || '#3b82f6',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {stats.upcomingExams > 0 && (
                                                <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                                    <span>
                                                        {stats.upcomingExams} upcoming exam
                                                        {stats.upcomingExams > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-[var(--app-border)] pt-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => openEditSubjectModal(sub, e)}
                                                    className="cursor-pointer rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-neutral-500/15 hover:text-[var(--app-text)] transition-colors"
                                                    title="Edit subject"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteSubject(sub, e)}
                                                    className="cursor-pointer rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-red-500/15 hover:text-red-500 transition-colors"
                                                    title="Delete subject"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartStudy(sub);
                                                }}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--app-bg)] border border-[var(--app-border)] px-3 py-1 text-xs font-bold text-[var(--app-text)] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] shadow-sm"
                                            >
                                                <Play className="h-3 w-3 fill-current" />
                                                <span>Study</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={backToMaster}
                            className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>All Subjects</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleToggleFavoriteSubject(selectedSubject)}
                                className="cursor-pointer rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-2 text-neutral-400 hover:text-amber-400 transition-colors"
                                title={selectedSubject.isFavorite ? 'Remove favorite' : 'Add favorite'}
                            >
                                <Star
                                    className={`h-4 w-4 ${
                                        selectedSubject.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                                    }`}
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() => openEditSubjectModal(selectedSubject)}
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:border-[var(--accent-color)] transition-colors"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteSubject(selectedSubject)}
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-bg)] px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStartStudy(selectedSubject)}
                                className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity"
                            >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>Start Session</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className="h-6 w-6 shrink-0 rounded-full shadow-md"
                                    style={{ backgroundColor: selectedSubject.color || '#3b82f6' }}
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--app-text)] sm:text-3xl">
                                        {selectedSubject.name}
                                    </h1>
                                    {selectedSubject.notes && (
                                        <p className="mt-1 text-xs text-[var(--app-text-muted)] max-w-xl">
                                            {selectedSubject.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {selectedSubject.termId && (
                                <span className="inline-flex items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)]">
                                    Term: {terms.find((t) => t.id === selectedSubject.termId)?.name ?? 'General'}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 pt-3 border-t border-[var(--app-border)]">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                    Total Studied
                                </span>
                                <span className="mt-0.5 text-xl font-bold text-[var(--app-text)]">
                                    {formatMinutes(subjectStatsMap[selectedSubject.id]?.minutes || 0)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                    Study Sessions
                                </span>
                                <span className="mt-0.5 text-xl font-bold text-[var(--app-text)]">
                                    {subjectSessions.length}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                    Topics Done
                                </span>
                                <span className="mt-0.5 text-xl font-bold text-[var(--app-text)]">
                                    {subjectStatsMap[selectedSubject.id]?.completedTopics || 0} /{' '}
                                    {subjectTopics.length}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                    Upcoming Exams
                                </span>
                                <span className="mt-0.5 text-xl font-bold text-amber-500">
                                    {subjectAssessments.filter((a) => !a.completed && (a.type === 'exam' || a.type === 'midterm' || a.type === 'final_exam')).length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex border-b border-[var(--app-border)]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('topics')}
                            className={`flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                                activeTab === 'topics'
                                    ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                                    : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                            }`}
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Topics ({subjectTopics.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('assessments')}
                            className={`flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                                activeTab === 'assessments'
                                    ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                                    : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                            }`}
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span>Assessments ({subjectAssessments.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('sessions')}
                            className={`flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                                activeTab === 'sessions'
                                    ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                                    : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                            }`}
                        >
                            <Clock className="h-4 w-4" />
                            <span>Recent Sessions ({subjectSessions.length})</span>
                        </button>
                    </div>

                    {activeTab === 'topics' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-[var(--app-text)]">Topics in this Subject</h3>
                                <button
                                    type="button"
                                    onClick={openCreateTopicModal}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>New Topic</span>
                                </button>
                            </div>

                            {subjectTopics.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--app-border)] p-10 text-center">
                                    <FolderKanban className="h-10 w-10 text-[var(--app-text-muted)]" />
                                    <p className="text-sm font-semibold text-[var(--app-text)]">No topics yet</p>
                                    <p className="text-xs text-[var(--app-text-muted)]">
                                        Add topics to break down this subject into study units.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openCreateTopicModal}
                                        className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Add First Topic</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {subjectTopics.map((topic) => {
                                        const topicSessions = sessions.filter((s) => s.topicId === topic.id);
                                        const topicMins = topicSessions.reduce(
                                            (acc, curr) => acc + (curr.totalMinutes || 0),
                                            0
                                        );

                                        return (
                                            <div
                                                key={topic.id}
                                                className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] p-4 shadow-sm hover:border-[var(--accent-color)]/50 transition-colors"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-bold text-sm text-[var(--app-text)]">
                                                            {topic.name}
                                                        </h4>
                                                        <select
                                                            value={topic.status}
                                                            onChange={(e) =>
                                                                handleUpdateTopicStatus(
                                                                    topic,
                                                                    e.target.value as TopicStatus
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--app-text)]"
                                                        >
                                                            <option value="not_started">Not Started</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="reviewing">Reviewing</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="mastered">Mastered</option>
                                                            <option value="skipped">Skipped</option>
                                                        </select>
                                                    </div>

                                                    {topic.description && (
                                                        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                                            {topic.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                                                        <div className="flex items-center gap-1">
                                                            <span>Confidence:</span>
                                                            <span className="font-semibold text-amber-500">
                                                                {'★'.repeat(topic.confidence || 3)}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-[var(--app-text)]">
                                                            {formatMinutes(topicMins)} ({topicSessions.length} sessions)
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between border-t border-[var(--app-border)] pt-2.5">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditTopicModal(topic)}
                                                            className="cursor-pointer rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-neutral-500/15 hover:text-[var(--app-text)]"
                                                            title="Edit topic"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteTopic(topic)}
                                                            className="cursor-pointer rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-red-500/15 hover:text-red-500"
                                                            title="Delete topic"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartStudy(selectedSubject, topic)}
                                                        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--accent-color)]/10 px-3 py-1 text-xs font-bold text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-colors"
                                                    >
                                                        <Play className="h-3 w-3 fill-current" />
                                                        <span>Study Topic</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assessments' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-[var(--app-text)]">
                                    Assessments for {selectedSubject.name}
                                </h3>
                                <button
                                    type="button"
                                    onClick={openCreateAssessmentModal}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>New Assessment</span>
                                </button>
                            </div>

                            {subjectAssessments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--app-border)] p-10 text-center">
                                    <GraduationCap className="h-10 w-10 text-[var(--app-text-muted)]" />
                                    <p className="text-sm font-semibold text-[var(--app-text)]">No assessments yet</p>
                                    <p className="text-xs text-[var(--app-text-muted)]">
                                        Track exams, quizzes, projects, and assignments with grades and weights.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openCreateAssessmentModal}
                                        className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Add Assessment</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {subjectAssessments.map((a) => {
                                        const remaining = a.dueAt ? getDaysRemaining(a.dueAt) : null;
                                        const isExamType = a.type === 'exam' || a.type === 'midterm' || a.type === 'final_exam';
                                        const scoreDisplay = a.grade != null ? `${a.grade} / ${a.maxGrade}` : `— / ${a.maxGrade}`;

                                        return (
                                            <div
                                                key={a.id}
                                                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
                                                    a.completed
                                                        ? 'border-[var(--app-border)] bg-[var(--app-bg)] opacity-70'
                                                        : isExamType
                                                        ? 'border-amber-500/40 bg-[var(--app-card-bg)]'
                                                        : 'border-[var(--app-border)] bg-[var(--app-card-bg)]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAssessment(a)}
                                                        className="cursor-pointer text-[var(--app-text-muted)] hover:text-[var(--accent-color)] transition-colors"
                                                        title={a.completed ? 'Mark as pending' : 'Mark as completed'}
                                                    >
                                                        {a.completed ? (
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                        ) : (
                                                            <div className="h-5 w-5 rounded-full border-2 border-[var(--app-border)] hover:border-[var(--accent-color)]" />
                                                        )}
                                                    </button>

                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span
                                                                className={`font-bold text-sm ${
                                                                    a.completed
                                                                        ? 'line-through text-[var(--app-text-muted)]'
                                                                        : 'text-[var(--app-text)]'
                                                                }`}
                                                            >
                                                                {a.title}
                                                            </span>
                                                            <span
                                                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                    isExamType
                                                                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                                        : 'bg-neutral-500/15 text-[var(--app-text-muted)]'
                                                                }`}
                                                            >
                                                                {a.type.replace('_', ' ')}
                                                            </span>
                                                            {a.weightPercent > 0 && (
                                                                <span className="rounded-md bg-[var(--accent-color)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-color)]">
                                                                    {a.weightPercent}%
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                                                            <span className="flex items-center gap-1">
                                                                <BarChart2 className="h-3 w-3" />
                                                                <span className="font-semibold">{scoreDisplay}</span>
                                                            </span>
                                                            {a.description && (
                                                                <span className="truncate max-w-xs">{a.description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {a.dueAt && (
                                                        <div className="text-right">
                                                            <p className="text-xs font-semibold text-[var(--app-text)]">
                                                                {formatDateDisplay(a.dueAt)}
                                                            </p>
                                                            {!a.completed && remaining && remaining.label && (
                                                                <p
                                                                    className={`text-[11px] font-bold ${
                                                                        remaining.isToday
                                                                            ? 'text-red-500 animate-pulse'
                                                                            : remaining.isPast
                                                                            ? 'text-red-400'
                                                                            : 'text-[var(--app-text-muted)]'
                                                                    }`}
                                                                >
                                                                    {remaining.label}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditAssessmentModal(a)}
                                                        className="cursor-pointer rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-neutral-500/15 hover:text-[var(--app-text)]"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAssessment(a)}
                                                        className="cursor-pointer rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-red-500/15 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-base font-bold text-[var(--app-text)]">
                                Study Sessions History for {selectedSubject.name}
                            </h3>

                            {subjectSessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--app-border)] p-10 text-center">
                                    <Clock className="h-10 w-10 text-[var(--app-text-muted)]" />
                                    <p className="text-sm font-semibold text-[var(--app-text)]">No study sessions recorded</p>
                                    <p className="text-xs text-[var(--app-text-muted)]">
                                        Use the Timer to log sessions for this subject's topics.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleStartStudy(selectedSubject)}
                                        className="mt-2 flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-color)] px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        <Play className="h-3 w-3 fill-current" />
                                        <span>Start First Session</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-sm">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Topic</th>
                                                <th className="px-4 py-3">Duration</th>
                                                <th className="px-4 py-3">Rating</th>
                                                <th className="px-4 py-3">Title / Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--app-border)]">
                                            {subjectSessions.map((s) => {
                                                const topic = topics.find((t) => t.id === s.topicId);
                                                return (
                                                    <tr key={s.id} className="hover:bg-neutral-500/5 transition-colors">
                                                        <td className="whitespace-nowrap px-4 py-3 font-medium text-[var(--app-text)]">
                                                            {formatDateDisplay(s.startedAt)}
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-[var(--app-text)]">
                                                            {topic?.name ?? 'General'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 font-bold text-[var(--accent-color)]">
                                                            {formatMinutes(s.totalMinutes)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-amber-500 font-semibold">
                                                            {s.focusRating ? '★'.repeat(s.focusRating) : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-[var(--app-text-muted)] max-w-xs truncate">
                                                            {s.title || s.description || '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {subjectModalOpen && (
                <Modal
                    title={editingSubject ? 'Edit Subject' : 'Create Subject'}
                    onClose={() => setSubjectModalOpen(false)}
                    size="lg"
                >
                    <form onSubmit={handleSubmitSubject} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Subject Name *
                            </label>
                            <input
                                autoFocus
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                placeholder="e.g. Artificial Intelligence, Microeconomics"
                                maxLength={60}
                                required
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1.5">
                                Color
                            </label>
                            <div className="flex flex-wrap items-center gap-2.5">
                                {PALETTE.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSubjectColor(c)}
                                        className={`h-7 w-7 rounded-full cursor-pointer transition-transform ${
                                            subjectColor === c ? 'scale-115 ring-2 ring-[var(--accent-color)] ring-offset-2' : ''
                                        }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={subjectColor}
                                    onChange={(e) => setSubjectColor(e.target.value)}
                                    className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Academic Term
                            </label>
                            <select
                                value={subjectTermId}
                                onChange={(e) =>
                                    setSubjectTermId(e.target.value !== '' ? Number(e.target.value) : '')
                                }
                                className={fieldClass}
                            >
                                <option value="">Auto-select (Current Term)</option>
                                {activeTerms.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} {t.isCurrent ? '★ Current' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Notes / Description (Optional)
                            </label>
                            <textarea
                                value={subjectNotes}
                                onChange={(e) => setSubjectNotes(e.target.value)}
                                placeholder="Professor name, room, course link, goals..."
                                rows={3}
                                className={fieldClass}
                            />
                        </div>

                        <div className="mt-4 flex justify-end gap-2 border-t border-[var(--app-border)] pt-4">
                            <button
                                type="button"
                                onClick={() => setSubjectModalOpen(false)}
                                className={ghostButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={modalSubmitting || !subjectName.trim()}
                                className={primaryButton}
                            >
                                {modalSubmitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {topicModalOpen && (
                <Modal
                    title={editingTopic ? 'Edit Topic' : 'Add Topic'}
                    onClose={() => setTopicModalOpen(false)}
                    size="md"
                >
                    <form onSubmit={handleSubmitTopic} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Topic Name *
                            </label>
                            <input
                                autoFocus
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                placeholder="e.g. Chapter 3: Dynamic Programming"
                                maxLength={80}
                                required
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={topicDescription}
                                onChange={(e) => setTopicDescription(e.target.value)}
                                placeholder="Key concepts, page numbers, formulas..."
                                rows={2}
                                className={fieldClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Status
                                </label>
                                <select
                                    value={topicStatus}
                                    onChange={(e) => setTopicStatus(e.target.value as TopicStatus)}
                                    className={fieldClass}
                                >
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="completed">Completed</option>
                                    <option value="mastered">Mastered</option>
                                    <option value="skipped">Skipped</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Confidence (1 - 5)
                                </label>
                                <select
                                    value={topicConfidence}
                                    onChange={(e) => setTopicConfidence(Number(e.target.value))}
                                    className={fieldClass}
                                >
                                    <option value={1}>★ Low (1)</option>
                                    <option value={2}>★★ Medium-Low (2)</option>
                                    <option value={3}>★★★ Medium (3)</option>
                                    <option value={4}>★★★★ Good (4)</option>
                                    <option value={5}>★★★★★ Mastered (5)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2 border-t border-[var(--app-border)] pt-4">
                            <button
                                type="button"
                                onClick={() => setTopicModalOpen(false)}
                                className={ghostButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={modalSubmitting || !topicName.trim()}
                                className={primaryButton}
                            >
                                {modalSubmitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {assessmentModalOpen && (
                <Modal
                    title={editingAssessment ? 'Edit Assessment' : 'Add Assessment'}
                    onClose={() => setAssessmentModalOpen(false)}
                    size="lg"
                >
                    <form onSubmit={handleSubmitAssessment} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Title *
                            </label>
                            <input
                                autoFocus
                                value={assessmentTitle}
                                onChange={(e) => setAssessmentTitle(e.target.value)}
                                placeholder="e.g. Midterm Exam, Final Project, Weekly Quiz"
                                maxLength={80}
                                required
                                className={fieldClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Type
                                </label>
                                <select
                                    value={assessmentType}
                                    onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                                    className={fieldClass}
                                >
                                    {ASSESSMENT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={assessmentDueDate}
                                    onChange={(e) => setAssessmentDueDate(e.target.value)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Max Grade *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    step="any"
                                    value={assessmentMaxGrade}
                                    onChange={(e) => setAssessmentMaxGrade(Number(e.target.value))}
                                    required
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Weight (%)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="any"
                                    value={assessmentWeightPercent}
                                    onChange={(e) => setAssessmentWeightPercent(Number(e.target.value))}
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                    Grade (Optional)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={assessmentGrade}
                                    onChange={(e) => setAssessmentGrade(e.target.value)}
                                    placeholder="—"
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">
                                Notes / Description
                            </label>
                            <textarea
                                value={assessmentDescription}
                                onChange={(e) => setAssessmentDescription(e.target.value)}
                                placeholder="Exam topics, submission link, grading rubric..."
                                rows={2}
                                className={fieldClass}
                            />
                        </div>

                        <div className="mt-4 flex justify-end gap-2 border-t border-[var(--app-border)] pt-4">
                            <button
                                type="button"
                                onClick={() => setAssessmentModalOpen(false)}
                                className={ghostButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={modalSubmitting || !assessmentTitle.trim()}
                                className={primaryButton}
                            >
                                {modalSubmitting ? 'Saving...' : editingAssessment ? 'Update Assessment' : 'Add Assessment'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default SubjectsPage;
