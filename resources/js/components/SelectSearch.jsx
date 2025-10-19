import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import cn from "../utils/cn";

const SelectSearch = ({
    label,
    options,
    onSelect,
    placeholder,
    buttonText,
    onButtonClick,
    inputWrapperClass,
    selectedValue,
    zIndex,
    inputRef,
    onKeyDown,
    allowCustomInput = false,
    onInputChange,
    renderAsTable = false,
    renderOption,
    tableHeaders = [],
    wrapperClass,
    searchSuggestionWrapperClass,
    isZoomInHighlightedIndex = false,
    onFieldFocusChange,
    forceOpen = false,
    isOpen: externalIsOpen = false,
    buttonClass,
    inputClass,
    keepOpenAfterSelect = false,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(externalIsOpen);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isInitialRender, setIsInitialRender] = useState(true);

    const wrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionRefs = useRef([]);

    useEffect(() => {
        setIsInitialRender(false);
    }, []);

    // Sync inputRef with searchInputRef
    useEffect(() => {
        if (inputRef) {
            inputRef.current = searchInputRef.current;
        }
    }, [inputRef]);

    // Sync external isOpen with internal isOpen
    useEffect(() => {
        setIsOpen(externalIsOpen);
        if (externalIsOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [externalIsOpen]);

    // Open dropdown when forceOpen is true and not initial render
    useEffect(() => {
        if (forceOpen && !isInitialRender) {
            setIsOpen(true);
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
    }, [forceOpen, isInitialRender]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Sync searchTerm with selectedValue
    useEffect(() => {
        if (selectedValue) {
            setSearchTerm(allowCustomInput ? selectedValue.label : "");
            setHighlightedIndex(-1);
            setIsOpen(false); // Close dropdown after selection
        }
    }, [selectedValue, allowCustomInput]);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        return options.filter((option) => {
            // console.log(option);
            return option?.label
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        });
    }, [options, searchTerm]);

    // Handle selection from dropdown
    const handleSelect = (option) => {
        setSearchTerm(allowCustomInput ? option?.label || "" : "");
        // setIsOpen(false);
        if (!keepOpenAfterSelect) {
            setIsOpen(false);
        }
        setHighlightedIndex(-1);
        onSelect(option);
        if (onFieldFocusChange) {
            onFieldFocusChange();
        }
    };

    // Handle custom input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpen(true);
        if (allowCustomInput && onInputChange) {
            onInputChange(value);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        console.log("SelectSearch key:", e.key, "isOpen:", isOpen); // Debugging
        if (!isOpen) {
            if (e.key === "Enter") {
                e.preventDefault();
                setIsOpen(true);
            } else if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    e.key
                ) &&
                onKeyDown
            ) {
                e.preventDefault();
                onKeyDown(e);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
                e.preventDefault();
                if (
                    highlightedIndex >= 0 &&
                    highlightedIndex < filteredOptions.length
                ) {
                    handleSelect(filteredOptions[highlightedIndex]);
                } else if (searchTerm && filteredOptions.length === 1) {
                    handleSelect(filteredOptions[0]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                setSearchTerm("");
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
            optionRefs.current[highlightedIndex].scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [highlightedIndex]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                if (!selectedValue || !allowCustomInput) {
                    setSearchTerm("");
                } else {
                    setSearchTerm(selectedValue.label);
                }
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedValue, allowCustomInput]);

    return (
        <div
            className={cn("relative w-full", wrapperClass)}
            ref={wrapperRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {label && (
                <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                    {label}
                </label>
            )}
            <div className="flex items-center w-full justify-end">
                <div
                    className={cn(
                        "relative w-full py-0 px-1 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark cursor-pointer transition-colors duration-200",
                        inputWrapperClass,
                        buttonText ? "rounded-r-none" : "rounded-r-md"
                    )}
                    onClick={() => setIsOpen(true)}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls="search-options"
                >
                    <input
                        type="text"
                        value={
                            allowCustomInput
                                ? searchTerm
                                : selectedValue
                                ? selectedValue.label
                                : ""
                        }
                        onChange={
                            allowCustomInput ? handleInputChange : undefined
                        }
                        readOnly={!allowCustomInput}
                        placeholder={placeholder}
                        className={cn(
                            "w-full bg-transparent outline-none text-text dark:text-text-dark border-none text-sm focus:ring-0",
                            inputClass
                        )}
                        aria-readonly={!allowCustomInput}
                        aria-label={label || "Select option"}
                    />
                    <Icon
                        icon="mdi:chevron-down"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-text dark:text-text-dark"
                    />
                </div>
                {buttonText && (
                    <button
                        onClick={onButtonClick}
                        className={cn(
                            "py-2 px-3 bg-primary dark:bg-primary-dark text-white rounded-r-md hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium",
                            buttonClass
                        )}
                    >
                        {buttonText}
                    </button>
                )}
            </div>
            {isOpen && (
                <div
                    className={cn(
                        `absolute z-${zIndex} bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto ${
                            renderAsTable ? "min-w-[400]" : "w-full"
                        }`,
                        searchSuggestionWrapperClass
                    )}
                    id="search-options"
                    role="listbox"
                >
                    <div className="p-2 sticky top-0 bg-surface-light dark:bg-surface-dark">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setHighlightedIndex(-1);
                            }}
                            placeholder="Search..."
                            className="w-full py-1.5 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
                            aria-label="Search options"
                        />
                    </div>
                    {filteredOptions.length > 0 ? (
                        renderAsTable && renderOption ? (
                            <div className="p-2 ">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark sticky top-10 z-10">
                                        <tr>
                                            {tableHeaders.map(
                                                (header, index) => (
                                                    <th
                                                        key={index}
                                                        className="px-2 py-1 font-semibold text-xs"
                                                    >
                                                        {header}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOptions.map(
                                            (option, index) => (
                                                <tr
                                                    key={option.value}
                                                    ref={(el) =>
                                                        (optionRefs.current[
                                                            index
                                                        ] = el)
                                                    }
                                                    onClick={() =>
                                                        handleSelect(option)
                                                    }
                                                    className={cn(
                                                        "transition-all duration-200",
                                                        index ===
                                                            highlightedIndex
                                                            ? isZoomInHighlightedIndex
                                                                ? "scale-105 bg-primary/10 dark:bg-primary-dark/10"
                                                                : "bg-primary/10 dark:bg-primary-dark/10"
                                                            : selectedValue &&
                                                              selectedValue.value ===
                                                                  option.value
                                                            ? "bg-primary/50 dark:bg-primary-dark/50"
                                                            : "hover:bg-primary/10 dark:hover:bg-primary-dark/10"
                                                    )}
                                                    role="option"
                                                    aria-selected={
                                                        index ===
                                                        highlightedIndex
                                                    }
                                                >
                                                    {renderOption(option, {
                                                        onSelect: () =>
                                                            handleSelect(
                                                                option
                                                            ),
                                                    })}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ul role="listbox">
                                {filteredOptions.map((option, index) => (
                                    <li
                                        key={option.value}
                                        ref={(el) =>
                                            (optionRefs.current[index] = el)
                                        }
                                        onClick={() => handleSelect(option)}
                                        className={`py-2 px-3 text-sm cursor-pointer transition-colors duration-200 ${
                                            index === highlightedIndex
                                                ? "bg-primary text-white dark:bg-primary-dark dark:text-text-dark"
                                                : selectedValue &&
                                                  selectedValue.value ===
                                                      option.value
                                                ? "bg-primary/50 text-text dark:bg-primary-dark/50 dark:text-text-dark"
                                                : "text-text dark:text-text-dark hover:bg-primary hover:text-white dark:hover:bg-primary-dark dark:hover:text-text-dark"
                                        }`}
                                        role="option"
                                        aria-selected={
                                            index === highlightedIndex
                                        }
                                    >
                                        {option?.label ?? "N/A"}
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : (
                        <div className="py-2 px-3 text-sm text-text dark:text-text-dark">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectSearch;
