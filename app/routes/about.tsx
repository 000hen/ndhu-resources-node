import LogoComponent from "~/components/logo";
import { version } from "~/../package.json";

export default function AboutIndex() {
    return <div>
        <div className="h-48 card bg-neutral grid place-content-center p-5">
            <div>
                <LogoComponent />
                <span className="block text-xl mb-0 mt-2">ver. {version}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="card p-5 bg-neutral">
                <h1>開發者&維護者</h1>
                <div className="grid place-content-center w-full h-full">
                    <span className="text-4xl font-bold">Umira Projects</span>
                </div>
            </div>
            <div className="card p-5 bg-neutral">
                <h1>關於本站</h1>
                <p>本站為東華大學資訊工程學系學生製作的公開資源分享庫，所有學生皆可提供與取得各式各樣的資源。</p>
            </div>
        </div>
    </div>
}