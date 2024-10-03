import { FileUploadState, ServerUploadResponse, UploadParts } from "./types";

export enum ActionType {
    SET_CURRENT_STATE,
    SET_UPLOAD_PAYLOAD,
    ADD_UPLOAD_SUCCESSFUL_CHUNK,
}
export type Action =
    | { type: ActionType.SET_CURRENT_STATE, payload: FileUploadState }
    | { type: ActionType.SET_UPLOAD_PAYLOAD, payload: ServerUploadResponse }
    | { type: ActionType.ADD_UPLOAD_SUCCESSFUL_CHUNK, payload: UploadParts };

export interface FileUploadType {
    currentState: FileUploadState,
    uploadInfo: ServerUploadResponse | null,
    successfulChunks: UploadParts[],
}

export function reducer(state: FileUploadType, action: Action) {
    switch (action.type) {
        case ActionType.SET_CURRENT_STATE:
            return { ...state, currentState: action.payload };
        case ActionType.SET_UPLOAD_PAYLOAD:
            return { ...state, uploadInfo: action.payload };
        case ActionType.ADD_UPLOAD_SUCCESSFUL_CHUNK:
            return { ...state, successfulChunks: [...state.successfulChunks, action.payload] };
    }
}