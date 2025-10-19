import { useEffect, useState } from "react";
import usePosSettings from "../hook/usePosSettings";
import ErrorPopover from "./ErrorPopover";
import { usePage } from "@inertiajs/react";

const PriceFieldWithRateKit = ({
    row,
    rows,
    setRows,
    handleInputChange,
    inputRefs,
    handleKeyDown,
    selectedCustomer,
    rowIndex,
    rateKitData,
    popover,
    setPopover,
    handleShowRateKit,
    sellingPriceEdit,
    errors,
    priceErrorPopover,
}) => {
    const { settings } = usePosSettings();
    const {
        rateKit,
        rateKitType,
        saleWithLowPrice,
        saleHandsOnDiscount,
        warranty,
    } = settings;

    const handleFieldFocusChange = () => {
        const fields = ["product"];
        if (sellingPriceEdit) fields.push("price");
        fields.push("qty");
        if (saleHandsOnDiscount) {
            fields.push("discountPercentage");
            fields.push("discountAmount");
        }
        if (warranty) fields.push("warranty");

        const nextField = fields[fields.indexOf("price") + 1];
        if (inputRefs.current[rowIndex]?.[nextField]) {
            setTimeout(() => {
                inputRefs.current[rowIndex][nextField].focus();
            }, 100);
        } else if (!nextField) {
            handleAddRow();
        }
    };

    const handleKeyDownLocal = (e, rowIndex, field) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (popover.isOpen) {
                if (
                    rateKitData[row.id]?.length > 0 &&
                    popover.rowId === row.id
                ) {
                    handleRateSelect(row.id, rateKitData[row.id][0].rate);
                }
            } else {
                handleFieldFocusChange();
            }
        } else {
            handleKeyDown(e, rowIndex, field);
        }
    };

    // Calculate total function
    const calculateTotal = (price, qty, discountAmount) => {
        return (
            (parseFloat(price) || 0) * (parseInt(qty) || 0) -
            (parseFloat(discountAmount) || 0)
        );
    };

    // Call handleShowRateKit for all rows when selectedCustomer changes
    useEffect(() => {
        if (rateKit && rateKitType === "party" && selectedCustomer?.id) {
            rows.forEach((row) => {
                if (row.variantId) {
                    handleShowRateKit(row.variantId, row.id);
                }
            });
        }
    }, [selectedCustomer, rateKit, rateKitType, rows, handleShowRateKit]);

    const openRateKitPopover = async (e, rowId, rowIndex) => {
        if (!rateKit || !sellingPriceEdit) return;
        if (popover.isOpen && popover.rowId === rowId) return;

        if (!rateKitData[rowId] && row.variantId) {
            const response = await handleShowRateKit(row.variantId, rowId);
            if (!response?.success) return;
        }

        if (rateKitData[rowId]?.length > 0) {
            const rect = e.target.getBoundingClientRect();
            setPopover({
                isOpen: true,
                rowId,
                position: {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                },
            });
        }
    };

    // Handle rate selection from popover
    const handleRateSelect = (rowId, rate) => {
        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          price: rate,
                          total: calculateTotal(
                              rate,
                              row.qty,
                              row.discountAmount
                          ),
                      }
                    : row
            )
        );
        setPopover({
            isOpen: false,
            rowId: null,
            position: { top: 0, left: 0 },
        });
    };

    // Handle click outside to close popover
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popover.isOpen &&
                !event.target.closest(".popover") &&
                !event.target.closest(".price-input")
            ) {
                setPopover({
                    isOpen: false,
                    rowId: null,
                    position: { top: 0, left: 0 },
                });
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popover.isOpen]);

    return (
        <div className="relative">
            <input
                type="number"
                value={row.price}
                onChange={(e) =>
                    handleInputChange(row.id, "price", e.target.value)
                }
                readOnly={!sellingPriceEdit}
                className={`price-input w-full p-0.5 border rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark hide-number-spinner ${
                    !sellingPriceEdit ? "cursor-not-allowed" : ""
                } ${errors[row.id]?.price ? "border-red-500" : "border-none"}`}
                placeholder="Enter price"
                aria-label="Price"
                ref={(el) =>
                    inputRefs.current[rowIndex] &&
                    (inputRefs.current[rowIndex].price = el)
                }
                onKeyDown={(e) => handleKeyDownLocal(e, rowIndex, "price")}
                onClick={(e) => openRateKitPopover(e, row.id, rowIndex)}
                onFocus={(e) => openRateKitPopover(e, row.id, rowIndex)}
            />
            {priceErrorPopover.isOpen && (
                <ErrorPopover
                    isOpen={priceErrorPopover.isOpen}
                    message={errors[row.id]?.price}
                    position={priceErrorPopover.position}
                />
            )}
            {popover.isOpen && popover.rowId === row.id && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-auto w-64 sm:w-72">
                    {rateKitData[row.id]?.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark">
                                <tr>
                                    <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">
                                        Rate
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">
                                        Qty
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rateKitData[row.id].map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() =>
                                            handleRateSelect(row.id, item.rate)
                                        }
                                        className="border-t border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200 hover:bg-primary/10 dark:hover:bg-primary-dark/20"
                                    >
                                        <td className="px-4 py-2 text-sm text-text dark:text-text-dark">
                                            {item?.sale_date ?? "N/A"}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-text dark:text-text-dark">
                                            {item?.rate ?? 0}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-text dark:text-text-dark">
                                            {item?.qty ?? 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No rate data available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PriceFieldWithRateKit;
