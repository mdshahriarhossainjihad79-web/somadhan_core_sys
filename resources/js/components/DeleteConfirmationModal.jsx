import { Icon } from "@iconify/react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center bg-red-100 rounded-full h-14 w-14 sm:h-16 sm:w-16 hover:bg-red-200 transition-colors duration-200">
                        <Icon
                            icon="mdi:exclamation"
                            className="h-8 w-8 sm:h-10 sm:w-10 text-red-500"
                        />
                    </div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-4">
                    Delete Confirmation
                </h2>
                <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
                    Are you sure you want to delete this invoice{" "}
                    <span className="text-red-400">
                        {itemId.invoice_number}
                    </span>
                    ?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => onConfirm(itemId.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
