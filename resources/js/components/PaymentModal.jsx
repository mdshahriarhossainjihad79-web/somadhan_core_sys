import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import DatePicker from "react-datepicker";
import axios from "axios";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";

const PaymentModal = ({ isOpen, onClose, item, accounts }) => {
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [transactionAccount, setTransactionAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // default payment account and amount set
    useEffect(() => {
        if (accounts && accounts.length > 0 && !transactionAccount) {
            setTransactionAccount(accounts[0].id);
        }
        if (item && item.due) {
            setAmount(Number(item.due).toFixed(2));
        }
    }, [accounts, item, transactionAccount]);

    if (!isOpen || !item) return null;

    const handleAmountChange = (e) => {
        const value = e.target.value;
        const due = Number(item.due);
        if (value === "" || (Number(value) <= due && Number(value) >= 0)) {
            setAmount(value);
            setErrors((prev) => ({ ...prev, amount: null }));
        } else {
            setErrors((prev) => ({
                ...prev,
                amount: [`Amount cannot be greater than due amount (${due}).`],
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // client side validation
        if (!transactionAccount) {
            setErrors({
                transaction_account: ["Please select a payment account."],
            });
            setIsSubmitting(false);
            return;
        }
        if (!amount || Number(amount) <= 0) {
            setErrors({ amount: ["Please enter a valid amount."] });
            setIsSubmitting(false);
            return;
        }
        if (Number(amount) > Number(item.due)) {
            setErrors({
                amount: [
                    `Amount cannot be greater than due amount (${item.due}).`,
                ],
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(`/sale/payment/${item?.id}`, {
                payment_date: paymentDate.toISOString().split("T")[0],
                transaction_account: transactionAccount,
                amount: Number(amount),
                note: note,
            });

            if (response.data.status === 200) {
                toast.success(response.data.message, {
                    duration: 4000,
                    position: "top-center",
                });
                router.reload({ only: ["sales"] });
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const serverErrors = error.response.data.errors;
                setErrors(serverErrors);
                toast.error(error.response.data.error, {
                    duration: 4000,
                    position: "top-center",
                });
            } else {
                toast.error("An unexpected error occurred.", {
                    duration: 4000,
                    position: "top-center",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-center mb-4">
                    <Icon
                        icon="fluent:payment-16-filled"
                        className="h-16 w-16 text-purple-500"
                    />
                </div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
                    Payment for Invoice #{item?.invoice_number || "N/A"}
                </h2>
                <div className="mb-4 text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                    <p className="font-semibold flex justify-between">
                        <span>Receivable:</span>{" "}
                        <span className="font-normal">
                            ৳{Number(item?.grand_total || 0).toFixed(2)}
                        </span>
                    </p>
                    <p className="font-semibold flex justify-between">
                        <span>Paid:</span>{" "}
                        <span className="font-normal">
                            ৳{Number(item?.paid || 0).toFixed(2)}
                        </span>
                    </p>
                    <p className="font-semibold flex justify-between">
                        <span>Due:</span>{" "}
                        <span className="font-normal">
                            ৳{Number(item?.due || 0).toFixed(2)}
                        </span>
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Payment Date *
                        </label>
                        <div className="relative">
                            <DatePicker
                                selected={paymentDate}
                                onChange={(date) => setPaymentDate(date)}
                                maxDate={new Date()}
                                className="border rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                dateFormat="yyyy-MM-dd"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                            />
                            <Icon
                                icon="mdi:calendar"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">
                                Payment Account *
                            </label>
                            <select
                                value={transactionAccount}
                                onChange={(e) =>
                                    setTransactionAccount(e.target.value)
                                }
                                className="border rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                            >
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                            {errors.transaction_account && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.transaction_account[0]}
                                </p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">
                                Amount *
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                className="border rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                min="0"
                                step="0.01"
                                max={Number(item?.due)}
                            />
                            {errors.amount && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.amount[0]}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Note
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="border rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                            rows="4"
                        />
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-200 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (
                                <Icon
                                    icon="mdi:loading"
                                    className="h-5 w-5 animate-spin"
                                />
                            ) : (
                                "Payment"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
