import { MetaFunction } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { loader as rootLoader } from "~/root";
import { Premission } from "~/utils";

export const meta: MetaFunction = () => {
    return [
        { title: "管理介面 - 東華資源庫" },
    ];
};

export default function AdminIndex() {
    const parentData = useRouteLoaderData<typeof rootLoader>("root");

    return <div className="w-full grid place-content-center">
        <h1>✨ 很榮幸見到您！一起來維護東華資源庫吧！</h1>
        <div className="alert alert-info mb-2">
            <p className="mb-0">
                給所有人員的提示：請勿向使用者要求其帳號密碼，亦不可要求提供相關個人資料。
                若您做出了<span className="text-red-600 font-bold">違反規定</span>的事項，您將會被<span className="text-red-600 font-bold">拔除管理權限，甚至是禁止使用東華資源庫</span>。
            </p>
        </div>

        {parentData?.auth
            && <>
                {parentData.premission >= Premission.Admin && <div className="alert alert-warning mb-2">
                    <p className="mb-0">
                        給管理人員的提示：您擁有全部的權限，可以管理使用者。因此請善用您的權限，保護東華資源庫的存歿。</p>
                </div>}

                {parentData.premission >= Premission.Editor && <div className="alert alert-warning">
                    <p className="mb-0">給版主的提示：您可以協助我們審核其他使用者所上傳的資料，並獲得資料的優先使用權。請注意！您所獲得的未經審查的資料，可能會有資訊安全的風險，請勿在您的電腦上開啟。</p>
                </div>}
            </>}
    </div>;
}