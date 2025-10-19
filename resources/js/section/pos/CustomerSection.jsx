import { useState } from "react";
import SelectSearch from "../../components/SelectSearch";
import CustomerModal from "../../components/CustomerModal";
import useCustomerModal from "../../hook/useCustomerModal";
import cn from "../../utils/cn";
import ErrorPopover from "../../components/ErrorPopover";

const CustomerSection = ({
    customers,
    selectedCustomer,
    setSelectedCustomer,
    errors,
    setErrors,
}) => {
    const {
        isModalOpen,
        handleModalSubmit,
        handleModalClose,
        handleButtonClick,
    } = useCustomerModal(setSelectedCustomer, () => {});

    const handleCustomerSelect = (option) => {
        setSelectedCustomer(option?.customer);
    };

    return (
        <>
            <div className="">
                <SelectSearch
                    options={customers}
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
                    inputClass={cn(
                        "relative py-1 w-full text-sm text-text dark:text-text-dark bg-surface-light dark:bg-surface-dark rounded-md",
                        errors?.selectedCustomer
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                    )}
                    buttonClass={`py-1 border border-l-0  text-sm`}
                    zIndex={50}
                />
                <ErrorPopover
                    isOpen={!!errors?.selectedCustomer}
                    message={errors?.selectedCustomer}
                    position={{ top: 0, left: 0 }}
                />
            </div>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
            />
        </>
    );
};

export default CustomerSection;
