import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    redirect,
    TypedResponse,
} from "@remix-run/node";
import db from "~/db/client.server";
import invariant from "tiny-invariant";
import { ResourceInterface } from "~/types/resource";
import { and, eq, sql } from "drizzle-orm";
import {
    Link,
    useFetcher,
    useLoaderData,
    useMatches,
    useNavigate,
    useOutlet,
    useRouteLoaderData,
} from "@remix-run/react";
import { getResourceSignedUrl, getResourceSize } from "~/storage/aws.server";
import {
    MdCategory,
    MdClass,
    MdDownload,
    MdFlag,
    MdInsertDriveFile,
} from "react-icons/md";
import { downloadURI, humanFileSize, Premission } from "~/utils";
import { HashTagsFormat } from "~/components/resource_card";
import { FaUser } from "react-icons/fa";
import { loader as rootLoader } from "~/root";
import { getAuthInfoWithPremission } from "~/utils.server";
import { useEffect } from "react";
import { pushOrDump, resourceDownloaded, userFavorites } from "~/db/schema";
import VoteComponent from "./vote_button";
import FavoriteButtonComponent from "./favorite_button";
import { AlertBox } from "~/components/alert_box";

export async function loader({
    params,
    context,
    request,
}: LoaderFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });

    const { id } = params;
    invariant(id, "resource id is required");

    const resourceQuery = db.query.resources
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

    const userVoteQuery = auth.auth
        ? db.query.pushOrDump
              .findFirst({
                  columns: {
                      isPush: true,
                      author: true,
                  },
                  where: (v) =>
                      and(
                          eq(v.resource, sql.placeholder("resource")),
                          eq(v.author, sql.placeholder("author"))
                      ),
              })
              .prepare()
              .execute({
                  resource: Number(id),
                  author: auth.id,
              })
        : Promise.resolve(null);

    const userFavoriteQuery = auth.auth
        ? db.query.userFavorites
              .findFirst({
                  columns: {
                      resource: true,
                  },
                  where: (v) =>
                      and(
                          eq(v.resource, sql.placeholder("resource")),
                          eq(v.user, sql.placeholder("author"))
                      ),
              })
              .prepare()
              .execute({
                  resource: Number(id),
                  author: auth.id,
              })
        : Promise.resolve(null);

    const [resource, userVote, userFavorite] = await Promise.all([
        resourceQuery,
        userVoteQuery,
        userFavoriteQuery,
    ]);

    if (!resource) throw redirect("/resources");

    const attributes = await Promise.all([
        getResourceSize(resource.storageFilename),
    ]);

    return {
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
        isFavorite: !!userFavorite,
    };
}

enum ActionType {
    Download,
    Favorite,
}

export async function action({ request, context, params }: ActionFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth || (auth.premission || 0) < Premission.VerifiedUser)
        return null;

    const { id } = params;
    invariant(id, "resource id is required");

    if (["PUT", "DELETE"].includes(request.method))
        return actionUserVote(
            Number(id),
            auth.id,
            request.method === "PUT" ? 1 : -1
        );

    const form = await request.formData();
    const action = form.get("action");
    invariant(action, "action is required");
    const actionType = Number(action) as ActionType;

    if (actionType === ActionType.Download)
        return actionDownloadResource(Number(id), auth.id);

    if (actionType === ActionType.Favorite)
        return actionFavoriteResource(Number(id), auth.id);
}

async function actionFavoriteResource(id: number, user: string) {
    const isFavorite = await db.query.userFavorites
        .findFirst({
            columns: {
                resource: true,
            },
            where: (v) =>
                and(
                    eq(v.resource, sql.placeholder("resource")),
                    eq(v.user, sql.placeholder("author"))
                ),
        })
        .prepare()
        .execute({
            resource: id,
            author: user,
        });

    if (isFavorite) {
        await db
            .delete(userFavorites)
            .where(
                and(
                    eq(userFavorites.resource, sql.placeholder("resource")),
                    eq(userFavorites.user, sql.placeholder("author"))
                )
            )
            .prepare()
            .execute({
                resource: id,
                author: user,
            });

        return null;
    }

    await db
        .insert(userFavorites)
        .values({
            resource: sql.placeholder("resource"),
            user: sql.placeholder("author"),
        })
        .prepare()
        .execute({
            resource: id,
            author: user,
        });

    return null;
}

async function actionDownloadResource(id: number, user: string) {
    const resource = await db.query.resources
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
            id: id,
        });

    if (!resource || resource.state !== "approved") return null;

    await db
        .insert(resourceDownloaded)
        .values({
            resource: sql.placeholder("resource"),
            author: sql.placeholder("author"),
        })
        .prepare()
        .execute({
            resource: Number(id),
            author: user,
        });

    return {
        storage: await getResourceSignedUrl(
            resource.storageFilename,
            resource.filename
        ),
    };
}

async function actionUserVote(resource: number, user: string, type: number) {
    const isUserVoted = await db.query.pushOrDump
        .findFirst({
            columns: {
                isPush: true,
            },
            where: (v) =>
                and(
                    eq(v.resource, sql.placeholder("resource")),
                    eq(v.author, sql.placeholder("author"))
                ),
        })
        .prepare()
        .execute({
            resource,
            author: user,
        });

    if (isUserVoted) {
        await db
            .delete(pushOrDump)
            .where(
                and(
                    eq(pushOrDump.resource, sql.placeholder("resource")),
                    eq(pushOrDump.author, sql.placeholder("author"))
                )
            )
            .prepare()
            .execute({
                resource,
                author: user,
            });
    }

    await db
        .insert(pushOrDump)
        .values({
            resource: sql.placeholder("resource"),
            author: sql.placeholder("author"),
            isPush: sql.placeholder("isPush"),
        })
        .prepare()
        .execute({
            resource,
            author: user,
            isPush: type,
        });

    return null;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: `${data?.name} - 東華資源庫` },
        { name: "description", content: data?.description },
    ];
};

export default function ResourcePage() {
    const data = useLoaderData<typeof loader>();
    const matches = useMatches();
    const parentData = useRouteLoaderData<typeof rootLoader>("root");
    const navigate = useNavigate();
    const outlet = useOutlet();
    const fetcher = useFetcher<typeof action>();

    useEffect(() => {
        if (fetcher.state === "idle") {
            if (fetcher.data) {
                downloadURI(fetcher.data.storage);
            }
        }
    }, [fetcher.data, fetcher.state]);

    function doAction(action: ActionType) {
        fetcher.submit(
            { action },
            {
                method: "post",
            }
        );
    }

    function vote(type: number) {
        if (!parentData?.auth) return;

        fetcher.submit(
            {},
            {
                method: type === 1 ? "put" : "delete",
            }
        );
    }

    return (
        <div className="max-w-full">
            <div className="flex flex-col-reverse md:flex-row">
                <div className="flex flex-row md:flex-col min-h-full mt-2 md:mr-2 md:mt-0">
                    <Link
                        to={"report"}
                        className="card btn btn-neutral shadow-xl h-full md:h-fit mr-2 md:mr-0 md:mb-2 p-5 tooltip"
                        data-tip="檢舉資源濫用"
                    >
                        <MdFlag size={32} />
                    </Link>
                    <VoteComponent
                        voteup={data.votes.up}
                        votedown={data.votes.down}
                        userVote={data.user_vote || 0}
                        vote={vote}
                        isAuth={!!parentData?.auth}
                    />
                </div>
                <div className="card shadow-xl bg-neutral flex-auto">
                    <div className="p-5 2xl:p-10">
                        <div className="">
                            <div>
                                <FavoriteButtonComponent
                                    isFavorite={data.isFavorite}
                                    onClick={() =>
                                        doAction(ActionType.Favorite)
                                    }
                                />

                                <h1 className="text-4xl 2xl:text-6xl break-all">
                                    {data.name}
                                </h1>
                                <HashTagsFormat tags={data.tags || undefined} />
                                <div className="mt-5 grid gap-2">
                                    {data.course && (
                                        <>
                                            <div>
                                                <FaUser className="inline" />{" "}
                                                {data.course?.teacher}
                                            </div>
                                            <div>
                                                <MdClass className="inline" />{" "}
                                                {data.course?.name} (
                                                {data.course?.display_id})
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <MdCategory className="inline" />{" "}
                                        {data.category?.name}
                                    </div>
                                    <div className="break-all">
                                        <MdInsertDriveFile className="inline" />{" "}
                                        {data.filename}
                                    </div>
                                    <div>
                                        <MdDownload className="inline" />{" "}
                                        {humanFileSize(data.size)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 min-w-max">
                                {(data.state == "pending" ||
                                    data.state == "uploading") && (
                                    <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">
                                        檔案正在審核中，暫時不開放下載
                                    </button>
                                )}
                                {data.state == "rejected" && (
                                    <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">
                                        檔案已被拒絕，您無法下載
                                    </button>
                                )}
                                {data.state == "DMCA takedown" && (
                                    <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">
                                        因版權問題已被下架，您無法下載
                                    </button>
                                )}
                                {data.state == "approved" && (
                                    <>
                                        {!parentData?.auth && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/login?return=" +
                                                            encodeURIComponent(
                                                                location.pathname
                                                            )
                                                    )
                                                }
                                                className="btn lg:min-w-60 w-full xl:w-40"
                                            >
                                                請先登入至東華資源庫
                                            </button>
                                        )}
                                        {parentData?.auth && (
                                            <>
                                                {(parentData.premission || 0) >=
                                                Premission.VerifiedUser ? (
                                                    <button
                                                        onClick={() =>
                                                            doAction(
                                                                ActionType.Download
                                                            )
                                                        }
                                                        className="btn btn-success lg:min-w-60 w-full xl:w-40"
                                                    >
                                                        <MdDownload size={16} />
                                                        下載
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">
                                                        抱歉！您的權限不足，無法下載！
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="divider w-full h-1"></div>

            <p>{data.description}</p>

            {outlet && (
                <AlertBox
                    onClose={() => navigate(matches.at(-2)?.pathname || "#")}
                >
                    {outlet}
                </AlertBox>
            )}
        </div>
    );
}
