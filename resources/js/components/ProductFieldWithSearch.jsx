import SelectSearch from "./SelectSearch";
import calculateArraySum from "../utils/calculateArraySum";
import ErrorPopover from "./ErrorPopover";
import cn from "../utils/cn";
import usePosSettings from "../hook/usePosSettings";

const ProductFieldWithSearch = ({
    row,
    rowIndex,
    user,
    selectedProductAlert,
    productOptions,
    getFilteredOptions,
    handleProductSelect,
    inputRefs,
    handleKeyDown,
    elasticSearch,
    errors,
    productErrorPopover,
    salePriceType,
    forceOpen = false,
}) => {
    const { settings } = usePosSettings();
    const { sellingPriceEdit, saleHandsOnDiscount, warranty } = settings;

    const handleFieldFocusChange = () => {
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
            setTimeout(() => {
                inputRefs.current[rowIndex][nextField].focus();
            }, 100);
        }
    };

    const tableHeaders = [
        "Product",
        "Stock",
        "Size",
        "Color",
        ...(user?.role === "admin" || user?.role === "superadmin"
            ? ["Cost Price"]
            : []),
        ...(user?.role === "admin" || user?.role === "superadmin"
            ? ["B2B Price", "B2C Price"]
            : [salePriceType === "b2b_price" ? "B2B Price" : "B2C Price"]),
    ];

    // Custom render function for table rows with colorful styling
    const customRenderOption = (option, props) => {
        if (!option) return null;
        const { product } = option;

        return (
            <>
                <td className="px-2 py-1 text-xs text-blue-600 ">
                    {product?.product?.name ?? "N/A"}
                </td>
                <td className="px-2 py-1 text-xs text-green-600 ">
                    {calculateArraySum(product?.stocks, "stock_quantity")}
                </td>
                <td className="px-2 py-1 text-xs text-purple-600 ">
                    {product?.variation_size?.size ?? "N/A"}
                </td>
                <td className="px-2 py-1 text-xs text-red-600 ">
                    {product?.color_name?.name ?? "N/A"}
                </td>
                {user?.role === "admin" || user?.role === "superadmin" ? (
                    <td className="px-2 py-1 text-xs text-indigo-600 ">
                        {product?.cost_price ?? 0}
                    </td>
                ) : null}
                {(user?.role === "admin" ||
                    user?.role === "superadmin" ||
                    salePriceType === "b2b_price") && (
                    <td className="px-2 py-1 text-xs text-teal-600 ">
                        {product?.b2b_price ?? 0}
                    </td>
                )}
                {(user?.role === "admin" ||
                    user?.role === "superadmin" ||
                    salePriceType === "b2c_price") && (
                    <td className="px-2 py-1 text-xs text-pink-600 ">
                        {product?.b2c_price ?? 0}
                    </td>
                )}
            </>
        );
    };

    return (
        <div className={cn(`relative`)}>
            <SelectSearch
                options={
                    selectedProductAlert
                        ? productOptions
                        : getFilteredOptions(row.id)
                }
                onSelect={(option) => handleProductSelect(row.id, option)}
                placeholder="Select a product..."
                selectedValue={
                    row.product
                        ? {
                              value: row.id,
                              label: `${row?.product}`,
                          }
                        : null
                }
                wrapperClass="text-xs border-l"
                inputWrapperClass={"border-none"}
                inputClass={`w-full text-xs sm:text-sm bg-surface-light dark:bg-surface-dark border-none ${
                    rowIndex === 0 && errors.products ? "border-red-500" : ""
                }`}
                renderOption={customRenderOption}
                renderAsTable={elasticSearch ? true : false}
                tableHeaders={tableHeaders}
                zIndex={40}
                inputRef={(el) =>
                    inputRefs.current[rowIndex] &&
                    (inputRefs.current[rowIndex].product = el)
                }
                onKeyDown={(e) => handleKeyDown(e, rowIndex, "product")}
                searchSuggestionWrapperClass="min-w-[300px] md:min-w-[400px] lg:w-full"
                isZoomInHighlightedIndex={true}
                onFieldFocusChange={handleFieldFocusChange}
                forceOpen={forceOpen}
                allowCustomInput={true}
                keepOpenAfterSelect={true}
            />
            {rowIndex === 0 && errors.products && (
                <ErrorPopover
                    isOpen={productErrorPopover.isOpen}
                    message={errors.products}
                    position={productErrorPopover.position}
                />
            )}
        </div>
    );
};

export default ProductFieldWithSearch;
