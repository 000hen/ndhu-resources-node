import { IconType } from "react-icons";
import { classFormat } from "~/utils";

interface VoteButtonArgs {
    icon: IconType,
    onClick: () => void,
    isVoted: boolean,
    votedMessage: string,
    unvotedMessage: string
}

export default function VoteButton(config: VoteButtonArgs) {
    return <button className={classFormat(["btn btn-circle grid place-content-center tooltip", config.isVoted ? "btn-primary" : "btn-ghost"])}
        onClick={config.onClick} data-tip={config.isVoted ? config.votedMessage : config.unvotedMessage}>
        <config.icon size={32} className={classFormat([config.isVoted && "text-white"])} />
    </button>;
}