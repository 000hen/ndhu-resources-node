import { PropsWithChildren } from "react";

interface ResourceCardArgs extends PropsWithChildren {
    title: string
}

export default function ResourceCardComponent(configs: ResourceCardArgs) {
    return <div className="card bg-neutral p-5">
        <h1>{configs.title}</h1>
    </div>;
}