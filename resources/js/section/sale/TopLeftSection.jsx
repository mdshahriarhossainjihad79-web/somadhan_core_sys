import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MultiSelect from "../../components/MultiSelect";
import { usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import toast from "react-hot-toast";
import cn from "../../utils/cn";

const TopLeftSection = ({
    rows,
    products,
    addRow,
    invoice,
    setInvoice,
    selectedDate,
    setSelectedDate,
    selectedAffiliate,
    setSelectedAffiliate,
    topLeftMenuFields,
    handleFieldChange,
    showBarcode,
    showInvoice,
    showAffiliate,
    visibleFields,
    isLoadingInvoice,
}) => {
    const [barcode, setBarcode] = useState("");
    const [invoiceError, setInvoiceError] = useState("");
    const { props } = usePage();
    const { affiliates } = props;

    const affiliateOptions = useMemo(() => {
        return affiliates.map((affiliate) => ({
            label: affiliate.name,
            value: affiliate.id,
        }));
    }, [affiliates]);

    // Handle barcode input change
    const handleBarcodeChange = async (e) => {
        const barcodeValue = e.target.value;
        console.log("barcodeValue", barcodeValue);
        setBarcode(barcodeValue);

        if (barcodeValue) {
            const matchedProduct = products.find(
                (product) => product?.barcode === barcodeValue
            );
            console.log("matchedProduct", matchedProduct);

            if (matchedProduct) {
                // Check if the product is already in the table
                const isAlreadySelected = rows.some(
                    (row) => row.variantId === matchedProduct.id
                );
                if (isAlreadySelected) {
                    toast.error(
                        "This product is already selected in the table."
                    );
                    setBarcode("");
                    return;
                }

                // Create product option in the format expected by handleProductSelect
                const productOption = {
                    value: matchedProduct.id,
                    product: matchedProduct,
                };

                // Add the product to the table using addRow
                addRow(productOption);
                setBarcode("");
                toast.success("Product added to the table.");
            } else {
                toast.error("No product found with this barcode.");
            }
        }
    };

    // Handle invoice input change with 6-digit validation
    const handleInvoiceChange = async (e) => {
        const value = e.target.value;
        setInvoice(value);

        // Clear previous error
        setInvoiceError("");

        // Validate for 6 digits
        if (value && !/^\d{6}$/.test(value)) {
            setInvoiceError("Invoice number must be exactly 6 digits.");
            return;
        }

        // Check with backend if invoice number exists
        if (value && /^\d{6}$/.test(value)) {
            try {
                const response = await axios.post("/generate-sale-invoice", {
                    invoice_number: value,
                });
                if (response.data.status === "exists") {
                    setInvoiceError("Invoice number already exists.");
                    toast.error("Invoice number already exists.");
                } else {
                    toast.success("Invoice number is valid.");
                }
            } catch (error) {
                console.error(
                    "Error checking invoice number:",
                    error.response?.data?.error || error.message
                );
                setInvoiceError("Failed to validate invoice number.");
                toast.error("Failed to validate invoice number.");
            }
        }
    };

    return (
        <div className="relative border border-gray-300 dark:border-gray-600 col-span-1 lg:col-span-4 p-6 bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm transition-colors duration-300">
            <div className="absolute top-1 right-1">
                <ThreeDotMenu
                    fields={topLeftMenuFields}
                    onFieldChange={handleFieldChange}
                />
            </div>
            <div
                className={cn(
                    `grid gap-4`,
                    visibleFields === 1
                        ? "sm:grid-cols-1"
                        : visibleFields === 2
                        ? "sm:grid-cols-2"
                        : visibleFields === 3
                        ? "sm:grid-cols-3"
                        : "sm:grid-cols-4"
                )}
            >
                {/* <div className={cn(`grid sm:grid-cols-4 gap-4`)}> */}
                {showBarcode && (
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                            Barcode
                        </label>
                        <div className="relative flex items-center">
                            <Icon
                                icon="mdi:barcode"
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text dark:text-text-dark"
                            />
                            <input
                                type="text"
                                value={barcode}
                                onChange={handleBarcodeChange}
                                placeholder="Enter Product Barcode"
                                className="w-full py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-600 text-sm rounded-md bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
                                aria-label="Product Barcode"
                            />
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                        Date
                    </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        maxDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select a date"
                        className={`w-full py-2 px-3 border text-sm rounded-md transition-colors duration-200 bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark
                        `}
                        wrapperClassName="w-full"
                        popperClassName="custom-datepicker-popper z-[60]"
                        popperPlacement="bottom-start"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                    />
                </div>
                {showInvoice ? (
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">
                            Generate Invoice
                        </label>
                        <input
                            type="text"
                            value={isLoadingInvoice ? "Generating..." : invoice}
                            onChange={handleInvoiceChange}
                            placeholder="Enter invoice number"
                            className={cn(
                                "w-full py-2 px-3 border text-sm rounded-md bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200",
                                {
                                    "border-red-500": invoiceError,
                                }
                            )}
                            aria-label="Invoice Number"
                        />
                        {invoiceError && (
                            <p className="text-red-500 text-xs mt-1">
                                {invoiceError}
                            </p>
                        )}
                    </div>
                ) : (
                    <input
                        type="hidden"
                        value={isLoadingInvoice ? "Generating..." : invoice}
                        onChange={handleInvoiceChange}
                        className=""
                    />
                )}
                {showAffiliate && (
                    <div>
                        <MultiSelect
                            label="Affiliate"
                            options={affiliateOptions}
                            selectedValues={selectedAffiliate}
                            onChange={setSelectedAffiliate}
                            className="w-full text-sm text-text dark:text-text-dark bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopLeftSection;
