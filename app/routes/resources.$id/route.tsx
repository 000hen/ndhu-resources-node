import { json, LoaderFunctionArgs, MetaFunction, redirect, TypedResponse } from "@remix-run/node";
import db from "~/db/client.server";
import invariant from "tiny-invariant";
import { ResourceInterface } from "~/types/resource";
import { eq } from "drizzle-orm";
import { useFetcher, useLoaderData, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { getResourceSignedUrl, getResourceSize } from "~/storage/aws.server";
import { MdCategory, MdClass, MdDownload, MdInsertDriveFile } from "react-icons/md";
import { downloadURI, humanFileSize, Premission } from "~/utils";
import { HashTagsFormat } from "~/components/resource_card";
import { FaUser } from "react-icons/fa";
import { loader as rootLoader } from "~/root";
import { getAuthInfoWithPremission } from "~/utils.server";
import { useEffect } from "react";

interface ResourceDownloadInterface extends ResourceInterface {
    size: number;
    filename: string;
}

export async function loader({ params }: LoaderFunctionArgs): Promise<TypedResponse<ResourceDownloadInterface>> {
    const { id } = params;
    invariant(id, "resource id is required");

    const resource = await db
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
            where: (v) => eq(v.id, Number(id)),
        })
        .prepare()
        .execute();
    
    if (!resource)
        return redirect("/resources");

    const attributes = await Promise.all([
        getResourceSize(resource.storageFilename),
    ]);
    
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
    });
}

export async function action({ request, context, params }: LoaderFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth || (auth.premission || 0) < Premission.VerifiedUser)
        return null;

    const { id } = params;
    invariant(id, "resource id is required");

    const resource = await db
        .query
        .resources
        .findFirst({
            columns: {
                storageFilename: true,
                filename: true,
            },
            where: (v) => eq(v.id, Number(id)),
        })
        .prepare()
        .execute();
    
    if (!resource)
        return null;

    return json({ storage: await getResourceSignedUrl(resource.storageFilename, resource.filename) });
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
        fetcher.submit(location.pathname, {
            method: "post"
        });
    }

    return <div className="max-w-full">
        <div className="card shadow-xl bg-neutral max-w-full">
            <div className="p-5 2xl:p-10">
                <div className="">
                    <div>
                        <h1 className="text-4xl 2xl:text-6xl break-all max-w-full">{data.name}</h1>
                        <HashTagsFormat tags={data.tags || undefined} />
                        <div className="mt-5">
                            {data.course && <>
                                <div><FaUser className="inline" /> {data.course?.teacher}</div>
                                <div><MdClass className="inline" /> {data.course?.name} ({data.course?.display_id})</div>
                            </>}
                            <div><MdCategory className="inline" /> {data.category?.name}</div>
                            <div><MdInsertDriveFile className="inline" /> {data.filename}</div>
                            <div><MdDownload className="inline" /> {humanFileSize(data.size)}</div>
                        </div>
                    </div>
                    <div className="mt-5 min-w-max">
                        {!parentData?.auth
                            && <button
                                onClick={() => navigate("/login?return=" + encodeURIComponent(location.pathname))}
                                className="btn lg:min-w-60 w-full xl:w-40">
                                請先登入至東華資源庫
                            </button>}
                        {parentData?.auth
                            && (parentData.premission || 0) >= Premission.VerifiedUser
                            ? <button onClick={downloadFile} className="btn btn-primary lg:min-w-60 w-full xl:w-40"><MdDownload size={16} />下載</button>
                            : <button className="btn btn-disabled lg:min-w-60 w-full xl:w-40">抱歉！您的權限不足，無法下載！</button>}
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