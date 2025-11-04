import { ActionFunctionArgs } from "@remix-run/node";
import { sql } from "drizzle-orm";
import db from "~/db/client.server";
import { courses, resourceCategory } from "~/db/schema";

export async function loader() {
    const categories = await db
        .select({
            id: resourceCategory.id,
            name: resourceCategory.name,
        })
        .from(resourceCategory);

    return {
        category: categories
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query)
        return null;

    return await courseSuggestions(query);
}

async function courseSuggestions(query: string) {
    return await db
        .select({
            id: courses.id,
            name: courses.name,
            teacher: courses.teacher,
            display_id: courses.display_id
        })
        .from(courses)
        .where(sql`MATCH(${courses.name}, ${courses.teacher}, ${courses.display_id}) AGAINST(${sql.placeholder("query")} IN NATURAL LANGUAGE MODE)`)
        .limit(5)
        .prepare()
        .execute({
            query
        });
}
