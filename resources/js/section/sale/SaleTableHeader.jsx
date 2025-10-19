import { usePage } from "@inertiajs/react";

const SaleTableHeader = () => {
    const props = usePage();
    const { setting } = props;
    return (
        <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark sticky top-0 z-10">
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[2%]">
                    SL
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[25%]">
                    Product
                </th>

                {setting?.color_view === 1 ? (
                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                        Color
                    </th>
                ) : null}
                {setting?.size_view === 1 ? (
                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                        Size
                    </th>
                ) : null}
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                    Price
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                    Qty
                </th>
                {setting?.sale_hands_on_discount === 1 ? (
                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                        Discount
                    </th>
                ) : null}
                {setting?.warranty === 1 ? (
                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                        Warranty
                    </th>
                ) : null}
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                    Total
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[5%]">
                    Action
                </th>
            </tr>
        </thead>
    );
};

export default SaleTableHeader;
