import { PropsWithChildren } from "react";

interface HrArgs extends PropsWithChildren { }

export default function Hr({ children }: HrArgs) {
    return <div className="inline-flex items-center justify-center w-full">
        <span className="flex-auto h-1 my-8 bg-gray-500 border-0 rounded"></span>
        <span className="px-3 font-medium text-gray-500 left-1/2 text-lg">{children}</span>
        <span className="flex-auto h-1 my-8 bg-gray-500 border-0 rounded"></span>
    </div>;
}
