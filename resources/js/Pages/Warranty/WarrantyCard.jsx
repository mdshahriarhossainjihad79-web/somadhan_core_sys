import { Icon } from "@iconify/react";
import MainLayouts from "../../layouts/MainLayouts";

const WarrantyCard = ({ warranty }) => {
    // Fallback values for missing data
    const invoiceNumber = warranty?.sale?.invoice_number ?? "N/A";
    const customerName = warranty?.sale?.customer?.name ?? "N/A";
    const productName = warranty?.product?.name ?? "N/A";
    const color = warranty?.variant?.color_name?.name ?? "N/A";
    const size = warranty?.variant?.variation_size?.size ?? "N/A";
    const duration = warranty?.duration ?? "N/A";
    const startDate = warranty?.start_date ?? "N/A";
    const endDate = warranty?.end_date ?? "N/A";
    const status = warranty?.status ?? "N/A";

    return (
        <MainLayouts>
            <div className="max-w-sm w-full bg-white rounded-xl shadow-lg p-6 mx-auto transition-all duration-300 hover:shadow-xl border border-gray-100">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Icon
                            icon="mdi:shield-check-outline"
                            className="h-6 w-6 text-blue-600"
                        />
                        <h2 className="text-lg font-bold text-gray-800">
                            Warranty Card
                        </h2>
                    </div>
                    {/* Placeholder for company logo */}
                    <div className="text-gray-500 text-sm font-semibold">
                        YourBrand
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-4"></div>

                {/* Warranty Details */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Invoice Number:
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                            #{invoiceNumber}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Customer:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {customerName}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Product:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {productName}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Color:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {color}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Size:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {size}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Duration:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {duration}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Start Date:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {startDate}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            End Date:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            {endDate}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Status:
                        </span>
                        <span
                            className={`text-sm font-semibold ${
                                status === "Active"
                                    ? "text-green-600"
                                    : status === "Expired"
                                    ? "text-red-600"
                                    : "text-gray-600"
                            }`}
                        >
                            {status}
                        </span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Issued by YourBrand
                    </div>
                    {/* Optional QR Code Placeholder */}
                    {/* <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                </div> */}
                </div>
            </div>
        </MainLayouts>
    );
};

export default WarrantyCard;
