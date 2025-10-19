const WarrantyField = ({
    row,
    handleInputChange,
    inputRefs,
    handleAddRow,
    handleKeyDown,
    rowIndex,
}) => {
    return (
        <div className="flex items-center gap-1">
            {" "}
            {/* Flex for side-by-side */}
            <input
                type="number"
                min="0" // HTML min to prevent negative
                step="1" // Integer only
                value={row.warranty}
                onChange={(e) =>
                    handleInputChange(row.id, "warranty", e.target.value)
                }
                className="w-[60%] p-0.5 border-none text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-none outline-none focus:outline-none transition-all duration-200"
                placeholder="Enter warranty"
                aria-label="Warranty value"
                ref={(el) =>
                    inputRefs.current[rowIndex] &&
                    (inputRefs.current[rowIndex].warranty = el)
                }
                onKeyDown={(e) => handleKeyDown(e, rowIndex, "warranty")}
            />
            <select
                value={row.warranty_type}
                onChange={(e) =>
                    handleInputChange(row.id, "warranty_type", e.target.value)
                }
                className="w-[40%] p-0.5 border border-gray-300 dark:border-gray-600 rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent transition-all duration-200"
                aria-label="Warranty type"
            >
                <option value="month">Month</option>
                <option value="year">Year</option>
            </select>
        </div>
    );
};

export default WarrantyField;
