import { PropsWithChildren } from "react";
import { MdClose } from "react-icons/md";

interface AlertBoxProps extends PropsWithChildren {
    isClosed?: boolean;
    onClose?: () => void;
}

export function AlertBox(configs: AlertBoxProps) {
    return (
        <div className="absolute top-0 right-0 w-full h-full z-999999 bg-neutral/60 backdrop-blur-sm flex justify-center items-center">
            <div className="card p-5 bg-neutral h-full md:h-fit md:m-10 w-full md:w-[600px] shadow-xl">
                <div className="flex justify-end w-full">
                    <div
                        className="tooltip tooltip-left md:tooltip-top"
                        data-tip="關閉"
                    >
                        <button
                            onClick={configs.onClose}
                            className="btn btn-circle btn-ghost"
                        >
                            <MdClose size={32} />
                        </button>
                    </div>
                </div>
                <div className="md:max-h-[80vh] overflow-x-hidden overflow-y-auto p-2">
                    {configs.children}
                </div>
            </div>
        </div>
    );
}
