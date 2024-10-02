import { MdFileUpload } from "react-icons/md";
import RequiredSign from "~/components/reqired_sign";
import { DataUploadElementProps } from "~/types/upload";

export default function DataUploadIndex({ data: uploadData, setData: setUploadData }: DataUploadElementProps) {
    return <div>
        <h2>資料上傳 <RequiredSign /></h2>
        <p>請上傳您的資源，支援的格式有 PDF、Word、Excel、PowerPoint、圖片、影片。</p>
        <label onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            console.log(file);
            if (!file) return;
            setUploadData({ ...uploadData!, file });
        }} onDragOver={(event) => event.preventDefault()}>
            {/* With drag and drop theme */}
            <div className="rounded-lg bg-neutral p-10 border-2 border-dashed border-gray-600 text-center hover:bg-gray-900 cursor-pointer transition-all grid place-content-center">
                <div className="text-4xl grid place-content-center relative">
                    <MdFileUpload />
                    <div className="absolute top-0 left-0 right-0 bottom-0 grid place-content-center animate-ping blur-sm m-5">
                        <MdFileUpload />
                    </div>
                </div>
                <div className="mt-5"><span className="text-warning">拖曳檔案</span>至此或<span className="text-warning">點擊</span>上傳</div>
            </div>
            <input type="file" className="hidden" />
        </label>
    </div>;
}