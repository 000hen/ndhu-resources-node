import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { desc, eq, sql, sum } from "drizzle-orm";
import ResourceCardComponent from "./resource_card";
import db from "~/db/client.server";
import { courses, pushOrDump, resources } from "~/db/schema";
import { useLoaderData } from "@remix-run/react";
import { classFormat } from "~/utils";
import { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

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
    
    const mostPopular = db
        .select({
            resource: pushOrDump.resource,
            popularity: sum(pushOrDump.isPush).as("popularity")
        })
        .from(pushOrDump)
        .groupBy(pushOrDump.resource)
        .orderBy(desc(sql`popularity`))
        .limit(5)
        .as("mostPopular");
    
    // select most popular resources
    const popularResources = await db
        .select()
        .from(resources)
        .leftJoin(mostPopular, eq(resources.id, mostPopular.resource))
        .leftJoin(courses, eq(resources.courses, courses.id));

    return json({
        resources: resourcesList,
        popularResources
    });
}

export default function ResourcesIndex() {
    const data = useLoaderData<typeof loader>();
    const [showTop, setShowTop] = useState<boolean>(true);

    console.log(data);

    // TODO: add a sort option (by votes, by time, by name)
    // TODO: add a sort option (row or grid)

    return <div className="flex flex-col lg:flex-row">
        <div className="md:mr-5 h-full sticky top-0 z-10">
            <button
                onClick={() => setShowTop(true)}
                className={classFormat([
                    "tooltip text-3xl items-center ml-2 hidden",
                    !showTop && "lg:flex"
                ])}
                data-tip="開啟最受歡迎的資源">
                <MdKeyboardArrowRight className="inline" size={30} />
            </button>

            <div className={classFormat([
                showTop ? "block" : "lg:hidden",
            ])}>
                <h2 className="flex flex-row">
                    最受歡迎的資源
                    <button
                        onClick={() => setShowTop(false)}
                        className="tooltip text-3xl hidden items-center ml-2 lg:flex"
                        data-tip="收起最受歡迎的資源">
                        <MdKeyboardArrowLeft className="inline" size={30} />
                    </button>
                </h2>
                <div className="h-fit">
                    {data.popularResources.map((resource, index) => {
                        return <ResourceCardComponent
                            key={"resource:popular:" + resource.resources.id}
                            id={resource.resources.id}
                            title={resource.resources.name}
                            rank={index + 1}
                            tags={resource.resources.tags || undefined}
                            teacher={resource.courses?.teacher || "N/A"}
                            subject={resource.courses?.name || "N/A"}
                            tagsLimit
                            className={classFormat([
                                "shadow-2xl border-2",
                                index === 0 && "shadow-yellow-300  border-yellow-300",
                                index === 1 && "shadow-gray-300 border-gray-300",
                                index === 2 && "shadow-yellow-700 border-yellow-700",
                            ])}>
                            {resource.resources.description}
                        </ResourceCardComponent>;
                    })}
                </div>
            </div>
        </div>

        <div className="flex-auto mt-12 lg:mt-0 z-0">
            <h2>所有資源</h2>
            <div className="overflow-y-auto max-h-full">
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
        </div>
    </div>;
}