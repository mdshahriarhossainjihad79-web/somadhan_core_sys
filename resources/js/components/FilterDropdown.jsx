import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const FilterDropdown = ({
    field,
    options,
    selectedValues,
    onChange,
    filterType,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(selectedValues?.search || "");
    const debouncedSearch = useDebounce(search, 300);
    const [rangeMin, setRangeMin] = useState(selectedValues?.min || "");
    const [rangeMax, setRangeMax] = useState(selectedValues?.max || "");
    const [startDate, setStartDate] = useState(selectedValues?.start || null);
    const [endDate, setEndDate] = useState(selectedValues?.end || null);
    const [dateFilterType, setDateFilterType] = useState(
        selectedValues?.type || "between"
    );
    const [numericFilterType, setNumericFilterType] = useState(
        selectedValues?.type || "between"
    );
    const dropdownRef = useRef(null);

    // Outside Click Handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Update parent component with debounced search value
    useEffect(() => {
        if (filterType === "text") {
            onChange(field, debouncedSearch ? [debouncedSearch] : []);
        }
    }, [debouncedSearch, field, onChange, filterType]);

    // Checkbox filter option
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(search.toLowerCase())
    );

    // Checkbox filter handler
    const handleCheckboxSelect = (value) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(field, newValues);
    };

    const handleSelectAll = () => {
        onChange(field, options);
    };

    // Clear handler for all filter types
    const handleClear = () => {
        onChange(
            field,
            filterType === "numeric" || filterType === "date" ? {} : []
        );
        setSearch("");
        setRangeMin("");
        setRangeMax("");
        setStartDate(null);
        setEndDate(null);
        setDateFilterType("between");
        setNumericFilterType("between");
        setIsOpen(false);
    };

    // Text filter handler
    const handleTextFilter = (e) => {
        e.stopPropagation();
        setSearch(e.target.value);
    };

    // Numeric filter handler
    const handleNumericFilter = () => {
        if (rangeMin || rangeMax) {
            onChange(field, {
                min: rangeMin,
                max: rangeMax,
                type: numericFilterType,
            });
        } else {
            onChange(field, {});
        }
    };

    // Date filter handler
    const handleDateFilter = () => {
        if (startDate || endDate) {
            onChange(field, {
                start: startDate,
                end: endDate,
                type: dateFilterType,
            });
        } else {
            onChange(field, {});
        }
    };

    // Determine if filter is active
    const isFilterActive = () => {
        switch (filterType) {
            case "text":
                return !!search;
            case "numeric":
                return !!rangeMin || !!rangeMax;
            case "date":
                return !!startDate || !!endDate;
            case "checkbox":
                return selectedValues?.length > 0;
            default:
                return false;
        }
    };

    // Render design using filter type
    const renderFilterContent = () => {
        switch (filterType) {
            case "text":
                return (
                    <div className="p-4 space-y-3">
                        <input
                            type="text"
                            value={search}
                            onChange={handleTextFilter}
                            placeholder={`Search ${field.replace(
                                /_/g,
                                " "
                            )}...`}
                            className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 placeholder-gray-400 shadow-sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={handleClear}
                            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 text-sm font-medium shadow-sm"
                        >
                            Clear
                        </button>
                    </div>
                );
            case "numeric":
                return (
                    <div className="p-4 space-y-3">
                        <select
                            value={numericFilterType}
                            onChange={(e) =>
                                setNumericFilterType(e.target.value)
                            }
                            className="w-full px-2 py-1  border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <option value="exact">Exact Value</option>
                            <option value="greater">Greater Than</option>
                            <option value="less">Less Than</option>
                            <option value="between">Between Values</option>
                        </select>
                        <input
                            type="number"
                            value={rangeMin}
                            onChange={(e) => setRangeMin(e.target.value)}
                            placeholder={
                                numericFilterType === "between"
                                    ? "Min Value"
                                    : "Value"
                            }
                            className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 placeholder-gray-400 shadow-sm"
                        />
                        {numericFilterType === "between" && (
                            <input
                                type="number"
                                value={rangeMax}
                                onChange={(e) => setRangeMax(e.target.value)}
                                placeholder="Max Value"
                                className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-gray-50 placeholder-gray-400 shadow-sm"
                            />
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleNumericFilter}
                                className="w-full py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-sm"
                            >
                                Apply Filter
                            </button>
                            <button
                                onClick={handleClear}
                                className="w-full py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 text-sm font-medium shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                );
            case "date":
                return (
                    <div className="p-4 space-y-3">
                        <select
                            value={dateFilterType}
                            onChange={(e) => setDateFilterType(e.target.value)}
                            className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <option value="exact">Exact Date</option>
                            <option value="before">Before the Date</option>
                            <option value="after">After the Date</option>
                            <option value="between">Between Dates</option>
                        </select>
                        <div className="relative">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Select Date"
                                className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 placeholder-gray-400 shadow-sm"
                                dateFormat="yyyy-MM-dd"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                popperClassName="custom-datepicker-popper z-[60]"
                                popperPlacement="bottom-start"
                                yearDropdownItemNumber={15}
                                scrollableYearDropdown
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Icon
                                icon="mdi:calendar"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            />
                        </div>
                        {dateFilterType === "between" && (
                            <div className="relative">
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    placeholderText="End Date"
                                    className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 placeholder-gray-400 shadow-sm"
                                    dateFormat="yyyy-MM-dd"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    popperClassName="custom-datepicker-popper z-[60]"
                                    popperPlacement="bottom-start"
                                    yearDropdownItemNumber={15}
                                    scrollableYearDropdown
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <Icon
                                    icon="mdi:calendar"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleDateFilter}
                                className="w-full py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium shadow-sm"
                            >
                                Apply Filter
                            </button>
                            <button
                                onClick={handleClear}
                                className="w-full py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 text-sm font-medium shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                );
            case "checkbox":
            default:
                return (
                    <div className="p-4 space-y-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 bg-gray-50 placeholder-gray-400 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={handleSelectAll}
                                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition duration-200"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleClear}
                                className="text-red-500 hover:text-red-600 text-sm font-medium transition duration-200"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                            {filteredOptions.map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-md transition duration-150"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(
                                            option
                                        )}
                                        onChange={() =>
                                            handleCheckboxSelect(option)
                                        }
                                        className="h-4 w-4 text-blue-500 rounded focus:ring-0"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full hover:bg-gray-100 transition duration-200 shadow-sm ${
                    isFilterActive()
                        ? "text-blue-500 bg-blue-50 shadow-md"
                        : "text-gray-500"
                }`}
            >
                <Icon icon="mdi:filter" className="h-5 w-5" />
            </button>
            {isOpen && (
                <div className="absolute z-[9999] mt-2 w-80 bg-white shadow-xl rounded-xl p-3 border border-gray-100 animate-[dropdown_0.3s_ease-in-out_forwards]">
                    {renderFilterContent()}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
