import { Course, UploadResourceInterface } from "~/types/resource";

// TODO: Add reducer logic for the create_data page
export enum ActionType {
    SET_NAME,
    SET_DESCRIPTION,
    SET_TAGS,
    SET_COURSE,
    SET_CATEGORY,
}
export type Action =
    | { type: ActionType.SET_NAME, payload: string }
    | { type: ActionType.SET_DESCRIPTION, payload: string }
    | { type: ActionType.SET_TAGS, payload: string[] }
    | { type: ActionType.SET_COURSE, payload: Course }
    | { type: ActionType.SET_CATEGORY, payload: string };

export function reducer(state: UploadResourceInterface, action: Action): UploadResourceInterface {
    switch (action.type) {
        case ActionType.SET_NAME:
            return { ...state, name: action.payload };
        case ActionType.SET_DESCRIPTION:
            return { ...state, description: action.payload };
        case ActionType.SET_TAGS:
            return { ...state, tags: action.payload };
        case ActionType.SET_COURSE:
            return { ...state, course: action.payload };
        case ActionType.SET_CATEGORY:
            return { ...state, category: action.payload };
    }
}