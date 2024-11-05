import { IconType } from "react-icons";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { classFormat, numberFormat } from "~/utils";

interface VoteButtonArgs {
    icon: IconType,
    onClick: () => void,
    isVoted: boolean,
    votedMessage: string,
    unvotedMessage: string
}

export function VoteButton(config: VoteButtonArgs) {
    return <button className={classFormat(["btn btn-circle grid place-content-center tooltip", config.isVoted ? "btn-primary" : "btn-ghost"])}
        onClick={config.onClick} data-tip={config.isVoted ? config.votedMessage : config.unvotedMessage}>
        <config.icon size={32} className={classFormat([config.isVoted && "text-white"])} />
    </button>;
}

interface VoteComponentArgs {
    voteup: number,
    votedown: number,
    userVote: number,
    vote: (value: number) => void,
    isAuth: boolean
}
export default function VoteComponent(config: VoteComponentArgs) {
    return <div className="card shadow-xl bg-neutral min-w-fit flex-auto">
        <div className="py-2 md:py-5 px-5 md:px-2 h-full">
            <div className="flex md:flex-col h-full justify-between w-full items-center">
                <VoteButton
                    icon={MdArrowUpward}
                    onClick={() => config.vote(1)}
                    isVoted={config.userVote === 1}
                    votedMessage={"您已推薦過此資源"}
                    unvotedMessage={config.isAuth ? "推薦此資源" : "登入以對此資源評價"} />

                <div className="grid place-content-center">
                    {numberFormat(config.voteup - config.votedown)}
                </div>

                <VoteButton
                    icon={MdArrowDownward}
                    onClick={() => config.vote(-1)}
                    isVoted={config.userVote === -1}
                    votedMessage={"您已踩過此資源"}
                    unvotedMessage={config.isAuth ? "踩此資源" : "登入以對此資源評價"} />
            </div>
        </div>
    </div>;
}