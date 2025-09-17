import { count, desc, eq, SQL, sql, sum } from "drizzle-orm";
import db from "~/db/client.server";
import {
    courses,
    pushOrDump,
    resourceCategory,
    resourceDownloaded,
    resources,
    userFavorites,
} from "~/db/schema";
import { SortBy } from "./resources_interface";
import { SubqueryWithSelection } from "drizzle-orm/mysql-core";
import { ResourceInterface } from "~/types/resource";

type SortByPopularity = SubqueryWithSelection<
    {
        resource: typeof pushOrDump.resource;
        popularity: SQL.Aliased<number>;
    },
    "mostPopular"
>;

async function sortByPopularity(
    popularity: SortByPopularity
): Promise<ResourceInterface[]> {
    const start = performance.now();
    const result = await db
        .select({
            id: resources.id,
            name: resources.name,
            description: resources.description,
            tags: resources.tags,
            upload_by: resources.upload_by,
            create_at: resources.create_at,
            state: resources.state,
            filename: resources.filename,
            course: courses,
            category: resourceCategory,
            upvotes:
                sql`SUM(CASE WHEN ${pushOrDump.isPush} > 0 THEN 1 ELSE 0 END)`.mapWith(
                    Number
                ),
            downvotes:
                sql`SUM(CASE WHEN ${pushOrDump.isPush} < 0 THEN 1 ELSE 0 END)`.mapWith(
                    Number
                ),
        })
        .from(resources)
        .leftJoin(popularity, eq(resources.id, popularity.resource))
        .leftJoin(courses, eq(resources.courses, courses.id))
        .leftJoin(resourceCategory, eq(resources.type, resourceCategory.id))
        .leftJoin(pushOrDump, eq(resources.id, pushOrDump.resource))
        .groupBy(resources.id, courses.id, resourceCategory.id)
        .orderBy(desc(popularity.popularity));
    const end = performance.now();
    console.log(`sortByPopularity query took ${end - start}ms`);

    return result.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        tags: e.tags,
        upload_by: e.upload_by,
        create_at: e.create_at,
        state: e.state,
        filename: e.filename,
        course: e.course,
        category: e.category,
        votes: {
            up: e.upvotes,
            down: e.downvotes,
        },
    }));
}

function makePopularityQuery(
    source:
        | typeof pushOrDump
        | typeof resourceDownloaded
        | typeof userFavorites,
    popularityExpr: SQL.Aliased<number>,
    offset: number
) {
    return db
        .select({
            resource: source.resource,
            popularity: popularityExpr,
        })
        .from(source)
        .groupBy(source.resource)
        .orderBy(desc(sql`popularity`))
        .limit(20)
        .offset(offset)
        .as("mostPopular");
}

export async function sortByVotes(offset: number) {
    const mostPopular = makePopularityQuery(
        pushOrDump,
        sum(pushOrDump.isPush).mapWith(Number).as("popularity"),
        offset
    );
    return await sortByPopularity(mostPopular);
}

export async function sortByDownloads(offset: number) {
    const mostPopular = makePopularityQuery(
        resourceDownloaded,
        count().as("popularity"),
        offset
    );
    return await sortByPopularity(mostPopular);
}

export async function sortByFavorite(offset: number) {
    const mostPopular = makePopularityQuery(
        userFavorites,
        count().as("popularity"),
        offset
    );
    return await sortByPopularity(mostPopular);
}

export async function sortByDefault(
    mode: SortBy,
    offset: number
): Promise<ResourceInterface[]> {
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
        filename: e.filename,
        votes: {
            up: e.pushOrDump.filter((v) => v.isPush > 0).length,
            down: e.pushOrDump.filter((v) => v.isPush < 0).length,
        },
        category: e.category,
    }));
}
