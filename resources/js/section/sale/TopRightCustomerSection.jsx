import { useEffect, useMemo, useRef, useState } from "react";
import SelectSearch from "../../components/SelectSearch";
import { usePage } from "@inertiajs/react";
import CustomerModal from "../../components/CustomerModal";
import axios from "axios";
import toast from "react-hot-toast";
import ErrorPopover from "../../components/ErrorPopover";
import usePosSettings from "../../hook/usePosSettings";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import cn from "../../utils/cn";
import useCustomerModal from "../../hook/useCustomerModal";

const TopRightCustomerSection = ({
    selectedCustomer,
    setSelectedCustomer,
    errors,
    setErrors,
}) => {
    const { props } = usePage();
    const { customers: initialCustomers } = props;

    const { customerSectionFields, handleFieldChange, settings } =
        usePosSettings();
    const { showCustomerDetails, defaultCustomer } = settings;

    const {
        isModalOpen,
        customers,
        setCustomers,
        handleModalSubmit,
        handleModalClose,
        handleButtonClick,
        fetchCustomers,
    } = useCustomerModal(setSelectedCustomer, setErrors);

    const customerSelectRef = useRef(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    // Set initial customers
    useEffect(() => {
        setCustomers(initialCustomers);
    }, [initialCustomers, setCustomers]);

    // Set default customer on initial load
    useEffect(() => {
        if (defaultCustomer && customers.length > 0) {
            setSelectedCustomer(customers[0]); // Select the first customer
            setErrors((prev) => ({
                ...prev,
                selectedCustomer: undefined,
            }));
        }
    }, [defaultCustomer, customers, setSelectedCustomer, setErrors]);

    // popover Position
    useEffect(() => {
        if (customerSelectRef.current && errors.selectedCustomer) {
            const rect = customerSelectRef.current.getBoundingClientRect();
            setPopoverPosition({
                top: 0,
                left: 0,
            });
        }
    }, [errors.selectedCustomer]);

    // Transform customers data to { value, label } structure
    const customerOptions = customers.map((customer) => ({
        value: customer.id,
        label: `${customer.name} - ${customer.phone || "N/A"}`,
        customer: customer,
    }));

    const handleCustomerSelect = (option) => {
        setSelectedCustomer(option?.customer);
        setErrors((prev) => ({
            ...prev,
            selectedCustomer: undefined,
        }));
    };

    return (
        <div className="border relative border-gray-300 dark:border-gray-600 col-span-1 lg:col-span-2 p-6 bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm transition-colors duration-300">
            <div className="absolute top-1 right-1">
                <ThreeDotMenu
                    fields={customerSectionFields}
                    onFieldChange={handleFieldChange}
                />
            </div>
            <div
                className={cn(
                    "grid gap-6",
                    showCustomerDetails ? "sm:grid-cols-2" : "grid-cols-1"
                )}
            >
                <div className="relative" ref={customerSelectRef}>
                    <SelectSearch
                        label="Customer"
                        options={customerOptions}
                        onSelect={handleCustomerSelect}
                        placeholder="Search for a customer..."
                        buttonText="Add"
                        onButtonClick={handleButtonClick}
                        selectedValue={
                            selectedCustomer
                                ? {
                                      value: selectedCustomer.id,
                                      label: `${selectedCustomer.name} - ${
                                          selectedCustomer.phone || "N/A"
                                      }`,
                                  }
                                : null
                        }
                        inputClass={`relative w-full text-sm text-text dark:text-text-dark bg-surface-light dark:bg-surface-dark border ${
                            errors.selectedCustomer
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } rounded-md`}
                        zIndex={50}
                    />
                    <ErrorPopover
                        isOpen={!!errors.selectedCustomer}
                        message={errors.selectedCustomer}
                        position={popoverPosition}
                    />
                </div>
                {showCustomerDetails && (
                    <div>
                        {/* <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                        Customer Information
                    </label> */}
                        <div className=" grid  gap-0.5">
                            <p className="text-sm text-text dark:text-text-dark">
                                <span className="font-medium text-muted dark:text-muted-dark">
                                    Name:
                                </span>{" "}
                                {selectedCustomer?.name ?? "N/A"}
                            </p>

                            <p className="text-sm text-text dark:text-text-dark">
                                <span className="font-medium text-muted dark:text-muted-dark">
                                    Phone:
                                </span>{" "}
                                {selectedCustomer?.phone ?? "N/A"}
                            </p>
                            <p className="text-sm text-text dark:text-text-dark">
                                <span className="font-medium text-muted dark:text-muted-dark">
                                    Due Amount:
                                </span>{" "}
                                ৳ {selectedCustomer?.wallet_balance ?? 0}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

export default TopRightCustomerSection;
