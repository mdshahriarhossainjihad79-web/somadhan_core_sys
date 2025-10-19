import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ErrorPopover from "./ErrorPopover";
import usePosSettings from "../hook/usePosSettings";
import WarehouseDropdown from "./WarehouseDropdown";

const QuantityFieldWithWarehouse = ({
    rows,
    row,
    handleInputChange,
    inputRefs,
    handleKeyDown,
    selectedCustomer,
    rowIndex,
    saleWithoutStock,
    selectedWarehouses,
    setSelectedWarehouses,
    warehouse_manage,
    errors,
    qtyErrorPopover,
    handleAddRow,
    setRows,
}) => {
    const [stockData, setStockData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const popoverRef = useRef(null);
    const { settings } = usePosSettings();
    const { saleHandsOnDiscount, warranty } = settings;
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

    const handleFieldFocusChange = (fromWarehouse = false) => {
        const fields = ["product"];
        if (settings.sellingPriceEdit) fields.push("price");
        fields.push("qty");
        if (saleHandsOnDiscount) {
            fields.push("discountPercentage");
            fields.push("discountAmount");
        }
        if (warranty) fields.push("warranty");

        const nextField = fields[fields.indexOf("qty") + 1];
        if (inputRefs.current[rowIndex]?.[nextField]) {
            setTimeout(() => {
                inputRefs.current[rowIndex][nextField].focus();
            }, 100);
        } else if (!fromWarehouse) {
            handleAddRow();
        }
    };

    useEffect(() => {
        if (warehouse_manage && row.variantId) {
            const fetchStockData = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get("/stock-data", {
                        params: { variant_id: row.variantId },
                    });
                    if (response.data.status === 200) {
                        setStockData(response?.data?.data);

                        if (!selectedWarehouses[row.id]) {
                            const currentStock = response.data.data.find(
                                (stock) => stock.is_Current_stock === 1
                            );
                            if (currentStock) {
                                setSelectedWarehouses((prev) => ({
                                    ...prev,
                                    [row.id]: {
                                        value: response.data.data.indexOf(
                                            currentStock
                                        ),
                                        label: `${
                                            currentStock.warehouse
                                                ?.warehouse_name ?? "N/A"
                                        } - ${
                                            currentStock.racks?.rack_name ??
                                            "N/A"
                                        }`,
                                        stock_quantity:
                                            currentStock?.stock_quantity ?? 0,
                                    },
                                }));
                                setRows((prevRows) =>
                                    prevRows.map((r) =>
                                        r.id === row.id
                                            ? {
                                                  ...r,
                                                  stockWarehouseId:
                                                      currentStock.id,
                                              }
                                            : r
                                    )
                                );
                            } else {
                                setSelectedWarehouses((prev) => ({
                                    ...prev,
                                    [row.id]: null,
                                }));
                                setRows((prevRows) =>
                                    prevRows.map((r) =>
                                        r.id === row.id
                                            ? {
                                                  ...r,
                                                  stockWarehouseId: null,
                                              }
                                            : r
                                    )
                                );
                            }
                        }
                    } else {
                        toast.error("Failed to load Stock Data");
                    }
                } catch (error) {
                    console.error("Error fetching stock data:", error);
                    toast.error(
                        "Something went wrong! Please contact with Support"
                    );
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStockData();
        }
    }, [
        row.variantId,
        warehouse_manage,
        row.id,
        setSelectedWarehouses,
        setRows,
        // selectedWarehouses,
    ]);

    const handleStockSelect = (option) => {
        if (!option) return;
        setSelectedWarehouses((prev) => ({
            ...prev,
            [row.id]: {
                value: option.value,
                label: `${option.stock.warehouse?.warehouse_name} - ${
                    option.stock.racks?.rack_name ?? "N/A"
                }`,
                stock_quantity: option?.stock?.stock_quantity,
            },
        }));
        setRows((prevRows) =>
            prevRows.map((r) =>
                r.id === row.id
                    ? {
                          ...r,
                          stockWarehouseId: option.stock.id,
                      }
                    : r
            )
        );
        setIsWarehouseOpen(false);
        handleFieldFocusChange(true);
    };

    const handleKeyDownLocal = (e, rowIndex, field) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleFieldFocusChange(false);
        } else {
            handleKeyDown(e, rowIndex, field);
        }
    };

    const stockOptions = stockData.map((stock, index) => ({
        value: index,
        label: stock?.warehouse?.warehouse_name ?? "N/A",
        quantity: stock?.stock_quantity ?? 0,
        stock,
    }));

    return (
        <div className="relative ">
            {warehouse_manage ? (
                <div className="flex items-center">
                    <div className="w-1/3">
                        <input
                            type="number"
                            value={row.qty === 0 ? "" : row.qty}
                            onChange={(e) =>
                                handleInputChange(
                                    row.id,
                                    "qty",
                                    e.target.value,
                                    selectedWarehouses[row.id]
                                        ?.stock_quantity ?? null
                                )
                            }
                            className={` p-0.5 border rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark hide-number-spinner ${
                                errors[row.id]?.qty
                                    ? "border-red-500"
                                    : "border-none"
                            }`}
                            placeholder="Enter Qty"
                            min="0"
                            max={
                                saleWithoutStock
                                    ? undefined
                                    : selectedWarehouses[row.id]?.stock_quantity
                            }
                            aria-label="Quantity"
                            ref={(el) =>
                                inputRefs.current[rowIndex] &&
                                (inputRefs.current[rowIndex].qty = el)
                            }
                            onKeyDown={(e) =>
                                handleKeyDownLocal(e, rowIndex, "qty")
                            }
                        />
                        {qtyErrorPopover.isOpen && (
                            <ErrorPopover
                                isOpen={qtyErrorPopover.isOpen}
                                message={errors[row.id]?.qty}
                                position={qtyErrorPopover.position}
                            />
                        )}
                    </div>
                    <WarehouseDropdown
                        options={stockOptions}
                        onSelect={handleStockSelect}
                        placeholder={
                            isLoading ? "Loading..." : "Select Warehouse..."
                        }
                        selectedValue={selectedWarehouses[row.id]}
                        wrapperClass="text-xs border-l w-full"
                        disabled={isLoading || !row.variantId}
                        isOpen={isWarehouseOpen}
                        setIsOpen={setIsWarehouseOpen}
                    />
                </div>
            ) : (
                <>
                    <input
                        type="number"
                        value={row.qty === 0 ? "" : row.qty}
                        onChange={(e) =>
                            handleInputChange(
                                row.id,
                                "qty",
                                e.target.value,
                                row.maxQty
                            )
                        }
                        className={`w-full p-0.5 border rounded-sm text-xs sm:text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark hide-number-spinner ${
                            errors[row.id]?.qty
                                ? "border-red-500"
                                : "border-none"
                        }`}
                        placeholder="Enter Qty"
                        min="0"
                        max={saleWithoutStock ? undefined : row.maxQty}
                        aria-label="Quantity"
                        ref={(el) =>
                            inputRefs.current[rowIndex] &&
                            (inputRefs.current[rowIndex].qty = el)
                        }
                        onKeyDown={(e) =>
                            handleKeyDownLocal(e, rowIndex, "qty")
                        }
                    />
                    {qtyErrorPopover.isOpen && (
                        <ErrorPopover
                            isOpen={qtyErrorPopover.isOpen}
                            message={errors[row.id]?.qty}
                            position={qtyErrorPopover.position}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default QuantityFieldWithWarehouse;
