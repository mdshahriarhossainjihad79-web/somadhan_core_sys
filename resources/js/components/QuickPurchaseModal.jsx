import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import axios from "axios";
import SelectSearch from "./SelectSearch";
import { router, usePage } from "@inertiajs/react";
import AddProductModal from "./AddProductModal";
import AddSupplierModal from "./AddSupplierModal";
import Loader from "./Loader";

const QuickPurchaseModal = ({
    isOpen,
    onClose,
    salePriceType,
    setIsLoading,
    isLoading,
    handleAddViaSale,
}) => {
    const { props } = usePage();
    const { quickPurchaseProducts, banks, suppliers } = props;
    const [purchaseRows, setPurchaseRows] = useState([
        {
            id: Date.now(),
            product: null,
            variantId: null,
            color: "",
            size: "",
            costPrice: "",
            salePrice: "",
            qty: 1,
            total: 0,
        },
    ]);
    const [supplierName, setSupplierName] = useState(null);
    const [supplierOptions, setSupplierOptions] = useState(
        suppliers.map((supplier) => ({
            value: supplier.id,
            label: `${supplier?.name} - (${supplier?.phone})`,
            supplier,
        }))
    );
    const [total, setTotal] = useState(0);
    const [paid, setPaid] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [due, setDue] = useState(0);
    const [errors, setErrors] = useState({});
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

    // Product Options for SelectSearch
    const productOptions = useMemo(() => {
        return quickPurchaseProducts.map((product) => ({
            value: product.id,
            label: `${product?.product?.name} - (${product?.color_name?.name}) (${product?.variation_size?.size})`,
            product,
        }));
    }, [quickPurchaseProducts]);

    // Calculate Total
    useEffect(() => {
        const calculatedTotal = purchaseRows.reduce((acc, row) => {
            return acc + (parseFloat(row.total) || 0);
        }, 0);
        setTotal(calculatedTotal);
        setDue((parseFloat(calculatedTotal) || 0) - (parseFloat(paid) || 0));
    }, [purchaseRows, paid]);

    // Handle Product Selection
    const handleProductSelect = (id, option) => {
        setPurchaseRows((prevRows) =>
            prevRows.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          product: option
                              ? option.product?.product?.name
                              : null,
                          variantId: option ? option.value : null,
                          color: option
                              ? option.product?.color_name?.name || ""
                              : "",
                          size: option
                              ? option.product?.variation_size?.size || ""
                              : "",
                          costPrice: option
                              ? option.product?.cost_price || 0
                              : "",
                          salePrice: option
                              ? salePriceType === "b2c_price"
                                  ? option.product?.b2c_price
                                  : option.product?.b2b_price
                              : "",
                          qty: 1,
                          total: option ? option.product?.cost_price || 0 : 0,
                      }
                    : row
            )
        );

        setErrors((prev) => ({
            ...prev,
            products: undefined,
        }));
    };

    // Handle Party Selection
    const handleSupplierSelect = (option) => {
        setSupplierName(option?.value || null);
        setErrors((prev) => ({
            ...prev,
            supplierName: undefined,
        }));
    };

    // Handle Add Product Row
    const handleAddProductRow = () => {
        const newRow = {
            id: Date.now(),
            product: null,
            variantId: null,
            color: "",
            size: "",
            costPrice: "",
            salePrice: "",
            qty: 1,
            total: 0,
        };
        setPurchaseRows((prevRows) => [...prevRows, newRow]);
    };

    // Handle Delete Product Row
    const handleDeleteRow = (id) => {
        if (purchaseRows.length > 1) {
            setPurchaseRows((prevRows) =>
                prevRows.filter((row) => row.id !== id)
            );
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    // Handle Input Change
    const handleInputChange = (id, field, value) => {
        if (value && parseFloat(value) < 0) {
            toast.error("Negative values are not allowed.");
            return;
        }

        setPurchaseRows((prevRows) =>
            prevRows.map((row) => {
                if (row.id === id) {
                    const updatedRow = { ...row, [field]: value };
                    updatedRow.total =
                        (Number(updatedRow.costPrice) || 0) *
                        (Number(updatedRow.qty) || 0);
                    return updatedRow;
                }
                return row;
            })
        );
    };

    // Handle Paid Amount Change
    const handlePaidChange = (value) => {
        if (value && parseFloat(value) < 0) {
            toast.error("Negative values are not allowed.");
            return;
        }
        setPaid(value);
        setDue(total - (parseFloat(value) || 0));
    };

    // Handle Add Product Modal
    const handleAddProductModal = () => {
        setIsAddProductModalOpen(true);
    };

    // Handle Add Supplier Modal
    const handleAddSupplierModal = () => {
        setIsAddSupplierModalOpen(true);
    };

    // Handle Add Product Submission
    const handleAddProductSubmit = async (productData) => {
        setIsLoading(true);
        console.log(productData);
        try {
            const formData = new FormData();
            formData.append("name", productData.name);
            formData.append("unit", productData.unit_id || "");
            if (productData.category_id)
                formData.append("category_id", productData.category_id);
            if (productData.subcategory_id)
                formData.append("subcategory_id", productData.subcategory_id);
            if (productData.brand_id)
                formData.append("brand_id", productData.brand_id);
            if (productData.description)
                formData.append("description", productData.description);
            if (productData.variant_name)
                formData.append("variant_name", productData.variant_name);
            formData.append("variation.cost_price", productData.cost_price);
            if (productData.sale_price) {
                if (salePriceType === "b2c_price") {
                    formData.append(
                        "variation.b2c_price",
                        productData.sale_price
                    );
                    formData.append("variation.b2b_price", 0);
                } else if (salePriceType === "b2b_price") {
                    formData.append("variation.b2c_price", 0);
                    formData.append(
                        "variation.b2b_price",
                        productData.sale_price
                    );
                } else {
                    formData.append("variation.b2c_price", 0);
                    formData.append("variation.b2b_price", 0);
                }
            } else {
                formData.append("variation.b2c_price", 0);
                formData.append("variation.b2b_price", 0);
            }
            if (productData.size_id)
                formData.append("variation.size", productData.size_id);
            if (productData.color_id)
                formData.append("variation.color", productData.color_id);
            if (productData.model_no)
                formData.append("variation.model_no", productData.model_no);
            if (productData.quality)
                formData.append("variation.quality", productData.quality);
            if (productData.origin)
                formData.append("variation.origin", productData.origin);
            if (productData.image)
                formData.append("variation.image", productData.image);

            const response = await axios.post("/via-product/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("via Product", response.data);

            if (response.data.status === 201) {
                toast.success("Product Saved successfully.");

                // Store the new product temporarily
                const newProduct = response.data.variation; // Assuming response.data.product returns the new product object

                // Refresh quickPurchaseProducts with onSuccess callback
                router.reload({
                    only: ["quickPurchaseProducts"],
                    onSuccess: () => {
                        // Close modal and add row after reload success
                        setIsAddProductModalOpen(false);
                        if (newProduct) {
                            const newRow = {
                                id: Date.now(),
                                product: newProduct?.product?.name || null,
                                variantId: newProduct?.id || null,
                                color: newProduct?.color_name?.name || "",
                                size: newProduct?.variation_size?.size || "",
                                costPrice: newProduct?.cost_price || 0,
                                salePrice:
                                    salePriceType === "b2c_price"
                                        ? newProduct?.b2c_price
                                        : newProduct?.b2b_price || 0,
                                qty: 1,
                                total: newProduct?.cost_price || 0,
                            };
                            setPurchaseRows((prevRows) => [
                                ...prevRows,
                                newRow,
                            ]);
                        }
                    },
                });
            } else {
                throw new Error(
                    response.data.message || "Failed to add product."
                );
            }
        } catch (error) {
            console.error("Error adding product:", error);
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach((err) =>
                    toast.error(err)
                );
            } else {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to add product. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // handle suppler add
    const handleAddSupplierSubmit = async (supplierData) => {
        setIsLoading(true);
        try {
            const response = await axios.post("/supplier/add", supplierData);
            console.log(response);
            if (response.data.status === 201) {
                toast.success("Supplier added successfully.");
                setIsAddSupplierModalOpen(false);
                const newSupplier = response.data.supplier;
                const newOption = {
                    value: newSupplier.id,
                    label: `${newSupplier.name} - (${newSupplier.phone})`,
                    supplier: newSupplier,
                };

                setSupplierOptions((prev) => [...prev, newOption]);

                setSupplierName(newSupplier.id);

                router.reload({
                    only: ["suppliers"],
                    // onSuccess: () => {
                    //     toast.success("Supplier List Updated");
                    // },
                });
            } else {
                throw new Error(
                    response.data.message || "Failed to add supplier."
                );
            }
        } catch (error) {
            console.error("Error adding supplier:", error);
            toast.error("Failed to add supplier. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setPurchaseRows([
            {
                id: Date.now(),
                product: null,
                variantId: null,
                color: "",
                size: "",
                costPrice: "",
                salePrice: "",
                qty: 1,
                total: 0,
            },
        ]);
        setSupplierName(null);
        setPaymentMethod(null);
        setPaid("");
        setDue(0);
        setErrors({});
        setTotal(0);
    };

    // Handle Purchase Submission
    const handlePurchase = async () => {
        const newErrors = {};

        // Validate Rows
        purchaseRows.forEach((row) => {
            if (row.product) {
                if (!row.costPrice || parseFloat(row.costPrice) <= 0) {
                    newErrors[row.id] = {
                        ...newErrors[row.id],
                        costPrice: "Cost price must be greater than 0.",
                    };
                }
                if (!row.salePrice || parseFloat(row.salePrice) <= 0) {
                    newErrors[row.id] = {
                        ...newErrors[row.id],
                        salePrice: "Sale price must be greater than 0.",
                    };
                }
                if (!row.qty || parseInt(row.qty) <= 0) {
                    newErrors[row.id] = {
                        ...newErrors[row.id],
                        qty: "Quantity must be greater than 0.",
                    };
                }
            }
        });

        // Validate Party Name
        if (!supplierName) {
            newErrors.supplierName = "Supplier name is required.";
        }

        if (parseFloat(paid) > 0 && !paymentMethod) {
            newErrors.paymentMethod = "Payment Method is required.";
        }

        // Validate Products
        if (
            purchaseRows.length === 0 ||
            purchaseRows.every((row) => !row.product)
        ) {
            newErrors.products = "At least one product must be added.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Object.values(newErrors).forEach((error) => {
                if (typeof error === "string") toast.error(error);
                else Object.values(error).forEach((msg) => toast.error(msg));
            });
            return;
        }

        // Prepare data for submission
        const purchaseData = {
            supplier_id: supplierName,
            products: purchaseRows
                .filter((row) => row.variantId !== null)
                .map((row) => ({
                    variantId: row.variantId,
                    color: row.color,
                    size: row.size,
                    costPrice: parseFloat(row.costPrice) || 0,
                    salePrice: parseFloat(row.salePrice) || 0,
                    qty: parseInt(row.qty) || 0,
                    total: parseFloat(row.total) || 0,
                })),
            total,
            paid,
            due,
            payment_method: paymentMethod,
        };

        try {
            setIsLoading(true);
            const response = await axios.post("/quick-purchase", purchaseData);
            // console.log(response);
            if (response.data.status === 201) {
                toast.success("Purchase completed successfully.");
                const purchasedProducts = purchaseRows
                    .filter((row) => row.variantId !== null)
                    .map((row) => ({
                        variantId: row.variantId,
                        product: row.product,
                        color: row.color,
                        size: row.size,
                        salePrice: parseFloat(row.salePrice) || 0,
                        qty: parseInt(row.qty) || 1,
                        total: parseFloat(row.total) || 0,
                    }));

                await handleAddViaSale(purchasedProducts);
                resetForm();
            } else {
                throw new Error(
                    response.data.message || "Unexpected response from server."
                );
            }
            onClose();
        } catch (error) {
            console.error("Error during purchase submission:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to complete purchase. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-2 sm:px-4">
                {isLoading && <Loader />}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-4 sm:p-5 w-full max-w-[98vw] sm:max-w-6xl lg:max-w-7xl max-h-[92vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-base sm:text-lg font-semibold text-text dark:text-text-dark">
                            Quick Purchase
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <Icon icon="mdi:close" width="20" height="20" />
                        </button>
                    </div>
                    <div className="mt-2 overflow-y-auto h-[300px] rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full table-auto border-collapse text-[10px] sm:text-xs">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark sticky top-0 z-10">
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[25%] sm:w-[20%]">
                                        Product
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[15%] sm:w-[15%]">
                                        Color
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[15%] sm:w-[15%]">
                                        Size
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[12%] sm:w-[15%]">
                                        Cost Price
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[12%] sm:w-[15%]">
                                        Sale Price
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[5%] sm:w-[10%]">
                                        Quantity
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[12%] sm:w-[15%]">
                                        Total
                                    </th>
                                    <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-left font-medium w-[5%] sm:w-[5%]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseRows.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                    >
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <SelectSearch
                                                    options={productOptions}
                                                    onSelect={(option) =>
                                                        handleProductSelect(
                                                            row.id,
                                                            option
                                                        )
                                                    }
                                                    placeholder="Select a product"
                                                    selectedValue={
                                                        row.product
                                                            ? {
                                                                  value: row.variantId,
                                                                  label: row.product,
                                                              }
                                                            : null
                                                    }
                                                    wrapperClass="w-full"
                                                    zIndex={50}
                                                    buttonText="+"
                                                    onButtonClick={
                                                        handleAddProductModal
                                                    }
                                                />
                                            </div>
                                            {errors[row.id]?.product && (
                                                <span className="text-red-500 text-[10px] sm:text-xs">
                                                    {errors[row.id].product}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={row.color}
                                                readOnly
                                                className="w-full p-1 sm:p-1.5 border rounded text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark cursor-not-allowed"
                                                placeholder="Color"
                                            />
                                            {errors[row.id]?.color && (
                                                <span className="text-red-500 text-[10px] sm:text-xs">
                                                    {errors[row.id].color}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={row.size}
                                                readOnly
                                                className="w-full p-1 sm:p-1.5 border rounded text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark cursor-not-allowed"
                                                placeholder="Size"
                                            />
                                            {errors[row.id]?.size && (
                                                <span className="text-red-500 text-[10px] sm:text-xs">
                                                    {errors[row.id].size}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={row.costPrice}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        row.id,
                                                        "costPrice",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-1 sm:p-1.5 border rounded text-[10px] sm:text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                                placeholder="Cost Price"
                                            />
                                            {errors[row.id]?.costPrice && (
                                                <span className="text-red-500 text-[10px] sm:text-xs">
                                                    {errors[row.id].costPrice}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={row.salePrice}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        row.id,
                                                        "salePrice",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-1 sm:p-1.5 border rounded text-[10px] sm:text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                                placeholder="Sale Price"
                                            />
                                            {errors[row.id]?.salePrice && (
                                                <span className="text-red-500 text-[10px] sm:text-xs">
                                                    {errors[row.id].salePrice}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={row.qty}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        row.id,
                                                        "qty",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-1 sm:p-1.5 border rounded text-[10px] sm:text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                                placeholder="Quantity"
                                            />
                                            {errors[row.id]?.qty && (
                                                <span className="text-red-500 text-[10px] sm:text-xs">
                                                    {errors[row.id].qty}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={Number(
                                                    row.total
                                                ).toFixed(2)}
                                                readOnly
                                                className="w-full p-1 sm:p-1.5 border rounded text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() =>
                                                    handleDeleteRow(row.id)
                                                }
                                                disabled={
                                                    purchaseRows.length === 1
                                                }
                                                className={`p-1 rounded transition-colors duration-200 ${
                                                    purchaseRows.length === 1
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-red-500 hover:text-red-600"
                                                }`}
                                                aria-label="Delete row"
                                            >
                                                <Icon
                                                    icon="iconamoon:trash-light"
                                                    width="14"
                                                    height="14"
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3">
                        <button
                            onClick={handleAddProductRow}
                            className="inline-flex items-center px-3 py-1.5 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary-darkest text-[10px] sm:text-xs font-medium transition-colors duration-200"
                        >
                            <Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
                            Add Row
                        </button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text dark:text-text-dark">
                                Supplier Name *
                            </label>
                            <div className="flex items-center gap-2">
                                <SelectSearch
                                    options={supplierOptions}
                                    onSelect={handleSupplierSelect}
                                    placeholder="Select a Supplier"
                                    selectedValue={
                                        supplierName
                                            ? supplierOptions.find(
                                                  (opt) =>
                                                      opt.value === supplierName
                                              ) || null
                                            : null
                                    }
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    buttonText="+"
                                    onButtonClick={handleAddSupplierModal}
                                />
                            </div>
                            {errors.supplierName && (
                                <span className="text-red-500 text-[10px] sm:text-xs">
                                    {errors.supplierName}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text dark:text-text-dark">
                                Payment Method *
                            </label>
                            <select
                                value={paymentMethod || ""}
                                onChange={(e) => {
                                    setPaymentMethod(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        paymentMethod: "",
                                    }));
                                }}
                                className="w-full p-1.5 border rounded text-[10px] sm:text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                            >
                                <option value="">Select Payment Method</option>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank?.name ?? "N/A"}
                                    </option>
                                ))}
                            </select>
                            {errors.paymentMethod && (
                                <span className="text-red-500 text-[10px] sm:text-xs">
                                    {errors.paymentMethod}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text dark:text-text-dark">
                                Total
                            </label>
                            <input
                                type="text"
                                value={total.toFixed(2)}
                                readOnly
                                className="w-full p-1.5 border rounded text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text dark:text-text-dark">
                                Paid *
                            </label>
                            <input
                                type="number"
                                value={paid}
                                onChange={(e) =>
                                    handlePaidChange(e.target.value)
                                }
                                className="w-full p-1.5 border rounded text-[10px] sm:text-xs bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                placeholder="Paid"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text dark:text-text-dark">
                                Due
                            </label>
                            <input
                                type="text"
                                value={due.toFixed(2)}
                                readOnly
                                className="w-full p-1.5 border rounded text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-text dark:text-text-dark rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-[10px] sm:text-xs transition-colors duration-200"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePurchase}
                            className="px-3 py-1.5 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary-darkest text-[10px] sm:text-xs transition-colors duration-200"
                        >
                            Purchase
                        </button>
                    </div>
                </div>
            </div>
            <AddProductModal
                isOpen={isAddProductModalOpen}
                onClose={() => setIsAddProductModalOpen(false)}
                onSubmit={handleAddProductSubmit}
                isLoading={isLoading}
            />
            <AddSupplierModal
                isOpen={isAddSupplierModalOpen}
                onClose={() => setIsAddSupplierModalOpen(false)}
                onSubmit={handleAddSupplierSubmit}
                isLoading={isLoading}
            />
        </>
    );
};

export default QuickPurchaseModal;
