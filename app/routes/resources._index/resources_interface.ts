export enum SortBy {
    AZ = "az",
    Votes = "votes",
    Time = "time",
    Downloads = "downloads"
}

export interface ResourceInterface {
    id: number;
    name: string;
    description: string | null;
    tags: string[] | null;
    hash: string;
    upload_by: string;
    create_at: Date;
    state: string;
    course: Course | null;
    votes: Votes;
    category: Category | null;
}

export interface Category {
    id: string;
    name: string;
    create_at: Date;
}

export interface Course {
    id: number;
    display_id: string;
    name: string;
    teacher: string | null;
}

export interface Votes {
    up: number;
    down: number;
}