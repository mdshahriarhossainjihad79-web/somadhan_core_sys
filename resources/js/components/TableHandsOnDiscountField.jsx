import usePosSettings from "../hook/usePosSettings";

const TableHandsOnDiscountField = ({
    row,
    handleInputChange,
    inputRefs,
    handleKeyDown,
    rowIndex,
    handleAddRow,
}) => {
    const { settings } = usePosSettings();
    const { warranty } = settings;

    const handleFieldFocusChange = (currentField) => {
        const fields = [
            "product",
            "price",
            "qty",
            "discountPercentage",
            "discountAmount",
        ];
        if (warranty) fields.push("warranty");

        const currentFieldIndex = fields.indexOf(currentField);
        const nextField = fields[currentFieldIndex + 1];

        if (nextField && inputRefs.current[rowIndex]?.[nextField]) {
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
            handleFieldFocusChange(field);
        } else {
            handleKeyDown(e, rowIndex, field);
        }
    };

    return (
        <div className="grid grid-cols-2">
            <div className="border-r">
                <input
                    type="number"
                    value={row.discountPercentage}
                    onChange={(e) =>
                        handleInputChange(
                            row.id,
                            "discountPercentage",
                            e.target.value
                        )
                    }
                    className="text-center w-full p-0.5 border-none rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark hide-number-spinner"
                    placeholder="%"
                    min="0"
                    max="100"
                    aria-label="Discount Percentage"
                    ref={(el) =>
                        inputRefs.current[rowIndex] &&
                        (inputRefs.current[rowIndex].discountPercentage = el)
                    }
                    onKeyDown={(e) =>
                        handleKeyDownLocal(e, rowIndex, "discountPercentage")
                    }
                />
            </div>
            <div>
                <input
                    type="number"
                    value={row.discountAmount}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || parseFloat(value) >= 0) {
                            handleInputChange(row.id, "discountAmount", value);
                        } else {
                            toast.error("Discount amount cannot be negative.");
                        }
                    }}
                    className="text-center w-full p-0.5 border-none rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark hide-number-spinner"
                    placeholder="৳"
                    min="0"
                    max={
                        (parseFloat(row.price) || 0) * (parseInt(row.qty) || 0)
                    }
                    aria-label="Discount Amount"
                    ref={(el) =>
                        inputRefs.current[rowIndex] &&
                        (inputRefs.current[rowIndex].discountAmount = el)
                    }
                    onKeyDown={(e) =>
                        handleKeyDownLocal(e, rowIndex, "discountAmount")
                    }
                />
            </div>
        </div>
    );
};

export default TableHandsOnDiscountField;
