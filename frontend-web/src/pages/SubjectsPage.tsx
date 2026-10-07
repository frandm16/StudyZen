import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, BookOpen, AlertCircle } from 'lucide-react';
import { useTimerContext } from '../context/TimerContext';
import { getApiErrorMessage } from '../services/api';
import { subjectService } from '../services/subject-service';
import { topicService } from '../services/topic-service';
import { assessmentService } from '../services/assessment-service';
import { sessionService } from '../services/session-service';
import { termService } from '../services/term-service';
import type { Subject, CreateSubjectDTO } from '../types/subject';
import type { Topic, CreateTopicDTO, TopicStatus } from '../types/topic';
import type { Assessment, CreateAssessmentDTO, UpdateAssessmentDTO } from '../types/assessment';
import type { Session } from '../types/session';
import type { AcademicTerm } from '../types/academic-term';

import { TermFilterBar } from '../components/subjects/TermFilterBar';
import { SubjectStatsBanner } from '../components/subjects/SubjectStatsBanner';
import { SubjectCard } from '../components/subjects/SubjectCard';
import { calculateGradeSummary } from '../components/subjects/helpers';
import { SubjectDetailHeader } from '../components/subjects/SubjectDetailHeader';
import { SubjectTopicsTab } from '../components/subjects/SubjectTopicsTab';
import { SubjectEvaluationsTab } from '../components/subjects/SubjectEvaluationsTab';
import { SubjectSessionsTab } from '../components/subjects/SubjectSessionsTab';
import { SubjectModal } from '../components/subjects/modals/SubjectModal';
import { TopicModal } from '../components/subjects/modals/TopicModal';
import { EvaluationModal } from '../components/subjects/modals/EvaluationModal';
import { TermModal } from '../components/subjects/modals/TermModal';

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
    const [activeTab, setActiveTab] = useState<'topics' | 'evaluations' | 'sessions'>('topics');

    const [subjectModalOpen, setSubjectModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const [topicModalOpen, setTopicModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

    const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [editingEvaluation, setEditingEvaluation] = useState<Assessment | null>(null);

    const [termModalOpen, setTermModalOpen] = useState(false);

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
        void loadData();
    }, [loadData]);

    const activeTerms = useMemo(() => terms.filter((t) => !t.isArchived), [terms]);

    const termMap = useMemo(() => {
        return new Map(terms.map((t) => [t.id, t]));
    }, [terms]);

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
        const stats: Record<number, { minutes: number; completedTopics: number; totalTopics: number; upcomingEvaluations: number; gradeOn100: number | null }> = {};
        for (const s of subjects) {
            const subTopics = topics.filter((t) => t.subjectId === s.id);
            const topicIds = new Set(subTopics.map((t) => t.id));
            const subSessions = sessions.filter((sess) => topicIds.has(sess.topicId));
            const totalMinutes = subSessions.reduce((acc, curr) => acc + (curr.totalMinutes || 0), 0);
            const completedCount = subTopics.filter((t) => t.status === 'completed' || t.status === 'mastered').length;
            const subAssessments = assessments.filter((a) => a.subjectId === s.id);
            const upcomingCount = subAssessments.filter((a) => !a.completed).length;
            const gradeSummary = calculateGradeSummary(subAssessments);

            stats[s.id] = {
                minutes: totalMinutes,
                completedTopics: completedCount,
                totalTopics: subTopics.length,
                upcomingEvaluations: upcomingCount,
                gradeOn100: gradeSummary.weightedAverage,
            };
        }
        return stats;
    }, [subjects, topics, sessions, assessments]);

    const totalStats = useMemo(() => {
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
        const upcomingEvaluations = assessments.filter((a) => !a.completed).length;
        const totalCompletedTopics = topics.filter((t) => t.status === 'completed' || t.status === 'mastered').length;
        return {
            totalSubjects: subjects.filter((s) => !s.isArchived).length,
            totalTopics: topics.length,
            completedTopics: totalCompletedTopics,
            totalMinutes,
            upcomingEvaluations,
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
            .filter((sess) => topicIds.has(sess.topicId))
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }, [sessions, selectedSubject, subjectTopics]);

    const handleSelectSubject = (id: number) => {
        setSearchParams({ id: String(id) });
    };

    const handleBackToList = () => {
        setSearchParams({});
    };

    const handleToggleFavoriteSubject = async (subjectId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const updated = await subjectService.toggleFavorite(subjectId);
            setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleDeleteSubject = async (subjectId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const subjectToDelete = subjects.find((s) => s.id === subjectId);
        if (!window.confirm(`Are you sure you want to delete "${subjectToDelete?.name}"?`)) {
            return;
        }
        try {
            await subjectService.delete(subjectId);
            setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
            if (selectedSubjectId === subjectId) {
                setSearchParams({});
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleSaveSubject = async (dto: CreateSubjectDTO) => {
        if (editingSubject) {
            const updated = await subjectService.update(editingSubject.id, dto);
            setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        } else {
            const created = await subjectService.create(dto);
            setSubjects((prev) => [...prev, created]);
            setSearchParams({ id: String(created.id) });
        }
    };

    const handleSaveTopic = async (dto: CreateTopicDTO) => {
        if (editingTopic) {
            const updated = await topicService.update(editingTopic.id, dto);
            setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        } else {
            const created = await topicService.create(dto);
            setTopics((prev) => [...prev, created]);
        }
    };

    const handleUpdateTopicStatus = async (topicId: number, status: TopicStatus) => {
        try {
            const updated = await topicService.update(topicId, { status });
            setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleDeleteTopic = async (topicId: number) => {
        if (!window.confirm('Delete this topic?')) return;
        try {
            await topicService.delete(topicId);
            setTopics((prev) => prev.filter((t) => t.id !== topicId));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleStudyTopic = (topic: Topic) => {
        if (!selectedSubject) return;
        timer.setSelectedTagId(selectedSubject.id);
        timer.setSelectedTaskId(topic.id);
        navigate('/timer');
    };

    const handleSaveEvaluation = async (dto: CreateAssessmentDTO | UpdateAssessmentDTO) => {
        if (editingEvaluation) {
            const updated = await assessmentService.update(editingEvaluation.id, dto);
            setAssessments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        } else {
            const created = await assessmentService.create(dto as CreateAssessmentDTO);
            setAssessments((prev) => [...prev, created]);
        }
    };

    const handleToggleEvaluationComplete = async (evaluation: Assessment) => {
        try {
            const updated = await assessmentService.toggleComplete(evaluation);
            setAssessments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleDeleteEvaluation = async (evaluationId: number) => {
        if (!window.confirm('Delete this evaluation?')) return;
        try {
            await assessmentService.delete(evaluationId);
            setAssessments((prev) => prev.filter((a) => a.id !== evaluationId));
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    const handleTermCreated = (newTerm: AcademicTerm) => {
        setTerms((prev) => [...prev, newTerm]);
        setSelectedTermFilter(newTerm.id);
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-color)] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
            {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400 shadow-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-300 font-bold"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {selectedSubject ? (
                <div className="space-y-6">
                    <SubjectDetailHeader
                        subject={selectedSubject}
                        term={selectedSubject.termId ? termMap.get(selectedSubject.termId) : undefined}
                        activeTab={activeTab}
                        topicsCount={subjectTopics.length}
                        evaluationsCount={subjectAssessments.length}
                        sessionsCount={subjectSessions.length}
                        onBack={handleBackToList}
                        onTabChange={setActiveTab}
                        onToggleFavorite={() => handleToggleFavoriteSubject(selectedSubject.id)}
                        onEdit={() => {
                            setEditingSubject(selectedSubject);
                            setSubjectModalOpen(true);
                        }}
                        onDelete={() => handleDeleteSubject(selectedSubject.id)}
                    />

                    {activeTab === 'topics' && (
                        <SubjectTopicsTab
                            subject={selectedSubject}
                            topics={subjectTopics}
                            onOpenCreateTopic={() => {
                                setEditingTopic(null);
                                setTopicModalOpen(true);
                            }}
                            onEditTopic={(t) => {
                                setEditingTopic(t);
                                setTopicModalOpen(true);
                            }}
                            onDeleteTopic={handleDeleteTopic}
                            onUpdateStatus={handleUpdateTopicStatus}
                            onStudyTopic={handleStudyTopic}
                        />
                    )}

                    {activeTab === 'evaluations' && (
                        <SubjectEvaluationsTab
                            subject={selectedSubject}
                            evaluations={subjectAssessments}
                            onOpenCreateEvaluation={() => {
                                setEditingEvaluation(null);
                                setEvaluationModalOpen(true);
                            }}
                            onEditEvaluation={(e) => {
                                setEditingEvaluation(e);
                                setEvaluationModalOpen(true);
                            }}
                            onDeleteEvaluation={handleDeleteEvaluation}
                            onToggleComplete={handleToggleEvaluationComplete}
                        />
                    )}

                    {activeTab === 'sessions' && (
                        <SubjectSessionsTab
                            subject={selectedSubject}
                            sessions={subjectSessions}
                            topics={subjectTopics}
                            onStartSession={() => {
                                timer.setSelectedTagId(selectedSubject.id);
                                if (subjectTopics[0]) timer.setSelectedTaskId(subjectTopics[0].id);
                                navigate('/timer');
                            }}
                        />
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)]">
                                Academic Subjects
                            </h1>
                            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                Organize courses, track topic progress, and manage evaluation grades.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingSubject(null);
                                setSubjectModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 shadow-lg shadow-[var(--accent-color)]/25 transition-all cursor-pointer shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Subject</span>
                        </button>
                    </div>

                    <SubjectStatsBanner
                        totalSubjects={totalStats.totalSubjects}
                        completedTopics={totalStats.completedTopics}
                        totalTopics={totalStats.totalTopics}
                        totalMinutes={totalStats.totalMinutes}
                        upcomingEvaluations={totalStats.upcomingEvaluations}
                    />

                    <TermFilterBar
                        terms={activeTerms}
                        selectedTerm={selectedTermFilter}
                        onSelectTerm={setSelectedTermFilter}
                        onOpenCreateTerm={() => setTermModalOpen(true)}
                    />

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--app-text-muted)]" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search subjects by name or notes..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] text-xs text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:border-[var(--accent-color)] shadow-sm"
                        />
                    </div>

                    {filteredSubjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--app-border)] bg-[var(--app-card-bg)]/40 p-12 text-center">
                            <div className="p-3 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] mb-3">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-[var(--app-text)]">No subjects found</h3>
                            <p className="mt-1 text-xs text-[var(--app-text-muted)] max-w-sm">
                                {searchTerm || selectedTermFilter !== 'all'
                                    ? 'No subjects match your search or term filter.'
                                    : 'Create your first course to begin tracking topics, evaluations, and study time.'}
                            </p>
                            {!searchTerm && selectedTermFilter === 'all' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingSubject(null);
                                        setSubjectModalOpen(true);
                                    }}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent-color)] hover:brightness-110 shadow-sm cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Subject</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSubjects.map((subject) => {
                                const stats = subjectStatsMap[subject.id] || {
                                    minutes: 0,
                                    completedTopics: 0,
                                    totalTopics: 0,
                                    upcomingEvaluations: 0,
                                    gradeOn100: null,
                                };
                                return (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        term={subject.termId ? termMap.get(subject.termId) : undefined}
                                        stats={stats}
                                        gradeOn100={stats.gradeOn100}
                                        onSelect={handleSelectSubject}
                                        onToggleFavorite={handleToggleFavoriteSubject}
                                        onEdit={(s, e) => {
                                            e.stopPropagation();
                                            setEditingSubject(s);
                                            setSubjectModalOpen(true);
                                        }}
                                        onDelete={handleDeleteSubject}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <SubjectModal
                isOpen={subjectModalOpen}
                onClose={() => setSubjectModalOpen(false)}
                editingSubject={editingSubject}
                terms={activeTerms}
                onSave={handleSaveSubject}
            />

            {selectedSubject && (
                <>
                    <TopicModal
                        isOpen={topicModalOpen}
                        onClose={() => setTopicModalOpen(false)}
                        editingTopic={editingTopic}
                        subjectId={selectedSubject.id}
                        onSave={handleSaveTopic}
                    />

                    <EvaluationModal
                        isOpen={evaluationModalOpen}
                        onClose={() => setEvaluationModalOpen(false)}
                        editingEvaluation={editingEvaluation}
                        subjectId={selectedSubject.id}
                        existingEvaluations={subjectAssessments}
                        onSave={handleSaveEvaluation}
                    />
                </>
            )}

            <TermModal
                isOpen={termModalOpen}
                onClose={() => setTermModalOpen(false)}
                onCreated={handleTermCreated}
            />
        </div>
    );
}
