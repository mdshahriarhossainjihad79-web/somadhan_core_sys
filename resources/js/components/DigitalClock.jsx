import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const DigitalClock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <div
            className={`
                flex items-center justify-center gap-2
                 text-lg font-orbitron
                transition-colors duration-200
                text-text dark:text-text-dark
                animate-pulse-slow ms-2 w-52
            `}
        >
            <Icon icon="mdi:clock-outline" className="w-5 h-5" />{" "}
            <span className="font-['Orbitron'] tracking-wide">
                {formattedTime}
            </span>
        </div>
    );
};

export default DigitalClock;
