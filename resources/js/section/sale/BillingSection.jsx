import { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { usePage } from "@inertiajs/react";
import MultiplePaymentModal from "./MultiplePaymentModal";
import usePosSettings from "../../hook/usePosSettings";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import AdditionalChargeModal from "../../components/AdditionalChargeModal";
import NewChargeModal from "../../components/NewChargeModal";
import cn from "../../utils/cn";
import ErrorPopover from "../../components/ErrorPopover";
import NoteModal from "../../components/NoteModal";
import Discount from "../../components/Discount";
import useAdditionalCharges from "../../hook/useAdditionalCharges";

const BillingSection = ({
    rows = [],
    handleDraftClick,
    handlePayClick,
    productTotal,
    setProductTotal,
    discountType,
    setDiscountType,
    tax,
    setTax,
    discount,
    setDiscount,
    handleDiscountChange,
    invoiceTotal,
    setInvoiceTotal,
    subTotal,
    setSubTotal,
    advanceDue,
    setAdvanceDue,
    isRoundTotal,
    setIsRoundTotal,
    payAmount,
    setPayAmount,
    handlePayAmountChange,
    paymentMethod,
    setPaymentMethod,
    additionalChargesTotal,
    setAdditionalChargesTotal,
    parentAdditionalChargeItems,
    setParentAdditionalChargeItems,
    errors,
    setErrors,
    discountValue,
    note,
    setNote,
    handleMultiplePayment,
    multiplePaymentModal,
    setMultiplePaymentModal,
    invoiceWithMultiplePayment,
    paymentRows,
    setPaymentRows,
}) => {
    const { props } = usePage();
    const {
        banks,
        setting,
        taxes,
        additionalChargeNames: initialChargeNames,
    } = props;

    const { billingMenuFields, handleFieldChange, settings } = usePosSettings();
    const { showDiscount, showTax, showMultiplePaymentMethod } = settings;
    // const { showDiscount, showTax } = settings;

    const {
        additionalChargeItems,
        setAdditionalChargeItems,
        tempAdditionalCharges,
        setTempAdditionalCharges,
        additionalChargeModalOpen,
        setAdditionalChargeModalOpen,
        newChargeModalOpen,
        setNewChargeModalOpen,
        newChargeName,
        setNewChargeName,
        additionalChargeNames,
        setAdditionalChargeNames,
        additionalChargesTotal: calculatedAdditionalChargesTotal,
        setAdditionalChargesTotal: setCalculatedAdditionalChargesTotal,
        handleAddAdditionalCharge,
        handleChargeChange,
        handleRemoveCharge,
        handleSaveCharges,
        handleCloseModal,
        handleSaveNewCharge,
    } = useAdditionalCharges(parentAdditionalChargeItems, initialChargeNames);

    // Sync with parent component's additionalChargesTotal
    useEffect(() => {
        setAdditionalChargesTotal(calculatedAdditionalChargesTotal);
    }, [calculatedAdditionalChargesTotal, setAdditionalChargesTotal]);

    // Sync parentAdditionalChargeItems with local state
    useEffect(() => {
        setAdditionalChargeItems(parentAdditionalChargeItems);
    }, [parentAdditionalChargeItems, setAdditionalChargeItems]);

    const bankOptions = useMemo(() => {
        return banks.map((bank) => ({
            label: bank.name,
            value: bank.id,
        }));
    }, [banks]);

    const [isPayFull, setIsPayFull] = useState(false);

    const paymentRef = useRef(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    // popover Position
    useEffect(() => {
        if (paymentRef.current && errors.paymentMethod) {
            const rect = paymentRef.current.getBoundingClientRect();
            setPopoverPosition({
                bottom: 0,
                left: 0,
            });
        }
    }, [errors.paymentMethod]);

    // Calculate product total from rows
    useEffect(() => {
        const total = rows.reduce((sum, row) => {
            const rowTotal = parseFloat(row.total) || 0;
            return sum + rowTotal;
        }, 0);
        setProductTotal(total);
    }, [rows]);

    // Calculate additional charges total
    useEffect(() => {
        const total = additionalChargeItems.reduce((sum, charge) => {
            const totalCharge = parseFloat(charge.amount) || 0;
            return sum + totalCharge;
        }, 0);
        setAdditionalChargesTotal(total);
    }, [additionalChargeItems]);

    const taxValue = useMemo(() => {
        const calculatedTotalWithDiscountAmount = productTotal - discountValue;
        return (
            ((parseFloat(tax) || 0) * calculatedTotalWithDiscountAmount) / 100
        );
    }, [tax, productTotal, discountValue]);

    useEffect(() => {
        const total = productTotal - discountValue + taxValue;
        // setSubTotal(totalWithTaxAndCharges);
        setInvoiceTotal(total);

        const totalWithAdditionalCharge = total + additionalChargesTotal;
        setSubTotal(totalWithAdditionalCharge);

        const calculatedAdvanceDue =
            totalWithAdditionalCharge - (parseFloat(payAmount) || 0);
        setAdvanceDue(calculatedAdvanceDue);
    }, [
        productTotal,
        discountValue,
        taxValue,
        additionalChargesTotal,
        payAmount,
        setting,
    ]);

    const handleDiscountTypeChange = (e) => {
        setDiscountType(e.target.value);
        setDiscount("");
    };

    // Handle Pay Full checkbox change
    useEffect(() => {
        if (isPayFull) {
            setPayAmount(
                isRoundTotal
                    ? Math.round(subTotal)
                    : Number(subTotal).toFixed(2)
            );
        } else {
            setPayAmount("");
        }
    }, [isPayFull, subTotal, isRoundTotal, setPayAmount]);

    const handleMultiplePaymentModalClose = () => {
        setMultiplePaymentModal(false);
    };

    const handleAddNote = () => {
        setIsNoteModalOpen(true);
    };

    return (
        <>
            <div className="absolute bottom-0 left-0 w-full bg-surface-light dark:bg-surface-dark border-gray-300 dark:border-gray-600 z-10">
                <div className="relative mx-auto px-4 sm:px-6 md:px-12 py-4 max-h-[350px] overflow-y-auto overflow-x-auto">
                    <div className="absolute top-1 right-1">
                        <ThreeDotMenu
                            fields={billingMenuFields}
                            onFieldChange={handleFieldChange}
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        <div className="flex flex-col gap-3 md:border-r md:pr-5">
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <label className="w-32 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                    Product Total:
                                </label>
                                <input
                                    type="text"
                                    value={productTotal.toFixed(2)}
                                    readOnly
                                    className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                                    aria-label="Product Total"
                                />
                            </div>

                            {showDiscount && (
                                <Discount
                                    discount={discount}
                                    setDiscount={setDiscount}
                                    discountType={discountType}
                                    setDiscountType={setDiscountType}
                                    productTotal={productTotal}
                                    handleDiscountChange={handleDiscountChange}
                                    discountValue={discountValue}
                                />
                            )}
                            {showTax && (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                    <label className="w-32 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                        Tax (%):
                                    </label>
                                    <div className="flex items-center gap-2 w-full">
                                        <select
                                            value={tax}
                                            onChange={(e) =>
                                                setTax(e.target.value)
                                            }
                                            className="flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                                            aria-label="Tax Percentage"
                                        >
                                            <option value="">Select Tax</option>
                                            {taxes.map((tax, i) => (
                                                <option
                                                    key={i}
                                                    value={tax.percentage}
                                                >
                                                    {tax?.name ?? "N/A"} (
                                                    {tax?.percentage ?? 0})
                                                </option>
                                            ))}
                                        </select>
                                        {tax && (
                                            <span className="text-sm text-text dark:text-text-dark whitespace-nowrap">
                                                ৳ {taxValue.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {showDiscount || showTax ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                    <label className="w-32 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                        Invoice Total:
                                    </label>
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="text"
                                            value={Number(invoiceTotal).toFixed(
                                                2
                                            )}
                                            readOnly
                                            className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                                            aria-label="Invoice Total"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-3 md:border-r md:pr-5">
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <label className="w-36 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                    Additional Charge:
                                </label>
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="text"
                                        value={additionalChargesTotal.toFixed(
                                            2
                                        )}
                                        readOnly
                                        className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                                        aria-label="Additional Charge"
                                    />
                                    <button
                                        onClick={() => {
                                            setTempAdditionalCharges(
                                                additionalChargeItems
                                            );
                                            setAdditionalChargeModalOpen(true);
                                        }}
                                        className="inline-flex items-center px-2 py-1 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-0 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200 text-sm font-medium shadow-sm"
                                    >
                                        <Icon
                                            icon="mdi:plus"
                                            className="w-5 h-5"
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <label className="w-36 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                    Grand Total:
                                </label>
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="text"
                                        value={
                                            isRoundTotal
                                                ? Math.round(subTotal)
                                                : Number(subTotal).toFixed(2)
                                        }
                                        readOnly
                                        className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                                        aria-label="Grand Total"
                                    />
                                    <label className="flex items-center text-sm text-text dark:text-text-dark whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={isRoundTotal}
                                            onChange={(e) =>
                                                setIsRoundTotal(
                                                    e.target.checked
                                                )
                                            }
                                            className="mr-1 h-4 w-4 text-primary dark:text-primary-dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                            aria-label="Round Grand Total"
                                        />
                                        Round
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <label className="w-36 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                    Pay Amount:
                                </label>
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="number"
                                        value={payAmount}
                                        onChange={handlePayAmountChange}
                                        min="0"
                                        className="flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark"
                                        placeholder="Enter pay amount"
                                        aria-label="Pay Amount"
                                    />
                                    <label className="flex items-center text-sm text-text dark:text-text-dark whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={isPayFull}
                                            onChange={(e) =>
                                                setIsPayFull(e.target.checked)
                                            }
                                            className="mr-1 h-4 w-4 text-primary dark:text-primary-dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                            aria-label="Pay Full Amount"
                                        />
                                        Full
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <label className="w-32 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                    {advanceDue > 0 ? "Due" : "Return"} Amount:
                                </label>
                                <input
                                    type="text"
                                    value={
                                        isRoundTotal
                                            ? Math.round(advanceDue)
                                            : Number(advanceDue).toFixed(2)
                                    }
                                    readOnly
                                    className="w-full py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                                    aria-label="Advance or Due Amount"
                                />
                            </div>
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <label className="w-32 text-sm font-medium text-text dark:text-text-dark whitespace-nowrap">
                                    Payment Method:
                                </label>
                                <div className="flex items-center gap-2 w-full">
                                    <div
                                        className={cn(
                                            "relative w-full",
                                            showMultiplePaymentMethod
                                                ? "w-[75%]"
                                                : "w-full"
                                        )}
                                        ref={paymentRef}
                                    >
                                        <select
                                            className={cn(
                                                `w-full py-1 px-2 border rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark`,
                                                errors.paymentMethod
                                                    ? "border-red-500"
                                                    : "border-gray-300 dark:border-gray-600"
                                            )}
                                            onChange={(e) => {
                                                setPaymentMethod(
                                                    e.target.value
                                                );
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    paymentMethod: undefined,
                                                }));
                                            }}
                                            value={paymentMethod || ""}
                                            aria-label="Payment Method"
                                        >
                                            <option value="">
                                                Select Payment Method
                                            </option>
                                            {bankOptions.map((bank) => (
                                                <option
                                                    key={bank?.value}
                                                    value={bank?.value}
                                                >
                                                    {bank?.label ?? "N/A"}
                                                </option>
                                            ))}
                                        </select>
                                        <ErrorPopover
                                            isOpen={!!errors.paymentMethod}
                                            message={errors.paymentMethod}
                                            position={popoverPosition}
                                        />
                                    </div>
                                    {showMultiplePaymentMethod && (
                                        <button
                                            onClick={handleMultiplePayment}
                                            className="inline-flex items-center px-2 py-1 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-0 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200 text-sm font-medium shadow-sm whitespace-nowrap"
                                        >
                                            Split Payment
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row justify-end gap-4 mt-2">
                                <button
                                    onClick={handleAddNote}
                                    className="inline-flex items-center px-4 py-2 bg-secondary dark:bg-primary text-white rounded-md hover:bg-primary dark:hover:bg-secondary focus:ring-2 border-none transition-colors duration-200 text-sm font-medium shadow-sm"
                                    aria-label="Save as Draft"
                                >
                                    <Icon
                                        icon="hugeicons:note-02"
                                        className="w-5 h-5 mr-2"
                                    />
                                    Note
                                </button>
                                <button
                                    onClick={handleDraftClick}
                                    className="inline-flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm"
                                    aria-label="Save as Draft"
                                >
                                    <Icon
                                        icon="mdi:content-save"
                                        className="w-5 h-5 mr-2"
                                    />
                                    Draft
                                </button>
                                <button
                                    onClick={handlePayClick}
                                    className="inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium shadow-sm"
                                    aria-label="Pay"
                                >
                                    <Icon
                                        icon="mdi:credit-card"
                                        className="w-5 h-5 mr-2"
                                    />
                                    Pay
                                </button>
                            </div>
                        </div>
                    </div>
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
                        setParentAdditionalChargeItems(charges);
                    }}
                    setAdditionalChargeModalOpen={handleCloseModal}
                    additionalChargeNames={additionalChargeNames}
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
                onClose={handleMultiplePaymentModalClose}
                banks={banks}
                grandTotal={subTotal}
                advanceDue={advanceDue}
                setAdvanceDue={setAdvanceDue}
                invoiceWithMultiplePayment={invoiceWithMultiplePayment}
                paymentRows={paymentRows}
                setPaymentRows={setPaymentRows}
                setPayAmount={setPayAmount}
            />

            {/* note modal  */}
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                note={note}
                setNote={setNote}
            />
        </>
    );
};

export default BillingSection;
