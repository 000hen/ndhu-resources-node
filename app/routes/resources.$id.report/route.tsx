import { ActionFunctionArgs, useFetcher, useNavigate, useRouteLoaderData } from "react-router";
import { PropsWithChildren } from "react";
import { ReportType } from "./types";
import db from "~/db/client.server";
import { resourceReport } from "~/db/schema";
import { loader as rootLoader } from "~/root";
import { getAuthInfo } from "~/utils.server";
import { useOverflowHidden } from "~/hooks/overflowhidden";

export async function action({ request, context, params }: ActionFunctionArgs) {
    const user = await getAuthInfo({ request, context });
    const { id } = params;
    const form = await request.formData();
    const reportType = form.get("reportType") as ReportType | null;

    if (!reportType || !user.auth || !id) throw new Response("Login required", { status: 403 });

    await db.insert(resourceReport).values({
        category: reportType,
        resource: Number(id),
        reporter: user.id,
        reason: form.get("reason") as string | null,
    });

    return { success: true };
};

interface ReportRadioArgs extends PropsWithChildren {
    name: string;
    value: string;
}

function ReportRadio(configs: ReportRadioArgs) {
    return (
        <div className="form-control m-2 p-3 border border-neutral-content/30 rounded-lg peer-checked:border-blue-500">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="label cursor-pointer peer flex flex-col">
                <div className="w-full flex flex-row justify-between items-center">
                    <span className="label-text">{configs.name}</span>
                    <input
                        type="radio"
                        name="reportType"
                        className="radio"
                        value={configs.value}
                    />
                </div>
                <div className="card bg-base-100 p-5 w-full mt-5">
                    <p className="text-sm text-neutral-content mb-0 break-words overflow-hidden">
                        {configs.children}
                    </p>
                </div>
            </label>
        </div>
    );
}

export default function ResourcesPageReportIndex() {
    const parentData = useRouteLoaderData<typeof rootLoader>("root");
    const fetcher = useFetcher<typeof action>();
    const navigate = useNavigate();

    return (
        <div>
            <h1>檢舉濫用</h1>
            <p>
                我們都知道，不好的東西會對我們帶來不良的影響。
                對於我們來說，不好的資源會嚴重影響東華資源庫的正常運行，甚至讓您蒙受損失。
            </p>
            <p>因此，我們非常重視您的檢舉，並會在第一時間進行處理。</p>

            {fetcher.data?.success !== true ? (
                <fetcher.Form method="post">
                    <h2>請告訴我們您為何檢舉此資源</h2>
                    <ReportRadio name="版權疑慮" value={ReportType.Copyright}>
                        如果您認為此資源侵犯了您的版權，請選擇此選項。Umira
                        Projects 非常重視您的權益，並會在第一時間進行處理。
                    </ReportRadio>
                    <ReportRadio
                        name="不正確的資訊"
                        value={ReportType.Incorrect}
                    >
                        我們無法保證所有資源的正確性，但如果您認為此資源包含不正確的資訊，請選擇此選項。
                    </ReportRadio>
                    <ReportRadio name="霸凌內容" value={ReportType.Bullying}>
                        我們反對校園暴力，若您發現相關內容，請檢舉該檔案。
                    </ReportRadio>
                    <ReportRadio name="仇恨性內容" value={ReportType.Hatred}>
                        我們非常重視您的感受，如果您認為此資源包含仇恨性內容，請選擇此選項。
                    </ReportRadio>
                    <ReportRadio name="有害內容" value={ReportType.Harmful}>
                        如果您認為此資源包含有害內容，請選擇此選項。
                    </ReportRadio>
                    <ReportRadio
                        name="自傷、自殺或是自殘"
                        value={ReportType.Suicide}
                    >
                        我們重視每個人的身心靈發展，但有時候總會需要些幫助。若您發現有無聲的呼救，請盡速聯繫我們。
                    </ReportRadio>
                    <ReportRadio name="色情內容" value={ReportType.NSFW}>
                        此網站為協助學生分享資源的平台，請不要使用這個平台散布色情內容。
                    </ReportRadio>
                    <ReportRadio
                        name="資源內容不恰當"
                        value={ReportType.Inappropriate}
                    >
                        若該您要檢舉檔案非上述內容，請選擇此項。
                    </ReportRadio>

                    <h2 className="mt-5">方便告訴我們詳細原因嗎？</h2>
                    <textarea
                        className="textarea textarea-bordered textarea-lg bg-neutral grow w-full"
                        placeholder="請詳細告訴我們原因 (可選)"
                        name="reason"
                    />
                    <div className="divider"></div>

                    {parentData?.auth ? (
                        <button className="btn btn-primary w-full">
                            提交檢舉
                        </button>
                    ) : (
                        <button
                            onClick={() =>
                                navigate(
                                    "/login?return=" +
                                        encodeURIComponent(location.pathname)
                                )
                            }
                            className="btn w-full"
                        >
                            請先登入至東華資源庫
                        </button>
                    )}
                </fetcher.Form>
            ) : (
                <div>
                    <h2>感謝您的檢舉</h2>
                    <p>我們會在第一時間進行處理，並在完成後通知您。</p>
                </div>
            )}
        </div>
    );
}
