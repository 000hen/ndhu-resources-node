import { useRef } from "react";
import ResourcePanel from "./panel";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

interface PageViewPanelArgs {
    size: number,
    currentPage: number,
    changePage: (page: number) => void,
}

export default function PageViewPanel(configs: PageViewPanelArgs) {
    const inputRef = useRef<HTMLInputElement>(null);

    function setPageNumber(page: number) {
        if (!inputRef.current)
            return;

        inputRef.current.value = String(page);
    }

    function inputChangePage() {
        if (!inputRef.current)
            return;

        if (inputRef.current.value === "" ||
            Number(inputRef.current.value) < 1 ||
            Number(inputRef.current.value) > Math.ceil(configs.size / 20))
            return setPageNumber(configs.currentPage);

        if (Number(inputRef.current.value) === configs.currentPage)
            return setPageNumber(configs.currentPage);

        configs.changePage(Number(inputRef.current.value));
    }

    return <ResourcePanel>
        <div className="flex justify-center">
            <div className="join">
                <button
                    className="btn join-item tooltip"
                    data-tip="上一頁"
                    onClick={() => configs.changePage(configs.currentPage - 1)}
                    disabled={configs.currentPage === 1}>
                    <MdKeyboardArrowLeft size={32} />
                </button>

                <div className="join-item h-full px-5 bg-neutral">
                    <span className="text-lg">第 </span>
                    <div className="tooltip" data-tip="輸入頁數，按下 Enter 或點擊旁邊空白處即可跳轉">
                        <input
                            ref={inputRef}
                            className="input hover:bg-slate-600 w-10 p-0 text-center bg-neutral transition-all"
                            onBlur={inputChangePage}
                            onKeyUp={(inp) => inp.key === "Enter" && inputChangePage()}
                            type="number"
                            defaultValue={configs.currentPage}></input>
                    </div>
                    <span className="text-lg"> / {Math.ceil(configs.size / 20)} 頁</span>
                </div>

                <button
                    className="btn join-item tooltip"
                    data-tip="下一頁"
                    onClick={() => configs.changePage(configs.currentPage + 1)}
                    disabled={configs.currentPage >= Math.ceil(configs.size / 20)}>
                    <MdKeyboardArrowRight size={32} />
                </button>
            </div>
        </div>
    </ResourcePanel>
}