import { assessmentService } from './assessment-service';
import { deadlineService } from './deadline-service';
import { scheduledSessionService } from './scheduled-session-service';
import { sessionService } from './session-service';
import { subjectService } from './subject-service';
import { termService } from './term-service';
import { todoService } from './todo-service';
import { topicService } from './topic-service';
import type { CreateAssessmentDTO } from '../types/assessment';
import type { CreateDeadlineDTO } from '../types/deadline';
import type { CreateScheduledSessionDTO } from '../types/scheduled-session';
import type { CreateSessionDTO } from '../types/session';
import type { CreateSubjectDTO } from '../types/subject';
import type { CreateTodoDTO } from '../types/todo-item';
import type { CreateTopicDTO, TopicStatus } from '../types/topic';

const subjectPlans = [
    { name: 'Data Structures', color: '#4f8cff', notes: 'Algorithms, complexity, and implementation practice.', topics: ['Arrays and linked lists', 'Stacks and queues', 'Trees and traversals', 'Hash tables', 'Graph algorithms'] },
    { name: 'Cognitive Psychology', color: '#a879d8', notes: 'Memory, attention, and the science of learning.', topics: ['Working memory', 'Attention and perception', 'Long-term memory', 'Learning theories', 'Decision making'] },
    { name: 'Linear Algebra', color: '#37a890', notes: 'Vectors, transformations, and mathematical foundations.', topics: ['Vector spaces', 'Matrix operations', 'Linear transformations', 'Eigenvalues and eigenvectors', 'Orthogonality'] },
    { name: 'Database Systems', color: '#e3a33a', notes: 'Relational design, SQL, and transaction processing.', topics: ['Relational model', 'SQL joins and aggregation', 'Normalization', 'Transactions and ACID', 'Indexing'] },
    { name: 'Academic Writing', color: '#df7185', notes: 'Research, argument structure, and clear academic prose.', topics: ['Research questions', 'Source evaluation', 'Thesis development', 'Citation practice', 'Revision and editing'] },
] as const;

const topicStates: TopicStatus[] = ['completed', 'in_progress', 'mastered', 'reviewing', 'not_started'];
const sessionTitles = ['Problem set review', 'Lecture notes', 'Practice questions', 'Reading and annotation', 'Concept review', 'Independent study'];
const todoTexts = ['Review lecture notes', 'Finish practice problems', 'Summarize key concepts', 'Prepare questions for class', 'Revise study outline', 'Read assigned chapter', 'Check assessment feedback', 'Organize reference notes', 'Complete weekly review', 'Draft project outline', 'Practice retrieval questions', 'Update topic notes'];
const offsetDate = (days: number, hour = 0, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date;
};
const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export interface DemoSeedResult {
    created: number;
}

export async function seedStudyData(): Promise<DemoSeedResult> {
    const names = subjectPlans.map((subject) => subject.name.toLocaleLowerCase());
    const [existingSubjects, terms] = await Promise.all([subjectService.getAll(), termService.getActive()]);
    const collisions = existingSubjects.filter((subject) => names.includes(subject.name.trim().toLocaleLowerCase()));
    if (collisions.length) {
        throw new Error(`No data was created. Existing subjects were found: ${collisions.map((subject) => subject.name).join(', ')}.`);
    }
    const term = terms.find((item) => item.isCurrent) ?? terms[0];
    if (!term) throw new Error('No active academic term is available. Create or activate a term before generating study data.');

    let created = 0;
    try {
    const subjects = [];
    for (const plan of subjectPlans) {
        const dto: CreateSubjectDTO = { name: plan.name, color: plan.color, notes: plan.notes, termId: term.id };
        subjects.push(await subjectService.create(dto));
        created += 1;
    }

    const topicsBySubject: number[][] = [];
    for (let subjectIndex = 0; subjectIndex < subjectPlans.length; subjectIndex += 1) {
        const subject = subjects[subjectIndex];
        const topicIds: number[] = [];
        for (let topicIndex = 0; topicIndex < subjectPlans[subjectIndex].topics.length; topicIndex += 1) {
            const dto: CreateTopicDTO = {
                name: subjectPlans[subjectIndex].topics[topicIndex],
                subjectId: subject.id,
                description: `Core concepts and practice for ${subjectPlans[subjectIndex].topics[topicIndex].toLowerCase()}.`,
                status: topicStates[(topicIndex + subjectIndex) % topicStates.length],
                confidence: [4, 3, 5, 2, 1][(topicIndex + subjectIndex) % topicStates.length],
                sortOrder: topicIndex,
            };
            const topic = await topicService.create(dto);
            topicIds.push(topic.id);
            created += 1;
        }
        topicsBySubject.push(topicIds);
    }

    for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
        for (let assessmentIndex = 0; assessmentIndex < 2; assessmentIndex += 1) {
            const daysAgo = 30 - subjectIndex * 2 - assessmentIndex * 12;
            const dto: CreateAssessmentDTO & { isCompleted: boolean } = {
                subjectId: subjects[subjectIndex].id,
                type: assessmentIndex === 0 ? 'quiz' : 'assignment',
                title: assessmentIndex === 0 ? 'Unit review quiz' : 'Applied concepts assignment',
                description: 'A recorded assessment with feedback for the current study term.',
                grade: assessmentIndex === 0 ? 7.5 + (subjectIndex % 3) * 0.5 : 8 + (subjectIndex % 2) * 0.75,
                maxGrade: 10,
                weightPercent: 15,
                dueAt: offsetDate(-daysAgo, 12).toISOString(),
                isCompleted: true,
            };
            await assessmentService.create(dto);
            created += 1;
        }
    }

    for (let index = 0; index < 22; index += 1) {
        const daysAgo = 2 + Math.floor(index * 40 / 21);
        const start = offsetDate(-daysAgo, 9 + (index % 7), index % 2 ? 30 : 0);
        const minutes = 35 + (index * 13 % 56);
        const end = new Date(start.getTime() + minutes * 60_000);
        const dto: CreateSessionDTO = {
            title: sessionTitles[index % sessionTitles.length],
            description: 'Focused study block with a short written recap.',
            totalMinutes: minutes,
            startedAt: start.toISOString(),
            endedAt: end.toISOString(),
            topicId: topicsBySubject[index % subjects.length][(index * 2) % 5],
            focusRating: 3 + (index % 3),
            pausedMinutes: index % 4 === 0 ? 5 : 0,
        };
        await sessionService.create(dto);
        created += 1;
    }

    for (let index = 0; index < todoTexts.length; index += 1) {
        const subjectIndex = index % subjects.length;
        const days = index < 8 ? index - 6 : index - 5;
        const dto: CreateTodoDTO = {
            date: localDateKey(offsetDate(days)),
            text: todoTexts[index],
            subjectId: subjects[subjectIndex].id,
            topicId: topicsBySubject[subjectIndex][index % 5],
        };
        await todoService.create(dto);
        created += 1;
    }

    const deadlinePlans: Array<Pick<CreateDeadlineDTO, 'title' | 'type' | 'urgency'>> = [
        { title: 'Research summary submission', type: 'submission', urgency: 'high' },
        { title: 'Midterm examination', type: 'exam', urgency: 'critical' },
        { title: 'Database design project', type: 'project', urgency: 'high' },
        { title: 'Weekly problem set', type: 'assignment', urgency: 'medium' },
        { title: 'Seminar presentation', type: 'presentation', urgency: 'medium' },
    ];
    for (let index = 0; index < deadlinePlans.length; index += 1) {
        const subjectIndex = index % subjects.length;
        const deadline: CreateDeadlineDTO = {
            ...deadlinePlans[index],
            description: 'Prepare materials in advance and leave time for a final review.',
            dueAt: offsetDate([3, 7, 10, 14, 18][index], 23, 59).toISOString(),
            allDay: false,
            subjectId: subjects[subjectIndex].id,
            topicId: topicsBySubject[subjectIndex][(index + 1) % 5],
        };
        await deadlineService.create(deadline);
        created += 1;
    }

    for (let index = 0; index < 10; index += 1) {
        const subjectIndex = index % subjects.length;
        const dayOffset = 1 + Math.floor(index / 5) * 7 + (index % 5);
        const started = offsetDate(dayOffset, 9 + (index % 5), 0);
        const ended = new Date(started.getTime() + (index % 2 ? 60 : 45) * 60_000);
        const dto: CreateScheduledSessionDTO = {
            title: sessionTitles[(index + 2) % sessionTitles.length],
            topicId: topicsBySubject[subjectIndex][(index + 3) % 5],
            startedAt: started.toISOString(),
            endedAt: ended.toISOString(),
        };
        await scheduledSessionService.create(dto);
        created += 1;
    }

    return { created };
    } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown API error';
        throw new Error(`Study data generation stopped after creating ${created} records. Some records may already have been saved. ${reason}`);
    }
}
