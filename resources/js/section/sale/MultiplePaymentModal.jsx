import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import cn from "../../utils/cn";

const MultiplePaymentModal = ({
    isOpen,
    onClose,
    banks,
    grandTotal,
    advanceDue,
    invoiceWithMultiplePayment,
    paymentRows,
    setPaymentRows,
    setAdvanceDue,
    setPayAmount,
}) => {
    const [totalPaid, setTotalPaid] = useState(0);
    const [calculatedAdvanceDue, setCalculatedAdvanceDue] =
        useState(advanceDue);

    const [isPayButtonDisabled, setIsPayButtonDisabled] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");
    const [focusedRowId, setFocusedRowId] = useState(null);

    // Calculate total paid and advance/due
    useEffect(() => {
        const total = paymentRows.reduce(
            (sum, row) => sum + (parseFloat(row.amount) || 0),
            0
        );
        setTotalPaid(total);
        setPayAmount(total);
        setCalculatedAdvanceDue(grandTotal - total);
        setAdvanceDue(grandTotal - total);

        // Check if total paid exceeds grand total
        if (total > grandTotal) {
            setErrorMessage("Pay amount must be accurate to grand total.");
            setIsPayButtonDisabled(true); // Disable Pay button if total exceeds grand total
        } else {
            setErrorMessage("");
            const isValid = paymentRows.every((row) => {
                return row.bankId && row.amount && parseFloat(row.amount) > 0;
            });
            setIsPayButtonDisabled(!isValid);
        }
    }, [paymentRows, grandTotal, setPayAmount, setAdvanceDue]);

    // useEffect(() => {
    //     const isValid = paymentRows.every((row) => {
    //         return row.bankId && row.amount && parseFloat(row.amount) > 0;
    //     });
    //     setIsPayButtonDisabled(!isValid);
    // }, [paymentRows]);

    // Filter available bank options
    const getFilteredBankOptions = (currentRowId) => {
        const selectedBankIds = paymentRows
            .filter((row) => row.id !== currentRowId && row.bankId)
            .map((row) => String(row.bankId)); // Ensure bankId is string
        // console.log("Selected Bank IDs:", selectedBankIds); // Debugging
        const filteredBanks = banks
            .filter((bank) => !selectedBankIds.includes(String(bank.id))) // Ensure bank.id is string
            .map((bank) => ({
                label: bank.name,
                value: String(bank.id), // Ensure value is string
            }));
        // console.log("Filtered Banks:", filteredBanks); // Debugging
        return filteredBanks;
    };

    // Handle bank selection
    const handleBankChange = (rowId, value) => {
        setPaymentRows((prevRows) =>
            prevRows.map((row) =>
                row.id === rowId ? { ...row, bankId: value } : row
            )
        );
    };

    // Handle amount change
    const handleAmountChange = (rowId, value) => {
        setPaymentRows((prevRows) =>
            prevRows.map((row) =>
                row.id === rowId ? { ...row, amount: value } : row
            )
        );
    };

    // Handle input focus
    const handleInputFocus = (rowId) => {
        setFocusedRowId(rowId);
    };

    // Handle input blur
    const handleInputBlur = () => {
        setFocusedRowId(null);
    };

    // Add new payment row
    const handleAddPaymentRow = () => {
        if (paymentRows.length < banks.length) {
            setPaymentRows((prevRows) => [
                ...prevRows,
                { id: Date.now(), bankId: "", amount: "" },
            ]);
        }
    };

    // Delete payment row
    const handleDeletePaymentRow = (rowId) => {
        if (paymentRows.length > 1) {
            setPaymentRows((prevRows) =>
                prevRows.filter((row) => row.id !== rowId)
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-4 w-full max-w-lg transition-colors duration-300 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary-dark focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 rounded-full p-1 transition-colors duration-200"
                    aria-label="Close modal"
                >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4 border-l-4 border-primary pl-2">
                    Split Payment
                </h2>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                            Grand Total
                        </label>
                        <input
                            type="text"
                            value={grandTotal.toFixed(2)}
                            readOnly
                            className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                            aria-label="Grand Total"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                            Total Paid
                        </label>
                        <input
                            type="text"
                            value={totalPaid.toFixed(2)}
                            readOnly
                            className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                            aria-label="Total Paid"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                            {calculatedAdvanceDue > 0 ? "Due" : "Return"} Amount
                        </label>
                        <input
                            type="text"
                            value={calculatedAdvanceDue.toFixed(2)}
                            readOnly
                            className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                            aria-label="Advance or Due Amount"
                        />
                    </div>
                </div>

                <div className="mb-4 max-h-64 overflow-y-auto">
                    {paymentRows.map((row, index) => (
                        <div
                            key={row.id}
                            className="grid grid-cols-12 gap-2 mb-2 items-end"
                        >
                            <div className="col-span-5">
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Payment Method {index + 1}
                                </label>
                                <select
                                    value={row.bankId}
                                    onChange={(e) =>
                                        handleBankChange(row.id, e.target.value)
                                    }
                                    className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                                    aria-label={`Payment Method ${index + 1}`}
                                >
                                    <option value="">
                                        Select Payment Method
                                    </option>
                                    {getFilteredBankOptions(row.id).map(
                                        (bank) => (
                                            <option
                                                key={bank.value}
                                                value={bank.value}
                                            >
                                                {bank.label ?? "N/A"}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div className="col-span-5">
                                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={row.amount}
                                    onChange={(e) =>
                                        handleAmountChange(
                                            row.id,
                                            e.target.value
                                        )
                                    }
                                    onFocus={() => handleInputFocus(row.id)}
                                    onBlur={handleInputBlur}
                                    min="0"
                                    disabled={!row.bankId} // Disable input if bankId is empty
                                    className={cn(
                                        "w-full py-1 px-2 border rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark",
                                        !row.bankId
                                            ? "opacity-50 cursor-not-allowed"
                                            : "",
                                        totalPaid > grandTotal &&
                                            focusedRowId === row.id
                                            ? "border-red-500 dark:border-red-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    )}
                                    placeholder={
                                        row.bankId
                                            ? "Enter amount"
                                            : "Select payment method first"
                                    }
                                    aria-label={`Payment Amount ${index + 1}`}
                                />
                            </div>
                            <div className="col-span-2">
                                {paymentRows.length > 1 && (
                                    <button
                                        onClick={() =>
                                            handleDeletePaymentRow(row.id)
                                        }
                                        className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200"
                                        aria-label="Delete payment row"
                                    >
                                        <Icon
                                            icon="iconamoon:trash-light"
                                            width="20"
                                            height="20"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {errorMessage && (
                        <div className="text-red-500 dark:text-red-400 text-sm mt-2">
                            {errorMessage}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleAddPaymentRow}
                        disabled={paymentRows.length >= banks.length}
                        className={`inline-flex items-center px-3 py-1 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary transition-colors duration-200 text-sm font-medium shadow-sm ${
                            paymentRows.length >= banks.length
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        aria-label="Add more payment methods"
                    >
                        <Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
                        Add More
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={invoiceWithMultiplePayment}
                        disabled={isPayButtonDisabled}
                        className={`inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm ${
                            isPayButtonDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        aria-label="Pay"
                    >
                        <Icon icon="mdi:credit-card" className="w-5 h-5 mr-2" />
                        Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiplePaymentModal;
