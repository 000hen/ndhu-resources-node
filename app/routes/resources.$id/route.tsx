import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect, TypedResponse } from "@remix-run/node";
import db from "~/db/client.server";
import invariant from "tiny-invariant";
import { ResourceInterface } from "~/types/resource";
import { and, eq, sql } from "drizzle-orm";
import { useFetcher, useLoaderData, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { getResourceSignedUrl, getResourceSize } from "~/storage/aws.server";
import { MdArrowDownward, MdArrowUpward, MdCategory, MdClass, MdDownload, MdFlag, MdInsertDriveFile } from "react-icons/md";
import { downloadURI, humanFileSize, numberFormat, Premission } from "~/utils";
import { HashTagsFormat } from "~/components/resource_card";
import { FaUser } from "react-icons/fa";
import { loader as rootLoader } from "~/root";
import { getAuthInfoWithPremission } from "~/utils.server";
import { useEffect } from "react";
import { pushOrDump, resourceDownloaded } from "~/db/schema";
import VoteButton from "./vote_button";

interface ResourceDownloadInterface extends ResourceInterface {
    size: number;
    filename: string;
    user_vote: number | null;
}

export async function loader({ params, context, request }: LoaderFunctionArgs): Promise<TypedResponse<ResourceDownloadInterface>> {
    const auth = await getAuthInfoWithPremission({ request, context });

    const { id } = params;
    invariant(id, "resource id is required");

    const resourceQuery = db
        .query
        .resources
        .findFirst({
            with: {
                course: true,
                pushOrDump: {
                    columns: {
                        isPush: true,
                    },
                },
                category: true,
            },
            where: (v) => eq(v.id, sql.placeholder("id")),
        })
        .prepare()
        .execute({
            id: Number(id),
        });
    
    const userVoteQuery = db
        .query
        .pushOrDump
        .findFirst({
            columns: {
                isPush: true,
                author: true,
            },
            where: (v) => and(eq(v.resource, sql.placeholder("resource")),
                eq(v.author, sql.placeholder("author"))),
        })
        .prepare()
        .execute({
            resource: Number(id),
            author: auth.id || "",
        });
    
    const [resource, userVote] = await Promise.all([resourceQuery, userVoteQuery]);
    
    if (!resource)
        return redirect("/resources");

    const attributes = await Promise.all([
        getResourceSize(resource.storageFilename),
    ]);

    console.log(resource, userVote);
    
    return json({
        id: resource.id,
        name: resource.name,
        description: resource.description,
        tags: resource.tags,
        upload_by: resource.upload_by,
        create_at: resource.create_at,
        state: resource.state,
        course: resource.course,
        votes: {
            up: resource.pushOrDump.filter((v) => v.isPush > 0).length,
            down: resource.pushOrDump.filter((v) => v.isPush < 0).length,
        },
        category: resource.category,
        filename: resource.filename,

        // Storage Data
        size: attributes[0],
        user_vote: userVote?.isPush || null,
    });
}

export async function action({ request, context, params }: ActionFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth || !auth.id || (auth.premission || 0) < Premission.VerifiedUser)
        return null;

    const { id } = params;
    invariant(id, "resource id is required");

    if (request.method == "PUT")
        return actionUserPush(Number(id), auth.id);

    if (request.method == "DELETE")
        return actionUserDump(Number(id), auth.id);

    const resource = await db
        .query
        .resources
        .findFirst({
            columns: {
                storageFilename: true,
                filename: true,
                state: true,
            },
            where: (v) => eq(v.id, sql.placeholder("id")),
        })
        .prepare()
        .execute({
            id: Number(id),
        });
    
    if (!resource || resource.state !== "approved")
        return null;

    await db
        .insert(resourceDownloaded)
        .values({
            resource: sql.placeholder("resource"),
            author: sql.placeholder("author"),
        })
        .prepare()
        .execute({
            resource: Number(id),
            author: auth.id,
        });

    return json({ storage: await getResourceSignedUrl(resource.storageFilename, resource.filename) });
}

async function actionUserVote(resource: number, user: string, type: number) {
    const isUserVoted = await db
        .query
        .pushOrDump
        .findFirst({
            columns: {
                isPush: true,
            },
            where: (v) => and(eq(v.resource, sql.placeholder("resource")), eq(v.author, sql.placeholder("author"))),
        })
        .prepare()
        .execute({
            resource,
            author: user
        });
    
    if (isUserVoted) {
        await db
            .delete(pushOrDump)
            .where(and(eq(pushOrDump.resource, sql.placeholder("resource")), eq(pushOrDump.author, sql.placeholder("author"))))
            .prepare()
            .execute({
                resource,
                author: user,
            });
    }

    await db.insert(pushOrDump).values({
        resource: sql.placeholder("resource"),
        author: sql.placeholder("author"),
        isPush: sql.placeholder("isPush"),
    })
        .prepare()
        .execute({
            resource,
            author: user,
            isPush: type
        });

    return null;
}

async function actionUserPush(resource: number, user: string) {
    return actionUserVote(resource, user, 1);
}

async function actionUserDump(resource: number, user: string) {
    return actionUserVote(resource, user, -1);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: `${data?.name} - 東華資源庫` },
        { name: "description", content: data?.description },
    ];
};

export default function ResourcePage() {
    const data = useLoaderData<typeof loader>();
    const parentData = useRouteLoaderData<typeof rootLoader>("root");
    const navigate = useNavigate();
    const fetcher = useFetcher<typeof action>();

    useEffect(() => {
        if (fetcher.state === "idle") {
            if (fetcher.data) {
                downloadURI(fetcher.data.storage);
            }
        }
    }, [fetcher.data, fetcher.state]);

    function downloadFile() {
        fetcher.submit({}, {
            method: "post"
        });
    }

    function vote(type: number) {
        if (!parentData?.auth)
            return;

        fetcher.submit({}, {
            method: type === 1 ? "put" : "delete",
        });
    }

    return <div className="max-w-full">
        <div className="flex flex-col-reverse md:flex-row">
            <div className="flex flex-row md:flex-col min-h-full mt-2 md:mr-2 md:mt-0">
                <button className="card btn btn-neutral h-full md:h-fit mr-2 md:mr-0 md:mb-2 p-5 tooltip" data-tip="檢舉資源濫用"><MdFlag size={32} /></button>
                <div className="card shadow-xl bg-neutral min-w-fit flex-auto">
                    <div className="py-2 md:py-5 px-5 md:px-2 h-full">
                        <div className="flex md:flex-col h-full justify-between w-full items-center">
                            <VoteButton
                                icon={MdArrowUpward}
                                onClick={() => vote(1)}
                                isVoted={data?.user_vote === 1}
                                votedMessage={"您已推薦過此資源"}
                                unvotedMessage={parentData?.auth ? "推薦此資源" : "登入以對此資源評價"} />
                            
                            <div className="grid place-content-center">
                                {numberFormat(data.votes.up - data.votes.down)}
                            </div>

                            <VoteButton
                                icon={MdArrowDownward}
                                onClick={() => vote(-1)}
                                isVoted={data?.user_vote === -1}
                                votedMessage={"您已踩過此資源"}
                                unvotedMessage={parentData?.auth ? "踩此資源" : "登入以對此資源評價"} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card shadow-xl bg-neutral flex-auto">
                <div className="p-5 2xl:p-10">
                    <div className="">
                        <div>
                            <h1 className="text-4xl 2xl:text-6xl break-all max-w-full">{data.name}</h1>
                            <HashTagsFormat tags={data.tags || undefined} />
                            <div className="mt-5 grid gap-2">
                                {data.course && <>
                                    <div><FaUser className="inline" /> {data.course?.teacher}</div>
                                    <div><MdClass className="inline" /> {data.course?.name} ({data.course?.display_id})</div>
                                </>}
                                <div><MdCategory className="inline" /> {data.category?.name}</div>
                                <div className="break-all"><MdInsertDriveFile className="inline" /> {data.filename}</div>
                                <div><MdDownload className="inline" /> {humanFileSize(data.size)}</div>
                            </div>
                        </div>
                        <div className="mt-5 min-w-max">
                            {data.state == "pending" && <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">檔案正在審核中，暫時不開放下載</button>}
                            {data.state == "rejected" && <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">檔案已被拒絕，您無法下載</button>}
                            {data.state == "DMCA takedown" && <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">因版權問題已被下架，您無法下載</button>}
                            {data.state == "approved" && <>
                                {!parentData?.auth
                                    && <button
                                        onClick={() => navigate("/login?return=" + encodeURIComponent(location.pathname))}
                                        className="btn lg:min-w-60 w-full xl:w-40">
                                        請先登入至東華資源庫
                                    </button>}
                                {parentData?.auth && <>
                                        {(parentData.premission || 0) >= Premission.VerifiedUser
                                        ? <button onClick={downloadFile} className="btn btn-primary lg:min-w-60 w-full xl:w-40"><MdDownload size={16} />下載</button>
                                        : <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">抱歉！您的權限不足，無法下載！</button>}
                                </>}
                            </>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="divider w-full h-1"></div>

        <p>
            {data.description}
        </p>
    </div>;
}