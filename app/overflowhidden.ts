import { useEffect, useState } from "react";

export const useOverflowHidden = (inital = true) => {
    const [isOverflowHidden, setIsOverflowHidden] = useState(inital);

    useEffect(() => {
        const doc = document.getElementById("content");
        if (!doc) return;

        doc.style.overflow = isOverflowHidden ? "hidden" : "";
        return () => {
            doc.style.overflow = "";
        };
    }, [isOverflowHidden]);

    return setIsOverflowHidden;
}