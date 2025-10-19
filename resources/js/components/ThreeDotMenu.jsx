import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import useOutsideClick from "../hook/useOutsideClick";

const ThreeDotMenu = ({ fields, onFieldChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // useOutsideClick Close dropdown when clicking outside
    useOutsideClick({
        refs: [menuRef, buttonRef],
        callback: () => setIsMenuOpen(false),
        eventType: "mousedown",
        enabled: isMenuOpen,
    });

    return (
        <div className="relative">
            {/* 3-Dot Menu Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen((prev) => !prev);
                }}
                ref={buttonRef}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:outline-none"
                aria-label="Toggle settings menu"
                aria-expanded={isMenuOpen}
            >
                <Icon
                    icon="mdi:dots-vertical"
                    className="text-text dark:text-text-dark"
                />
            </button>
            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50"
                >
                    <div className="p-4 space-y-3 max-h-[300px] overflow-y-scroll">
                        {fields.map((field) => (
                            <div key={field.name} className="flex flex-col">
                                {field.type === "checkbox" ? (
                                    <label className="flex items-center text-sm text-text dark:text-text-dark">
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) =>
                                                onFieldChange(
                                                    field.name,
                                                    e.target.checked
                                                )
                                            }
                                            className="mr-2 h-4 w-4 text-primary dark:text-primary-dark rounded transition-colors duration-200"
                                            aria-label={`Toggle ${field.label}`}
                                        />
                                        {field.label}
                                    </label>
                                ) : field.type === "radio" ? (
                                    <div>
                                        <span className="text-sm font-medium text-text dark:text-text-dark">
                                            {field.label}
                                        </span>
                                        <div className="mt-1 space-y-2">
                                            {field.options.map((option) => (
                                                <label
                                                    key={option.value}
                                                    className="flex items-center text-sm text-text dark:text-text-dark"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={field.name}
                                                        value={option.value}
                                                        checked={
                                                            field.value ===
                                                            option.value
                                                        }
                                                        onChange={(e) =>
                                                            onFieldChange(
                                                                field.name,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mr-2 h-4 w-4 text-primary dark:text-primary-dark transition-colors duration-200"
                                                        aria-label={`Select ${option.label}`}
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreeDotMenu;
