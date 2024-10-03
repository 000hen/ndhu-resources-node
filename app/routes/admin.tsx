import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { FaUser } from "react-icons/fa";
import { MdClass, MdDescription, MdTag } from "react-icons/md";
import { Link } from "react-router-dom";
import { Premission } from "~/utils";
import { getAuthInfoWithPremission, redirectToLogin } from "~/utils.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth)
        return redirectToLogin(request);

    if (auth.premission < Premission.Editor)
        return redirect("/");

    return json({ premission: auth.premission });
}

export default function AdminRoute() {
    const data = useLoaderData<typeof loader>();

    return <div>
        <h1>管理介面</h1>
        <div role="tablist" className="tabs tabs-boxed">
            <Link to="/admin" role="tab" className="tab tab-lifted"><MdTag /> 管理標籤</Link>
            <Link to="/admin" role="tab" className="tab tab-lifted"><MdClass /> 管理課程</Link>
            <Link to="/admin" role="tab" className="tab tab-lifted"><MdDescription/> 管理資源</Link>
            {data.premission >= Premission.Admin && <Link to="/admin" role="tab" className="tab tab-lifted"><FaUser /> 使用者管理</Link>}
        </div>

        <div className="mt-5">
            <Outlet />
        </div>
    </div>
}