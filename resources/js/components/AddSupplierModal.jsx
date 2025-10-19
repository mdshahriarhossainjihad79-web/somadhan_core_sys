import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Loader from "./Loader";

const AddSupplierModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        openingBalance: "",
        creditLimit: "",
        email: "",
        address: "",
    });
    const [errors, setErrors] = useState({});

    // Phone number validation regex (simple example, can be customized)
    // const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Handle input changes
    const handleInputChange = (field, value) => {
        if (
            (field === "openingBalance" || field === "creditLimit") &&
            value &&
            parseFloat(value) < 0
        ) {
            toast.error("Negative values are not allowed.");
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    // Handle form submission
    const handleSubmit = () => {
        const newErrors = {};

        // Validate required fields
        if (!formData.name) {
            newErrors.name = "Supplier name is required.";
        }
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required.";
        }
        // else if (!phoneRegex.test(formData.phoneNumber)) {
        //     newErrors.phoneNumber = "Invalid phone number format.";
        // }
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Object.values(newErrors).forEach((error) => toast.error(error));
            return;
        }

        // Prepare data for submission
        const supplierData = {
            name: formData.name,
            phone_number: formData.phoneNumber,
            opening_balance: parseFloat(formData.openingBalance) || 0,
            credit_limit: parseFloat(formData.creditLimit) || 0,
            email: formData.email || null,
            address: formData.address || null,
        };

        onSubmit(supplierData);
        onClose();
        // ফর্ম রিসেট
        setFormData({
            name: "",
            phoneNumber: "",
            openingBalance: "",
            creditLimit: "",
            email: "",
            address: "",
        });
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] px-2 sm:px-4">
            {isLoading && <Loader />}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-[98vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-text dark:text-text-dark">
                        Add New Supplier
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-600 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <Icon icon="mdi:close" width="24" height="24" />
                    </button>
                </div>

                {/* Supplier Name */}
                <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                        Supplier Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            handleInputChange("name", e.target.value)
                        }
                        className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                        placeholder="Enter supplier name"
                    />
                    {errors.name && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.name}
                        </span>
                    )}
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                        Phone Number *
                    </label>
                    <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                        }
                        className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                        placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.phoneNumber}
                        </span>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                            activeTab === "basic"
                                ? "border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark"
                                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark"
                        }`}
                        onClick={() => setActiveTab("basic")}
                    >
                        Basic Information
                    </button>
                    <button
                        className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                            activeTab === "additional"
                                ? "border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark"
                                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark"
                        }`}
                        onClick={() => setActiveTab("additional")}
                    >
                        Additional Information
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "basic" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                Opening Payable
                            </label>
                            <input
                                type="number"
                                value={formData.openingBalance}
                                onChange={(e) =>
                                    handleInputChange(
                                        "openingBalance",
                                        e.target.value
                                    )
                                }
                                className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                placeholder="Enter opening balance"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                Credit Limit
                            </label>
                            <input
                                type="number"
                                value={formData.creditLimit}
                                onChange={(e) =>
                                    handleInputChange(
                                        "creditLimit",
                                        e.target.value
                                    )
                                }
                                className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                placeholder="Enter credit limit"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "additional" && (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    handleInputChange("email", e.target.value)
                                }
                                className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                placeholder="Enter email"
                            />
                            {errors.email && (
                                <span className="text-red-500 text-xs mt-1">
                                    {errors.email}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) =>
                                    handleInputChange("address", e.target.value)
                                }
                                className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                placeholder="Enter address"
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text dark:text-text-dark rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary-darkest text-xs sm:text-sm transition-colors duration-200"
                    >
                        Add Supplier
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSupplierModal;
