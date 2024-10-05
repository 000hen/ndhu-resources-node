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
    MdDescription,
    MdGroups,
    MdInfo,
    MdLogin,
    MdLogout,
    MdMenu,
    MdSearch
} from "react-icons/md";
import PanelLink from "./components/panel_link";
import { IconType } from "react-icons";
import LogoComponent from "./components/logos/logo";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { AuthInfo, getAuthInfoWithPremission } from "./utils.server";
import { FaUser } from "react-icons/fa";
import { googleImageResize, Premission } from "./utils";
import FooterButtonComponent from "./components/footer_button";

import "./tailwind.css";

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
    const auth = await getAuthInfoWithPremission({ request, context });

    return json(auth);
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

function ProfileImage(url: string, username: string) {
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
    const profileImg = data.auth ? ProfileImage(data.profile || "", data.display) : <FaUser size={40} />;
    const premissions = data.auth ? data.premission : 0;

    function toggleMenu() {
        setShowMenu((e) => !e);
    }

    return <div className="relative max-h-screen overflow-y-auto flex lg:flex-row flex-col bg-base-100 overflow-x-hidden">
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
                                        <Link onClick={toggleMenu} to={"/search"} className="btn btn-base-100 w-full justify-start items-center mb-3">
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
                                    <p className="mt-2 text-center mb-0">© 2024 Umira Projects <Link to={"/about"} className="tooltip" data-tip="關於這個平台"><MdInfo className="inline" /></Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <div className="p-5 lg:p-10 w-full max-h-max lg:min-h-max">
            {page[matches] && <h1 className="text-4xl mb-5 font-bold">{page[matches].display}</h1>}
            <div className="alert alert-warning mb-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>本網站為正處於早期測試階段，功能可能暫時不完整或出現嚴重錯誤，敬請您的諒解。</span>
            </div>
            <Outlet />
        </div>
    </div>;
}
