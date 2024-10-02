import { action as createDataAction, loader as createDataLoader } from "./create_data/index.server";
import { action as fileUploadAction } from "./file_upload/index.server";
import { StepsRunner } from "~/types/upload";

const stepsRunners: StepsRunner[] = [
    {
        loader: createDataLoader,
        action: createDataAction,
    },
    {
        loader: () => Promise.resolve(null),
        action: () => Promise.resolve(null),
    },
    {
        loader: () => Promise.resolve(null),
        action: fileUploadAction,
    },
];

export default stepsRunners;