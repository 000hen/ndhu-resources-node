import {
    ActionFunctionArgs,
    json,
    LoaderFunctionArgs,
    MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { MdSearch } from "react-icons/md";
import { classFormat } from "~/utils";
import db from "~/db/client.server";
import { resources } from "~/db/schema";
import { count, sql } from "drizzle-orm";
import { useRef, useState } from "react";
import ResourceCardComponent from "~/components/resource_card";
import GridViewPanel from "~/components/grid_view_panel";
import PageViewPanel from "~/components/page_view_panel";

enum SearchType {
    Course = "course",
    Resource = "resource",
}

export async function loader({ request }: LoaderFunctionArgs) {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim();
    const offset = Number(searchParams.get("page") || 1) * 20 - 20;

    if (!query || offset < 0)
        return json({
            length: 0,
            resources: [],
        });

    // TODO: Implement search type
    // const searchType = searchParams.get("searchType") as SearchType || SearchType.Resource;

    const ftsQuery = sql`MATCH(${resources.name}, ${resources.description}, ${
        resources.tags
    }, ${resources.upload_by}) AGAINST(${sql.placeholder(
        "query"
    )} IN NATURAL LANGUAGE MODE)`;

    const length = await db
        .select({
            count: count(resources.id),
        })
        .from(resources)
        .where(ftsQuery)
        .prepare()
        .execute({
            query,
        });

    const data = await db.query.resources
        .findMany({
            with: {
                course: true,
                pushOrDump: {
                    columns: {
                        isPush: true,
                    },
                },
                category: true,
            },
            where: ftsQuery,
            limit: 20,
            offset: sql.placeholder("offset"),
        })
        .prepare()
        .execute({
            query,
            offset,
        });

    return json({
        length: length[0].count,
        resources: data.map((e) => ({
            id: e.id,
            name: e.name,
            description: e.description,
            tags: e.tags,
            upload_by: e.upload_by,
            create_at: e.create_at,
            state: e.state,
            course: e.course,
            votes: {
                up: e.pushOrDump.filter((v) => v.isPush > 0).length,
                down: e.pushOrDump.filter((v) => v.isPush < 0).length,
            },
            category: e.category,
        })),
    });
}

export const meta: MetaFunction<typeof loader> = ({ location }) => {
    const query = new URLSearchParams(location.search).get("q");

    return [
        { title: `搜尋 ${query ? query : ""} - 東華資源庫` },
        { name: "description", content: "在東華資源庫上搜尋 " },
    ];
};

export async function action({ request }: ActionFunctionArgs) {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) return null;

    return json(await searchSuggestions(query));
}

async function searchSuggestions(query: string) {
    return await db
        .select({
            id: resources.id,
            name: resources.name,
        })
        .from(resources)
        .where(
            sql`MATCH(${resources.name}) AGAINST(${sql.placeholder(
                "query"
            )} IN NATURAL LANGUAGE MODE)`
        )
        .limit(5)
        .prepare()
        .execute({
            query,
        });
}

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [gridView, setGridView] = useState<boolean>(false);
    const [suggestVisible, setSuggestVisible] = useState<boolean>(true);
    const [searchType, setSearchType] = useState<SearchType>(
        (searchParams.get("searchType") as SearchType) || SearchType.Resource
    );
    const searchBoxRef = useRef<HTMLInputElement>(null);
    const fetcher = useFetcher<typeof action>();
    const data = useLoaderData<typeof loader>();

    const query = searchParams.get("q")?.trim();

    function search(query: string, page = 1, type = searchType) {
        setSuggestVisible(false);
        setSearchParams({
            q: query,
            searchType: String(type),
            page: String(page),
        });

        if (searchBoxRef.current) searchBoxRef.current.value = query;
    }

    function suggest(query: string) {
        setSuggestVisible(query.length > 0);
        fetcher.submit(
            {},
            {
                method: "POST",
                action: `?q=${query}`,
            }
        );
    }

    return (
        <div
            className={classFormat([
                "w-full h-full mt-20 lg:mt-0",
                !query && "grid place-content-center",
            ])}
        >
            <div className="min-w-0">
                <h1>您好！您想要找尋甚麼檔案？ </h1>
                <label className="input w-full rounded-full flex items-center gap-2 border-0 bg-neutral">
                    <MdSearch />
                    <input
                        ref={searchBoxRef}
                        defaultValue={query}
                        type="text"
                        className="grow"
                        onInput={(ele) => suggest(ele.currentTarget.value)}
                        onKeyUp={(ele) =>
                            ele.key === "Enter" &&
                            search(ele.currentTarget.value)
                        }
                    />
                </label>

                {fetcher.data && fetcher.data.length > 0 && suggestVisible && (
                    <div className="card bg-neutral p-5 mt-5">
                        <h2>搜尋建議</h2>
                        <div className="flex flex-row flex-wrap gap-2 w-fit max-w-full">
                            {fetcher.data.map((v) => (
                                <button
                                    className="badge badge-accent truncate justify-start overflow-hidden cursor-pointer"
                                    onClick={() => search(v.name)}
                                    key={"search:suggest:resource:" + v.id}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {query && data.resources.length === 0 && (
                    <div className="card bg-neutral p-5 mt-5">
                        <h2>找不到任何資源</h2>
                        <p className="mb-0">
                            抱歉！我們找不到任何符合您搜尋的資源。您可以試試看輸入更多關鍵字。
                        </p>
                    </div>
                )}

                {query && data.resources.length > 0 && (
                    <div>
                        <GridViewPanel
                            isGridView={gridView}
                            setGridView={setGridView}
                        />

                        <div
                            className={classFormat([
                                "grid gap-2 grid-cols-1",
                                gridView && "md:grid-cols-2 2xl:grid-cols-3",
                            ])}
                        >
                            {data.resources.map((resource) => {
                                return (
                                    <ResourceCardComponent
                                        key={
                                            "search:resource:card:" +
                                            resource.id
                                        }
                                        id={resource.id}
                                        tags={resource.tags || undefined}
                                        votes={{
                                            upvotes: resource.votes.up,
                                            downvotes: resource.votes.down,
                                        }}
                                        teacher={
                                            resource.course?.teacher || "N/A"
                                        }
                                        subject={resource.course?.name || "N/A"}
                                        title={resource.name}
                                        category={resource.category?.name}
                                    >
                                        {resource.description &&
                                        resource.description.length > 250
                                            ? resource.description.slice(
                                                  0,
                                                  250
                                              ) + "..."
                                            : resource.description}
                                    </ResourceCardComponent>
                                );
                            })}
                        </div>

                        <PageViewPanel
                            size={data.length}
                            currentPage={Number(searchParams.get("page") || 1)}
                            changePage={(page) => search(query, page)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
