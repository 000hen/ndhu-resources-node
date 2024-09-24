import { PropsWithChildren } from "react";
import { classFormat } from "~/utils";

interface JoinedButtonArgs extends PropsWithChildren {
    isHighlighted: boolean,
    tips: string,
    onClick: () => void
}

export default function JoinedButton(configs: JoinedButtonArgs) {
    return <div
        className="tooltip"
        data-tip={configs.tips}>
        <button
            className={classFormat([
                "btn join-item",
                configs.isHighlighted && "btn-info"
            ])}
            onClick={configs.onClick}>
            {configs.children}
        </button>
    </div>;
}