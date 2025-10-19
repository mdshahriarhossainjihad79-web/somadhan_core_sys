import { Icon } from "@iconify/react";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
// import { route } from "ziggy-js";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { url } = usePage(); // Get current URL for active link highlighting

    const navItems = [
        { name: "Dashboard", route: "/", icon: "mdi:home-outline" },
        // {
        //     name: "Sale",
        //     route: "sale-page",
        //     icon: "mdi:account-group-outline",
        //     subItems: [
        //         { name: "POS", route: "/pos-page" },
        //         { name: "Sale Page", route: "/sale-page" },
        //     ],
        // },
        {
            name: "Sale",
            route: "/sale-page",
            icon: "mdi:cart",
        },
        {
            name: "Sale Manage",
            route: "/sale-table/manage",
            icon: "carbon:gui-management",
        },
        {
            name: "Warranty Manage",
            route: "/warranty/manage",
            icon: "mdi:shield-check",
        },
        {
            name: "Stock Tracking",
            route: "/stock/tracking",
            icon: "mdi:warehouse",
        },
    ];

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    return (
        <div className="p-4">
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="w-full flex justify-between items-center mb-4 p-2 rounded-lg hover:bg-gray-700"
            >
                {isSidebarOpen ? (
                    <>
                        <span className="text-xl font-bold">Admin Panel</span>
                        <Icon
                            icon="mdi:chevron-left"
                            className="h-6 w-6 text-gray-300"
                        />
                    </>
                ) : (
                    <Icon
                        icon="mdi:chevron-right"
                        className="h-6 w-6 text-gray-300 mx-auto"
                    />
                )}
            </button>

            {/* Navigation */}
            <nav>
                <ul>
                    {navItems.map((item) => (
                        <li key={item.route} className="mb-2 group">
                            {item.subItems ? (
                                <>
                                    {/* Dropdown Parent */}
                                    <div
                                        className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
                                            url.startsWith(
                                                item.route.split(".")[0]
                                            )
                                                ? "bg-blue-600"
                                                : ""
                                        }`}
                                        onClick={toggleDropdown}
                                    >
                                        <Icon
                                            icon={item.icon}
                                            className={`h-6 w-6 ${
                                                isSidebarOpen
                                                    ? "mr-2"
                                                    : "mx-auto"
                                            }`}
                                        />
                                        {isSidebarOpen && (
                                            <>
                                                <span className="flex-1">
                                                    {item.name}
                                                </span>
                                                <Icon
                                                    icon="mdi:chevron-down"
                                                    className={`h-5 w-5 transition-transform ${
                                                        isDropdownOpen
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                />
                                            </>
                                        )}
                                        {!isSidebarOpen && (
                                            <span className="absolute left-16 bg-gray-900 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                    {/* Dropdown Sub-items */}
                                    {isDropdownOpen && isSidebarOpen && (
                                        <ul className="ml-4">
                                            {item.subItems.map((subItem) => (
                                                <li key={subItem.route}>
                                                    <a
                                                        href={subItem.route}
                                                        className={`block p-2 rounded-lg hover:bg-gray-700 ${
                                                            url ===
                                                            subItem.route
                                                                ? "bg-blue-600"
                                                                : ""
                                                        }`}
                                                    >
                                                        {subItem.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <a
                                    href={item.route}
                                    className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
                                        url === item.route ? "bg-blue-600" : ""
                                    }`}
                                >
                                    <Icon
                                        icon={item.icon}
                                        className={`h-6 w-6 ${
                                            isSidebarOpen ? "mr-2" : "mx-auto"
                                        }`}
                                    />
                                    {isSidebarOpen && <span>{item.name}</span>}
                                    {!isSidebarOpen && (
                                        <span className="absolute left-16 bg-gray-900 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.name}
                                        </span>
                                    )}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
