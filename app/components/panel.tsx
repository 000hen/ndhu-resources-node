import { PropsWithChildren } from "react";
import { classFormat } from "~/utils";

interface ResourcePanelArgs extends PropsWithChildren {
    className?: string
}

export default function ResourcePanel(configs: ResourcePanelArgs) {
    return <div className={classFormat([
        "sticky top-24 lg:top-0 z-10 py-5 md:p-5",
        configs.className
    ])}>
        <div className={"bg-gray-600/80 backdrop-blur-lg rounded-lg p-2 shadow-xl h-fit"}>
            {configs.children}
        </div>
    </div>;
}