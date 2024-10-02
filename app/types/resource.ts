export interface UploadResourceInterface {
    name: string;
    description: string | null;
    tags: string[] | null;
    course: Course | null;
    category: string | null;
    filename: string;
}

export interface ResourceInterface extends Omit<UploadResourceInterface, 'category'> {
    id: number;
    upload_by: string;
    create_at: Date;
    state: string;
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