import { Link } from "react-router";
import { PropsWithChildren } from "react";
import { classFormat } from "~/utils";

interface FooterButtonArgs extends PropsWithChildren {
    tip?: string,
    to: string,
    className?: string,
    onClick?: () => void
}

export default function FooterButtonComponent(configs: FooterButtonArgs) {
    return <div className="flex-auto w-fit">
        <Link
            className={classFormat([
                "btn flex flex-row w-full justify-center",
                configs.tip && "tooltip",
                configs.className
            ])}
            onClick={configs.onClick}
            data-tip={configs.tip || ""}
            to={configs.to}>
            {configs.children}
        </Link>
    </div>;
}