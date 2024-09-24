import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { desc, eq, sql, sum } from "drizzle-orm";
import ResourceCardComponent from "~/components/resource_card";
import db from "~/db/client.server";
import { courses, pushOrDump, resources } from "~/db/schema";
import { classFormat } from "~/utils";

export async function loader() {
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
        popularResources
    });
}

export default function ResourcesFeatureIndex() {
    const data = useLoaderData<typeof loader>();

    return <div className="md:mr-5 h-full">
        <div>
            <h2 className="flex flex-row">
                前 5 名受歡迎的資源
            </h2>
            <div className="h-fit">
                {data.popularResources.map((resource, index) => {
                    return <div
                        key={"resource:popular:" + resource.resources.id}
                        className="">
                        <ResourceCardComponent
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
                        </ResourceCardComponent>
                    </div>;
                })}
            </div>
        </div>
    </div>
}