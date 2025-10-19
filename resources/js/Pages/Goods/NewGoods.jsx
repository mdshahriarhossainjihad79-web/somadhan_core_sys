import React from "react";
import { Toaster } from "react-hot-toast";
import SaleSettingSection from "../../section/sale/SaleSettingSection";

const NewGoods = () => {
    return (
        <div>
            <div className="min-h-screen bg-background-light dark:bg-background-dark px-6 md:px-12 py-5 md:py-8 transition-colors duration-300">
                <Toaster position="top-center" reverseOrder={false} />
                <SaleSettingSection />
                <div className="flex items-center justify-between mb-3">
                    <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary rounded-md transition-colors duration-200 shadow-sm"
                    >
                        Back to Dashboard
                    </a>
                </div>
                <h2 className="text-2xl font-semibold text-text dark:text-text-dark mb-4 rounded-sm border-l-4 border-primary pl-4">
                    Sale Page
                </h2>

            </div>
        </div>
    );
};

export default NewGoods;
