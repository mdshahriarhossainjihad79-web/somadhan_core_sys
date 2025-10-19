import { useMemo, useState } from "react";

const useTableFieldHideShow = () => {
    const [showInvoice, setShowInvoice] = useState(1);
    const [showCustomer, setShowCustomer] = useState(1);
    const [showQuantity, setShowQuantity] = useState(1);
    const [showDate, setShowDate] = useState(1);
    const [showTotal, setShowTotal] = useState(0);
    const [showDiscount, setShowDiscount] = useState(0);
    const [showTax, setShowTax] = useState(0);
    const [showInvoiceTotal, setShowInvoiceTotal] = useState(0);
    const [showReceivable, setShowReceivable] = useState(1);
    const [showPaid, setShowPaid] = useState(1);
    const [showDue, setShowDue] = useState(1);
    const [showPurchaseCost, setShowPurchaseCost] = useState(0);
    const [showProfit, setShowProfit] = useState(0);
    const [showReceiveAccount, setShowReceiveAccount] = useState(1);
    const [showSaleBy, setShowSaleBy] = useState(1);
    const [showStatus, setShowStatus] = useState(1);
    const [showSaleStatus, setShowSaleStatus] = useState(0);
    const [showAction, setShowAction] = useState(1);
    const [showCourierStatus, setShowCourierStatus] = useState(0);
    const [showOrderType, setShowOrderType] = useState(0);
    const [showAdditionalCharge, setShowAdditionalCharge] = useState(0);

    // New Warranty-specific states
    const [showProduct, setShowProduct] = useState(1);
    const [showColor, setShowColor] = useState(1);
    const [showSize, setShowSize] = useState(1);
    const [showDuration, setShowDuration] = useState(1);
    const [showStartDate, setShowStartDate] = useState(1);
    const [showEndDate, setShowEndDate] = useState(1);

    // StockTracking-specific states
    const [showBranch, setShowBranch] = useState(0);
    const [showVariation, setShowVariation] = useState(1);
    const [showStockId, setShowStockId] = useState(0);
    const [showBatchNumber, setShowBatchNumber] = useState(1);
    const [showReferenceType, setShowReferenceType] = useState(1);
    const [showReference, setShowReference] = useState(1);
    const [showWarehouse, setShowWarehouse] = useState(0);
    const [showRack, setShowRack] = useState(0);
    const [showB2BPrice, setShowB2BPrice] = useState(1);
    const [showB2CPrice, setShowB2CPrice] = useState(1);
    const [showCostPrice, setShowCostPrice] = useState(1);
    const [showCreatedBy, setShowCreatedBy] = useState(1);
    const [showParty, setShowParty] = useState(1);

    const setterFunctions = {
        showInvoice: setShowInvoice,
        showCustomer: setShowCustomer,
        showQuantity: setShowQuantity,
        showDate: setShowDate,
        showTotal: setShowTotal,
        showDiscount: setShowDiscount,
        showTax: setShowTax,
        showInvoiceTotal: setShowInvoiceTotal,
        showReceivable: setShowReceivable,
        showPaid: setShowPaid,
        showDue: setShowDue,
        showPurchaseCost: setShowPurchaseCost,
        showProfit: setShowProfit,
        showReceiveAccount: setShowReceiveAccount,
        showSaleBy: setShowSaleBy,
        showStatus: setShowStatus,
        showSaleStatus: setShowSaleStatus,
        showAction: setShowAction,
        showCourierStatus: setShowCourierStatus,
        showOrderType: setShowOrderType,
        showAdditionalCharge: setShowAdditionalCharge,

        showProduct: setShowProduct,
        showColor: setShowColor,
        showSize: setShowSize,
        showDuration: setShowDuration,
        showStartDate: setShowStartDate,
        showEndDate: setShowEndDate,

        showBranch: setShowBranch,
        showVariation: setShowVariation,
        showStockId: setShowStockId,
        showBatchNumber: setShowBatchNumber,
        showReferenceType: setShowReferenceType,
        showReference: setShowReference,
        showWarehouse: setShowWarehouse,
        showRack: setShowRack,
        showB2BPrice: setShowB2BPrice,
        showB2CPrice: setShowB2CPrice,
        showCostPrice: setShowCostPrice,
        showCreatedBy: setShowCreatedBy,
        showParty: setShowParty,
    };

    const handleFieldChange = (fieldName, value) => {
        console.log("fieldName", fieldName);
        console.log("value", value);
        const setter = setterFunctions[fieldName];
        if (setter) {
            setter(value);
        } else {
            console.error(`Invalid field name: ${fieldName}`);
        }
    };

    // Fields for StockTracking Manage Table
    const stockTrackingManageTableFields = useMemo(
        () => [
            {
                name: "showBranch",
                label: "Branch",
                type: "checkbox",
                value: showBranch,
            },
            {
                name: "showProduct",
                label: "Product",
                type: "checkbox",
                value: showProduct,
            },
            {
                name: "showVariation",
                label: "Variation",
                type: "checkbox",
                value: showVariation,
            },
            {
                name: "showStockId",
                label: "Stock ID",
                type: "checkbox",
                value: showStockId,
            },
            {
                name: "showBatchNumber",
                label: "Batch Number",
                type: "checkbox",
                value: showBatchNumber,
            },
            {
                name: "showReferenceType",
                label: "Reference Type",
                type: "checkbox",
                value: showReferenceType,
            },
            {
                name: "showReference",
                label: "Reference",
                type: "checkbox",
                value: showReference,
            },
            {
                name: "showQuantity",
                label: "Quantity",
                type: "checkbox",
                value: showQuantity,
            },
            {
                name: "showWarehouse",
                label: "Warehouse",
                type: "checkbox",
                value: showWarehouse,
            },
            {
                name: "showRack",
                label: "Rack",
                type: "checkbox",
                value: showRack,
            },

            {
                name: "showSize",
                label: "Size",
                type: "checkbox",
                value: showSize,
            },
            {
                name: "showColor",
                label: "Color",
                type: "checkbox",
                value: showColor,
            },
            {
                name: "showB2BPrice",
                label: "B2B Price",
                type: "checkbox",
                value: showB2BPrice,
            },
            {
                name: "showB2CPrice",
                label: "B2C Price",
                type: "checkbox",
                value: showB2CPrice,
            },
            {
                name: "showCostPrice",
                label: "Cost Price",
                type: "checkbox",
                value: showCostPrice,
            },
            {
                name: "showParty",
                label: "Party",
                type: "checkbox",
                value: showParty,
            },
            {
                name: "showCreatedBy",
                label: "Created By",
                type: "checkbox",
                value: showCreatedBy,
            },
        ],
        [
            showBranch,
            showProduct,
            showVariation,
            showStockId,
            showBatchNumber,
            showReferenceType,
            showReference,
            showQuantity,
            showWarehouse,
            showRack,
            showSize,
            showColor,
            showB2BPrice,
            showB2CPrice,
            showCostPrice,
            showParty,
            showCreatedBy,
        ]
    );

    // New warrantyManageTableFields
    const warrantyManageTableFields = useMemo(
        () => [
            {
                name: "showInvoice",
                label: "Invoice Number",
                type: "checkbox",
                value: showInvoice,
            },
            {
                name: "showCustomer",
                label: "Customer",
                type: "checkbox",
                value: showCustomer,
            },
            {
                name: "showProduct",
                label: "Product",
                type: "checkbox",
                value: showProduct,
            },
            {
                name: "showColor",
                label: "Color",
                type: "checkbox",
                value: showColor,
            },
            {
                name: "showSize",
                label: "Size",
                type: "checkbox",
                value: showSize,
            },
            {
                name: "showDuration",
                label: "Duration",
                type: "checkbox",
                value: showDuration,
            },
            {
                name: "showStartDate",
                label: "Start Date",
                type: "checkbox",
                value: showStartDate,
            },
            {
                name: "showEndDate",
                label: "End Date",
                type: "checkbox",
                value: showEndDate,
            },
            {
                name: "showStatus",
                label: "Status",
                type: "checkbox",
                value: showStatus,
            },
            {
                name: "showAction",
                label: "Action",
                type: "checkbox",
                value: showAction,
            },
        ],
        [
            showInvoice,
            showCustomer,
            showProduct,
            showColor,
            showSize,
            showDuration,
            showStartDate,
            showEndDate,
            showStatus,
            showAction,
        ]
    );

    // Fields for Sale Manage Table
    const saleManageTableFields = useMemo(
        () => [
            {
                name: "showInvoice",
                label: "Invoice",
                type: "checkbox",
                value: showInvoice,
            },
            {
                name: "showCustomer",
                label: "Customer",
                type: "checkbox",
                value: showCustomer,
            },
            {
                name: "showQuantity",
                label: "Quantity",
                type: "checkbox",
                value: showQuantity,
            },
            {
                name: "showDate",
                label: "Date",
                type: "checkbox",
                value: showDate,
            },

            {
                name: "showTotal",
                label: "Total",
                type: "checkbox",
                value: showTotal,
            },
            {
                name: "showDiscount",
                label: "Discount",
                type: "checkbox",
                value: showDiscount,
            },
            {
                name: "showTax",
                label: "Tax",
                type: "checkbox",
                value: showTax,
            },
            {
                name: "showInvoiceTotal",
                label: "Invoice Total",
                type: "checkbox",
                value: showInvoiceTotal,
            },
            {
                name: "showAdditionalCharge",
                label: "Additional Charge",
                type: "checkbox",
                value: showAdditionalCharge,
            },
            {
                name: "showReceivable",
                label: "Receivable",
                type: "checkbox",
                value: showReceivable,
            },
            {
                name: "showPaid",
                label: "Paid",
                type: "checkbox",
                value: showPaid,
            },
            {
                name: "showDue",
                label: "Due",
                type: "checkbox",
                value: showDue,
            },
            {
                name: "showPurchaseCost",
                label: "Purchase Cost",
                type: "checkbox",
                value: showPurchaseCost,
            },
            {
                name: "showProfit",
                label: "Profit/Loss",
                type: "checkbox",
                value: showProfit,
            },
            {
                name: "showReceiveAccount",
                label: "Receive Account",
                type: "checkbox",
                value: showReceiveAccount,
            },
            {
                name: "showSaleBy",
                label: "Sale By",
                type: "checkbox",
                value: showSaleBy,
            },
            {
                name: "showStatus",
                label: "Status",
                type: "checkbox",
                value: showStatus,
            },
            {
                name: "showSaleStatus",
                label: "Sale Status",
                type: "checkbox",
                value: showSaleStatus,
            },
            {
                name: "showCourierStatus",
                label: "Courier Status",
                type: "checkbox",
                value: showCourierStatus,
            },
            {
                name: "showOrderType",
                label: "Order Type",
                type: "checkbox",
                value: showOrderType,
            },
            {
                name: "showAction",
                label: "Action",
                type: "checkbox",
                value: showAction,
            },
        ],
        [
            showInvoice,
            showCustomer,
            showQuantity,
            showDate,
            showTotal,
            showDiscount,
            showTax,
            showInvoiceTotal,
            showReceivable,
            showPaid,
            showDue,
            showPurchaseCost,
            showProfit,
            showReceiveAccount,
            showSaleBy,
            showStatus,
            showSaleStatus,
            showAction,
            showOrderType,
            showCourierStatus,
            showAdditionalCharge,
        ]
    );

    return {
        showInvoice,
        setShowInvoice,
        showCustomer,
        setShowCustomer,
        showQuantity,
        setShowQuantity,
        showDate,
        setShowDate,
        showTotal,
        setShowTotal,
        showDiscount,
        setShowDiscount,
        showTax,
        setShowTax,
        showInvoiceTotal,
        setShowInvoiceTotal,
        showReceivable,
        setShowReceivable,
        showPaid,
        setShowPaid,
        showDue,
        setShowDue,
        showPurchaseCost,
        setShowPurchaseCost,
        showProfit,
        setShowProfit,
        showReceiveAccount,
        setShowReceiveAccount,
        showSaleBy,
        setShowSaleBy,
        showStatus,
        setShowStatus,
        showSaleStatus,
        setShowSaleStatus,
        showAction,
        setShowAction,
        showOrderType,
        showCourierStatus,
        showAdditionalCharge,

        // Warranty-specific
        showProduct,
        setShowProduct,
        showColor,
        setShowColor,
        showSize,
        setShowSize,
        showDuration,
        setShowDuration,
        showStartDate,
        setShowStartDate,
        showEndDate,
        setShowEndDate,

        // StockTracking-specific
        showBranch,
        setShowBranch,
        showVariation,
        setShowVariation,
        showStockId,
        setShowStockId,
        showBatchNumber,
        setShowBatchNumber,
        showReferenceType,
        setShowReferenceType,
        showReference,
        setShowReference,
        showWarehouse,
        setShowWarehouse,
        showRack,
        setShowRack,
        showB2BPrice,
        setShowB2BPrice,
        showB2CPrice,
        setShowB2CPrice,
        showCostPrice,
        setShowCostPrice,
        showParty,
        setShowParty,
        showCreatedBy,
        setShowCreatedBy,

        handleFieldChange,
        saleManageTableFields,
        warrantyManageTableFields,
        stockTrackingManageTableFields,
    };
};

export default useTableFieldHideShow;
