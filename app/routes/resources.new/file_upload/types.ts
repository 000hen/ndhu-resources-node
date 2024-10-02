import { UploadResourceInterface } from "~/types/resource";

export enum FileUploadType {
    Pending   = 1 << 0,
    Uploading = 1 << 1,
    Done      = 1 << 2,
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

export interface RequestPreSignedPUT {
    resourceid: number,
    uploadid: string,
    fileid: string,
    part: number,
    validate: string,
}

export interface ServerPreSignedPUT {
    url: string,
}

export interface RequestUploadDone {
    resourceid: number,
    uploadid: string,
    fileid: string,
    validate: string,
    parts: { ETag: string, PartNumber: number }[],
}

export type ServerAction =
    | { type: ClientActionType.RequestUpload, payload: UploadResourceInterface }
    | { type: ServerActionType.ServerUploadResponse, payload: ServerUploadResponse }
    | { type: ClientActionType.RequestPreSignedPUT, payload: RequestPreSignedPUT }
    | { type: ServerActionType.ServerPreSignedPUT, payload: ServerPreSignedPUT }
    | { type: ClientActionType.RequestUploadDone, payload: RequestUploadDone }
    | { type: ServerActionType.ServerUploadDone };