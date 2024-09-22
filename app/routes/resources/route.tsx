import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { desc, eq, sql, sum } from "drizzle-orm";
import ResourceCardComponent from "./resource_card";
import db from "~/db/client.server";
import { pushOrDump, resources } from "~/db/schema";

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
        .leftJoin(mostPopular, eq(resources.id, mostPopular.resource));

    return json({
        resources: resourcesList,
        popularResources
    });
}

export default function ResourcesIndex() {
    return <ResourceCardComponent title="test" />;
}