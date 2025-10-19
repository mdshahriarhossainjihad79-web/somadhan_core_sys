import cn from "../utils/cn";

const Discount = ({
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    productTotal,
    handleDiscountChange,
    discountValue,
    showDiscountValue = true,
    smallSize = false,
}) => {
    const handleDiscountTypeChange = (e) => {
        setDiscountType(e.target.value);
        setDiscount("");
    };
    return (
        <div className="flex items-center w-full">
            <label
                className={`w-32 ${
                    smallSize ? "text-xs" : "text-sm"
                } font-medium text-text dark:text-text-dark whitespace-nowrap`}
            >
                Discount:
            </label>
            <div className="flex items-center w-full">
                <input
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    min={discountType === "%" ? 1 : 0}
                    max={discountType === "%" ? 100 : productTotal}
                    className={cn(
                        "flex-1 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark rounded-r-none",
                        smallSize ? "text-xs" : "text-sm"
                    )}
                    placeholder="Enter discount"
                    aria-label="Discount"
                />
                <select
                    value={discountType}
                    onChange={handleDiscountTypeChange}
                    className={cn(
                        "py-1 px-2 border border-gray-300 dark:border-gray-600 border-l-0 rounded-md rounded-l-none  bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark appearance-none",
                        smallSize ? "text-xs w-10" : "text-sm w-16"
                    )}
                    aria-label="Discount Type"
                >
                    <option value="%">%</option>
                    <option value="৳">৳</option>
                </select>
                {showDiscountValue && discountType === "%" && discount && (
                    <span
                        className={cn(
                            "ms-2 text-text dark:text-text-dark whitespace-nowrap",
                            smallSize ? "text-xs" : "text-sm"
                        )}
                    >
                        ৳ {discountValue.toFixed(2)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Discount;
