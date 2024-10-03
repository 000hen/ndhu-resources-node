import CreateDataIndex from "./create_data/index";
import FileUploadIndex from "./file_upload";
import DataUploadIndex from "./select_file/index";
import { DataUploadElementProps, StepElementRunner } from "~/types/upload";
import UploadSuccessfulIndex from "./upload_successful";

const stepsElementRunners: StepElementRunner[] = [
    (configs: DataUploadElementProps) =>
        <CreateDataIndex
            data={configs.data}
            setData={configs.setData}
            setIsAbleToNext={configs.setIsAbleToNext} />,
    (configs: DataUploadElementProps) =>
        <DataUploadIndex
            data={configs.data}
            setData={configs.setData}
            setIsAbleToNext={configs.setIsAbleToNext} />,
    (configs: DataUploadElementProps) =>
        <FileUploadIndex
            data={configs.data}
            setData={configs.setData}
            setIsAbleToNext={configs.setIsAbleToNext} />,
    (configs: DataUploadElementProps) =>
        <UploadSuccessfulIndex
            data={configs.data}
            setData={configs.setData}
            setIsAbleToNext={configs.setIsAbleToNext} />,
];

export default stepsElementRunners;