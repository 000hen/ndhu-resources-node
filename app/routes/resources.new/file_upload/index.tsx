import { useState } from "react";
import { DataUploadElementProps } from "~/types/upload";
import { FileUploadType } from "./types";

export default function FileUploadIndex({ data, setIsAbleToNext }: DataUploadElementProps) {
    const [state, setState] = useState<FileUploadType>(FileUploadType.Pending);

    return <div className="grid place-content-center w-full h-full">
        <div className="text-center mt-5">
            <h1 className="text-2xl">請稍待片刻，我們正在上傳檔案</h1>
        </div>
    </div>;
}