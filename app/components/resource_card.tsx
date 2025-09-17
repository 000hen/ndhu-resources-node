import { Link } from "@remix-run/react";
import { PropsWithChildren } from "react";
import { FaUser } from "react-icons/fa";
import { MdCategory, MdClass } from "react-icons/md";
import NumberCardFormatComponent from "~/components/number_card_format";
import { classFormat } from "~/utils";

interface Votes {
    upvotes: number;
    downvotes: number;
}

interface ResourceCardArgs extends PropsWithChildren {
    id: number;
    title: string;
    teacher?: string;
    subject?: string;
    tags?: string[];
    tagsLimit?: boolean;
    className?: string;
    rank?: number;
    votes?: Votes;
    category?: string;
}

export function HashTagsFormat({ tags }: { tags?: string[] }) {
    return (
        <>
            {tags &&
                tags.map((tag) => (
                    <span key={tag} className="badge badge-info mr-1">
                        #{tag}
                    </span>
                ))}
            {!tags && (
                <span className="italic text-gray-500">
                    糟糕！怎麼沒有 #Hashtags
                </span>
            )}
        </>
    );
}

export default function ResourceCardComponent(configs: ResourceCardArgs) {
    const isVotes =
        configs.votes &&
        (configs.votes.upvotes > 0 || configs.votes.downvotes > 0);

    return (
        <Link
            to={"/resources/" + String(configs.id)}
            className={classFormat([
                "card bg-neutral p-5 h-full",
                configs.className,
            ])}
        >
            <div className="items-center h-full">
                {configs.rank && (
                    <div>
                        <span className="text-2xl font-bold mr-5">
                            {configs.rank}.
                        </span>
                    </div>
                )}
                <div className="col-span-3">
                    <div>
                        <span className="inline-block text-4xl font-bold truncate overflow-hidden max-w-full leading-14">
                            {configs.title}
                        </span>
                        <div
                            className={classFormat([
                                configs.tagsLimit && "max-w-full md:max-w-60",
                            ])}
                        >
                            <div className="flex flex-wrap gap-y-1">
                                {isVotes && (
                                    <VoteDisplay
                                        votes={configs.votes as Votes}
                                    />
                                )}
                                {!isVotes && (
                                    <span className="italic text-gray-500">
                                        尚未有評分
                                    </span>
                                )}
                                <div className="divider divider-horizontal mx-1"></div>
                                <HashTagsFormat tags={configs.tags} />
                            </div>
                        </div>

                        <div className="mt-2">
                            <span className="flex items-center text-lg">
                                <FaUser className="inline mr-2" />
                                {configs.teacher || "未知導師"}
                            </span>
                            <span className="flex items-center text-lg">
                                <MdClass className="inline mr-2" />
                                {configs.subject || "未分類課堂"}
                            </span>
                            {configs.category && (
                                <span className="flex items-center text-lg">
                                    <MdCategory className="inline mr-2" />
                                    {configs.category}
                                </span>
                            )}
                        </div>
                    </div>
                    {configs.children && (
                        <p className="mt-5 mb-0">{configs.children}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}

function VoteDisplay({ votes }: { votes: Votes }) {
    const score = votes.upvotes - votes.downvotes;

    return (
        <>
            <div
                className="badge badge-warning tooltip"
                data-tip="資源的熱門程度"
            >
                <div className="flex items-center mr-2">
                    <span>🔥</span>
                    <span>
                        <NumberCardFormatComponent amount={score} />
                    </span>
                </div>
            </div>
        </>
    );
}
