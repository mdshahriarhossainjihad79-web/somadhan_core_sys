import { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";
import cn from "../utils/cn";

const MainLayouts = ({
    children,
    showHeader = true,
    showFooter = true,
    defaultSidebarState = true,
    isPrintMode = false,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(defaultSidebarState);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            {showHeader && !isPrintMode && (
                <header
                    className={`bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center flex-wrap gap-4 fixed top-0 transition-all duration-300 z-30 ${
                        isSidebarOpen
                            ? "ml-64 w-[calc(100%-16rem)]"
                            : "ml-16 w-[calc(100%-4rem)]"
                    }`}
                >
                    <Header />
                </header>
            )}

            <div className="flex flex-1">
                {/* Sidebar */}
                {!isPrintMode && (
                    <aside
                        className={`bg-gray-800 text-white h-screen fixed top-0 left-0 transition-all duration-300 ${
                            isSidebarOpen ? "w-64" : "w-16"
                        } sm:h-full overflow-y-auto z-20`}
                    >
                        <Sidebar
                            isSidebarOpen={isSidebarOpen}
                            toggleSidebar={toggleSidebar}
                        />
                    </aside>
                )}

                <Toaster position="top-center" reverseOrder={false} />

                {/* Main Content */}
                <main
                    className={cn(
                        `flex-1  p-4 transition-all duration-300 min-h-[calc(100vh-20rem)]`,
                        isSidebarOpen && !isPrintMode
                            ? "ml-64 w-[calc(100%-16rem)]"
                            : "ml-16 w-[calc(100%-4rem)]",
                        showHeader && !isPrintMode ? "mt-20" : "mt-0",
                        isPrintMode ? "ml-0 w-full p-0" : ""
                    )}
                >
                    {children}
                </main>
            </div>

            {/* Footer */}
            {showFooter && !isPrintMode && (
                <Footer isSidebarOpen={isSidebarOpen} />
            )}

            <style jsx>{`
                @media print {
                    header,
                    aside,
                    footer {
                        display: none !important;
                    }
                    main {
                        margin: 5px !important;
                        padding: 5px !important;
                        width: 100% !important;
                        min-height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MainLayouts;
