import CreateDataIndex from "./create_data/index";
import DataUploadIndex from "./upload_data/index";
import { DataUploadElementProps, StepElementRunner } from "~/types/upload";

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
];

export default stepsElementRunners;