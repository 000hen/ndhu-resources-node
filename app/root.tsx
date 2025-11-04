import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useMatches,
    useRouteError,
} from "@remix-run/react";
import { useState } from "react";
import {
    MdAdminPanelSettings,
    MdClose,
    MdDescription,
    MdFavorite,
    MdInfo,
    MdLogin,
    MdLogout,
    MdMenu,
    MdSearch,
} from "react-icons/md";
import PanelLink from "./components/panel_link";
import { IconType } from "react-icons";
import LogoComponent from "./components/logos/logo";
import { LoaderFunctionArgs } from "@remix-run/node";
import { AuthInfo, getAuthInfoWithPremission } from "./utils.server";
import { FaGithub, FaUser } from "react-icons/fa";
import { googleImageResize, Premission } from "./utils";
import FooterButtonComponent from "./components/footer_button";
import { useOverflowHidden } from "./hooks/overflowhidden";
import { AlphaMessage } from "./components/alpha_message.client";
import { IntroMessage } from "./components/intro.client";

import "./tailwind.css";

interface PanelNaviagePage {
    display: string;
    path: string;
    icon: IconType | string;
    className?: string;
}

interface Pages {
    [path: string]: PanelNaviagePage | undefined;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });

    return auth;
}

function pages(auth: AuthInfo): Pages {
    return {
        resources: {
            display: "資源大廳",
            path: "resources",
            icon: MdDescription,
        },
        favorite: auth.auth
            ? { display: "收藏的資源", path: "favorite", icon: MdFavorite }
            : undefined,
        user: auth.auth
            ? {
                  display: "個人頁面",
                  path: "profile",
                  icon: googleImageResize(auth.profile || "", 20),
              }
            : { display: "登入", path: "login", icon: MdLogin },
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="font-display">
                {typeof window !== "undefined" && <IntroMessage />}
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

function ProfileImage(url: string, username: string) {
    const headerImg = googleImageResize(url || "", 40);

    return (
        <div
            className="tooltip tooltip-left lg:tooltip-bottom"
            data-tip={`登入為 ${username}`}
        >
            <img
                referrerPolicy="no-referrer"
                alt="Profile"
                className="w-10 rounded-full"
                src={headerImg}
            />
        </div>
    );
}

export default function App() {
    const matches = useMatches()[1].pathname.split("/")[1];
    const data = useLoaderData<typeof loader>();
    const setOverflowHidden = useOverflowHidden(false);

    const [showMenu, setShowMenu] = useState<boolean>(false);
    const page = pages(data);
    const profileImg = data.auth ? (
        ProfileImage(data.profile || "", data.display)
    ) : (
        <FaUser size={40} />
    );
    const premissions = data.auth ? data.premission : 0;

    function toggleMenu(action?: boolean) {
        setShowMenu(action ?? !showMenu);
        setOverflowHidden(action ?? !showMenu);
    }

    const openMenu = () => toggleMenu(true);
    const closeMenu = () => toggleMenu(false);

    return (
        <div
            className="relative max-h-screen overflow-y-auto min-h-screen flex lg:flex-row flex-col bg-base-100 overflow-x-hidden"
            id="content"
        >
            <div className="sticky top-0 lg:h-full z-50 shadow-md lg:shadow-none">
                <div className="backdrop-blur-md bg-neutral/80">
                    <div className="lg:hidden p-5 flex justify-between items-center">
                        <button
                            className="p-3 rounded-xl"
                            onClick={showMenu ? closeMenu : openMenu}
                        >
                            {!showMenu && <MdMenu size={32} />}
                            {showMenu && <MdClose size={32} />}
                        </button>
                        <h1 className="text-2xl px-5 block mb-0 lg:hidden">
                            <LogoComponent />
                        </h1>
                        <div className="p-2 grid place-content-center">
                            <div className="hidden sm:block w-0 sm:w-auto">
                                {profileImg}
                            </div>
                        </div>
                    </div>
                    <div
                        className={"lg:block p-5 lg:p-0".concat(
                            " " + (showMenu ? "block" : "hidden")
                        )}
                    >
                        <div className="w-full lg:min-w-96 lg:w-max lg:min-h-screen lg:block rounded-lg lg:rounded-none">
                            <div className="flex flex-col w-full justify-between items-center lg:min-h-screen lg:p-10 px-10">
                                <div className="w-full px-5 hidden lg:block">
                                    {profileImg}
                                </div>
                                <div className="w-full">
                                    <h1 className="text-2xl mb-5 px-5 hidden lg:block">
                                        <LogoComponent />
                                    </h1>
                                    <div className="flex flex-col lg:mt-5">
                                        <Link
                                            onClick={closeMenu}
                                            to={"/search"}
                                            className="btn btn-base-100 w-full justify-start items-center mb-3"
                                        >
                                            <MdSearch
                                                size={16}
                                                className="text-base-content"
                                            />
                                            資料搜尋
                                        </Link>
                                        {Object.values(pages(data))
                                            .filter((e) => !!e)
                                            .map((e) => (
                                                <PanelLink
                                                    key={`panel:link:${e.path}`}
                                                    onClick={closeMenu}
                                                    className={e.className}
                                                    highlight={matches}
                                                    icon={e.icon}
                                                    to={e.path}
                                                >
                                                    {e.display}
                                                </PanelLink>
                                            ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-center gap-2">
                                        <Link
                                            to="https://github.com/000hen/ndhu-resources-node"
                                            className="btn p-2 w-10 h-10 tooltip"
                                            data-tip="Github Repository"
                                        >
                                            <FaGithub size={24} />
                                        </Link>
                                        {data.auth && (
                                            <FooterButtonComponent
                                                to="/logout"
                                                tip="登出"
                                                onClick={closeMenu}
                                                className="btn-error"
                                            >
                                                <MdLogout size={25} />
                                            </FooterButtonComponent>
                                        )}
                                        {premissions >= Premission.Editor && (
                                            <FooterButtonComponent
                                                to="/admin"
                                                tip="管理介面"
                                                onClick={closeMenu}
                                                className="btn-info"
                                            >
                                                <MdAdminPanelSettings
                                                    size={25}
                                                />
                                            </FooterButtonComponent>
                                        )}
                                    </div>
                                    <p className="mt-2 text-center mb-0">
                                        © 2024 Umira Projects{" "}
                                        <Link
                                            to={"/about"}
                                            className="tooltip"
                                            onClick={closeMenu}
                                            data-tip="關於這個平台"
                                        >
                                            <MdInfo className="inline" />
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-5 lg:p-10 w-full lg:min-h-max">
                {page[matches] && (
                    <h1 className="text-4xl font-bold">
                        {page[matches].display}
                    </h1>
                )}
                {typeof window !== "undefined" && <AlphaMessage />}
                <Outlet />
            </div>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    return (
        <div className="p-10 min-h-screen flex items-center">
            <div className="container m-auto">
                <h1 className="text-4xl font-bold">發生錯誤</h1>
                <p>抱歉，網站發生錯誤，請稍後再試。</p>
                <pre className="whitespace-pre-wrap break-words">
                    Message: {isRouteErrorResponse(error) && error.statusText}
                </pre>
                <p>若持續發生錯誤，請聯絡我們。</p>
                <Link to={"/"} className="btn btn-primary mt-5">
                    回到首頁
                </Link>
            </div>
        </div>
    );
}
