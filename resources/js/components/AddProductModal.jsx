import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import SelectSearch from "./SelectSearch";
import { usePage } from "@inertiajs/react";
import Loader from "./Loader";

const AddProductModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const { props } = usePage();
    const { colors, sizes, units, categories, subcategories, brands } = props;
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState({
        productName: "",
        variantName: "",
        color: null,
        size: null,
        costPrice: "",
        salePrice: "",
        unit: null,
        category: null,
        subcategory: null,
        brand: null,
        description: "",
        modelNo: "",
        quality: "",
        origin: null,
        image: null,
    });
    const [errors, setErrors] = useState({});

    // Color options
    const colorOptions = useMemo(() => {
        return colors.map((color) => ({
            value: color.id,
            label: `${color?.name ?? "N/A"}`,
        }));
    }, [colors]);

    // Size options
    const sizeOptions = useMemo(() => {
        return sizes.map((size) => ({
            value: size.id,
            label: `${size?.size ?? "N/A"}`,
        }));
    }, [sizes]);

    // Unit options
    const unitOptions = useMemo(() => {
        return units.map((unit) => ({
            value: unit.id,
            label: `${unit?.name ?? "N/A"}`,
        }));
    }, [units]);

    // Set default unit when unitOptions are available
    useEffect(() => {
        if (unitOptions.length > 0 && !formData.unit) {
            setFormData((prev) => ({
                ...prev,
                unit: unitOptions[0], // Set the first unit option as default
            }));
        }
    }, [unitOptions]);

    // Category options
    const categoryOptions = useMemo(() => {
        return categories.map((category) => ({
            value: category.id,
            label: `${category?.name ?? "N/A"}`,
        }));
    }, [categories]);

    // Subcategory options (filtered by selected category)
    const subcategoryOptions = useMemo(() => {
        if (!formData.category) {
            return [];
        }
        return subcategories
            .filter(
                (subcategory) =>
                    subcategory.category_id === formData.category.value
            )
            .map((subcategory) => ({
                value: subcategory.id,
                label: `${subcategory?.name ?? "N/A"}`,
            }));
    }, [subcategories, formData.category]);

    // Brand options
    const brandOptions = useMemo(() => {
        return brands.map((brand) => ({
            value: brand.id,
            label: `${brand?.name ?? "N/A"}`,
        }));
    }, [brands]);

    // Origin options (static list)
    const originOptions = useMemo(() => {
        const origins = [
            "USA",
            "China",
            "Japan",
            "Germany",
            "India",
            "United Kingdom",
            "France",
            "Italy",
            "Canada",
            "South Korea",
            "Australia",
            "Brazil",
            "Russia",
            "Spain",
            "Mexico",
            "Indonesia",
            "Netherlands",
            "Switzerland",
            "Sweden",
            "Thailand",
            "Malaysia",
            "Singapore",
            "Vietnam",
            "Bangladesh",
            "Turkey",
            "South Africa",
            "Argentina",
            "Egypt",
            "Nigeria",
            "United Arab Emirates",
        ];
        return origins.map((origin) => ({
            value: origin,
            label: origin,
        }));
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        if (
            (field === "costPrice" || field === "salePrice") &&
            value &&
            parseFloat(value) < 0
        ) {
            toast.error("Negative values are not allowed.");
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    // Handle SelectSearch changes
    const handleSelectChange = (field, option) => {
        setFormData((prev) => {
            const newFormData = { ...prev, [field]: option };
            // Reset subcategory when category changes
            if (field === "category") {
                newFormData.subcategory = null;
            }
            return newFormData;
        });
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    // Handle image drop
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".png", ".jpg"],
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setFormData((prev) => ({ ...prev, image: acceptedFiles[0] }));
                setErrors((prev) => ({ ...prev, image: undefined }));
            }
        },
    });

    // Handle form submission
    const handleSubmit = () => {
        const newErrors = {};

        // Validate required fields (Basic Information)
        if (!formData.productName) {
            newErrors.productName = "Product name is required.";
        }
        // if (!formData.color) {
        //     newErrors.color = "Color is required.";
        // }
        // if (!formData.size) {
        //     newErrors.size = "Size is required.";
        // }
        if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
            newErrors.costPrice = "Cost price must be greater than 0.";
        }
        if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
            newErrors.salePrice = "Sale price must be greater than 0.";
        }
        // if (!formData.unit) {
        //     newErrors.unit = "Unit is required.";
        // }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Object.values(newErrors).forEach((error) => toast.error(error));
            return;
        }

        // Prepare data for submission
        const productData = {
            name: formData.productName,
            variant_name: formData.variantName,
            color_id: formData.color?.value || null,
            size_id: formData.size?.value || null,
            cost_price: parseFloat(formData.costPrice),
            sale_price: parseFloat(formData.salePrice),
            unit_id: formData.unit?.value || null,
            category_id: formData.category?.value || null,
            subcategory_id: formData.subcategory?.value || null,
            brand_id: formData.brand?.value || null,
            description: formData.description || null,
            model_no: formData.modelNo || null,
            quality: formData.quality || null,
            origin: formData.origin?.value || null,
            image: formData.image || null,
        };

        onSubmit(productData);

        setFormData({
            productName: "",
            variantName: "",
            color: null,
            size: null,
            costPrice: "",
            salePrice: "",
            unit: null,
            category: null,
            subcategory: null,
            brand: null,
            description: "",
            modelNo: "",
            quality: "",
            origin: null,
            image: null,
        });

        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] px-2 sm:px-4">
                {isLoading && <Loader />}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-[98vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-text dark:text-text-dark">
                            Add New Product
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            aria-label="Close modal"
                            disabled={isLoading}
                        >
                            <Icon icon="mdi:close" width="24" height="24" />
                        </button>
                    </div>

                    {/* Product Name */}
                    <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            value={formData.productName}
                            onChange={(e) =>
                                handleInputChange("productName", e.target.value)
                            }
                            className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                            placeholder="Enter product name"
                            disabled={isLoading}
                        />
                        {errors.productName && (
                            <span className="text-red-500 text-xs mt-1">
                                {errors.productName}
                            </span>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                        <button
                            className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                activeTab === "basic"
                                    ? "border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark"
                                    : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark"
                            }`}
                            onClick={() => setActiveTab("basic")}
                            disabled={isLoading}
                        >
                            Basic Information
                        </button>
                        <button
                            className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                activeTab === "additional"
                                    ? "border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark"
                                    : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark"
                            }`}
                            onClick={() => setActiveTab("additional")}
                            disabled={isLoading}
                        >
                            Additional Information
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "basic" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Cost Price *
                                </label>
                                <input
                                    type="number"
                                    value={formData.costPrice}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "costPrice",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                    placeholder="Enter cost price"
                                    disabled={isLoading}
                                />
                                {errors.costPrice && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.costPrice}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Sale Price *
                                </label>
                                <input
                                    type="number"
                                    value={formData.salePrice}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "salePrice",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                    placeholder="Enter sale price"
                                    disabled={isLoading}
                                />
                                {errors.salePrice && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.salePrice}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Variant Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.variantName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "variantName",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                    placeholder="Enter variant name"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Color
                                </label>
                                <SelectSearch
                                    options={colorOptions}
                                    onSelect={(option) =>
                                        handleSelectChange("color", option)
                                    }
                                    placeholder="Select color"
                                    selectedValue={formData.color}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading}
                                />
                                {errors.color && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.color}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Size
                                </label>
                                <SelectSearch
                                    options={sizeOptions}
                                    onSelect={(option) =>
                                        handleSelectChange("size", option)
                                    }
                                    placeholder="Select size"
                                    selectedValue={formData.size}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading}
                                />
                                {errors.size && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.size}
                                    </span>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Unit *
                                </label>
                                <SelectSearch
                                    options={unitOptions}
                                    onSelect={(option) =>
                                        handleSelectChange("unit", option)
                                    }
                                    placeholder="Select unit"
                                    selectedValue={formData.unit}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading}
                                />
                                {errors.unit && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.unit}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "additional" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Category
                                </label>
                                <SelectSearch
                                    options={categoryOptions}
                                    onSelect={(option) =>
                                        handleSelectChange("category", option)
                                    }
                                    placeholder="Select category"
                                    selectedValue={formData.category}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Subcategory
                                </label>
                                <SelectSearch
                                    options={subcategoryOptions}
                                    onSelect={(option) =>
                                        handleSelectChange(
                                            "subcategory",
                                            option
                                        )
                                    }
                                    placeholder="Select subcategory"
                                    selectedValue={formData.subcategory}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading || !formData.category}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Brand
                                </label>
                                <SelectSearch
                                    options={brandOptions}
                                    onSelect={(option) =>
                                        handleSelectChange("brand", option)
                                    }
                                    placeholder="Select brand"
                                    selectedValue={formData.brand}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Model No
                                </label>
                                <input
                                    type="text"
                                    value={formData.modelNo}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "modelNo",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                    placeholder="Enter model number"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Quality
                                </label>
                                <input
                                    type="text"
                                    value={formData.quality}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "quality",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
                                    placeholder="Enter quality"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Origin
                                </label>
                                <SelectSearch
                                    options={originOptions}
                                    onSelect={(option) =>
                                        handleSelectChange("origin", option)
                                    }
                                    placeholder="Select origin"
                                    selectedValue={formData.origin}
                                    wrapperClass="w-full"
                                    zIndex={50}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-2 border rounded text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200 resize-none"
                                    placeholder="Enter description"
                                    rows={4}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-xs sm:text-sm font-medium text-text dark:text-text-dark mb-1">
                                    Image
                                </label>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
                                        isDragActive
                                            ? "border-primary dark:border-primary-dark bg-primary/10"
                                            : "border-gray-300 dark:border-gray-600"
                                    } ${
                                        isLoading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <input
                                        {...getInputProps()}
                                        disabled={isLoading}
                                    />
                                    {formData.image ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <img
                                                src={URL.createObjectURL(
                                                    formData.image
                                                )}
                                                alt="Preview"
                                                className="h-20 w-20 object-cover rounded"
                                            />
                                            <button
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        image: null,
                                                    }))
                                                }
                                                className="text-red-500 hover:text-red-600"
                                                disabled={isLoading}
                                            >
                                                <Icon
                                                    icon="mdi:close"
                                                    width="20"
                                                />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            Drag & drop an image here, or click
                                            to select one
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text dark:text-text-dark rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-xs sm:text-sm transition-colors duration-200"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary-darkest text-xs sm:text-sm transition-colors duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? "Adding..." : "Add Product"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddProductModal;
