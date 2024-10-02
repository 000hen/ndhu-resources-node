import { MdFileUpload } from "react-icons/md";

interface UploadFileArgs {
    setFile: (file: File) => void;
}

export default function UploadFile(config: UploadFileArgs) {
    return <label onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

        if (!file)
            return;

        config.setFile(file);
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
        <input type="file" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file)
                return;

            config.setFile(file);
        }} />
    </label>;
}