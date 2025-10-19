import { useState, useMemo, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { usePage } from "@inertiajs/react";
import Sortable from "sortablejs";
import toast from "react-hot-toast";
import axios from "axios";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import usePosSettings from "../../hook/usePosSettings";
import PriceFieldWithRateKit from "../../components/PriceFieldWithRateKit";
import QuantityFieldWithWarehouse from "../../components/QuantityFieldWithWarehouse";
import TableHandsOnDiscountField from "../../components/TableHandsOnDiscountField";
import ProductFieldWithSearch from "../../components/ProductFieldWithSearch";
import QuickPurchaseModal from "../../components/QuickPurchaseModal";
import WarrantyField from "../../components/WarrantyField";

const SaleTableSection = ({
    rows,
    setRows,
    selectedCustomer,
    errors,
    setErrors,
    isNewRowAdded,
    setIsNewRowAdded,
    setIsLoading,
    isLoading,
    handleAddViaSale,
    inputRefs,
}) => {
    const { props } = usePage();
    const { products, warehouseSetting, user } = props;
    const warehouse_manage = warehouseSetting?.warehouse_manage === 1;

    const { saleTableMenuFields, handleFieldChange, settings } =
        usePosSettings();
    const {
        elasticSearch,
        saleHandsOnDiscount,
        dragAndDrop,
        colorView,
        sizeView,
        warranty,
        viaSale,
        salePriceType,
        rateKit,
        rateKitType,
        sellingPriceEdit,
        saleWithLowPrice,
        saleWithoutStock,
    } = settings;

    const [rateKitData, setRateKitData] = useState({});
    const [selectedWarehouses, setSelectedWarehouses] = useState({});
    const [popover, setPopover] = useState({
        isOpen: false,
        rowId: null,
        position: { top: 0, left: 0 },
    });

    const [productErrorPopover, setProductErrorPopover] = useState({
        isOpen: false,
        position: { top: 0, left: 0 },
    });

    const [isQuickPurchaseModalOpen, setIsQuickPurchaseModalOpen] =
        useState(false);

    // const [isNewRowAdded, setIsNewRowAdded] = useState(false);

    // Initialize inputRefs with correct structure
    // const inputRefs = useRef([]);
    const tableBodyRef = useRef(null);

    // State for price and quantity error popovers
    const [priceErrorPopovers, setPriceErrorPopovers] = useState({});
    const [qtyErrorPopovers, setQtyErrorPopovers] = useState({});

    useEffect(() => {
        setIsNewRowAdded(false);
    }, []);

    // Update error popovers when errors change
    useEffect(() => {
        const updatedPricePopovers = {};
        const updatedQtyPopovers = {};
        rows.forEach((row, index) => {
            if (errors[row.id]?.price && inputRefs.current[index]?.price) {
                const rect =
                    inputRefs.current[index].price.getBoundingClientRect();
                updatedPricePopovers[row.id] = {
                    isOpen: true,
                    position: {
                        // top: rect.bottom + window.scrollY + 4,
                        // left: rect.left + window.scrollX,
                        bottom: 0,
                        left: 0,
                    },
                };
            } else {
                updatedPricePopovers[row.id] = {
                    isOpen: false,
                    position: { bottom: 0, left: 0 },
                };
            }
            if (errors[row.id]?.qty && inputRefs.current[index]?.qty) {
                const rect =
                    inputRefs.current[index].qty.getBoundingClientRect();
                updatedQtyPopovers[row.id] = {
                    isOpen: true,
                    position: {
                        // top: rect.bottom + window.scrollY + 4,
                        // left: rect.left + window.scrollX,
                        bottom: 0,
                        left: 0,
                    },
                };
            } else {
                updatedQtyPopovers[row.id] = {
                    isOpen: false,
                    position: { bottom: 0, left: 0 },
                };
            }
        });
        setPriceErrorPopovers(updatedPricePopovers);
        setQtyErrorPopovers(updatedQtyPopovers);
    }, [errors, rows]);

    useEffect(() => {
        if (errors.products && inputRefs.current[0]?.product) {
            const rect = inputRefs.current[0].product.getBoundingClientRect();
            setProductErrorPopover({
                isOpen: true,
                position: {
                    top: 0,
                    left: 0,
                },
            });
        } else {
            setProductErrorPopover({
                isOpen: false,
                position: { top: 0, left: 0 },
            });
        }
    }, [errors.products]);

    const productOptions = useMemo(() => {
        return products.map((product) => ({
            value: product.id,
            label: `${product?.product?.name} - (${product?.color_name?.name}) (${product?.variation_size?.size})`,
            product,
        }));
    }, [products]);

    const getFilteredOptions = (currentRowId) => {
        const selectedProductIds = rows
            .filter((row) => row.id !== currentRowId && row.product)
            .map((row) => row.variantId);
        return productOptions.filter(
            (option) => !selectedProductIds.includes(option.value)
        );
    };

    const calculateTotal = (price, qty, discountAmount) => {
        return (
            (parseFloat(price) || 0) * (parseInt(qty) || 0) -
            (parseFloat(discountAmount) || 0)
        );
    };

    // const handleAddRow = (productOption = null) => {
    //     const newRow = {
    //         id: Date.now(),
    //         sl: rows.length + 1,
    //         product: null,
    //         variantId: null,
    //         color: null,
    //         size: null,
    //         price: "",
    //         qty: 1,
    //         maxStock: 0,
    //         discountPercentage: "",
    //         discountAmount: "",
    //         warranty: "",
    //         total: 0,
    //         stockWarehouseId: null,
    //     };

    //     setRows((prevRows) => {
    //         const updatedRows = productOption
    //             ? prevRows.map((row) =>
    //                   row.id === productOption.id
    //                       ? {
    //                             ...row,
    //                             product:
    //                                 productOption?.product?.product?.name ||
    //                                 null,
    //                             variantId: productOption?.value || null,
    //                             price:
    //                                 salePriceType === "b2c_price"
    //                                     ? productOption?.product?.b2c_price
    //                                     : productOption?.product?.b2b_price,
    //                             color:
    //                                 productOption?.product?.color_name?.name ||
    //                                 "",
    //                             size:
    //                                 productOption?.product?.variation_size
    //                                     ?.size || "",
    //                             maxQty: calculateArraySum(
    //                                 productOption?.product?.stocks,
    //                                 "stock_quantity"
    //                             ),
    //                             total: calculateTotal(
    //                                 salePriceType === "b2c_price"
    //                                     ? productOption?.product?.b2c_price
    //                                     : productOption?.product?.b2b_price,
    //                                 1,
    //                                 0
    //                             ),
    //                             stockWarehouseId: null,
    //                         }
    //                       : row
    //               )
    //             : [...prevRows, newRow];

    //         // Update inputRefs synchronously
    //         inputRefs.current = updatedRows.map(() => ({
    //             product: null,
    //             price: null,
    //             qty: null,
    //             discountPercentage: null,
    //             discountAmount: null,
    //             warranty: null,
    //         }));

    //         setIsNewRowAdded(true);

    //         setTimeout(() => {
    //             const newRowIndex = updatedRows.length - 1;
    //             if (inputRefs.current[newRowIndex]?.product) {
    //                 inputRefs.current[newRowIndex].product.focus();
    //                 // Trigger dropdown open
    //                 inputRefs.current[newRowIndex].product.dispatchEvent(
    //                     new KeyboardEvent("keydown", { key: "Enter" })
    //                 );
    //             }
    //         }, 200);

    //         return updatedRows;
    //     });

    //     // Focus on the new row's product field
    //     if (!productOption) {
    //         setTimeout(() => {
    //             const newRowIndex = rows.length;
    //             if (inputRefs.current[newRowIndex]?.product) {
    //                 inputRefs.current[newRowIndex].product.focus();
    //             }
    //         }, 100);
    //     }
    // };
    const handleAddRow = (productOption = null) => {
        const newRow = {
            id: Date.now(),
            sl: rows.length + 1,
            product: null,
            variantId: null,
            color: null,
            size: null,
            price: "",
            qty: 1,
            maxStock: 0,
            discountPercentage: "",
            discountAmount: "",
            warranty: "",
            warranty_type: "month",
            total: 0,
            stockWarehouseId: null,
        };

        setRows((prevRows) => {
            const updatedRows = productOption
                ? prevRows.map((row) =>
                      row.id === productOption.id
                          ? {
                                ...row,
                                product:
                                    productOption?.product?.product?.name ||
                                    null,
                                variantId: productOption?.value || null,
                                price:
                                    salePriceType === "b2c_price"
                                        ? productOption?.product?.b2c_price
                                        : productOption?.product?.b2b_price,
                                color:
                                    productOption?.product?.color_name?.name ||
                                    "",
                                size:
                                    productOption?.product?.variation_size
                                        ?.size || "",
                                maxQty: calculateArraySum(
                                    productOption?.product?.stocks,
                                    "stock_quantity"
                                ),
                                total: calculateTotal(
                                    salePriceType === "b2c_price"
                                        ? productOption?.product?.b2c_price
                                        : productOption?.product?.b2b_price,
                                    1,
                                    0
                                ),
                                stockWarehouseId: null,
                            }
                          : row
                  )
                : [...prevRows, newRow];

            setIsNewRowAdded(true);
            return updatedRows;
        });
    };

    const handleDeleteRow = (id) => {
        if (rows.length > 1) {
            setRows((prevRows) =>
                prevRows
                    .filter((row) => row.id !== id)
                    .map((row, index) => ({
                        ...row,
                        sl: index + 1,
                    }))
            );
            setRateKitData((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            setSelectedWarehouses((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            if (popover.rowId === id) {
                setPopover({
                    isOpen: false,
                    rowId: null,
                    position: { top: 0, left: 0 },
                });
            }
            // Clear errors for the deleted row
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    const handleInputChange = (id, field, value, maxQty = null) => {
        if (value && parseFloat(value) < 0) {
            toast.error("Negative values are not allowed");
            return;
        }

        if (field === "warranty_type") {
            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === id ? { ...row, warranty_type: value } : row
                )
            );
            // Type change-এ current warranty validate করুন
            setRows((prevRows) =>
                prevRows.map((row) => {
                    if (row.id === id) {
                        let validatedWarranty = parseFloat(row.warranty) || 0;
                        const max = value === "month" ? 360 : 30;
                        if (validatedWarranty > max) {
                            validatedWarranty = max;
                            toast.error(
                                `Warranty cannot exceed ${max} for ${value}`
                            );
                        }
                        return {
                            ...row,
                            warranty: validatedWarranty.toString(),
                        };
                    }
                    return row;
                })
            );
            return;
        }

        if (field === "warranty") {
            const row = rows.find((r) => r.id === id);
            const max = row.warranty_type === "month" ? 360 : 30;
            let validatedValue = parseFloat(value) || 0;
            if (validatedValue > max && value !== "") {
                validatedValue = max;
                toast.error(
                    `Warranty cannot exceed ${max} for ${row.warranty_type}`
                );
            }
            value = validatedValue.toString();
        }

        // Update errors based on input validation
        setErrors((prev) => {
            const updatedErrors = { ...prev };
            if (field === "price" || field === "qty") {
                const row = rows.find((r) => r.id === id);
                if (row?.product) {
                    if (field === "price") {
                        if (!value || parseFloat(value) <= 0) {
                            updatedErrors[id] = {
                                ...updatedErrors[id],
                                price: "Price must be greater than 0.",
                            };
                        } else {
                            updatedErrors[id] = {
                                ...updatedErrors[id],
                                price: undefined,
                            };
                        }
                    }
                    if (field === "qty") {
                        if (!value || parseInt(value) <= 0) {
                            updatedErrors[id] = {
                                ...updatedErrors[id],
                                qty: "Quantity must be greater than 0.",
                            };
                        } else {
                            updatedErrors[id] = {
                                ...updatedErrors[id],
                                qty: undefined,
                            };
                        }
                    }
                    // Clean up empty error objects
                    if (
                        updatedErrors[id] &&
                        Object.keys(updatedErrors[id]).length === 0
                    ) {
                        delete updatedErrors[id];
                    }
                }
            }
            return updatedErrors;
        });

        setRows((prevRows) =>
            prevRows.map((row) => {
                if (row.id === id) {
                    let updatedRow = { ...row };
                    if (field === "discountPercentage") {
                        const percentage = parseFloat(value) || 0;
                        if (percentage > 100) {
                            toast.error(
                                "Discount percentage cannot exceed 100%"
                            );
                            return row;
                        }
                        const amount = (row.price * row.qty * percentage) / 100;
                        updatedRow = {
                            ...row,
                            discountPercentage: value,
                            discountAmount: amount ? amount.toFixed(2) : "",
                            total: calculateTotal(row.price, row.qty, amount),
                        };
                    } else if (field === "discountAmount") {
                        const totalBeforeDiscount =
                            (parseFloat(row.price) || 0) *
                            (parseInt(row.qty) || 0);
                        const amount =
                            value === "" ? "" : parseFloat(value) || 0;
                        let validatedAmount = amount;

                        if (amount < 0) {
                            toast.error("Discount amount cannot be negative.");
                            return row;
                        }

                        // totalBeforeDiscount এ
                        if (amount > totalBeforeDiscount && value !== "") {
                            validatedAmount = totalBeforeDiscount;
                            toast.error(
                                `Discount amount cannot exceed total amount of ${totalBeforeDiscount.toFixed(
                                    2
                                )}`
                            );
                        }

                        const percentage =
                            totalBeforeDiscount > 0 && validatedAmount
                                ? (validatedAmount / totalBeforeDiscount) * 100
                                : 0;
                        updatedRow = {
                            ...row,
                            discountAmount: value,
                            discountPercentage: percentage
                                ? percentage.toFixed(2)
                                : "",
                            total: calculateTotal(
                                row.price,
                                row.qty,
                                validatedAmount
                            ),
                        };
                    } else if (
                        field === "qty" &&
                        !saleWithoutStock &&
                        maxQty !== null
                    ) {
                        const qty = value === "" ? "" : parseFloat(value) || 0;
                        let validatedQty = qty;

                        // maxQty check
                        if (qty > maxQty && value !== "") {
                            validatedQty = maxQty;
                            toast.error(
                                `Quantity cannot exceed available stock of ${maxQty}`
                            );
                        }
                        updatedRow = {
                            ...row,
                            qty: value,
                            total: calculateTotal(
                                row.price,
                                value,
                                row.discountAmount
                            ),
                        };
                    } else {
                        updatedRow = {
                            ...row,
                            [field]: value,
                            total: calculateTotal(
                                field === "price" ? value : row.price,
                                field === "qty" ? value : row.qty,
                                row.discountAmount
                            ),
                        };
                    }
                    return updatedRow;
                }
                return row;
            })
        );
        if (field === "price" && popover.rowId === id) {
            setPopover({
                isOpen: false,
                rowId: null,
                position: { top: 0, left: 0 },
            });
        }
    };

    const customerId = selectedCustomer?.id ?? null;
    const handleShowRateKit = async (variant_id, rowId) => {
        if (!rateKit) return null;
        try {
            const response = await axios.get("/rate-kit-price-get", {
                params: {
                    variant_id: variant_id,
                    customer_id: customerId,
                },
            });
            if (response.data.success) {
                setRateKitData((prev) => ({
                    ...prev,
                    [rowId]: response.data.data.sale_item,
                }));
                const latestRate = response.data.data.sale_item[0]?.rate || "";
                if (latestRate) {
                    setRows((prevRows) =>
                        prevRows.map((row) =>
                            row.id === rowId
                                ? {
                                      ...row,
                                      price: latestRate,
                                      total: calculateTotal(
                                          latestRate,
                                          row.qty,
                                          row.discountAmount
                                      ),
                                  }
                                : row
                        )
                    );
                }
                return response.data;
            } else {
                console.error(response?.data?.message);
                return null;
            }
        } catch (error) {
            console.error("Error fetching Rate Kit:", error);
            return null;
        }
    };

    const handleProductSelect = (id, option) => {
        if (!option) return;
        const isAlreadySelected = rows.some(
            (row) => row.id !== id && row.variantId === option.value
        );
        if (isAlreadySelected) {
            toast.error("This product is already selected in another row.");
            return;
        }

        let rateKitResponse = null;
        if (
            rateKit &&
            (rateKitType !== "party" ||
                (rateKitType === "party" && selectedCustomer?.id))
        ) {
            rateKitResponse = handleShowRateKit(option.value, id);
        }

        const totalQty =
            option?.product?.stocks?.reduce((accumulator, currentStock) => {
                return (
                    accumulator +
                    (parseFloat(currentStock?.stock_quantity) || 0)
                );
            }, 0) || 0;

        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          product: option?.product?.product?.name || null,
                          variantId: option?.value || null,
                          price:
                              salePriceType === "b2c_price"
                                  ? option?.product?.b2c_price
                                  : option?.product?.b2b_price,
                          color: option?.product?.color_name?.name || "",
                          size: option?.product?.variation_size?.size || "",
                          maxQty: totalQty,
                          total: calculateTotal(
                              salePriceType === "b2c_price"
                                  ? option?.product?.b2c_price
                                  : option?.product?.b2b_price,
                              row.qty,
                              row.discountAmount
                          ),
                          stockWarehouseId: null,
                      }
                    : row
            )
        );

        setErrors((prev) => ({
            ...prev,
            products: undefined,
        }));

        const rowIndex = rows.findIndex((row) => row.id === id);
        setTimeout(() => {
            const fields = ["product"];
            if (sellingPriceEdit) fields.push("price");
            fields.push("qty");
            if (saleHandsOnDiscount) {
                fields.push("discountPercentage");
                fields.push("discountAmount");
            }
            if (warranty) fields.push("warranty");
            const nextField = fields[fields.indexOf("product") + 1];
            if (inputRefs.current[rowIndex]?.[nextField]) {
                inputRefs.current[rowIndex][nextField].focus();
                if (
                    rateKit &&
                    rateKitResponse?.success &&
                    rateKitData[id] &&
                    nextField === "price" &&
                    sellingPriceEdit
                ) {
                    openRateKitPopoverForRow(id, rowIndex);
                }
            }
        }, 100);
    };

    const openRateKitPopoverForRow = (rowId, rowIndex) => {
        if (!rateKit || !rateKitData[rowId] || !sellingPriceEdit) return;
        if (popover.isOpen && popover.rowId === rowId) return;

        const priceInput = inputRefs.current[rowIndex]?.price;
        if (priceInput) {
            const rect = priceInput.getBoundingClientRect();
            setPopover({
                isOpen: true,
                rowId,
                position: {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                },
            });
        }
    };

    const handleKeyDown = (e, rowIndex, field) => {
        const totalRows = rows.length;
        const fields = ["product"];
        if (sellingPriceEdit) fields.push("price");
        fields.push("qty");
        if (saleHandsOnDiscount) {
            fields.push("discountPercentage");
            fields.push("discountAmount");
        }
        if (warranty) fields.push("warranty");

        const currentFieldIndex = fields.indexOf(field);
        const isLastField = currentFieldIndex === fields.length - 1;

        if (e.key === "Enter" || e.key === "ArrowRight") {
            e.preventDefault();
            if (isLastField) {
                handleAddRow();
            } else {
                const nextField = fields[currentFieldIndex + 1];
                if (inputRefs.current[rowIndex]?.[nextField]) {
                    inputRefs.current[rowIndex][nextField].focus();
                }
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (currentFieldIndex > 0) {
                const prevField = fields[currentFieldIndex - 1];
                if (inputRefs.current[rowIndex]?.[prevField]) {
                    inputRefs.current[rowIndex][prevField].focus();
                }
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (rowIndex > 0) {
                if (inputRefs.current[rowIndex - 1]?.[field]) {
                    inputRefs.current[rowIndex - 1][field].focus();
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (rowIndex < totalRows - 1) {
                if (inputRefs.current[rowIndex + 1]?.[field]) {
                    inputRefs.current[rowIndex + 1][field].focus();
                }
            }
        }
    };

    // Initialize inputRefs when rows change
    useEffect(() => {
        inputRefs.current = rows.map(() => ({
            product: null,
            price: null,
            qty: null,
            discountPercentage: null,
            discountAmount: null,
            warranty: null,
        }));
    }, [rows]);

    useEffect(() => {
        const tbody = tableBodyRef.current;
        let sortable = null;

        if (tbody && dragAndDrop) {
            sortable = new Sortable(tbody, {
                animation: 150,
                handle: ".drag-handle",
                onEnd: (evt) => {
                    const { oldIndex, newIndex } = evt;
                    setRows((prevRows) => {
                        const updatedRows = [...prevRows];
                        const [movedRow] = updatedRows.splice(oldIndex, 1);
                        updatedRows.splice(newIndex, 0, movedRow);
                        return updatedRows.map((row, index) => ({
                            ...row,
                            sl: index + 1,
                        }));
                    });
                },
            });
        }

        return () => {
            if (sortable) {
                sortable.destroy();
            }
        };
    }, [dragAndDrop]);

    return (
        <>
            <div className="p-2 col-span-6 mb-40 border-gray-300 dark:border-gray-600 bg-surface-light dark:bg-surface-dark rounded-sm shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-base font-semibold text-text dark:text-text-dark border-l-4 border-primary pl-2">
                        Sale Items
                    </h2>
                    <div className="flex justify-end items-center gap-3">
                        {viaSale && (
                            <button
                                onClick={() =>
                                    setIsQuickPurchaseModalOpen(true)
                                }
                                className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-xs sm:text-sm font-medium shadow-sm"
                            >
                                Quick Purchase
                            </button>
                        )}
                        <button
                            onClick={() => handleAddRow()}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-primary dark:bg-primary-dark text-white rounded-sm hover:bg-primary-dark dark:hover:bg-primary focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:ring-opacity-50 transition-colors duration-200 text-xs sm:text-sm font-medium shadow-sm"
                            aria-label="Add more rows"
                        >
                            <Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
                            Add More
                        </button>
                        <ThreeDotMenu
                            fields={saleTableMenuFields}
                            onFieldChange={handleFieldChange}
                        />
                    </div>
                </div>
                <div className="overflow-x-scroll h-[360px] overflow-y-auto">
                    <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 min-w-[600px] overflow-x-scroll">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark sticky top-0 z-10">
                                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[2%]">
                                    SL
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[25%]">
                                    Product
                                </th>
                                {colorView && (
                                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                                        Color
                                    </th>
                                )}
                                {sizeView && (
                                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                                        Size
                                    </th>
                                )}
                                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                                    Price
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                                    Qty
                                </th>
                                {saleHandsOnDiscount && (
                                    <th className="border border-gray-300 dark:border-gray-600 text-center text-xs sm:text-sm font-medium w-[10%]">
                                        Discount
                                        <div className="grid grid-cols-2 text-center">
                                            <span className="bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark text-xs text-center font-bold py-0.5 border">
                                                %
                                            </span>
                                            <span className="bg-gray-100 dark:bg-gray-700 text-text dark:text-text-dark text-xs text-center font-bold py-0.5 border">
                                                Amount
                                            </span>
                                        </div>
                                    </th>
                                )}
                                {warranty && (
                                    <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                                        Warranty
                                    </th>
                                )}
                                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[10%]">
                                    Total
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left text-xs sm:text-sm font-medium w-[5%]">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody ref={tableBodyRef}>
                            {rows.map((row, rowIndex) => (
                                <tr
                                    key={row.id}
                                    className="border border-gray-300 dark:border-gray-600 text-text dark:text-text-dark"
                                >
                                    <td className="border border-gray-300 dark:border-gray-600 p-1">
                                        <div className="flex items-center">
                                            {dragAndDrop && (
                                                <Icon
                                                    icon="mdi:drag"
                                                    className="drag-handle w-4 h-4 mr-1 cursor-grab text-gray-500 dark:text-gray-400"
                                                />
                                            )}
                                            <span className="text-xs sm:text-sm">
                                                {row.sl}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 p-1">
                                        <ProductFieldWithSearch
                                            row={row}
                                            rowIndex={rowIndex}
                                            user={user}
                                            productOptions={productOptions}
                                            getFilteredOptions={
                                                getFilteredOptions
                                            }
                                            handleProductSelect={
                                                handleProductSelect
                                            }
                                            inputRefs={inputRefs}
                                            handleKeyDown={handleKeyDown}
                                            elasticSearch={elasticSearch}
                                            errors={errors}
                                            productErrorPopover={
                                                rowIndex === 0
                                                    ? productErrorPopover
                                                    : {
                                                          isOpen: false,
                                                          position: {
                                                              top: 0,
                                                              left: 0,
                                                          },
                                                      }
                                            }
                                            salePriceType={salePriceType}
                                            forceOpen={
                                                isNewRowAdded &&
                                                rowIndex === rows.length - 1
                                            }
                                        />
                                    </td>
                                    {colorView && (
                                        <td className="border border-gray-300 dark:border-gray-600 p-1">
                                            <span className="text-xs sm:text-sm">
                                                {row?.color ?? "N/A"}
                                            </span>
                                        </td>
                                    )}
                                    {sizeView && (
                                        <td className="border border-gray-300 dark:border-gray-600 p-1">
                                            <span className="text-xs sm:text-sm">
                                                {row?.size ?? "N/A"}
                                            </span>
                                        </td>
                                    )}
                                    <td className="border border-gray-300 dark:border-gray-600 p-1 relative">
                                        <PriceFieldWithRateKit
                                            rows={rows}
                                            row={row}
                                            setRows={setRows}
                                            handleInputChange={
                                                handleInputChange
                                            }
                                            inputRefs={inputRefs}
                                            handleKeyDown={handleKeyDown}
                                            selectedCustomer={selectedCustomer}
                                            rowIndex={rowIndex}
                                            rateKitData={rateKitData}
                                            popover={popover}
                                            setPopover={setPopover}
                                            handleShowRateKit={
                                                handleShowRateKit
                                            }
                                            sellingPriceEdit={sellingPriceEdit}
                                            errors={errors}
                                            priceErrorPopover={
                                                priceErrorPopovers[row.id] || {
                                                    isOpen: false,
                                                    position: {
                                                        top: 0,
                                                        left: 0,
                                                    },
                                                }
                                            }
                                        />
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 p-1">
                                        <QuantityFieldWithWarehouse
                                            rows={rows}
                                            row={row}
                                            handleInputChange={
                                                handleInputChange
                                            }
                                            inputRefs={inputRefs}
                                            handleKeyDown={handleKeyDown}
                                            selectedCustomer={selectedCustomer}
                                            rowIndex={rowIndex}
                                            saleWithoutStock={saleWithoutStock}
                                            selectedWarehouses={
                                                selectedWarehouses
                                            }
                                            setSelectedWarehouses={
                                                setSelectedWarehouses
                                            }
                                            warehouse_manage={warehouse_manage}
                                            errors={errors}
                                            qtyErrorPopover={
                                                qtyErrorPopovers[row.id] || {
                                                    isOpen: false,
                                                    position: {
                                                        top: 0,
                                                        left: 0,
                                                    },
                                                }
                                            }
                                            handleAddRow={handleAddRow}
                                            setRows={setRows}
                                        />
                                    </td>
                                    {saleHandsOnDiscount && (
                                        <td className="border border-gray-300 dark:border-gray-600">
                                            <TableHandsOnDiscountField
                                                row={row}
                                                handleInputChange={
                                                    handleInputChange
                                                }
                                                rowIndex={rowIndex}
                                                inputRefs={inputRefs}
                                                handleKeyDown={handleKeyDown}
                                                handleAddRow={handleAddRow}
                                            />
                                        </td>
                                    )}
                                    {warranty && (
                                        <td className="border border-gray-300 dark:border-gray-600 p-1">
                                            <WarrantyField
                                                row={row}
                                                handleInputChange={
                                                    handleInputChange
                                                }
                                                inputRefs={inputRefs}
                                                handleAddRow={handleAddRow}
                                                handleKeyDown={handleKeyDown}
                                                rowIndex={rowIndex}
                                            />
                                        </td>
                                    )}
                                    <td className="border border-gray-300 dark:border-gray-600 p-1">
                                        <input
                                            type="text"
                                            value={row.total.toFixed(2)}
                                            readOnly
                                            className="w-full p-0.5 border-none rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 cursor-not-allowed"
                                            aria-label="Total"
                                        />
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 p-1 text-center">
                                        <button
                                            onClick={() =>
                                                handleDeleteRow(row.id)
                                            }
                                            disabled={rows.length === 1}
                                            className={`p-1 rounded-sm transition-colors duration-200 ${
                                                rows.length === 1
                                                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                                    : "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                                            }`}
                                            aria-label="Delete row"
                                        >
                                            <Icon
                                                icon="iconamoon:trash-light"
                                                width="16"
                                                height="16"
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <QuickPurchaseModal
                isOpen={isQuickPurchaseModalOpen}
                onClose={() => setIsQuickPurchaseModalOpen(false)}
                products={products}
                salePriceType={salePriceType}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                handleAddViaSale={handleAddViaSale}
            />
        </>
    );
};

export default SaleTableSection;
