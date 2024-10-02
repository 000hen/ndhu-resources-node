import { MdFileUpload, MdRestartAlt } from "react-icons/md";
import { humanFileSize } from "~/utils";

interface FileSelectedArgs {
    filename: string,
    size: number,
    onReselect: () => void
}

export default function FileSelected(config: FileSelectedArgs) {
    return <div className="card bg-neutral p-5">
        <div className="flex flex-row justify-between">
            <div className="flex items-center flex-auto min-w-0">
                <MdFileUpload className="text-4xl" size={36} />
                <div className="ml-5 min-w-0">
                    <h3 className="text-xl truncate">{config.filename}</h3>
                    <p className="mb-0">檔案大小: {humanFileSize(config.size)}</p>
                </div>
            </div>
            <div className="grid place-content-center min-w-fit ml-5">
                <button className="btn btn-error" onClick={config.onReselect}><MdRestartAlt className="text-xl" /> 重新選擇</button>
            </div>
        </div>
    </div>;
}