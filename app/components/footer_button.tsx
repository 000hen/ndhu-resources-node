import { Link } from "@remix-run/react";
import { PropsWithChildren } from "react";
import { classFormat } from "~/utils";

interface FooterButtonArgs extends PropsWithChildren {
    tip?: string,
    to: string,
    className?: string
}

export default function FooterButtonComponent(configs: FooterButtonArgs) {
    return <div className="flex-auto w-fit m-2">
        <Link
            className={classFormat([
                "btn flex flex-row w-full justify-center",
                configs.tip && "tooltip",
                configs.className
            ])}
            data-tip={configs.tip || ""}
            to={configs.to}>
            {configs.children}
        </Link>
    </div>;
}