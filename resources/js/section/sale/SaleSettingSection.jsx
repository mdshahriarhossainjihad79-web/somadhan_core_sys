import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";

const SaleSettingSection = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [priceType, setPriceType] = useState("B2B");
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handlePriceTypeChange = (e) => {
        setPriceType(e.target.value);
    };

    // Handle outside click to close sidebar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    return (
        <div className="relative">
            {/* Animated Settings Icon */}
            <button
                onClick={toggleSidebar}
                className="fixed right-4 top-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-200 z-50 animate-spin-slow"
                aria-label="Toggle Settings Sidebar"
            >
                <Icon icon="mdi:cog" className="text-xl" />
            </button>

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed right-0 top-0 h-full w-64 bg-surface-light dark:bg-surface-dark shadow-xl transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "translate-x-full"
                } z-40 flex flex-col`}
            >
                {/* <div className="p-6 flex justify-end">
                    <button
                        onClick={toggleSidebar}
                        className="text-text dark:text-text-dark hover:text-primary dark:hover:text-primary focus:outline-none"
                        aria-label="Close Sidebar"
                    >
                        <Icon icon="mdi:close" className="w-6 h-6" />
                    </button>
                </div> */}
                <div className="flex-1 flex flex-col justify-center p-6">
                    <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4 border-l-4 border-primary pl-4">
                        Sale Settings
                    </h2>
                    <div className="space-y-4">
                        {[
                            "Make Invoice Print",
                            "Update Manual Invoice Number",
                            "Discount/Promotion",
                            "Sale Hands on Discount",
                            "Tax",
                            "Sale with Low Price",
                            "Sale Commission",
                            "Barcode",
                            "Selling Price Edit",
                            "Update Price from Sale",
                            "Warranty Status",
                            "Sale Without Stock",
                            "Party Wise Rate Kit",
                        ].map((option) => (
                            <div key={option} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={option
                                        .replace(/\s+/g, "-")
                                        .toLowerCase()}
                                    className="h-4 w-4 text-primary focus:ring-primary border-muted rounded"
                                />
                                <label
                                    htmlFor={option
                                        .replace(/\s+/g, "-")
                                        .toLowerCase()}
                                    className="ml-2 text-sm text-text dark:text-text-dark"
                                >
                                    {option}
                                </label>
                            </div>
                        ))}
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-text dark:text-text-dark mb-2">
                                Sale Price Type
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="b2b-price"
                                        name="price-type"
                                        value="B2B"
                                        checked={priceType === "B2B"}
                                        onChange={handlePriceTypeChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-muted"
                                    />
                                    <label
                                        htmlFor="b2b-price"
                                        className="ml-2 text-sm text-text dark:text-text-dark"
                                    >
                                        B2B Price
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="b2c-price"
                                        name="price-type"
                                        value="B2C"
                                        checked={priceType === "B2C"}
                                        onChange={handlePriceTypeChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-muted"
                                    />
                                    <label
                                        htmlFor="b2c-price"
                                        className="ml-2 text-sm text-text dark:text-text-dark"
                                    >
                                        B2C Price
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-text dark:text-text-dark mb-2">
                            Theme
                        </h3>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleSettingSection;
