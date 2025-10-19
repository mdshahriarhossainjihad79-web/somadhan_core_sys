import BillingSection from "../../section/sale/BillingSection";
import SaleSettingSection from "../../section/sale/SaleSettingSection";
import SaleTableSection from "../../section/sale/SaleTableSection";
import TopLeftSection from "../../section/sale/TopLeftSection";
import TopRightCustomerSection from "../../section/sale/TopRightCustomerSection";
import toast, { Toaster } from "react-hot-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import useInput from "../../hook/useInput";
import usePosSettings from "../../hook/usePosSettings";
import cn from "../../utils/cn";
import axios from "axios";
import Loader from "../../components/Loader";
import useSaleValidation from "../../hook/useSaleValidation";
import useSubmitSale from "../../hook/useSubmitSale";
import MainLayouts from "../../layouts/MainLayouts";
import calculateArraySum from "../../utils/calculateArraySum";

const Sale = () => {
    const { props } = usePage();
    const { products, setting, duplicateSale, duplicateSaleItems } = props;
    // console.log(promotionDetails);
    const [rows, setRows] = useState([
        {
            id: Date.now(),
            sl: 1,
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
        },
    ]);

    useEffect(() => {
        if (
            duplicateSale &&
            duplicateSaleItems &&
            duplicateSaleItems.length > 0
        ) {
            // Map saleItems to rows format
            const duplicatedRows = duplicateSaleItems.map((item, index) => ({
                id: Date.now() + index,
                sl: index + 1,
                product: item.variant?.product?.name || null,
                variantId: item.variant_id || null,
                color: item.variant?.color_name?.name || null,
                size: item.variant?.variation_size?.size || null,
                price: parseInt(item.rate) || "",
                qty: item.qty || 1,
                maxStock:
                    item.variant?.stocks?.reduce(
                        (sum, stock) => sum + (stock.stock_quantity || 0),
                        0
                    ) || 0,
                discountPercentage: item.discount_percentage || "",
                discountAmount: item.discount || "",
                warranty: item.warranty || "",
                warranty_type: item.warranty_type || "month",
                total: parseInt(item.sub_total) || 0,
                stockWarehouseId: null,
            }));

            setRows(duplicatedRows);

            // Select the customer from duplicateSale
            if (duplicateSale.customer) {
                setSelectedCustomer(duplicateSale.customer);
            }

            // Fetch new invoice number for duplicate
            fetchInvoiceNumber();
        }
    }, [duplicateSale, duplicateSaleItems]);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [invoice, setInvoice] = useState("");
    const [selectedAffiliate, setSelectedAffiliate] = useState([]);
    const [productTotal, setProductTotal] = useState(0);
    const [discountType, setDiscountType] = useState("%");
    const [tax, setTax] = useState("");
    const [discount, handleDiscountChange, setDiscount] = useInput("", {
        min: 0,
        max: discountType === "%" ? 100 : productTotal,
        type: "number",
    });
    const [invoiceTotal, setInvoiceTotal] = useState(0);
    const [additionalChargesTotal, setAdditionalChargesTotal] = useState(0);
    // Calculate additional charges total
    const [subTotal, setSubTotal] = useState(0);
    const [advanceDue, setAdvanceDue] = useState(0);
    const [isRoundTotal, setIsRoundTotal] = useState(false);
    const [payAmount, handlePayAmountChange, setPayAmount] = useInput("", {
        min: 0,
        type: "number",
    });
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [additionalChargeItems, setAdditionalChargeItems] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);

    // const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

    const [note, setNote] = useState("");
    const [isNewRowAdded, setIsNewRowAdded] = useState(false);
    const [multiplePaymentModal, setMultiplePaymentModal] = useState(false);

    const [paymentRows, setPaymentRows] = useState([
        { id: Date.now(), bankId: "", amount: "" },
    ]);

    const inputRefs = useRef([]);

    const { errors, setErrors, validateSale } = useSaleValidation(
        rows,
        selectedCustomer,
        invoice,
        paymentMethod,
        payAmount
    );

    const submitSale = useSubmitSale();

    // const [handleAddRow, setHandleAddRow] = useState(() => () => {});

    // Fetch invoice number from server
    const fetchInvoiceNumber = async () => {
        setIsLoadingInvoice(true);
        try {
            const response = await axios.get("/generate-sale-invoice");
            setInvoice(response.data.invoice);
            // toast.success("New invoice number generated.");
        } catch (error) {
            console.error(
                "Error fetching invoice number:",
                error.response?.data?.error || error.message
            );
            setInvoice("000001"); // Fallback
            toast.error("Failed to generate invoice number. Using fallback.");
        } finally {
            setIsLoadingInvoice(false);
        }
    };

    // Fetch invoice number on mount
    useEffect(() => {
        fetchInvoiceNumber();
    }, []);

    // Fetch invoice number on mount
    useEffect(() => {
        fetchInvoiceNumber();
    }, []);

    const discountValue = useMemo(() => {
        return discountType === "%"
            ? ((parseFloat(discount) || 0) * productTotal) / 100
            : parseFloat(discount) || 0;
    }, [discount, discountType, productTotal]);

    useEffect(() => {
        const calculatedTotalQuantity = rows.reduce((acc, row) => {
            return acc + (parseInt(row.qty) || 0);
        }, 0);
        setTotalQuantity(calculatedTotalQuantity);
    }, [rows]);

    const resetForm = () => {
        setRows([
            {
                id: Date.now(),
                sl: 1,
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
            },
        ]);
        setSelectedCustomer(null);
        setSelectedDate(new Date());
        setInvoice("");
        setSelectedAffiliate([]);
        setProductTotal(0);
        setDiscountType("%");
        setTax("");
        setDiscount("");
        setInvoiceTotal(0);
        setAdditionalChargesTotal(0);
        setSubTotal(0);
        setAdvanceDue(0);
        setIsRoundTotal(false);
        setPayAmount("");
        setPaymentMethod(null);
        setAdditionalChargeItems([]);
        setTotalQuantity(0);
        setErrors({});
        fetchInvoiceNumber();
        setNote("");
        setIsNewRowAdded(false);
        setPaymentRows([{ id: Date.now(), bankId: "", amount: "" }]);
    };

    const handleAddViaSale = useCallback(
        (purchasedProducts) => {
            if (!purchasedProducts || purchasedProducts.length === 0) {
                toast.warn("No product has been added");
                return;
            }

            setRows((prevRows) => {
                const existingVariantIds = prevRows.map((row) => row.variantId);
                const newRows = purchasedProducts
                    .filter(
                        (product) =>
                            !existingVariantIds.includes(product.variantId)
                    )
                    .map((product, index) => ({
                        id: Date.now() + index,
                        sl: prevRows.length + index + 1,
                        product: product.product,
                        variantId: product.variantId,
                        color: product.color || "",
                        size: product.size || "",
                        price: product.salePrice || 0,
                        qty: product.qty || 1,
                        maxStock: product.qty || 1,
                        discountPercentage: "",
                        discountAmount: "",
                        warranty: "",
                        warranty_type: "month",
                        total: product.salePrice * product.qty || 0,
                        stockWarehouseId: null,
                    }));

                if (newRows.length === 0) {
                    toast.warn(
                        "All products have already been added to the sale table."
                    );
                    return prevRows;
                }

                const updatedRows = [...prevRows, ...newRows];

                // inputRefs
                inputRefs.current = updatedRows.map(() => ({
                    product: null,
                    price: null,
                    qty: null,
                    discountPercentage: null,
                    discountAmount: null,
                    warranty: null,
                }));

                setTimeout(() => {
                    const newRowIndex = prevRows.length;
                    if (inputRefs.current[newRowIndex]?.product) {
                        inputRefs.current[newRowIndex].product.focus();
                        inputRefs.current[newRowIndex].product.dispatchEvent(
                            new KeyboardEvent("keydown", { key: "Enter" })
                        );
                    }
                }, 200);

                setIsNewRowAdded(true);
                return updatedRows;
            });

            // products
            router.reload({
                only: ["products"],
            });
        },
        [setRows, setIsNewRowAdded]
    );

    const handleAddRowRef = useCallback(
        (productOption) => {
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
                let updatedRows;
                if (productOption && productOption.id) {
                    // Update existing row (for dropdown selection)
                    updatedRows = prevRows.map((row) =>
                        row.id === productOption.id
                            ? {
                                  ...row,
                                  product:
                                      productOption?.product?.product?.name ||
                                      null,
                                  variantId: productOption?.value || null,
                                  price:
                                      productOption?.product?.b2c_price ===
                                      "b2c_price"
                                          ? productOption?.product?.b2b_price
                                          : productOption?.product?.b2c_price,
                                  color:
                                      productOption?.product?.color_name
                                          ?.name || "",
                                  size:
                                      productOption?.product?.variation_size
                                          ?.size || "",
                                  maxStock: calculateArraySum(
                                      // Assuming this function exists elsewhere
                                      productOption?.product?.stocks,
                                      "stock_quantity"
                                  ),
                                  total:
                                      (parseFloat(
                                          productOption?.product?.b2c_price ===
                                              "b2c_price"
                                              ? productOption?.product
                                                    ?.b2b_price
                                              : productOption?.product
                                                    ?.b2c_price
                                      ) || 0) *
                                          1 -
                                      0,
                                  stockWarehouseId: null,
                              }
                            : row
                    );
                } else if (productOption) {
                    // Add new row with product data (for barcode scan)
                    const newRowWithProduct = {
                        ...newRow,
                        product: productOption?.product?.product?.name || null,
                        variantId: productOption?.value || null,
                        price:
                            productOption?.product?.b2c_price === "b2c_price"
                                ? productOption?.product?.b2b_price
                                : productOption?.product?.b2c_price,
                        color: productOption?.product?.color_name?.name || "",
                        size:
                            productOption?.product?.variation_size?.size || "",
                        maxStock: calculateArraySum(
                            productOption?.product?.stocks,
                            "stock_quantity"
                        ),
                        total:
                            (parseFloat(
                                productOption?.product?.b2c_price ===
                                    "b2c_price"
                                    ? productOption?.product?.b2b_price
                                    : productOption?.product?.b2c_price
                            ) || 0) * 1,
                        stockWarehouseId: null,
                    };
                    updatedRows = [...prevRows, newRowWithProduct];
                } else {
                    // Add empty new row
                    updatedRows = [...prevRows, newRow];
                }

                // Update inputRefs synchronously
                inputRefs.current = updatedRows.map(() => ({
                    product: null,
                    price: null,
                    qty: null,
                    discountPercentage: null,
                    discountAmount: null,
                    warranty: null,
                }));

                setIsNewRowAdded(true);

                // Focus on the new row's product field and open dropdown
                setTimeout(() => {
                    const newRowIndex = updatedRows.length - 1;
                    if (inputRefs.current[newRowIndex]?.product) {
                        inputRefs.current[newRowIndex].product.focus();
                        inputRefs.current[newRowIndex].product.dispatchEvent(
                            new KeyboardEvent("keydown", { key: "Enter" })
                        );
                    }
                }, 200);

                return updatedRows;
            });
        },
        [rows, setRows]
    );

    // selectedAffiliate
    const affiliateIds = selectedAffiliate
        ? selectedAffiliate.map((affiliate) => affiliate.value)
        : [];
    // console.log("additionalChargeItems", additionalChargeItems);
    const invoiceData = {
        sale_date: selectedDate,
        invoice_number: invoice,
        affiliator_id: affiliateIds,
        customer_id: selectedCustomer?.id,
        product_total: productTotal,
        sale_discount_type: discountType,
        actual_discount: discountValue,
        discount: discount,
        tax,
        invoice_total: invoiceTotal,
        additionalChargesTotal,
        grand_total: subTotal,
        isRoundTotal,
        paid: payAmount,
        due: advanceDue,
        payment_method: paymentMethod,
        additionalChargeItems,
        variants: rows.filter((row) => row.variantId !== null),
        quantity: totalQuantity,
        note: note,
        multiplePaymentMethods: paymentRows,
    };
    // console.log("invoiceData", invoiceData);

    // save complete invoice
    const handlePayClick = async () => {
        setIsLoading(true);
        const isValid = await validateSale(true); // Payment method required
        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            // const data = await axios.post("/sale-store", invoiceData, {
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            // });

            const data = await submitSale(
                "/sale-store",
                invoiceData,
                "Sale Completed Successfully"
            );

            console.log(data);
            // const sale_id = data?.data?.saleId;
            const sale_id = data?.saleId;
            // console.log(sale_id);
            const { make_invoice_print, invoice_type } = setting;

            if (make_invoice_print === 1) {
                const printRoute =
                    invoice_type === "a4" || invoice_type === "a5"
                        ? `/sale-invoice/print/${sale_id}`
                        : `/sale-invoice/pos-print/${sale_id}`;
                router.visit(printRoute);
            } else {
                resetForm();
                // router.visit("/sale-page");
            }
        } catch (error) {
            // Errors are already handled in the hook
        } finally {
            setIsLoading(false);
        }
    };

    // save Draft Invoice
    const handleDraftClick = async () => {
        setIsLoading(true);
        const isValid = await validateSale(false);
        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await submitSale(
                "/draft/sale-store",
                invoiceData,
                "Sale Invoice Draft Successfully"
            );

            resetForm();
        } catch (error) {
            // Errors are already handled in the hook
        } finally {
            setIsLoading(false);
        }
    };

    // handle Multiple Payment
    const handleMultiplePayment = async () => {
        const isValid = await validateSale(false); // Payment method required
        if (!isValid) {
            return;
        }

        setMultiplePaymentModal(true);
    };

    // invoice with multiple payment
    const invoiceWithMultiplePayment = async () => {
        setMultiplePaymentModal(false);
        setIsLoading(true);

        try {
            const data = await submitSale(
                "/sale-store/multiple-payment",
                invoiceData,
                "Sale Completed Successfully"
            );

            console.log("response data", data);

            const saleId = data.saleId;
            const { make_invoice_print, invoice_type } = setting;
            if (make_invoice_print === 1) {
                const printRoute =
                    invoice_type === "a4" || invoice_type === "a5"
                        ? `/sale-invoice/print/${saleId}`
                        : `/sale-invoice/pos-print/${saleId}`;
                router.visit(printRoute);
            } else {
                resetForm();
                // router.visit("/sale-page");
            }
        } catch (error) {
            setMultiplePaymentModal(false);
            // Errors are already handled in the hook
        } finally {
            setIsLoading(false);
        }
    };

    const { topLeftMenuFields, handleFieldChange, settings } = usePosSettings();
    const { showBarcode, showInvoice, showAffiliate } = settings;
    // Calculate the number of visible fields
    const visibleFields = [
        showBarcode,
        true, // Date is always visible
        showInvoice,
        showAffiliate,
    ].filter(Boolean).length;

    return (
        <MainLayouts
            showHeader={false}
            showFooter={false}
            defaultSidebarState={false}
        >
            <div className="min-h-screen bg-background-light dark:bg-background-dark py-2 transition-colors duration-300 relative">
                <Head title="POS Page" />
                <Toaster position="top-center" reverseOrder={false} />
                {isLoading && <Loader />}
                {/* <SaleSettingSection /> */}
                {/* <div className="flex items-center justify-between mb-3">
                    <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary rounded-md transition-colors duration-200 shadow-sm"
                    >
                        Back to Dashboard
                    </a>
                </div> */}
                <h2 className="text-2xl font-semibold text-text dark:text-text-dark mb-4 rounded-sm border-l-4 border-primary pl-4">
                    Sale Page
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                    <div
                        className={cn(
                            `lg:col-span-${visibleFields > 2 ? 4 : 3}`
                        )}
                    >
                        {/* <div className={cn(`lg:col-span-3`)}> */}
                        <TopLeftSection
                            rows={rows}
                            products={products}
                            addRow={handleAddRowRef}
                            invoice={invoice}
                            setInvoice={setInvoice}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedAffiliate={selectedAffiliate}
                            setSelectedAffiliate={setSelectedAffiliate}
                            topLeftMenuFields={topLeftMenuFields}
                            handleFieldChange={handleFieldChange}
                            showBarcode={showBarcode}
                            showInvoice={showInvoice}
                            showAffiliate={showAffiliate}
                            visibleFields={visibleFields}
                            isLoadingInvoice={isLoadingInvoice}
                        />
                    </div>
                    <div
                        className={cn(
                            `lg:col-span-${visibleFields > 2 ? 2 : 3}`
                        )}
                    >
                        {/* <div className={cn(`lg:col-span-3`)}> */}
                        <TopRightCustomerSection
                            selectedCustomer={selectedCustomer}
                            setSelectedCustomer={setSelectedCustomer}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    </div>
                </div>
                <div className="mt-4 mb-52 sm:mb-40">
                    <SaleTableSection
                        rows={rows}
                        setRows={setRows}
                        selectedCustomer={selectedCustomer}
                        errors={errors}
                        setErrors={setErrors}
                        isNewRowAdded={isNewRowAdded}
                        setIsNewRowAdded={setIsNewRowAdded}
                        setIsLoading={setIsLoading}
                        isLoading={isLoading}
                        handleAddViaSale={handleAddViaSale}
                        inputRefs={inputRefs}
                    />
                </div>

                <div className="mt-20">
                    <BillingSection
                        rows={rows}
                        handlePayClick={handlePayClick}
                        handleDraftClick={handleDraftClick}
                        productTotal={productTotal}
                        setProductTotal={setProductTotal}
                        discountType={discountType}
                        setDiscountType={setDiscountType}
                        tax={tax}
                        setTax={setTax}
                        discount={discount}
                        setDiscount={setDiscount}
                        handleDiscountChange={handleDiscountChange}
                        invoiceTotal={invoiceTotal}
                        setInvoiceTotal={setInvoiceTotal}
                        subTotal={subTotal}
                        setSubTotal={setSubTotal}
                        advanceDue={advanceDue}
                        setAdvanceDue={setAdvanceDue}
                        isRoundTotal={isRoundTotal}
                        setIsRoundTotal={setIsRoundTotal}
                        payAmount={payAmount}
                        setPayAmount={setPayAmount}
                        handlePayAmountChange={handlePayAmountChange}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        additionalChargesTotal={additionalChargesTotal}
                        setAdditionalChargesTotal={setAdditionalChargesTotal}
                        parentAdditionalChargeItems={additionalChargeItems}
                        setParentAdditionalChargeItems={
                            setAdditionalChargeItems
                        }
                        errors={errors}
                        setErrors={setErrors}
                        discountValue={discountValue}
                        note={note}
                        setNote={setNote}
                        handleMultiplePayment={handleMultiplePayment}
                        multiplePaymentModal={multiplePaymentModal}
                        setMultiplePaymentModal={setMultiplePaymentModal}
                        invoiceWithMultiplePayment={invoiceWithMultiplePayment}
                        paymentRows={paymentRows}
                        setPaymentRows={setPaymentRows}
                    />
                </div>
            </div>
        </MainLayouts>
    );
};

export default Sale;
