import { useState } from "react";
import { Icon } from "@iconify/react";

const Header = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark");
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        console.log(e.target.value);
    };

    return (
        <>
            {/* Search Bar */}
            <div className="flex items-center w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Icon
                        icon="mdi:magnify"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Right: Notification, User, Theme Switch */}
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Icon
                        icon="mdi:bell-outline"
                        className="h-6 w-6 text-gray-600 dark:text-gray-300"
                    />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Icon
                        icon="mdi:account-outline"
                        className="h-6 w-6 text-gray-600 dark:text-gray-300"
                    />
                </button>
                <button
                    onClick={handleThemeToggle}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {isDarkMode ? (
                        <Icon
                            icon="mdi:white-balance-sunny"
                            className="h-6 w-6 text-gray-600 dark:text-gray-300"
                        />
                    ) : (
                        <Icon
                            icon="mdi:moon-waning-crescent"
                            className="h-6 w-6 text-gray-600 dark:text-gray-300"
                        />
                    )}
                </button>
            </div>
        </>
    );
};

export default Header;
