import { PropsWithChildren } from "react";
import { IconType } from "react-icons";

interface IconBadgeArgs extends PropsWithChildren {
    icon: IconType,
    className?: string,
}

export default function IconBadgeComponent(configs: IconBadgeArgs) {
    return <div className="dropdown dropdown-hover dropdown-left gird place-content-center">
        <configs.icon className={["block mr-2", configs.className].join(" ")} />
        <div className="card card-compact dropdown-content bg-base-100 rounded-box w-48 lg:max-w-96 z-[1] shadow">
            <div className="card-body">
                <p className="mb-0">{configs.children}</p>
            </div>
        </div>
    </div>;
}