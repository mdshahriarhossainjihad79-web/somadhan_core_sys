import { Icon } from "@iconify/react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";

const NewChargeModal = ({
    newChargeName,
    setNewChargeName,
    setNewChargeModalOpen,
    setAdditionalChargeNames,
}) => {
    const handleSave = async () => {
        if (newChargeName.trim() === "") {
            alert("Please enter a valid charge name.");
            return;
        }

        try {
            const response = await axios.post("/additional-charge-name/store", {
                name: newChargeName,
            });

            // console.log("response", response.data.data);
            if (response.status === 200 || response.status === 201) {
                // Update additionalChargeNames with the new charge
                setAdditionalChargeNames((prev) => [
                    ...prev,
                    {
                        id: response.data.data.id,
                        name: newChargeName,
                    },
                ]);
                setNewChargeName("");
                setNewChargeModalOpen(false);
                toast.success("Charge name saved successfully!");
            } else {
                toast.error("Failed to save charge name.");
            }
        } catch (error) {
            console.error("Error saving charge name:", error);
            alert("An error occurred while saving the charge name.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-4">
                    Add New Charge Name
                </h2>
                <input
                    type="text"
                    value={newChargeName}
                    onChange={(e) => setNewChargeName(e.target.value)}
                    className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                    placeholder="Enter charge name"
                    aria-label="New Charge Name"
                />
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        onClick={() => setNewChargeModalOpen(false)}
                        className="inline-flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewChargeModal;
