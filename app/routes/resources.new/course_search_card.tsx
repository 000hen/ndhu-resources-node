import { FaUser } from "react-icons/fa";
import { MdClass } from "react-icons/md";

interface CourseSearchCardArgs {
    id: number,
    display_id: string,
    title: string,
    onClick: () => void
    teacher?: string,
}

export default function CourseSearchCard(configs: CourseSearchCardArgs) {
    return <button
        className="block w-full text-left p-2 px-5 hover:bg-gray-700 cursor-pointer rounded-lg transition-all"
        onClick={configs.onClick}>
        <h3 className="text-2xl">{configs.title}</h3>
        <div className="mt-2">
            {configs.teacher && <div><FaUser className="inline" /> {configs.teacher}</div>}
            <div><MdClass className="inline" /> {configs.display_id}</div>
        </div>
    </button>;
}