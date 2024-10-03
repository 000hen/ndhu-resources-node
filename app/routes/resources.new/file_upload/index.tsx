import { useEffect, useReducer } from "react";
import { CHUNK_SIZE, DataUploadElementProps } from "~/types/upload";
import { ClientActionType, FileUploadState, ServerActionType, UploadParts } from "./types";
import { action } from "./index.server";
import { useFetcher } from "@remix-run/react";
import { ActionType, reducer } from "./reducer";
import { uploadPart } from "./uploader";
import { classFormat } from "~/utils";

async function chunkUpload(presignedUrl: string, file: File, part: number, chunkSize: number = CHUNK_SIZE) {
    const start = (part - 1) * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    return await uploadPart(chunk, presignedUrl);
}

export default function FileUploadIndex({ data, setIsAbleToNext }: DataUploadElementProps) {
    const fetcher = useFetcher<typeof action>();
    const [state, dispatch] = useReducer(reducer, {
        currentState: FileUploadState.Pending,
        uploadInfo: null,
        successfulChunks: [],
    });

    function submitData() {
        const submitData = { ...data, file: undefined };
        fetcher.submit(
            { type: ClientActionType.RequestUpload, payload: JSON.stringify(submitData) },
            { method: "POST" });
    }

    function uploadChunk(part: number) {
        fetcher.submit(
            { type: ClientActionType.RequestPreSignedPUT, payload: JSON.stringify({ ...state.uploadInfo, part }) },
            { method: "POST" });
    }

    function finishUpload(parts: UploadParts[]) {
        fetcher.submit(
            { type: ClientActionType.RequestUploadDone, payload: JSON.stringify({ ...state.uploadInfo, parts }) },
            { method: "POST" });
    }

    useEffect(() => {
        if (state.currentState !== FileUploadState.Done && state.currentState !== FileUploadState.Failed) {
            window.onbeforeunload = () => "檔案上傳中，確定要離開嗎？";
        } else {
            window.onbeforeunload = null;
        }

        switch (state.currentState) {
            case FileUploadState.Pending:
                return submitData();
            case FileUploadState.Uploading:
                return uploadChunk(state.successfulChunks.length + 1);
            case FileUploadState.Done:
                return finishUpload(state.successfulChunks);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.currentState]);

    useEffect(() => {
        if (!fetcher.data || !data || !data.file)
            return;

        switch (fetcher.data.type) {
            case ServerActionType.ServerUploadResponse:
                dispatch({ type: ActionType.SET_UPLOAD_PAYLOAD, payload: fetcher.data.payload });
                dispatch({ type: ActionType.SET_CURRENT_STATE, payload: FileUploadState.Uploading });
                break;
            case ServerActionType.ServerPreSignedPUT:
                chunkUpload(fetcher.data.payload.url, data.file, state.successfulChunks.length + 1)
                    .then((e) => {
                        dispatch({
                            type: ActionType.ADD_UPLOAD_SUCCESSFUL_CHUNK,
                            payload: { ETag: e, PartNumber: state.successfulChunks.length + 1 }
                        });

                        if (state.successfulChunks.length + 1 === data.chunkLength)
                            dispatch({ type: ActionType.SET_CURRENT_STATE, payload: FileUploadState.Done });
                        else
                            uploadChunk(state.successfulChunks.length + 2);
                    })
                    .catch(() => dispatch({ type: ActionType.SET_CURRENT_STATE, payload: FileUploadState.Failed }));
                break;
            case ServerActionType.ServerUploadDone:
                setIsAbleToNext(true);
                break;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetcher.data]);

    return <div className="grid place-content-center w-full h-full">
        <div className="text-center mt-5">
            <h1 className="text-2xl">請稍待片刻，我們正在上傳檔案</h1>
        </div>

        <div className="mt-5">
            {state.currentState === FileUploadState.Pending && <h3>準備上傳...</h3>}
            {state.currentState === FileUploadState.Uploading && <h3>上傳中...</h3>}
            {state.currentState === FileUploadState.Done && <h3>已完成上傳</h3>}
            {state.currentState === FileUploadState.Failed && <h3>上傳失敗！請確認您的網路連線</h3>}

            <div className="flex items-center">
                <span className="min-w-fit mr-2">{state.currentState + state.successfulChunks.length} / {2 + (data?.chunkLength ?? 0)}</span>
                <progress className={classFormat([
                    "progress w-full",
                    state.currentState === FileUploadState.Pending && "progress-primary",
                    state.currentState === FileUploadState.Uploading && "progress-primary",
                    state.currentState === FileUploadState.Done && "progress-success",
                    state.currentState === FileUploadState.Failed && "progress-error",
                ])} max={2 + (data?.chunkLength ?? 0)} value={state.currentState + state.successfulChunks.length} />
            </div>
        </div>
    </div>;
}