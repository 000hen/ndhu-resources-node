import { useEffect, useState } from "react";

interface UseOverflowHiddenOptions {
    inital?: boolean;
    moveToTop?: boolean;
}

export const useOverflowHidden = ({
    inital = true,
    moveToTop = false,
}: UseOverflowHiddenOptions = {}) => {
    const [isOverflowHidden, setIsOverflowHidden] = useState(inital);

    useEffect(() => {
        const doc = document.getElementById("content");
        if (!doc) return;

        doc.style.overflow = isOverflowHidden ? "hidden" : "";

        const originalScroll = doc.scrollTop;
        if (moveToTop) doc.scrollTo(0, 0);
        return () => {
            doc.style.overflow = "";
            if (moveToTop) doc.scrollTo(0, originalScroll);
        };
    }, [isOverflowHidden]);

    return setIsOverflowHidden;
};
