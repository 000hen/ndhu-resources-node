import { MetaFunction } from "@remix-run/node";
import LogoComponent from "~/components/logos/logo";
import UmiraLogo from "~/components/logos/umira.svg?react";
import NDHUResLogo from "~/components/logos/logo_icon.svg?react";
import { FaGithub } from "react-icons/fa";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
    return [
        { title: "關於平台 - 東華資源庫" },
        { name: "description", content: "關於東華資源庫的資訊" },
    ];
};

export default function AboutIndex() {
    return (
        <div>
            <div className="h-48 w-full p-10">
                <UmiraLogo className="text-center h-full w-full" />
            </div>
            <div className="card bg-neutral grid place-content-center">
                <div className="flex flex-row p-5">
                    <div className="md:h-48 h-24">
                        <NDHUResLogo className="h-full w-full" />
                    </div>
                    <div className="flex-auto grid place-content-center">
                        <div>
                            <LogoComponent />
                            <span className="block text-xl mb-0 mt-2">
                                by Umira Projects
                            </span>
                            <Link to="https://github.com/000hen/ndhu-resources-node" className="btn btn-ghost rounded-full mt-2 p-2 w-10 h-10">
                                <FaGithub size={24} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:grid grid-cols-2 gap-2 mt-2">
                <div className="card p-5 bg-neutral">
                    <h1>開發者&維護者</h1>
                    <div className="grid place-content-center w-full h-full">
                        <span className="text-4xl font-bold">
                            Umira Projects
                        </span>
                    </div>
                </div>
                <div className="card p-5 bg-neutral mt-2 md:mt-0">
                    <h1>關於本站</h1>
                    <p>
                        本站為東華大學學生製作的公開資源分享庫，所有學生皆可提供與取得各式各樣的資源。
                    </p>
                </div>
            </div>
        </div>
    );
}
