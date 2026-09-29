import type {Tag} from './tag';

export interface Task {
    id: number;
    name: string;
    tag: Tag;
}