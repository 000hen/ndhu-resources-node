import RequiredSign from "~/components/reqired_sign";
import { CHUNK_SIZE, DataUploadElementProps } from "~/types/upload";
import UploadFile from "./upload_file";
import FileSelected from "./file_selected";
import { useEffect } from "react";

export default function SelectFileIndex({ data: uploadData, setData: setUploadData, setIsAbleToNext }: DataUploadElementProps) {
    function setFileUpload(file: File) {
        if (!uploadData)
            return;

        setUploadData({
            ...uploadData,
            file,
            filename: file.name,
            chunkLength: Math.ceil(file.size / CHUNK_SIZE),
        });
    }

    console.log(uploadData);

    function reselect() {
        if (!uploadData)
            return;

        setUploadData({
            ...uploadData,
            file: null,
            chunkLength: 0
        });
    }

    useEffect(() => {
        if (!uploadData?.file) {
            setIsAbleToNext(false);
            return;
        }

        setIsAbleToNext(true);
    }, [uploadData?.file, setIsAbleToNext]);

    return <div>
        <h2>資料上傳 <RequiredSign /></h2>
        <p>請上傳您的資源。一次僅限上傳一個檔案。</p>
        <p>此平台作為公益性質，請勿上傳私人檔案。</p>
        
        {!uploadData?.file && <UploadFile setFile={setFileUpload} />}
        {uploadData?.file && <FileSelected
            filename={uploadData.file.name}
            size={uploadData.file.size}
            onReselect={reselect} />}
    </div>;
}