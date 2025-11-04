import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { PropsWithChildren } from "react";
import { FaUser } from "react-icons/fa";
import { MdClass, MdDescription, MdFlag, MdSort } from "react-icons/md";
import { Link } from "react-router-dom";
import { classFormat, Premission } from "~/utils";
import { getAuthInfoWithPremission, redirectToLogin } from "~/utils.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth)
        return redirectToLogin(request);

    if (auth.premission < Premission.Editor)
        return redirect("/");

    return { premission: auth.premission };
}

interface AdminNavigateLinkArgs extends PropsWithChildren {
    to: string,
    currentPath: string
}

function AdminNavigateLink(configs: AdminNavigateLinkArgs) {
    return <Link to={configs.to} role="tab" className={classFormat([
        "tab transition-all",
        configs.to === configs.currentPath && "tab-active",
    ])}>{configs.children}</Link>;
}

export default function AdminRoute() {
    const matches = useMatches()[2].pathname.split("/")[2];
    const data = useLoaderData<typeof loader>();

    return <div>
        <h1>管理介面</h1>
        <div role="tablist" className="tabs tabs-boxed">
            {/* TODO: Add functionallity to the links */}
            <AdminNavigateLink to="sorts" currentPath={matches}><MdSort /> 課程分類管理</AdminNavigateLink>
            <AdminNavigateLink to="courses" currentPath={matches}><MdClass /> 課程管理</AdminNavigateLink>
            <AdminNavigateLink to="resources" currentPath={matches}><MdDescription /> 資源管理</AdminNavigateLink>
            {data.premission >= Premission.Admin && <AdminNavigateLink to="reports" currentPath={matches}><MdFlag /> 管理檢舉</AdminNavigateLink>}
            {data.premission >= Premission.Admin && <AdminNavigateLink to="users" currentPath={matches}><FaUser /> 使用者管理</AdminNavigateLink>}
        </div>

        <div className="mt-5">
            <Outlet />
        </div>
    </div>
}