import {
    ActionFunctionArgs,
    isRouteErrorResponse,
    redirect,
    useFetcher,
    useRouteError,
    useRouteLoaderData,
} from "react-router";
import { useOverflowHidden } from "~/hooks/overflowhidden";
import { loader as rootLoader } from "~/root";
import { loader as resourceLoader } from "../resources.$id/route";
import { isInState, Premission } from "~/utils";
import RequiredSign from "~/components/reqired_sign";
import { getAuthInfoWithPremission } from "~/utils.server";
import db from "~/db/client.server";
import { resources } from "~/db/schema";
import invariant from "tiny-invariant";
import { eq } from "drizzle-orm";

export async function action({ request, context, params }: ActionFunctionArgs) {
    const form = await request.formData();
    const auth = await getAuthInfoWithPremission({ request, context });
    const { id } = params;
    invariant(id, "Resource ID is required");

    if (!auth.auth || auth.premission! < Premission.VerifiedUser) {
        throw new Response("You don't have permission to do this action.", {
            status: 403,
        });
    }

    const resourceId = Number(id);
    const defaultData = await db.query.resources.findFirst({
        where: (e) => eq(e.id, resourceId),
    });

    if (!defaultData) {
        throw new Response("Resource not found.", { status: 404 });
    }

    if (
        defaultData.upload_by !== auth.id &&
        auth.premission! < Premission.Editor
    ) {
        throw new Response("You don't have permission to edit this resource.", {
            status: 403,
        });
    }

    if (
        defaultData.state === "DMCA takedown" &&
        auth.premission! < Premission.Editor
    ) {
        throw new Response(
            "This resource is under DMCA takedown. You don't have any permission to change the data",
            {
                status: 403,
            }
        );
    }

    const title = (form.get("title") as string)?.trim();
    const description = (form.get("description") as string)?.trim();
    const tagsInput = (form.get("tags") as string) || "";
    const state = form.get("state") as string | null;

    if (!title || title.length === 0 || title.length > 255) {
        throw new Response("Invalid title length.", { status: 400 });
    }

    if (!description || description.length === 0 || description.length > 5000) {
        throw new Response("Invalid description length.", { status: 400 });
    }

    const tags = tagsInput.split(",").map((e) => e.trim());

    if (state) {
        if (auth.premission! < Premission.Editor) {
            throw new Response("You don't have permission to change state.", {
                status: 403,
            });
        }

        if (!isInState(state)) {
            throw new Response("Invalid state value.", { status: 400 });
        }

        await db
            .update(resources)
            .set({ state: state })
            .where(eq(resources.id, resourceId))
            .execute();
    }

    await db
        .update(resources)
        .set({
            name: title,
            description: description,
            tags: tags.length > 0 ? tags : defaultData.tags,
        })
        .where(eq(resources.id, resourceId))
        .execute();

    return null;
}

export default function ResourceEditIndex() {
    const fetcher = useFetcher<typeof action>();
    const resourceInfo = useRouteLoaderData<typeof resourceLoader>(
        "routes/resources.$id"
    );
    const parentData = useRouteLoaderData<typeof rootLoader>("root");

    useOverflowHidden();

    return (
        <fetcher.Form method="post" className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-6">編輯資源</h1>
            </div>

            <div>
                <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2"
                >
                    標題 <RequiredSign />
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="input w-full"
                    defaultValue={resourceInfo?.name}
                />
            </div>

            <div>
                <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2"
                >
                    描述 <RequiredSign />
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="textarea w-full"
                    defaultValue={resourceInfo?.description ?? ""}
                />
            </div>

            <div>
                <label
                    htmlFor="tags"
                    className="block text-sm font-medium mb-2"
                >
                    標籤
                </label>
                <input
                    type="text"
                    id="tags"
                    name="tags"
                    placeholder="以逗號分隔"
                    className="input w-full"
                    defaultValue={resourceInfo?.tags?.join(",")}
                />
            </div>

            {(parentData?.premission ?? 0) >= Premission.Editor && (
                <div className="bg-base-300 p-4 rounded-lg">
                    <h2 className="text-lg font-bold mb-4">管理員選項</h2>
                    <label
                        htmlFor="state"
                        className="block text-sm font-medium mb-2"
                    >
                        狀態 <RequiredSign />
                    </label>
                    <select
                        id="state"
                        name="state"
                        className="select w-full"
                        defaultValue={resourceInfo?.state}
                    >
                        <option value="pending">待審核</option>
                        <option value="approved">已批准</option>
                        <option value="rejected">已拒絕</option>
                        <option value="DMCA takedown">DMCA 下架</option>
                    </select>
                </div>
            )}

            <div className="divider"></div>
            <button
                type="submit"
                disabled={fetcher.state !== "idle"}
                className="btn btn-primary w-full"
            >
                {fetcher.state !== "idle" ? "儲存中..." : "儲存"}
            </button>
        </fetcher.Form>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">發生錯誤</h1>
            <pre className="whitespace-pre-wrap">
                {isRouteErrorResponse(error)
                    ? `錯誤 ${error.status}: ${error.data}`
                    : error instanceof Error
                      ? error.message
                      : String(error)}
            </pre>
        </div>
    );
}
