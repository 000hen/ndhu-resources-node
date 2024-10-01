import { action as createDataAction, loader as createDataLoader } from "./create_data/index.server";
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
];

export default stepsRunners;