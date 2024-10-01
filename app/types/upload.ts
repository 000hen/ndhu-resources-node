import { ActionFunctionArgs } from "@remix-run/node";
import { ResourceInterface } from "./resource";

export interface DataUpload extends ResourceInterface {
    file: File | null,
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
