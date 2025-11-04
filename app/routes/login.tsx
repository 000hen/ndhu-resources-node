import { Link, Outlet } from "react-router";

export default function LoginLayout() {
    return <div className="md:grid md:place-content-center h-full">
        <div className="md:relative md:w-max">
            <div className="bg-white md:shadow-md min-w-full md:min-w-96 rounded-xl">
                <div className="p-5">
                    <Outlet />
                </div>
            </div>
            <div className="md:absolute w-full md:text-white text-center translate-y-2">
                {/* <Link className="after:content-['•'] after:px-2" to={"/policy/service"}>服務條款</Link> */}
                <Link to={"https://muisnowdevs.one/privacy"}>隱私權政策</Link>
            </div>
        </div>
    </div>;
}