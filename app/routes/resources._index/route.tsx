import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { count, desc } from "drizzle-orm";
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

export const meta: MetaFunction = () => {
    return [
        { title: "資源大廳 - 東華資源庫" },
        { name: "description", content: "在此找尋您所需要的資料。" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const requestQuery = new URL(request.url).searchParams;

    const resourcesLength = await db
        .select({
            count: count()
        })
        .from(resources);

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
            offset: Number(requestQuery.get("page") || 1) * 20 - 20,
            orderBy: (v) => desc(v.id),
            limit: 20
        });

    return json({
        size: resourcesLength[0].count,
        resources: resourcesList
    });
}

enum SortBy {
    AZ,
    Votes,
    Time,
    Downloads
}

export default function ResourcesIndex() {
    const data = useLoaderData<typeof loader>();
    const pageNumberRef = useRef<HTMLInputElement>(null);
    const [gridView, setGridView] = useState<boolean>(false);
    const [sort, setSort] = useState<SortBy>(SortBy.Votes);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page") || 1);

    console.log(data);

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

    // TODO: add functionality to sort options (by votes, by time, by name)

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
            </ResourcePanel>
            
            <div className={classFormat([
                "grid",
                gridView ? "md:grid-cols-2 2xl:grid-cols-3 gap-2" : "gap-2"
            ])}>
                {data.resources.map((resource) => {
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