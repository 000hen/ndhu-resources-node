import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { count } from "drizzle-orm";
import ResourceCardComponent from "../../components/resource_card";
import db from "~/db/client.server";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { classFormat } from "~/utils";
import { useRef, useState } from "react";
import {
    MdAccessTimeFilled,
    MdAdd,
    MdDownload,
    MdGridView,
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
    MdSearch,
    MdSortByAlpha,
    MdViewAgenda
} from "react-icons/md";
import { FaFire } from "react-icons/fa";
import JoinedButton from "./joined_button";
import { resources } from "~/db/schema";
import ResourcePanel from "./panel";
import { sortByDefault, sortByDownloads, sortByVotes } from "./sql_format.server";
import { SortBy } from "./resources_interface";

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
    const pageNumberRef = useRef<HTMLInputElement>(null);
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

    function setPageNumber(page: number) {
        if (!pageNumberRef.current)
            return;

        pageNumberRef.current.value = String(page);
    }

    function inputChangePage() {
        if (!pageNumberRef.current)
            return;

        if (pageNumberRef.current.value === "" ||
            Number(pageNumberRef.current.value) < 1 ||
            Number(pageNumberRef.current.value) > Math.ceil(data.size / 20))
            return setPageNumber(currentPage);
        
        if (Number(pageNumberRef.current.value) === currentPage)
            return setPageNumber(currentPage);

        changePage(Number(pageNumberRef.current.value));
    }

    function changePage(page: number) {
        const params = searchParams;
        params.set("page", String(page));
        setSearchParams(params);
        setPageNumber(page);
    }

    return <div className="flex flex-col xl:flex-row">
        <div className="flex-auto z-0">
            <ResourcePanel className="sticky">
                <div className="flex justify-between">
                    <div>
                        <div className="tooltip mr-2" data-tip="搜尋資源">
                            <Link to={"/search"} className="btn btn-outline">
                                <MdSearch />
                            </Link>
                        </div>
                        <Link to={"new"} className="btn btn-success">
                            <MdAdd className="block" />
                            <span className="hidden sm:block">新增資源</span>
                        </Link>
                    </div>
                    <div className="flex flex-row">
                        <div className="join md:mr-2">
                            <JoinedButton tips="以熱門程度排序" isHighlighted={sort === SortBy.Votes} onClick={() => changeSort(SortBy.Votes)}>
                                <FaFire />
                            </JoinedButton>
                            <JoinedButton tips="以創建順序排序" isHighlighted={sort === SortBy.Time} onClick={() => changeSort(SortBy.Time)}>
                                <MdAccessTimeFilled />
                            </JoinedButton>
                            <JoinedButton tips="以創建 A-Z 排序" isHighlighted={sort === SortBy.AZ} onClick={() => changeSort(SortBy.AZ)}>
                                <MdSortByAlpha />
                            </JoinedButton>
                            <JoinedButton tips="以下載次數排序" isHighlighted={sort === SortBy.Downloads} onClick={() => changeSort(SortBy.Downloads)}>
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
            </ResourcePanel>
            
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

            <ResourcePanel>
                <div className="flex justify-center">
                    <div className="join">
                        <button
                            className="btn join-item tooltip"
                            data-tip="上一頁"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}>
                            <MdKeyboardArrowLeft size={32} />
                        </button>

                        <div className="join-item h-full px-5 bg-neutral">
                            <span className="text-lg">第 </span>
                            <div className="tooltip" data-tip="輸入頁數，按下 Enter 或點擊旁邊空白處即可跳轉">
                                <input
                                    ref={pageNumberRef}
                                    className="input hover:bg-slate-600 w-10 p-0 text-center bg-neutral transition-all"
                                    onBlur={inputChangePage}
                                    onKeyUp={(inp) => inp.key === "Enter" && inputChangePage()}
                                    type="number"
                                    defaultValue={currentPage}></input>
                            </div>
                            <span className="text-lg"> / {Math.ceil(data.size / 20)} 頁</span>
                        </div>

                        <button
                            className="btn join-item tooltip"
                            data-tip="下一頁"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(data.size / 20)}>
                            <MdKeyboardArrowRight size={32} />
                        </button>
                    </div>
                </div>
            </ResourcePanel>
        </div>
    </div>;
}