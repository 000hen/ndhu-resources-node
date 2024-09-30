import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { sql } from "drizzle-orm";
import { useRef } from "react";
import { MdFileUpload } from "react-icons/md";
import db from "~/db/client.server";
import { courses, resourceCategory } from "~/db/schema";

export async function loader() {
    const categories = await db
        .select({
            id: resourceCategory.id,
            name: resourceCategory.name,
        })
        .from(resourceCategory);
    
    return json({
        category: categories
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query)
        return null;

    return json(await courseSuggestions(query));
}

async function courseSuggestions(query: string) {
    return await db
        .select({
            id: courses.id,
            name: courses.name,
            teacher: courses.teacher,
        })
        .from(courses)
        .where(sql`MATCH(${courses.name}, ${courses.teacher}, ${courses.display_id}) AGAINST(${sql.placeholder("query")} IN NATURAL LANGUAGE MODE)`)
        .limit(5)
        .prepare()
        .execute({
            query
        });
}

function RequiredSign() {
    return <span style={{color: 'red'}}>*</span>
}

export default function ResourceNew() {
    const courseSearchRef = useRef<HTMLInputElement>(null);
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();

    function suggest(query: string) {
        fetcher.submit({}, {
            method: "POST",
            action: `?q=${query}`
        });
    }

    return <div>
        <div className="flex flex-col md:flex-row gap-5">
            <div className="z-10">
                <div>
                    <h2>資源名稱 <RequiredSign /></h2>
                    <p>請輸入資源名稱，這個將作為資源庫中的資源標題。</p>
                    <input
                        type="text"
                        className="input input-bordered input-lg bg-neutral grow w-full md:w-96"
                        placeholder="史詩級的資源！"/>
                </div>

                <div className="mt-10">
                    <h2>資源簡介 <RequiredSign /></h2>
                    <p>沒了簡介... 我...我什麼都不知道...</p>
                    <textarea
                        className="textarea textarea-bordered textarea-lg bg-neutral grow w-full md:w-96"
                        placeholder="史詩級的資源！像個超人一樣幫助你起飛！" />
                </div>

                <div className="mt-10">
                    <h2>資源標籤</h2>
                    <p>請輸入資源的標籤，以空格分隔。</p>
                    <input
                        type="text"
                        className="input input-bordered input-lg bg-neutral grow w-full md:w-96"
                        placeholder="超級資源 極度機密 極有幫助"/>
                </div>

                <div className="mt-10">
                    <h2>資源分類 <RequiredSign /></h2>
                    <p>資源要分類，就跟資源回收一樣。不分類只會顯得雜亂不堪。</p>
                    <select
                        className="select select-bordered select-lg bg-neutral w-full md:w-96">
                        <option disabled selected>請選擇分類</option>
                        {data.category.map((v) => <option key={"resource:new:category:" + v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>

                <div className="mt-10">
                    <h2>課堂選擇</h2>
                    <p>請選擇資源的分類。</p>
                    <div>
                        <input
                            ref={courseSearchRef}
                            type="text"
                            className="input input-bordered input-lg bg-neutral w-full md:w-96"
                            placeholder="輸入課程名稱或導師名稱"
                            onInput={(e) => suggest(e.currentTarget.value)} />
                        
                        {fetcher.data && <div className="md:w-96 w-full py-2">
                            <div className="bg-neutral w-full rounded-xl p-2 shadow-lg">
                                {fetcher.data.length === 0 && (courseSearchRef.current?.value.length || 0) >= 2  && <div
                                    className="p-2 px-5 hover:bg-gray-700 cursor-pointer rounded-lg">
                                    找不到符合的課程嗎？點擊這裡新增！
                                </div>}
                                {fetcher.data.length > 0 && fetcher.data.map((v) =>
                                    <div
                                        key={"resource:new:course:" + v.id}
                                        className="p-2 px-5 hover:bg-gray-700 cursor-pointer rounded-lg">
                                        {v.name} - {v.teacher}
                                    </div>
                                )}
                            </div>
                        </div>}
                    </div>
                </div>
            </div>

            <div>
                <h2>資料上傳 <RequiredSign /></h2>
                <p>請上傳您的資源，支援的格式有 PDF、Word、Excel、PowerPoint、圖片、影片。</p>
                <label>
                    {/* With drag and drop theme */}
                    <div className="rounded-lg bg-neutral p-10 border-2 border-dashed border-gray-600 text-center hover:bg-gray-900 cursor-pointer transition-all">
                        <div className="text-4xl grid place-content-center relative">
                            <MdFileUpload />
                            <div className="absolute top-0 left-0 right-0 bottom-0 grid place-content-center animate-ping blur-sm m-5">
                                <MdFileUpload />
                            </div>
                        </div>
                        <div className="mt-5"><span className="text-warning">拖曳檔案</span>至此或<span className="text-warning">點擊</span>上傳</div>
                    </div>
                    <input type="file" className="hidden" />
                </label>
            </div>
        </div>
    </div>
}