import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import cn from "../utils/cn";

const WarehouseDropdown = ({
    options,
    onSelect,
    placeholder,
    selectedValue,
    wrapperClass,
    disabled = false,
    setIsOpen,
    isOpen = false,
}) => {
    const wrapperRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setIsOpen]);

    // Handle selection
    const handleSelect = (option) => {
        if (!disabled) {
            onSelect(option);
            setIsOpen(false);
        }
    };

    const tableHeaders = [
        "Warehouse",
        "Rack",
        "Stock Qty",
        "Stock Age",
        "Expiry Date",
        "Current",
    ];

    return (
        <div className={cn("relative w-full", wrapperClass)} ref={wrapperRef}>
            <div
                className={cn(
                    "relative w-full py-1.5 px-2  rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="warehouse-options"
            >
                <span className="truncate">
                    {selectedValue ? selectedValue.label : placeholder}
                </span>
                <Icon
                    icon="mdi:chevron-down"
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-text dark:text-text-dark transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                    )}
                />
            </div>
            {isOpen && !disabled && (
                <div
                    className="absolute z-40 w-[400px] bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto mt-1"
                    id="warehouse-options"
                    role="listbox"
                >
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark sticky top-0 z-10">
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th
                                        key={index}
                                        className="px-2 py-1 font-semibold text-xs border-b border-gray-200 dark:border-gray-700"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {options.length > 0 ? (
                                options.map((option, index) => (
                                    <tr
                                        key={option.value}
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            "transition-all duration-200 cursor-pointer",
                                            selectedValue &&
                                                selectedValue.value ===
                                                    option.value
                                                ? "bg-primary/20 dark:bg-primary-dark/20"
                                                : "hover:bg-primary/10 dark:hover:bg-primary-dark/10"
                                        )}
                                        role="option"
                                        aria-selected={
                                            selectedValue &&
                                            selectedValue.value === option.value
                                        }
                                    >
                                        <td className="px-2 py-1 text-xs">
                                            {option.stock?.warehouse
                                                ?.warehouse_name ?? "N/A"}
                                        </td>
                                        <td className="px-2 py-1 text-xs">
                                            {option.stock?.racks?.rack_name ??
                                                "N/A"}
                                        </td>
                                        <td className="px-2 py-1 text-xs">
                                            {option.stock?.stock_quantity ?? 0}
                                        </td>
                                        <td className="px-2 py-1 text-xs">
                                            {option.stock?.stock_age ?? "N/A"}
                                        </td>
                                        <td className="px-2 py-1 text-xs">
                                            {option.stock?.expiry_date ?? "N/A"}
                                        </td>
                                        <td className="px-2 py-1 text-xs">
                                            {option.stock?.is_Current_stock ===
                                            1 ? (
                                                <Icon
                                                    icon="mdi:check-circle"
                                                    className="text-green-500"
                                                />
                                            ) : (
                                                <Icon
                                                    icon="mdi:close-circle"
                                                    className="text-red-500"
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={tableHeaders.length}
                                        className="px-2 py-1 text-xs text-center text-text dark:text-text-dark"
                                    >
                                        No warehouses found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WarehouseDropdown;
