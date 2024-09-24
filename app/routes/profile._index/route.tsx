import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { eq, sql } from "drizzle-orm";
import { MdEdit, MdLocalPolice, MdLogout, MdStorage, MdThumbDown, MdThumbUp, MdVerified } from "react-icons/md";
import CardComponent from "~/components/card";
import IconBadgeComponent from "./icon_badge";
import NumberCardFormatComponent from "~/components/number_card_format";
import db from "~/db/client.server";
import { checkIsNDHU, googleImageResize, Premission } from "~/utils";
import { getAuthInfo } from "~/utils.server";

export const meta: MetaFunction = () => {
    return [
        { title: "個人頁面 - 東華資源庫" },
        { name: "description", content: "查看您於東華資源庫的個人資料頁面。" },
    ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfo({ request, context });
    const user = await db
        .query
        .premissions
        .findFirst({
            with: {
                resources: {
                    with: {
                        course: true
                    }
                },
                comments: true,
                pushOrDump: true
            },
            where: (v) => eq(v.user_id, sql.placeholder("id")),
        })
        .prepare()
        .execute({
            id: auth.id || ""
        });

    return json({
        ...auth,
        ...user
    })
}

export default function ProfileIndex() {
    const data = useLoaderData<typeof loader>();
    const premissions = data.premission || 0;

    const profileImage = googleImageResize(data.profile || "", 128);

    return <div>
        <CardComponent title="🥳 很高興見到您！">
            <div className="flex m-5 justify-center">
                <div className="px-5 grid place-content-center">
                    <img referrerPolicy="no-referrer" alt="Profile" title={`登入為 ${data.display}`} className="min-w-16 md:w-32 rounded-full" src={profileImage} />
                </div>
                <div className="flex-auto ml-5">
                    <div className="flex flex-col lg:flex-row justify-center items-start lg:items-center lg:justify-between h-full">
                        <div>
                            <h1 className="flex flex-col lg:flex-row lg:items-center mb-0 text-4xl lg:text-6xl">
                                {data.display}
                                
                                <div>
                                    {checkIsNDHU(data.email || "@") && premissions >= Premission.VerifiedUser
                                        && <IconBadgeComponent
                                        icon={MdVerified}
                                        className="text-success">
                                        您使用東華大學之 Google 帳戶且已驗證 Email
                                        </IconBadgeComponent>}

                                    {premissions >= Premission.Editor && <IconBadgeComponent
                                        icon={MdEdit}
                                        className="text-info">
                                        您具有版主權限
                                    </IconBadgeComponent>}

                                    {premissions >= Premission.Admin && <IconBadgeComponent
                                        icon={MdLocalPolice}
                                        className="text-error">
                                        您是東華資源庫的管理員
                                    </IconBadgeComponent>}
                                </div>
                            </h1>
                            <span className="block mt-2 italic text-gray-500">{data.email}</span>
                        </div>
                        <div>
                            <div className="tooltip" data-tip="登出">
                                <Link to={"/logout"} className="btn btn-error mt-2 lg:mt-0"><MdLogout size={24} /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CardComponent>

        <div className="md:grid grid-cols-2">
            <CardComponent title="您貢獻的資源數">
                <NumberCardFormatComponent bold amount={data.resources?.length || 0} format="項" />
                <Link to="resources" className="btn btn-outline mt-2"><MdStorage /> 查看您創建的資源</Link>
            </CardComponent>
            <CardComponent title="已審核成功的資源">
                <NumberCardFormatComponent bold amount={data.resources?.filter(e => e.state === "approved").length || 0} format="項" />
                <Link to="resources/accept" className="btn btn-outline mt-2"><MdStorage /> 查看已審核成功的資源</Link>
            </CardComponent>
            <CardComponent title="您推過的資源">
                <NumberCardFormatComponent bold amount={data.pushOrDump?.filter(e => e.isPush).length || 0} format="項" />
                <Link to="resources/push" className="btn btn-outline m-2"><MdThumbUp /> 查看您推薦過的資源</Link>
            </CardComponent>
            <CardComponent title="您踩過的資源">
                <NumberCardFormatComponent bold amount={data.pushOrDump?.filter(e => !e.isPush).length || 0} format="項" />
                <Link to="resources/dump" className="btn btn-outline m-2"><MdThumbDown /> 查看您不推薦的資源</Link>
            </CardComponent>
            <CardComponent title="您做出的評論">
                <NumberCardFormatComponent bold amount={data.comments?.length || 0} format="項" />
                <Link to="resources/comment" className="btn btn-outline m-2"><MdStorage /> 查看您留言過的資源</Link>
            </CardComponent>
        </div>
    </div>;
}