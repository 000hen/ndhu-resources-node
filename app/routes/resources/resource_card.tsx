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
    return <Link to={String(configs.id)}>
        <div className={classFormat([
            "card bg-neutral p-5 mb-2 flex flex-row items-center",
            configs.className
        ])}>
            {configs.rank && <div>
                <span className="text-2xl font-bold mr-5">{configs.rank}.</span>
            </div>}
            {
                configs.votes && <div className="flex flex-col items-center mr-5">
                    <span className="text-2xl font-bold">
                        <NumberCardFormatComponent amount={configs.votes.upvotes - configs.votes.downvotes} />
                    </span>
                    <span className="text-2xl">🔥</span>
                </div>
            }
            <div>
                <div className="mb-5">
                    <span className="block text-4xl font-bold">{configs.title}</span>
                    <div className={classFormat([
                        configs.tagsLimit && "max-w-full md:max-w-60"
                    ])}>
                        {configs.tags && <div>
                            {configs.tags.map((tag) => <span key={tag} className="badge badge-accent mr-1">#{tag}</span>)}
                        </div>}
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