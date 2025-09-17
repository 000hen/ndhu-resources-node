import { Link } from "@remix-run/react";
import { PropsWithChildren } from "react";
import { IconType } from "react-icons";
import { MdArrowForwardIos } from "react-icons/md";
import { classFormat } from "~/utils";

interface PanelLinkArgs extends PropsWithChildren {
    to: string,
    icon: IconType | string,
    className?: string,
    highlight: string,
    onClick?: () => void
}

export default function PanelLink(configs: PanelLinkArgs) {
    const hightlight = configs.highlight === configs.to;

    return <Link
        onClick={configs.onClick}
        className={classFormat([
            "p-5 my-1 hover:bg-neutral w-full rounded-lg text-xl flex items-center transition-colors",
            configs.className,
            hightlight && "bg-base-100"
        ])}
        to={configs.to}>
        {hightlight && <MdArrowForwardIos size={30} className="animate-pulse mr-2" />}
        {
            typeof configs.icon === "string"
                ? <img referrerPolicy="no-referrer" className="rounded-full w-5 inline mr-2" alt="Profile" src={configs.icon} />
                : <configs.icon className="inline mr-2" />
        }
        {configs.children}
    </Link>;
}