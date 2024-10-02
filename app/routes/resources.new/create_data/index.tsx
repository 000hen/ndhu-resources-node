import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useReducer, useRef, useState } from "react";
import RequiredSign from "~/components/reqired_sign";
import CourseSearchCard from "../course_search_card";
import { DataUploadElementProps } from "~/types/upload";
import type { action, loader } from "./index.server";
import { ActionType, reducer } from "./reducer";
import { Course } from "~/types/resource";

export default function CreateDataIndex({ data: uploadData, setData: setUploadData, setIsAbleToNext }: DataUploadElementProps) {
    const courseSearchRef = useRef<HTMLInputElement>(null);
    const [state, dispatch] = useReducer(reducer, uploadData ?? {
        name: "",
        description: "",
        tags: null,
        course: null,
        category: null,
        filename: "",
    });
    const [showCourseSearch, setShowCourseSearch] = useState(false);
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();

    function suggest(query: string) {
        setShowCourseSearch(true);
        fetcher.submit({}, {
            method: "POST",
            action: `?q=${query}`
        });
    }

    function setCourseSearchValue(value: string) {
        courseSearchRef.current!.value = value;
    }

    function setCourse(course: Course) {
        dispatch({ type: ActionType.SET_COURSE, payload: course });
        setShowCourseSearch(false);
        setCourseSearchValue(course.name);
    }

    useEffect(() => {
        if (state.name?.length
            && state.description?.length
            && state.category
            && state.course) {
            setIsAbleToNext(true);
            setUploadData({ ...state, file: uploadData?.file || null });
            return;
        }

        setIsAbleToNext(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return <div>
        <div className="grid xl:grid-cols-2 gap-5 z-10">
            <div>
                <div>
                    <h2>資源名稱 <RequiredSign /></h2>
                    <p>請輸入資源名稱，這個將作為資源庫中的資源標題。</p>
                    <input
                        type="text"
                        className="input input-bordered input-lg bg-neutral grow w-full md:w-96"
                        placeholder="史詩級的資源！"
                        onInput={(e) => dispatch({ type: ActionType.SET_NAME, payload: e.currentTarget.value })}
                        defaultValue={state.name} />
                </div>

                <div className="mt-10">
                    <h2>資源簡介 <RequiredSign /></h2>
                    <p>沒了簡介... 我...我什麼都不知道...</p>
                    <textarea
                        className="textarea textarea-bordered textarea-lg bg-neutral grow w-full md:w-96"
                        onInput={(e) => dispatch({ type: ActionType.SET_DESCRIPTION, payload: e.currentTarget.value })}
                        defaultValue={state.description ?? ""}
                        placeholder="史詩級的資源！像個超人一樣幫助你起飛！" />
                </div>

                <div className="mt-10">
                    <h2>資源標籤</h2>
                    <p>請輸入資源的標籤，以空格分隔。</p>
                    <input
                        type="text"
                        className="input input-bordered input-lg bg-neutral grow w-full md:w-96"
                        placeholder="超級資源 極度機密 急！在線等！"
                        onInput={(e) => dispatch({ type: ActionType.SET_TAGS, payload: e.currentTarget.value.trim().split(" ") })}
                        defaultValue={state.tags?.join(" ")} />
                </div>
            </div>

            <div>
                <div className="mt-10 xl:mt-0">
                    <h2>資源分類 <RequiredSign /></h2>
                    <p>資源要分類，就跟資源回收一樣。不分類只會顯得雜亂不堪。</p>
                    <select
                        className="select select-bordered select-lg bg-neutral w-full md:w-96"
                        onChange={(e) => dispatch({ type: ActionType.SET_CATEGORY, payload: e.target.value })}
                        defaultValue={state.category ? state.category : "cs"}>
                        <option value="cs" disabled>請選擇分類</option>
                        {data.category.map((v) => <option key={"resource:new:category:" + v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>

                <div className="mt-10">
                    <h2>課堂選擇 <RequiredSign /></h2>
                    <p>請選擇資源的分類。</p>
                    <div>
                        <input
                            ref={courseSearchRef}
                            type="text"
                            className="input input-bordered input-lg bg-neutral w-full md:w-96"
                            placeholder="輸入課程名稱或導師名稱"
                            defaultValue={state.course?.name}
                            onBlur={() => setCourseSearchValue(state.course?.name || "")}
                            onInput={(e) => suggest(e.currentTarget.value)} />

                        {showCourseSearch && fetcher.data && <div className="md:w-96 w-full py-2">
                            <div className="bg-neutral w-full rounded-xl p-2 shadow-lg">
                                {fetcher.data.length > 0 && fetcher.data.map((v) =>
                                    <CourseSearchCard
                                        key={"resource:new:course:" + v.id}
                                        id={v.id}
                                        display_id={v.display_id}
                                        title={v.name}
                                        teacher={v.teacher || undefined}
                                        onClick={() => setCourse({
                                            id: v.id,
                                            display_id: v.display_id,
                                            name: v.name,
                                            teacher: v.teacher,
                                        })} />
                                )}
                                {(courseSearchRef.current?.value.length || 0) >= 2 && <div
                                    className="p-2 px-5 hover:bg-gray-700 cursor-pointer rounded-lg transition-all">
                                    找不到符合的課程嗎？點擊這裡新增！
                                </div>}
                                {(courseSearchRef.current?.value.length || 0) < 2 && <div
                                    className="p-2 px-5 hover:bg-gray-700 cursor-pointer rounded-lg transition-all">
                                    請輸入至少兩個字元以搜尋
                                </div>}
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    </div>
}