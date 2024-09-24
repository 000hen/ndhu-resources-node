import {
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useMatches,
} from "@remix-run/react";
import { useState } from "react";
import {
    MdAdminPanelSettings,
    MdClass,
    MdClose,
    MdDashboard,
    MdDescription,
    MdGroups,
    MdLogin,
    MdLogout,
    MdMenu,
    MdSearch
} from "react-icons/md";
import PanelLink from "./components/panel_link";
import { IconType } from "react-icons";
import LogoComponent from "./components/logo";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { AuthInfo, getAuthInfo } from "./utils.server";

import "./tailwind.css";
import { FaUser } from "react-icons/fa";
import { googleImageResize, Premission } from "./utils";
import db from "./db/client.server";
import { eq } from "drizzle-orm";
import FooterButtonComponent from "./components/footer_button";

interface PanelNaviagePage {
    display: string,
    path: string,
    icon: IconType | string,
    className?: string
}

interface Pages {
    [path: string]: PanelNaviagePage
}

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfo({ request, context });
    const premission = await db
        .query
        .premissions
        .findFirst({
            columns: {
                premission: true
            },
            where: (v) => eq(v.user_id, auth.id || "")
        });

    return json({
        ...auth,
        ...premission
    });
}

function pages(auth: AuthInfo): Pages {
    let user: PanelNaviagePage = {
        display: "登入",
        path: "login",
        icon: MdLogin
    };

    if (auth.auth) {
        user = {
            display: "個人頁面",
            path: "profile",
            icon: googleImageResize(auth.profile || "", 20)
        };
    }

    return {
        dashboard: { display: "儀錶板", path: "dashboard", icon: MdDashboard },
        resources: { display: "資源大廳", path: "resources", icon: MdDescription },
        courses: { display: "課堂列表", path: "courses", icon: MdClass },
        teachers: { display: "老師列表", path: "teachers", icon: MdGroups },
        user
    }
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

function ProfileImage(url: string | null, username: string) {
    if (!url)
        return <FaUser size={40} />;

    const headerImg = googleImageResize(url || "", 40);

    return <div className="tooltip tooltip-left lg:tooltip-bottom" data-tip={`登入為 ${username}`}>
        <img referrerPolicy="no-referrer" alt="Profile" className="w-10 rounded-full" src={headerImg} />
    </div>
}

export default function App() {
    const matches = useMatches()[1].pathname.split("/")[1];
    const data = useLoaderData<typeof loader>();

    const [showMenu, setShowMenu] = useState<boolean>(false);
    const page = pages(data);
    const profileImg = ProfileImage(data.profile ?? null, data.display || "");
    const premissions = data.premission || 0;

    function toggleMenu() {
        console.log("toggle menu");
        setShowMenu((e) => !e);
    }

    return <div className="relative max-h-screen overflow-y-auto flex lg:flex-row flex-col bg-neutral">
            <div className="sticky top-0 lg:h-full z-50 shadow-md lg:shadow-none">
                <div className="backdrop-blur-md bg-neutral/80">
                    <div className="lg:hidden p-5 flex justify-between items-center">
                        <button className="p-3 rounded-xl" onClick={toggleMenu}>
                            {!showMenu && <MdMenu size={32} />}
                            {showMenu && <MdClose size={32} />}
                        </button>
                        <h1 className="text-2xl px-5 block mb-0 lg:hidden"><LogoComponent /></h1>
                        <div className="p-2 grid place-content-center">
                            {profileImg}
                        </div>
                    </div>
                    <div className={"lg:block p-5 lg:p-0".concat(" " + (showMenu ? "block" : "hidden"))}>
                        <div className="w-full lg:min-w-96 lg:w-max lg:min-h-screen lg:block rounded-lg lg:rounded-none">
                            <div className="flex flex-col w-full justify-between items-center lg:min-h-screen lg:p-10 px-10">
                                <div className="w-full px-5 hidden lg:block">
                                    {profileImg}
                                </div>
                                <div className="w-full">
                                    <h1 className="text-2xl mb-5 px-5 hidden lg:block"><LogoComponent /></h1>
                                    <div className="flex flex-col lg:mt-5">
                                        <Link to={"/search"} className="btn btn-base-100 w-full justify-start items-center mb-3">
                                            <MdSearch size={16} className="text-base-content" />
                                            資料搜尋
                                        </Link>
                                        {Object.values(pages(data)).map(e => <PanelLink
                                            key={`panel:link:${e.path}`}
                                            onClick={toggleMenu}
                                            className={e.className}
                                            highlight={matches}
                                            icon={e.icon}
                                            to={e.path}>{e.display}</PanelLink>)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex">
                                        {data.auth && <FooterButtonComponent to="/logout" tip="登出" className="btn-error">
                                            <MdLogout size={25} />
                                        </FooterButtonComponent>}
                                        {premissions >= Premission.Editor
                                            && <FooterButtonComponent to="/admin" tip="管理介面" className="btn-info">
                                                <MdAdminPanelSettings size={25} />
                                            </FooterButtonComponent>}
                                    </div>
                                    <p className="mt-2 text-center">© 2024 Umira Projects</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-5 lg:p-10 w-full bg-base-100 h-full lg:min-h-screen">
                {page[matches] && <h1 className="text-4xl mb-5 font-bold">{page[matches].display}</h1>}
                <Outlet />
            </div>
        </div>;
}
