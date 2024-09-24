import { Link } from "@remix-run/react";
import { PropsWithChildren } from "react";
import { FaUser } from "react-icons/fa";
import { MdClass } from "react-icons/md";
import NumberCardFormatComponent from "~/components/number_card_format";
import { classFormat } from "~/utils";

interface Votes {
    upvotes: number,
    downvotes: number
}

interface ResourceCardArgs extends PropsWithChildren {
    id: number,
    title: string,
    teacher: string,
    subject: string,
    tags?: string[],
    tagsLimit?: boolean,
    className?: string,
    rank?: number,
    votes?: Votes
}

export default function ResourceCardComponent(configs: ResourceCardArgs) {
    return <Link to={String(configs.id)} className={classFormat([
        "card bg-neutral p-5 h-full",
        configs.className
    ])}>
        <div className="items-center h-full">
            {configs.rank && <div>
                <span className="text-2xl font-bold mr-5">{configs.rank}.</span>
            </div>}
            <div className="col-span-3">
                <div className="mb-5">
                    <span className="inline-block text-4xl font-bold truncate overflow-hidden max-w-full">{configs.title}</span>
                    <div className={classFormat([
                        configs.tagsLimit && "max-w-full md:max-w-60"
                    ])}>
                        <div className="flex flex-wrap gap-y-1">
                            {configs.votes && <div className="badge badge-warning bg-orange-300 tooltip" data-tip="資源的熱門程度">
                                <div className="flex items-center mr-2">
                                    <span>🔥</span>
                                    <span>
                                        <NumberCardFormatComponent amount={configs.votes.upvotes - configs.votes.downvotes} />
                                    </span>
                                </div>
                            </div>}
                            <div className="divider divider-horizontal mx-1"></div>
                            {configs.tags && configs.tags.map((tag) => <span key={tag} className="badge badge-accent mr-1">#{tag}</span>)}
                            {!configs.tags && <span className="italic text-gray-500">糟糕！怎麼沒有 #Hashtags</span>}
                        </div>
                    </div>

                    <div className="mt-2">
                        <span className="flex items-center text-lg"><FaUser className="inline mr-2" />{configs.teacher}</span>
                        <span className="flex items-center text-lg"><MdClass className="inline mr-2" />{configs.subject}</span>
                    </div>
                </div>
                <p className="mb-0">{configs.children}</p>
            </div>
        </div>
    </Link>;
}