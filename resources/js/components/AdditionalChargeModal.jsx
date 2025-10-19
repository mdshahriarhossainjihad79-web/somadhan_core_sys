import { Icon } from "@iconify/react";
import { useEffect, useMemo } from "react";

const AdditionalChargeModal = ({
    additionalChargeItems,
    handleChargeChange,
    handleRemoveCharge,
    handleAddAdditionalCharge,
    setAdditionalChargeModalOpen,
    handleSaveCharges,
    setNewChargeModalOpen,
    additionalChargeNames,
}) => {
    // Ensure at least one default charge field is shown
    useEffect(() => {
        if (additionalChargeItems.length === 0) {
            handleAddAdditionalCharge();
        }
    }, [additionalChargeItems, handleAddAdditionalCharge]);

    // Limit the number of additional charges to the number of additionalChargeNames
    const canAddMoreCharges =
        additionalChargeItems.length < additionalChargeNames.length;

    // Get selected purposes to filter them out from dropdown options
    const selectedPurposes = useMemo(() => {
        return additionalChargeItems
            .filter((charge) => charge.purpose)
            .map((charge) => charge.purpose);
    }, [additionalChargeItems]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4">
                    Additional Charge
                </h2>
                {additionalChargeItems.map((charge) => {
                    // console.log("charge from modal", charge);
                    // Filter available options for this specific charge field
                    const availableOptions = additionalChargeNames.filter(
                        (option) =>
                            !selectedPurposes.includes(option.name) ||
                            option.id === parseInt(charge.additionalChargeId)
                    );

                    return (
                        <div
                            key={charge.id}
                            className="flex items-center gap-2 mb-4"
                        >
                            <select
                                value={charge.additionalChargeId || ""}
                                onChange={(e) =>
                                    handleChargeChange(
                                        charge.id,
                                        "purpose",
                                        e.target.value
                                    )
                                }
                                className="flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                                aria-label="Charge Purpose"
                            >
                                <option value="">Select Purpose</option>
                                {availableOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setNewChargeModalOpen(true)}
                                className="inline-flex items-center px-2 py-1 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-0 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200 text-sm font-medium shadow-sm"
                            >
                                <Icon icon="mdi:plus" className="w-5 h-5" />
                            </button>
                            <input
                                type="number"
                                value={charge.amount}
                                onChange={(e) =>
                                    handleChargeChange(
                                        charge.id,
                                        "amount",
                                        e.target.value
                                    )
                                }
                                min="0"
                                disabled={!charge.additionalChargeId}
                                className="flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                                placeholder="Enter amount"
                                aria-label="Charge Amount"
                            />
                            {additionalChargeItems.length > 1 && (
                                <button
                                    onClick={() =>
                                        handleRemoveCharge(charge.id)
                                    }
                                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                                    aria-label="Remove Charge"
                                >
                                    <Icon
                                        icon="mdi:trash-can-outline"
                                        className="w-5 h-5"
                                    />
                                </button>
                            )}
                        </div>
                    );
                })}
                {canAddMoreCharges && (
                    <button
                        onClick={handleAddAdditionalCharge}
                        className="inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm mb-4"
                    >
                        <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                        Add More
                    </button>
                )}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => handleSaveCharges(additionalChargeItems)}
                        className="inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        Add Charge
                    </button>
                    <button
                        onClick={() => setAdditionalChargeModalOpen(false)}
                        className="inline-flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdditionalChargeModal;
