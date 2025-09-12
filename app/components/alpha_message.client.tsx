import { useState } from "react";
import { MdClose } from "react-icons/md";
import { Configs, getConfigs, saveConfigs } from "~/storage/configs.client";

export function AlphaMessage() {
    const [isShownAlphaMessage, setIsShownAlphaMessage] = useState(getConfigs(Configs.CLOSE_ALPHA_MESSAGE) !== "1");

    if (!isShownAlphaMessage) return null;

    return <div className="alert alert-warning mb-2">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
        <span>
            本網站為正處於早期測試階段，功能可能暫時不完整或出現嚴重錯誤，敬請您的諒解。
        </span>
        {isShownAlphaMessage && (
            <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                    saveConfigs(Configs.CLOSE_ALPHA_MESSAGE, "1");
                    setIsShownAlphaMessage(false);
                }}
            >
                <MdClose size={20} />
            </button>
        )}
    </div>;
}