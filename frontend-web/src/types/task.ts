import type {Tag} from './tag';

export interface Task {
    id: number;
    name: string;
    tag: Tag;
}

export interface CreateTaskDTO {
    taskName: string;
    tagName: string;
    tagColor: string;
}