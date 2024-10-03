import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { count } from "drizzle-orm";
import ResourceCardComponent from "../../components/resource_card";
import db from "~/db/client.server";
import { Link, useLoaderData, useRouteLoaderData, useSearchParams } from "@remix-run/react";
import { classFormat, Premission } from "~/utils";
import { useState } from "react";
import {
    MdAccessTimeFilled,
    MdAdd,
    MdDownload,
    MdSearch,
    MdSortByAlpha
} from "react-icons/md";
import { FaFire } from "react-icons/fa";
import JoinedButton from "~/components/joined_button";
import { resources } from "~/db/schema";
import { sortByDefault, sortByDownloads, sortByVotes } from "./sql_format.server";
import { SortBy } from "./resources_interface";
import { loader as rootLoader } from "~/root";
import GridViewPanel from "~/components/grid_view_panel";
import PageViewPanel from "~/components/page_view_panel";

export const meta: MetaFunction = () => {
    return [
        { title: "資源大廳 - 東華資源庫" },
        { name: "description", content: "在此找尋您所需要的資料。" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const requestQuery = new URL(request.url).searchParams;
    const sortBy = requestQuery.get("sort") as SortBy || SortBy.Votes;

    const offset = Number(requestQuery.get("page") || 1) * 20 - 20;

    const resourcesLength = await db
        .select({
            count: count()
        })
        .from(resources);
    
    let resourcesList;
    switch (sortBy) {
        case SortBy.Votes:
            resourcesList = await sortByVotes(offset);
            break;
        case SortBy.Downloads:
            resourcesList = await sortByDownloads(offset);
            break;
        case SortBy.AZ:
        case SortBy.Time:
        default:
            resourcesList = await sortByDefault(sortBy, offset);
    }

    return json({
        size: resourcesLength[0].count,
        resources: resourcesList
    });
}

export default function ResourcesIndex() {
    const data = useLoaderData<typeof loader>();
    const parentData = useRouteLoaderData<typeof rootLoader>("root");
    const [searchParams, setSearchParams] = useSearchParams();
    const [gridView, setGridView] = useState<boolean>(false);
    const [sort, setSort] = useState<SortBy>(searchParams.get("sort") as SortBy || SortBy.Votes);

    const currentPage = Number(searchParams.get("page") || 1);

    function changeSort(sort: SortBy) {
        const params = searchParams;
        params.set("sort", String(sort));
        setSearchParams(params);
        setSort(sort);
    }

    function changePage(page: number) {
        const params = searchParams;
        params.set("page", String(page));
        setSearchParams(params);
    }

    return <div className="flex flex-col xl:flex-row">
        <div className="flex-auto z-0">
            <GridViewPanel
                isGridView={gridView}
                setGridView={setGridView}
                left={<>
                    <div className="tooltip mr-2" data-tip="搜尋資源">
                        <Link to={"/search"} className="btn btn-outline">
                            <MdSearch />
                        </Link>
                    </div>
                    {(parentData?.premission || 0) >= Premission.VerifiedUser && <Link to={"new"} className="btn btn-success">
                        <MdAdd className="block" />
                        <span className="hidden sm:block">新增資源</span>
                    </Link>}
                </>}
                right={<>
                    <JoinedButton tips="以熱門程度排序" isHighlighted={sort === SortBy.Votes} onClick={() => changeSort(SortBy.Votes)}>
                        <FaFire />
                    </JoinedButton>
                    <JoinedButton tips="以創建順序排序" isHighlighted={sort === SortBy.Time} onClick={() => changeSort(SortBy.Time)}>
                        <MdAccessTimeFilled />
                    </JoinedButton>
                    <JoinedButton tips="以 A-Z 排序" isHighlighted={sort === SortBy.AZ} onClick={() => changeSort(SortBy.AZ)}>
                        <MdSortByAlpha />
                    </JoinedButton>
                    <JoinedButton tips="以下載次數排序" isHighlighted={sort === SortBy.Downloads} onClick={() => changeSort(SortBy.Downloads)}>
                        <MdDownload />
                    </JoinedButton>
                </>} />
            
            <div className={classFormat([
                "grid gap-2 grid-cols-1",
                gridView && "md:grid-cols-2 2xl:grid-cols-3"
            ])}>
                {data.resources.map((resource) => {
                    return <ResourceCardComponent
                        key={"resource:card:" + resource.id}
                        id={resource.id}
                        tags={resource.tags || undefined}
                        votes={{
                            upvotes: resource.votes.up,
                            downvotes: resource.votes.down
                        }}
                        teacher={resource.course?.teacher || "N/A"}
                        subject={resource.course?.name || "N/A"}
                        title={resource.name}
                        category={resource.category?.name}>
                        {resource.description && resource.description.length > 250 ? resource.description.slice(0, 250) + "..." : resource.description}
                    </ResourceCardComponent>;
                })}
            </div>

            <PageViewPanel
                size={data.size}
                currentPage={currentPage}
                changePage={changePage} />
        </div>
    </div>;
}