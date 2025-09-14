import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getAuthInfo, redirectToLogin } from "~/utils.server";
import db from "~/db/client.server";
import { count, desc, eq, sql } from "drizzle-orm";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { classFormat } from "~/utils";
import { useState } from "react";
import ResourceCardComponent from "~/components/resource_card";
import GridViewPanel from "~/components/grid_view_panel";
import PageViewPanel from "~/components/page_view_panel";
import { userFavorites } from "~/db/schema";

export const meta: MetaFunction = () => {
    return [
        { title: "收藏的資源 - 東華資源庫" },
        { name: "description", content: "查看您於東華資源庫收藏的資源。" },
    ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfo({ request, context });
    if (!auth.auth) return redirectToLogin(request);

    const requestQuery = new URL(request.url).searchParams;
    const offset = Number(requestQuery.get("page") || 1) * 20 - 20;

    const favoritesLength = await db
        .select({
            count: count()
        })
        .from(userFavorites)
        .where(eq(userFavorites.user, sql.placeholder("id")))
        .prepare()
        .execute({
            id: auth.id,
        });
    
    const favorites = await db.query.userFavorites
        .findMany({
            with: {
                resource: {
                    columns: {
                        id: true,
                        name: true,
                        description: true,
                        tags: true,
                        state: true,
                        create_at: true,
                    },
                    with: {
                        course: true,
                        category: true,
                        pushOrDump: true,
                    },
                },
            },
            where: (v) => eq(v.user, sql.placeholder("id")),
            orderBy: (v) => desc(v.create_at),
            limit: 20,
            offset: sql.placeholder("offset"),
        })
        .prepare()
        .execute({
            id: auth.id,
            offset: offset,
        });

    return json({
        size: favoritesLength[0].count,
        favorites: favorites.map((e) => ({
            id: e.resource.id,
            name: e.resource.name,
            description: e.resource.description,
            tags: e.resource.tags,
            create_at: e.resource.create_at,
            state: e.resource.state,
            course: e.resource.course,
            votes: {
                up: e.resource.pushOrDump.filter((v) => v.isPush > 0).length,
                down: e.resource.pushOrDump.filter((v) => v.isPush < 0).length,
            },
            category: e.resource.category,
        })),
    });
}

export default function FavoritePage() {
    const data = useLoaderData<typeof loader>();
    const [gridView, setGridView] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page") || 1);

    function changePage(page: number) {
        const params = searchParams;
        params.set("page", String(page));
        setSearchParams(params);
    }

    return (
        <div>
            <GridViewPanel isGridView={gridView} setGridView={setGridView} />

            <div
                className={classFormat([
                    "grid gap-2 grid-cols-1",
                    gridView && "md:grid-cols-2 2xl:grid-cols-3",
                ])}
            >
                {data.favorites.map((favorite) => {
                    return (
                        <ResourceCardComponent
                            key={"resource:fav:card:" + favorite.id}
                            id={favorite.id}
                            tags={favorite.tags || undefined}
                            votes={{
                                upvotes: favorite.votes.up,
                                downvotes: favorite.votes.down,
                            }}
                            teacher={favorite.course?.teacher || "N/A"}
                            subject={favorite.course?.name || "N/A"}
                            title={favorite.name}
                            category={favorite.category?.name}
                        >
                            {favorite.description &&
                            favorite.description.length > 250
                                ? favorite.description.slice(0, 250) + "..."
                                : favorite.description}
                        </ResourceCardComponent>
                    );
                })}
            </div>

            <PageViewPanel
                size={data.size}
                currentPage={currentPage}
                changePage={changePage}
            />
        </div>
    );
}
