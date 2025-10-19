import { Head, router, usePage } from "@inertiajs/react";
import MainLayouts from "../../layouts/MainLayouts";
import { useEffect, useMemo, useState, useRef } from "react";
import SearchBarSection from "../../section/pos/SearchBarSection";
import BarcodeScanner from "../../section/pos/BarcodeScanner";
import CategorySlider from "../../section/pos/CategorySlider";
import ProductList from "../../section/pos/ProductList";
import Cart from "../../section/pos/Cart";
import useInput from "../../hook/useInput";
import CustomerSection from "../../section/pos/CustomerSection";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import DigitalClock from "../../components/DigitalClock";
import axios from "axios";
import Loader from "../../components/Loader";
import useSaleValidation from "../../hook/useSaleValidation";
import useSubmitSale from "../../hook/useSubmitSale";
import NoteModal from "../../components/NoteModal";
import { Icon } from "@iconify/react";

const PosPage = () => {
    const { props } = usePage();
    const {
        categories,
        products,
        customers,
        banks,
        taxes,
        setting,
        additionalChargeNames,
        promotionDetails,
    } = props;
    // console.log(products);
    // console.log(promotionDetails);
    // const [checkPromotion, setCheckPromotion] = useState({
    //     promotion_type: "",
    //     isDiscount: false,
    // });
    const [selectedCategory, setSelectedCategory] = useState("default");
    const [cartItems, setCartItems] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [tax, setTax] = useState("");
    const [productTotal, setProductTotal] = useState(0);
    const [invoiceTotal, setInvoiceTotal] = useState(0);
    const [additionalChargesTotal, setAdditionalChargesTotal] = useState(0);
    const [additionalChargeItems, setAdditionalChargeItems] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [discountType, setDiscountType] = useState("%");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [invoice, setInvoice] = useState("");
    const [advanceDue, setAdvanceDue] = useState(0);
    const [payAmount, handlePayAmountChange, setPayAmount] = useInput("", {
        min: 0,
        type: "number",
    });
    const [discount, handleDiscountChange, setDiscount] = useInput("", {
        min: 0,
        max: discountType === "%" ? 100 : productTotal,
        type: "number",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [multiplePaymentModal, setMultiplePaymentModal] = useState(false);
    const [paymentRows, setPaymentRows] = useState([
        { id: Date.now(), bankId: "", amount: "" },
    ]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [note, setNote] = useState("");
    const [isRoundTotal, setIsRoundTotal] = useState(false);
    const [isPayFull, setIsPayFull] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    const paymentRef = useRef(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    const { errors, setErrors, validateSale } = useSaleValidation(
        cartItems,
        selectedCustomer,
        invoice,
        selectedPaymentMethod
    );

    // useEffect(() => {
    //     promotionDetails.map((promo) => {
    //         if (promo.promotion_type === "branch") {
    //             setCheckPromotion({
    //                 promotion_type: promo.promotion_type,
    //                 isDiscount: true,
    //             });
    //         }
    //     });
    // }, [promotionDetails]);

    const discountValue = useMemo(() => {
        return discountType === "%"
            ? ((parseFloat(discount) || 0) * productTotal) / 100
            : parseFloat(discount) || 0;
    }, [discount, discountType, productTotal]);

    const submitSale = useSubmitSale();

    const productOptions = useMemo(() => {
        return products.map((product) => ({
            value: product.id,
            label: `${product?.product?.name} - (${product?.color_name?.name}) (${product?.variation_size?.size})`,
            product,
        }));
    }, [products]);

    // Transform customers data to { value, label } structure
    const customerOptions = customers.map((customer) => ({
        value: customer.id,
        label: `${customer?.name} - ${customer?.phone || "N/A"}`,
        customer: customer,
    }));

    // Add product to cart
    const addToCart = (product, quantity = 1) => {
        const existingItem = cartItems.find((item) => item.id === product.id);
        if (existingItem) {
            setCartItems(
                cartItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
        } else {
            setCartItems([...cartItems, { ...product, quantity }]);
        }
    };

    // Remove product from cart
    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    // Update product quantity
    const updateQuantity = (id, quantity) => {
        if (quantity === 0) {
            removeFromCart(id);
        } else {
            setCartItems(
                cartItems.map((item) =>
                    item.id === id ? { ...item, quantity } : item
                )
            );
        }
    };

    // Search filter
    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategory === "default"
                ? product?.product?.category_id === null
                : product?.product?.category_id === selectedCategory;
        return matchesCategory;
    });

    // Add product using barcode
    const handleBarcodeScan = (barcode) => {
        const product = products.find((p) => p?.barcode === barcode);
        if (product) {
            addToCart(product, 1);
        } else {
            toast.error("No Product Found");
        }
    };

    useEffect(() => {
        async function fetchInvoiceNumber() {
            try {
                const response = await axios.get("/generate-sale-invoice");
                setInvoice(response?.data?.invoice);
            } catch (error) {
                toast.error("Error fetching invoice number.");
            }
        }
        fetchInvoiceNumber();
    }, []);

    useEffect(() => {
        const calculatedTotalQuantity = cartItems.reduce((acc, item) => {
            return acc + (parseInt(item.quantity) || 0);
        }, 0);
        setTotalQuantity(calculatedTotalQuantity);
    }, [cartItems]);

    useEffect(() => {
        if (paymentRef.current && errors.selectedPaymentMethod) {
            const rect = paymentRef.current.getBoundingClientRect();
            setPopoverPosition({
                bottom: 0,
                left: 0,
            });
        }
    }, [errors.selectedPaymentMethod]);

    // console.log("payAmount", payAmount);

    const resetForm = () => {
        setCartItems([]);
        setSelectedCustomer(null);
        setSelectedDate(new Date());
        setInvoice("");
        setProductTotal(0);
        setDiscountType("%");
        setTax("");
        setDiscount("");
        setInvoiceTotal(0);
        setAdditionalChargesTotal(0);
        setAdvanceDue(0);
        setIsRoundTotal(false);
        setPayAmount("");
        setSelectedPaymentMethod(null);
        setAdditionalChargeItems([]);
        setTotalQuantity(0);
        setErrors({});
        setNote("");
        setIsPayFull(false);
        setPaymentRows([{ id: Date.now(), bankId: "", amount: "" }]);
    };

    // console.log("invoice", invoice);

    const invoiceData = {
        sale_date: selectedDate,
        invoice_number: invoice,
        affiliator_id: [], // No affiliate in POS
        customer_id: selectedCustomer?.id,
        product_total: productTotal,
        sale_discount_type: discountType,
        actual_discount: discountValue,
        discount: discount,
        tax,
        invoice_total: invoiceTotal,
        additionalChargesTotal,
        grand_total: isRoundTotal
            ? Math.round(invoiceTotal + additionalChargesTotal)
            : invoiceTotal + additionalChargesTotal,
        isRoundTotal,
        paid: payAmount || 0,
        due: advanceDue,
        payment_method: selectedPaymentMethod,
        additionalChargeItems,
        variants: cartItems
            .filter((item) => item.id !== null)
            .map((item) => ({
                variantId: item.id,
                price:
                    setting?.sale_price_type === "b2c_price"
                        ? item.b2c_price
                        : item.b2b_price,
                qty: item.quantity,
                total:
                    (setting?.sale_price_type === "b2c_price"
                        ? item.b2c_price
                        : item.b2b_price) * item.quantity,
                // Add other fields if needed, like color, size, etc.
            })),
        quantity: totalQuantity,
        note: note,
        multiplePaymentMethods: paymentRows,
    };

    // save complete invoice
    const handlePayClick = async () => {
        if (!selectedCustomer) {
            toast.error("Please select a customer.");
            return; // Prevent further execution
        }
        if (cartItems.length === 0) {
            toast.error("Please add at least one Product.");
            return; // Prevent further execution
        }
        if (!selectedPaymentMethod) {
            toast.error("Please Select a Payment Method");
            return; // Prevent further execution
        }

        setIsLoading(true);
        try {
            const data = await submitSale(
                "/sale-store",
                invoiceData,
                "Sale Completed Successfully"
            );

            const saleId = data.saleId;
            const { make_invoice_print, invoice_type } = setting;
            // console.log(make_invoice_print === 1);
            if (make_invoice_print === 1) {
                // console.log(make_invoice_print === 1);
                const printRoute =
                    invoice_type === "a4" || invoice_type === "a5"
                        ? `/sale-invoice/print/${saleId}`
                        : `/sale-invoice/pos-print/${saleId}`;
                router.visit(printRoute, { data: { returnUrl: "/pos-page" } });
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
        if (!selectedCustomer) {
            toast.error("Please select a customer.");
            return; // Prevent further execution
        }
        if (cartItems.length === 0) {
            toast.error("Please add at least one Product.");
            return; // Prevent further execution
        }
        setIsLoading(true);
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

    const handleMultiplePayment = () => {
        if (!selectedCustomer) {
            toast.error("Please select a customer.");
            return; // Prevent further execution
        }
        if (cartItems.length === 0) {
            toast.error("Please add at least one Product.");
            return; // Prevent further execution
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

            // console.log("response data", data);

            const saleId = data.saleId;
            const { make_invoice_print, invoice_type } = setting;
            if (make_invoice_print === 1) {
                const printRoute =
                    invoice_type === "a4" || invoice_type === "a5"
                        ? `/sale-invoice/print/${saleId}`
                        : `/sale-invoice/pos-print/${saleId}`;
                router.visit(printRoute, { data: { returnUrl: "/pos-page" } });
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

    return (
        <>
            {isLoading && <Loader />}
            <MainLayouts
                showHeader={false}
                showFooter={false}
                defaultSidebarState={false}
            >
                <Head title="POS Page" />

                <div className="flex flex-col h-full p-2">
                    {/* Main content: Product list and cart */}
                    <div className="flex flex-col md:flex-row flex-1 gap-4 max-w-full">
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-start mb-3 relative">
                                <DigitalClock />
                                <div className="relative w-48">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date) =>
                                            setSelectedDate(date)
                                        }
                                        maxDate={new Date()}
                                        dateFormat="dd MMM yyyy"
                                        placeholderText="Select a date"
                                        className="w-full py-1 px-3 pl-10 text-sm rounded-md transition-colors duration-200 bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none"
                                        wrapperClassName="w-full"
                                        popperClassName="custom-datepicker-popper z-[40]"
                                        popperPlacement="bottom-start"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    />
                                    <Icon
                                        icon="mdi:calendar"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"
                                    />
                                </div>
                            </div>
                            {/* Top section: Search bar and barcode scanner */}
                            <div className="flex flex-col lg:flex-row gap-2 mb-4">
                                <SearchBarSection
                                    productOptions={productOptions}
                                    addToCart={addToCart}
                                />
                                <BarcodeScanner onScan={handleBarcodeScan} />
                                <CustomerSection
                                    customers={customerOptions}
                                    selectedCustomer={selectedCustomer}
                                    setSelectedCustomer={setSelectedCustomer}
                                    error={errors}
                                    setErrors={setErrors}
                                />
                            </div>
                            {/* Category slider */}
                            <CategorySlider
                                categories={categories}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                            />
                            <ProductList
                                products={filteredProducts}
                                addToCart={addToCart}
                                setting={setting}
                                promotionDetails={promotionDetails}
                            />
                        </div>
                        <div className="w-full md:w-96 flex-shrink-0">
                            <Cart
                                cartItems={cartItems}
                                removeFromCart={removeFromCart}
                                updateQuantity={updateQuantity}
                                tax={tax}
                                setTax={setTax}
                                paymentMethods={banks}
                                selectedPaymentMethod={selectedPaymentMethod}
                                setSelectedPaymentMethod={
                                    setSelectedPaymentMethod
                                }
                                setting={setting}
                                discountType={discountType}
                                setDiscountType={setDiscountType}
                                taxes={taxes}
                                payAmount={payAmount}
                                setPayAmount={setPayAmount}
                                handlePayAmountChange={handlePayAmountChange}
                                additionalChargeNames={additionalChargeNames}
                                handleMultiplePayment={handleMultiplePayment}
                                multiplePaymentModal={multiplePaymentModal}
                                setMultiplePaymentModal={
                                    setMultiplePaymentModal
                                }
                                invoiceWithMultiplePayment={
                                    invoiceWithMultiplePayment
                                }
                                paymentRows={paymentRows}
                                setPaymentRows={setPaymentRows}
                                advanceDue={advanceDue}
                                setAdvanceDue={setAdvanceDue}
                                handlePayClick={handlePayClick}
                                handleDraftClick={handleDraftClick}
                                productTotal={productTotal}
                                setProductTotal={setProductTotal}
                                discount={discount}
                                setDiscount={setDiscount}
                                handleDiscountChange={handleDiscountChange}
                                discountValue={discountValue}
                                invoiceTotal={invoiceTotal}
                                setInvoiceTotal={setInvoiceTotal}
                                additionalChargesTotal={additionalChargesTotal}
                                setAdditionalChargesTotal={
                                    setAdditionalChargesTotal
                                }
                                additionalChargeItems={additionalChargeItems}
                                setAdditionalChargeItems={
                                    setAdditionalChargeItems
                                }
                                errors={errors}
                                setErrors={setErrors}
                                note={note}
                                setNote={setNote}
                                isRoundTotal={isRoundTotal}
                                setIsRoundTotal={setIsRoundTotal}
                                isPayFull={isPayFull}
                                setIsPayFull={setIsPayFull}
                                isNoteModalOpen={isNoteModalOpen}
                                setIsNoteModalOpen={setIsNoteModalOpen}
                                paymentRef={paymentRef}
                                popoverPosition={popoverPosition}
                            />
                        </div>
                    </div>
                </div>
            </MainLayouts>

            {/* Note Modal */}
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                note={note}
                setNote={setNote}
            />
        </>
    );
};

export default PosPage;
