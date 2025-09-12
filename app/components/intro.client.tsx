import { useState } from "react";
import { Configs, getConfigs, saveConfigs } from "~/storage/configs.client";
import { AlertBox } from "./alert_box";

export function IntroMessage() {
    const [isShown, setIsShown] = useState(
        getConfigs(Configs.CLOSE_FIRST_LOGIN_MESSAGE) !== "1"
    );
    if (!isShown) return null;

    return (
        <AlertBox
            onClose={() => {
                saveConfigs(Configs.CLOSE_FIRST_LOGIN_MESSAGE, "1");
                setIsShown(false);
            }}
        >
            <div>
                <h1>歡迎使用！</h1>
                <p>
                    您可以於此網站下載您所需要的資料，我們也歡迎您分享您的資料！讓大家一同學習、一起進步吧！
                </p>
                <p>
                    請注意！本站所有資源皆由使用者上傳，請自行判斷其正確性與安全性，<span className="font-black">本站不保證任何資源的正確性與安全性</span>。
                    若您發現任何不當或有害的資源，請使用檢舉功能通知我們，我們將會盡快處理。
                </p>
                <p className="font-black">由於著作權問題，我們不建議您上傳教科書檔案！</p>
                <p>祝您使用愉快！</p>
            </div>

            <button className="btn btn-primary w-full" onClick={() => {
                saveConfigs(Configs.CLOSE_FIRST_LOGIN_MESSAGE, "1");
                setIsShown(false);
            }}>我已了解！</button>
        </AlertBox>
    );
}
