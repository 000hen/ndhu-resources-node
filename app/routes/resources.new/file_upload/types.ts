import { UploadResourceInterface } from "~/types/resource";

export enum FileUploadState {
    Pending   = 0,
    Uploading = 1,
    Done      = 2,
    Failed    = -1,
}

export enum ClientActionType {
    RequestUpload        = 1 << 0,
    RequestPreSignedPUT  = 1 << 1,
    RequestUploadDone    = 1 << 2,
}

export enum ServerActionType {
    ServerUploadResponse = 1 << 0,
    ServerPreSignedPUT   = 1 << 1,
    ServerUploadDone     = 1 << 2,
}

export interface ServerUploadResponse {
    resourceid: number,
    uploadid: string,
    fileid: string,
    validate: string,
}

export interface RequestPreSignedPUT extends ServerUploadResponse {
    part: number,
}

export interface ServerPreSignedPUT {
    url: string,
}

export interface UploadParts {
    ETag: string,
    PartNumber: number
}

export interface RequestUploadDone extends ServerUploadResponse {
    parts: UploadParts[],
}

export type ClientAction =
    | { type: ClientActionType.RequestUpload, payload: UploadResourceInterface }
    | { type: ClientActionType.RequestPreSignedPUT, payload: RequestPreSignedPUT }
    | { type: ClientActionType.RequestUploadDone, payload: RequestUploadDone };

export type ServerAction =
    | { type: ServerActionType.ServerUploadResponse, payload: ServerUploadResponse }
    | { type: ServerActionType.ServerPreSignedPUT, payload: ServerPreSignedPUT }
    | { type: ServerActionType.ServerUploadDone };