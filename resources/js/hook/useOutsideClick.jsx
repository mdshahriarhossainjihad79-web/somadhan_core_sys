import { useEffect } from "react";

const useOutsideClick = ({
    refs,
    callback,
    eventType = "mousedown",
    ignoreElements = [],
    enabled = true,
}) => {
    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event) => {
            const refArray = Array.isArray(refs) ? refs : [refs];

            const isInsideRefs = refArray.some(
                (ref) => ref.current && ref.current.contains(event.target)
            );

            const isInsideIgnored = ignoreElements.some((ignore) => {
                if (ignore instanceof HTMLElement) {
                    return ignore.contains(event.target);
                }
                if (typeof ignore === "string") {
                    return event.target.closest(ignore);
                }
                if (ignore.current) {
                    return ignore.current.contains(event.target);
                }
                return false;
            });

            if (!isInsideRefs && !isInsideIgnored) {
                callback(event);
            }
        };

        document.addEventListener(eventType, handleClickOutside);

        return () => {
            document.removeEventListener(eventType, handleClickOutside);
        };
    }, [refs, callback, eventType, ignoreElements, enabled]);
};

export default useOutsideClick;
