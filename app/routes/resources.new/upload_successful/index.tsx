import { useEffect } from "react";
import { DataUploadElementProps } from "~/types/upload";

export default function UploadSuccessfulIndex({ setIsAbleToNext }: DataUploadElementProps) {
    useEffect(() => {
        setIsAbleToNext(true);
    }, [setIsAbleToNext]);

    return <div>
        <h2>上傳成功</h2>
        <p>您的資源已經上傳成功，謝謝您的貢獻！</p>
        <p>您的資源將會在近期內被審核，審核通過後將會在資源庫中出現。</p>
    </div>;
}