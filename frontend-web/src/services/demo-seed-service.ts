import { assessmentService } from './assessment-service';
import { dayNoteService } from './day-note-service';
import { deadlineService } from './deadline-service';
import { scheduledSessionService } from './scheduled-session-service';
import { sessionService } from './session-service';
import { subjectService } from './subject-service';
import { termService } from './term-service';
import { todoService } from './todo-service';
import { topicService } from './topic-service';
import type { CreateAssessmentDTO } from '../types/assessment';
import type { CreateDayNoteDTO } from '../types/day-note';
import type { CreateDeadlineDTO } from '../types/deadline';
import type { CreateScheduledSessionDTO } from '../types/scheduled-session';
import type { CreateSessionDTO } from '../types/session';
import type { CreateSubjectDTO } from '../types/subject';
import type { CreateTodoDTO } from '../types/todo-item';
import type { CreateTopicDTO, TopicStatus } from '../types/topic';

const subjectPlans = [
    { name: 'Data Structures', color: '#4f8cff', notes: 'Algorithms, complexity, and implementation practice.', topics: ['Arrays and linked lists', 'Stacks and queues', 'Trees and traversals', 'Hash tables', 'Graph algorithms', 'Sorting and searching', 'Heaps and priority queues', 'Algorithm complexity'] },
    { name: 'Cognitive Psychology', color: '#a879d8', notes: 'Memory, attention, and the science of learning.', topics: ['Working memory', 'Attention and perception', 'Long-term memory', 'Learning theories', 'Decision making', 'Cognitive biases', 'Language and thought', 'Problem solving'] },
    { name: 'Linear Algebra', color: '#37a890', notes: 'Vectors, transformations, and mathematical foundations.', topics: ['Vector spaces', 'Matrix operations', 'Linear transformations', 'Eigenvalues and eigenvectors', 'Orthogonality', 'Determinants', 'Linear systems', 'Least squares'] },
    { name: 'Database Systems', color: '#e3a33a', notes: 'Relational design, SQL, and transaction processing.', topics: ['Relational model', 'SQL joins and aggregation', 'Normalization', 'Transactions and ACID', 'Indexing', 'Query optimization', 'Concurrency control', 'Database design'] },
    { name: 'Academic Writing', color: '#df7185', notes: 'Research, argument structure, and clear academic prose.', topics: ['Research questions', 'Source evaluation', 'Thesis development', 'Citation practice', 'Revision and editing', 'Literature reviews', 'Paragraph structure', 'Academic style'] },
] as const;

const topicStates: TopicStatus[] = ['completed', 'in_progress', 'mastered', 'reviewing', 'not_started', 'in_progress', 'completed', 'not_started'];
const oldSessionTitles = ['Problem set review', 'Lecture notes', 'Practice questions', 'Reading and annotation', 'Concept review', 'Independent study'];
const todoPlans = [
    { subject: 0, text: 'Review lecture notes' }, { subject: 1, text: 'Finish practice problems' }, { subject: 2, text: 'Summarize key concepts' },
    { subject: 3, text: 'Prepare questions for class' }, { subject: 4, text: 'Revise study outline' }, { subject: 0, text: 'Read assigned chapter' },
    { subject: 1, text: 'Check assessment feedback' }, { subject: 2, text: 'Organize reference notes' }, { subject: 3, text: 'Complete weekly review' },
    { subject: 4, text: 'Draft project outline' }, { subject: 0, text: 'Practice retrieval questions' }, { subject: 1, text: 'Update topic notes' },
    { subject: 2, text: 'Solve the next problem set' }, { subject: 3, text: 'Compare query execution plans' }, { subject: 4, text: 'Verify citations and references' },
    { subject: 0, text: 'Implement a balanced search tree' }, { subject: 1, text: 'Create a memory systems diagram' }, { subject: 2, text: 'Work through eigenvalue examples' },
    { subject: 3, text: 'Normalize the sample schema' }, { subject: 4, text: 'Revise the literature review' }, { subject: 0, text: 'Review graph traversal proofs' },
    { subject: 1, text: 'Prepare spaced-retrieval cards' }, { subject: 2, text: 'Check matrix factorization steps' }, { subject: 3, text: 'Test transaction isolation cases' },
    { subject: 4, text: 'Polish the argument structure' }, { subject: 0, text: 'Benchmark sorting approaches' }, { subject: 1, text: 'Read the attention study' },
    { subject: 2, text: 'Complete the least-squares worksheet' }, { subject: 3, text: 'Document index trade-offs' }, { subject: 4, text: 'Proofread the final draft' },
] as const;
const deadlinePlans: Array<Pick<CreateDeadlineDTO, 'title' | 'type' | 'urgency'> & { subject: number; topic: number }> = [
    { title: 'Research summary submission', type: 'submission', urgency: 'high', subject: 4, topic: 0 },
    { title: 'Midterm examination', type: 'exam', urgency: 'critical', subject: 0, topic: 2 },
    { title: 'Database design project', type: 'project', urgency: 'high', subject: 3, topic: 7 },
    { title: 'Weekly problem set', type: 'assignment', urgency: 'medium', subject: 2, topic: 6 },
    { title: 'Seminar presentation', type: 'presentation', urgency: 'medium', subject: 1, topic: 3 },
    { title: 'Graph algorithms quiz', type: 'quiz', urgency: 'medium', subject: 0, topic: 4 },
    { title: 'Memory and attention lab report', type: 'lab', urgency: 'high', subject: 1, topic: 1 },
    { title: 'Linear systems assignment', type: 'assignment', urgency: 'medium', subject: 2, topic: 6 },
    { title: 'SQL optimization exercise', type: 'assignment', urgency: 'high', subject: 3, topic: 5 },
    { title: 'Literature review draft', type: 'submission', urgency: 'medium', subject: 4, topic: 5 },
    { title: 'Data structures final exam', type: 'exam', urgency: 'critical', subject: 0, topic: 7 },
    { title: 'Cognitive psychology final exam', type: 'exam', urgency: 'critical', subject: 1, topic: 6 },
    { title: 'Linear algebra final exam', type: 'exam', urgency: 'critical', subject: 2, topic: 3 },
    { title: 'Database systems final exam', type: 'exam', urgency: 'critical', subject: 3, topic: 4 },
    { title: 'Academic writing portfolio', type: 'project', urgency: 'high', subject: 4, topic: 7 },
] as const;
const assessmentPlans = [
    { title: 'Unit review quiz', type: 'quiz', weight: 10, grade: 7.5, complete: true, days: -28 },
    { title: 'Applied concepts assignment', type: 'assignment', weight: 15, grade: 8.25, complete: true, days: -18 },
    { title: 'Midterm examination', type: 'exam', weight: 25, grade: 8.5, complete: true, days: -8 },
    { title: 'Practical application report', type: 'project', weight: 25, grade: null, complete: false, days: 8 },
    { title: 'Final review assessment', type: 'quiz', weight: 15, grade: null, complete: false, days: 20 },
] as const;
const notePlans = [
    'Started with the hardest material while my concentration was fresh. The worked examples helped clarify the main idea; revisit the last question tomorrow.',
    'Good progress today. I connected the lecture concepts to the practice set and wrote down two questions to bring to class.',
    'The first pass through the reading was slower than expected, but the summary notes made the key terms easier to compare.',
    'Focused on retrieval practice instead of rereading. I remembered more after taking a short break between topics.',
    'Reviewed feedback from the last assessment and found a recurring mistake. Add one more example to the revision notes.',
    'Split the larger assignment into smaller steps. The outline is ready, and the next session can focus on evidence and details.',
    'A steady study block with fewer distractions. The concept map is becoming clearer, especially the links between the central ideas.',
    'Practiced problems without checking the solution too early. Marked the ones that need another attempt later this week.',
    'Finished the reading notes and checked the definitions against the lecture slides. A quick recap should make this easier to retain.',
    'Worked through the topic from the fundamentals first. The second set of examples felt much more manageable.',
    'Used the study plan to stay on track and left time to review earlier material before moving to the next chapter.',
    'The practice questions exposed a gap in my understanding. I have a clearer plan for what to revisit next.',
    'Made progress on the draft and tightened the main argument. I still need to verify a few sources before the next revision.',
    'Reviewed the week and updated topic confidence. The completed sections feel solid; keep the newer material in rotation.',
    'A productive session combining short notes with practice. The written recap should be useful before the upcoming assessment.',
    'Compared two solution approaches and noted where each one is most useful. Recheck the edge cases next time.',
    'Finished the planned review and prepared a short list of questions for the next class.',
    'Focused on a single topic for the full block. The examples now make more sense, but another retrieval pass will help.',
    'Balanced new material with a quick review of older notes. I am keeping the next study block focused on the pending tasks.',
    'Wrapped up the week with a short reflection: the regular sessions are helping, and the next goal is to begin assignments earlier.',
] as const;
const sessionDescriptions = [
    'Worked through a fresh set of examples and noted the steps that were easy to miss.',
    'Reviewed class notes, then tested recall with short questions before checking the answers.',
    'Focused on the most challenging exercises and wrote a brief summary of the approach.',
    'Read the assigned material and connected the key ideas to the current topic outline.',
    'Practiced explaining the concepts without looking at notes, then checked for gaps.',
    'Compared alternative methods and recorded when each approach is most useful.',
    'Revisited earlier material with spaced practice and updated the revision notes.',
    'Applied the lecture concepts to a longer problem and checked each step carefully.',
    'Organized references and examples for the upcoming assessment.',
    'Finished with a short recap and a list of questions for the next study block.',
] as const;
const pad = (value: number) => String(value).padStart(2, '0');
const offsetDate = (days: number, hour = 0, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date;
};
const localDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export interface DemoSeedResult {
    created: number;
}

const failWithProgress = (error: unknown, created: number): never => {
    const reason = error instanceof Error ? error.message : 'Unknown API error';
    throw new Error(`Study data generation stopped after creating ${created} records. Some records may already have been saved; run it again to add any remaining records. ${reason}`);
};

export async function seedStudyData(): Promise<DemoSeedResult> {
    const [existingSubjects, terms, existingTopics, existingAssessments, existingSessions, existingTodos, existingDeadlines, existingScheduled, existingNotes] = await Promise.all([
        subjectService.getAll(),
        termService.getActive(),
        topicService.getAll(),
        assessmentService.getAll(),
        sessionService.getAll(),
        todoService.getAll(),
        deadlineService.getAll(),
        scheduledSessionService.getAll(),
        dayNoteService.getAll(),
    ]);

    const subjectByName = new Map(existingSubjects.map((subject) => [subject.name.trim().toLocaleLowerCase(), subject]));
    const subjects = [];
    for (const plan of subjectPlans) {
        const existing = subjectByName.get(plan.name.toLocaleLowerCase());
        if (existing && existing.notes !== plan.notes) {
            throw new Error(`No data was created. A subject named ${plan.name} already exists with different notes; it was left untouched.`);
        }
        subjects.push(existing ?? null);
    }

    for (let subjectIndex = 0; subjectIndex < subjectPlans.length; subjectIndex += 1) {
        const existingSubject = subjects[subjectIndex];
        if (!existingSubject) continue;
        const current = existingAssessments.filter((assessment) => assessment.subjectId === existingSubject.id);
        const missingWeight = assessmentPlans
            .filter((plan) => !current.some((assessment) => assessment.title.trim().toLocaleLowerCase() === plan.title.toLocaleLowerCase()))
            .reduce((sum, plan) => sum + plan.weight, 0);
        const totalWeight = current.reduce((sum, assessment) => sum + (assessment.weightPercent || 0), 0) + missingWeight;
        if (totalWeight > 100) {
            throw new Error(`No data was created. Assessments for ${subjectPlans[subjectIndex].name} would exceed the 100% grading weight limit (total: ${totalWeight}%).`);
        }
    }

    let created = 0;
    try {
        const term = terms.find((item) => item.isCurrent) ?? terms[0];
        for (let index = 0; index < subjectPlans.length; index += 1) {
            if (subjects[index]) continue;
            const plan = subjectPlans[index];
            const dto: CreateSubjectDTO = { name: plan.name, color: plan.color, notes: plan.notes, ...(term ? { termId: term.id } : {}) };
            subjects[index] = await subjectService.create(dto);
            created += 1;
        }

        const topicsBySubject: number[][] = [];
        for (let subjectIndex = 0; subjectIndex < subjectPlans.length; subjectIndex += 1) {
            const subject = subjects[subjectIndex]!;
            const topicIds: number[] = [];
            for (let topicIndex = 0; topicIndex < subjectPlans[subjectIndex].topics.length; topicIndex += 1) {
                const name = subjectPlans[subjectIndex].topics[topicIndex];
                const existing = existingTopics.find((topic) => topic.subjectId === subject.id && topic.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
                if (existing) {
                    topicIds.push(existing.id);
                    continue;
                }
                const dto: CreateTopicDTO = {
                    name,
                    subjectId: subject.id,
                    description: `Core concepts and practice for ${name.toLowerCase()}.`,
                    status: topicStates[topicIndex],
                    confidence: [4, 3, 5, 2, 1, 3, 4, 2][topicIndex],
                    sortOrder: topicIndex,
                };
                const topic = await topicService.create(dto);
                existingTopics.push(topic);
                topicIds.push(topic.id);
                created += 1;
            }
            topicsBySubject.push(topicIds);
        }

        const assessmentCreates: Array<{ dto: CreateAssessmentDTO & { isCompleted: boolean }; subjectId: number }> = [];
        for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
            const subject = subjects[subjectIndex]!;
            const current = existingAssessments.filter((assessment) => assessment.subjectId === subject.id);
            for (const plan of assessmentPlans) {
                if (current.some((assessment) => assessment.title.trim().toLocaleLowerCase() === plan.title.toLocaleLowerCase())) continue;
                assessmentCreates.push({
                    subjectId: subject.id,
                    dto: {
                        subjectId: subject.id,
                        type: plan.type,
                        title: plan.title,
                        description: `${plan.title} covering core material from ${subjectPlans[subjectIndex].name}.`,
                        grade: plan.grade === null ? null : Math.min(10, plan.grade + (subjectIndex % 3) * 0.25),
                        maxGrade: 10,
                        weightPercent: plan.weight,
                        dueAt: offsetDate(plan.days + subjectIndex, 12).toISOString(),
                        isCompleted: plan.complete,
                    },
                });
            }
        }
        for (const item of assessmentCreates) {
            await assessmentService.create(item.dto);
            created += 1;
        }

        for (let index = 0; index < 100; index += 1) {
            const subjectIndex = index % subjectPlans.length;
            const topicIndex = index < 22 ? (index * 2) % 5 : Math.floor(index / subjectPlans.length) % 8;
            const topicId = topicsBySubject[subjectIndex][topicIndex];
            const topicName = subjectPlans[subjectIndex].topics[topicIndex];
            const title = index < 22 ? oldSessionTitles[index % oldSessionTitles.length] : [
                `Focused review: ${topicName}`,
                `Practice block: ${topicName}`,
                `Weekly recap: ${topicName}`,
                `Independent study: ${topicName}`,
            ][index % 4];
            const minutes = index < 22 ? 35 + (index * 13 % 56) : 40 + ((index * 17 + 9) % 66);
            const focusRating = 3 + (index % 3);
            const description = index < 22 ? 'Focused study block with a short written recap.' : sessionDescriptions[index % sessionDescriptions.length];
            const daysAgo = index < 22 ? 2 + Math.floor(index * 40 / 21) : 3 + ((index * 11) % 54);
            const start = offsetDate(-daysAgo, 8 + (index * 3) % 10, index % 2 ? 30 : 0);
            const duplicate = existingSessions.some((session) => session.topicId === topicId && session.title === title
                && session.totalMinutes === minutes && session.focusRating === focusRating && session.description === description
                && new Date(session.startedAt).getTime() === start.getTime());
            if (duplicate) continue;
            const end = new Date(start.getTime() + minutes * 60_000);
            const dto: CreateSessionDTO = {
                title,
                description,
                totalMinutes: minutes,
                startedAt: start.toISOString(),
                endedAt: end.toISOString(),
                topicId,
                focusRating,
                pausedMinutes: index % 4 === 0 ? 5 : 0,
            };
            const session = await sessionService.create(dto);
            existingSessions.push(session);
            created += 1;
        }

        for (let index = 0; index < todoPlans.length; index += 1) {
            const plan = todoPlans[index];
            const subject = subjects[plan.subject]!;
            if (existingTodos.some((todo) => todo.subjectId === subject.id && todo.text.trim().toLocaleLowerCase() === plan.text.toLocaleLowerCase())) continue;
            const dto: CreateTodoDTO = {
                date: localDateKey(offsetDate(index < 12 ? index - 5 : 1 + (index % 18))),
                text: plan.text,
                subjectId: subject.id,
                topicId: topicsBySubject[plan.subject][index % 8],
            };
            const todo = await todoService.create(dto);
            existingTodos.push(todo);
            created += 1;
        }

        for (let index = 0; index < deadlinePlans.length; index += 1) {
            const plan = deadlinePlans[index];
            const subject = subjects[plan.subject]!;
            if (existingDeadlines.some((deadline) => deadline.subjectId === subject.id && deadline.title.trim().toLocaleLowerCase() === plan.title.toLocaleLowerCase())) continue;
            const deadline: CreateDeadlineDTO = {
                title: plan.title,
                type: plan.type,
                urgency: plan.urgency,
                description: 'Prepare the materials in advance and leave time for a final review.',
                dueAt: offsetDate(2 + index * 2, 23, 59).toISOString(),
                allDay: false,
                subjectId: subject.id,
                topicId: topicsBySubject[plan.subject][plan.topic],
            };
            const createdDeadline = await deadlineService.create(deadline);
            existingDeadlines.push(createdDeadline);
            created += 1;
        }

        for (let index = 0; index < 35; index += 1) {
            const subjectIndex = index % subjectPlans.length;
            const topicIndex = Math.floor(index / subjectPlans.length) % 8;
            const topicId = topicsBySubject[subjectIndex][topicIndex];
            const title = index < 10 ? oldSessionTitles[(index + 2) % oldSessionTitles.length] : `Study block: ${subjectPlans[subjectIndex].topics[topicIndex]}`;
            const dayOffset = 1 + (index % 21);
            const started = offsetDate(dayOffset, 8 + (index * 2) % 10, index % 2 ? 30 : 0);
            const ended = new Date(started.getTime() + (index % 3 === 0 ? 90 : index % 2 ? 60 : 45) * 60_000);
            const legacyStart = offsetDate(1 + Math.floor(index / 5) * 7 + (index % 5), 9 + (index % 5), 0);
            const legacyEnd = new Date(legacyStart.getTime() + (index % 2 ? 60 : 45) * 60_000);
            const legacyTopicId = topicsBySubject[index % subjectPlans.length][(index + 3) % 5];
            const legacyTitle = oldSessionTitles[(index + 2) % oldSessionTitles.length];
            if (existingScheduled.some((session) => (session.topicId === topicId && session.title === title
                && new Date(session.startedAt).getTime() === started.getTime() && new Date(session.endedAt).getTime() === ended.getTime())
                || (index < 10 && session.topicId === legacyTopicId && session.title === legacyTitle
                    && new Date(session.startedAt).getTime() === legacyStart.getTime() && new Date(session.endedAt).getTime() === legacyEnd.getTime()))) continue;
            const dto: CreateScheduledSessionDTO = { title, topicId, startedAt: started.toISOString(), endedAt: ended.toISOString() };
            const session = await scheduledSessionService.create(dto);
            existingScheduled.push(session);
            created += 1;
        }

        const usedNoteDates = new Set(existingNotes.map((note) => note.date.slice(0, 10)));
        const usedNoteContents = new Set(existingNotes.map((note) => note.content.trim()));
        let noteIndex = 0;
        for (let daysAgo = 2; noteIndex < notePlans.length && daysAgo <= 120; daysAgo += 1) {
            const content = notePlans[noteIndex];
            if (usedNoteContents.has(content)) {
                noteIndex += 1;
                continue;
            }
            const date = localDateKey(offsetDate(-daysAgo));
            if (usedNoteDates.has(date)) continue;
            const dto: CreateDayNoteDTO = { date, content };
            const note = await dayNoteService.create(dto);
            existingNotes.push(note);
            usedNoteDates.add(date);
            usedNoteContents.add(content);
            noteIndex += 1;
            created += 1;
        }

        return { created };
    } catch (error) {
        return failWithProgress(error, created);
    }
}
