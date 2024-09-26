import { count, desc, eq, SQL, sql, sum } from "drizzle-orm";
import db from "~/db/client.server";
import {
  courses,
  pushOrDump,
  resourceCategory,
  resourceDownloaded,
  resources,
} from "~/db/schema";
import { SortBy } from "./resources_interface";
import { SubqueryWithSelection, MySqlColumn } from "drizzle-orm/mysql-core";
import { ResourceInterface } from "~/types/resource";

type SortByPopularity =
    | SubqueryWithSelection<
        {
            resource: MySqlColumn<
                {
                    name: "resource";
                    tableName: "pushOrDump";
                    dataType: "number";
                    columnType: "MySqlInt";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    generated: undefined;
                },
                object
            >;
            popularity: SQL.Aliased<string | null>;
        },
        "mostPopular"
        >
    | SubqueryWithSelection<
        {
            resource: MySqlColumn<
                {
                    name: "resource";
                    tableName: "resourceDownloaded";
                    dataType: "number";
                    columnType: "MySqlInt";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    generated: undefined;
                },
                object
            >;
            popularity: SQL.Aliased<number>;
        },
        "mostPopular"
    >;

async function sortByPopularity(popularity: SortByPopularity): Promise<ResourceInterface[]> {
    const pushOrDumps = await db
        .select({
            upvotes: sql`COUNT(CASE WHEN ${pushOrDump.isPush} > 0 THEN 1 END)`.mapWith(Number),
            downvotes: sql`COUNT(CASE WHEN ${pushOrDump.isPush} < 0 THEN 1 END)`.mapWith(Number),
            resource: pushOrDump.resource,
        })
        .from(pushOrDump)
        .leftJoin(popularity, eq(pushOrDump.resource, popularity.resource))
        .groupBy(pushOrDump.resource);

    // select most popular resources
    const popularResources = await db
        .select()
        .from(resources)
        .leftJoin(popularity, eq(resources.id, popularity.resource))
        .leftJoin(courses, eq(resources.courses, courses.id))
        .leftJoin(resourceCategory, eq(resourceCategory.id, resources.type));

    return popularResources.map((e) => ({
        id: e.resources.id,
        name: e.resources.name,
        description: e.resources.description,
        tags: e.resources.tags,
        upload_by: e.resources.upload_by,
        create_at: e.resources.create_at,
        state: e.resources.state,
        course: e.courses,
        votes: {
            up: pushOrDumps.find((v) => v.resource === e.resources.id)?.upvotes || 0,
            down: pushOrDumps.find((v) => v.resource === e.resources.id)?.downvotes || 0,
        },
        category: e.resourceCategory,
    }));
}

export async function sortByVotes(offset: number): Promise<ResourceInterface[]> {
    const mostPopular = db
        .select({
            resource: pushOrDump.resource,
            popularity: sum(pushOrDump.isPush).as("popularity"),
        })
        .from(pushOrDump)
        .groupBy(pushOrDump.resource)
        .orderBy(desc(sql`popularity`))
        .limit(20)
        .offset(offset)
        .as("mostPopular");

    return await sortByPopularity(mostPopular);
}

export async function sortByDownloads(offset: number): Promise<ResourceInterface[]> {
    const mostPopular = db
        .select({
            resource: resourceDownloaded.resource,
            popularity: count().as("popularity"),
        })
        .from(resourceDownloaded)
        .groupBy(resourceDownloaded.resource)
        .orderBy(desc(sql`popularity`))
        .limit(20)
        .offset(offset)
        .as("mostPopular");

    return await sortByPopularity(mostPopular);
}

export async function sortByDefault(mode: SortBy, offset: number): Promise<ResourceInterface[]> {
    const resource = await db.query.resources
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
            offset: sql.placeholder("offset"),
            orderBy: (v) => {
                switch (mode) {
                case SortBy.AZ:
                    return v.name;
                case SortBy.Time:
                default:
                    return desc(v.create_at);
                }
            },
            limit: 20,
        })
        .prepare()
        .execute({ offset });

    return resource.map((e) => ({
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
    }));
}
