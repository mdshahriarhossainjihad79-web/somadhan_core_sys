import { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { debounce } from "lodash";
import axios from "axios";

const usePosSettings = () => {
    const { props } = usePage();
    const { setting } = props;

    // States for TopLeftSection
    const [showBarcode, setShowBarcode] = useState(setting?.barcode === 1);
    const [showInvoice, setShowInvoice] = useState(
        setting?.auto_genarate_invoice === 1
    );
    const [showAffiliate, setShowAffiliate] = useState(
        setting?.affliate_program === 1
    );
    // States for SaleTableSection
    const [elasticSearch, setElasticSearch] = useState(
        setting?.elastic_search === 1
    );
    const [saleHandsOnDiscount, setSaleHandsOnDiscount] = useState(
        setting?.sale_hands_on_discount === 1
    );
    const [saleWithoutStock, setSaleWithoutStock] = useState(
        setting?.sale_without_stock === 1
    );
    const [dragAndDrop, setDragAndDrop] = useState(
        setting?.drag_and_drop === 1
    );
    const [colorView, setColorView] = useState(setting?.color_view === 1);
    const [sizeView, setSizeView] = useState(setting?.size_view === 1);
    const [warranty, setWarranty] = useState(setting?.warranty === 1);
    const [viaSale, setViaSale] = useState(setting?.via_sale === 1);
    const [salePriceType, setSalePriceType] = useState(
        setting?.sale_price_type || "b2c_price"
    );
    const [rateKit, setRateKit] = useState(setting?.rate_kit === 1);
    const [rateKitType, setRateKitType] = useState(
        setting?.rate_kit_type || "normal"
    );
    const [sellingPriceEdit, setSellingPriceEdit] = useState(
        setting?.selling_price_edit === 1
    );
    const [selectedProductAlert, setSelectedProductAlert] = useState(
        setting?.selected_product_alert === 1
    );

    const [showDiscount, setShowDiscount] = useState(setting?.discount === 1);
    const [showTax, setShowTax] = useState(setting?.tax === 1);
    const [saleWithLowPrice, setSaleWithLowPrice] = useState(
        setting?.sale_with_low_price === 1
    );
    const [showMultiplePaymentMethod, setShowMultiplePaymentMethod] = useState(
        setting?.multiple_payment === 1
    );
    const [showCustomerDetails, setShowCustomerDetails] = useState(
        setting?.customer_details_show === 1
    );
    const [defaultCustomer, setDefaultCustomer] = useState(
        setting?.set_default_customer === 1
    );

    // Debounced update function
    const updatePosSetting = useMemo(
        () =>
            debounce(async (field, value, setState) => {
                try {
                    const response = await axios.post("/update-pos-setting", {
                        field,
                        value,
                    });
                    setState(value);
                } catch (error) {
                    console.error(
                        `Error updating ${field}:`,
                        error.response?.data?.error || error.message
                    );
                    setState(
                        field === "sale_price_type" || field === "rate_kit_type"
                            ? setting?.[field] ||
                                  (field === "sale_price_type"
                                      ? "b2c_price"
                                      : "normal")
                            : !value
                    );
                }
            }, 300),
        [setting]
    );

    // Field change handler
    const handleFieldChange = (fieldName, value) => {
        const setters = {
            barcode: setShowBarcode,
            auto_genarate_invoice: setShowInvoice,
            affliate_program: setShowAffiliate,
            elastic_search: setElasticSearch,
            sale_hands_on_discount: setSaleHandsOnDiscount,
            sale_without_stock: setSaleWithoutStock,
            drag_and_drop: setDragAndDrop,
            color_view: setColorView,
            size_view: setSizeView,
            warranty: setWarranty,
            via_sale: setViaSale,
            sale_price_type: setSalePriceType,
            rate_kit: setRateKit,
            rate_kit_type: setRateKitType,
            selling_price_edit: setSellingPriceEdit,
            selected_product_alert: setSelectedProductAlert,
            discount: setShowDiscount,
            tax: setShowTax,
            sale_with_low_price: setSaleWithLowPrice,
            multiple_payment: setShowMultiplePaymentMethod,
            customer_details_show: setShowCustomerDetails,
            set_default_customer: setDefaultCustomer,
        };
        const setter = setters[fieldName];
        if (setter) {
            setter(value);
            updatePosSetting(fieldName, value, setter);
        }
    };

    // Fields for TopLeftSection
    const topLeftMenuFields = useMemo(
        () => [
            {
                name: "barcode",
                label: "Barcode",
                type: "checkbox",
                value: showBarcode,
            },
            {
                name: "auto_genarate_invoice",
                label: "Invoice",
                type: "checkbox",
                value: showInvoice,
            },
            {
                name: "affliate_program",
                label: "Affiliate",
                type: "checkbox",
                value: showAffiliate,
            },
        ],
        [showBarcode, showInvoice, showAffiliate]
    );

    // Fields for Customer Section
    const customerSectionFields = useMemo(
        () => [
            {
                name: "customer_details_show",
                label: "Show Details",
                type: "checkbox",
                value: showCustomerDetails,
            },
            {
                name: "set_default_customer",
                label: "Set Default",
                type: "checkbox",
                value: defaultCustomer,
            },
        ],
        [defaultCustomer, showCustomerDetails]
    );

    // Fields for SaleTableSection
    const saleTableMenuFields = useMemo(
        () => [
            {
                name: "elastic_search",
                label: "Deep Search",
                type: "checkbox",
                value: elasticSearch,
            },
            {
                name: "selling_price_edit",
                label: "Price Edit",
                type: "checkbox",
                value: sellingPriceEdit,
            },
            {
                name: "sale_hands_on_discount",
                label: "Discount",
                type: "checkbox",
                value: saleHandsOnDiscount,
            },
            {
                name: "sale_without_stock",
                label: "Sale Without Stock",
                type: "checkbox",
                value: saleWithoutStock,
            },
            {
                name: "drag_and_drop",
                label: "Drag and Drop",
                type: "checkbox",
                value: dragAndDrop,
            },
            {
                name: "color_view",
                label: "Color View",
                type: "checkbox",
                value: colorView,
            },
            {
                name: "size_view",
                label: "Size View",
                type: "checkbox",
                value: sizeView,
            },
            {
                name: "warranty",
                label: "Warranty",
                type: "checkbox",
                value: warranty,
            },
            {
                name: "sale_with_low_price",
                label: "Sale With Low Price",
                type: "checkbox",
                value: saleWithLowPrice,
            },
            {
                name: "via_sale",
                label: "Quick Purchase",
                type: "checkbox",
                value: viaSale,
            },
            {
                name: "rate_kit",
                label: "Rate Kit",
                type: "checkbox",
                value: rateKit,
            },
            ...(rateKit
                ? [
                      {
                          name: "rate_kit_type",
                          label: "Rate Kit Type",
                          type: "radio",
                          value: rateKitType,
                          options: [
                              { value: "normal", label: "Normal" },
                              { value: "party", label: "Party" },
                          ],
                      },
                  ]
                : []),
            {
                name: "sale_price_type",
                label: "Sale Price Type",
                type: "radio",
                value: salePriceType,
                options: [
                    { value: "b2c_price", label: "B2C Price" },
                    { value: "b2b_price", label: "B2B Price" },
                ],
            },
        ],
        [
            elasticSearch,
            sellingPriceEdit,
            saleHandsOnDiscount,
            saleWithoutStock,
            dragAndDrop,
            colorView,
            sizeView,
            warranty,
            viaSale,
            salePriceType,
            rateKit,
            rateKitType,
            saleWithLowPrice,
        ]
    );

    // Fields for TopLeftSection
    const billingMenuFields = useMemo(
        () => [
            {
                name: "discount",
                label: "Discount",
                type: "checkbox",
                value: showDiscount,
            },
            {
                name: "tax",
                label: "Tax",
                type: "checkbox",
                value: showTax,
            },
            {
                name: "multiple_payment",
                label: "Multiple Payment",
                type: "checkbox",
                value: showMultiplePaymentMethod,
            },
        ],
        [showDiscount, showTax, showMultiplePaymentMethod]
    );

    return {
        topLeftMenuFields,
        saleTableMenuFields,
        handleFieldChange,
        customerSectionFields,
        billingMenuFields,
        settings: {
            showBarcode,
            sellingPriceEdit,
            showInvoice,
            showAffiliate,
            elasticSearch,
            saleHandsOnDiscount,
            saleWithoutStock,
            dragAndDrop,
            colorView,
            sizeView,
            warranty,
            viaSale,
            salePriceType,
            rateKit,
            rateKitType,
            selectedProductAlert,
            showDiscount,
            showTax,
            saleWithLowPrice,
            showMultiplePaymentMethod,
            showCustomerDetails,
            defaultCustomer,
        },
    };
};

export default usePosSettings;
