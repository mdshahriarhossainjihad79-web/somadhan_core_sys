import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Discount from "../../components/Discount";
import useAdditionalCharges from "../../hook/useAdditionalCharges";
import AdditionalChargeModal from "../../components/AdditionalChargeModal";
import NewChargeModal from "../../components/NewChargeModal";
import MultiplePaymentModal from "../sale/MultiplePaymentModal";
import NoteModal from "../../components/NoteModal";
import ErrorPopover from "../../components/ErrorPopover";
import cn from "../../utils/cn";

const Cart = ({
    cartItems,
    removeFromCart,
    updateQuantity,
    tax,
    setTax,
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    setting,
    discountType,
    setDiscountType,
    taxes,
    payAmount,
    setPayAmount,
    handlePayAmountChange,
    additionalChargeNames,
    handleMultiplePayment,
    multiplePaymentModal,
    setMultiplePaymentModal,
    invoiceWithMultiplePayment,
    paymentRows,
    setPaymentRows,
    advanceDue,
    setAdvanceDue,
    handlePayClick,
    handleDraftClick,
    productTotal,
    setProductTotal,
    discount,
    setDiscount,
    handleDiscountChange,
    discountValue,
    invoiceTotal,
    setInvoiceTotal,
    additionalChargesTotal,
    setAdditionalChargesTotal,
    additionalChargeItems,
    setAdditionalChargeItems,
    errors,
    setErrors,
    note,
    setNote,
    isRoundTotal,
    setIsRoundTotal,
    isPayFull,
    setIsPayFull,
    isNoteModalOpen,
    setIsNoteModalOpen,
    paymentRef,
    popoverPosition,
}) => {
    const {
        tempAdditionalCharges,
        setTempAdditionalCharges,
        additionalChargeModalOpen,
        setAdditionalChargeModalOpen,
        newChargeModalOpen,
        setNewChargeModalOpen,
        newChargeName,
        setNewChargeName,
        additionalChargeNames: localAdditionalChargeNames,
        setAdditionalChargeNames,
        handleAddAdditionalCharge,
        handleChargeChange,
        handleRemoveCharge,
        handleSaveCharges,
        handleCloseModal,
        handleSaveNewCharge,
    } = useAdditionalCharges(additionalChargeItems, additionalChargeNames);

    // Sync temp with items
    useEffect(() => {
        setTempAdditionalCharges(additionalChargeItems);
    }, [additionalChargeItems]);

    // Calculate product total
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => {
            const price =
                setting?.sale_price_type === "b2c_price"
                    ? item.b2c_price
                    : item.b2b_price;
            return sum + price * item.quantity;
        }, 0);
        setProductTotal(total);
    }, [cartItems, setting, setProductTotal]);

    // Calculate additional charges total
    useEffect(() => {
        const total = additionalChargeItems.reduce((sum, charge) => {
            return sum + (parseFloat(charge.amount) || 0);
        }, 0);
        setAdditionalChargesTotal(total);
    }, [additionalChargeItems, setAdditionalChargesTotal]);

    const taxValue = useMemo(() => {
        const calculatedTotalWithDiscountAmount = productTotal - discountValue;
        return (
            ((parseFloat(tax) || 0) * calculatedTotalWithDiscountAmount) / 100
        );
    }, [tax, productTotal, discountValue]);

    useEffect(() => {
        const total = productTotal - discountValue + taxValue;
        setInvoiceTotal(total);

        const totalWithAdditionalCharge = total + additionalChargesTotal;
        const calculatedAdvanceDue =
            totalWithAdditionalCharge - (parseFloat(payAmount) || 0);
        setAdvanceDue(calculatedAdvanceDue);
    }, [
        productTotal,
        discountValue,
        taxValue,
        additionalChargesTotal,
        payAmount,
    ]);

    // Handle Pay Full checkbox
    useEffect(() => {
        const subTotal = invoiceTotal + additionalChargesTotal;
        if (isPayFull) {
            setPayAmount(
                isRoundTotal
                    ? Math.round(subTotal)
                    : Number(subTotal).toFixed(2)
            );
        } else {
            setPayAmount("");
        }
    }, [
        isPayFull,
        invoiceTotal,
        additionalChargesTotal,
        isRoundTotal,
        setPayAmount,
    ]);

    const subTotal = invoiceTotal + additionalChargesTotal;

    const handleAddNote = () => {
        setIsNoteModalOpen(true);
    };

    return (
        <div className="w-full md:w-96 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border">
            <h2 className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-200">
                Cart
            </h2>

            {/* Cart Items */}
            <div className="max-h-[30vh] lg:max-h-[50vh] overflow-y-auto">
                {cartItems.length === 0 ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Cart is empty
                    </p>
                ) : (
                    <>
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded"
                            >
                                <div className="w-[30%]">
                                    <h3 className="text-xs text-gray-800 dark:text-gray-200 truncate ">
                                        {item?.product?.name ?? "N/A"}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {setting?.sale_price_type ===
                                        "b2c_price"
                                            ? item?.b2c_price
                                            : item?.b2b_price || 0}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                item.quantity - 1
                                            )
                                        }
                                        className="px-1.5 py-0.5 bg-gray-300 dark:bg-gray-600 text-xs rounded"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                item.quantity + 1
                                            )
                                        }
                                        className="px-1.5 py-0.5 bg-gray-300 dark:bg-gray-600 text-xs rounded"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {parseFloat(
                                            (setting?.sale_price_type ===
                                            "b2c_price"
                                                ? item?.b2c_price
                                                : item?.b2b_price) *
                                                item.quantity
                                        ).toFixed(2) || 0}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 text-lg"
                                    >
                                        <Icon icon="tabler:trash" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Financial Fields */}
            <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-text dark:text-text-dark">
                        Product Total:
                    </span>
                    <span className="text-xs text-text dark:text-text-dark">
                        ৳ {productTotal.toFixed(2)}
                    </span>
                </div>

                <Discount
                    discount={discount}
                    setDiscount={setDiscount}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    productTotal={productTotal}
                    handleDiscountChange={handleDiscountChange}
                    discountValue={discountValue}
                    smallSize={true}
                />

                <div className="flex items-center gap-1 min-w-[200px]">
                    <label className="w-32 text-xs font-medium text-text dark:text-text-dark whitespace-nowrap">
                        Tax (%):
                    </label>
                    <div className="flex items-center gap-2 w-full">
                        <select
                            value={tax}
                            onChange={(e) => setTax(e.target.value)}
                            className="flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                            aria-label="Tax Percentage"
                        >
                            <option value="">Select Tax</option>
                            {taxes.map((tax, i) => (
                                <option key={i} value={tax.percentage}>
                                    {tax?.name ?? "N/A"} ({tax?.percentage ?? 0}
                                    )
                                </option>
                            ))}
                        </select>
                        {tax && (
                            <span className="text-xs text-text dark:text-text-dark whitespace-nowrap">
                                ৳ {taxValue.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-text dark:text-text-dark">
                        Invoice Total:
                    </span>
                    <span className="text-xs text-text dark:text-text-dark">
                        ৳ {Number(invoiceTotal).toFixed(2)}
                    </span>
                </div>

                <div className="flex items-center gap-1 min-w-[200px]">
                    <label className="w-32 text-xs font-medium text-text dark:text-text-dark whitespace-nowrap">
                        Additional Charge:
                    </label>
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="text"
                            value={additionalChargesTotal.toFixed(2)}
                            readOnly
                            className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                            aria-label="Additional Charge"
                        />
                        <button
                            onClick={() => {
                                setTempAdditionalCharges(additionalChargeItems);
                                setAdditionalChargeModalOpen(true);
                            }}
                            className="inline-flex items-center px-2 py-1 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-0 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200 text-xs font-medium shadow-sm"
                        >
                            <Icon icon="mdi:plus" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-text dark:text-text-dark">
                        Grand Total:
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text dark:text-text-dark">
                            ৳{" "}
                            {isRoundTotal
                                ? Math.round(subTotal)
                                : Number(subTotal).toFixed(2)}
                        </span>
                        <label className="flex items-center text-xs text-text dark:text-text-dark whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={isRoundTotal}
                                onChange={(e) =>
                                    setIsRoundTotal(e.target.checked)
                                }
                                className="mr-1 h-4 w-4 text-primary dark:text-primary-dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                aria-label="Round Grand Total"
                            />
                            Round
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-1 min-w-[200px]">
                    <label className="w-32 text-xs font-medium text-text dark:text-text-dark whitespace-nowrap">
                        Pay Amount:
                    </label>
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="number"
                            value={payAmount}
                            onChange={handlePayAmountChange}
                            min="0"
                            className="flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                            placeholder="Enter pay amount"
                            aria-label="Pay Amount"
                        />
                        <label className="flex items-center text-xs text-text dark:text-text-dark whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={isPayFull}
                                onChange={(e) => setIsPayFull(e.target.checked)}
                                className="mr-1 h-4 w-4 text-primary dark:text-primary-dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                aria-label="Pay Full Amount"
                            />
                            Full
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-text dark:text-text-dark">
                        {advanceDue > 0 ? "Due" : "Return"} Amount:
                    </span>
                    <span className="text-xs text-text dark:text-text-dark">
                        ৳ {Number(advanceDue).toFixed(2)}
                    </span>
                </div>

                <div className="flex items-center gap-1 min-w-[200px]">
                    <label className="w-32 text-xs font-medium text-text dark:text-text-dark whitespace-nowrap">
                        Payment Method:
                    </label>
                    <div className="flex items-center gap-2 w-full">
                        <div
                            className={cn(
                                "relative w-full",
                                true ? "w-[75%]" : "w-full" // Assuming showMultiplePaymentMethod is true
                            )}
                            ref={paymentRef}
                        >
                            <select
                                className={cn(
                                    `w-full py-1 px-2 border rounded-md text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark`,
                                    errors.selectedPaymentMethod
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
                                )}
                                onChange={(e) => {
                                    setSelectedPaymentMethod(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        selectedPaymentMethod: undefined,
                                    }));
                                }}
                                value={selectedPaymentMethod || ""}
                                aria-label="Payment Method"
                            >
                                <option value="">Select Payment Method</option>
                                {paymentMethods.map((bank) => (
                                    <option key={bank?.id} value={bank?.id}>
                                        {bank?.name ?? "N/A"}
                                    </option>
                                ))}
                            </select>
                            <ErrorPopover
                                isOpen={!!errors.selectedPaymentMethod}
                                message={errors.selectedPaymentMethod}
                                position={popoverPosition}
                            />
                        </div>
                        <button
                            onClick={handleMultiplePayment}
                            className="inline-flex items-center px-2 py-1 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-0 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200 text-xs font-medium shadow-sm whitespace-nowrap"
                        >
                            Split Payment
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row justify-end gap-4 mt-2">
                    <button
                        onClick={handleAddNote}
                        className="inline-flex items-center px-4 py-2 bg-secondary dark:bg-primary text-white rounded-md hover:bg-primary dark:hover:bg-secondary focus:ring-2 border-none transition-colors duration-200 text-xs font-medium shadow-sm"
                        aria-label="Add Note"
                    >
                        <Icon
                            icon="hugeicons:note-02"
                            className="w-4 h-4 mr-2"
                        />
                        Note
                    </button>
                    <button
                        onClick={handleDraftClick}
                        className="inline-flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 focus:ring-opacity-50 transition-colors duration-200 text-xs font-medium shadow-sm"
                        aria-label="Save as Draft"
                    >
                        <Icon
                            icon="mdi:content-save"
                            className="w-4 h-4 mr-2"
                        />
                        Draft
                    </button>
                    <button
                        onClick={handlePayClick}
                        className="inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-xs font-medium shadow-sm"
                        aria-label="Pay"
                    >
                        <Icon icon="mdi:credit-card" className="w-4 h-4 mr-2" />
                        Pay
                    </button>
                </div>
            </div>

            {/* Additional Charge Modal */}
            {additionalChargeModalOpen && (
                <AdditionalChargeModal
                    additionalChargeItems={tempAdditionalCharges}
                    handleChargeChange={handleChargeChange}
                    setNewChargeModalOpen={setNewChargeModalOpen}
                    handleRemoveCharge={handleRemoveCharge}
                    handleAddAdditionalCharge={handleAddAdditionalCharge}
                    handleSaveCharges={(charges) => {
                        handleSaveCharges(charges);
                        setAdditionalChargeItems(charges);
                    }}
                    setAdditionalChargeModalOpen={handleCloseModal}
                    additionalChargeNames={localAdditionalChargeNames}
                />
            )}

            {/* New Charge Name Modal */}
            {newChargeModalOpen && (
                <NewChargeModal
                    newChargeName={newChargeName}
                    setNewChargeName={setNewChargeName}
                    setNewChargeModalOpen={setNewChargeModalOpen}
                    setAdditionalChargeNames={setAdditionalChargeNames}
                />
            )}

            {/* Multiple Payment modal  */}
            <MultiplePaymentModal
                isOpen={multiplePaymentModal}
                onClose={() => setMultiplePaymentModal(false)}
                banks={paymentMethods}
                grandTotal={subTotal}
                advanceDue={advanceDue}
                setAdvanceDue={setAdvanceDue}
                invoiceWithMultiplePayment={invoiceWithMultiplePayment}
                paymentRows={paymentRows}
                setPaymentRows={setPaymentRows}
                setPayAmount={setPayAmount}
            />

            {/* Note Modal */}
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                note={note}
                setNote={setNote}
            />
        </div>
    );
};

export default Cart;
