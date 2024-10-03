import { ActionFunctionArgs } from "@remix-run/node";
import { UploadResourceInterface } from "./resource";

export const CHUNK_SIZE = 20971520; // 20MB
export interface DataUpload extends UploadResourceInterface {
    file: File | null,
    chunkLength: number,
}

export interface DataUploadElementProps {
    data: DataUpload | null,
    setData: (data: DataUpload) => void,
    setIsAbleToNext: (isAbleToNext: boolean) => void,
}

export type StepElementRunner = (args: DataUploadElementProps) => JSX.Element;
export interface StepsRunner {
    loader: () => Promise<unknown>,
    action: (args: ActionFunctionArgs) => Promise<unknown>,
}
