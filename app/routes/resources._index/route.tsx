import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { desc } from "drizzle-orm";
import ResourceCardComponent from "../../components/resource_card";
import db from "~/db/client.server";
import { Link, useLoaderData } from "@remix-run/react";
import { classFormat } from "~/utils";
import { useState } from "react";
import {
    MdAccessTimeFilled,
    MdAdd,
    MdDownload,
    MdGridView,
    MdSearch,
    MdSortByAlpha,
    MdViewAgenda
} from "react-icons/md";
import { FaFire } from "react-icons/fa";
import JoinedButton from "./joined_button";

export const meta: MetaFunction = () => {
    return [
        { title: "資源大廳 - 東華資源庫" },
        { name: "description", content: "在此找尋您所需要的資料。" },
    ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
    const resourcesList = await db
        .query
        .resources
        .findMany({
            with: {
                course: true,
                pushOrDump: {
                    columns: {
                        isPush: true
                    }
                }
            },
            orderBy: (v) => desc(v.id),
            limit: 20
        });

    return json(resourcesList);
}

enum SortBy {
    AZ,
    Votes,
    Time,
    Downloads
}

export default function ResourcesIndex() {
    const data = useLoaderData<typeof loader>();
    // const [showTop, setShowTop] = useState<boolean>(true);
    const [gridView, setGridView] = useState<boolean>(false);
    const [sort, setSort] = useState<SortBy>(SortBy.Votes);

    console.log(data);

    // TODO: add functionality to sort options (by votes, by time, by name)

    return <div className="flex flex-col xl:flex-row">
        <div className="flex-auto z-0">
            <div className="sticky top-24 lg:top-0 z-10 p-5">
                <div className="bg-slate-700/80 backdrop-blur-lg rounded-lg p-2 shadow-xl h-fit">
                    <div className="flex justify-between">
                        <div>
                            <div className="tooltip mr-2" data-tip="搜尋資源">
                                <Link to={"/search"} className="btn btn-outline">
                                    <MdSearch />
                                </Link>
                            </div>
                            <div className="tooltip mr-2" data-tip="熱門資源">
                                <Link to={"feature"} className="btn btn-warning">
                                    <FaFire />
                                </Link>
                            </div>
                            <Link to={"new"} className="btn btn-success">
                                <MdAdd className="block" />
                                <span className="hidden sm:block">新增資源</span>
                            </Link>
                        </div>
                        <div className="flex flex-row">
                            <div className="join md:mr-2">
                                <JoinedButton tips="以熱門程度排序" isHighlighted={sort === SortBy.Votes} onClick={() => setSort(SortBy.Votes)}>
                                    <FaFire />
                                </JoinedButton>
                                <JoinedButton tips="以創建順序排序" isHighlighted={sort === SortBy.Time} onClick={() => setSort(SortBy.Time)}>
                                    <MdAccessTimeFilled />
                                </JoinedButton>
                                <JoinedButton tips="以創建 A-Z 排序" isHighlighted={sort === SortBy.AZ} onClick={() => setSort(SortBy.AZ)}>
                                    <MdSortByAlpha />
                                </JoinedButton>
                                <JoinedButton tips="以下載次數排序" isHighlighted={sort === SortBy.Downloads} onClick={() => setSort(SortBy.Downloads)}>
                                    <MdDownload />
                                </JoinedButton>
                            </div>
                            <div className="join hidden md:block">
                                <JoinedButton tips="以網格檢視" isHighlighted={gridView} onClick={() => setGridView(true)}>
                                    <MdGridView />
                                </JoinedButton>
                                <JoinedButton tips="以直列檢視" isHighlighted={!gridView} onClick={() => setGridView(false)}>
                                    <MdViewAgenda />
                                </JoinedButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={classFormat([
                "grid",
                gridView ? "md:grid-cols-2 2xl:grid-cols-3 gap-2" : "gap-2"
            ])}>
                {data.map((resource) => {
                    return <ResourceCardComponent
                        key={"resource:card:" + resource.id}
                        id={resource.id}
                        tags={resource.tags || undefined}
                        votes={{
                            upvotes: resource.pushOrDump.filter((e) => e.isPush > 0).length,
                            downvotes: resource.pushOrDump.filter((e) => e.isPush < 0).length
                        }}
                        teacher={resource.course?.teacher || "N/A"}
                        subject={resource.course?.name || "N/A"}
                        title={resource.name}>
                        {resource.description}
                    </ResourceCardComponent>;
                })}
                {data.map((resource) => {
                    return <ResourceCardComponent
                        key={"resource:card:" + resource.id}
                        id={resource.id}
                        tags={resource.tags || undefined}
                        votes={{
                            upvotes: resource.pushOrDump.filter((e) => e.isPush > 0).length,
                            downvotes: resource.pushOrDump.filter((e) => e.isPush < 0).length
                        }}
                        teacher={resource.course?.teacher || "N/A"}
                        subject={resource.course?.name || "N/A"}
                        title={resource.name}>
                        {resource.description}
                    </ResourceCardComponent>;
                })}
                {data.map((resource) => {
                    return <ResourceCardComponent
                        key={"resource:card:" + resource.id}
                        id={resource.id}
                        tags={resource.tags || undefined}
                        votes={{
                            upvotes: resource.pushOrDump.filter((e) => e.isPush > 0).length,
                            downvotes: resource.pushOrDump.filter((e) => e.isPush < 0).length
                        }}
                        teacher={resource.course?.teacher || "N/A"}
                        subject={resource.course?.name || "N/A"}
                        title={resource.name}>
                        {resource.description}
                    </ResourceCardComponent>;
                })}
            </div>
        </div>
    </div>;
}