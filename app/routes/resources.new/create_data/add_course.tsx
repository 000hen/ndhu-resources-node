import { useState } from "react";
import RequiredSign from "~/components/reqired_sign";
import { Course } from "~/types/resource";

interface AddCourseArgs {
    course: Course,
    setCourse: (course: Course) => void,
    close: () => void,
}

export default function AddCourse(config: AddCourseArgs) {
    const [course, setCourse] = useState<Course>(config.course);

    function setCourseValue(key: keyof Course, value: string) {
        const valueReplaced = { ...course, [key]: value };
        config.setCourse(valueReplaced);
        setCourse(valueReplaced);
    }
    
    return <div className="card bg-neutral p-5 w-full">
        <h2>新增課程</h2>
        <div>
            <label>
                課程名稱 <RequiredSign />
                <input
                    type="text"
                    className="input input-bordered input-lg bg-neutral w-full"
                    placeholder="史詩級的課程！"
                    onInput={(ele) => setCourseValue("name", ele.currentTarget.value)} />
            </label>
        </div>

        <div className="mt-2">
            <label className="mt-2">
                課程代號 <RequiredSign />
                <input
                    type="text"
                    className="input input-bordered input-lg bg-neutral w-full"
                    placeholder="CS101"
                    onInput={(ele) => setCourseValue("display_id", ele.currentTarget.value)} />
            </label>
        </div>

        <div className="mt-2">
            <label className="mt-2">
                授課教師 <RequiredSign />
                <input
                    type="text"
                    className="input input-bordered input-lg bg-neutral w-full"
                    placeholder="王阿明"
                    onInput={(ele) => setCourseValue("teacher", ele.currentTarget.value)} />
            </label>
        </div>

        <div className="mt-5">
            <button className="btn btn-primary w-full" onClick={() => config.close()}>新增課程</button>
        </div>
    </div>;
}